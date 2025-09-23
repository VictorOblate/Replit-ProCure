import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['GENERAL_USER', 'HOD', 'PROCUREMENT_MANAGER', 'FINANCE_OFFICER']);
export const statusEnum = pgEnum('status', ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']);
export const requestTypeEnum = pgEnum('request_type', ['BORROW', 'PURCHASE']);
export const vendorStatusEnum = pgEnum('vendor_status', ['ACTIVE', 'INACTIVE', 'PENDING']);
export const stockStatusEnum = pgEnum('stock_status', ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']);

// Departments table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  hodId: varchar("hod_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: roleEnum("role").notNull().default('GENERAL_USER'),
  departmentId: varchar("department_id").references(() => departments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  registrationNumber: text("registration_number"),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  status: vendorStatusEnum("status").notNull().default('PENDING'),
  categories: text("categories").array(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Items table
export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id),
  unit: text("unit").notNull(), // e.g., pieces, liters, kg
  minReorderLevel: integer("min_reorder_level").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stock table (per department inventory)
export const stock = pgTable("stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => items.id),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  quantityAvailable: integer("quantity_available").notNull().default(0),
  quantityReserved: integer("quantity_reserved").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Borrow requests table
export const borrowRequests = pgTable("borrow_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  requesterDepartmentId: varchar("requester_department_id").notNull().references(() => departments.id),
  itemId: varchar("item_id").notNull().references(() => items.id),
  owningDepartmentId: varchar("owning_department_id").notNull().references(() => departments.id),
  quantityRequested: integer("quantity_requested").notNull(),
  justification: text("justification").notNull(),
  requiredDate: timestamp("required_date").notNull(),
  status: statusEnum("status").notNull().default('PENDING'),
  requesterHodApproval: statusEnum("requester_hod_approval").default('PENDING'),
  ownerHodApproval: statusEnum("owner_hod_approval").default('PENDING'),
  approvedBy: varchar("approved_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Purchase requisitions table
export const purchaseRequisitions = pgTable("purchase_requisitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  itemName: text("item_name").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  justification: text("justification").notNull(),
  requiredDate: timestamp("required_date").notNull(),
  status: statusEnum("status").notNull().default('PENDING'),
  hodApproval: statusEnum("hod_approval").default('PENDING'),
  procurementApproval: statusEnum("procurement_approval").default('PENDING'),
  financeApproval: statusEnum("finance_approval").default('PENDING'),
  approvedBy: varchar("approved_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Purchase orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requisitionId: varchar("requisition_id").notNull().references(() => purchaseRequisitions.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: statusEnum("status").notNull().default('PENDING'),
  expectedDelivery: timestamp("expected_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quotations table
export const quotations = pgTable("quotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requisitionId: varchar("requisition_id").notNull().references(() => purchaseRequisitions.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  deliveryTimeline: text("delivery_timeline"),
  validUntil: timestamp("valid_until"),
  isSelected: boolean("is_selected").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  oldValues: text("old_values"), // JSON string
  newValues: text("new_values"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stock movements table (for tracking usage history)
export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stockId: varchar("stock_id").notNull().references(() => stock.id),
  movementType: text("movement_type").notNull(), // 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  referenceId: varchar("reference_id"), // Could reference borrow request, purchase order, etc.
  performedBy: varchar("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  borrowRequests: many(borrowRequests),
  purchaseRequisitions: many(purchaseRequisitions),
  auditLogs: many(auditLogs),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  hod: one(users, {
    fields: [departments.hodId],
    references: [users.id],
  }),
  users: many(users),
  stock: many(stock),
  borrowRequests: many(borrowRequests),
  purchaseRequisitions: many(purchaseRequisitions),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  stock: many(stock),
  borrowRequests: many(borrowRequests),
}));

export const stockRelations = relations(stock, ({ one, many }) => ({
  item: one(items, {
    fields: [stock.itemId],
    references: [items.id],
  }),
  department: one(departments, {
    fields: [stock.departmentId],
    references: [departments.id],
  }),
  movements: many(stockMovements),
}));

export const borrowRequestsRelations = relations(borrowRequests, ({ one }) => ({
  requester: one(users, {
    fields: [borrowRequests.requesterId],
    references: [users.id],
  }),
  requesterDepartment: one(departments, {
    fields: [borrowRequests.requesterDepartmentId],
    references: [departments.id],
  }),
  item: one(items, {
    fields: [borrowRequests.itemId],
    references: [items.id],
  }),
  owningDepartment: one(departments, {
    fields: [borrowRequests.owningDepartmentId],
    references: [departments.id],
  }),
}));

export const purchaseRequisitionsRelations = relations(purchaseRequisitions, ({ one, many }) => ({
  requester: one(users, {
    fields: [purchaseRequisitions.requesterId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [purchaseRequisitions.departmentId],
    references: [departments.id],
  }),
  quotations: many(quotations),
  purchaseOrders: many(purchaseOrders),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  quotations: many(quotations),
  purchaseOrders: many(purchaseOrders),
}));

export const quotationsRelations = relations(quotations, ({ one }) => ({
  requisition: one(purchaseRequisitions, {
    fields: [quotations.requisitionId],
    references: [purchaseRequisitions.id],
  }),
  vendor: one(vendors, {
    fields: [quotations.vendorId],
    references: [vendors.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  requisition: one(purchaseRequisitions, {
    fields: [purchaseOrders.requisitionId],
    references: [purchaseRequisitions.id],
  }),
  vendor: one(vendors, {
    fields: [purchaseOrders.vendorId],
    references: [vendors.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  stock: one(stock, {
    fields: [stockMovements.stockId],
    references: [stock.id],
  }),
  performedBy: one(users, {
    fields: [stockMovements.performedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockSchema = createInsertSchema(stock).omit({
  id: true,
  lastUpdated: true,
});

export const insertBorrowRequestSchema = createInsertSchema(borrowRequests).omit({
  id: true,
  status: true,
  requesterHodApproval: true,
  ownerHodApproval: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseRequisitionSchema = createInsertSchema(purchaseRequisitions).omit({
  id: true,
  status: true,
  hodApproval: true,
  procurementApproval: true,
  financeApproval: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  status: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  isSelected: true,
  createdAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  status: true,
  actualDelivery: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Category = typeof categories.$inferSelect;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Stock = typeof stock.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type BorrowRequest = typeof borrowRequests.$inferSelect;
export type InsertBorrowRequest = z.infer<typeof insertBorrowRequestSchema>;
export type PurchaseRequisition = typeof purchaseRequisitions.$inferSelect;
export type InsertPurchaseRequisition = z.infer<typeof insertPurchaseRequisitionSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
