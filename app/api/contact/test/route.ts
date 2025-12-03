import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    const diagnostics = {
      env_check: {
        supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING",
        supabaseAnonKey: supabaseAnonKey ? "Present" : "MISSING",
        resendKey: resendKey ? "Present" : "MISSING",
      },
      table_check: null as any,
      test_data: null as any,
    };

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: "Missing Supabase environment variables",
        diagnostics,
      }, { status: 500 });
    }

    // Check if table exists and RLS policies
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
      // Try to insert test data
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("id")
        .limit(1);

      diagnostics.table_check = {
        exists: !error,
        error: error?.message || null,
        errorCode: error?.code || null,
        canRead: !error,
      };

      if (!error && data) {
        diagnostics.test_data = {
          recordCount: data.length,
          message: "Table exists and is readable",
        };
      }
    } catch (tableError: any) {
      diagnostics.table_check = {
        exists: false,
        error: tableError.message,
      };
    }

    return NextResponse.json({
      success: true,
      message: "Contact form diagnostic check",
      diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Diagnostic check failed",
      details: error.message,
    }, { status: 500 });
  }
}

