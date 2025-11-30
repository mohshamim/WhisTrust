import { NextResponse } from "next/server";

import { getActionTypes, getAuditUsers } from "@/lib/services/audit-logs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organizationId: string | undefined = body.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "organizationId is required" },
        { status: 400 }
      );
    }

    const [actions, users] = await Promise.all([
      getActionTypes(organizationId),
      getAuditUsers(organizationId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        actions,
        users,
      },
    });
  } catch (error) {
    console.error("Audit filters API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected audit filters error",
      },
      { status: 500 }
    );
  }
}


