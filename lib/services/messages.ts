/**
 * Messages Service
 * 
 * Data access layer for messages within reports.
 * BRD Phase 3: Includes client-side encryption for message content
 */

import { createClient } from "@/lib/supabase/client";
import type { Message, NewMessage } from "@/lib/types/database";
import { encryptMessage, decryptMessage } from "@/lib/utils/encryption";

/**
 * Get all messages for a specific report
 * BRD Phase 3: Decrypts messages before returning them
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

    // BRD Phase 3: Decrypt messages for display
    const decryptedMessages = messages?.map(msg => ({
      ...msg,
      content: decryptMessage(msg.content, reportId)
    })) || [];

    return { success: true, messages: decryptedMessages };
  } catch (error) {
    console.error("Error in getReportMessages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

/**
 * Send a new message
 * BRD Phase 3: Encrypts content before storing in database
 */
export async function sendMessage(
  data: NewMessage
): Promise<{ success: boolean; message?: Message; error?: string }> {
  try {
    const supabase = createClient();
    
    // BRD Phase 3: Encrypt message content before storing
    const encryptedContent = encryptMessage(data.content, data.report_id);
    
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        report_id: data.report_id,
        sender_type: data.sender_type,
        sender_id: data.sender_id || null,
        content: encryptedContent,
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }

    // Return decrypted message for immediate display
    const decryptedMessage = {
      ...message,
      content: data.content // Return original content (already decrypted for UI)
    };

    return { success: true, message: decryptedMessage };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return { success: false, error: "Failed to send message" };
  }
}
