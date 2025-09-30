import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, datetime, decimal, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

// Enums
export const roleEnum = mysqlEnum('role', ['GENERAL_USER', 'HOD', 'PROCUREMENT_MANAGER', 'FINANCE_OFFICER']);
export const statusEnum = mysqlEnum('status', ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']);
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
  role: roleEnum.notNull().default('GENERAL_USER'),
  departmentId: varchar("department_id", { length: 36 }),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
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
  status: statusEnum.notNull().default('PENDING'),
  requesterHodApproval: statusEnum.default('PENDING'),
  ownerHodApproval: statusEnum.default('PENDING'),
  approvedBy: varchar("approved_by", { length: 36 }),
  rejectionReason: text("rejection_reason"),
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

// Items table
export const items = mysqlTable("items", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: varchar("category_id", { length: 36 }),
  unit: text("unit").notNull(),
  minReorderLevel: int("min_reorder_level").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Stock table
export const stock = mysqlTable("stock", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  itemId: varchar("item_id", { length: 36 }).notNull(),
  departmentId: varchar("department_id", { length: 36 }).notNull(),
  quantityAvailable: int("quantity_available").notNull().default(0),
  quantityReserved: int("quantity_reserved").notNull().default(0),
  lastUpdated: datetime("last_updated").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});