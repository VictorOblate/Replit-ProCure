import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, datetime, decimal, boolean, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = mysqlEnum('role', ['GENERAL_USER', 'HOD', 'PROCUREMENT_MANAGER', 'FINANCE_OFFICER']);
// Base status enum for reference
export const statusEnum = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as const;

// Specific status enums for different tables
export const borrowStatusEnum = mysqlEnum('borrow_status', statusEnum);
export const requisitionStatusEnum = mysqlEnum('requisition_status', statusEnum);
export const purchaseOrderStatusEnum = mysqlEnum('purchase_order_status', statusEnum);
export const requestTypeEnum = mysqlEnum('request_type', ['BORROW', 'PURCHASE']);
export const vendorStatusEnum = mysqlEnum('vendor_status', ['ACTIVE', 'INACTIVE', 'PENDING']);
export const stockStatusEnum = mysqlEnum('stock_status', ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']);

// Departments table
export const departments = mysqlTable("departments", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: text("name").notNull().unique(),
  hodId: varchar("hod_id", { length: 36 }),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: mysqlEnum("role", ['GENERAL_USER', 'HOD', 'PROCUREMENT_MANAGER', 'FINANCE_OFFICER']).notNull().default('GENERAL_USER'),
  departmentId: varchar("department_id", { length: 36 }),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Categories table
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Vendors table
export const vendors = mysqlTable("vendors", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number"),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  status: mysqlEnum("vendor_status", ['ACTIVE', 'INACTIVE', 'PENDING']).notNull().default('PENDING'),
  categories: text("categories"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Items table
export const items = mysqlTable("items", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: varchar("category_id", { length: 36 }),
  unit: text("unit").notNull(), // e.g., pieces, liters, kg
  minReorderLevel: int("min_reorder_level").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Stock table (per department inventory)
export const stock = mysqlTable("stock", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  itemId: varchar("item_id", { length: 36 }).notNull(),
  departmentId: varchar("department_id", { length: 36 }).notNull(),
  quantityAvailable: int("quantity_available").notNull().default(0),
  quantityReserved: int("quantity_reserved").notNull().default(0),
  lastUpdated: datetime("last_updated").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Borrow requests table
export const borrowRequests = mysqlTable("borrow_requests", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  requesterId: varchar("requester_id", { length: 36 }).notNull(),
  requesterDepartmentId: varchar("requester_department_id", { length: 36 }).notNull(),
  itemId: varchar("item_id", { length: 36 }).notNull(),
  owningDepartmentId: varchar("owning_department_id", { length: 36 }).notNull(),
  quantityRequested: int("quantity_requested").notNull(),
  justification: text("justification").notNull(),
  requiredDate: datetime("required_date").notNull(),
  status: mysqlEnum("status", ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).notNull().default('PENDING'),
  requesterHodApproval: mysqlEnum("requester_hod_approval", ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).notNull().default('PENDING'),
  ownerHodApproval: mysqlEnum("owner_hod_approval", ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).notNull().default('PENDING'),
  approvedBy: varchar("approved_by", { length: 36 }),
  rejectionReason: text("rejection_reason"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Purchase requisitions table
export const purchaseRequisitions = mysqlTable("purchase_requisitions", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  requesterId: varchar("requester_id", { length: 36 }).notNull(),
  departmentId: varchar("department_id", { length: 36 }).notNull(),
  itemName: text("item_name").notNull(),
  description: text("description").notNull(),
  quantity: int("quantity").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  justification: text("justification").notNull(),
  requiredDate: datetime("required_date").notNull(),
  status: mysqlEnum("status", ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).notNull().default('PENDING'),
  hodApproval: mysqlEnum("hod_approval", ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).default('PENDING'),
  procurementApproval: mysqlEnum("procurement_approval", ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).default('PENDING'),
  financeApproval: mysqlEnum("finance_approval", ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).default('PENDING'),
  approvedBy: varchar("approved_by", { length: 36 }),
  rejectionReason: text("rejection_reason"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Purchase orders table
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  requisitionId: varchar("requisition_id", { length: 36 }).notNull(),
  vendorId: varchar("vendor_id", { length: 36 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).notNull().default('PENDING'),
  expectedDelivery: datetime("expected_delivery"),
  actualDelivery: datetime("actual_delivery"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Quotations table
export const quotations = mysqlTable("quotations", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  requisitionId: varchar("requisition_id", { length: 36 }).notNull(),
  vendorId: varchar("vendor_id", { length: 36 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  deliveryTimeline: text("delivery_timeline"),
  validUntil: datetime("valid_until"),
  isSelected: boolean("is_selected").default(false),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Audit logs table
export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 36 }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id", { length: 36 }),
  oldValues: text("old_values"), // JSON string
  newValues: text("new_values"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Stock movements table (for tracking usage history)
export const stockMovements = mysqlTable("stock_movements", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  stockId: varchar("stock_id", { length: 36 }).notNull(),
  movementType: text("movement_type").notNull(),
  quantity: int("quantity").notNull(),
  reason: text("reason").notNull(),
  referenceId: varchar("reference_id", { length: 36 }),
  performedBy: varchar("performed_by", { length: 36 }),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
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

export const insertBorrowRequestSchema = z.object({
  itemId: z.string().min(1),
  owningDepartmentId: z.string().min(1),
  quantityRequested: z.number().min(1),
  justification: z.string().min(1),
  requiredDate: z.date().transform((date) => new Date(date.toISOString().split('T')[0])), // Format as YYYY-MM-DD
});

export const insertPurchaseRequisitionSchema = z.object({
  itemName: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().min(1),
  estimatedCost: z.string().min(1),
  justification: z.string().min(1),
  requiredDate: z.date().transform((date) => new Date(date.toISOString().split('T')[0])), // Format as YYYY-MM-DD
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
