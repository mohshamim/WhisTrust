/**
 * Labels Service
 * 
 * BRD Phase 3: Data access layer for report labels/tags
 */

import { createClient } from "@/lib/supabase/client";
import type { ReportLabel } from "@/lib/types/database";

export interface AddLabelRequest {
  report_id: string;
  label: string;
  color?: string;
}

/**
 * Get all labels for a specific report
 */
export async function getLabelsForReport(
  reportId: string
): Promise<ReportLabel[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("report_labels")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching labels:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getLabelsForReport:", error);
    return [];
  }
}

/**
 * Add a label to a report
 */
export async function addLabel(
  request: AddLabelRequest
): Promise<{ success: boolean; label?: ReportLabel; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("report_labels")
      .insert({
        report_id: request.report_id,
        label: request.label,
        color: request.color || '#9ca3af'
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding label:", error);
      return { success: false, error: error.message };
    }

    return { success: true, label: data };
  } catch (error) {
    console.error("Error in addLabel:", error);
    return { success: false, error: "Failed to add label" };
  }
}

/**
 * Remove a label from a report
 */
export async function removeLabel(
  labelId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from("report_labels")
      .delete()
      .eq("id", labelId);

    if (error) {
      console.error("Error removing label:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in removeLabel:", error);
    return { success: false, error: "Failed to remove label" };
  }
}
