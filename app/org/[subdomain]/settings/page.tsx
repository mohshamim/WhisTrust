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
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Users,
  FileText,
  HardDrive,
  Mail,
  Phone,
  Calendar,
  Palette,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ClientSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Branding form state
  const [branding, setBranding] = useState({
    logo_url: "",
    email_logo_url: "",
    support_email: "",
    support_phone: "",
    primary_color: "",
    theme_mode: "system",
  });

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

      setUser(clientUser);
      setOrganization(org);

      // Initialize branding state
      const initial = {
        logo_url: org.logo_url || "",
        email_logo_url: org.branding?.email_logo_url || "",
        support_email: org.branding?.support_email || org.primary_contact_email || "",
        support_phone: org.branding?.support_phone || "",
        primary_color: org.branding?.primary_color || "",
        theme_mode: org.branding?.theme_mode || "system",
      };
      setBranding(initial);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !organization || !user) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const usagePercentages = {
    users: (organization.current_admin_users / organization.max_admin_users) * 100,
    reports: (organization.current_reports_count / organization.max_reports_per_month) * 100,
    storage: (organization.current_storage_mb / organization.max_storage_mb) * 100,
  };

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
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Organization settings and information
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="max-w-4xl space-y-6">
            {/* Branding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Branding
                </CardTitle>
                <CardDescription>Customize your organization’s look and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" /> Logo URL
                    </div>
                    <Input
                      value={branding.logo_url}
                      onChange={(e) => setBranding((b) => ({ ...b, logo_url: e.target.value }))}
                      placeholder="https://.../logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Email Logo URL</div>
                    <Input
                      value={branding.email_logo_url}
                      onChange={(e) => setBranding((b) => ({ ...b, email_logo_url: e.target.value }))}
                      placeholder="https://.../email-logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Support Email</div>
                    <Input
                      type="email"
                      value={branding.support_email}
                      onChange={(e) => setBranding((b) => ({ ...b, support_email: e.target.value }))}
                      placeholder="support@yourorg.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Support Phone</div>
                    <Input
                      value={branding.support_phone}
                      onChange={(e) => setBranding((b) => ({ ...b, support_phone: e.target.value }))}
                      placeholder="+1 555-123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Primary Color (hex)</div>
                    <Input
                      value={branding.primary_color}
                      onChange={(e) => setBranding((b) => ({ ...b, primary_color: e.target.value }))}
                      placeholder="#0EA5E9"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Theme</div>
                    <Select
                      value={branding.theme_mode}
                      onValueChange={(v) =>
                        setBranding((b) => ({ ...b, theme_mode: v as "light" | "dark" | "system" }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Theme mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      try {
                        setSaving(true);
                        const res = await fetch("/api/org/branding", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify(branding),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                          alert(data.error || "Failed to save branding");
                          return;
                        }
                        // reflect saved state in UI
                        setOrganization((o: any) => ({
                          ...o,
                          logo_url: data.organization.logo_url,
                          branding: data.organization.branding,
                        }));
                        alert("Branding updated successfully");
                      } catch (err) {
                        console.error(err);
                        alert("Something went wrong");
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                  >
                    <Save className={`h-4 w-4 mr-2 ${saving ? "animate-pulse" : ""}`} />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Organization Name" value={organization.name} />
                  <InfoRow label="Subdomain" value={`${organization.subdomain}.whistrust.app`} />
                  <InfoRow label="Plan" value={<Badge className="capitalize">{organization.plan}</Badge>} />
                  <InfoRow label="Status" value={
                    <Badge variant={organization.status === 'active' ? 'default' : 'secondary'}>
                      {organization.status}
                    </Badge>
                  } />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow 
                  label="Primary Contact" 
                  value={organization.primary_contact_email}
                  icon={<Mail className="h-4 w-4" />}
                />
                {organization.primary_contact_name && (
                  <InfoRow 
                    label="Contact Name" 
                    value={organization.primary_contact_name}
                  />
                )}
                {organization.billing_email && (
                  <InfoRow 
                    label="Billing Email" 
                    value={organization.billing_email}
                    icon={<Mail className="h-4 w-4" />}
                  />
                )}
                {organization.branding?.support_email && (
                  <InfoRow 
                    label="Support Email" 
                    value={organization.branding.support_email}
                  />
                )}
                {organization.branding?.support_phone && (
                  <InfoRow 
                    label="Support Phone" 
                    value={organization.branding.support_phone}
                    icon={<Phone className="h-4 w-4" />}
                  />
                )}
              </CardContent>
            </Card>

            {/* Usage & Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Usage & Limits</CardTitle>
                <CardDescription>Current usage vs. plan limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <UsageItem
                  icon={<Users className="h-5 w-5" />}
                  label="Users"
                  current={organization.current_admin_users}
                  max={organization.max_admin_users}
                  percentage={usagePercentages.users}
                />
                <UsageItem
                  icon={<FileText className="h-5 w-5" />}
                  label="Reports (This Month)"
                  current={organization.current_reports_count}
                  max={organization.max_reports_per_month}
                  percentage={usagePercentages.reports}
                />
                <UsageItem
                  icon={<HardDrive className="h-5 w-5" />}
                  label="Storage"
                  current={organization.current_storage_mb}
                  max={organization.max_storage_mb}
                  percentage={usagePercentages.storage}
                  unit="MB"
                />
              </CardContent>
            </Card>

            {/* Enabled Features */}
            <Card>
              <CardHeader>
                <CardTitle>Enabled Features</CardTitle>
                <CardDescription>Features available in your plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(organization.features || {}).map(([feature, enabled]) => (
                    <div
                      key={feature}
                      className={`p-3 rounded-lg border ${
                        enabled
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-slate-500/5 border-slate-500/20"
                      }`}
                    >
                      <p className="text-sm font-medium capitalize mb-1">
                        {feature.replace(/_/g, " ")}
                      </p>
                      <Badge variant={enabled ? "default" : "secondary"} className="text-xs">
                        {enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Info */}
            {(organization.trial_ends_at || organization.subscription_ends_at) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Subscription Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {organization.trial_ends_at && organization.status === 'trial' && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm font-medium text-amber-600">
                        Trial ends: {new Date(organization.trial_ends_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-amber-600/80 mt-1">
                        Contact your administrator to upgrade before trial expires
                      </p>
                    </div>
                  )}
                  {organization.subscription_ends_at && organization.status === 'active' && (
                    <InfoRow 
                      label="Subscription Renews" 
                      value={new Date(organization.subscription_ends_at).toLocaleDateString()}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function InfoRow({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function UsageItem({
  icon,
  label,
  current,
  max,
  percentage,
  unit = "",
}: {
  icon: React.ReactNode;
  label: string;
  current: number;
  max: number;
  percentage: number;
  unit?: string;
}) {
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
      <Progress 
        value={Math.min(percentage, 100)} 
        className={isOverLimit ? "bg-red-200" : isNearLimit ? "bg-amber-200" : ""}
      />
    </div>
  );
}

