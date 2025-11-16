import { createServiceClient } from "@/lib/supabase/service-client";

type LimitCheck =
  | { allowed: true }
  | { allowed: false; status: number; message: string };

export async function assertCanCreateReport(organizationId: string): Promise<LimitCheck> {
  const supabase = createServiceClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, status, features, current_reports_count, max_reports_per_month")
    .eq("id", organizationId)
    .single();

  if (error || !org) {
    return { allowed: false, status: 404, message: "Organization not found" };
  }
  if (org.status !== "active") {
    return { allowed: false, status: 403, message: "Organization is not active" };
  }
  const features = (org.features as any) || {};
  if (features.anonymous_reporting === false) {
    return { allowed: false, status: 403, message: "Anonymous reporting is disabled for this organization" };
  }
  if (org.max_reports_per_month && org.current_reports_count >= org.max_reports_per_month) {
    return { allowed: false, status: 429, message: "Report limit reached for this month" };
  }
  return { allowed: true };
}

export async function bumpReportCount(organizationId: string): Promise<void> {
  const supabase = createServiceClient();
  try {
    const { error } = await supabase.rpc("increment_org_reports_count", { org_id: organizationId });
    if (error) {
      throw error;
    }
  } catch {
    // Fallback if RPC doesn't exist
    await supabase
      .from("organizations")
      .update({ current_reports_count: (await getCurrent("current_reports_count", organizationId)) + 1 })
      .eq("id", organizationId);
  }
}

export async function assertCanCreateAdmin(organizationId: string): Promise<LimitCheck> {
  const supabase = createServiceClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, features, current_admin_users, max_admin_users, status")
    .eq("id", organizationId)
    .single();

  if (error || !org) {
    return { allowed: false, status: 404, message: "Organization not found" };
  }
  if (org.status !== "active") {
    return { allowed: false, status: 403, message: "Organization is not active" };
  }
  const features = (org.features as any) || {};
  if (features.user_management === false) {
    return { allowed: false, status: 403, message: "User management is disabled for this organization" };
  }
  if (org.max_admin_users && org.current_admin_users >= org.max_admin_users) {
    return { allowed: false, status: 429, message: "User limit reached for this plan" };
  }
  return { allowed: true };
}

export async function bumpAdminCount(organizationId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("organizations")
    .update({ current_admin_users: (await getCurrent("current_admin_users", organizationId)) + 1 })
    .eq("id", organizationId);
}

async function getCurrent(column: "current_reports_count" | "current_admin_users", orgId: string): Promise<number> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("organizations").select(column).eq("id", orgId).single();
  return (data?.[column] as number) || 0;
}


