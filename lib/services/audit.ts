import { createClient } from "@/lib/supabase/client";
import type { AuditLog } from "@/lib/types/database";

export interface LogAuditParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
}

/**
 * Log an audit event to the database
 * TODO: Replace with self-hosted audit logging solution if needed
 */
export async function logAuditEvent(params: LogAuditParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Get user info
    const { data: { user } } = await supabase.auth.getUser();

    // Call the database function to log the event
    const { error } = await supabase.rpc('log_audit_event', {
      p_action: params.action,
      p_resource_type: params.resourceType,
      p_resource_id: params.resourceId || null,
      p_details: params.details || null,
    });

    if (error) {
      console.error("Audit logging error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Audit logging exception:", error);
    return { success: false, error: "Failed to log audit event" };
  }
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<{ success: boolean; logs?: AuditLog[]; error?: string }> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.action) {
      query = query.eq("action", filters.action);
    }
    if (filters?.resourceType) {
      query = query.eq("resource_type", filters.resourceType);
    }
    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching audit logs:", error);
      return { success: false, error: error.message };
    }

    return { success: true, logs: data as AuditLog[] };
  } catch (error) {
    console.error("Audit logs exception:", error);
    return { success: false, error: "Failed to fetch audit logs" };
  }
}

/**
 * Helper to get client IP (for logging)
 */
export function getClientIP(): string | null {
  // In a real Next.js app, you'd get this from headers
  // For now, return null
  return null;
}

/**
 * Helper to get user agent (for logging)
 */
export function getUserAgent(): string | null {
  if (typeof window !== "undefined") {
    return navigator.userAgent;
  }
  return null;
}
