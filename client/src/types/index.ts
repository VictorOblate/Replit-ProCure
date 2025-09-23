export type UserRole = 'GENERAL_USER' | 'HOD' | 'PROCUREMENT_MANAGER' | 'FINANCE_OFFICER';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface DashboardStats {
  totalStockValue: number;
  pendingRequests: number;
  lowStockItems: number;
  activeVendors: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  user: string;
  status: RequestStatus;
  timestamp: Date;
}

export interface StockItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  departmentId: string;
  departmentName: string;
  quantityAvailable: number;
  quantityReserved: number;
  unit: string;
  minReorderLevel: number;
  lastUpdated: Date;
}

export interface BorrowRequestData {
  id: string;
  requester: string;
  requesterDepartment: string;
  item: string;
  owningDepartment: string;
  quantityRequested: number;
  justification: string;
  requiredDate: Date;
  status: RequestStatus;
  requesterHodApproval: ApprovalStatus;
  ownerHodApproval: ApprovalStatus;
  createdAt: Date;
}

export interface PurchaseRequisitionData {
  id: string;
  requester: string;
  department: string;
  itemName: string;
  description: string;
  quantity: number;
  estimatedCost: string;
  justification: string;
  requiredDate: Date;
  status: RequestStatus;
  hodApproval: ApprovalStatus;
  procurementApproval: ApprovalStatus;
  financeApproval: ApprovalStatus;
  createdAt: Date;
}
