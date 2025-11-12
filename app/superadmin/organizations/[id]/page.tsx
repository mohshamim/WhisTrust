"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Building2, Users, FileText, HardDrive, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Organization } from "@/lib/services/organizations";

export default function OrganizationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    if (params.id) {
      loadOrganization();
    }
  }, [params.id]);

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

  const loadOrganization = async () => {
    try {
      const response = await fetch(`/api/superadmin/organizations/${params.id}`);
      const result = await response.json();
      
      if (result.success) {
        setOrganization(result.data);
      } else {
        router.push("/superadmin/organizations");
      }
    } catch (error) {
      console.error("Failed to load organization:", error);
      router.push("/superadmin/organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!organization) return;

    const newStatus = organization.status === 'active' ? 'suspended' : 'active';
    const confirmMessage = newStatus === 'suspended'
      ? `Are you sure you want to SUSPEND "${organization.name}"? Users will lose access.`
      : `Activate "${organization.name}"? Users will regain access.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/superadmin/organizations/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        setOrganization(result.data);
        toast.success(`Organization ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully!`);
      } else {
        toast.error(`Failed to update status: ${result.error}`);
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("An error occurred while updating status");
    }
  };

  const handleDelete = async () => {
    if (!organization) return;

    const confirmed = window.confirm(
      `⚠️ WARNING: Archive "${organization.name}"?\n\n` +
      `This will:\n` +
      `- Set status to "cancelled"\n` +
      `- Prevent user access\n` +
      `- Preserve all data\n\n` +
      `Are you sure?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/superadmin/organizations/${params.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Organization archived successfully!");
        setTimeout(() => {
          router.push("/superadmin/organizations");
        }, 1000);
      } else {
        toast.error(`Failed to archive: ${result.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while archiving");
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

  if (loading) {
    return (
      <SidebarProvider>
        <SuperAdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!organization) {
    return null;
  }

  const usagePercentage = {
    users: (organization.current_admin_users / organization.max_admin_users) * 100,
    reports: (organization.current_reports_count / organization.max_reports_per_month) * 100,
    storage: (organization.current_storage_mb / organization.max_storage_mb) * 100,
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
                <h1 className="text-lg font-semibold">{organization.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {organization.subdomain}.whistrust.app
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(organization.status)}>
                  {organization.status}
                </Badge>
                <Badge className={getPlanColor(organization.plan)}>
                  {organization.plan}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Organization Name" value={organization.name} />
                <InfoRow label="Subdomain" value={`${organization.subdomain}.whistrust.app`} />
                <InfoRow label="Slug" value={organization.slug} />
                <InfoRow label="Primary Contact" value={organization.primary_contact_email} />
                {organization.primary_contact_name && (
                  <InfoRow label="Contact Name" value={organization.primary_contact_name} />
                )}
                {organization.billing_email && (
                  <InfoRow label="Billing Email" value={organization.billing_email} />
                )}
                <InfoRow 
                  label="Created" 
                  value={new Date(organization.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} 
                />
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Current usage vs. plan limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <UsageBar
                  icon={<Users className="w-5 h-5" />}
                  label="Admin Users"
                  current={organization.current_admin_users}
                  max={organization.max_admin_users}
                  percentage={usagePercentage.users}
                  color="blue"
                />
                <UsageBar
                  icon={<FileText className="w-5 h-5" />}
                  label="Reports (This Month)"
                  current={organization.current_reports_count}
                  max={organization.max_reports_per_month}
                  percentage={usagePercentage.reports}
                  color="purple"
                />
                <UsageBar
                  icon={<HardDrive className="w-5 h-5" />}
                  label="Storage"
                  current={organization.current_storage_mb}
                  max={organization.max_storage_mb}
                  percentage={usagePercentage.storage}
                  color="green"
                  unit="MB"
                />
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Enabled Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(organization.features).map(([feature, enabled]) => (
                    <div
                      key={feature}
                      className={`p-3 rounded-lg border ${
                        enabled
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-slate-500/5 border-slate-500/20"
                      }`}
                    >
                      <p className="text-sm font-medium capitalize">
                        {feature.replace(/_/g, " ")}
                      </p>
                      <Badge variant={enabled ? "default" : "secondary"} className="mt-1">
                        {enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            {organization.internal_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Internal Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {organization.internal_notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/superadmin/organizations/${organization.id}/edit`}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Organization
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleStatusToggle()}
                >
                  {organization.status === 'active' ? '⏸️ Suspend' : '✅ Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => handleDelete()}
                >
                  🗑️ Archive Organization
                </Button>
              </CardContent>
            </Card>

            {/* Branding */}
            {organization.branding && (
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {organization.branding.primary_color && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Primary Color</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: organization.branding.primary_color }}
                        />
                        <span className="text-sm font-mono">
                          {organization.branding.primary_color}
                        </span>
                      </div>
                    </div>
                  )}
                  {organization.branding.company_name && (
                    <InfoRow label="Company Name" value={organization.branding.company_name} />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function UsageBar({
  icon,
  label,
  current,
  max,
  percentage,
  color,
  unit = "",
}: {
  icon: React.ReactNode;
  label: string;
  current: number;
  max: number;
  percentage: number;
  color: string;
  unit?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  };

  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">{icon}</div>
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-sm font-mono ${isOverLimit ? "text-red-600" : isNearLimit ? "text-amber-600" : ""}`}>
          {current.toLocaleString()} / {max.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isOverLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : colorClasses[color as keyof typeof colorClasses]
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

