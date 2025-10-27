import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types/database";

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
      });

    if (error) {
      console.error("Notification creation error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Notification creation exception:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<{ success: boolean; notifications?: Notification[]; error?: string }> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, error: error.message };
    }

    return { success: true, notifications: data as Notification[] };
  } catch (error) {
    console.error("Notifications exception:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Mark notification read exception:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Mark all notifications read exception:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const supabase = createClient();

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error getting unread count:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Unread count exception:", error);
    return { success: false, error: "Failed to get unread count" };
  }
}
