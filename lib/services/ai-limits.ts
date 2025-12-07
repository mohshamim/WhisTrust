import { createServiceClient } from "@/lib/supabase/service-client";

type FeatureType = 'smart_search' | 'risk_predictor' | 'attachment_analyzer';

export interface UsageCheck {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date | null;
  message?: string;
}

/**
 * Check AI usage limit - ONLY for demo organization
 * Returns allowed: true for all other organizations
 */
export async function checkAIUsageLimit(
  organizationSubdomain: string,
  featureType: FeatureType
): Promise<UsageCheck> {
  // Only apply limits to demo organization
  if (organizationSubdomain !== 'demo') {
    return {
      allowed: true,
      used: 0,
      limit: 0,
      remaining: 999,
      resetAt: null
    };
  }

  const supabase = createServiceClient();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  // Get demo organization
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, max_ai_requests_per_day, ai_usage_per_feature, ai_requests_reset_at")
    .eq("subdomain", "demo")
    .single();

  if (error || !org) {
    console.error("❌ Error checking AI usage limit:", error);
    // Fail open - allow if check fails
    return {
      allowed: true,
      used: 0,
      limit: 3,
      remaining: 3,
      resetAt: dayEnd
    };
  }

  console.log(`🔍 Checking usage for ${featureType}:`, {
    max_ai_requests_per_day: org.max_ai_requests_per_day,
    ai_usage_per_feature: org.ai_usage_per_feature,
    ai_requests_reset_at: org.ai_requests_reset_at
  });

  // Check if reset period has passed (new day)
  const resetAt = org.ai_requests_reset_at 
    ? new Date(org.ai_requests_reset_at) 
    : dayEnd;
  
  const usageData = (org.ai_usage_per_feature as any) || {};
  const featureUsage = usageData[featureType] || 0;
  
  console.log(`📊 Current usage for ${featureType}:`, featureUsage, "from data:", usageData);

  if (resetAt < now) {
    // Reset period passed - reset all feature counters for new day
    await supabase
      .from("organizations")
      .update({
        ai_usage_per_feature: {
          smart_search: 0,
          risk_predictor: 0,
          attachment_analyzer: 0
        },
        ai_requests_reset_at: dayEnd.toISOString()
      })
      .eq("subdomain", "demo");

    return {
      allowed: true,
      used: 0,
      limit: org.max_ai_requests_per_day || 3,
      remaining: org.max_ai_requests_per_day || 3,
      resetAt: dayEnd
    };
  }

  const used = featureUsage || 0;
  const limit = org.max_ai_requests_per_day || 3;
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return {
    allowed,
    used,
    limit,
    remaining,
    resetAt,
    message: allowed 
      ? undefined 
      : `AI usage limit reached for demo organization. You've used ${used} of ${limit} requests today. Limit resets tomorrow.`
  };
}

/**
 * Increment AI usage - ONLY for demo organization
 */
export async function incrementAIUsage(
  organizationSubdomain: string,
  featureType: FeatureType
): Promise<void> {
  // Only track for demo organization
  if (organizationSubdomain !== 'demo') {
    return;
  }

  const supabase = createServiceClient();
  
  // Get current usage per feature
  const { data: current, error: fetchError } = await supabase
    .from("organizations")
    .select("ai_usage_per_feature")
    .eq("subdomain", "demo")
    .single();

  if (fetchError) {
    console.error("Error fetching current usage:", fetchError);
    throw fetchError;
  }

  const usageData = (current?.ai_usage_per_feature as any) || {};
  const currentFeatureUsage = usageData[featureType] || 0;
  const newFeatureUsage = currentFeatureUsage + 1;

  console.log(`📊 Incrementing ${featureType}: ${currentFeatureUsage} → ${newFeatureUsage}`);
  console.log("Current usage data:", usageData);

  // Create new usage object
  const newUsageData = {
    ...usageData,
    [featureType]: newFeatureUsage
  };

  console.log("New usage data:", newUsageData);

  // Update only the specific feature's usage
  const { data: updated, error: updateError } = await supabase
    .from("organizations")
    .update({ 
      ai_usage_per_feature: newUsageData,
      updated_at: new Date().toISOString()
    })
    .eq("subdomain", "demo")
    .select("ai_usage_per_feature")
    .single();

  if (updateError) {
    console.error("❌ Error incrementing AI usage:", updateError);
    throw updateError;
  }

  console.log(`✅ AI usage incremented for ${featureType}: ${currentFeatureUsage} → ${newFeatureUsage}`);
  console.log("Updated usage data:", updated?.ai_usage_per_feature);
}

