/**
 * Audit Logs Service
 * Tracks and retrieves all system activities for compliance
 */

import { createServiceClient } from "@/lib/supabase/service-client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Joined from admin_profiles
  user_name?: string;
  user_email?: string;
}

export interface AuditLogFilters {
  dateRange?: { start: Date; end: Date };
  actionType?: string;
  userId?: string;
  resourceType?: string;
  search?: string;
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(
  organizationId: string,
  filters?: AuditLogFilters,
  limit: number = 100
): Promise<{ success: boolean; data?: AuditLog[]; error?: string }> {
  try {
    const supabase = createServiceClient();

    let query = supabase
      .from("audit_logs")
      .select(
        `
        *,
        admin_profiles!audit_logs_user_id_fkey (
          full_name,
          email
        )
      `
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply filters
    if (filters?.dateRange) {
      query = query
        .gte("created_at", filters.dateRange.start.toISOString())
        .lte("created_at", filters.dateRange.end.toISOString());
    }

    if (filters?.actionType && filters.actionType !== "all") {
      query = query.eq("action", filters.actionType);
    }

    if (filters?.userId && filters.userId !== "all") {
      query = query.eq("user_id", filters.userId);
    }

    if (filters?.resourceType && filters.resourceType !== "all") {
      query = query.eq("resource_type", filters.resourceType);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to include user info
    const logs: AuditLog[] =
      data?.map((log: any) => ({
        ...log,
        user_name: log.admin_profiles?.full_name || "System",
        user_email: log.admin_profiles?.email || null,
      })) || [];

    // Filter by search term if provided
    let filteredLogs = logs;
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLogs = logs.filter(
        (log) =>
          log.action.toLowerCase().includes(searchLower) ||
          log.user_name?.toLowerCase().includes(searchLower) ||
          log.resource_type?.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.details).toLowerCase().includes(searchLower)
      );
    }

    return { success: true, data: filteredLogs };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch audit logs",
    };
  }
}

/**
 * Get unique action types for filter dropdown
 */
export async function getActionTypes(organizationId: string): Promise<string[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .select("action")
      .eq("organization_id", organizationId);

    if (error) throw error;

    // Get unique actions
    const actions = new Set(data?.map((log) => log.action) || []);
    return Array.from(actions).sort();
  } catch (error) {
    console.error("Error fetching action types:", error);
    return [];
  }
}

/**
 * Get unique users for filter dropdown
 */
export async function getAuditUsers(
  organizationId: string
): Promise<{ id: string; name: string }[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        `
        user_id,
        admin_profiles!audit_logs_user_id_fkey (
          full_name
        )
      `
      )
      .eq("organization_id", organizationId);

    if (error) throw error;

    // Get unique users
    const userMap = new Map<string, string>();
    data?.forEach((log: any) => {
      if (log.user_id && log.admin_profiles?.full_name) {
        userMap.set(log.user_id, log.admin_profiles.full_name);
      }
    });

    return Array.from(userMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching audit users:", error);
    return [];
  }
}

/**
 * Helper: convert HEX color to RGB tuple
 */
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

/**
 * Export audit logs as a branded PDF
 */
export function exportAuditLogsPDF(
  logs: AuditLog[],
  organizationName?: string | null,
  dateRangeLabel?: string | null,
  brandHex?: string | null
): void {
  if (!logs.length) return;

  const getBrandColorRGB = (): [number, number, number] => {
    if (brandHex && typeof brandHex === "string") {
      return hexToRgb(brandHex);
    }
    // Fallback to WhisTrust primary brand color
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

  // Top banner
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.rect(0, 0, pageWidth, 70, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("WhisTrust Audit Log Export", marginLeft, marginTop - 5);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    marginLeft,
    marginTop + 10
  );

  if (organizationName) {
    doc.text(organizationName, marginLeft, marginTop + 24);
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

  doc.setTextColor(0, 0, 0);

  const rows: (string | number)[][] = logs.map((log) => [
    new Date(log.created_at).toLocaleString(),
    log.user_name || "System",
    log.action,
    log.resource_type || "N/A",
    log.resource_id || "N/A",
    JSON.stringify(log.details || {}),
  ]);

  autoTable(doc, {
    startY: marginTop + 40,
    head: [
      [
        "Timestamp",
        "User",
        "Action",
        "Resource Type",
        "Resource ID",
        "Details",
      ],
    ],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: [55, 65, 81],
      overflow: "line",
    },
    headStyles: {
      fillColor: brandColor,
      textColor: 255,
      halign: "left",
    },
    alternateRowStyles: { fillColor: [252, 248, 246] },
    lineColor: [229, 231, 235],
    lineWidth: 0.25,
    margin: { left: marginLeft, right: marginLeft },
  });

  doc.save(`audit-logs-${new Date().toISOString().split("T")[0]}.pdf`);
}

