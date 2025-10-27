"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types/database";

interface UseRealtimeNotificationsProps {
  userId: string | null;
  enabled?: boolean;
}

/**
 * Custom hook for realtime notification updates
 * Listens to Supabase Realtime for new notifications for a specific user
 * Automatically cleans up subscriptions on unmount
 */
export function useRealtimeNotifications({
  userId,
  enabled = true,
}: UseRealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId || !enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotifications(data as Notification[]);
        const unread = data.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
          // Update unread count
          const unread = notifications.filter((n) => !n.read).length;
          setUnreadCount(unread);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [userId, enabled]);

  return {
    notifications,
    unreadCount,
    isConnected,
    setNotifications,
    setUnreadCount,
  };
}
