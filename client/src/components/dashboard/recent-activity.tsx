import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle, AlertTriangle, Truck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { RecentActivity } from "@/types";

export function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery<RecentActivity[]>({
    queryKey: ["/api/dashboard/activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "borrow_request":
        return { icon: CheckCircle, bg: "bg-blue-100", color: "text-blue-600" };
      case "purchase_requisition":
        return { icon: ShoppingCart, bg: "bg-green-100", color: "text-green-600" };
      case "vendor":
        return { icon: Truck, bg: "bg-purple-100", color: "text-purple-600" };
      default:
        return { icon: AlertTriangle, bg: "bg-red-100", color: "text-red-600" };
    }
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-4 p-4">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activities</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all-activities">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent activities</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const iconConfig = getActivityIcon(activity.type);
              const Icon = iconConfig.icon;
              
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-4 p-4 hover:bg-accent rounded-lg transition-colors"
                  data-testid={`activity-${index}`}
                >
                  <div className={`w-8 h-8 ${iconConfig.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`${iconConfig.color} text-sm h-4 w-4`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground" data-testid={`activity-title-${index}`}>
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`activity-description-${index}`}>
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" data-testid={`activity-timestamp-${index}`}>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(activity.status)} data-testid={`activity-status-${index}`}>
                    {activity.status}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
