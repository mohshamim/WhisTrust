"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type { Organization } from "@/lib/services/organizations";

export default function EditOrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    primary_contact_email: "",
    primary_contact_name: "",
    billing_email: "",
    plan: "professional" as "essential" | "professional" | "enterprise",
    status: "active" as "active" | "trial" | "suspended" | "cancelled",
    max_admin_users: "",
    max_reports_per_month: "",
    max_storage_mb: "",
    internal_notes: "",
  });

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
        const org: Organization = result.data;
        setFormData({
          name: org.name,
          primary_contact_email: org.primary_contact_email,
          primary_contact_name: org.primary_contact_name || "",
          billing_email: org.billing_email || "",
          plan: org.plan,
          status: org.status,
          max_admin_users: org.max_admin_users.toString(),
          max_reports_per_month: org.max_reports_per_month.toString(),
          max_storage_mb: org.max_storage_mb.toString(),
          internal_notes: org.internal_notes || "",
        });
      }
    } catch (error) {
      console.error("Failed to load organization:", error);
      setError("Failed to load organization");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/superadmin/organizations/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          primary_contact_email: formData.primary_contact_email,
          primary_contact_name: formData.primary_contact_name || null,
          billing_email: formData.billing_email || null,
          plan: formData.plan,
          status: formData.status,
          max_admin_users: parseInt(formData.max_admin_users),
          max_reports_per_month: parseInt(formData.max_reports_per_month),
          max_storage_mb: parseInt(formData.max_storage_mb),
          internal_notes: formData.internal_notes || null,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to update organization");
        setIsSubmitting(false);
        return;
      }

      setSuccess("Organization updated successfully!");
      
      // Redirect back to details page after 1 second
      setTimeout(() => {
        router.push(`/superadmin/organizations/${params.id}`);
      }, 1000);
    } catch (err: any) {
      console.error("Update organization error:", err);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
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
                <h1 className="text-lg font-semibold">Edit Organization</h1>
                <p className="text-sm text-muted-foreground">Update organization details</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/superadmin/organizations/${params.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="max-w-3xl">
            {/* Success Message */}
            {success && (
              <Card className="mb-6 border-green-500/20 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-green-600 mt-0.5">✓</div>
                    <div>
                      <p className="font-medium text-green-600">Success</p>
                      <p className="text-sm text-green-600/80 mt-1">{success}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_contact_email">Contact Email</Label>
                      <Input
                        id="primary_contact_email"
                        type="email"
                        value={formData.primary_contact_email}
                        onChange={(e) => handleChange("primary_contact_email", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primary_contact_name">Contact Name</Label>
                      <Input
                        id="primary_contact_name"
                        value={formData.primary_contact_name}
                        onChange={(e) => handleChange("primary_contact_name", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing_email">Billing Email</Label>
                    <Input
                      id="billing_email"
                      type="email"
                      value={formData.billing_email}
                      onChange={(e) => handleChange("billing_email", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Plan & Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan">Plan</Label>
                      <Select
                        value={formData.plan}
                        onValueChange={(value) => handleChange("plan", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="essential">Essential</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
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
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Limits */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Limits</CardTitle>
                  <CardDescription>Configure resource limits for this organization</CardDescription>
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
                        required
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_reports_per_month">Max Reports/Month</Label>
                      <Input
                        id="max_reports_per_month"
                        type="number"
                        value={formData.max_reports_per_month}
                        onChange={(e) => handleChange("max_reports_per_month", e.target.value)}
                        required
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_storage_mb">Max Storage (MB)</Label>
                      <Input
                        id="max_storage_mb"
                        type="number"
                        value={formData.max_storage_mb}
                        onChange={(e) => handleChange("max_storage_mb", e.target.value)}
                        required
                        min="1"
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
                  <Link href={`/superadmin/organizations/${params.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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

