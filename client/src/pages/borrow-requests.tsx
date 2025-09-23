import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Handshake, Plus, Filter } from "lucide-react";
import { BorrowRequestForm } from "@/components/forms/borrow-request-form";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import type { BorrowRequestData } from "@/types";

export default function BorrowRequests() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();

  const { data: borrowRequests = [], isLoading } = useQuery<BorrowRequestData[]>({
    queryKey: ["/api/borrow-requests"],
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

  const getApprovalStatus = (request: BorrowRequestData) => {
    if (request.status === "REJECTED") return "Rejected";
    if (request.status === "APPROVED") return "Approved";
    
    if (request.requesterHodApproval === "PENDING") return "Pending HOD Approval";
    if (request.ownerHodApproval === "PENDING") return "Pending Owner Approval";
    
    return "Processing";
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Borrow Requests"
          description="Manage item borrowing between departments"
        />
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  Borrow Requests
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" data-testid="button-filter-requests">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-borrow-request">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading borrow requests...</div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requester</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>From Department</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Required Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {borrowRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Handshake className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No borrow requests found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        borrowRequests.map((request, index) => (
                          <TableRow key={request.id} data-testid={`row-request-${index}`}>
                            <TableCell className="font-medium">{request.requester}</TableCell>
                            <TableCell>{request.item}</TableCell>
                            <TableCell>{request.owningDepartment}</TableCell>
                            <TableCell>{request.quantityRequested}</TableCell>
                            <TableCell>
                              {new Date(request.requiredDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(request.status)}>
                                {getApprovalStatus(request)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" data-testid={`button-view-${index}`}>
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
            <DialogTitle>New Borrow Request</DialogTitle>
          </DialogHeader>
          <BorrowRequestForm onSuccess={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
