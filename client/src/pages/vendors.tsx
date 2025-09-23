import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Truck, Plus, Filter, Star } from "lucide-react";
import { VendorForm } from "@/components/forms/vendor-form";
import { useAuth } from "@/hooks/use-auth";
import type { Vendor } from "@shared/schema";

export default function Vendors() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default" as const;
      case "PENDING":
        return "secondary" as const;
      case "INACTIVE":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const canManageVendors = user?.role === "PROCUREMENT_MANAGER";

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Vendor Management"
          description="Manage vendor relationships and performance"
        />
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Vendors
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" data-testid="button-filter-vendors">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  {canManageVendors && (
                    <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-vendor">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vendor
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading vendors...</div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor Name</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Categories</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Truck className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No vendors found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        vendors.map((vendor, index) => (
                          <TableRow key={vendor.id} data-testid={`row-vendor-${index}`}>
                            <TableCell className="font-medium">{vendor.name}</TableCell>
                            <TableCell>{vendor.contactPerson}</TableCell>
                            <TableCell>{vendor.email}</TableCell>
                            <TableCell>{vendor.phone || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {vendor.categories?.slice(0, 2).map((category, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                                {(vendor.categories?.length || 0) > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(vendor.categories?.length || 0) - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">
                                  {vendor.rating ? Number(vendor.rating).toFixed(1) : "N/A"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(vendor.status)}>
                                {vendor.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" data-testid={`button-view-vendor-${index}`}>
                                  View
                                </Button>
                                {canManageVendors && (
                                  <Button variant="ghost" size="sm" data-testid={`button-edit-vendor-${index}`}>
                                    Edit
                                  </Button>
                                )}
                              </div>
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

      {canManageVendors && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <VendorForm onSuccess={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
