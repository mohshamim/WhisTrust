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
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Radio,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRealtimeReports } from "@/hooks/use-realtime-reports";
import type { Report } from "@/lib/types/database";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalReports: 0,
    openCases: 0,
    resolvedCases: 0,
    avgResolutionTime: "0 days",
  });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Realtime handlers
  const handleNewReport = (report: Report) => {
    // Update stats
    setStats((prev) => ({
      ...prev,
      totalReports: prev.totalReports + 1,
      openCases: prev.openCases + 1,
    }));

    // Add to recent cases
    setRecentCases((prev) => [
      {
        id: report.tracking_code,
        category: report.category,
        status: report.status,
        created: new Date(report.created_at).toLocaleString(),
      },
      ...prev.slice(0, 4), // Keep top 5
    ]);
  };

  const handleReportUpdate = (report: Report) => {
    // Update stats based on status changes
    setStats((prev) => {
      const newStats = { ...prev };

      if (report.status === "resolved" || report.status === "closed") {
        // Decrease open cases if report was resolved
        newStats.openCases = Math.max(0, prev.openCases - 1);
        newStats.resolvedCases = prev.resolvedCases + 1;
      }

      return newStats;
    });

    // Update in recent cases
    setRecentCases((prev) =>
      prev.map((c) =>
        c.id === report.tracking_code
          ? {
              ...c,
              status: report.status,
            }
          : c
      )
    );
  };

  // Enable realtime updates
  const { isConnected } = useRealtimeReports({
    onNewReport: handleNewReport,
    onReportUpdate: handleReportUpdate,
    enabled: !isLoading,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { getReportStats, getAllReports } = await import(
        "@/lib/services/reports"
      );

      // Get stats
      const statsResult = await getReportStats();
      if (statsResult.success && statsResult.stats) {
        setStats({
          totalReports: statsResult.stats.total,
          openCases: statsResult.stats.pending,
          resolvedCases: statsResult.stats.resolved,
          avgResolutionTime: "3.5 days", // TODO: calculate from actual data
        });
      }

      // Get recent reports
      const reportsResult = await getAllReports();
      if (reportsResult.success && reportsResult.reports) {
        setRecentCases(
          reportsResult.reports.slice(0, 5).map((report) => ({
            id: report.tracking_code,
            category: report.category,
            status: report.status,
            created: new Date(report.created_at).toLocaleString(),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">Dashboard</h1>
                  {isConnected && (
                    <Badge variant="outline" className="text-xs">
                      <Radio className="h-3 w-3 mr-1 animate-pulse" />
                      Live
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Welcome back, Compliance Manager
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
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

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Cases
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.openCases}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolvedCases}</div>
                <p className="text-xs text-muted-foreground">Closed cases</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Resolution
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.avgResolutionTime}
                </div>
                <p className="text-xs text-muted-foreground">Time to close</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Cases */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Cases</CardTitle>
                <CardDescription>Latest report submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : recentCases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cases yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCases.map((case_) => (
                      <div
                        key={case_.id}
                        className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/60 hover:shadow-sm transition-colors cursor-pointer"
                        onClick={() => (window.location.href = `/admin/cases`)}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Case {case_.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {case_.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {case_.created}
                          </span>
                          {case_.status === "pending" && (
                            <span className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              Pending
                            </span>
                          )}
                          {(case_.status === "in_review" ||
                            case_.status === "in_progress") && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                              {case_.status === "in_review"
                                ? "In Review"
                                : "In Progress"}
                            </span>
                          )}
                          {(case_.status === "resolved" ||
                            case_.status === "closed") && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
