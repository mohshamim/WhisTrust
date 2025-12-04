"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSidebar } from "@/components/client-sidebar";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Search, 
  Download, 
  FileText, 
  Loader2, 
  Sparkles,
  Filter,
  X,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/services/avatar";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { exportToPDF, exportToExcel } from "@/lib/services/smart-search-export";

interface SearchResult {
  id: string;
  case_number: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority?: string;
  created_at: string;
  risk_prediction?: Array<{
    risk_level: string;
  }>;
}

export default function SmartSearchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const urlQuery = searchParams.get("q");
  
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [query, setQuery] = useState(urlQuery || "");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const hasAutoSearched = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Example queries for suggestions
  const exampleQueries = [
    "Find harassment cases from last month",
    "Show critical risk cases",
    "Cases reported in Q4",
    "Open fraud investigations",
    "High priority safety concerns",
  ];

  useEffect(() => {
    // Set timeout for loading
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setLoadError(true);
      toast.error("Loading timeout. Please check your connection and retry.");
    }, 15000); // 15 seconds
    
    loadUserAndOrganization();
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Auto-search when URL query parameter is present
  useEffect(() => {
    if (urlQuery && organization && !searching && !hasAutoSearched.current) {
      hasAutoSearched.current = true;
      handleSearch();
    }
  }, [urlQuery, organization]);

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
      // Clear timeout when loading ends (success or error)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  }

  async function handleSearch() {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setSearching(true);
      setShowFilters(false);

      // Step 1: Parse natural language with AI
      const parseResponse = await fetch("/api/ai/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const parseResult = await parseResponse.json();
      
      if (!parseResult.success) {
        throw new Error(parseResult.error || "Could not understand query");
      }

      setFilters(parseResult.filters);
      setShowFilters(true);

      // Step 2: Build Supabase query
      const supabase = createClient();
      
      // Try to load with risk predictions
      let queryBuilder = supabase
        .from("reports")
        .select(`
          id,
          case_number,
          title,
          description,
          category,
          status,
          priority,
          created_at,
          risk_prediction:case_risk_predictions(risk_level)
        `)
        .eq("organization_id", organization.id);

      // Apply filters
      if (parseResult.filters.category) {
        queryBuilder = queryBuilder.eq("category", parseResult.filters.category);
      }
      if (parseResult.filters.status) {
        queryBuilder = queryBuilder.eq("status", parseResult.filters.status);
      }
      if (parseResult.filters.date_from) {
        queryBuilder = queryBuilder.gte("created_at", parseResult.filters.date_from);
      }
      if (parseResult.filters.date_to) {
        queryBuilder = queryBuilder.lte("created_at", parseResult.filters.date_to);
      }
      if (parseResult.filters.search_text) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${parseResult.filters.search_text}%,description.ilike.%${parseResult.filters.search_text}%`
        );
      }

      queryBuilder = queryBuilder.order("created_at", { ascending: false }).limit(100);

      let { data, error } = await queryBuilder;

      // If the risk_predictions table doesn't exist, retry without it
      if (error && error.message?.includes("does not exist")) {
        console.warn("case_risk_predictions table not found, searching without risk data");
        
        let fallbackQuery = supabase
          .from("reports")
          .select(`
            id,
            case_number,
            title,
            description,
            category,
            status,
            priority,
            created_at
          `)
          .eq("organization_id", organization.id);

        // Reapply filters
        if (parseResult.filters.category) {
          fallbackQuery = fallbackQuery.eq("category", parseResult.filters.category);
        }
        if (parseResult.filters.status) {
          fallbackQuery = fallbackQuery.eq("status", parseResult.filters.status);
        }
        if (parseResult.filters.date_from) {
          fallbackQuery = fallbackQuery.gte("created_at", parseResult.filters.date_from);
        }
        if (parseResult.filters.date_to) {
          fallbackQuery = fallbackQuery.lte("created_at", parseResult.filters.date_to);
        }
        if (parseResult.filters.search_text) {
          fallbackQuery = fallbackQuery.or(
            `title.ilike.%${parseResult.filters.search_text}%,description.ilike.%${parseResult.filters.search_text}%`
          );
        }

        fallbackQuery = fallbackQuery.order("created_at", { ascending: false }).limit(100);

        const result = await fallbackQuery;
        
        // Add empty risk_prediction field to match expected structure
        data = result.data?.map((item: any) => ({
          ...item,
          risk_prediction: []
        })) || null;
        error = result.error;
      }

      if (error) throw error;

      setResults(data || []);
      toast.success(`Found ${data?.length || 0} cases`);
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.message || "Search failed. Please try again.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleExampleClick(exampleQuery: string) {
    setQuery(exampleQuery);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setFilters(null);
    setShowFilters(false);
  }

  function handleExportPDF() {
    const result = exportToPDF(results, query);
    if (result.success) {
      toast.success("PDF exported successfully!");
    } else {
      toast.error("Failed to export PDF");
    }
  }

  function handleExportExcel() {
    const result = exportToExcel(results, query);
    if (result.success) {
      toast.success("Excel exported successfully!");
    } else {
      toast.error("Failed to export Excel");
    }
  }

  function getRiskBadge(riskLevel?: string) {
    if (!riskLevel) return null;
    
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };

    return (
      <Badge variant="outline" className={colors[riskLevel] || ""}>
        {riskLevel.toUpperCase()}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading Smart Search...</p>
        </div>
      </div>
    );
  }

  if (loadError || !user || !organization) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <X className="h-5 w-5" />
              Failed to Load
            </CardTitle>
            <CardDescription>
              Unable to load Smart Search. This could be due to a network issue or authentication problem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Please check:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your internet connection</li>
                <li>Browser is not in offline mode</li>
                <li>You are logged in</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <a href={`/org/${subdomain}/dashboard`}>
                  Go to Dashboard
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
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Smart Search</h1>
              <p className="text-muted-foreground mt-1">
                Search cases using natural language - just ask what you're looking for
              </p>
            </div>
          </div>

            {/* Search Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Search
                </CardTitle>
                <CardDescription>
                  Try asking: "Find harassment cases from last month" or "Show critical risk cases"
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Input */}
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder='Example: "Find harassment cases from last month"'
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={searching}>
                    {searching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                  {(results.length > 0 || filters) && (
                    <Button variant="outline" onClick={clearSearch}>
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Example Queries */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Try:</span>
                  {exampleQueries.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example)}
                      className="text-xs"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Applied Filters */}
            {showFilters && filters && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Filter className="h-4 w-4" />
                    Applied Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => 
                      value ? (
                        <Badge key={key} variant="secondary">
                          {key.replace(/_/g, " ")}: {String(value)}
                        </Badge>
                      ) : null
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Search Results</CardTitle>
                    <CardDescription>
                      {results.length > 0
                        ? `Found ${results.length} case${results.length !== 1 ? "s" : ""}`
                        : "No results yet. Try a search above."}
                    </CardDescription>
                  </div>
                  {results.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleExportPDF}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportExcel}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-12 w-12 text-muted-foreground opacity-50" />
                              <p className="text-muted-foreground">
                                {searching
                                  ? "Searching..."
                                  : "No results found. Try a search above."}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        results.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.case_number}
                            </TableCell>
                            <TableCell className="max-w-md truncate">
                              {item.title}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {getRiskBadge(item.risk_prediction?.[0]?.risk_level)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
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
    </SidebarProvider>
  );
}

