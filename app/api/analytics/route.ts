import { NextResponse } from "next/server";

import {
  getAnalyticsSummary,
  getReportsByStatus,
  getReportsByCategory,
  getReportsTrend,
  getReportsByPriority,
  getCategoryMetrics,
} from "@/lib/services/analytics";

type DateRangePayload = "7" | "30" | "90" | "all";

function buildDateRange(range: DateRangePayload | undefined) {
  if (!range || range === "all") {
    return undefined;
  }

  const days = parseInt(range, 10);
  if (Number.isNaN(days)) {
    return undefined;
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return { start, end };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organizationId: string | undefined = body.organizationId;
    const dateRange: DateRangePayload | undefined = body.dateRange;

    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: "organizationId is required",
        },
        { status: 400 }
      );
    }

    const range = buildDateRange(dateRange);
    const trendDays =
      dateRange && dateRange !== "all" && !Number.isNaN(Number(dateRange))
        ? Number(dateRange)
        : 30;

    const [summaryResult, statusResult, categoryResult, trendResult, priorityResult, metricsResult] =
      await Promise.all([
        getAnalyticsSummary(organizationId, range),
        getReportsByStatus(organizationId, range),
        getReportsByCategory(organizationId, range),
        getReportsTrend(organizationId, trendDays),
        getReportsByPriority(organizationId, range),
        getCategoryMetrics(organizationId),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: summaryResult.data ?? null,
        byStatus: statusResult.data ?? [],
        byCategory: categoryResult.data ?? [],
        trend: trendResult.data ?? [],
        byPriority: priorityResult.data ?? [],
        categoryMetrics: metricsResult.data ?? [],
      },
      errors: {
        summary: summaryResult.error,
        status: statusResult.error,
        category: categoryResult.error,
        trend: trendResult.error,
        priority: priorityResult.error,
        metrics: metricsResult.error,
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected analytics error",
      },
      { status: 500 }
    );
  }
}


