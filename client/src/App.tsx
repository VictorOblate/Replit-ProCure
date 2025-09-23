import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import BorrowRequests from "@/pages/borrow-requests";
import PurchaseRequisitions from "@/pages/purchase-requisitions";
import Vendors from "@/pages/vendors";
import Approvals from "@/pages/approvals";
import AuditLogs from "@/pages/audit-logs";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/inventory" component={Inventory} />
      <ProtectedRoute path="/borrow-requests" component={BorrowRequests} />
      <ProtectedRoute path="/purchase-requisitions" component={PurchaseRequisitions} />
      <ProtectedRoute path="/vendors" component={Vendors} />
      <ProtectedRoute path="/approvals" component={Approvals} />
      <ProtectedRoute path="/audit-logs" component={AuditLogs} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
