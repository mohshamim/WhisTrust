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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Plus,
  Search,
  Users,
  FileText,
  MoreVertical,
  TrendingUp,
} from "lucide-react";
import type { Organization } from "@/lib/services/organizations";

export default function OrganizationsListPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAuth();
    loadOrganizations();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createMultiTenantClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/superadmin/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("admin_profiles")
        .select("is_super_admin")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }

      if (!profile || !profile.is_super_admin) {
        router.push("/superadmin/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = organizations.filter((org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.primary_contact_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrgs(filtered);
    } else {
      setFilteredOrgs(organizations);
    }
  }, [searchQuery, organizations]);

  const loadOrganizations = async () => {
    try {
      const response = await fetch("/api/superadmin/organizations");
      const result = await response.json();
      
      if (result.success) {
        setOrganizations(result.data);
        setFilteredOrgs(result.data);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "trial":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "suspended":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "cancelled":
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "essential":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "professional":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "enterprise":
        return "bg-pink-500/10 text-pink-600 border-pink-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <SidebarProvider>
      <SuperAdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Organizations</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredOrgs.length} organization{filteredOrgs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button asChild>
                <Link href="/superadmin/organizations/new">
                  <Plus className="w-4 h-4 mr-2" />
                  New Organization
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, subdomain, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Organizations List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrgs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No organizations found" : "No organizations yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Get started by creating your first organization"}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/superadmin/organizations/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Organization
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrgs.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/superadmin/organizations/${org.id}/edit`);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    {org.subdomain}.whistrust.app
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status & Plan */}
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(org.status)}>
                      {org.status}
                    </Badge>
                    <Badge className={getPlanColor(org.plan)}>
                      {org.plan}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Users</p>
                        <p className="font-semibold">
                          {org.current_admin_users}/{org.max_admin_users}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Reports</p>
                        <p className="font-semibold">
                          {org.current_reports_count}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/superadmin/organizations/${org.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

