import { NextRequest, NextResponse } from "next/server";
import { signInSuperAdmin } from "@/lib/services/super-admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Attempt to sign in
    const result = await signInSuperAdmin(email, password);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Super admin login API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during authentication",
      },
      { status: 500 }
    );
  }
}

