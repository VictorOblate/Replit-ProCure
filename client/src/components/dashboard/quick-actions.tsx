import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Handshake, ShoppingCart, Truck, BarChart3 } from "lucide-react";
import { BorrowRequestForm } from "@/components/forms/borrow-request-form";
import { PurchaseRequisitionForm } from "@/components/forms/purchase-requisition-form";
import { VendorForm } from "@/components/forms/vendor-form";
import { useAuth } from "@/hooks/use-auth";

export function QuickActions() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const { user } = useAuth();

  const actions = [
    {
      id: "borrow-request",
      title: "New Borrow Request",
      description: "Request items from other departments",
      icon: Handshake,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      allowedRoles: ["GENERAL_USER", "HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"],
    },
    {
      id: "purchase-requisition",
      title: "Purchase Requisition",
      description: "Request new items for purchase",
      icon: ShoppingCart,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      allowedRoles: ["GENERAL_USER", "HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"],
    },
    {
      id: "vendor-management",
      title: "Manage Vendors",
      description: "Add or update vendor information",
      icon: Truck,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      allowedRoles: ["PROCUREMENT_MANAGER"],
    },
    {
      id: "view-reports",
      title: "View Reports",
      description: "Analyze trends and performance",
      icon: BarChart3,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      allowedRoles: ["HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"],
    },
  ];

  const filteredActions = actions.filter(action => 
    action.allowedRoles.includes(user?.role || "")
  );

  const handleActionClick = (actionId: string) => {
    if (actionId === "view-reports") {
      // Handle reports navigation
      return;
    }
    setOpenDialog(actionId);
  };

  const renderDialogContent = () => {
    switch (openDialog) {
      case "borrow-request":
        return (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Borrow Request</DialogTitle>
            </DialogHeader>
            <BorrowRequestForm onSuccess={() => setOpenDialog(null)} />
          </DialogContent>
        );
      case "purchase-requisition":
        return (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Purchase Requisition</DialogTitle>
            </DialogHeader>
            <PurchaseRequisitionForm onSuccess={() => setOpenDialog(null)} />
          </DialogContent>
        );
      case "vendor-management":
        return (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <VendorForm onSuccess={() => setOpenDialog(null)} />
          </DialogContent>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleActionClick(action.id)}
                data-testid={`button-${action.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`${action.iconColor} text-sm h-4 w-4`} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={!!openDialog} onOpenChange={() => setOpenDialog(null)}>
        {renderDialogContent()}
      </Dialog>
    </>
  );
}
