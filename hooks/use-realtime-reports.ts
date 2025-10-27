"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Report } from "@/lib/types/database";

interface UseRealtimeReportsProps {
  onNewReport?: (report: Report) => void;
  onReportUpdate?: (report: Report) => void;
  enabled?: boolean;
}

/**
 * Custom hook for realtime report updates in admin dashboard
 * Listens for new reports and report status changes
 */
export function useRealtimeReports({
  onNewReport,
  onReportUpdate,
  enabled = true,
}: UseRealtimeReportsProps) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();

    // Subscribe to reports channel
    const channel = supabase
      .channel("reports:all")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          const newReport = payload.new as Report;
          if (onNewReport) {
            onNewReport(newReport);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          const updatedReport = payload.new as Report;
          if (onReportUpdate) {
            onReportUpdate(updatedReport);
          }
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
  }, [enabled, onNewReport, onReportUpdate]);

  return { isConnected };
}
