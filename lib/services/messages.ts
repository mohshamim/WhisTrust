/**
 * Messages Service - Two-Way Communication
 * Handles messaging between reporters and admins
 */

import { createServiceClient } from "@/lib/supabase/service-client";
import { createClient } from "@/lib/supabase/client";

export interface Message {
  id: string;
  report_id: string;
  sender_type: "reporter" | "admin";
  sender_id: string | null; // admin user id if sender_type is admin
  content: string;
  is_encrypted: boolean;
  created_at: string;
}

export interface GetMessagesResult {
  success: boolean;
  messages?: Message[];
  error?: string;
}

export interface SendMessageResult {
  success: boolean;
  message?: Message;
  error?: string;
}

/**
 * Get all messages for a report
 * Can be called by admins or anonymously (for reporters)
 */
export async function getReportMessages(
  reportId: string
): Promise<GetMessagesResult> {
  try {
    // Use client instead of service client (can be called from browser)
    const supabase = createClient();

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Get messages error:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch messages",
      };
    }

    return {
      success: true,
      messages: data || [],
    };
  } catch (error) {
    console.error("Get report messages error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Send a message as a reporter (anonymous)
 * Used by reporters tracking their case
 */
export async function sendReporterMessage(
  reportId: string,
  content: string
): Promise<SendMessageResult> {
  try {
    // Basic client-side throttle: 1 message / 10s per report
    const key = `rl:reporter:${reportId}`;
    const now = Date.now();
    const last = Number(sessionStorage.getItem(key) || "0");
    if (now - last < 10_000) {
      return { success: false, error: "Please wait a few seconds before sending another message." };
    }

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: "Message content cannot be empty",
      };
    }

    // Use anonymous client for reporter messages (client-side)
    const supabase = createClient();

    // Verify report exists
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      return {
        success: false,
        error: "Report not found",
      };
    }

    // Insert message
    const { data, error } = await supabase
      .from("messages")
      .insert({
        report_id: reportId,
        sender_type: "reporter",
        sender_id: null, // Anonymous reporter
        content: content.trim(),
        is_encrypted: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Send reporter message error:", error);
      return {
        success: false,
        error: error.message || "Failed to send message",
      };
    }

    // Mark throttle timestamp
    sessionStorage.setItem(key, String(now));

    // Fire-and-forget: notify admins via API (best-effort)
    try {
      await fetch("/api/notifications/message-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reportId, sender: "reporter" }),
      });
    } catch {}

    return {
      success: true,
      message: data,
    };
  } catch (error) {
    console.error("Send reporter message error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Send a message as an admin
 * Used by admins responding to reports
 */
export async function sendAdminMessage(
  reportId: string,
  content: string,
  userId: string
): Promise<SendMessageResult> {
  try {
    // Basic client-side throttle: 1 message / 5s per report per admin
    const key = `rl:admin:${reportId}:${userId}`;
    const now = Date.now();
    const last = Number(sessionStorage.getItem(key) || "0");
    if (now - last < 5_000) {
      return { success: false, error: "Please wait a moment before sending again." };
    }

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: "Message content cannot be empty",
      };
    }

    const supabase = createClient();

    // Verify report exists and user has access
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, organization_id")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      return {
        success: false,
        error: "Report not found",
      };
    }

    // Verify user belongs to same organization
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("organization_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    if (profile.organization_id !== report.organization_id) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Insert message
    const { data, error } = await supabase
      .from("messages")
      .insert({
        report_id: reportId,
        sender_type: "admin",
        sender_id: userId, // Admin user ID
        content: content.trim(),
        is_encrypted: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Send admin message error:", error);
      return {
        success: false,
        error: error.message || "Failed to send message",
      };
    }

    sessionStorage.setItem(key, String(now));

    return {
      success: true,
      message: data,
    };
  } catch (error) {
    console.error("Send admin message error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Mark messages as read (for admins)
 * Optional: implement read receipts
 */
export async function markMessagesAsRead(
  reportId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // This could be implemented if we add a `read_by` or `read_at` field
    // For now, we'll just return success
    // Future enhancement: track which admins have read which messages
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Mark messages as read error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get unread message count for a report (for admins)
 */
export async function getUnreadMessageCount(
  reportId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const supabase = createServiceClient();

    // Count messages from reporters (unread by admin)
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("report_id", reportId)
      .eq("sender_type", "reporter");

    if (error) {
      console.error("Get unread count error:", error);
      return {
        success: false,
        error: error.message || "Failed to get unread count",
      };
    }

    return {
      success: true,
      count: count || 0,
    };
  } catch (error) {
    console.error("Get unread message count error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a message (admin only)
 */
export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Verify message exists and user has permission
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("report_id, created_by")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      return {
        success: false,
        error: "Message not found",
      };
    }

    // Only allow deletion of own messages or if super admin
    if (message.created_by !== userId) {
      // Check if user is admin with proper permissions
      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!profile || profile.role !== "admin") {
        return {
          success: false,
          error: "Unauthorized: You can only delete your own messages",
        };
      }
    }

    // Delete message
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Delete message error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete message",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete message error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
