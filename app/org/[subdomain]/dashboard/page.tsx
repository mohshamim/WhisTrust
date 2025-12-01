"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { ClientSidebar } from "@/components/client-sidebar";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Users,
  Plus,
  Share2,
  UserPlus,
  ClipboardCheck,
  SlidersHorizontal,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

type TimeRange = "7d" | "30d" | "90d" | "all";

const TIME_RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "All", value: "all" },
];

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  all: "all time",
};

const TIME_RANGE_TO_DAYS: Record<Exclude<TimeRange, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const OPEN_STATUSES = ["submitted", "under_review", "investigating"];
const RESOLVED_STATUSES = ["resolved", "closed"];
const CATEGORY_COLORS = [
  "#2563eb",
  "#f97316",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#0ea5e9",
  "#facc15",
];

export default function ClientDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    activeUsers: 0,
  });
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [statsLoading, setStatsLoading] = useState(false);
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    { category: string; count: number; percentage: number }[]
  >([]);
  const [slaStats, setSlaStats] = useState({
    onTrack: 0,
    atRisk: 0,
    breached: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!organization?.id) return;
    loadStats(organization.id, timeRange);
  }, [organization?.id, timeRange]);

  const checkAuth = async () => {
    try {
      const { user: clientUser, organization: org } =
        await getCurrentClientAdmin();

      if (!clientUser || !org) {
        console.log("Not authenticated, redirecting to login");
        router.push(`/org/${subdomain}/login`);
        return;
      }

      // Verify user belongs to this organization
      if (org.subdomain !== subdomain) {
        console.log("User doesn't belong to this organization");
        router.push(`/org/${subdomain}/login`);
        return;
      }

      setUser(clientUser);
      setOrganization(org);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (organizationId: string, range: TimeRange) => {
    setStatsLoading(true);
    try {
      const { createMultiTenantClient } = await import(
        "@/lib/supabase/multi-tenant-client"
      );
      const supabase = createMultiTenantClient();

      let reportsQuery = supabase
        .from("reports")
        .select("id, title, category, status, created_at, tracking_code")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (range !== "all") {
        const days = TIME_RANGE_TO_DAYS[range];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        reportsQuery = reportsQuery.gte("created_at", startDate.toISOString());
      }

      const reportsPromise = reportsQuery;
      const activeUsersPromise = supabase
        .from("admin_profiles")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("is_active", true);

      const [reportsResult, activeUsersResult] = await Promise.all([
        reportsPromise,
        activeUsersPromise,
      ]);

      if (reportsResult.error) {
        throw reportsResult.error;
      }
      if (activeUsersResult.error) {
        throw activeUsersResult.error;
      }

      const reports = reportsResult.data || [];
      const activeUsersCount = activeUsersResult.count || 0;

      const totalReports = reports.length;
      const pendingReports = reports.filter((report) =>
        OPEN_STATUSES.includes(report.status)
      ).length;
      const resolvedReports = reports.filter((report) =>
        RESOLVED_STATUSES.includes(report.status)
      ).length;

      const categoryMap = new Map<string, number>();
      reports.forEach((report) => {
        const key = report.category || "Uncategorized";
        categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
      });
      const categoryData = Array.from(categoryMap.entries()).map(
        ([category, count]) => ({
          category,
          count,
          percentage: totalReports
            ? Math.round((count / totalReports) * 100)
            : 0,
        })
      );

      const now = Date.now();
      let breached = 0;
      let atRisk = 0;
      let onTrack = 0;
      reports.forEach((report) => {
        if (!OPEN_STATUSES.includes(report.status)) return;
        const createdAt = new Date(report.created_at).getTime();
        const ageHours = (now - createdAt) / (1000 * 60 * 60);
        if (ageHours >= 48) {
          breached += 1;
        } else if (ageHours >= 24) {
          atRisk += 1;
        } else {
          onTrack += 1;
        }
      });

      setStats({
        totalReports,
        pendingReports,
        resolvedReports,
        activeUsers: activeUsersCount,
      });
      setCategoryBreakdown(categoryData);
      setSlaStats({
        onTrack,
        atRisk,
        breached,
      });
      setActivityFeed(reports.slice(0, 8));
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!organization || !user) {
    return null;
  }

  const usersUsed = organization.current_admin_users || 0;
  const usersCap = organization.max_admin_users || 0;
  const reportsUsed = organization.current_reports_count || 0;
  const reportsCap = organization.max_reports_per_month || 0;
  const usersNear =
    usersCap > 0 && usersUsed / usersCap >= 0.8 && usersUsed < usersCap;
  const usersAt = usersCap > 0 && usersUsed >= usersCap;
  const reportsNear =
    reportsCap > 0 &&
    reportsUsed / reportsCap >= 0.8 &&
    reportsUsed < reportsCap;
  const reportsAt = reportsCap > 0 && reportsUsed >= reportsCap;
  const isFirstTime = stats.totalReports === 0;
  const quickActions: {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    target?: string;
  }[] = [
    {
      title:
        stats.pendingReports > 0
          ? `Review ${stats.pendingReports} pending ${
              stats.pendingReports === 1 ? "case" : "cases"
            }`
          : "Review in-flight cases",
      description:
        stats.pendingReports > 0
          ? "Jump directly into reports that still need a response."
          : "Check your pipeline to stay ahead of new submissions.",
      href: `/org/${subdomain}/reports?status=submitted,under_review,investigating`,
      icon: ClipboardCheck,
    },
    {
      title: "Invite a teammate",
      description: "Add another admin, manager, or investigator.",
      href: `/org/${subdomain}/users?tab=invite`,
      icon: UserPlus,
    },
    {
      title: "Share reporter link",
      description: "Open the anonymous portal to copy the URL.",
      href: `/org/${subdomain}/report`,
      icon: Share2,
      target: "_blank",
    },
    {
      title: "Update reporting settings",
      description: "Fine-tune categories, SLAs, and escalation contacts.",
      href: `/org/${subdomain}/settings`,
      icon: SlidersHorizontal,
    },
  ];
  const rangeDescription =
    timeRange === "all" ? "all time" : `last ${TIME_RANGE_LABELS[timeRange]}`;
  const totalSlaTracked =
    slaStats.onTrack + slaStats.atRisk + slaStats.breached;
  const compliancePercent = totalSlaTracked
    ? Math.round((slaStats.onTrack / totalSlaTracked) * 100)
    : 100;
  const hasCategoryData = categoryBreakdown.length > 0;
  const statusMeta: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    submitted: { label: "Submitted", className: "bg-slate-100 text-slate-700" },
    under_review: {
      label: "Under review",
      className: "bg-amber-100 text-amber-700",
    },
    investigating: {
      label: "Investigating",
      className: "bg-sky-100 text-sky-700",
    },
    resolved: {
      label: "Resolved",
      className: "bg-emerald-100 text-emerald-700",
    },
    closed: { label: "Closed", className: "bg-slate-200 text-slate-700" },
  };

  const formatReportDate = (value?: string | null) => {
    if (!value) return "Unknown date";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const getRelativeTime = (value?: string | null) => {
    if (!value) return "";
    const deltaMs = Date.now() - new Date(value).getTime();
    if (deltaMs < 60_000) return "just now";
    const minutes = Math.floor(deltaMs / 60_000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || "User",
          email: user.email,
          avatar: user.avatar_url || "/avatars/default.jpg",
        }}
        organization={{
          name: organization.name,
          subdomain: subdomain,
        }}
        userRole={user.role}
      />
      <SidebarInset>
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.full_name || user.email}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <NotificationsDropdown
                userId={user.id}
                organizationId={organization.id}
              />
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
              {organization.status === "trial" && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 border-amber-500/20"
                >
                  Trial
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Time range</p>
                <p className="text-xs text-muted-foreground">
                  Showing {rangeDescription}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {statsLoading && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating…
                  </span>
                )}
                {TIME_RANGE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={timeRange === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Usage Banner */}
            {(usersNear || usersAt || reportsNear || reportsAt) && (
              <Alert
                className={`${
                  usersAt || reportsAt
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <AlertCircle
                  className={`h-4 w-4 ${
                    usersAt || reportsAt ? "text-red-600" : "text-amber-600"
                  }`}
                />
                <AlertDescription
                  className={`${
                    usersAt || reportsAt ? "text-red-800" : "text-amber-800"
                  }`}
                >
                  {usersAt && (
                    <>
                      You have reached your user limit ({usersUsed}/{usersCap}).{" "}
                    </>
                  )}
                  {usersNear && !usersAt && (
                    <>
                      You&apos;re nearing your user limit ({usersUsed}/
                      {usersCap}
                      ).{" "}
                    </>
                  )}
                  {reportsAt && (
                    <>
                      You have reached your monthly report limit ({reportsUsed}/
                      {reportsCap}).{" "}
                    </>
                  )}
                  {reportsNear && !reportsAt && (
                    <>
                      You&apos;re nearing your monthly report limit (
                      {reportsUsed}/{reportsCap}).{" "}
                    </>
                  )}
                  <span className="ml-1">
                    <a href="/contact" className="underline">
                      Contact sales
                    </a>{" "}
                    to increase your limits.
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 md:gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Reports
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReports}</div>
                  <p className="text-xs text-muted-foreground">
                    Volume {rangeDescription}
                  </p>
                  <Link
                    href={`/org/${subdomain}/reports`}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    View reports →
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.pendingReports}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requires attention ({rangeDescription})
                  </p>
                  <Link
                    href={`/org/${subdomain}/reports?status=submitted,under_review,investigating`}
                    className="text-xs font-semibold text-amber-600 hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    Review cases →
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Resolved
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.resolvedReports}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Closed cases ({rangeDescription})
                  </p>
                  <Link
                    href={`/org/${subdomain}/reports?status=resolved`}
                    className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    View timeline →
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {organization.max_admin_users} max
                  </p>
                  <Link
                    href={`/org/${subdomain}/users`}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    Manage users →
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Overview */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Category mix</CardTitle>
                  <CardDescription>
                    Distribution for {rangeDescription} window.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasCategoryData ? (
                    <p className="text-sm text-muted-foreground">
                      Not enough data yet to display the category breakdown.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <div className="h-56 w-full lg:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryBreakdown}
                              dataKey="count"
                              nameKey="category"
                              innerRadius={55}
                              outerRadius={90}
                              paddingAngle={3}
                            >
                              {categoryBreakdown.map((entry, index) => (
                                <Cell
                                  key={entry.category}
                                  fill={
                                    CATEGORY_COLORS[
                                      index % CATEGORY_COLORS.length
                                    ]
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(
                                value: number | string,
                                _name: string,
                                props: any
                              ) => [
                                `${value} cases`,
                                props?.payload?.category ?? "Category",
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-3 text-sm">
                        {categoryBreakdown.slice(0, 4).map((item, index) => (
                          <div
                            key={item.category}
                            className="flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    CATEGORY_COLORS[
                                      index % CATEGORY_COLORS.length
                                    ],
                                }}
                              />
                              <span className="font-medium truncate">
                                {item.category}
                              </span>
                            </div>
                            <span className="text-muted-foreground">
                              {item.count} • {item.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>SLA compliance</CardTitle>
                  <CardDescription>
                    Pending / review cases vs 48h SLA.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>On-time resolution</span>
                        <span>{compliancePercent}%</span>
                      </div>
                      <Progress value={compliancePercent} className="mt-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div className="rounded-lg border px-3 py-2">
                        <p className="text-2xl font-semibold text-emerald-600">
                          {slaStats.onTrack}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          On track
                        </p>
                      </div>
                      <div className="rounded-lg border px-3 py-2">
                        <p className="text-2xl font-semibold text-amber-600">
                          {slaStats.atRisk}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          At risk (24-48h)
                        </p>
                      </div>
                      <div className="rounded-lg border px-3 py-2">
                        <p className="text-2xl font-semibold text-red-600">
                          {slaStats.breached}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Breached
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tracking submitted / under review / investigating cases
                      created within {rangeDescription}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Onboarding */}
            <div
              className={`grid gap-4 ${
                isFirstTime ? "lg:grid-cols-2" : "lg:grid-cols-1"
              }`}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Quick actions</CardTitle>
                      <CardDescription>
                        Jump into the workflows admins touch most often.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/org/${subdomain}/reports`} prefetch={false}>
                        View all reports
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {quickActions.map((action) => (
                      <Link
                        key={action.title}
                        href={action.href}
                        prefetch={false}
                        className="group flex items-start gap-3 rounded-lg border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/50 hover:bg-background"
                        {...(action.target ? { target: action.target } : {})}
                      >
                        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/15">
                          <action.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium leading-tight">
                            {action.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {isFirstTime && (
                <Card className="border-dashed shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Get your program up and running</CardTitle>
                    <CardDescription>
                      You haven&apos;t collected any reports yet. Create an
                      internal case or share your public reporting link to start
                      receiving submissions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-start gap-4 md:flex-nowrap md:items-center md:justify-between">
                      <p className="text-sm text-muted-foreground max-w-xl">
                        Set up your workflow and loop in teammates so your team
                        is ready when the first report arrives.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button asChild>
                          <Link
                            href={`/org/${subdomain}/reports/create`}
                            className="inline-flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Create first case
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link
                            href={`/org/${subdomain}/report`}
                            className="inline-flex items-center gap-2"
                          >
                            <Share2 className="h-4 w-4" />
                            Share reporter link
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Engagement & Live Activity */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Welcome to Your Compliance Dashboard</CardTitle>
                  <CardDescription>
                    Manage whistleblower reports and compliance cases for{" "}
                    {organization.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium capitalize">
                          {organization.plan}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={
                            organization.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {organization.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">Users:</span>
                        <span className="font-medium">
                          {organization.current_admin_users} /{" "}
                          {organization.max_admin_users}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">
                          Reports this month:
                        </span>
                        <span className="font-medium">
                          {organization.current_reports_count} /{" "}
                          {organization.max_reports_per_month}
                        </span>
                      </div>
                    </div>

                    {organization.features?.anonymous_reporting && (
                      <p className="text-muted-foreground mt-3">
                        ✓ Anonymous reporting is enabled for your organization
                      </p>
                    )}

                    {stats.pendingReports > 0 && (
                      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 mt-3">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                          <strong className="font-semibold">
                            Action Required:
                          </strong>{" "}
                          You have {stats.pendingReports} pending report
                          {stats.pendingReports !== 1 ? "s" : ""} requiring
                          attention.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Live activity ticker</CardTitle>
                      <CardDescription>
                        Latest submissions and updates flowing through
                        CodeSquare.
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/org/${subdomain}/reports`}
                        prefetch={false}
                        className="inline-flex items-center gap-1"
                      >
                        Open reports
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activityFeed.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No activity in this {rangeDescription} window yet. New
                      submissions and status changes will show up here.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {activityFeed.map((report, index) => {
                        const status =
                          statusMeta[
                            report.status as keyof typeof statusMeta
                          ] || statusMeta.submitted;
                        const isLast = index === activityFeed.length - 1;
                        return (
                          <Link
                            key={report.id}
                            href={`/org/${subdomain}/reports/${report.id}`}
                            prefetch={false}
                            className="group flex items-start gap-3"
                          >
                            <div className="relative flex flex-col items-center">
                              <span
                                className={`block h-2.5 w-2.5 rounded-full ${status.className}`}
                              />
                              {!isLast && (
                                <span className="mt-1 flex-1 w-px bg-border" />
                              )}
                            </div>
                            <div className="flex flex-1 flex-col gap-0.5">
                              <p className="font-medium leading-tight">
                                {report.title ||
                                  report.tracking_code ||
                                  "Untitled case"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {report.category || "General"} •{" "}
                                {getRelativeTime(report.created_at)}
                              </p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
