"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientSidebar } from "@/components/client-sidebar";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { getAvatarUrl } from "@/lib/services/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sparkles,
  FileText,
  Search,
  RefreshCw,
  Eye,
  Play,
  CheckCircle2,
  Clock,
  XCircle,
  FileImage,
  FileCode,
  AlertTriangle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AttachmentWithCase {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  report_id: string;
  case_number: string;
  case_title: string;
  ai_summary?: {
    id: string;
    summary: string;
    risk_level: string;
    suggested_category: string;
    status: string;
    created_at: string;
    extracted_text?: string;
  } | null;
}

type FilterStatus = "all" | "analyzed" | "pending" | "failed";

export default function AttachmentAnalyzerPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<AttachmentWithCase[]>([]);
  const [filteredAttachments, setFilteredAttachments] = useState<AttachmentWithCase[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentWithCase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user: currentUser, organization: currentOrg } = await getCurrentClientAdmin();
        if (!currentUser || !currentOrg) {
          router.push(`/org/${subdomain}/login`);
          return;
        }
        setUser(currentUser);
        setOrganization(currentOrg);
        await loadAttachments(currentOrg.id);
      } catch (error) {
        console.error("Failed to load data:", error);
        router.push(`/org/${subdomain}/login`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subdomain, router]);

  const loadAttachments = async (organizationId: string) => {
    try {
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      // Load all attachments with their report info and AI analysis status
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from("report_attachments")
        .select(`
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          created_at,
          report_id,
          reports!inner (
            id,
            case_number,
            title,
            organization_id
          )
        `)
        .eq("reports.organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (attachmentsError) {
        console.error("Failed to load attachments:", attachmentsError);
        return;
      }

      // Load AI summaries separately
      const attachmentIds = (attachmentsData || []).map((a: any) => a.id);
      const { data: summariesData } = await supabase
        .from("report_attachments_ai_summary")
        .select("*")
        .in("attachment_id", attachmentIds);

      // Merge data
      const merged = (attachmentsData || []).map((att: any) => ({
        ...att,
        case_number: att.reports?.case_number,
        case_title: att.reports?.title,
        ai_summary: summariesData?.find((s: any) => s.attachment_id === att.id) || null,
      }));

      setAttachments(merged);
      setFilteredAttachments(merged);
    } catch (error) {
      console.error("Load attachments error:", error);
    }
  };

  useEffect(() => {
    let filtered = attachments;

    // Apply status filter
    if (filterStatus === "analyzed") {
      filtered = filtered.filter(a => a.ai_summary?.status === "completed");
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(a => !a.ai_summary);
    } else if (filterStatus === "failed") {
      filtered = filtered.filter(a => a.ai_summary?.status === "failed");
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.case_number?.toLowerCase().includes(query) ||
          a.file_name.toLowerCase().includes(query) ||
          a.case_title?.toLowerCase().includes(query)
      );
    }

    setFilteredAttachments(filtered);
  }, [filterStatus, searchQuery, attachments]);

  const handleAnalyze = async (attachment: AttachmentWithCase) => {
    setAnalyzingIds(prev => new Set(prev).add(attachment.id));
    try {
      const response = await fetch("/api/ai/analyze-attachment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attachmentId: attachment.id,
          organizationId: organization.id,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      toast.success("Analysis completed!");
      
      // Reload attachments to get updated status
      await loadAttachments(organization.id);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze attachment");
    } finally {
      setAnalyzingIds(prev => {
        const updated = new Set(prev);
        updated.delete(attachment.id);
        return updated;
      });
    }
  };

  const handleViewResults = (attachment: AttachmentWithCase) => {
    setSelectedAttachment(attachment);
    setIsModalOpen(true);
  };

  const handleBatchAnalyze = async () => {
    const pendingAttachments = attachments.filter(a => !a.ai_summary);
    
    if (pendingAttachments.length === 0) {
      toast.info("No pending attachments to analyze");
      return;
    }

    toast.info(`Starting analysis of ${pendingAttachments.length} attachments...`);
    
    let successCount = 0;
    let failCount = 0;

    for (const attachment of pendingAttachments) {
      try {
        await handleAnalyze(attachment);
        successCount++;
      } catch (error) {
        failCount++;
      }
    }

    toast.success(`Batch complete! ${successCount} analyzed, ${failCount} failed`);
  };

  const getStatusBadge = (attachment: AttachmentWithCase) => {
    if (analyzingIds.has(attachment.id)) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Analyzing
        </Badge>
      );
    }

    if (!attachment.ai_summary) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }

    if (attachment.ai_summary.status === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Analyzed
        </Badge>
      );
    }

    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'pdf') return <FileText className="h-4 w-4 text-red-600" />;
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) {
      return <FileImage className="h-4 w-4 text-blue-600" />;
    }
    return <FileCode className="h-4 w-4 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pendingCount = attachments.filter(a => !a.ai_summary).length;
  const analyzedCount = attachments.filter(a => a.ai_summary?.status === "completed").length;
  const failedCount = attachments.filter(a => a.ai_summary?.status === "failed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !organization) {
    return null;
  }

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || user.email,
          email: user.email,
          avatar: getAvatarUrl({ avatar_url: user.avatar_url, email: user.email, avatar_style: user.avatar_style }),
        }}
        organization={{
          name: organization.name,
          subdomain: organization.subdomain,
        }}
        userRole={user.role || "admin"}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/org/${subdomain}/ai-powered-section`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to AI Powered Section
              </Button>
            </div>
            <NotificationsDropdown 
              userId={user?.id || ""} 
              organizationId={organization?.id || ""} 
            />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Attachment Analyzer</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered analysis of all report attachments
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Files</p>
                    <p className="text-2xl font-bold">{attachments.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Analyzed</p>
                    <p className="text-2xl font-bold text-green-600">{analyzedCount}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-gray-600">{pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-600/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    All ({attachments.length})
                  </Button>
                  <Button
                    variant={filterStatus === "analyzed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("analyzed")}
                    className={filterStatus === "analyzed" ? "" : "text-green-600"}
                  >
                    Analyzed ({analyzedCount})
                  </Button>
                  <Button
                    variant={filterStatus === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("pending")}
                    className={filterStatus === "pending" ? "" : "text-gray-600"}
                  >
                    Pending ({pendingCount})
                  </Button>
                  <Button
                    variant={filterStatus === "failed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("failed")}
                    className={filterStatus === "failed" ? "" : "text-red-600"}
                  >
                    Failed ({failedCount})
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 md:flex-initial md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by case or filename..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {pendingCount > 0 && (
                    <Button
                      onClick={handleBatchAnalyze}
                      variant="outline"
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Analyze All Pending ({pendingCount})
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAttachments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No attachments match your search" : "No attachments found"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttachments.map((attachment) => (
                      <TableRow key={attachment.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{attachment.case_number}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {attachment.case_title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(attachment.file_name)}
                            <span className="truncate max-w-[200px]">{attachment.file_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs uppercase">
                            {attachment.file_name.split('.').pop()}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatFileSize(attachment.file_size)}
                        </TableCell>
                        <TableCell>{getStatusBadge(attachment)}</TableCell>
                        <TableCell>
                          {attachment.ai_summary?.risk_level ? (
                            <Badge
                              variant="outline"
                              className={
                                attachment.ai_summary.risk_level === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : attachment.ai_summary.risk_level === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : attachment.ai_summary.risk_level === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {attachment.ai_summary.risk_level === "critical" && (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {attachment.ai_summary.risk_level}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {attachment.ai_summary?.status === "completed" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewResults(attachment)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleAnalyze(attachment)}
                                  disabled={analyzingIds.has(attachment.id)}
                                  title="Re-analyze this attachment with AI"
                                >
                                  <RefreshCw
                                    className={`h-3 w-3 ${
                                      analyzingIds.has(attachment.id) ? "animate-spin" : ""
                                    }`}
                                  />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleAnalyze(attachment)}
                                disabled={analyzingIds.has(attachment.id)}
                              >
                                {analyzingIds.has(attachment.id) ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3 w-3 mr-1" />
                                    Analyze
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Results Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Analysis Results
            </DialogTitle>
            <DialogDescription>
              {selectedAttachment?.file_name} • {selectedAttachment?.case_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttachment && selectedAttachment.ai_summary && (
            <div className="space-y-6 mt-4">
              {/* File Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Case Number</p>
                    <p className="font-semibold">{selectedAttachment.case_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">File Name</p>
                    <p className="font-semibold truncate">{selectedAttachment.file_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Analyzed</p>
                    <p className="font-semibold">
                      {new Date(selectedAttachment.ai_summary.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Powered by</p>
                    <p className="font-semibold">Gemini AI</p>
                  </div>
                </div>
              </div>

              {/* Risk Level and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">RISK LEVEL</p>
                  <Badge
                    className={`
                      ${selectedAttachment.ai_summary.risk_level === "critical" ? "bg-red-100 text-red-800 border-red-300" : ""}
                      ${selectedAttachment.ai_summary.risk_level === "high" ? "bg-orange-100 text-orange-800 border-orange-300" : ""}
                      ${selectedAttachment.ai_summary.risk_level === "medium" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""}
                      ${selectedAttachment.ai_summary.risk_level === "low" ? "bg-green-100 text-green-800 border-green-300" : ""}
                      border flex items-center gap-1 w-fit text-base px-3 py-1
                    `}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="capitalize">{selectedAttachment.ai_summary.risk_level}</span>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">SUGGESTED CATEGORY</p>
                  <Badge variant="outline" className="capitalize w-fit text-base px-3 py-1">
                    {selectedAttachment.ai_summary.suggested_category?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedAttachment.ai_summary.summary}
                </p>
              </div>

              {/* Key Findings */}
              {(selectedAttachment.ai_summary as any).findings && (selectedAttachment.ai_summary as any).findings.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Key Findings</h3>
                  <ul className="space-y-2">
                    {(selectedAttachment.ai_summary as any).findings.map((finding: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detected Entities */}
              {(selectedAttachment.ai_summary as any).entities && (selectedAttachment.ai_summary as any).entities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Detected Entities</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedAttachment.ai_summary as any).entities.map((entity: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <span className="capitalize">{entity.type}:</span>
                        <span className="font-semibold">{entity.value}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Text */}
              {selectedAttachment.ai_summary.extracted_text && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Extracted Text</h3>
                  <div className="p-4 bg-muted/50 rounded-lg border max-h-64 overflow-y-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {selectedAttachment.ai_summary.extracted_text}
                    </pre>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Confidence Score</p>
                    <p className="font-semibold text-lg">
                      {((selectedAttachment.ai_summary as any).confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Processing Time</p>
                    <p className="font-semibold text-lg">
                      {(selectedAttachment.ai_summary as any).processing_time_ms}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-semibold text-lg capitalize">
                      {selectedAttachment.ai_summary.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

