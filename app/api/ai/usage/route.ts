import { NextRequest, NextResponse } from "next/server";
import { checkAIUsageLimit } from "@/lib/services/ai-limits";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain') || '';
    const feature = searchParams.get('feature') as 'smart_search' | 'risk_predictor' | 'attachment_analyzer' || 'smart_search';

    // Only return usage for demo
    if (subdomain !== 'demo') {
      return NextResponse.json({
        used: 0,
        limit: 0,
        remaining: 999,
        resetAt: null
      });
    }

    const usage = await checkAIUsageLimit(subdomain, feature);

    console.log(`📊 Usage API response for ${feature}:`, {
      used: usage.used,
      limit: usage.limit,
      remaining: usage.remaining,
      resetAt: usage.resetAt
    });

    return NextResponse.json({
      used: usage.used,
      limit: usage.limit,
      remaining: usage.remaining,
      resetAt: usage.resetAt,
      resetMessage: usage.resetAt ? "Resets tomorrow at midnight" : null
    });
  } catch (error) {
    console.error("Error fetching AI usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}

