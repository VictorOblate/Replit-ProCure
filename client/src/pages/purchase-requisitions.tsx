import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Filter } from "lucide-react";
import { PurchaseRequisitionForm } from "@/components/forms/purchase-requisition-form";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import type { PurchaseRequisitionData } from "@/types";

export default function PurchaseRequisitions() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();

  const { data: requisitions = [], isLoading } = useQuery<PurchaseRequisitionData[]>({
    queryKey: ["/api/purchase-requisitions"],
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default" as const;
      case "PENDING":
        return "secondary" as const;
      case "REJECTED":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getApprovalStatus = (requisition: PurchaseRequisitionData) => {
    if (requisition.status === "REJECTED") return "Rejected";
    if (requisition.status === "APPROVED") return "Approved";
    
    if (requisition.hodApproval === "PENDING") return "Pending HOD Approval";
    if (requisition.procurementApproval === "PENDING") return "Pending Procurement Approval";
    if (requisition.financeApproval === "PENDING") return "Pending Finance Approval";
    
    return "Processing";
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Purchase Requisitions"
          description="Manage purchase requests and approvals"
        />
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Purchase Requisitions
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" data-testid="button-filter-requisitions">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-purchase-requisition">
                    <Plus className="h-4 w-4 mr-2" />
                    New Requisition
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading purchase requisitions...</div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requester</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Est. Cost</TableHead>
                        <TableHead>Required Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requisitions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No purchase requisitions found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        requisitions.map((requisition, index) => (
                          <TableRow key={requisition.id} data-testid={`row-requisition-${index}`}>
                            <TableCell className="font-medium">{requisition.requester}</TableCell>
                            <TableCell>{requisition.itemName}</TableCell>
                            <TableCell>{requisition.department}</TableCell>
                            <TableCell>{requisition.quantity}</TableCell>
                            <TableCell>M{requisition.estimatedCost}</TableCell>
                            <TableCell>
                              {new Date(requisition.requiredDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(requisition.status)}>
                                {getApprovalStatus(requisition)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(requisition.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" data-testid={`button-view-requisition-${index}`}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Purchase Requisition</DialogTitle>
          </DialogHeader>
          <PurchaseRequisitionForm onSuccess={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
