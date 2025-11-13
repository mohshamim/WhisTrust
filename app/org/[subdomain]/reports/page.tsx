"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { sendAdminMessage, getReportMessages } from "@/lib/services/messages";
import { downloadFile } from "@/lib/services/storage";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { getPermissions } from "@/lib/permissions";
import { ClientSidebar } from "@/components/client-sidebar";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FileText,
  Search,
  Filter,
  Eye,
  X,
  MessageSquare,
  Paperclip,
  Save,
  Download,
  File,
  Tag,
  Plus,
  Trash2,
  Calendar,
  User,
} from "lucide-react";

interface Report {
  id: string;
  case_number: string;
  tracking_code: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  is_anonymous: boolean;
  reporter_email: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  assigned_at: string | null;
  internal_notes: string | null;
}

export default function ClientReportsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at"); // created_at, priority, status
  
  // Get user permissions
  const permissions = user ? getPermissions(user.role) : null;
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editData, setEditData] = useState({
    status: "",
    priority: "",
    internal_notes: "",
    assigned_to: "",
  });
  const [saving, setSaving] = useState(false);
  
  // Messaging state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Attachments state
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  
  // Assignment state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Labels state
  const [reportLabels, setReportLabels] = useState<any[]>([]);
  const [availableLabels] = useState([
    { name: "Urgent", color: "bg-red-500" },
    { name: "Follow-up Required", color: "bg-orange-500" },
    { name: "Legal Review", color: "bg-purple-500" },
    { name: "HR Involved", color: "bg-blue-500" },
    { name: "Verified", color: "bg-green-500" },
    { name: "Duplicate", color: "bg-gray-500" },
    { name: "Escalated", color: "bg-pink-500" },
    { name: "External Audit", color: "bg-indigo-500" },
  ]);
  const [savingLabels, setSavingLabels] = useState(false);
  
  // Real-time messages
  const realtimeMessages = useRealtimeMessages({
    reportId: selectedReport?.id || null,
    enabled: !!selectedReport?.id,
  });

  // Apply status filter from URL params
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchQuery, statusFilter, priorityFilter, sortBy, reports]);

  // Load admin users when component mounts
  useEffect(() => {
    if (organization) {
      loadAdminUsers(organization.id);
    }
  }, [organization]);

  // Load messages, attachments, and labels when report is selected
  useEffect(() => {
    if (selectedReport && isDrawerOpen) {
      loadMessages(selectedReport.id);
      loadAttachments(selectedReport.id);
      loadLabels(selectedReport.id);
    }
  }, [selectedReport, isDrawerOpen]);

  // Update messages from real-time
  useEffect(() => {
    if (realtimeMessages && Array.isArray(realtimeMessages) && realtimeMessages.length > 0) {
      setMessages(realtimeMessages);
    }
  }, [realtimeMessages]);

  const checkAuth = async () => {
    try {
      const { user: clientUser, organization: org } = await getCurrentClientAdmin();
      
      if (!clientUser || !org || org.subdomain !== subdomain) {
        router.push(`/org/${subdomain}/login`);
        return;
      }

      setUser(clientUser);
      setOrganization(org);
      
      await loadReports(org.id);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (organizationId: string) => {
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load reports:", error);
        return;
      }

      setReports(data || []);
      setFilteredReports(data || []);
    } catch (error) {
      console.error("Load reports error:", error);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(r => r.priority === priorityFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        case "status":
          return a.status.localeCompare(b.status);
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredReports(filtered);
  };

  const handleSaveReport = async () => {
    if (!selectedReport) return;

    setSaving(true);
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      // Prepare update data
      const updateData: any = {
        status: editData.status,
        priority: editData.priority,
        internal_notes: editData.internal_notes,
        updated_at: new Date().toISOString(),
      };

      // Handle assignment
      if (editData.assigned_to) {
        updateData.assigned_to = editData.assigned_to;
        // Set assigned_at only if it's a new assignment
        if (!selectedReport.assigned_to || selectedReport.assigned_to !== editData.assigned_to) {
          updateData.assigned_at = new Date().toISOString();
        }
      } else {
        updateData.assigned_to = null;
        updateData.assigned_at = null;
      }

      const { error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", selectedReport.id);

      if (error) {
        console.error("Failed to update report:", error);
        alert("Failed to update report. Please try again.");
        return;
      }

      // Update local state
      setReports(prev =>
        prev.map(r =>
          r.id === selectedReport.id
            ? { ...r, ...editData, ...updateData }
            : r
        )
      );

      setSelectedReport({
        ...selectedReport,
        ...editData,
        ...updateData,
      });

      alert("Report updated successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const loadMessages = async (reportId: string) => {
    try {
      const result = await getReportMessages(reportId);
      if (result.success && result.messages) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await sendAdminMessage(selectedReport.id, newMessage.trim(), user.id);
      setNewMessage("");
      // Messages will update via real-time subscription
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const loadAttachments = async (reportId: string) => {
    setLoadingAttachments(true);
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { data, error } = await supabase
        .from("report_attachments")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load attachments:", error);
        return;
      }

      setAttachments(data || []);
    } catch (error) {
      console.error("Load attachments error:", error);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleDownload = async (attachment: any) => {
    try {
      const result = await downloadFile(attachment.file_path);
      if (result.success && result.blob) {
        // Create download link
        const url = window.URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download file');
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const loadAdminUsers = async (organizationId: string) => {
    setLoadingUsers(true);
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { data, error } = await supabase
        .from("admin_profiles")
        .select("id, full_name, email, role")
        .eq("organization_id", organizationId)
        .order("full_name");

      if (error) {
        console.error("Failed to load admin users:", error);
        return;
      }

      setAdminUsers(data || []);
    } catch (error) {
      console.error("Load admin users error:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadLabels = async (reportId: string) => {
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { data, error } = await supabase
        .from("report_labels")
        .select("*")
        .eq("report_id", reportId);

      if (error) {
        console.error("Failed to load labels:", error);
        return;
      }

      setReportLabels(data || []);
    } catch (error) {
      console.error("Load labels error:", error);
    }
  };

  const handleAddLabel = async (labelName: string, color: string) => {
    if (!selectedReport) return;

    // Check if label already exists
    if (reportLabels.some(l => l.label_name === labelName)) {
      alert("This label is already added");
      return;
    }

    setSavingLabels(true);
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { data, error } = await supabase
        .from("report_labels")
        .insert({
          report_id: selectedReport.id,
          label_name: labelName,
          label_color: color,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to add label:", error);
        alert("Failed to add label. Please try again.");
        return;
      }

      setReportLabels([...reportLabels, data]);
    } catch (error) {
      console.error("Add label error:", error);
      alert("An error occurred while adding label.");
    } finally {
      setSavingLabels(false);
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    if (!selectedReport) return;

    setSavingLabels(true);
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { error } = await supabase
        .from("report_labels")
        .delete()
        .eq("id", labelId);

      if (error) {
        console.error("Failed to remove label:", error);
        alert("Failed to remove label. Please try again.");
        return;
      }

      setReportLabels(reportLabels.filter(l => l.id !== labelId));
    } catch (error) {
      console.error("Remove label error:", error);
      alert("An error occurred while removing label.");
    } finally {
      setSavingLabels(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      submitted: { label: "Submitted", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      under_review: { label: "Under Review", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
      investigating: { label: "Investigating", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
      resolved: { label: "Resolved", className: "bg-green-500/10 text-green-600 border-green-500/20" },
      closed: { label: "Closed", className: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
      dismissed: { label: "Dismissed", className: "bg-red-500/10 text-red-600 border-red-500/20" },
    };

    const config = statusConfig[status] || statusConfig.submitted;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { className: string }> = {
      low: { className: "bg-slate-500/10 text-slate-600" },
      medium: { className: "bg-blue-500/10 text-blue-600" },
      high: { className: "bg-amber-500/10 text-amber-600" },
      critical: { className: "bg-red-500/10 text-red-600" },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return <Badge variant="outline" className={config.className}>{priority}</Badge>;
  };

  if (loading || !organization || !user) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Reports</h1>
              <p className="text-sm text-muted-foreground">
                {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
              </p>
            </div>
            {/* Notifications */}
            {user && organization && (
              <NotificationsDropdown userId={user.id} organizationId={organization.id} />
            )}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Filters */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by case number, title, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                
                {/* Filter & Sort Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-11 sm:w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Priority Filter */}
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="h-11 sm:w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-11 sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Newest First</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || statusFilter !== "all" ? "No reports found" : "No reports yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Reports will appear here when submitted"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>All Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedReport(report);
                        setEditData({
                          status: report.status,
                          priority: report.priority,
                          internal_notes: report.internal_notes || "",
                          assigned_to: report.assigned_to || "",
                        });
                        setIsDrawerOpen(true);
                      }}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{report.case_number}</p>
                          {report.is_anonymous && (
                            <Badge variant="outline" className="text-xs">Anonymous</Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {report.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(report.created_at).toLocaleDateString()} 
                          {!report.is_anonymous && report.reporter_email && ` • ${report.reporter_email}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getPriorityBadge(report.priority)}
                        {getStatusBadge(report.status)}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                            setEditData({
                              status: report.status,
                              priority: report.priority,
                              internal_notes: report.internal_notes || "",
                              assigned_to: report.assigned_to || "",
                            });
                            setIsDrawerOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>

      {/* Case Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent 
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto p-0 animate-in slide-in-from-right-full duration-300"
        >
          {selectedReport && (
            <>
              <SheetHeader className="border-b p-6 sticky top-0 bg-background z-10 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <SheetTitle className="text-2xl flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                      <div className="p-2 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      Case Details
                    </SheetTitle>
                    <SheetDescription className="mt-2 text-base font-mono font-semibold">
                      {selectedReport.tracking_code}
                    </SheetDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedReport.status)}
                    {selectedReport.is_anonymous && (
                      <Badge variant="outline">Anonymous</Badge>
                    )}
                  </div>
                </div>
              </SheetHeader>

              <div className="p-6 space-y-6 animate-in fade-in duration-300">

                {/* Case Information */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Case Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Category
                        </p>
                        <p className="font-semibold capitalize">{selectedReport.category.replace('_', ' ')}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Created At
                        </p>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(selectedReport.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Title</p>
                      <p className="font-semibold">{selectedReport.title}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <p className="text-sm leading-relaxed">{selectedReport.description}</p>
                    </div>

                    {!selectedReport.is_anonymous && selectedReport.reporter_email && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Reporter Email</p>
                        <p className="font-semibold">{selectedReport.reporter_email}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assignment Card */}
                {permissions?.canAssignCases && (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Assignment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={editData.assigned_to || "unassigned"}
                        onValueChange={(value) =>
                          setEditData({ ...editData, assigned_to: value === "unassigned" ? "" : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select admin...">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {editData.assigned_to 
                                ? adminUsers.find(a => a.id === editData.assigned_to)?.full_name || "Assigned"
                                : "Unassigned"}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {adminUsers.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.full_name} ({admin.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )}

                {/* Priority Card */}
                {permissions?.canEditPriority && (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        Priority
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">Update Priority</p>
                      <Select
                        value={editData.priority}
                        onValueChange={(value) =>
                          setEditData({ ...editData, priority: value })
                        }
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
                    </CardContent>
                  </Card>
                )}

                {/* Internal Notes Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Internal Notes
                    </CardTitle>
                    <CardDescription>
                      These notes are only visible to administrators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Add internal notes (not visible to reporter)..."
                      value={editData.internal_notes}
                      onChange={(e) =>
                        setEditData({ ...editData, internal_notes: e.target.value })
                      }
                      className="min-h-[120px]"
                    />
                  </CardContent>
                </Card>

                {/* Messages Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Messages
                    </CardTitle>
                    <CardDescription>
                      Communication history for this case
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Messages List */}
                    <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                      {!messages || messages.length === 0 ? (
                        <div className="p-8 text-center">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground font-medium">No messages yet</p>
                          <p className="text-xs text-muted-foreground mt-1">Start a conversation with the reporter</p>
                        </div>
                      ) : (
                        <div className="space-y-3 p-4">
                          {Array.isArray(messages) && messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-4 rounded-lg ${
                                msg.sender_type === "admin"
                                  ? "bg-primary/10 ml-8 border border-primary/20"
                                  : "bg-muted mr-8"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wide">
                                  {msg.sender_type === "admin" ? "Admin" : "Reporter"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(msg.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Send Message Form */}
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        placeholder="Write a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sendingMessage}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                        {sendingMessage ? "Sending..." : "Send"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Attachments Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5 text-primary" />
                      Attachments
                    </CardTitle>
                    <CardDescription>
                      Documents and files uploaded with this report
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingAttachments ? (
                      <div className="p-8 text-center">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground mt-3">Loading attachments...</p>
                      </div>
                    ) : attachments.length === 0 ? (
                      <div className="p-8 text-center">
                        <Paperclip className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground font-medium">No attachments</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <File className="w-5 h-5 flex-shrink-0 text-primary" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{attachment.file_name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <span>{formatFileSize(attachment.file_size)}</span>
                                  <span>•</span>
                                  <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(attachment)}
                              className="flex-shrink-0"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Labels Card */}
                {permissions?.canAddLabels && (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        Labels
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Current Labels */}
                      {reportLabels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {reportLabels.map((label) => (
                            <Badge
                              key={label.id}
                              className={`${label.label_color} text-white border-0 flex items-center gap-1.5 px-3 py-1.5`}
                            >
                              {label.label_name}
                              <button
                                onClick={() => handleRemoveLabel(label.id)}
                                className="ml-1 hover:opacity-75 transition-opacity"
                                disabled={savingLabels}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Add Label Button */}
                      {availableLabels.filter(al => !reportLabels.some(rl => rl.label_name === al.name)).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {availableLabels
                            .filter(al => !reportLabels.some(rl => rl.label_name === al.name))
                            .map((label) => (
                              <Button
                                key={label.name}
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddLabel(label.name, label.color)}
                                disabled={savingLabels}
                                className="text-xs h-8"
                              >
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                {label.name}
                              </Button>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          All labels have been added
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* Bottom Status Update Bar */}
              <div className="border-t p-6 sticky bottom-0 bg-background shadow-[0_-4px_6px_-1px_rgb(0_0_0_/0.1)]">
                <div className="flex items-center gap-3">
                  {permissions?.canEditStatus && (
                    <>
                      <Select
                        value={editData.status}
                        onValueChange={(value) =>
                          setEditData({ ...editData, status: value })
                        }
                      >
                        <SelectTrigger className="w-[200px]">
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
                      <Button
                        onClick={handleSaveReport}
                        disabled={saving}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => setIsDrawerOpen(false)}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}

