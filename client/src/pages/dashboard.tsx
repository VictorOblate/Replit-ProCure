import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { InventoryOverview } from "@/components/dashboard/inventory-overview";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Dashboard"
          description="Welcome back! Here's what's happening today."
        />
        <div className="p-6 space-y-6">
          <KPICards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>
            <div className="space-y-6">
              <QuickActions />
              <PendingApprovals />
            </div>
          </div>
          <InventoryOverview />
        </div>
      </main>
    </div>
  );
}
