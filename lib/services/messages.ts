/**
 * Messages Service
 * 
 * Data access layer for messages within reports.
 */

import { createClient } from "@/lib/supabase/client";
import type { Message, NewMessage } from "@/lib/types/database";

/**
 * Get all messages for a specific report
 */
export async function getReportMessages(
  reportId: string
): Promise<{ success: boolean; messages?: Message[]; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messages: messages || [] };
  } catch (error) {
    console.error("Error in getReportMessages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

/**
 * Send a new message
 */
export async function sendMessage(
  data: NewMessage
): Promise<{ success: boolean; message?: Message; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        report_id: data.report_id,
        sender_type: data.sender_type,
        sender_id: data.sender_id || null,
        content: data.content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }

    return { success: true, message };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return { success: false, error: "Failed to send message" };
  }
}
