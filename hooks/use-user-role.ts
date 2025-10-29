"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AdminRole = "admin" | "manager" | "investigator" | "hr";

export function useUserRole() {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRole = async () => {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) {
            setRole(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("admin_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          if (isMounted) {
            setRole(null);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setRole((data?.role as AdminRole) || null);
          setLoading(false);
        }
      } catch (_) {
        if (isMounted) {
          setRole(null);
          setLoading(false);
        }
      }
    };

    fetchRole();
    return () => {
      isMounted = false;
    };
  }, []);

  return { role, loading };
}

export const Permissions = {
  canViewAnalytics: (role: AdminRole | null) => role === "admin" || role === "manager",
  canViewAuditLogs: (role: AdminRole | null) => role === "admin" || role === "manager",
  canAssignCases: (role: AdminRole | null) => role === "admin" || role === "manager",
  canEditReports: (role: AdminRole | null) => role === "admin" || role === "manager" || role === "investigator",
  canManageUsers: (role: AdminRole | null) => role === "admin",
};


