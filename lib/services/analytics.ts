/**
 * Analytics Service
 * Provides data aggregation and analytics for reports
 */

import { createServiceClient } from "@/lib/supabase/service-client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper: convert HEX to RGB tuple
function hexToRgb(hex: string): [number, number, number] {
  let normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [38, 50, 56];
  }

  return [r, g, b];
}

export interface AnalyticsSummary {
  totalReports: number;
  reportsThisMonth: number;
  avgResponseTimeHours: number;
  resolutionRate: number;
  criticalHighCount: number;
}

export interface ReportsByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface ReportsByCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface ReportsTrend {
  date: string;
  count: number;
}

export interface ReportsByPriority {
  priority: string;
  count: number;
  percentage: number;
}

export interface CategoryMetrics {
  category: string;
  total: number;
  avgResponseHours: number;
  closureRate: number;
}

/**
 * Get analytics summary metrics
 */
export async function getAnalyticsSummary(
  organizationId: string,
  dateRange?: { start: Date; end: Date }
): Promise<{ success: boolean; data?: AnalyticsSummary; error?: string }> {
  try {
    const supabase = createServiceClient();

    // Build date filter
    let query = supabase
      .from("reports")
      .select("*", { count: "exact" })
      .eq("organization_id", organizationId);

    if (dateRange) {
      query = query
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString());
    }

    const { data: reports, count, error } = await query;

    if (error) throw error;

    // Calculate metrics
    const totalReports = count || 0;

    // Reports this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthCount } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .gte("created_at", startOfMonth.toISOString());

    const reportsThisMonth = monthCount || 0;

    // Avg response time (for resolved/closed cases)
    const resolvedReports = reports?.filter(
      (r) => r.status === "resolved" || r.status === "closed"
    );

    let avgResponseTimeHours = 0;
    if (resolvedReports && resolvedReports.length > 0) {
      const totalHours = resolvedReports.reduce((sum, r) => {
        const created = new Date(r.created_at);
        const updated = new Date(r.updated_at);
        const hours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResponseTimeHours = Math.round(totalHours / resolvedReports.length);
    }

    // Resolution rate
    const resolvedCount = resolvedReports?.length || 0;
    const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

    // Critical/High priority count
    const criticalHighCount =
      reports?.filter((r) => r.priority === "critical" || r.priority === "high").length || 0;

    return {
      success: true,
      data: {
        totalReports,
        reportsThisMonth,
        avgResponseTimeHours,
        resolutionRate,
        criticalHighCount,
      },
    };
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch analytics",
    };
  }
}

/**
 * Get reports grouped by status
 */
export async function getReportsByStatus(
  organizationId: string,
  dateRange?: { start: Date; end: Date }
): Promise<{ success: boolean; data?: ReportsByStatus[]; error?: string }> {
  try {
    const supabase = createServiceClient();

    let query = supabase
      .from("reports")
      .select("status")
      .eq("organization_id", organizationId);

    if (dateRange) {
      query = query
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by status
    const statusCounts: Record<string, number> = {};
    data?.forEach((report) => {
      statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
    });

    const total = data?.length || 0;

    const result: ReportsByStatus[] = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching reports by status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch status data",
    };
  }
}

/**
 * Get reports grouped by category
 */
export async function getReportsByCategory(
  organizationId: string,
  dateRange?: { start: Date; end: Date }
): Promise<{ success: boolean; data?: ReportsByCategory[]; error?: string }> {
  try {
    const supabase = createServiceClient();

    let query = supabase
      .from("reports")
      .select("category")
      .eq("organization_id", organizationId);

    if (dateRange) {
      query = query
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by category
    const categoryCounts: Record<string, number> = {};
    data?.forEach((report) => {
      categoryCounts[report.category] = (categoryCounts[report.category] || 0) + 1;
    });

    const total = data?.length || 0;

    const result: ReportsByCategory[] = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching reports by category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch category data",
    };
  }
}

/**
 * Get reports trend over time
 */
export async function getReportsTrend(
  organizationId: string,
  days: number = 30
): Promise<{ success: boolean; data?: ReportsTrend[]; error?: string }> {
  try {
    const supabase = createServiceClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("reports")
      .select("created_at")
      .eq("organization_id", organizationId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group by date
    const dateCounts: Record<string, number> = {};
    data?.forEach((report) => {
      const date = new Date(report.created_at).toISOString().split("T")[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    // Fill in missing dates with 0
    const result: ReportsTrend[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        count: dateCounts[dateStr] || 0,
      });
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching reports trend:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch trend data",
    };
  }
}

/**
 * Get reports grouped by priority
 */
export async function getReportsByPriority(
  organizationId: string,
  dateRange?: { start: Date; end: Date }
): Promise<{ success: boolean; data?: ReportsByPriority[]; error?: string }> {
  try {
    const supabase = createServiceClient();

    let query = supabase
      .from("reports")
      .select("priority")
      .eq("organization_id", organizationId);

    if (dateRange) {
      query = query
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by priority
    const priorityCounts: Record<string, number> = {};
    data?.forEach((report) => {
      priorityCounts[report.priority] = (priorityCounts[report.priority] || 0) + 1;
    });

    const total = data?.length || 0;

    const result: ReportsByPriority[] = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching reports by priority:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch priority data",
    };
  }
}

/**
 * Get category performance metrics
 */
export async function getCategoryMetrics(
  organizationId: string
): Promise<{ success: boolean; data?: CategoryMetrics[]; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { data: reports, error } = await supabase
      .from("reports")
      .select("category, status, created_at, updated_at")
      .eq("organization_id", organizationId);

    if (error) throw error;

    // Group by category
    const categoryData: Record<string, { total: number; resolved: number; totalHours: number }> = {};

    reports?.forEach((report) => {
      if (!categoryData[report.category]) {
        categoryData[report.category] = { total: 0, resolved: 0, totalHours: 0 };
      }

      categoryData[report.category].total++;

      if (report.status === "resolved" || report.status === "closed") {
        categoryData[report.category].resolved++;

        const created = new Date(report.created_at);
        const updated = new Date(report.updated_at);
        const hours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        categoryData[report.category].totalHours += hours;
      }
    });

    const result: CategoryMetrics[] = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        total: data.total,
        avgResponseHours: data.resolved > 0 ? Math.round(data.totalHours / data.resolved) : 0,
        closureRate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching category metrics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch category metrics",
    };
  }
}

