import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Download, Eye, Handshake, ShoppingCart } from "lucide-react";
import type { StockItem } from "@/types";

export function InventoryOverview() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const { data: stockItems = [], isLoading } = useQuery<StockItem[]>({
    queryKey: ["/api/stock"],
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const filteredItems = stockItems
    .filter(item => selectedDepartment === "all" || item.departmentId === selectedDepartment)
    .slice(0, 5); // Show only first 5 items

  const getStockStatus = (item: StockItem) => {
    if (item.quantityAvailable <= 0) return { status: "Out of Stock", variant: "destructive" as const };
    if (item.quantityAvailable <= item.minReorderLevel) return { status: "Low Stock", variant: "secondary" as const };
    return { status: "In Stock", variant: "default" as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Overview
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48" data-testid="select-inventory-department">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" data-testid="button-export-inventory">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading inventory...</div>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No inventory items found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item, index) => {
                      const stockStatus = getStockStatus(item);
                      return (
                        <TableRow key={item.id} data-testid={`row-inventory-${index}`}>
                          <TableCell className="font-mono">{item.itemCode}</TableCell>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>{item.departmentName}</TableCell>
                          <TableCell>
                            <span className={item.quantityAvailable <= item.minReorderLevel ? "text-red-600 font-medium" : ""}>
                              {item.quantityAvailable}
                            </span>
                          </TableCell>
                          <TableCell>{item.quantityReserved}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" data-testid={`button-borrow-${index}`}>
                                <Handshake className="h-4 w-4 text-blue-600" />
                              </Button>
                              {item.quantityAvailable <= item.minReorderLevel && (
                                <Button variant="ghost" size="sm" data-testid={`button-reorder-${index}`}>
                                  <ShoppingCart className="h-4 w-4 text-amber-600" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" data-testid={`button-view-${index}`}>
                                <Eye className="h-4 w-4 text-gray-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(filteredItems.length, 5)} of {stockItems.length} items
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <span className="px-3 py-1.5 text-sm text-muted-foreground">...</span>
                <Button variant="outline" size="sm">10</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
