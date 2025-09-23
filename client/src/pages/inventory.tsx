import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Package, AlertTriangle } from "lucide-react";
import type { StockItem } from "@/types";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const { data: stockItems = [], isLoading } = useQuery<StockItem[]>({
    queryKey: ["/api/stock"],
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || item.departmentId === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStockStatus = (item: StockItem) => {
    if (item.quantityAvailable <= 0) return { status: "Out of Stock", variant: "destructive" as const };
    if (item.quantityAvailable <= item.minReorderLevel) return { status: "Low Stock", variant: "secondary" as const };
    return { status: "In Stock", variant: "default" as const };
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Inventory Management"
          description="Monitor stock levels across all departments"
        />
        <div className="p-6 space-y-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-items"
                    />
                  </div>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48" data-testid="select-department">
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
                </div>
                <Button variant="outline" data-testid="button-export">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Stock Table */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading inventory...</div>
                </div>
              ) : (
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
                        filteredItems.map((item) => {
                          const stockStatus = getStockStatus(item);
                          return (
                            <TableRow key={item.id} data-testid={`row-stock-${item.id}`}>
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
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" data-testid={`button-view-${item.id}`}>
                                    View
                                  </Button>
                                  {item.quantityAvailable <= item.minReorderLevel && (
                                    <Button variant="ghost" size="sm" data-testid={`button-reorder-${item.id}`}>
                                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(filteredItems.length, 10)} of {filteredItems.length} items
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">1</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
