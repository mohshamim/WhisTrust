/**
 * Reports Service
 * 
 * Data access layer for reports.
 * Centralized here for easy migration to different backend providers.
 */

import { createClient } from "@/lib/supabase/client";
import type { Report, NewReport, UpdateReport, NewAdminReport, AdminUser } from "@/lib/types/database";

/**
 * Generate a unique tracking code
 */
function generateTrackingCode(): string {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

/**
 * Submit a new anonymous report
 */
export async function submitReport(data: NewReport): Promise<{ success: boolean; trackingCode?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    const trackingCode = generateTrackingCode();
    
    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        tracking_code: trackingCode,
        category: data.category,
        description: data.description,
        reporter_name: data.reporter_name || null,
        reporter_email: data.reporter_email || null,
        status: "pending",
        source: "online",
        submitted_by: "anonymous",
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting report:", error);
      return { success: false, error: error.message };
    }

    return { success: true, trackingCode };
  } catch (error) {
    console.error("Error in submitReport:", error);
    return { success: false, error: "Failed to submit report. Please try again." };
  }
}

/**
 * Get report by tracking code (anonymous access)
 */
export async function getReportByTrackingCode(trackingCode: string): Promise<{ success: boolean; report?: Report; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data: report, error } = await supabase
      .from("reports")
      .select("*")
      .eq("tracking_code", trackingCode.toUpperCase())
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Report not found" };
      }
      console.error("Error fetching report:", error);
      return { success: false, error: error.message };
    }

    return { success: true, report };
  } catch (error) {
    console.error("Error in getReportByTrackingCode:", error);
    return { success: false, error: "Failed to fetch report" };
  }
}

/**
 * Get all reports (admin only)
 */
export async function getAllReports(): Promise<{ success: boolean; reports?: Report[]; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      return { success: false, error: error.message };
    }

    return { success: true, reports: reports || [] };
  } catch (error) {
    console.error("Error in getAllReports:", error);
    return { success: false, error: "Failed to fetch reports" };
  }
}

/**
 * Update report (admin only)
 */
export async function updateReport(
  trackingCode: string,
  updates: UpdateReport
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from("reports")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("tracking_code", trackingCode);

    if (error) {
      console.error("Error updating report:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateReport:", error);
    return { success: false, error: "Failed to update report" };
  }
}

/**
 * Get report statistics for admin dashboard
 */
export async function getReportStats(): Promise<{
  success: boolean;
  stats?: {
    total: number;
    pending: number;
    inReview: number;
    resolved: number;
  };
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    const { data: reports, error } = await supabase
      .from("reports")
      .select("status");

    if (error) {
      console.error("Error fetching stats:", error);
      return { success: false, error: error.message };
    }

    const stats = {
      total: reports?.length || 0,
      pending: reports?.filter((r) => r.status === "pending").length || 0,
      inReview: reports?.filter((r) => r.status === "in_review" || r.status === "in_progress").length || 0,
      resolved: reports?.filter((r) => r.status === "resolved" || r.status === "closed").length || 0,
    };

    return { success: true, stats };
  } catch (error) {
    console.error("Error in getReportStats:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
}

// ============================================================================
// BRD Phase 3: Enhanced Report Management Functions
// ============================================================================

/**
 * BRD Phase 3: Assign a case to an admin user
 */
export async function assignCase(
  reportId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from("reports")
      .update({ 
        assigned_to: adminId, 
        assigned_at: new Date().toISOString() 
      })
      .eq("id", reportId);

    if (error) {
      console.error("Error assigning case:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in assignCase:", error);
    return { success: false, error: "Failed to assign case" };
  }
}

/**
 * BRD Phase 3: Get list of admin users for assignment dropdown
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("is_active", true)
      .order("full_name", { ascending: true });
    
    if (error) {
      console.error("Error fetching admin users:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getAdminUsers:", error);
    return [];
  }
}

/**
 * BRD Phase 3: Create a report manually submitted by admin
 * Used for offline, phone, or email submissions
 */
export async function createAdminReport(
  data: NewAdminReport
): Promise<{ success: boolean; report?: Report; error?: string }> {
  try {
    const supabase = createClient();
    
    const trackingCode = generateTrackingCode();
    
    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        tracking_code: trackingCode,
        category: data.category,
        description: data.description,
        reporter_name: data.reporter_name || null,
        reporter_email: data.reporter_email || null,
        submitted_by: 'admin',
        source: data.source,
        priority: data.priority || 'medium',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating admin report:", error);
      return { success: false, error: error.message };
    }

    return { success: true, report };
  } catch (error) {
    console.error("Error in createAdminReport:", error);
    return { success: false, error: "Failed to create report" };
  }
}
