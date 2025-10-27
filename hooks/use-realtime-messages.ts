"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types/database";

interface UseRealtimeMessagesProps {
  reportId: string | null;
  onNewMessage?: (message: Message) => void;
  enabled?: boolean;
}

/**
 * Custom hook for realtime message updates
 * Listens to Supabase Realtime for new messages on a specific report
 * Automatically cleans up subscriptions on unmount
 */
export function useRealtimeMessages({
  reportId,
  onNewMessage,
  enabled = true,
}: UseRealtimeMessagesProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const callbackRef = useRef(onNewMessage);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    if (!reportId || !enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();

    // Subscribe to messages channel for this specific report
    const channel = supabase
      .channel(`messages:report:${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `report_id=eq.${reportId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (callbackRef.current) {
            callbackRef.current(newMessage);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
        
        if (status === "SUBSCRIBED") {
          setError(null);
        } else if (status === "CHANNEL_ERROR") {
          setError(new Error("Failed to connect to realtime updates"));
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [reportId, enabled]);

  return { isConnected, error };
}
