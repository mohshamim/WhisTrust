"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { History, RefreshCw, Search, Filter, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { AuditLog } from "@/lib/types/database";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Filters
  const [filters, setFilters] = useState({
    action: "",
    resourceType: "",
    userId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage, filters]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);

      const { getAuditLogs } = await import("@/lib/services/audit");

      const result = await getAuditLogs({
        action: filters.action || undefined,
        resourceType: filters.resourceType || undefined,
        userId: filters.userId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: itemsPerPage,
      });

      if (result.success && result.logs) {
        setLogs(result.logs);
        // Simple pagination calculation
        setTotalPages(Math.ceil(result.logs.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      action: "",
      resourceType: "",
      userId: "",
      startDate: "",
      endDate: "",
    });
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("created")) return "default";
    if (action.includes("updated") || action.includes("changed")) return "secondary";
    if (action.includes("deleted")) return "destructive";
    if (action.includes("login")) return "outline";
    return "default";
  };

  const formatDetails = (details: any) => {
    if (!details) return "—";
    
    try {
      const parsed = typeof details === "string" ? JSON.parse(details) : details;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(details);
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5" />
                Audit Logs
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete system activity history
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <CardTitle>Filters</CardTitle>
                </div>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Action
                  </label>
                  <Input
                    placeholder="Action type"
                    value={filters.action}
                    onChange={(e) => handleFilterChange("action", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Resource Type
                  </label>
                  <Input
                    placeholder="Resource type"
                    value={filters.resourceType}
                    onChange={(e) => handleFilterChange("resourceType", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    User ID
                  </label>
                  <Input
                    placeholder="User ID"
                    value={filters.userId}
                    onChange={(e) => handleFilterChange("userId", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>
                    System activity history and compliance records
                  </CardDescription>
                </div>
                <Button
                  onClick={loadAuditLogs}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No audit logs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Timestamp</th>
                          <th className="text-left p-2 font-medium">User</th>
                          <th className="text-left p-2 font-medium">Role</th>
                          <th className="text-left p-2 font-medium">Action</th>
                          <th className="text-left p-2 font-medium">Resource</th>
                          <th className="text-left p-2 font-medium">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {new Date(log.created_at).toLocaleString()}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-xs">
                                <div className="font-medium">
                                  {log.user_email || "Anonymous"}
                                </div>
                                <div className="text-muted-foreground">
                                  {log.user_id?.substring(0, 8)}...
                                </div>
                              </div>
                            </td>
                            <td className="p-2">
                              <Badge variant="outline" className="text-xs">
                                {log.user_role || "—"}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">
                                {log.action}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="text-xs">
                                <div className="font-medium">{log.resource_type}</div>
                                <div className="text-muted-foreground">
                                  {log.resource_id?.substring(0, 8)}...
                                </div>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-xs text-muted-foreground max-w-xs truncate">
                                {formatDetails(log.details)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, logs.length)} of {logs.length} logs
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
