import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, AlertTriangle, Truck, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types";

export function KPICards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const kpiCards = [
    {
      title: "Total Stock Value",
      value: stats ? `M${stats.totalStockValue.toLocaleString()}` : "M0",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests?.toString() || "0",
      change: "3.2 days avg",
      changeType: "neutral" as const,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockItems?.toString() || "0",
      change: "Needs attention",
      changeType: "negative" as const,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Active Vendors",
      value: stats?.activeVendors?.toString() || "0",
      change: "98.5% rating",
      changeType: "positive" as const,
      icon: Truck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} data-testid={`card-kpi-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground" data-testid={`text-kpi-title-${index}`}>
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground" data-testid={`text-kpi-value-${index}`}>
                    {card.value}
                  </p>
                  <p className={`text-xs flex items-center mt-1 ${
                    card.changeType === "positive" ? "text-green-600" : 
                    card.changeType === "negative" ? "text-red-600" : 
                    "text-amber-600"
                  }`} data-testid={`text-kpi-change-${index}`}>
                    {card.changeType === "positive" && <TrendingUp className="text-xs mr-1 h-3 w-3" />}
                    {card.changeType === "negative" && <AlertTriangle className="text-xs mr-1 h-3 w-3" />}
                    {card.changeType === "neutral" && <Clock className="text-xs mr-1 h-3 w-3" />}
                    <span>{card.change}</span>
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} h-6 w-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
