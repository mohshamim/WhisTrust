import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit notifications trigger by IP: 30/min
    const ip = getClientIp(request);
    const rl = checkRateLimit(`notify:${ip}`, 30, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    // Notifications disabled by requirement; accept and no-op
    await request.json().catch(() => {});
    return NextResponse.json({ success: true, disabled: true });
  } catch (e: any) {
    console.error("Notify error:", e);
    return NextResponse.json({ success: false, error: e.message || "Server error" }, { status: 500 });
  }
}


