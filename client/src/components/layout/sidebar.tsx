import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  LayoutDashboard,
  Package,
  Handshake,
  ShoppingCart,
  Truck,
  CheckCircle,
  BarChart3,
  History,
  LogOut,
  User
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  // Get pending approvals count
  const { data: pendingBorrowRequests = [] } = useQuery({
    queryKey: ["/api/borrow-requests", { pending: true }],
    enabled: !!user,
  });

  const { data: pendingPurchaseRequests = [] } = useQuery({
    queryKey: ["/api/purchase-requisitions", { pending: true }],
    enabled: !!user,
  });

  const pendingCount = pendingBorrowRequests.length + pendingPurchaseRequests.length;

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location === "/",
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Package,
      current: location === "/inventory",
    },
    {
      name: "Borrow Requests",
      href: "/borrow-requests",
      icon: Handshake,
      current: location === "/borrow-requests",
    },
    {
      name: "Purchase Requisitions",
      href: "/purchase-requisitions",
      icon: ShoppingCart,
      current: location === "/purchase-requisitions",
    },
    {
      name: "Vendors",
      href: "/vendors",
      icon: Truck,
      current: location === "/vendors",
      showForRoles: ["PROCUREMENT_MANAGER"],
    },
    {
      name: "Approvals",
      href: "/approvals",
      icon: CheckCircle,
      current: location === "/approvals",
      badge: pendingCount > 0 ? pendingCount : undefined,
      showForRoles: ["HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"],
    },
    {
      name: "Audit Logs",
      href: "/audit-logs",
      icon: History,
      current: location === "/audit-logs",
      showForRoles: ["HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"],
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const filteredNavigation = navigation.filter(item => 
    !item.showForRoles || item.showForRoles.includes(user?.role || "")
  );

  return (
    <aside className="w-64 bg-card border-r border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Boxes className="text-primary-foreground text-sm" />
          </div>
          <span className="text-xl font-semibold text-foreground">ProCure</span>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors relative",
                  item.current
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="text-sm h-4 w-4" />
                <span>{item.name}</span>
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    data-testid={`badge-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <User className="text-secondary-foreground text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="text-user-name">
              {user?.fullName}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-role">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="text-muted-foreground text-sm h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
