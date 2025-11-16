import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 60/min per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`notify:update:${ip}`, 60, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    // Notifications are disabled by requirement; return success without sending emails
    await request.json().catch(() => {});
    return NextResponse.json({ success: true, disabled: true });
  } catch (e: any) {
    console.error("Report update notify error:", e);
    return NextResponse.json({ success: false, error: e.message || "Server error" }, { status: 500 });
  }
}


