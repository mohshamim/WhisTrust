"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentClientAdmin, hasPermission } from "@/lib/services/client-auth";
import { ClientSidebar } from "@/components/client-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users as UsersIcon,
  UserPlus,
  Shield,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  department: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export default function ClientUsersPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user: clientUser, organization: org } = await getCurrentClientAdmin();
      
      if (!clientUser || !org || org.subdomain !== subdomain) {
        router.push(`/org/${subdomain}/login`);
        return;
      }

      // Check if user has permission to manage users
      if (!hasPermission(clientUser.role, 'manage_users')) {
        router.push(`/org/${subdomain}/dashboard`);
        toast.error("You don't have permission to manage users");
        return;
      }

      setCurrentUser(clientUser);
      setOrganization(org);
      
      await loadUsers(org.id);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (organizationId: string) => {
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load users:", error);
        toast.error("Failed to load users");
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error("Load users error:", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUser.id) {
      toast.error("You cannot change your own role");
      return;
    }

    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { error } = await supabase
        .from("admin_profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        toast.error("Failed to update role");
        return;
      }

      toast.success("Role updated successfully");
      await loadUsers(organization.id);
    } catch (error) {
      console.error("Update role error:", error);
      toast.error("An error occurred");
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUser.id) {
      toast.error("You cannot deactivate yourself");
      return;
    }

    const newStatus = !currentStatus;

    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { error } = await supabase
        .from("admin_profiles")
        .update({ is_active: newStatus })
        .eq("id", userId);

      if (error) {
        toast.error("Failed to update status");
        return;
      }

      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      await loadUsers(organization.id);
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("An error occurred");
    }
  };

  if (loading || !organization || !currentUser) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canAddUsers = organization.current_admin_users < organization.max_admin_users;

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: currentUser.full_name || 'User',
          email: currentUser.email,
          avatar: currentUser.avatar_url || '/avatars/default.jpg',
        }}
        organization={{
          name: organization.name,
          subdomain: subdomain,
        }}
        userRole={currentUser.role}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Users</h1>
                <p className="text-sm text-muted-foreground">
                  {users.length} / {organization.max_admin_users} users
                </p>
              </div>
              <Button disabled={!canAddUsers}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Usage Warning */}
          {!canAddUsers && (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-600">User Limit Reached</p>
                    <p className="text-sm text-amber-600/80 mt-1">
                      You've reached your plan limit of {organization.max_admin_users} users. 
                      Upgrade your plan to add more users.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage users in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => {
                  const isSelf = user.id === currentUser.id;
                  const canEdit = !isSelf;

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{user.full_name || user.email}</p>
                          {isSelf && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                          {!user.is_active && (
                            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.department && (
                          <p className="text-xs text-muted-foreground mt-1">{user.department}</p>
                        )}
                        {user.last_login_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last login: {new Date(user.last_login_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={!canEdit}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="investigator">Investigator</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant={user.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          disabled={!canEdit}
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

