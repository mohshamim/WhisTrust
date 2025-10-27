import { createClient } from "@/lib/supabase/client";
import type { ReportStatistics, CategoryStatistics, ActivityTimeline } from "@/lib/types/database";

/**
 * Get comprehensive report statistics
 */
export async function getReportStatistics(): Promise<{ success: boolean; stats?: ReportStatistics; error?: string }> {
  try {
    const supabase = createClient();

    // Query the report_statistics view
    const { data, error } = await supabase
      .from("report_statistics")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching report statistics:", error);
      return { success: false, error: error.message };
    }

    return { success: true, stats: data as ReportStatistics };
  } catch (error) {
    console.error("Report statistics exception:", error);
    return { success: false, error: "Failed to fetch report statistics" };
  }
}

/**
 * Get category breakdown statistics
 */
export async function getCategoryStatistics(): Promise<{ success: boolean; stats?: CategoryStatistics[]; error?: string }> {
  try {
    const supabase = createClient();

    // Query the category_statistics view
    const { data, error } = await supabase
      .from("category_statistics")
      .select("*");

    if (error) {
      console.error("Error fetching category statistics:", error);
      return { success: false, error: error.message };
    }

    return { success: true, stats: data as CategoryStatistics[] };
  } catch (error) {
    console.error("Category statistics exception:", error);
    return { success: false, error: "Failed to fetch category statistics" };
  }
}

/**
 * Get activity timeline for charts
 */
export async function getActivityTimeline(): Promise<{ success: boolean; timeline?: ActivityTimeline[]; error?: string }> {
  try {
    const supabase = createClient();

    // Query the activity_timeline view
    const { data, error } = await supabase
      .from("activity_timeline")
      .select("*");

    if (error) {
      console.error("Error fetching activity timeline:", error);
      return { success: false, error: error.message };
    }

    return { success: true, timeline: data as ActivityTimeline[] };
  } catch (error) {
    console.error("Activity timeline exception:", error);
    return { success: false, error: "Failed to fetch activity timeline" };
  }
}

/**
 * Get reports by status for pie chart
 */
export async function getReportsByStatus(): Promise<{ success: boolean; data?: { status: string; count: number }[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("reports")
      .select("status");

    if (error) {
      console.error("Error fetching reports by status:", error);
      return { success: false, error: error.message };
    }

    // Group by status
    const statusCounts = (data || []).reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error("Reports by status exception:", error);
    return { success: false, error: "Failed to fetch reports by status" };
  }
}

/**
 * Get reports count by month for trend analysis
 */
export async function getReportsByMonth(): Promise<{ success: boolean; data?: { month: string; count: number }[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("reports")
      .select("created_at");

    if (error) {
      console.error("Error fetching reports by month:", error);
      return { success: false, error: error.message };
    }

    // Group by month
    const monthCounts = (data || []).reduce((acc, report) => {
      const month = new Date(report.created_at).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { success: true, data: result };
  } catch (error) {
    console.error("Reports by month exception:", error);
    return { success: false, error: "Failed to fetch reports by month" };
  }
}

/**
 * Export analytics data to CSV format
 */
export async function exportAnalyticsToCSV(data: any[]): Promise<string> {
  if (!data || data.length === 0) return "";

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in values
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? "";
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}
