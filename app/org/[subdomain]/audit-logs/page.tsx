"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ClientSidebar } from "@/components/client-sidebar";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { getPermissions, UserRole } from "@/lib/permissions";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  History,
  Download,
  Calendar,
  Search,
  Filter,
  Shield,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { exportAuditLogsPDF, type AuditLog } from "@/lib/services/audit-logs";
import {
  getActionLabel,
  getActionIcon,
  getActionColor,
  formatAuditDetails,
  getRelativeTime,
  getResourceTypeLabel,
} from "@/lib/utils/audit-helpers";

export default function AuditLogsPage() {
  const router = useRouter();
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<any>(null);

  // Audit logs data
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Filter options
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  // Filters
  const [dateRange, setDateRange] = useState<string>("30");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Selected log for details
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (organization?.id && permissions) {
      loadFiltersData();
      loadAuditLogs();
    }
  }, [organization, permissions, dateRange, actionFilter, userFilter, resourceFilter]);

  useEffect(() => {
    applySearch();
  }, [searchTerm, logs]);

  const checkAuth = async () => {
    try {
      const { user: clientUser, organization: org } = await getCurrentClientAdmin();
      if (!clientUser || !org) {
        router.push(`/org/${subdomain}/login`);
        return;
      }

      const perms = getPermissions(clientUser.role as UserRole);
      if (!perms.canViewAuditLogs) {
        router.push(`/org/${subdomain}/dashboard`);
        return;
      }

      setUser(clientUser);
      setOrganization(org);
      setPermissions(perms);
    } catch (error) {
      console.error("Auth error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiltersData = async () => {
    if (!organization?.id) return;

    try {
      const response = await fetch("/api/audit-logs/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId: organization.id }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        console.error("Error loading filter data:", payload.error || response.statusText);
        setActionTypes([]);
        setUsers([]);
        return;
      }

      setActionTypes(payload.data.actions || []);
      setUsers(payload.data.users || []);
    } catch (error) {
      console.error("Error loading filter data:", error);
      setActionTypes([]);
      setUsers([]);
    }
  };

  const loadAuditLogs = async () => {
    if (!organization?.id) return;

    setLoadingLogs(true);

    try {
      const response = await fetch("/api/audit-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: organization.id,
          dateRange,
          actionFilter,
          userFilter,
          resourceFilter,
          limit: 200,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        console.error("Error loading audit logs:", payload.error || response.statusText);
        setLogs([]);
        setFilteredLogs([]);
        return;
      }

      setLogs(payload.data || []);
      setFilteredLogs(payload.data || []);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const applySearch = () => {
    if (!searchTerm.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = logs.filter(
      (log) =>
        log.action.toLowerCase().includes(searchLower) ||
        log.user_name?.toLowerCase().includes(searchLower) ||
        log.resource_type?.toLowerCase().includes(searchLower) ||
        formatAuditDetails(log.details).toLowerCase().includes(searchLower)
    );

    setFilteredLogs(filtered);
  };

  const handleExport = () => {
    if (filteredLogs.length > 0) {
      exportAuditLogsPDF(
        filteredLogs,
        organization?.name,
        dateRange === "7"
          ? "Last 7 Days"
          : dateRange === "30"
          ? "Last 30 Days"
          : dateRange === "90"
          ? "Last 90 Days"
          : "All Time",
        (organization as any)?.branding?.primary_color || null
      );
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  if (isLoading || !user || !organization || !permissions) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || user.email,
          email: user.email,
          avatar: user.avatar_url || "",
        }}
        organization={{
          name: organization.name,
          subdomain: organization.subdomain,
        }}
        userRole={user.role || "admin"}
      />
      <SidebarInset>
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <History className="h-6 w-6 text-primary" />
                  Audit Logs
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredLogs.length} {filteredLogs.length === 1 ? "entry" : "entries"} found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleExport} variant="outline" disabled={filteredLogs.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <NotificationsDropdown userId={user?.id || ""} organizationId={organization?.id || ""} />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info Alert */}
            <Alert className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Audit logs track all system activities for compliance and security purposes. All actions
                are recorded with timestamps and user information.
              </AlertDescription>
            </Alert>

            {/* Filters */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filters
                </CardTitle>
                <CardDescription>Filter audit logs by date, action, user, or resource</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Action Type */}
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {actionTypes.map((action) => (
                        <SelectItem key={action} value={action}>
                          {getActionLabel(action)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* User Filter */}
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters Summary */}
                {(dateRange !== "all" || actionFilter !== "all" || userFilter !== "all" || searchTerm) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {dateRange !== "all" && (
                      <Badge variant="secondary">
                        {dateRange === "7" ? "Last 7 Days" : dateRange === "30" ? "Last 30 Days" : "Last 90 Days"}
                      </Badge>
                    )}
                    {actionFilter !== "all" && (
                      <Badge variant="secondary">{getActionLabel(actionFilter)}</Badge>
                    )}
                    {userFilter !== "all" && (
                      <Badge variant="secondary">
                        {users.find((u) => u.id === userFilter)?.name}
                      </Badge>
                    )}
                    {searchTerm && <Badge variant="secondary">Search: "{searchTerm}"</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Complete history of all system activities</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="mt-4 text-sm text-muted-foreground">Loading audit logs...</p>
                    </div>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No audit logs found</p>
                    <p className="text-sm">Try adjusting your filters or search term</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Timestamp</TableHead>
                          <TableHead className="w-[200px]">User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead className="w-[120px]">Resource</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => {
                          const Icon = getActionIcon(log.action);
                          return (
                            <TableRow key={log.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {getRelativeTime(log.created_at)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(log.created_at).toLocaleString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {log.user_name?.substring(0, 2).toUpperCase() || "SY"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium">{log.user_name || "System"}</div>
                                    {log.user_email && (
                                      <div className="text-xs text-muted-foreground">{log.user_email}</div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getActionColor(log.action)} className="gap-1">
                                  <Icon className="h-3 w-3" />
                                  {getActionLabel(log.action)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {getResourceTypeLabel(log.resource_type)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                                  {formatAuditDetails(log.details)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(log)}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      {/* Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Audit Log Details
            </SheetTitle>
            <SheetDescription>Complete information about this activity</SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="space-y-6 mt-6">
              {/* Action Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {(() => {
                      const Icon = getActionIcon(selectedLog.action);
                      return <Icon className="h-4 w-4 text-primary" />;
                    })()}
                    Action Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Action Type</div>
                      <Badge variant={getActionColor(selectedLog.action)} className="mt-1">
                        {getActionLabel(selectedLog.action)}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Timestamp</div>
                      <div className="text-sm mt-1">{new Date(selectedLog.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Resource Type</div>
                      <div className="text-sm mt-1">{getResourceTypeLabel(selectedLog.resource_type)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Resource ID</div>
                      <div className="text-sm mt-1 font-mono text-xs">
                        {selectedLog.resource_id?.substring(0, 8) || "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {selectedLog.user_name?.substring(0, 2).toUpperCase() || "SY"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedLog.user_name || "System"}</div>
                      {selectedLog.user_email && (
                        <div className="text-sm text-muted-foreground">{selectedLog.user_email}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        User ID: {selectedLog.user_id?.substring(0, 8) || "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Additional Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(selectedLog.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b last:border-0">
                          <span className="text-sm font-medium text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <span className="text-sm font-mono">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technical Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Technical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Log ID</div>
                    <div className="text-sm font-mono mt-1">{selectedLog.id}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Organization ID</div>
                    <div className="text-sm font-mono mt-1">{selectedLog.organization_id}</div>
                  </div>
                  {selectedLog.ip_address && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">IP Address</div>
                      <div className="text-sm font-mono mt-1">{selectedLog.ip_address}</div>
                    </div>
                  )}
                  {selectedLog.user_agent && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">User Agent</div>
                      <div className="text-xs font-mono mt-1 break-all">{selectedLog.user_agent}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}

