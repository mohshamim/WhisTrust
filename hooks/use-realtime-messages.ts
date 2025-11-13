/**
 * Real-time Messages Hook
 * Subscribes to Supabase Realtime for live message updates
 */

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Message } from "@/lib/services/messages";

interface UseRealtimeMessagesOptions {
  reportId: string | null;
  onNewMessage?: (message: Message) => void;
  enabled?: boolean;
}

interface UseRealtimeMessagesReturn {
  isConnected: boolean;
}

export function useRealtimeMessages({
  reportId,
  onNewMessage,
  enabled = true,
}: UseRealtimeMessagesOptions): UseRealtimeMessagesReturn {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    // Don't subscribe if disabled or no reportId
    if (!enabled || !reportId) {
      setIsConnected(false);
      return;
    }

    const supabase = supabaseRef.current;

    // Create unique channel name for this report
    const channelName = `messages:report:${reportId}`;

    console.log(`[Realtime] Subscribing to ${channelName}`);

    // Subscribe to messages table for this specific report
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `report_id=eq.${reportId}`,
        },
        (payload) => {
          console.log("[Realtime] New message received:", payload);
          
          if (payload.new && onNewMessage) {
            onNewMessage(payload.new as Message);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status: ${status}`);
        
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log(`[Realtime] Unsubscribing from ${channelName}`);
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [reportId, enabled, onNewMessage]);

  return {
    isConnected,
  };
}

/**
 * Hook for subscribing to all messages in an organization
 * Used by admins to get notified of any new messages
 */
export function useRealtimeAllMessages({
  organizationId,
  onNewMessage,
  enabled = true,
}: {
  organizationId: string | null;
  onNewMessage?: (message: Message) => void;
  enabled?: boolean;
}): UseRealtimeMessagesReturn {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!enabled || !organizationId) {
      setIsConnected(false);
      return;
    }

    const supabase = supabaseRef.current;
    const channelName = `messages:org:${organizationId}`;

    console.log(`[Realtime] Subscribing to ${channelName}`);

    // Subscribe to all messages for this organization
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          console.log("[Realtime] New message in organization:", payload);
          
          if (payload.new) {
            const message = payload.new as Message;
            
            // Verify message belongs to this organization
            // (filtering by report's organization)
            const { data: report } = await supabase
              .from("reports")
              .select("organization_id")
              .eq("id", message.report_id)
              .single();

            if (report && report.organization_id === organizationId && onNewMessage) {
              onNewMessage(message);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status: ${status}`);
        
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      console.log(`[Realtime] Unsubscribing from ${channelName}`);
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [organizationId, enabled, onNewMessage]);

  return {
    isConnected,
  };
}

/**
 * Hook for presence - track who is viewing a report
 * Optional enhancement for "User X is viewing" indicator
 */
export function useReportPresence({
  reportId,
  userId,
  userName,
  enabled = true,
}: {
  reportId: string | null;
  userId: string | null;
  userName: string;
  enabled?: boolean;
}): {
  presenceUsers: Array<{ userId: string; userName: string }>;
} {
  const [presenceUsers, setPresenceUsers] = useState<
    Array<{ userId: string; userName: string }>
  >([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!enabled || !reportId || !userId) {
      setPresenceUsers([]);
      return;
    }

    const supabase = supabaseRef.current;
    const channelName = `presence:report:${reportId}`;

    console.log(`[Presence] Joining ${channelName}`);

    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: Array<{ userId: string; userName: string }> = [];

        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((presence) => {
            if (presence.userId !== userId) {
              // Don't include self
              users.push({
                userId: presence.userId,
                userName: presence.userName,
              });
            }
          });
        });

        setPresenceUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track own presence
          await channel.track({
            userId,
            userName,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      console.log(`[Presence] Leaving ${channelName}`);
      
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      setPresenceUsers([]);
    };
  }, [reportId, userId, userName, enabled]);

  return {
    presenceUsers,
  };
}
