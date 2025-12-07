"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSidebar } from "@/components/client-sidebar";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Shield, 
  Search, 
  RefreshCw, 
  Eye,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  X,
  ArrowLeft,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/services/avatar";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { AIUsageBadge } from "@/components/ai-usage-badge";
import { format } from "date-fns";

interface CaseWithRiskPrediction {
  id: string;
  case_number: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  risk_prediction?: {
    id: string;
    overall_score: number;
    risk_level: string;
    confidence_score: number;
    keyword_score: number;
    category_score: number;
    attachment_score: number;
    description_score: number;
    ai_analysis_score: number;
    ai_sentiment: string;
    ai_urgency_level: string;
    ai_reasoning: string;
    detected_keywords: string[];
    risk_factors: string[];
    recommended_priority: string;
    recommended_actions: string[];
    created_at: string;
    updated_at: string;
  } | null;
}

export default function RiskPredictorPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [cases, setCases] = useState<CaseWithRiskPrediction[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseWithRiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseWithRiskPrediction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Stats
  const stats = {
    total: cases.length,
    critical: cases.filter(c => c.risk_prediction?.risk_level === "critical").length,
    high: cases.filter(c => c.risk_prediction?.risk_level === "high").length,
    medium: cases.filter(c => c.risk_prediction?.risk_level === "medium").length,
    low: cases.filter(c => c.risk_prediction?.risk_level === "low").length,
    unscored: cases.filter(c => !c.risk_prediction).length,
  };

  useEffect(() => {
    // Set timeout BEFORE starting load
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setLoadError(true);
      toast.error("Loading timeout. Please check your connection.");
    }, 15000);
    
    loadUserAndOrganization();
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (organization) {
      loadCases();
      loadUsage();
    }
  }, [organization]);

  // Load usage for demo organization
  async function loadUsage() {
    if (subdomain !== 'demo') return;
    
    try {
      const response = await fetch(`/api/ai/usage?subdomain=${subdomain}&feature=risk_predictor`);
      const data = await response.json();
      setUsage({
        used: data.used,
        limit: data.limit,
        remaining: data.remaining
      });
    } catch (error) {
      console.error("Error loading usage:", error);
    }
  }

  useEffect(() => {
    filterCases();
  }, [cases, selectedFilter, searchQuery]);

  async function loadUserAndOrganization() {
    try {
      const result = await getCurrentClientAdmin();
      if (result && result.user && result.organization) {
        setUser(result.user);
        setOrganization(result.organization);
        setLoadError(false);
        // Clear timeout on success
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      } else {
        setLoadError(true);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setLoadError(true);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
      // Clear timeout when loading ends
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  }

  async function loadCases() {
    try {
      setLoading(true);
      const supabase = createClient();

      // Try to load with risk predictions
      let { data, error } = await supabase
        .from("reports")
        .select(`
          id,
          case_number,
          title,
          category,
          status,
          created_at,
          risk_prediction:case_risk_predictions(
            id,
            overall_score,
            risk_level,
            confidence_score,
            keyword_score,
            category_score,
            attachment_score,
            description_score,
            ai_analysis_score,
            ai_sentiment,
            ai_urgency_level,
            ai_reasoning,
            detected_keywords,
            risk_factors,
            recommended_priority,
            recommended_actions,
            created_at,
            updated_at
          )
        `)
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });

      // If the risk_predictions table doesn't exist, load without it
      if (error && error.message?.includes("does not exist")) {
        console.warn("case_risk_predictions table not found, loading cases without predictions");
        const result = await supabase
          .from("reports")
          .select("id, case_number, title, category, status, created_at")
          .eq("organization_id", organization.id)
          .order("created_at", { ascending: false });
        
        // Add empty risk_prediction field to match expected structure
        data = result.data?.map(item => ({
          ...item,
          risk_prediction: []
        })) || null;
        error = result.error;
      }

      if (error) throw error;

      // Flatten the risk_prediction array to a single object
      const formattedData = (data || []).map((item: any) => ({
        ...item,
        risk_prediction: item.risk_prediction?.[0] || null,
      }));

      setCases(formattedData);
    } catch (error) {
      console.error("Error loading cases:", error);
      toast.error("Failed to load cases. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  function filterCases() {
    let filtered = [...cases];

    // Apply risk level filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "unscored") {
        filtered = filtered.filter(c => !c.risk_prediction);
      } else {
        filtered = filtered.filter(c => c.risk_prediction?.risk_level === selectedFilter);
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.case_number.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }

    setFilteredCases(filtered);
  }

  async function analyzeCase(caseId: string) {
    try {
      setAnalyzing(caseId);

      const response = await fetch("/api/ai/predict-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: caseId }),
      });

      const result = await response.json();

      if (!result.success) {
        // Check if it's a usage limit error (429 status)
        if (response.status === 429) {
          const errorMsg = result.usage 
            ? `AI usage limit reached. You've used ${result.usage.used} of ${result.usage.limit} requests today. Limit resets tomorrow.`
            : result.error || "AI usage limit reached for demo organization.";
          throw new Error(errorMsg);
        }
        throw new Error(result.error || "Analysis failed");
      }

      toast.success(result.isNew 
        ? "Risk prediction completed successfully" 
        : "Risk prediction updated successfully");

      // Reload cases to get updated prediction
      await loadCases();
      // Reload usage after successful analysis
      await loadUsage();
    } catch (error) {
      console.error("Error analyzing case:", error);
      toast.error("Failed to analyze case risk");
    } finally {
      setAnalyzing(null);
    }
  }

  async function batchAnalyze() {
    try {
      setBatchAnalyzing(true);

      // Get all unscored case IDs
      const unscoredCaseIds = cases
        .filter(c => !c.risk_prediction)
        .map(c => c.id);

      if (unscoredCaseIds.length === 0) {
        toast.info("All cases have been analyzed");
        return;
      }

      const response = await fetch("/api/ai/predict-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportIds: unscoredCaseIds }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error("Batch analysis failed");
      }

      toast.success(`Batch Analysis Complete: Successfully analyzed ${result.results.success} cases. ${result.results.failed} failed.`);

      // Reload cases
      await loadCases();
    } catch (error) {
      console.error("Error in batch analysis:", error);
      toast.error("Batch analysis failed");
    } finally {
      setBatchAnalyzing(false);
    }
  }

  function getRiskLevelBadge(level: string) {
    const configs: Record<string, { color: string; emoji: string }> = {
      critical: { color: "bg-red-100 text-red-800 border-red-200", emoji: "🔴" },
      high: { color: "bg-orange-100 text-orange-800 border-orange-200", emoji: "🟠" },
      medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", emoji: "🟡" },
      low: { color: "bg-green-100 text-green-800 border-green-200", emoji: "🟢" },
    };

    const config = configs[level] || configs.low;

    return (
      <Badge variant="outline" className={`${config.color} border`}>
        {config.emoji} {level.toUpperCase()}
      </Badge>
    );
  }

  function getPriorityBadge(priority: string) {
    const configs: Record<string, string> = {
      immediate: "bg-red-100 text-red-800",
      urgent: "bg-orange-100 text-orange-800",
      high: "bg-yellow-100 text-yellow-800",
      normal: "bg-blue-100 text-blue-800",
      low: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge variant="outline" className={configs[priority] || configs.normal}>
        {priority.toUpperCase()}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading Risk Predictor...</p>
        </div>
      </div>
    );
  }

  if (loadError || !user || !organization) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <X className="h-5 w-5" />
              Failed to Load
            </CardTitle>
            <CardDescription>
              Unable to load Risk Predictor. Please check your connection and try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <a href={`/org/${subdomain}/dashboard`}>
                  Dashboard
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
                onClick={() => window.location.href = `/org/${subdomain}/ai-powered-section`}
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
          <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Risk Predictor</h1>
                  <p className="text-muted-foreground mt-1">
                    AI-powered risk assessment and priority prediction
                  </p>
                </div>
              </div>
          </div>

          {/* AI Usage Badge (Demo only) */}
          <AIUsageBadge subdomain={subdomain} featureType="risk_predictor" />

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Cases</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">🔴 Critical</p>
                    <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">🟠 High</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">🟡 Medium</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">🟢 Low</p>
                    <p className="text-2xl font-bold text-green-600">{stats.low}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-gray-50/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">⚪ Unscored</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.unscored}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  {/* Filter Tabs */}
                  <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
                    <TabsList>
                      <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                      <TabsTrigger value="critical">Critical ({stats.critical})</TabsTrigger>
                      <TabsTrigger value="high">High ({stats.high})</TabsTrigger>
                      <TabsTrigger value="medium">Medium ({stats.medium})</TabsTrigger>
                      <TabsTrigger value="low">Low ({stats.low})</TabsTrigger>
                      <TabsTrigger value="unscored">Unscored ({stats.unscored})</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search and Batch Actions */}
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search cases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {subdomain === 'demo' && usage ? (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {usage.remaining > 0 ? (
                            <span className="text-primary font-medium">{usage.remaining}/3 left today</span>
                          ) : (
                            <span className="text-destructive font-medium">0/3 left - Limit reached</span>
                          )}
                        </span>
                      ) : null}
                      <Button
                        onClick={batchAnalyze}
                        disabled={batchAnalyzing || stats.unscored === 0 || (subdomain === 'demo' && usage && usage.remaining <= 0)}
                        className="whitespace-nowrap"
                        title={subdomain === 'demo' && usage && usage.remaining <= 0 ? "Daily limit reached (3/3 used)" : undefined}
                      >
                        {batchAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analyze All Unscored
                          </>
                        )}
                      </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cases Table */}
            <Card>
              <CardHeader>
                <CardTitle>Cases with Risk Assessment</CardTitle>
                <CardDescription>
                  {filteredCases.length} cases found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No cases found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCases.map((caseItem) => (
                          <TableRow key={caseItem.id}>
                            <TableCell className="font-medium">
                              {caseItem.case_number}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {caseItem.title}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{caseItem.category}</Badge>
                            </TableCell>
                            <TableCell>
                              {caseItem.risk_prediction ? (
                                getRiskLevelBadge(caseItem.risk_prediction.risk_level)
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                  Not Analyzed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {caseItem.risk_prediction ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {caseItem.risk_prediction.overall_score}
                                  </span>
                                  <span className="text-xs text-muted-foreground">/100</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {caseItem.risk_prediction ? (
                                getPriorityBadge(caseItem.risk_prediction.recommended_priority)
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(caseItem.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => analyzeCase(caseItem.id)}
                                  disabled={analyzing === caseItem.id || (subdomain === 'demo' && usage && usage.remaining <= 0)}
                                  title={subdomain === 'demo' && usage && usage.remaining <= 0 ? "Daily limit reached (3/3 used)" : undefined}
                                >
                                  {analyzing === caseItem.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCase(caseItem);
                                    setShowDetailModal(true);
                                  }}
                                  disabled={!caseItem.risk_prediction}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
        </div>
      </SidebarInset>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Risk Assessment Details
            </DialogTitle>
            <DialogDescription>
              {selectedCase?.case_number} - {selectedCase?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedCase?.risk_prediction && (
            <div className="space-y-6">
              {/* Overall Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Risk Level</p>
                      {getRiskLevelBadge(selectedCase.risk_prediction.risk_level)}
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                      <p className="text-3xl font-bold">
                        {selectedCase.risk_prediction.overall_score}
                        <span className="text-sm text-muted-foreground">/100</span>
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Confidence</p>
                      <p className="text-3xl font-bold">
                        {selectedCase.risk_prediction.confidence_score}
                        <span className="text-sm text-muted-foreground">%</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Recommended Priority</p>
                    {getPriorityBadge(selectedCase.risk_prediction.recommended_priority)}
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Keywords", score: selectedCase.risk_prediction.keyword_score, max: 30 },
                    { label: "Category", score: selectedCase.risk_prediction.category_score, max: 25 },
                    { label: "AI Analysis", score: selectedCase.risk_prediction.ai_analysis_score, max: 25 },
                    { label: "Attachments", score: selectedCase.risk_prediction.attachment_score, max: 20 },
                    { label: "Description", score: selectedCase.risk_prediction.description_score, max: 15 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.score}/{item.max}
                        </span>
                      </div>
                      <Progress value={(item.score / item.max) * 100} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sentiment</p>
                      <Badge variant="outline" className="capitalize">
                        {selectedCase.risk_prediction.ai_sentiment}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Urgency Level</p>
                      <Badge variant="outline" className="capitalize">
                        {selectedCase.risk_prediction.ai_urgency_level}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">AI Reasoning</p>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      {selectedCase.risk_prediction.ai_reasoning}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              {selectedCase.risk_prediction.risk_factors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Identified Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedCase.risk_prediction.risk_factors.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Detected Keywords */}
              {selectedCase.risk_prediction.detected_keywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detected Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.risk_prediction.detected_keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommended Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedCase.risk_prediction.recommended_actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Analyzed: {format(new Date(selectedCase.risk_prediction.created_at), "PPp")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>
                        Updated: {format(new Date(selectedCase.risk_prediction.updated_at), "PPp")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

