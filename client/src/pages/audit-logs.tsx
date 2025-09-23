import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, User, Calendar, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import type { AuditLog } from "@shared/schema";

export default function AuditLogs() {
  const { user } = useAuth();

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
    enabled: !!user && ["HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"].includes(user.role || ""),
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("CREATE")) return "default" as const;
    if (action.includes("UPDATE")) return "secondary" as const;
    if (action.includes("DELETE")) return "destructive" as const;
    if (action.includes("APPROVE")) return "default" as const;
    if (action.includes("REJECT")) return "destructive" as const;
    return "outline" as const;
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!user || !["HOD", "PROCUREMENT_MANAGER", "FINANCE_OFFICER"].includes(user.role || "")) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header 
            title="Audit Logs"
            description="Access denied"
          />
          <div className="p-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">You don't have permission to access this page.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Audit Logs"
          description="Track all system activities and changes"
        />
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                System Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading audit logs...</div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Entity ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <History className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No audit logs found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        auditLogs.map((log, index) => (
                          <TableRow key={log.id} data-testid={`row-audit-${index}`}>
                            <TableCell>
                              <Badge variant={getActionBadgeVariant(log.action)}>
                                {formatAction(log.action)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{log.entityType}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {log.entityId ? log.entityId.substring(0, 8) + "..." : "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {log.userId ? log.userId.substring(0, 8) + "..." : "System"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {log.ipAddress || "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-1">
                                {log.oldValues && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Before:</span> {log.oldValues.substring(0, 50)}...
                                  </div>
                                )}
                                {log.newValues && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">After:</span> {log.newValues.substring(0, 50)}...
                                  </div>
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(auditLogs.length, 10)} of {auditLogs.length} logs
                </p>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">1</button>
                  <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent">2</button>
                  <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent">3</button>
                  <span className="px-3 py-1.5 text-sm text-muted-foreground">...</span>
                  <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent">10</button>
                  <button className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent">
                    Next
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
