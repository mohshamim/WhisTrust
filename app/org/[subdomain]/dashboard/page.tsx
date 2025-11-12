"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { ClientSidebar } from "@/components/client-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function ClientDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user: clientUser, organization: org } = await getCurrentClientAdmin();
      
      if (!clientUser || !org) {
        console.log("Not authenticated, redirecting to login");
        router.push(`/org/${subdomain}/login`);
        return;
      }

      // Verify user belongs to this organization
      if (org.subdomain !== subdomain) {
        console.log("User doesn't belong to this organization");
        router.push(`/org/${subdomain}/login`);
        return;
      }

      setUser(clientUser);
      setOrganization(org);
      
      // Load dashboard stats
      await loadStats(org.id);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (organizationId: string) => {
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      // Get reports count
      const { count: totalReports } = await supabase
        .from("reports")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", organizationId);

      const { count: pendingReports } = await supabase
        .from("reports")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", organizationId)
        .in("status", ["submitted", "under_review"]);

      const { count: resolvedReports } = await supabase
        .from("reports")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", organizationId)
        .in("status", ["resolved", "closed"]);

      const { count: activeUsers } = await supabase
        .from("admin_profiles")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", organizationId)
        .eq("is_active", true);

      setStats({
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
        resolvedReports: resolvedReports || 0,
        activeUsers: activeUsers || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!organization || !user) {
    return null;
  }

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || 'User',
          email: user.email,
          avatar: user.avatar_url || '/avatars/default.jpg',
        }}
        organization={{
          name: organization.name,
          subdomain: subdomain,
        }}
        userRole={user.role}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.full_name || user.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{user.role}</Badge>
                {organization.status === 'trial' && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Trial
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                All time submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedReports}</div>
              <p className="text-xs text-muted-foreground">Closed cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {organization.max_admin_users} max
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Organization Info & Welcome */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Compliance Dashboard</CardTitle>
            <CardDescription>
              Manage whistleblower reports and compliance cases for {organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex justify-between p-3 rounded-lg bg-muted">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium capitalize">{organization.plan}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={organization.status === 'active' ? 'default' : 'secondary'}>
                    {organization.status}
                  </Badge>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted">
                  <span className="text-muted-foreground">Users:</span>
                  <span className="font-medium">
                    {organization.current_admin_users} / {organization.max_admin_users}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted">
                  <span className="text-muted-foreground">Reports this month:</span>
                  <span className="font-medium">
                    {organization.current_reports_count} / {organization.max_reports_per_month}
                  </span>
                </div>
              </div>

              {organization.features?.anonymous_reporting && (
                <p className="text-muted-foreground mt-3">
                  ✓ Anonymous reporting is enabled for your organization
                </p>
              )}
              
              {stats.pendingReports > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-3">
                  <p className="font-medium text-amber-600">
                    ⚠️ You have {stats.pendingReports} pending report{stats.pendingReports !== 1 ? 's' : ''} requiring attention.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

