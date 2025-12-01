"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ClientSidebar } from "@/components/client-sidebar";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  FileText,
  Target,
} from "lucide-react";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import {
  exportAnalyticsPDF,
  type AnalyticsSummary,
  type ReportsByStatus,
  type ReportsByCategory,
  type ReportsTrend,
  type ReportsByPriority,
  type CategoryMetrics,
} from "@/lib/services/analytics";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Analytics data
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byStatus, setByStatus] = useState<ReportsByStatus[]>([]);
  const [byCategory, setByCategory] = useState<ReportsByCategory[]>([]);
  const [trend, setTrend] = useState<ReportsTrend[]>([]);
  const [byPriority, setByPriority] = useState<ReportsByPriority[]>([]);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);

  // Filters
  const [dateRange, setDateRange] = useState<string>("30");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (organization?.id) {
      loadAnalytics();
    }
  }, [organization, dateRange]);

  const checkAuth = async () => {
    try {
      const { user: clientUser, organization: org } = await getCurrentClientAdmin();
      if (!clientUser || !org) {
        router.push(`/org/${subdomain}/login`);
        return;
      }
      setUser(clientUser);
      setOrganization(org);
    } catch (error) {
      console.error("Auth error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!organization?.id) return;

    setLoadingData(true);

    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: organization.id,
          dateRange,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        console.error("Analytics API error:", payload.error || response.statusText);
        setSummary(null);
        setByStatus([]);
        setByCategory([]);
        setTrend([]);
        setByPriority([]);
        setCategoryMetrics([]);
        return;
      }

      setSummary(payload.data.summary);
      setByStatus(payload.data.byStatus);
      setByCategory(payload.data.byCategory);
      setTrend(payload.data.trend);
      setByPriority(payload.data.byPriority);
      setCategoryMetrics(payload.data.categoryMetrics);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setSummary(null);
      setByStatus([]);
      setByCategory([]);
      setTrend([]);
      setByPriority([]);
      setCategoryMetrics([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleExport = () => {
    if (
      summary &&
      byStatus.length &&
      byCategory.length &&
      byPriority.length
    ) {
      exportAnalyticsPDF(
        summary,
        byStatus,
        byCategory,
        byPriority,
        categoryMetrics
      );
    }
  };

  if (isLoading || !user || !organization) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const COLORS = {
    submitted: "#3b82f6",
    under_review: "#eab308",
    investigating: "#f97316",
    resolved: "#22c55e",
    closed: "#64748b",
    dismissed: "#ef4444",
  };

  const PRIORITY_COLORS = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#64748b",
  };

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || user.email,
          email: user.email,
          avatar: user.avatar_url || "",
        }}
        organization={{
          name: organization.name,
          subdomain: organization.subdomain,
        }}
        userRole={user.role || "admin"}
      />
      <SidebarInset>
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Comprehensive insights and reporting metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <NotificationsDropdown userId={user?.id || ""} organizationId={organization?.id || ""} />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-sm text-muted-foreground">Loading analytics data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.totalReports || 0}</div>
                      <p className="text-xs text-muted-foreground">All time submissions</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.reportsThisMonth || 0}</div>
                      <p className="text-xs text-muted-foreground">New reports</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.avgResponseTimeHours || 0}h</div>
                      <p className="text-xs text-muted-foreground">Time to resolution</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.resolutionRate || 0}%</div>
                      <p className="text-xs text-muted-foreground">Cases resolved</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.criticalHighCount || 0}</div>
                      <p className="text-xs text-muted-foreground">Critical/High cases</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Reports by Status */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Reports by Status
                      </CardTitle>
                      <CardDescription>Distribution of cases by current status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {byStatus.length > 0 ? (
                        <ChartContainer config={{}} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={byStatus}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={(entry) => `${entry.status}: ${entry.percentage}%`}
                              >
                                {byStatus.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.status as keyof typeof COLORS] || "#888"}
                                  />
                                ))}
                              </Pie>
                              <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Reports by Category */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Reports by Category
                      </CardTitle>
                      <CardDescription>Most common report types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {byCategory.length > 0 ? (
                        <ChartContainer config={{}} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byCategory}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="count" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Reports Trend */}
                  <Card className="hover:shadow-md transition-shadow md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Reports Trend
                      </CardTitle>
                      <CardDescription>Daily submissions over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {trend.length > 0 ? (
                        <ChartContainer config={{}} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                          No trend data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Reports by Priority */}
                  <Card className="hover:shadow-md transition-shadow md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        Reports by Priority
                      </CardTitle>
                      <CardDescription>Case urgency distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {byPriority.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          <ChartContainer config={{}} className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={byPriority}
                                  dataKey="count"
                                  nameKey="priority"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  label
                                >
                                  {byPriority.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS] || "#888"}
                                    />
                                  ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                          <div className="flex flex-col justify-center space-y-3">
                            {byPriority.map((item) => (
                              <div key={item.priority} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS] || "#888",
                                    }}
                                  />
                                  <span className="capitalize">{item.priority}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{item.count}</span>
                                  <span className="text-sm text-muted-foreground">({item.percentage}%)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                          No priority data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Category Performance Table */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Category Performance Metrics</CardTitle>
                    <CardDescription>Detailed breakdown by report category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryMetrics.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Total Reports</TableHead>
                            <TableHead className="text-right">Avg Response Time</TableHead>
                            <TableHead className="text-right">Closure Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryMetrics.map((metric) => (
                            <TableRow key={metric.category}>
                              <TableCell className="font-medium capitalize">
                                {metric.category.replace("_", " ")}
                              </TableCell>
                              <TableCell className="text-right">{metric.total}</TableCell>
                              <TableCell className="text-right">
                                {metric.avgResponseHours > 0 ? `${metric.avgResponseHours}h` : "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={metric.closureRate >= 70 ? "default" : "secondary"}>
                                  {metric.closureRate}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex items-center justify-center py-12 text-muted-foreground">
                        No category metrics available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

