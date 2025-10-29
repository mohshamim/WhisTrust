"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AdminUser } from "@/lib/types/database";
import { useUserRole, Permissions } from "@/hooks/use-user-role";

export default function AdminUsersPage() {
  const { role } = useUserRole();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { listAdminUsers } = await import("@/lib/services/users");
      const res = await listAdminUsers();
      if (res.success && res.users) setUsers(res.users);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: AdminUser["role"]
  ) => {
    if (!Permissions.canManageUsers(role)) return alert("Permission denied");
    const user = users.find((u) => u.id === userId);
    const { updateAdminRole } = await import("@/lib/services/users");
    const res = await updateAdminRole(userId, newRole, user?.role);
    if (!res.success) return alert(res.error || "Failed to update role");
    await loadUsers();
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    if (!Permissions.canManageUsers(role)) return alert("Permission denied");
    const { updateAdminActive } = await import("@/lib/services/users");
    const res = await updateAdminActive(userId, isActive);
    if (!res.success) return alert(res.error || "Failed to update status");
    await loadUsers();
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="flex h-12 items-center gap-2 px-4">
          <SidebarTrigger />
          <h1 className="text-base font-semibold">Users</h1>
        </div>
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground">Loading…</div>
              ) : users.length === 0 ? (
                <div className="text-muted-foreground">No users found.</div>
              ) : (
                <div className="grid gap-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                    >
                      <div>
                        <div className="font-medium">
                          {u.full_name || u.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={u.is_active ? "default" : "secondary"}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Select
                                value={u.role}
                                onValueChange={(val) =>
                                  handleRoleChange(
                                    u.id,
                                    val as AdminUser["role"]
                                  )
                                }
                                disabled={!Permissions.canManageUsers(role)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="manager">
                                    Manager
                                  </SelectItem>
                                  <SelectItem value="investigator">
                                    Investigator
                                  </SelectItem>
                                  <SelectItem value="hr">HR</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TooltipTrigger>
                          {!Permissions.canManageUsers(role) && (
                            <TooltipContent>
                              <p>Only Admin can change user roles.</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button
                                variant={u.is_active ? "secondary" : "default"}
                                onClick={() =>
                                  handleToggleActive(u.id, !u.is_active)
                                }
                                disabled={!Permissions.canManageUsers(role)}
                              >
                                {u.is_active ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {!Permissions.canManageUsers(role) && (
                            <TooltipContent>
                              <p>Only Admin can activate/deactivate users.</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
