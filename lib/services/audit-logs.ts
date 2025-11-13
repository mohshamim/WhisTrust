/**
 * Audit Logs Service
 * Tracks and retrieves all system activities for compliance
 */

import { createServiceClient } from "@/lib/supabase/service-client";

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
 * Export audit logs as CSV
 */
export function exportAuditLogsCSV(logs: AuditLog[]): void {
  const csv: string[] = [];

  // Header
  csv.push("Timestamp,User,Action,Resource Type,Resource ID,Details");

  // Data
  logs.forEach((log) => {
    const timestamp = new Date(log.created_at).toLocaleString();
    const user = log.user_name || "System";
    const action = log.action;
    const resourceType = log.resource_type || "N/A";
    const resourceId = log.resource_id || "N/A";
    const details = JSON.stringify(log.details || {}).replace(/"/g, '""'); // Escape quotes

    csv.push(`"${timestamp}","${user}","${action}","${resourceType}","${resourceId}","${details}"`);
  });

  // Create download
  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

