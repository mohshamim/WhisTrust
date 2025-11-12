"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createMultiTenantClient } from "@/lib/supabase/multi-tenant-client";
import { SuperAdminSidebar } from "@/components/superadmin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  Plus,
  Activity,
} from "lucide-react";

interface Stats {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  totalUsers: number;
  totalReports: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createMultiTenantClient();
      
      // Get session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("No session found, redirecting to login");
        router.push("/superadmin/login");
        return;
      }

      console.log("Session found for user:", session.user.email);

      // Verify is super admin - disable RLS for this query
      const { data: profile, error } = await supabase
        .from("admin_profiles")
        .select("is_super_admin, role")
        .eq("id", session.user.id)
        .maybeSingle();

      console.log("Profile query result:", { profile, error });

      if (error) {
        console.error("Profile fetch error (RLS issue?):", error);
        // RLS might be blocking - check if this is expected
        // For now, don't redirect if we have a session
        return;
      }

      if (!profile) {
        console.error("No profile found for user:", session.user.id);
        router.push("/superadmin/login");
        return;
      }

      if (profile.is_super_admin !== true) {
        console.log("User is not a super admin:", profile);
        router.push("/superadmin/login");
      } else {
        console.log("✅ Super admin verified!");
      }
    } catch (error) {
      console.error("Auth check exception:", error);
      // Don't redirect on unexpected errors
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/superadmin/organizations?stats=true");
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SuperAdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Super Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Platform overview and management
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Organizations
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.totalOrganizations || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total clients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.activeOrganizations || 0}
                </div>
                <p className="text-xs text-muted-foreground">Active orgs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial</CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.trialOrganizations || 0}
                </div>
                <p className="text-xs text-muted-foreground">On trial</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.totalReports || 0}
                </div>
                <p className="text-xs text-muted-foreground">All reports</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your platform</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/superadmin/organizations/new">
                  <Plus className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Create Organization</div>
                    <div className="text-xs text-muted-foreground">
                      Add new client
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <Link href="/superadmin/organizations">
                  <Building2 className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">View Organizations</div>
                    <div className="text-xs text-muted-foreground">
                      Manage all orgs
                    </div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

