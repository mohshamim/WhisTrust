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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Mail,
  Shield,
  ArrowLeft,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  organization_id: string;
  case_number: string;
  tracking_code: string;
  category: string;
  title: string;
  description: string;
  reporter_email: string | null;
  status: string;
  priority: string;
  is_anonymous: boolean;
  assigned_to: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  const reportId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    status: "",
    priority: "",
    internal_notes: "",
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
      
      await loadReport(org.id);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (organizationId: string) => {
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .eq("organization_id", organizationId)
        .single();

      if (error) {
        console.error("Failed to load report:", error);
        toast.error("Failed to load report");
        router.push(`/org/${subdomain}/reports`);
        return;
      }

      setReport(data);
      setEditData({
        status: data.status,
        priority: data.priority,
        internal_notes: data.internal_notes || "",
      });
    } catch (error) {
      console.error("Load report error:", error);
      toast.error("Failed to load report");
    }
  };

  const handleSave = async () => {
    if (!report) return;
    
    setSaving(true);
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { error } = await supabase
        .from("reports")
        .update({
          status: editData.status,
          priority: editData.priority,
          internal_notes: editData.internal_notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) {
        throw error;
      }

      // Log audit event
      await supabase.from("audit_logs").insert({
        organization_id: organization.id,
        user_id: user.id,
        user_email: user.email,
        action: "report_updated",
        resource_type: "report",
        resource_id: reportId,
        old_values: {
          status: report.status,
          priority: report.priority,
        },
        new_values: {
          status: editData.status,
          priority: editData.priority,
        },
      });

      toast.success("Report updated successfully");
      
      // Reload report
      await loadReport(organization.id);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Failed to update report");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !organization || !user || !report) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'under_review':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'investigating':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'dismissed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/org/${subdomain}/reports`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid gap-4">
            {/* Report Header */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl">Case {report.case_number}</CardTitle>
                      {report.is_anonymous && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Anonymous
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{report.title}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Report Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">Report Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{report.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  {!report.is_anonymous && report.reporter_email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Reporter Email</p>
                        <p className="font-medium">{report.reporter_email}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tracking Code</p>
                    <p className="font-mono font-medium">{report.tracking_code}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium">{new Date(report.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(report.updated_at).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Full Report Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{report.description}</p>
              </CardContent>
            </Card>

            {/* Update Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Update Report Status</CardTitle>
                <CardDescription>Change status, priority, or add resolution notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editData.status}
                      onValueChange={(value) => setEditData({ ...editData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={editData.priority}
                      onValueChange={(value) => setEditData({ ...editData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea
                    placeholder="Add internal notes about the investigation, actions taken, or resolution..."
                    value={editData.internal_notes}
                    onChange={(e) => setEditData({ ...editData, internal_notes: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    These notes are internal only and not visible to the reporter
                  </p>
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

