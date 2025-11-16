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
    logo_light_url: "",
    logo_dark_url: "",
    email_logo_url: "",
    favicon_url: "",
    support_email: "",
    support_phone: "",
    primary_color: "",
    theme_mode: "system",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [emailLogoFile, setEmailLogoFile] = useState<File | null>(null);

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
        logo_url: org.branding?.logo_url || "",
        logo_light_url: org.branding?.logo_light_url || org.branding?.logo_url || "",
        logo_dark_url: org.branding?.logo_dark_url || org.branding?.logo_url || "",
        email_logo_url: org.branding?.email_logo_url || "",
        favicon_url: org.branding?.favicon_url || "",
        support_email: org.branding?.support_email || "",
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
                {/* Live theme preview */}
                <LiveThemePreview primaryColor={branding.primary_color} themeMode={branding.theme_mode} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" /> Logo
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!logoFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", logoFile);
                            form.append("kind", "logo");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              alert(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, logo_url: data.url }));
                          } catch (err) {
                            console.error(err);
                            alert("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.logo_url ? (
                      <div className="mt-2">
                        <img
                          src={branding.logo_url}
                          alt="Logo preview"
                          className="h-10 object-contain bg-muted rounded p-1"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Logo (Light Theme)</div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!logoFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", logoFile);
                            form.append("kind", "logo_light");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              alert(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, logo_light_url: data.url }));
                          } catch (err) {
                            console.error(err);
                            alert("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.logo_light_url ? (
                      <img src={branding.logo_light_url} alt="Logo light" className="h-10 object-contain bg-white rounded p-1 border" />
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Logo (Dark Theme)</div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!logoFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", logoFile);
                            form.append("kind", "logo_dark");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              alert(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, logo_dark_url: data.url }));
                          } catch (err) {
                            console.error(err);
                            alert("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.logo_dark_url ? (
                      <div className="bg-neutral-900 p-2 rounded">
                        <img src={branding.logo_dark_url} alt="Logo dark" className="h-10 object-contain" />
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Email Logo</div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEmailLogoFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!emailLogoFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", emailLogoFile);
                            form.append("kind", "email_logo");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              alert(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, email_logo_url: data.url }));
                          } catch (err) {
                            console.error(err);
                            alert("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.email_logo_url ? (
                      <div className="mt-2">
                        <img
                          src={branding.email_logo_url}
                          alt="Email logo preview"
                          className="h-10 object-contain bg-muted rounded p-1"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Favicon (32x32)</div>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => setEmailLogoFile(e.target.files?.[0] || null)} />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!emailLogoFile) return;
                          try {
                            const form = new FormData();
                            form.append("file", emailLogoFile);
                            form.append("kind", "favicon");
                            const res = await fetch("/api/org/branding/upload", {
                              method: "POST",
                              credentials: "include",
                              body: form,
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) {
                              alert(data.error || "Upload failed");
                              return;
                            }
                            setBranding((b) => ({ ...b, favicon_url: data.url }));
                            // Update head link for live preview
                            const link: HTMLLinkElement =
                              (document.querySelector('link[rel="icon"]') as HTMLLinkElement) ||
                              (() => {
                                const l = document.createElement("link");
                                l.rel = "icon";
                                document.head.appendChild(l);
                                return l;
                              })();
                            link.href = data.url;
                          } catch (err) {
                            console.error(err);
                            alert("Upload failed");
                          }
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                    {branding.favicon_url ? (
                      <img src={branding.favicon_url} alt="Favicon" className="h-8 w-8 rounded bg-muted p-1" />
                    ) : null}
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
                    <div className="flex items-center gap-2">
                      <Input
                        value={branding.primary_color}
                        onChange={(e) => setBranding((b) => ({ ...b, primary_color: e.target.value }))}
                        placeholder="#0EA5E9"
                      />
                      <div
                        className="h-8 w-8 rounded border"
                        style={{ background: branding.primary_color || "transparent" }}
                        title="Preview"
                      />
                    </div>
                    <ColorContrastWarning color={branding.primary_color} />
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
                        // Update favicon link if provided
                        if (branding.favicon_url) {
                          const link: HTMLLinkElement =
                            (document.querySelector('link[rel="icon"]') as HTMLLinkElement) ||
                            (() => {
                              const l = document.createElement("link");
                              l.rel = "icon";
                              document.head.appendChild(l);
                              return l;
                            })();
                          link.href = branding.favicon_url;
                        }
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

function LiveThemePreview({ primaryColor, themeMode }: { primaryColor: string; themeMode: string }) {
  useEffect(() => {
    // Apply theme class
    if (themeMode === "dark") document.documentElement.classList.add("dark");
    else if (themeMode === "light") document.documentElement.classList.remove("dark");
    // If system, do nothing (respect system preference)
  }, [themeMode]);

  useEffect(() => {
    if (!primaryColor) return;
    document.documentElement.style.setProperty("--brand-primary", primaryColor);
  }, [primaryColor]);

  return null;
}

function ColorContrastWarning({ color }: { color: string }) {
  if (!color || !/^#([0-9A-F]{3}){1,2}$/i.test(color)) return null;

  const hexToRgb = (hex: string) => {
    const c = hex.substring(1);
    const n = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
    const num = parseInt(n, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };
  const luminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  const contrastRatio = (hex1: string, hex2: string) => {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const l1 = luminance(c1.r, c1.g, c1.b) + 0.05;
    const l2 = luminance(c2.r, c2.g, c2.b) + 0.05;
    const ratio = l1 > l2 ? l1 / l2 : l2 / l1;
    return ratio;
  };
  const ratioOnWhite = contrastRatio(color, "#ffffff");
  const ratioOnBlack = contrastRatio(color, "#000000");
  const good = ratioOnWhite >= 4.5 || ratioOnBlack >= 4.5;

  return (
    <div className={`text-xs ${good ? "text-green-600" : "text-amber-600"}`}>
      Contrast vs white: {ratioOnWhite.toFixed(2)} / black: {ratioOnBlack.toFixed(2)}{" "}
      {good ? "(OK)" : "(Low contrast - consider another color)"}
    </div>
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

