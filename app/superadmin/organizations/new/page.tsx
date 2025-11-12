"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    checkAuth();
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
  
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    primary_contact_email: "",
    primary_contact_name: "",
    billing_email: "",
    plan: "professional" as "essential" | "professional" | "enterprise",
    status: "trial" as "active" | "trial",
    max_admin_users: "",
    max_reports_per_month: "",
    max_storage_mb: "",
    internal_notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-generate subdomain from name
    if (field === "name" && !formData.subdomain) {
      const generatedSubdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 20);
      setFormData((prev) => ({ ...prev, subdomain: generatedSubdomain }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate subdomain format
      if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
        setError("Subdomain can only contain lowercase letters, numbers, and hyphens");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/superadmin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          max_admin_users: formData.max_admin_users ? parseInt(formData.max_admin_users) : undefined,
          max_reports_per_month: formData.max_reports_per_month ? parseInt(formData.max_reports_per_month) : undefined,
          max_storage_mb: formData.max_storage_mb ? parseInt(formData.max_storage_mb) : undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to create organization");
        toast.error(result.error || "Failed to create organization");
        setIsSubmitting(false);
        return;
      }

      // Show success and redirect
      toast.success(`Organization "${result.data.name}" created successfully!`);
      
      // Redirect to organization details
      setTimeout(() => {
        router.push(`/superadmin/organizations/${result.data.id}`);
      }, 500);
    } catch (err: any) {
      console.error("Create organization error:", err);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
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
                <h1 className="text-lg font-semibold">Create Organization</h1>
                <p className="text-sm text-muted-foreground">Add a new client organization</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="max-w-3xl">
          {error && (
            <Card className="mb-6 border-red-500/20 bg-red-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-600">Error</p>
                    <p className="text-sm text-red-600/80 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Organization details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Organization Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Acme Corporation"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subdomain">
                      Subdomain <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="subdomain"
                        value={formData.subdomain}
                        onChange={(e) => handleChange("subdomain", e.target.value)}
                        placeholder="acme"
                        required
                        pattern="[a-z0-9-]+"
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">.whistrust.app</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_contact_email">
                      Contact Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="primary_contact_email"
                      type="email"
                      value={formData.primary_contact_email}
                      onChange={(e) => handleChange("primary_contact_email", e.target.value)}
                      placeholder="admin@acme.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary_contact_name">Contact Name</Label>
                    <Input
                      id="primary_contact_name"
                      value={formData.primary_contact_name}
                      onChange={(e) => handleChange("primary_contact_name", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_email">Billing Email (Optional)</Label>
                  <Input
                    id="billing_email"
                    type="email"
                    value={formData.billing_email}
                    onChange={(e) => handleChange("billing_email", e.target.value)}
                    placeholder="billing@acme.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Plan & Status */}
            <Card>
              <CardHeader>
                <CardTitle>Plan & Status</CardTitle>
                <CardDescription>Subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">
                      Plan <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.plan}
                      onValueChange={(value) => handleChange("plan", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essential">Essential (5 users, 50 reports/mo)</SelectItem>
                        <SelectItem value="professional">Professional (15 users, 200 reports/mo)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (100 users, 1000 reports/mo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Limits (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Usage Limits (Optional)</CardTitle>
                <CardDescription>Override default plan limits if needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_admin_users">Max Users</Label>
                    <Input
                      id="max_admin_users"
                      type="number"
                      value={formData.max_admin_users}
                      onChange={(e) => handleChange("max_admin_users", e.target.value)}
                      placeholder="Auto (based on plan)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_reports_per_month">Max Reports/Month</Label>
                    <Input
                      id="max_reports_per_month"
                      type="number"
                      value={formData.max_reports_per_month}
                      onChange={(e) => handleChange("max_reports_per_month", e.target.value)}
                      placeholder="Auto (based on plan)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_storage_mb">Max Storage (MB)</Label>
                    <Input
                      id="max_storage_mb"
                      type="number"
                      value={formData.max_storage_mb}
                      onChange={(e) => handleChange("max_storage_mb", e.target.value)}
                      placeholder="Auto (based on plan)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
                <CardDescription>Private notes (not visible to organization)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.internal_notes}
                  onChange={(e) => handleChange("internal_notes", e.target.value)}
                  placeholder="Any internal notes or special requirements..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/superadmin/organizations">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </div>
          </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

