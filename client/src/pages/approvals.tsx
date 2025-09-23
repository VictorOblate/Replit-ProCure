import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import type { BorrowRequestData, PurchaseRequisitionData } from "@/types";

export default function Approvals() {
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string; type: string }>({
    open: false,
    id: "",
    type: "",
  });
  const [rejectionReason, setRejectionReason] = useState("");
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
      setRejectDialog({ open: false, id: "", type: "" });
      setRejectionReason("");
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
      setRejectDialog({ open: false, id: "", type: "" });
      setRejectionReason("");
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

  const handleApprove = (id: string, type: "borrow" | "purchase") => {
    const approvalType = getApprovalType(user?.role || "");
    if (type === "borrow") {
      approveBorrowMutation.mutate({ id, approvalType });
    } else {
      approvePurchaseMutation.mutate({ id, approvalType });
    }
  };

  const handleReject = (id: string, type: "borrow" | "purchase") => {
    setRejectDialog({ open: true, id, type });
  };

  const confirmReject = () => {
    const approvalType = getApprovalType(user?.role || "");
    if (rejectDialog.type === "borrow") {
      rejectBorrowMutation.mutate({ 
        id: rejectDialog.id, 
        reason: rejectionReason, 
        approvalType 
      });
    } else {
      rejectPurchaseMutation.mutate({ 
        id: rejectDialog.id, 
        reason: rejectionReason, 
        approvalType 
      });
    }
  };

  if (!user || !["HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"].includes(user.role || "")) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header 
            title="Approvals"
            description="Access denied"
          />
          <div className="p-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">You don't have permission to access this page.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Approvals"
          description="Review and approve pending requests"
        />
        <div className="p-6 space-y-6">
          <Tabs defaultValue="borrow-requests" className="space-y-6">
            <TabsList>
              <TabsTrigger value="borrow-requests" data-testid="tab-borrow-requests">
                Borrow Requests ({borrowRequests.length})
              </TabsTrigger>
              <TabsTrigger value="purchase-requisitions" data-testid="tab-purchase-requisitions">
                Purchase Requisitions ({purchaseRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="borrow-requests">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Borrow Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Requester</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>From Department</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Justification</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {borrowRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <p className="text-muted-foreground">No pending borrow requests</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          borrowRequests.map((request, index) => (
                            <TableRow key={request.id} data-testid={`row-borrow-approval-${index}`}>
                              <TableCell className="font-medium">{request.requester}</TableCell>
                              <TableCell>{request.item}</TableCell>
                              <TableCell>{request.owningDepartment}</TableCell>
                              <TableCell>{request.quantityRequested}</TableCell>
                              <TableCell className="max-w-xs truncate">{request.justification}</TableCell>
                              <TableCell>
                                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleApprove(request.id, "borrow")}
                                    disabled={approveBorrowMutation.isPending}
                                    data-testid={`button-approve-borrow-${index}`}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleReject(request.id, "borrow")}
                                    disabled={rejectBorrowMutation.isPending}
                                    data-testid={`button-reject-borrow-${index}`}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchase-requisitions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Purchase Requisitions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Requester</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Est. Cost</TableHead>
                          <TableHead>Justification</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <p className="text-muted-foreground">No pending purchase requisitions</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          purchaseRequests.map((request, index) => (
                            <TableRow key={request.id} data-testid={`row-purchase-approval-${index}`}>
                              <TableCell className="font-medium">{request.requester}</TableCell>
                              <TableCell>{request.itemName}</TableCell>
                              <TableCell>{request.department}</TableCell>
                              <TableCell>{request.quantity}</TableCell>
                              <TableCell>${request.estimatedCost}</TableCell>
                              <TableCell className="max-w-xs truncate">{request.justification}</TableCell>
                              <TableCell>
                                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleApprove(request.id, "purchase")}
                                    disabled={approvePurchaseMutation.isPending}
                                    data-testid={`button-approve-purchase-${index}`}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleReject(request.id, "purchase")}
                                    disabled={rejectPurchaseMutation.isPending}
                                    data-testid={`button-reject-purchase-${index}`}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this request:
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              data-testid="textarea-rejection-reason"
            />
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setRejectDialog({ open: false, id: "", type: "" })}
                data-testid="button-cancel-reject"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmReject}
                disabled={!rejectionReason.trim()}
                data-testid="button-confirm-reject"
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
