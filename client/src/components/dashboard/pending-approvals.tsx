import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { BorrowRequestData, PurchaseRequisitionData } from "@/types";

export function PendingApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: borrowRequests = [] } = useQuery<BorrowRequestData[]>({
    queryKey: ["/api/borrow-requests", { pending: true }],
    enabled: !!user && ["HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"].includes(user.role || ""),
  });

  const { data: purchaseRequests = [] } = useQuery<PurchaseRequisitionData[]>({
    queryKey: ["/api/purchase-requisitions", { pending: true }],
    enabled: !!user && ["HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"].includes(user.role || ""),
  });

  const approveBorrowMutation = useMutation({
    mutationFn: async ({ id, approvalType }: { id: string; approvalType: string }) => {
      const response = await apiRequest("PATCH", `/api/borrow-requests/${id}/approve`, { approvalType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/borrow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Request approved successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to approve request", description: error.message, variant: "destructive" });
    },
  });

  const rejectBorrowMutation = useMutation({
    mutationFn: async ({ id, reason, approvalType }: { id: string; reason: string; approvalType: string }) => {
      const response = await apiRequest("PATCH", `/api/borrow-requests/${id}/reject`, { reason, approvalType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/borrow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Request rejected successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to reject request", description: error.message, variant: "destructive" });
    },
  });

  const approvePurchaseMutation = useMutation({
    mutationFn: async ({ id, approvalType }: { id: string; approvalType: string }) => {
      const response = await apiRequest("PATCH", `/api/purchase-requisitions/${id}/approve`, { approvalType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Requisition approved successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to approve requisition", description: error.message, variant: "destructive" });
    },
  });

  const rejectPurchaseMutation = useMutation({
    mutationFn: async ({ id, reason, approvalType }: { id: string; reason: string; approvalType: string }) => {
      const response = await apiRequest("PATCH", `/api/purchase-requisitions/${id}/reject`, { reason, approvalType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Requisition rejected successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to reject requisition", description: error.message, variant: "destructive" });
    },
  });

  const getApprovalType = (userRole: string) => {
    switch (userRole) {
      case "HOD":
        return "hod";
      case "PROCUREMENT_MANAGER":
        return "procurement";
      case "FINANCE_OFFICER":
        return "finance";
      default:
        return "";
    }
  };

  const allApprovals = [
    ...borrowRequests.map(req => ({
      id: req.id,
      type: "borrow",
      title: `Borrow: ${req.item}`,
      description: `${req.quantityRequested} units - ${req.requesterDepartment}`,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    })),
    ...purchaseRequests.map(req => ({
      id: req.id,
      type: "purchase",
      title: `Purchase: ${req.itemName}`,
      description: `$${req.estimatedCost} - ${req.department}`,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    })),
  ].slice(0, 3); // Show only first 3

  if (!user || !["HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"].includes(user.role || "")) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allApprovals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          allApprovals.map((approval, index) => (
            <div 
              key={approval.id} 
              className={`flex items-center justify-between p-3 ${approval.bgColor} border ${approval.borderColor} rounded-lg`}
              data-testid={`approval-${index}`}
            >
              <div>
                <p className="text-sm font-medium text-foreground" data-testid={`approval-title-${index}`}>
                  {approval.title}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`approval-description-${index}`}>
                  {approval.description}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    const approvalType = getApprovalType(user.role || "");
                    if (approval.type === "borrow") {
                      approveBorrowMutation.mutate({ id: approval.id, approvalType });
                    } else {
                      approvePurchaseMutation.mutate({ id: approval.id, approvalType });
                    }
                  }}
                  disabled={approveBorrowMutation.isPending || approvePurchaseMutation.isPending}
                  data-testid={`button-approve-${index}`}
                >
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => {
                    const reason = "Declined from dashboard";
                    const approvalType = getApprovalType(user.role || "");
                    if (approval.type === "borrow") {
                      rejectBorrowMutation.mutate({ id: approval.id, reason, approvalType });
                    } else {
                      rejectPurchaseMutation.mutate({ id: approval.id, reason, approvalType });
                    }
                  }}
                  disabled={rejectBorrowMutation.isPending || rejectPurchaseMutation.isPending}
                  data-testid={`button-reject-${index}`}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
