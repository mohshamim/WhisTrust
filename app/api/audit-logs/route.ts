import { NextResponse } from "next/server";

import { getAuditLogs } from "@/lib/services/audit-logs";

type RangeValue = "7" | "30" | "90" | "all";

const buildRange = (range: RangeValue | undefined) => {
  if (!range || range === "all") return undefined;
  const days = Number(range);
  if (Number.isNaN(days)) return undefined;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      organizationId,
      dateRange,
      actionFilter,
      userFilter,
      resourceFilter,
      searchTerm,
      limit,
    }: {
      organizationId?: string;
      dateRange?: RangeValue;
      actionFilter?: string;
      userFilter?: string;
      resourceFilter?: string;
      searchTerm?: string;
      limit?: number;
    } = body;

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "organizationId is required" },
        { status: 400 }
      );
    }

    const result = await getAuditLogs(
      organizationId,
      {
        dateRange: buildRange(dateRange),
        actionType: actionFilter,
        userId: userFilter,
        resourceType: resourceFilter,
        search: searchTerm,
      },
      limit ?? 100
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Audit logs API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected audit logs error",
      },
      { status: 500 }
    );
  }
}