/**
 * Export analytics data as a nicely formatted PDF
 */
export function exportAnalyticsPDF(
  summary: AnalyticsSummary,
  byStatus: ReportsByStatus[],
  byCategory: ReportsByCategory[],
  byPriority: ReportsByPriority[],
  categoryMetrics: CategoryMetrics[],
  brandHex?: string | null,
  organizationName?: string | null,
  dateRangeLabel?: string | null
): void {
  // Try to align PDF styling with the organization's branding color
  const getBrandColorRGB = (): [number, number, number] => {
    // 1) Prefer explicit brandHex passed from React (organization.branding.primary_color)
    if (brandHex && typeof brandHex === "string") {
      return hexToRgb(brandHex);
    }

    // 2) Hard-coded fallback to WhisTrust primary brand color
    // This is tuned to closely match the primary button / \"Save Changes\" color.
    return hexToRgb("#c45a3a");
  };

  const brandColor = getBrandColorRGB();

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 40;
  const marginTop = 40;

  // Top brand banner
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.rect(0, 0, pageWidth, 70, "F");

  // Title in banner
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("WhisTrust Analytics Report", marginLeft, marginTop - 5);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const generatedText = `Generated on ${new Date().toLocaleString()}`;
  doc.text(generatedText, marginLeft, marginTop + 10);

  if (organizationName) {
    const orgLine = organizationName;
    doc.text(orgLine, marginLeft, marginTop + 24);
  }

  if (dateRangeLabel) {
    const label = `Range: ${dateRangeLabel}`;
    const textWidth = doc.getTextWidth(label);
    doc.text(
      label,
      pageWidth - marginLeft - textWidth,
      marginTop + 10
    );
  }

  // Reset text color for body
  doc.setTextColor(0, 0, 0);

  let finalY = marginTop + 40;

  const addTable = (
    title: string,
    head: string[],
    body: (string | number)[][]
  ) => {
    if (!body.length) return;

    const pageHeight = doc.internal.pageSize.getHeight();
    const startYThreshold = pageHeight - 160;

    if (finalY > startYThreshold) {
      doc.addPage();
      finalY = marginTop;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, marginLeft, finalY);
    finalY += 8;

    autoTable(doc, {
      startY: finalY,
      head: [head],
      body,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [55, 65, 81], // neutral-700
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: brandColor,
        textColor: 255,
        halign: "left",
      },
      alternateRowStyles: { fillColor: [252, 248, 246] }, // warm, subtle striping
      margin: { left: marginLeft, right: marginLeft },
    });

    finalY = (doc as any).lastAutoTable.finalY + 20;
  };

  // Summary table
  addTable("Summary", ["Metric", "Value"], [
    ["Total Reports", summary.totalReports],
    ["Reports This Month", summary.reportsThisMonth],
    ["Avg Response Time (hours)", summary.avgResponseTimeHours],
    ["Resolution Rate (%)", summary.resolutionRate],
    ["Critical / High Priority Cases", summary.criticalHighCount],
  ]);

  // Reports by Status
  addTable(
    "Reports by Status",
    ["Status", "Count", "Percentage"],
    byStatus.map((item) => [
      item.status,
      item.count,
      `${item.percentage}%`,
    ])
  );

  // Reports by Category
  addTable(
    "Reports by Category",
    ["Category", "Count", "Percentage"],
    byCategory.map((item) => [
      item.category.replace("_", " "),
      item.count,
      `${item.percentage}%`,
    ])
  );

  // Reports by Priority
  addTable(
    "Reports by Priority",
    ["Priority", "Count", "Percentage"],
    byPriority.map((item) => [
      item.priority,
      item.count,
      `${item.percentage}%`,
    ])
  );

  // Category Metrics
  addTable(
    "Category Performance Metrics",
    ["Category", "Total Reports", "Avg Response Time (hours)", "Closure Rate"],
    categoryMetrics.map((metric) => [
      metric.category.replace("_", " "),
      metric.total,
      metric.avgResponseHours > 0 ? metric.avgResponseHours : "N/A",
      `${metric.closureRate}%`,
    ])
  );

  doc.save(`whistrust-analytics-${new Date().toISOString().split("T")[0]}.pdf`);
}
