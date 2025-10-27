"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
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
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    avgResolutionDays: 0,
  });
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // Import analytics service
      const { getReportStatistics, getCategoryStatistics } = await import("@/lib/services/analytics");
      
      // Fetch statistics
      const statsResult = await getReportStatistics();
      const categoryResult = await getCategoryStatistics();

      if (statsResult.success && statsResult.stats) {
        setStats({
          totalReports: statsResult.stats.total_reports || 0,
          pendingReports: statsResult.stats.pending_reports || 0,
          resolvedReports: (statsResult.stats.resolved_reports || 0) + (statsResult.stats.closed_reports || 0),
          avgResolutionDays: Math.round((statsResult.stats.avg_resolution_days || 0) * 10) / 10,
        });
      }

      if (categoryResult.success && categoryResult.stats) {
        setCategoryStats(categoryResult.stats.map((cat) => ({
          category: cat.category,
          count: cat.total_count,
          percentage: cat.percentage,
        })));
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { exportAnalyticsToCSV } = await import("@/lib/services/analytics");
      
      // Prepare data for export
      const exportData = [
        { Metric: "Total Reports", Value: stats.totalReports },
        { Metric: "Pending Reports", Value: stats.pendingReports },
        { Metric: "Resolved Reports", Value: stats.resolvedReports },
        { Metric: "Avg Resolution Days", Value: stats.avgResolutionDays },
        ...categoryStats.map(cat => ({
          Metric: `Category: ${cat.category}`,
          Value: `${cat.count} (${cat.percentage}%)`
        }))
      ];

      const csvContent = await exportAnalyticsToCSV(exportData);

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `whistrust-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("Analytics data exported successfully!");
    } catch (error) {
      console.error("Error exporting analytics:", error);
      alert("Failed to export analytics data");
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
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
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
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
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
