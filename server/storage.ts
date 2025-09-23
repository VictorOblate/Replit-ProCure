import { 
  users, departments, categories, items, stock, borrowRequests, purchaseRequisitions,
  vendors, quotations, purchaseOrders, auditLogs, stockMovements,
  type User, type InsertUser, type Department, type InsertDepartment, 
  type Category, type Item, type InsertItem, type Stock, type InsertStock,
  type BorrowRequest, type InsertBorrowRequest, type PurchaseRequisition, 
  type InsertPurchaseRequisition, type Vendor, type InsertVendor,
  type Quotation, type InsertQuotation, type PurchaseOrder,
  type AuditLog, type StockMovement, type InsertStockMovement
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, ilike, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Store } from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Department management
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined>;

  // Category management
  getCategories(): Promise<Category[]>;
  createCategory(category: { name: string; description?: string }): Promise<Category>;

  // Item management
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  getItemByCode(code: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, updates: Partial<Item>): Promise<Item | undefined>;
  searchItems(query: string): Promise<Item[]>;

  // Stock management
  getStock(): Promise<any[]>;
  getStockByDepartment(departmentId: string): Promise<any[]>;
  getStockByItem(itemId: string): Promise<any[]>;
  getStockByItemAndDepartment(itemId: string, departmentId: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: string, updates: Partial<Stock>): Promise<Stock | undefined>;
  getLowStockItems(): Promise<any[]>;

  // Borrow request management
  getBorrowRequests(): Promise<any[]>;
  getBorrowRequest(id: string): Promise<any>;
  getBorrowRequestsByRequester(requesterId: string): Promise<any[]>;
  getBorrowRequestsByDepartment(departmentId: string): Promise<any[]>;
  getPendingBorrowRequests(): Promise<any[]>;
  createBorrowRequest(request: InsertBorrowRequest): Promise<BorrowRequest>;
  updateBorrowRequest(id: string, updates: Partial<BorrowRequest>): Promise<BorrowRequest | undefined>;

  // Purchase requisition management
  getPurchaseRequisitions(): Promise<any[]>;
  getPurchaseRequisition(id: string): Promise<any>;
  getPurchaseRequisitionsByRequester(requesterId: string): Promise<any[]>;
  getPurchaseRequisitionsByDepartment(departmentId: string): Promise<any[]>;
  getPendingPurchaseRequisitions(): Promise<any[]>;
  createPurchaseRequisition(requisition: InsertPurchaseRequisition): Promise<PurchaseRequisition>;
  updatePurchaseRequisition(id: string, updates: Partial<PurchaseRequisition>): Promise<PurchaseRequisition | undefined>;

  // Vendor management
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  getActiveVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | undefined>;

  // Quotation management
  getQuotations(): Promise<any[]>;
  getQuotationsByRequisition(requisitionId: string): Promise<any[]>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation | undefined>;

  // Purchase order management
  getPurchaseOrders(): Promise<any[]>;
  getPurchaseOrder(id: string): Promise<any>;
  createPurchaseOrder(order: { requisitionId: string; vendorId: string; totalAmount: string; expectedDelivery?: Date }): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined>;

  // Stock movement management
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  getStockMovements(stockId?: string): Promise<any[]>;

  // Audit logging
  createAuditLog(log: { 
    userId?: string; 
    action: string; 
    entityType: string; 
    entityId?: string; 
    oldValues?: string; 
    newValues?: string; 
    ipAddress?: string; 
    userAgent?: string; 
  }): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;

  // Dashboard analytics
  getDashboardStats(): Promise<{
    totalStockValue: number;
    pendingRequests: number;
    lowStockItems: number;
    activeVendors: number;
  }>;
  getRecentActivities(limit?: number): Promise<any[]>;

  // Session store
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Department management
  async getDepartments(): Promise<Department[]> {
    const result = await db.select().from(departments).orderBy(asc(departments.name));
    return result as Department[];
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDept] = await db.insert(departments).values(department).returning();
    return newDept as Department;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const [department] = await db.update(departments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return (department as Department) || undefined;
  }

  // Category management
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: { name: string; description?: string }): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Item management
  async getItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(asc(items.name));
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async getItemByCode(code: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.code, code));
    return item || undefined;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item | undefined> {
    const [item] = await db.update(items)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return item || undefined;
  }

  async searchItems(query: string): Promise<Item[]> {
    return await db.select().from(items)
      .where(or(
        ilike(items.name, `%${query}%`),
        ilike(items.description, `%${query}%`),
        ilike(items.code, `%${query}%`)
      ));
  }

  // Stock management
  async getStock(): Promise<any[]> {
    return await db.select({
      id: stock.id,
      itemId: stock.itemId,
      itemCode: items.code,
      itemName: items.name,
      departmentId: stock.departmentId,
      departmentName: departments.name,
      quantityAvailable: stock.quantityAvailable,
      quantityReserved: stock.quantityReserved,
      unit: items.unit,
      minReorderLevel: items.minReorderLevel,
      lastUpdated: stock.lastUpdated
    })
    .from(stock)
    .innerJoin(items, eq(stock.itemId, items.id))
    .innerJoin(departments, eq(stock.departmentId, departments.id))
    .orderBy(asc(items.name));
  }

  async getStockByDepartment(departmentId: string): Promise<any[]> {
    return await db.select({
      id: stock.id,
      itemId: stock.itemId,
      itemCode: items.code,
      itemName: items.name,
      departmentId: stock.departmentId,
      departmentName: departments.name,
      quantityAvailable: stock.quantityAvailable,
      quantityReserved: stock.quantityReserved,
      unit: items.unit,
      minReorderLevel: items.minReorderLevel,
      lastUpdated: stock.lastUpdated
    })
    .from(stock)
    .innerJoin(items, eq(stock.itemId, items.id))
    .innerJoin(departments, eq(stock.departmentId, departments.id))
    .where(eq(stock.departmentId, departmentId))
    .orderBy(asc(items.name));
  }

  async getStockByItem(itemId: string): Promise<any[]> {
    return await db.select({
      id: stock.id,
      itemId: stock.itemId,
      itemCode: items.code,
      itemName: items.name,
      departmentId: stock.departmentId,
      departmentName: departments.name,
      quantityAvailable: stock.quantityAvailable,
      quantityReserved: stock.quantityReserved,
      unit: items.unit,
      minReorderLevel: items.minReorderLevel,
      lastUpdated: stock.lastUpdated
    })
    .from(stock)
    .innerJoin(items, eq(stock.itemId, items.id))
    .innerJoin(departments, eq(stock.departmentId, departments.id))
    .where(eq(stock.itemId, itemId))
    .orderBy(asc(departments.name));
  }

  async getStockByItemAndDepartment(itemId: string, departmentId: string): Promise<Stock | undefined> {
    const [stockItem] = await db.select().from(stock)
      .where(and(eq(stock.itemId, itemId), eq(stock.departmentId, departmentId)));
    return stockItem || undefined;
  }

  async createStock(stockData: InsertStock): Promise<Stock> {
    const [newStock] = await db.insert(stock).values(stockData).returning();
    return newStock;
  }

  async updateStock(id: string, updates: Partial<Stock>): Promise<Stock | undefined> {
    const [updatedStock] = await db.update(stock)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(stock.id, id))
      .returning();
    return updatedStock || undefined;
  }

  async getLowStockItems(): Promise<any[]> {
    return await db.select({
      id: stock.id,
      itemId: stock.itemId,
      itemCode: items.code,
      itemName: items.name,
      departmentId: stock.departmentId,
      departmentName: departments.name,
      quantityAvailable: stock.quantityAvailable,
      quantityReserved: stock.quantityReserved,
      unit: items.unit,
      minReorderLevel: items.minReorderLevel,
      lastUpdated: stock.lastUpdated
    })
    .from(stock)
    .innerJoin(items, eq(stock.itemId, items.id))
    .innerJoin(departments, eq(stock.departmentId, departments.id))
    .where(sql`${stock.quantityAvailable} <= ${items.minReorderLevel}`)
    .orderBy(asc(items.name));
  }

  // Borrow request management
  async getBorrowRequests(): Promise<any[]> {
    return await db.select({
      id: borrowRequests.id,
      requester: users.fullName,
      requesterDepartment: sql`req_dept.name`.as('requesterDepartmentName'),
      item: items.name,
      owningDepartment: sql`own_dept.name`.as('owningDepartmentName'),
      quantityRequested: borrowRequests.quantityRequested,
      justification: borrowRequests.justification,
      requiredDate: borrowRequests.requiredDate,
      status: borrowRequests.status,
      requesterHodApproval: borrowRequests.requesterHodApproval,
      ownerHodApproval: borrowRequests.ownerHodApproval,
      createdAt: borrowRequests.createdAt
    })
    .from(borrowRequests)
    .innerJoin(users, eq(borrowRequests.requesterId, users.id))
    .innerJoin(departments.as('req_dept'), eq(borrowRequests.requesterDepartmentId, sql`req_dept.id`))
    .innerJoin(departments.as('own_dept'), eq(borrowRequests.owningDepartmentId, sql`own_dept.id`))
    .innerJoin(items, eq(borrowRequests.itemId, items.id))
    .orderBy(desc(borrowRequests.createdAt));
  }

  async getBorrowRequest(id: string): Promise<any> {
    const [request] = await db.select({
      id: borrowRequests.id,
      requesterId: borrowRequests.requesterId,
      requester: users.fullName,
      requesterDepartmentId: borrowRequests.requesterDepartmentId,
      requesterDepartment: sql`req_dept.name`.as('requesterDepartmentName'),
      itemId: borrowRequests.itemId,
      item: items.name,
      owningDepartmentId: borrowRequests.owningDepartmentId,
      owningDepartment: sql`own_dept.name`.as('owningDepartmentName'),
      quantityRequested: borrowRequests.quantityRequested,
      justification: borrowRequests.justification,
      requiredDate: borrowRequests.requiredDate,
      status: borrowRequests.status,
      requesterHodApproval: borrowRequests.requesterHodApproval,
      ownerHodApproval: borrowRequests.ownerHodApproval,
      approvedBy: borrowRequests.approvedBy,
      rejectionReason: borrowRequests.rejectionReason,
      createdAt: borrowRequests.createdAt,
      updatedAt: borrowRequests.updatedAt
    })
    .from(borrowRequests)
    .innerJoin(users, eq(borrowRequests.requesterId, users.id))
    .innerJoin(departments.as('req_dept'), eq(borrowRequests.requesterDepartmentId, sql`req_dept.id`))
    .innerJoin(departments.as('own_dept'), eq(borrowRequests.owningDepartmentId, sql`own_dept.id`))
    .innerJoin(items, eq(borrowRequests.itemId, items.id))
    .where(eq(borrowRequests.id, id));
    
    return request || undefined;
  }

  async getBorrowRequestsByRequester(requesterId: string): Promise<any[]> {
    return await db.select({
      id: borrowRequests.id,
      requester: users.fullName,
      requesterDepartment: sql`req_dept.name`.as('requesterDepartmentName'),
      item: items.name,
      owningDepartment: sql`own_dept.name`.as('owningDepartmentName'),
      quantityRequested: borrowRequests.quantityRequested,
      justification: borrowRequests.justification,
      requiredDate: borrowRequests.requiredDate,
      status: borrowRequests.status,
      requesterHodApproval: borrowRequests.requesterHodApproval,
      ownerHodApproval: borrowRequests.ownerHodApproval,
      createdAt: borrowRequests.createdAt
    })
    .from(borrowRequests)
    .innerJoin(users, eq(borrowRequests.requesterId, users.id))
    .innerJoin(departments.as('req_dept'), eq(borrowRequests.requesterDepartmentId, sql`req_dept.id`))
    .innerJoin(departments.as('own_dept'), eq(borrowRequests.owningDepartmentId, sql`own_dept.id`))
    .innerJoin(items, eq(borrowRequests.itemId, items.id))
    .where(eq(borrowRequests.requesterId, requesterId))
    .orderBy(desc(borrowRequests.createdAt));
  }

  async getBorrowRequestsByDepartment(departmentId: string): Promise<any[]> {
    return await db.select({
      id: borrowRequests.id,
      requester: users.fullName,
      requesterDepartment: sql`req_dept.name`.as('requesterDepartmentName'),
      item: items.name,
      owningDepartment: sql`own_dept.name`.as('owningDepartmentName'),
      quantityRequested: borrowRequests.quantityRequested,
      justification: borrowRequests.justification,
      requiredDate: borrowRequests.requiredDate,
      status: borrowRequests.status,
      requesterHodApproval: borrowRequests.requesterHodApproval,
      ownerHodApproval: borrowRequests.ownerHodApproval,
      createdAt: borrowRequests.createdAt
    })
    .from(borrowRequests)
    .innerJoin(users, eq(borrowRequests.requesterId, users.id))
    .innerJoin(departments.as('req_dept'), eq(borrowRequests.requesterDepartmentId, sql`req_dept.id`))
    .innerJoin(departments.as('own_dept'), eq(borrowRequests.owningDepartmentId, sql`own_dept.id`))
    .innerJoin(items, eq(borrowRequests.itemId, items.id))
    .where(or(
      eq(borrowRequests.requesterDepartmentId, departmentId),
      eq(borrowRequests.owningDepartmentId, departmentId)
    ))
    .orderBy(desc(borrowRequests.createdAt));
  }

  async getPendingBorrowRequests(): Promise<any[]> {
    return await db.select({
      id: borrowRequests.id,
      requester: users.fullName,
      requesterDepartment: sql`req_dept.name`.as('requesterDepartmentName'),
      item: items.name,
      owningDepartment: sql`own_dept.name`.as('owningDepartmentName'),
      quantityRequested: borrowRequests.quantityRequested,
      justification: borrowRequests.justification,
      requiredDate: borrowRequests.requiredDate,
      status: borrowRequests.status,
      requesterHodApproval: borrowRequests.requesterHodApproval,
      ownerHodApproval: borrowRequests.ownerHodApproval,
      createdAt: borrowRequests.createdAt
    })
    .from(borrowRequests)
    .innerJoin(users, eq(borrowRequests.requesterId, users.id))
    .innerJoin(departments.as('req_dept'), eq(borrowRequests.requesterDepartmentId, sql`req_dept.id`))
    .innerJoin(departments.as('own_dept'), eq(borrowRequests.owningDepartmentId, sql`own_dept.id`))
    .innerJoin(items, eq(borrowRequests.itemId, items.id))
    .where(eq(borrowRequests.status, 'PENDING'))
    .orderBy(desc(borrowRequests.createdAt));
  }

  async createBorrowRequest(request: InsertBorrowRequest): Promise<BorrowRequest> {
    const [newRequest] = await db.insert(borrowRequests).values(request).returning();
    return newRequest;
  }

  async updateBorrowRequest(id: string, updates: Partial<BorrowRequest>): Promise<BorrowRequest | undefined> {
    const [request] = await db.update(borrowRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(borrowRequests.id, id))
      .returning();
    return request || undefined;
  }

  // Purchase requisition management
  async getPurchaseRequisitions(): Promise<any[]> {
    return await db.select({
      id: purchaseRequisitions.id,
      requester: users.fullName,
      department: departments.name,
      itemName: purchaseRequisitions.itemName,
      description: purchaseRequisitions.description,
      quantity: purchaseRequisitions.quantity,
      estimatedCost: purchaseRequisitions.estimatedCost,
      justification: purchaseRequisitions.justification,
      requiredDate: purchaseRequisitions.requiredDate,
      status: purchaseRequisitions.status,
      hodApproval: purchaseRequisitions.hodApproval,
      procurementApproval: purchaseRequisitions.procurementApproval,
      financeApproval: purchaseRequisitions.financeApproval,
      createdAt: purchaseRequisitions.createdAt
    })
    .from(purchaseRequisitions)
    .innerJoin(users, eq(purchaseRequisitions.requesterId, users.id))
    .innerJoin(departments, eq(purchaseRequisitions.departmentId, departments.id))
    .orderBy(desc(purchaseRequisitions.createdAt));
  }

  async getPurchaseRequisition(id: string): Promise<any> {
    const [requisition] = await db.select({
      id: purchaseRequisitions.id,
      requesterId: purchaseRequisitions.requesterId,
      requester: users.fullName,
      departmentId: purchaseRequisitions.departmentId,
      department: departments.name,
      itemName: purchaseRequisitions.itemName,
      description: purchaseRequisitions.description,
      quantity: purchaseRequisitions.quantity,
      estimatedCost: purchaseRequisitions.estimatedCost,
      justification: purchaseRequisitions.justification,
      requiredDate: purchaseRequisitions.requiredDate,
      status: purchaseRequisitions.status,
      hodApproval: purchaseRequisitions.hodApproval,
      procurementApproval: purchaseRequisitions.procurementApproval,
      financeApproval: purchaseRequisitions.financeApproval,
      approvedBy: purchaseRequisitions.approvedBy,
      rejectionReason: purchaseRequisitions.rejectionReason,
      createdAt: purchaseRequisitions.createdAt,
      updatedAt: purchaseRequisitions.updatedAt
    })
    .from(purchaseRequisitions)
    .innerJoin(users, eq(purchaseRequisitions.requesterId, users.id))
    .innerJoin(departments, eq(purchaseRequisitions.departmentId, departments.id))
    .where(eq(purchaseRequisitions.id, id));
    
    return requisition || undefined;
  }

  async getPurchaseRequisitionsByRequester(requesterId: string): Promise<any[]> {
    return await db.select({
      id: purchaseRequisitions.id,
      requester: users.fullName,
      department: departments.name,
      itemName: purchaseRequisitions.itemName,
      description: purchaseRequisitions.description,
      quantity: purchaseRequisitions.quantity,
      estimatedCost: purchaseRequisitions.estimatedCost,
      justification: purchaseRequisitions.justification,
      requiredDate: purchaseRequisitions.requiredDate,
      status: purchaseRequisitions.status,
      hodApproval: purchaseRequisitions.hodApproval,
      procurementApproval: purchaseRequisitions.procurementApproval,
      financeApproval: purchaseRequisitions.financeApproval,
      createdAt: purchaseRequisitions.createdAt
    })
    .from(purchaseRequisitions)
    .innerJoin(users, eq(purchaseRequisitions.requesterId, users.id))
    .innerJoin(departments, eq(purchaseRequisitions.departmentId, departments.id))
    .where(eq(purchaseRequisitions.requesterId, requesterId))
    .orderBy(desc(purchaseRequisitions.createdAt));
  }

  async getPurchaseRequisitionsByDepartment(departmentId: string): Promise<any[]> {
    return await db.select({
      id: purchaseRequisitions.id,
      requester: users.fullName,
      department: departments.name,
      itemName: purchaseRequisitions.itemName,
      description: purchaseRequisitions.description,
      quantity: purchaseRequisitions.quantity,
      estimatedCost: purchaseRequisitions.estimatedCost,
      justification: purchaseRequisitions.justification,
      requiredDate: purchaseRequisitions.requiredDate,
      status: purchaseRequisitions.status,
      hodApproval: purchaseRequisitions.hodApproval,
      procurementApproval: purchaseRequisitions.procurementApproval,
      financeApproval: purchaseRequisitions.financeApproval,
      createdAt: purchaseRequisitions.createdAt
    })
    .from(purchaseRequisitions)
    .innerJoin(users, eq(purchaseRequisitions.requesterId, users.id))
    .innerJoin(departments, eq(purchaseRequisitions.departmentId, departments.id))
    .where(eq(purchaseRequisitions.departmentId, departmentId))
    .orderBy(desc(purchaseRequisitions.createdAt));
  }

  async getPendingPurchaseRequisitions(): Promise<any[]> {
    return await db.select({
      id: purchaseRequisitions.id,
      requester: users.fullName,
      department: departments.name,
      itemName: purchaseRequisitions.itemName,
      description: purchaseRequisitions.description,
      quantity: purchaseRequisitions.quantity,
      estimatedCost: purchaseRequisitions.estimatedCost,
      justification: purchaseRequisitions.justification,
      requiredDate: purchaseRequisitions.requiredDate,
      status: purchaseRequisitions.status,
      hodApproval: purchaseRequisitions.hodApproval,
      procurementApproval: purchaseRequisitions.procurementApproval,
      financeApproval: purchaseRequisitions.financeApproval,
      createdAt: purchaseRequisitions.createdAt
    })
    .from(purchaseRequisitions)
    .innerJoin(users, eq(purchaseRequisitions.requesterId, users.id))
    .innerJoin(departments, eq(purchaseRequisitions.departmentId, departments.id))
    .where(eq(purchaseRequisitions.status, 'PENDING'))
    .orderBy(desc(purchaseRequisitions.createdAt));
  }

  async createPurchaseRequisition(requisition: InsertPurchaseRequisition): Promise<PurchaseRequisition> {
    const [newRequisition] = await db.insert(purchaseRequisitions).values(requisition).returning();
    return newRequisition;
  }

  async updatePurchaseRequisition(id: string, updates: Partial<PurchaseRequisition>): Promise<PurchaseRequisition | undefined> {
    const [requisition] = await db.update(purchaseRequisitions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(purchaseRequisitions.id, id))
      .returning();
    return requisition || undefined;
  }

  // Vendor management
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).orderBy(asc(vendors.name));
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getActiveVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors)
      .where(eq(vendors.status, 'ACTIVE'))
      .orderBy(asc(vendors.name));
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | undefined> {
    const [vendor] = await db.update(vendors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  // Quotation management
  async getQuotations(): Promise<any[]> {
    return await db.select({
      id: quotations.id,
      requisitionId: quotations.requisitionId,
      vendor: vendors.name,
      unitPrice: quotations.unitPrice,
      totalPrice: quotations.totalPrice,
      deliveryTimeline: quotations.deliveryTimeline,
      validUntil: quotations.validUntil,
      isSelected: quotations.isSelected,
      createdAt: quotations.createdAt
    })
    .from(quotations)
    .innerJoin(vendors, eq(quotations.vendorId, vendors.id))
    .orderBy(desc(quotations.createdAt));
  }

  async getQuotationsByRequisition(requisitionId: string): Promise<any[]> {
    return await db.select({
      id: quotations.id,
      requisitionId: quotations.requisitionId,
      vendorId: quotations.vendorId,
      vendor: vendors.name,
      unitPrice: quotations.unitPrice,
      totalPrice: quotations.totalPrice,
      deliveryTimeline: quotations.deliveryTimeline,
      validUntil: quotations.validUntil,
      isSelected: quotations.isSelected,
      createdAt: quotations.createdAt
    })
    .from(quotations)
    .innerJoin(vendors, eq(quotations.vendorId, vendors.id))
    .where(eq(quotations.requisitionId, requisitionId))
    .orderBy(asc(quotations.totalPrice));
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const [newQuotation] = await db.insert(quotations).values(quotation).returning();
    return newQuotation;
  }

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation | undefined> {
    const [quotation] = await db.update(quotations)
      .set(updates)
      .where(eq(quotations.id, id))
      .returning();
    return quotation || undefined;
  }

  // Purchase order management
  async getPurchaseOrders(): Promise<any[]> {
    return await db.select({
      id: purchaseOrders.id,
      requisitionId: purchaseOrders.requisitionId,
      vendor: vendors.name,
      totalAmount: purchaseOrders.totalAmount,
      status: purchaseOrders.status,
      expectedDelivery: purchaseOrders.expectedDelivery,
      actualDelivery: purchaseOrders.actualDelivery,
      createdAt: purchaseOrders.createdAt
    })
    .from(purchaseOrders)
    .innerJoin(vendors, eq(purchaseOrders.vendorId, vendors.id))
    .orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id: string): Promise<any> {
    const [order] = await db.select({
      id: purchaseOrders.id,
      requisitionId: purchaseOrders.requisitionId,
      vendorId: purchaseOrders.vendorId,
      vendor: vendors.name,
      totalAmount: purchaseOrders.totalAmount,
      status: purchaseOrders.status,
      expectedDelivery: purchaseOrders.expectedDelivery,
      actualDelivery: purchaseOrders.actualDelivery,
      createdAt: purchaseOrders.createdAt,
      updatedAt: purchaseOrders.updatedAt
    })
    .from(purchaseOrders)
    .innerJoin(vendors, eq(purchaseOrders.vendorId, vendors.id))
    .where(eq(purchaseOrders.id, id));
    
    return order || undefined;
  }

  async createPurchaseOrder(order: { requisitionId: string; vendorId: string; totalAmount: string; expectedDelivery?: Date }): Promise<PurchaseOrder> {
    const [newOrder] = await db.insert(purchaseOrders).values(order).returning();
    return newOrder;
  }

  async updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [order] = await db.update(purchaseOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return order || undefined;
  }

  // Stock movement management
  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const [newMovement] = await db.insert(stockMovements).values(movement).returning();
    return newMovement;
  }

  async getStockMovements(stockId?: string): Promise<any[]> {
    let query = db.select({
      id: stockMovements.id,
      stockId: stockMovements.stockId,
      movementType: stockMovements.movementType,
      quantity: stockMovements.quantity,
      reason: stockMovements.reason,
      referenceId: stockMovements.referenceId,
      performedBy: users.fullName,
      createdAt: stockMovements.createdAt
    })
    .from(stockMovements)
    .leftJoin(users, eq(stockMovements.performedBy, users.id));

    if (stockId) {
      query = query.where(eq(stockMovements.stockId, stockId)) as any;
    }

    return await query.orderBy(desc(stockMovements.createdAt));
  }

  // Audit logging
  async createAuditLog(log: { 
    userId?: string; 
    action: string; 
    entityType: string; 
    entityId?: string; 
    oldValues?: string; 
    newValues?: string; 
    ipAddress?: string; 
    userAgent?: string; 
  }): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }

  // Dashboard analytics
  async getDashboardStats(): Promise<{
    totalStockValue: number;
    pendingRequests: number;
    lowStockItems: number;
    activeVendors: number;
  }> {
    // Calculate total stock value
    const stockValue = await db.select({
      total: sql<number>`COALESCE(SUM(${stock.quantityAvailable} * COALESCE(${items.unitPrice}, 0)), 0)`
    })
    .from(stock)
    .innerJoin(items, eq(stock.itemId, items.id));

    // Count pending requests (both borrow and purchase)
    const pendingBorrowRequests = await db.select({
      count: sql<number>`COUNT(*)`
    })
    .from(borrowRequests)
    .where(eq(borrowRequests.status, 'PENDING'));

    const pendingPurchaseRequests = await db.select({
      count: sql<number>`COUNT(*)`
    })
    .from(purchaseRequisitions)
    .where(eq(purchaseRequisitions.status, 'PENDING'));

    // Count low stock items
    const lowStock = await db.select({
      count: sql<number>`COUNT(*)`
    })
    .from(stock)
    .innerJoin(items, eq(stock.itemId, items.id))
    .where(sql`${stock.quantityAvailable} <= ${items.minReorderLevel}`);

    // Count active vendors
    const activeVendors = await db.select({
      count: sql<number>`COUNT(*)`
    })
    .from(vendors)
    .where(eq(vendors.status, 'ACTIVE'));

    return {
      totalStockValue: stockValue[0]?.total || 0,
      pendingRequests: (pendingBorrowRequests[0]?.count || 0) + (pendingPurchaseRequests[0]?.count || 0),
      lowStockItems: lowStock[0]?.count || 0,
      activeVendors: activeVendors[0]?.count || 0,
    };
  }

  async getRecentActivities(limit = 10): Promise<any[]> {
    // Combine recent borrow requests and purchase requisitions
    const recentBorrowRequests = await db.select({
      id: borrowRequests.id,
      type: sql<string>`'borrow_request'`,
      title: sql<string>`'Borrow request submitted'`,
      description: sql<string>`${users.fullName} || ' requested ' || ${borrowRequests.quantityRequested} || 'x ' || ${items.name}`,
      user: users.fullName,
      status: borrowRequests.status,
      timestamp: borrowRequests.createdAt,
    })
    .from(borrowRequests)
    .innerJoin(users, eq(borrowRequests.requesterId, users.id))
    .innerJoin(items, eq(borrowRequests.itemId, items.id))
    .orderBy(desc(borrowRequests.createdAt))
    .limit(limit);

    const recentPurchaseRequests = await db.select({
      id: purchaseRequisitions.id,
      type: sql<string>`'purchase_requisition'`,
      title: sql<string>`'Purchase requisition submitted'`,
      description: sql<string>`${users.fullName} || ' requested ' || ${purchaseRequisitions.itemName} || ' - $' || ${purchaseRequisitions.estimatedCost}`,
      user: users.fullName,
      status: purchaseRequisitions.status,
      timestamp: purchaseRequisitions.createdAt,
    })
    .from(purchaseRequisitions)
    .innerJoin(users, eq(purchaseRequisitions.requesterId, users.id))
    .orderBy(desc(purchaseRequisitions.createdAt))
    .limit(limit);

    // Combine and sort by timestamp
    const allActivities = [...recentBorrowRequests, ...recentPurchaseRequests]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return allActivities;
  }
}

export const storage = new DatabaseStorage();
