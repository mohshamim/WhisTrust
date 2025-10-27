"use client";

import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/services/notifications";
import { useRouter } from "next/navigation";

// BRD Phase 3: Notification Bell Component
export function AdminNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID from auth
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { getCurrentAdmin } = await import("@/lib/services/auth");
        const admin = await getCurrentAdmin();
        if (admin.success && admin.user) {
          setCurrentUserId(admin.user.id);
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };
    loadCurrentUser();
  }, []);

  // Subscribe to realtime notifications
  const {
    isConnected,
    notifications: realtimeNotifications,
    unreadCount: realtimeUnreadCount,
  } = useRealtimeNotifications({
    userId: currentUserId || "",
  });

  // Update local state when realtime notifications change
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      setNotifications(realtimeNotifications);
      setUnreadCount(realtimeUnreadCount);
    }
  }, [realtimeNotifications, realtimeUnreadCount]);

  // Load initial notifications
  useEffect(() => {
    if (currentUserId) {
      loadNotifications();
    }
  }, [currentUserId]);

  const loadNotifications = async () => {
    if (!currentUserId) return;

    try {
      const { getUserNotifications } = await import(
        "@/lib/services/notifications"
      );
      const result = await getUserNotifications(currentUserId);

      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        setUnreadCount(result.notifications.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return;

    try {
      await markAllNotificationsRead(currentUserId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to case if resource_id exists
    if (notification.resource_id) {
      router.push(`/admin/cases`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer ${
                    !notification.read ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {isConnected && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 text-xs text-center text-muted-foreground">
              Live updates enabled
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
