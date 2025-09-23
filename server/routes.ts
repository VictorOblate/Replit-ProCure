import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertBorrowRequestSchema, 
  insertPurchaseRequisitionSchema,
  insertVendorSchema,
  insertItemSchema,
  insertStockSchema,
  insertQuotationSchema
} from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      res.status(500).json({ error: "Failed to get dashboard stats" });
    }
  });

  app.get("/api/dashboard/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error getting recent activities:", error);
      res.status(500).json({ error: "Failed to get recent activities" });
    }
  });

  // Department routes
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error getting departments:", error);
      res.status(500).json({ error: "Failed to get departments" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Item routes
  app.get("/api/items", async (req, res) => {
    try {
      const search = req.query.search as string;
      let items;
      
      if (search) {
        items = await storage.searchItems(search);
      } else {
        items = await storage.getItems();
      }
      
      res.json(items);
    } catch (error) {
      console.error("Error getting items:", error);
      res.status(500).json({ error: "Failed to get items" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const itemData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(itemData);
      
      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_ITEM",
        entityType: "Item",
        entityId: item.id,
        newValues: JSON.stringify(item),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  // Stock routes
  app.get("/api/stock", async (req, res) => {
    try {
      const departmentId = req.query.departmentId as string;
      const itemId = req.query.itemId as string;
      
      let stock;
      if (departmentId) {
        stock = await storage.getStockByDepartment(departmentId);
      } else if (itemId) {
        stock = await storage.getStockByItem(itemId);
      } else {
        stock = await storage.getStock();
      }
      
      res.json(stock);
    } catch (error) {
      console.error("Error getting stock:", error);
      res.status(500).json({ error: "Failed to get stock" });
    }
  });

  app.get("/api/stock/low", async (req, res) => {
    try {
      const lowStock = await storage.getLowStockItems();
      res.json(lowStock);
    } catch (error) {
      console.error("Error getting low stock items:", error);
      res.status(500).json({ error: "Failed to get low stock items" });
    }
  });

  app.post("/api/stock", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const stockData = insertStockSchema.parse(req.body);
      const stock = await storage.createStock(stockData);
      
      // Create stock movement record
      await storage.createStockMovement({
        stockId: stock.id,
        movementType: 'IN',
        quantity: stock.quantityAvailable,
        reason: 'Initial stock creation',
        performedBy: req.user?.id
      });

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_STOCK",
        entityType: "Stock",
        entityId: stock.id,
        newValues: JSON.stringify(stock),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(stock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating stock:", error);
      res.status(500).json({ error: "Failed to create stock" });
    }
  });

  // Borrow request routes
  app.get("/api/borrow-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const requesterId = req.query.requesterId as string;
      const departmentId = req.query.departmentId as string;
      const pending = req.query.pending === 'true';
      
      let requests;
      if (pending) {
        requests = await storage.getPendingBorrowRequests();
      } else if (requesterId) {
        requests = await storage.getBorrowRequestsByRequester(requesterId);
      } else if (departmentId) {
        requests = await storage.getBorrowRequestsByDepartment(departmentId);
      } else {
        requests = await storage.getBorrowRequests();
      }
      
      res.json(requests);
    } catch (error) {
      console.error("Error getting borrow requests:", error);
      res.status(500).json({ error: "Failed to get borrow requests" });
    }
  });

  app.get("/api/borrow-requests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const request = await storage.getBorrowRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Borrow request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error getting borrow request:", error);
      res.status(500).json({ error: "Failed to get borrow request" });
    }
  });

  app.post("/api/borrow-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const requestData = insertBorrowRequestSchema.parse({
        ...req.body,
        requesterId: req.user?.id,
        requesterDepartmentId: req.user?.departmentId
      });

      // Check if stock is available
      const stockItem = await storage.getStockByItemAndDepartment(
        requestData.itemId, 
        requestData.owningDepartmentId
      );

      if (!stockItem || stockItem.quantityAvailable < requestData.quantityRequested) {
        return res.status(400).json({ error: "Insufficient stock available" });
      }

      const request = await storage.createBorrowRequest(requestData);

      // Reserve stock
      await storage.updateStock(stockItem.id, {
        quantityReserved: stockItem.quantityReserved + requestData.quantityRequested
      });

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_BORROW_REQUEST",
        entityType: "BorrowRequest",
        entityId: request.id,
        newValues: JSON.stringify(request),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating borrow request:", error);
      res.status(500).json({ error: "Failed to create borrow request" });
    }
  });

  app.patch("/api/borrow-requests/:id/approve", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { approvalType } = req.body; // 'requester_hod' or 'owner_hod'
      const request = await storage.getBorrowRequest(req.params.id);
      
      if (!request) {
        return res.status(404).json({ error: "Borrow request not found" });
      }

      const updates: Partial<any> = { approvedBy: req.user?.id };
      
      if (approvalType === 'requester_hod') {
        updates.requesterHodApproval = 'APPROVED';
      } else if (approvalType === 'owner_hod') {
        updates.ownerHodApproval = 'APPROVED';
        
        // If both approvals are now approved, complete the transfer
        if (request.requesterHodApproval === 'APPROVED') {
          updates.status = 'APPROVED';
          
          // Transfer stock
          const ownerStock = await storage.getStockByItemAndDepartment(
            request.itemId, request.owningDepartmentId
          );
          const requesterStock = await storage.getStockByItemAndDepartment(
            request.itemId, request.requesterDepartmentId
          );

          if (ownerStock) {
            // Deduct from owner
            await storage.updateStock(ownerStock.id, {
              quantityAvailable: ownerStock.quantityAvailable - request.quantityRequested,
              quantityReserved: ownerStock.quantityReserved - request.quantityRequested
            });

            // Record stock movement for owner
            await storage.createStockMovement({
              stockId: ownerStock.id,
              movementType: 'OUT',
              quantity: request.quantityRequested,
              reason: `Borrowed by ${request.requesterDepartment}`,
              referenceId: request.id,
              performedBy: req.user?.id
            });

            // Add to requester (create stock if doesn't exist)
            if (requesterStock) {
              await storage.updateStock(requesterStock.id, {
                quantityAvailable: requesterStock.quantityAvailable + request.quantityRequested
              });

              // Record stock movement for requester
              await storage.createStockMovement({
                stockId: requesterStock.id,
                movementType: 'IN',
                quantity: request.quantityRequested,
                reason: `Borrowed from ${request.owningDepartment}`,
                referenceId: request.id,
                performedBy: req.user?.id
              });
            } else {
              // Create new stock for requester department
              const newStock = await storage.createStock({
                itemId: request.itemId,
                departmentId: request.requesterDepartmentId,
                quantityAvailable: request.quantityRequested
              });

              // Record stock movement for new stock
              await storage.createStockMovement({
                stockId: newStock.id,
                movementType: 'IN',
                quantity: request.quantityRequested,
                reason: `Borrowed from ${request.owningDepartment}`,
                referenceId: request.id,
                performedBy: req.user?.id
              });
            }
          }
        }
      }

      const updatedRequest = await storage.updateBorrowRequest(req.params.id, updates);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "APPROVE_BORROW_REQUEST",
        entityType: "BorrowRequest",
        entityId: req.params.id,
        oldValues: JSON.stringify(request),
        newValues: JSON.stringify(updatedRequest),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error approving borrow request:", error);
      res.status(500).json({ error: "Failed to approve borrow request" });
    }
  });

  app.patch("/api/borrow-requests/:id/reject", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { reason, approvalType } = req.body;
      const request = await storage.getBorrowRequest(req.params.id);
      
      if (!request) {
        return res.status(404).json({ error: "Borrow request not found" });
      }

      const updates: Partial<any> = { 
        rejectionReason: reason,
        approvedBy: req.user?.id,
        status: 'REJECTED'
      };
      
      if (approvalType === 'requester_hod') {
        updates.requesterHodApproval = 'REJECTED';
      } else if (approvalType === 'owner_hod') {
        updates.ownerHodApproval = 'REJECTED';
      }

      // Release reserved stock
      const stockItem = await storage.getStockByItemAndDepartment(
        request.itemId, request.owningDepartmentId
      );

      if (stockItem) {
        await storage.updateStock(stockItem.id, {
          quantityReserved: stockItem.quantityReserved - request.quantityRequested
        });
      }

      const updatedRequest = await storage.updateBorrowRequest(req.params.id, updates);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "REJECT_BORROW_REQUEST",
        entityType: "BorrowRequest",
        entityId: req.params.id,
        oldValues: JSON.stringify(request),
        newValues: JSON.stringify(updatedRequest),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error rejecting borrow request:", error);
      res.status(500).json({ error: "Failed to reject borrow request" });
    }
  });

  // Purchase requisition routes
  app.get("/api/purchase-requisitions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const requesterId = req.query.requesterId as string;
      const departmentId = req.query.departmentId as string;
      const pending = req.query.pending === 'true';
      
      let requisitions;
      if (pending) {
        requisitions = await storage.getPendingPurchaseRequisitions();
      } else if (requesterId) {
        requisitions = await storage.getPurchaseRequisitionsByRequester(requesterId);
      } else if (departmentId) {
        requisitions = await storage.getPurchaseRequisitionsByDepartment(departmentId);
      } else {
        requisitions = await storage.getPurchaseRequisitions();
      }
      
      res.json(requisitions);
    } catch (error) {
      console.error("Error getting purchase requisitions:", error);
      res.status(500).json({ error: "Failed to get purchase requisitions" });
    }
  });

  app.get("/api/purchase-requisitions/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const requisition = await storage.getPurchaseRequisition(req.params.id);
      if (!requisition) {
        return res.status(404).json({ error: "Purchase requisition not found" });
      }
      
      res.json(requisition);
    } catch (error) {
      console.error("Error getting purchase requisition:", error);
      res.status(500).json({ error: "Failed to get purchase requisition" });
    }
  });

  app.post("/api/purchase-requisitions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const requisitionData = insertPurchaseRequisitionSchema.parse({
        ...req.body,
        requesterId: req.user?.id,
        departmentId: req.user?.departmentId
      });

      const requisition = await storage.createPurchaseRequisition(requisitionData);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_PURCHASE_REQUISITION",
        entityType: "PurchaseRequisition",
        entityId: requisition.id,
        newValues: JSON.stringify(requisition),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(requisition);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating purchase requisition:", error);
      res.status(500).json({ error: "Failed to create purchase requisition" });
    }
  });

  app.patch("/api/purchase-requisitions/:id/approve", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { approvalType } = req.body; // 'hod', 'procurement', or 'finance'
      const requisition = await storage.getPurchaseRequisition(req.params.id);
      
      if (!requisition) {
        return res.status(404).json({ error: "Purchase requisition not found" });
      }

      const updates: Partial<any> = { approvedBy: req.user?.id };
      
      if (approvalType === 'hod') {
        updates.hodApproval = 'APPROVED';
      } else if (approvalType === 'procurement') {
        updates.procurementApproval = 'APPROVED';
      } else if (approvalType === 'finance') {
        updates.financeApproval = 'APPROVED';
        
        // If all approvals are completed, approve the requisition
        if (requisition.hodApproval === 'APPROVED' && requisition.procurementApproval === 'APPROVED') {
          updates.status = 'APPROVED';
        }
      }

      const updatedRequisition = await storage.updatePurchaseRequisition(req.params.id, updates);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "APPROVE_PURCHASE_REQUISITION",
        entityType: "PurchaseRequisition",
        entityId: req.params.id,
        oldValues: JSON.stringify(requisition),
        newValues: JSON.stringify(updatedRequisition),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(updatedRequisition);
    } catch (error) {
      console.error("Error approving purchase requisition:", error);
      res.status(500).json({ error: "Failed to approve purchase requisition" });
    }
  });

  app.patch("/api/purchase-requisitions/:id/reject", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { reason, approvalType } = req.body;
      const requisition = await storage.getPurchaseRequisition(req.params.id);
      
      if (!requisition) {
        return res.status(404).json({ error: "Purchase requisition not found" });
      }

      const updates: Partial<any> = { 
        rejectionReason: reason,
        approvedBy: req.user?.id,
        status: 'REJECTED'
      };
      
      if (approvalType === 'hod') {
        updates.hodApproval = 'REJECTED';
      } else if (approvalType === 'procurement') {
        updates.procurementApproval = 'REJECTED';
      } else if (approvalType === 'finance') {
        updates.financeApproval = 'REJECTED';
      }

      const updatedRequisition = await storage.updatePurchaseRequisition(req.params.id, updates);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "REJECT_PURCHASE_REQUISITION",
        entityType: "PurchaseRequisition",
        entityId: req.params.id,
        oldValues: JSON.stringify(requisition),
        newValues: JSON.stringify(updatedRequisition),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(updatedRequisition);
    } catch (error) {
      console.error("Error rejecting purchase requisition:", error);
      res.status(500).json({ error: "Failed to reject purchase requisition" });
    }
  });

  // Vendor routes
  app.get("/api/vendors", async (req, res) => {
    try {
      const active = req.query.active === 'true';
      
      let vendors;
      if (active) {
        vendors = await storage.getActiveVendors();
      } else {
        vendors = await storage.getVendors();
      }
      
      res.json(vendors);
    } catch (error) {
      console.error("Error getting vendors:", error);
      res.status(500).json({ error: "Failed to get vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      console.error("Error getting vendor:", error);
      res.status(500).json({ error: "Failed to get vendor" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Only procurement managers can create vendors
      if (req.user?.role !== 'PROCUREMENT_MANAGER') {
        return res.status(403).json({ error: "Only procurement managers can create vendors" });
      }

      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_VENDOR",
        entityType: "Vendor",
        entityId: vendor.id,
        newValues: JSON.stringify(vendor),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating vendor:", error);
      res.status(500).json({ error: "Failed to create vendor" });
    }
  });

  app.patch("/api/vendors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Only procurement managers can update vendors
      if (req.user?.role !== 'PROCUREMENT_MANAGER') {
        return res.status(403).json({ error: "Only procurement managers can update vendors" });
      }

      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      const updatedVendor = await storage.updateVendor(req.params.id, req.body);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "UPDATE_VENDOR",
        entityType: "Vendor",
        entityId: req.params.id,
        oldValues: JSON.stringify(vendor),
        newValues: JSON.stringify(updatedVendor),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(updatedVendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Failed to update vendor" });
    }
  });

  // Quotation routes
  app.get("/api/quotations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const requisitionId = req.query.requisitionId as string;
      
      let quotations;
      if (requisitionId) {
        quotations = await storage.getQuotationsByRequisition(requisitionId);
      } else {
        quotations = await storage.getQuotations();
      }
      
      res.json(quotations);
    } catch (error) {
      console.error("Error getting quotations:", error);
      res.status(500).json({ error: "Failed to get quotations" });
    }
  });

  app.post("/api/quotations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const quotationData = insertQuotationSchema.parse(req.body);
      const quotation = await storage.createQuotation(quotationData);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_QUOTATION",
        entityType: "Quotation",
        entityId: quotation.id,
        newValues: JSON.stringify(quotation),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(quotation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating quotation:", error);
      res.status(500).json({ error: "Failed to create quotation" });
    }
  });

  // Purchase order routes
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error getting purchase orders:", error);
      res.status(500).json({ error: "Failed to get purchase orders" });
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const order = await storage.getPurchaseOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error getting purchase order:", error);
      res.status(500).json({ error: "Failed to get purchase order" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const order = await storage.createPurchaseOrder(req.body);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CREATE_PURCHASE_ORDER",
        entityType: "PurchaseOrder",
        entityId: order.id,
        newValues: JSON.stringify(order),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  });

  // Audit log routes
  app.get("/api/audit-logs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Only allow HODs, procurement managers, and finance officers to view audit logs
      if (!['HOD', 'PROCUREMENT_MANAGER', 'FINANCE_OFFICER'].includes(req.user?.role || '')) {
        return res.status(403).json({ error: "Access denied" });
      }

      const auditLogs = await storage.getAuditLogs();
      res.json(auditLogs);
    } catch (error) {
      console.error("Error getting audit logs:", error);
      res.status(500).json({ error: "Failed to get audit logs" });
    }
  });

  // Stock movement routes
  app.get("/api/stock-movements", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const stockId = req.query.stockId as string;
      const movements = await storage.getStockMovements(stockId);
      res.json(movements);
    } catch (error) {
      console.error("Error getting stock movements:", error);
      res.status(500).json({ error: "Failed to get stock movements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
