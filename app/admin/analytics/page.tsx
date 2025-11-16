"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { useUserRole, Permissions } from "@/hooks/use-user-role";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Clock,
  Download,
  PieChart,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const { role } = useUserRole();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    avgResolutionDays: 0,
  });
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!Permissions.canViewAnalytics(role)) return;
    loadAnalytics();
  }, [role]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      const { createServiceClient } = await import("@/lib/supabase/service-client");
      const supabase = createServiceClient();

      // Totals across all organizations
      const [{ count: totalReports }, { count: pendingReports }, { data: resolvedData }] =
        await Promise.all([
          supabase.from("reports").select("*", { count: "exact", head: true }),
          supabase
            .from("reports")
            .select("*", { count: "exact", head: true })
            .in("status", ["submitted", "under_review", "investigating"]),
          supabase
            .from("reports")
            .select("created_at, updated_at, status")
            .in("status", ["resolved", "closed"]),
        ]);

      // Avg resolution
      let avgResolutionDays = 0;
      if (resolvedData && resolvedData.length > 0) {
        const totalHours = resolvedData.reduce((sum: number, r: any) => {
          const created = new Date(r.created_at);
          const updated = new Date(r.updated_at);
          return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        }, 0);
        avgResolutionDays = Math.round(totalHours / resolvedData.length / 24);
      }

      setStats({
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
        resolvedReports: resolvedData?.length || 0,
        avgResolutionDays,
      });

      // Categories distribution
      const { data: categoriesRaw } = await supabase.from("reports").select("category");
      const counts: Record<string, number> = {};
      categoriesRaw?.forEach((r: any) => {
        counts[r.category] = (counts[r.category] || 0) + 1;
      });
      const total = categoriesRaw?.length || 0;
      const categories = Object.entries(counts)
        .map(([category, count]) => ({
          category,
          count,
          percentage: total > 0 ? Math.round((Number(count) / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
      setCategoryStats(categories);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Prepare rows
      const rows: Array<Array<string | number>> = [
        ["Metric", "Value"],
        ["Total Reports", stats.totalReports],
        ["Pending Reports", stats.pendingReports],
        ["Resolved Reports", stats.resolvedReports],
        ["Avg Resolution Days", stats.avgResolutionDays],
      ];

      categoryStats.forEach((cat) => {
        rows.push([`Category: ${cat.category}`, `${cat.count} (${cat.percentage}%)`]);
      });

      // Convert to CSV
      const csv = rows
        .map((row) =>
          row
            .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      // Trigger download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `whistrust-analytics-${new Date()
        .toISOString()
        .split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting analytics:", error);
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Insights and performance metrics
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadAnalytics}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm" aria-label="Export global analytics as CSV">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Reports
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReports}</div>
                  <p className="text-xs text-muted-foreground">
                    All time submissions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Cases
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {stats.pendingReports}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requiring attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Resolved
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.resolvedReports}
                  </div>
                  <p className="text-xs text-muted-foreground">Closed cases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Resolution
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.avgResolutionDays} days
                  </div>
                  <p className="text-xs text-muted-foreground">Time to close</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reports by Category</CardTitle>
                <CardDescription>Distribution of report types</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryStats.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center">
                    No category data available yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoryStats.map((stat) => (
                      <div key={stat.category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{stat.category}</span>
                          <span className="text-muted-foreground">
                            {stat.count} ({stat.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Trend</CardTitle>
                <CardDescription>Reports over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chart visualization placeholder</p>
                    <p className="text-xs mt-1">
                      Integration with chart library coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Detailed statistics by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryStats.map((stat, index) => (
                  <div
                    key={stat.category}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{stat.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {stat.count} reports
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{stat.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
