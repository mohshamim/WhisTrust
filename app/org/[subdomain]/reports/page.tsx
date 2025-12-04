"use client";

import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { sendAdminMessage, getReportMessages } from "@/lib/services/messages";
import { downloadFile } from "@/lib/services/storage";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { getPermissions } from "@/lib/permissions";
import { ClientSidebar } from "@/components/client-sidebar";
// Notifications removed by requirement
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileSearch,
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
  Copy,
  Check,
} from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { FloatingSmartSearch } from "@/components/floating-smart-search";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { AIAttachmentAnalysis } from "@/components/ai-attachment-analysis";
import { getAvatarUrl } from "@/lib/services/avatar";
import {
  exportReportsPDF,
  exportReportsExcelProtected,
  type ReportExportRow,
} from "@/lib/services/report-exports";

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
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
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
  const [assignmentFilter, setAssignmentFilter] = useState("all"); // investigator-specific
  const [assignedUserFilter, setAssignedUserFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  
  // Get user permissions
  const permissions = user
    ? getPermissions(user.role as import("@/lib/permissions").UserRole)
    : null;
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCopied, setIsCopied] = useState(false);
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

  const FILTER_TRIGGER_CLASS =
    "h-10 min-w-[150px] rounded-full border border-border/60 bg-card/80 px-3 text-sm font-medium text-foreground/80 justify-start gap-2 hover:bg-muted/40 focus:ring-0";

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    sortBy !== "created_at" ||
    assignmentFilter !== "all" ||
    assignedUserFilter !== "all" ||
    dateRangeFilter !== "all";

  const activeFiltersCount = [
    searchQuery.trim().length > 0,
    statusFilter !== "all",
    priorityFilter !== "all",
    sortBy !== "created_at",
    assignmentFilter !== "all",
    assignedUserFilter !== "all",
    dateRangeFilter !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSortBy("created_at");
    setAssignmentFilter("all");
    setAssignedUserFilter("all");
    setDateRangeFilter("all");
  };

  const buildExportRows = (): ReportExportRow[] => {
    return filteredReports.map((report) => {
      const assigneeName = report.assigned_to
        ? adminUsers.find((a) => a.id === report.assigned_to)?.full_name ||
          adminUsers.find((a) => a.id === report.assigned_to)?.email ||
          "Unknown"
        : "Unassigned";

      return {
        caseNumber: report.case_number,
        category: report.category.replace("_", " "),
        status: report.status.replace("_", " "),
        priority: report.priority,
        assignee: assigneeName,
        createdAt: new Date(report.created_at).toLocaleString(),
      };
    });
  };

  const getFiltersLabel = () => {
    const parts: string[] = [];

    if (statusFilter !== "all") parts.push(`Status: ${statusFilter}`);
    if (priorityFilter !== "all") parts.push(`Priority: ${priorityFilter}`);
    if (assignedUserFilter !== "all") {
      parts.push(
        `Assignee: ${
          assignedUserFilter === "unassigned" ? "Unassigned" : "Selected"
        }`
      );
    }
    if (dateRangeFilter !== "all") {
      parts.push(
        `Date: ${
          dateRangeFilter === "7"
            ? "Last 7 Days"
            : dateRangeFilter === "30"
            ? "Last 30 Days"
            : "Last 90 Days"
        }`
      );
    }
    if (searchQuery) parts.push(`Search: "${searchQuery}"`);

    return parts.join(" | ");
  };

  const handleExportPdf = () => {
    if (!filteredReports.length || !organization) return;

    const rows = buildExportRows();
    exportReportsPDF(
      rows,
      organization.name,
      getFiltersLabel(),
      (organization as any)?.branding?.primary_color || null
    );
  };

  const handleExportExcel = () => {
    if (!filteredReports.length) return;
    const rows = buildExportRows();
    exportReportsExcelProtected(rows, {
      organizationName: organization?.name,
    });
  };

  const FilterSelect = ({
    value,
    onValueChange,
    icon: Icon,
    placeholder,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    icon?: ElementType;
    placeholder: string;
    children: ReactNode;
  }) => (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={FILTER_TRIGGER_CLASS}>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent sideOffset={6}>{children}</SelectContent>
    </Select>
  );

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
  }, [
    searchQuery,
    statusFilter,
    priorityFilter,
    sortBy,
    reports,
    assignmentFilter,
    assignedUserFilter,
    dateRangeFilter,
    user,
  ]);

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

    // Filter by status - support comma-separated multiple statuses
    if (statusFilter !== "all") {
      const statuses = statusFilter.split(',').map(s => s.trim());
      filtered = filtered.filter(r => statuses.includes(r.status));
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(r => r.priority === priorityFilter);
    }

    // Investigator "assigned to me" filter
    if (user?.role === "investigator") {
      if (assignmentFilter === "assigned_to_me") {
        filtered = filtered.filter(r => r.assigned_to === user.id);
      } else if (assignmentFilter === "unassigned") {
        filtered = filtered.filter(r => !r.assigned_to);
      }
    }

    // Assigned user filter (all roles)
    if (assignedUserFilter === "unassigned") {
      filtered = filtered.filter(r => !r.assigned_to);
    } else if (assignedUserFilter !== "all") {
      filtered = filtered.filter(r => r.assigned_to === assignedUserFilter);
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const days = parseInt(dateRangeFilter, 10);
      if (!isNaN(days)) {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);
        filtered = filtered.filter(
          (r) => new Date(r.created_at).getTime() >= threshold.getTime()
        );
      }
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
    if (!selectedReport || !permissions) return;

    // Build minimal update payload based on role/permissions
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // ---- STATUS (with investigator-specific rules) ----
    if (permissions.canEditStatus) {
      const currentStatus = selectedReport.status;
      const nextStatus = editData.status;

      if (user?.role === "investigator") {
        const isAssignedToMe =
          !!selectedReport.assigned_to &&
          selectedReport.assigned_to === user.id;

        if (!isAssignedToMe) {
          const { toast } = await import("sonner");
          toast.error(
            "You can only change the status for cases that are assigned to you."
          );
          return;
        }

        const allowedTransitions: Record<string, string[]> = {
          // Investigator lifecycle (PO guidance)
          submitted: ["under_review", "investigating"],
          under_review: ["investigating", "resolved"],
          investigating: ["under_review", "resolved"],
        };

        const allowedNext = allowedTransitions[currentStatus] || [];
        if (!allowedNext.includes(nextStatus)) {
          const { toast } = await import("sonner");
          toast.error(
            `You can't change the status from "${currentStatus.replace(
              "_",
              " "
            )}" to "${nextStatus.replace("_", " ")}".`
          );
          return;
        }
      }

      updateData.status = nextStatus;
    }

    // ---- PRIORITY (admin/manager only) ----
    if (permissions.canEditPriority) {
      updateData.priority = editData.priority;
    }

    // ---- ASSIGNMENT (admin/manager only) ----
    if (permissions.canAssignCases) {
      if (editData.assigned_to) {
        updateData.assigned_to = editData.assigned_to;
        if (
          !selectedReport.assigned_to ||
          selectedReport.assigned_to !== editData.assigned_to
        ) {
          updateData.assigned_at = new Date().toISOString();
        }
      } else {
        updateData.assigned_to = null;
        updateData.assigned_at = null;
      }
    }

    // ---- INTERNAL NOTES (always editable for case handlers) ----
    updateData.internal_notes = editData.internal_notes;

    setSaving(true);
    try {
      const { createMultiTenantClient } = await import(
        "@/lib/supabase/multi-tenant-client"
      );
      const supabase = createMultiTenantClient();

      const { error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", selectedReport.id);

      if (error) {
        console.error("Failed to update report:", error);
        const { toast } = await import("sonner");
        toast.error("Failed to update report. Please try again.");
        return;
      }

      // Update local state
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id ? { ...r, ...updateData } : r
        )
      );

      setSelectedReport({
        ...selectedReport,
        ...updateData,
      });

      const { toast } = await import("sonner");
      toast.success("Report updated successfully");
    } catch (error) {
      console.error("Save error:", error);
      const { toast } = await import("sonner");
      toast.error("An error occurred while saving");
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
      // Notifications disabled by requirement
      setNewMessage("");
      // Messages will update via real-time subscription
    } catch (error) {
      console.error("Failed to send message:", error);
      const { toast } = await import("sonner");
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const loadAttachments = async (reportId: string) => {
    setLoadingAttachments(true);
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      // First, load attachments
      const { data, error } = await supabase
        .from("report_attachments")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load attachments:", error);
        return;
      }

      // Try to load AI summaries (if table exists)
      if (data && data.length > 0) {
        try {
          const { data: aiSummaries } = await supabase
            .from("report_attachments_ai_summary")
            .select("*")
            .in("attachment_id", data.map(a => a.id));

          // Attach AI summaries to attachments
          const attachmentsWithAI = data.map(attachment => ({
            ...attachment,
            ai_summary: aiSummaries?.find(ai => ai.attachment_id === attachment.id) || null,
          }));

          setAttachments(attachmentsWithAI);
        } catch (aiError) {
          // AI table might not exist yet, that's okay
          console.log("AI summaries not available (table may not exist yet)");
          setAttachments(data);
        }
      } else {
        setAttachments(data || []);
      }
    } catch (error) {
      console.error("Load attachments error:", error);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const copyTrackingCode = async () => {
    if (selectedReport?.tracking_code) {
      try {
        await navigator.clipboard.writeText(selectedReport.tracking_code);
        setIsCopied(true);
        toast.success("Tracking code copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy tracking code");
      }
    }
  };

  const handleDownload = async (attachment: any) => {
    try {
      const response = await fetch('/api/reports/download-attachment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: attachment.file_path,
          fileName: attachment.file_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Get the file blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file. Please try again.");
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
      const { toast } = await import("sonner");
      toast.info("This label is already added");
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
        const { toast } = await import("sonner");
        toast.error("Failed to add label. Please try again.");
        return;
      }

      setReportLabels([...reportLabels, data]);
    } catch (error) {
      console.error("Add label error:", error);
      const { toast } = await import("sonner");
      toast.error("An error occurred while adding label.");
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
        const { toast } = await import("sonner");
        toast.error("Failed to remove label. Please try again.");
        return;
      }

      setReportLabels(reportLabels.filter(l => l.id !== labelId));
    } catch (error) {
      console.error("Remove label error:", error);
      const { toast } = await import("sonner");
      toast.error("An error occurred while removing label.");
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
    <TooltipProvider>
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || 'User',
          email: user.email,
          avatar: getAvatarUrl({ avatar_url: user.avatar_url, email: user.email }),
        }}
        organization={{
          name: organization.name,
          subdomain: subdomain,
        }}
        userRole={user.role}
      />
      <SidebarInset>
        <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <FileSearch className="h-6 w-6 text-primary" />
                  Reports
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
          <div className="flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8">
          {/* Demo Mode Banner */}
          {subdomain === 'demo' && (
            <DemoModeBanner organizationName={organization?.name} />
          )}
          
          {/* Filters */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="space-y-5 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by case number, title, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-full border border-border/60 bg-card/80 pl-11 pr-4 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  {hasActiveFilters ? (
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                      {activeFiltersCount} active filter{activeFiltersCount > 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground">No filters applied</p>
                  )}
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="rounded-full">
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <FilterSelect
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  icon={Filter}
                  placeholder="All Status"
                >
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </FilterSelect>

                <FilterSelect
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                  icon={Filter}
                  placeholder="All Priority"
                >
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </FilterSelect>

                <FilterSelect
                  value={sortBy}
                  onValueChange={setSortBy}
                  placeholder="Sort order"
                >
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </FilterSelect>

                {user?.role === "investigator" && (
                  <FilterSelect
                    value={assignmentFilter}
                    onValueChange={setAssignmentFilter}
                    icon={User}
                    placeholder="Assignment"
                  >
                    <SelectItem value="all">All Cases</SelectItem>
                    <SelectItem value="assigned_to_me">Assigned to Me</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </FilterSelect>
                )}

                <FilterSelect
                  value={assignedUserFilter}
                  onValueChange={setAssignedUserFilter}
                  icon={User}
                  placeholder="All Assignees"
                >
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {adminUsers.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.full_name || admin.email}
                    </SelectItem>
                  ))}
                </FilterSelect>

                <FilterSelect
                  value={dateRangeFilter}
                  onValueChange={setDateRangeFilter}
                  icon={Calendar}
                  placeholder="All Dates"
                >
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </FilterSelect>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>All Reports</CardTitle>
                  <CardDescription>
                    {filteredReports.length} report
                    {filteredReports.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <HelpTooltip text="Filter and export cases across your organization. This view is tenant-scoped and respects role permissions." />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPdf}
                    disabled={filteredReports.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportExcel}
                    disabled={filteredReports.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileSearch className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No reports have been submitted yet"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case Number</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="whitespace-nowrap">
                        Priority{" "}
                        <HelpTooltip text="Use priority to highlight critical and high-risk cases for faster handling." />
                      </TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-muted/50"
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
                        <TableCell className="font-semibold">
                          {report.case_number}
                          {report.is_anonymous && (
                            <Badge variant="outline" className="ml-2 text-xs">Anonymous</Badge>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{report.category.replace('_', ' ')}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                        <TableCell>
                          {report.assigned_to ? (
                            adminUsers.find((a) => a.id === report.assigned_to)?.full_name ||
                            adminUsers.find((a) => a.id === report.assigned_to)?.email ||
                            "Unknown"
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
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
                            aria-label="View report details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
        </div>
        </div>

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
                        <FileSearch className="h-6 w-6 text-primary" />
                      </div>
                      Case Details
                    </SheetTitle>
                  <SheetDescription className="mt-2 flex items-center gap-2">
                    <span className="text-base font-mono font-semibold">
                      {selectedReport.tracking_code}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-muted"
                          onClick={copyTrackingCode}
                          aria-label="Copy tracking code"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isCopied ? "Copied!" : "Copy tracking code"}</p>
                      </TooltipContent>
                    </Tooltip>
                    </SheetDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedReport.status)}
                    {selectedReport.is_anonymous && (
                      <Badge variant="outline">Anonymous</Badge>
                    )}
                    {/* Close Icon */}
                    <button
                      type="button"
                      aria-label="Close details"
                      className="h-8 w-8 rounded-full inline-flex items-center justify-center hover:bg-muted transition-colors border"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </SheetHeader>

              <div className="p-6 space-y-6 pb-32 animate-in fade-in duration-300">

                {/* Case Information */}
                <Card className="hover:shadow-md transition-shadow card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSearch className="h-5 w-5 text-primary" />
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
                      <p className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        Title
                        <HelpTooltip text="Summarize the core of the case in a short sentence so it’s easy to scan in lists and reports." />
                      </p>
                      <p className="font-semibold">{selectedReport.title}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        Description
                        <HelpTooltip text="Use clear, factual language. Avoid personal identifiers unless necessary for the investigation." />
                      </p>
                      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {selectedReport.description}
                      </p>
                    </div>

                    {/* Reporter Information - Show if any contact info provided */}
                    {(selectedReport.reporter_name || selectedReport.reporter_email || selectedReport.reporter_phone) && (
                      <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Reporter Contact Information (Optional)
                          </p>
                        </div>
                        <div className="grid gap-2">
                          {selectedReport.reporter_name && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground min-w-[60px]">Name:</span>
                              <span className="font-medium">{selectedReport.reporter_name}</span>
                            </div>
                          )}
                          {selectedReport.reporter_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground min-w-[60px]">Email:</span>
                              <a 
                                href={`mailto:${selectedReport.reporter_email}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {selectedReport.reporter_email}
                              </a>
                            </div>
                          )}
                          {selectedReport.reporter_phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground min-w-[60px]">Phone:</span>
                              <a 
                                href={`tel:${selectedReport.reporter_phone}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {selectedReport.reporter_phone}
                              </a>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 italic">
                          Reporter voluntarily provided this information for follow-up
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assignment Card */}
                {permissions?.canAssignCases && (
                  <Card className="hover:shadow-md transition-shadow card-enhanced">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Assignment
                        <HelpTooltip text="Assign each case to a specific owner to avoid gaps. Unassigned cases can easily be missed in busy teams." />
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
                  <Card className="hover:shadow-md transition-shadow card-enhanced">
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
                <Card className="hover:shadow-md transition-shadow card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSearch className="h-5 w-5 text-primary" />
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
                <Card className="hover:shadow-md transition-shadow card-enhanced">
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
                    <div className="border rounded-lg max-h-[300px] overflow-y-auto scrollbar-thin">
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
                                  ? "bg-primary/10 ml-8 border border-primary/20 shadow-xs"
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
                      <div className="space-y-4">
                        {attachments.map((attachment) => (
                          <div key={attachment.id} className="space-y-3">
                            {/* Attachment File Info */}
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all hover:shadow-sm">
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
                            
                            {/* AI Analysis Component */}
                            {user && organization && (
                              <AIAttachmentAnalysis
                                attachmentId={attachment.id}
                                organizationId={organization.id}
                                userId={user.id}
                                fileName={attachment.file_name}
                                existingAnalysis={attachment.ai_summary || null}
                              />
                            )}
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
              <div className="border-t p-6 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-[0_-4px_12px_hsl(0_0%_0%_/0.06)]">
                <div className="flex items-center gap-3">
                  {permissions?.canEditStatus && (
                    <>
                      <Select
                        value={editData.status}
                        onValueChange={(value) =>
                          setEditData({ ...editData, status: value })
                        }
                      >
                        <SelectTrigger className="flex-1 h-12 rounded-lg bg-card border-2 border-border px-4 text-sm shadow-sm hover:border-primary/60 focus-visible:ring-4 focus-visible:ring-ring/30 transition-all">
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
                        variant="default"
                        onClick={handleSaveReport}
                        disabled={saving || editData.status === selectedReport.status}
                        className="min-w-[160px] h-12 rounded-lg shadow-sm hover:shadow-md"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Update Status"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      </SidebarInset>
      
      {/* Floating Smart Search Button */}
      <FloatingSmartSearch
        subdomain={subdomain}
        organizationId={organization?.id || ""}
        position="bottom-right"
      />
    </SidebarProvider>
    </TooltipProvider>
  );
}

