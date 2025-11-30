/**
 * SSO Callback Route
 * 
 * Handles OAuth/OIDC callback from SSO providers
 * Maps SSO user to organization and creates/updates profile
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/config/environment";
import { handleSSOCallback, logFailedSSOAttempt } from "@/lib/services/sso-auth";
import { getOrganizationFromRequest } from "@/lib/utils/subdomain";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const config = getSupabaseConfig();
    
        // Get organization subdomain from URL
        const hostname = request.headers.get("host") || "";
        const pathname = request.nextUrl.pathname;
        let organizationSubdomain = getOrganizationFromRequest(hostname, pathname);
        
        // If not found in URL, try to extract from state parameter (OAuth state)
        if (!organizationSubdomain) {
          const stateParam = request.nextUrl.searchParams.get("state");
          if (stateParam) {
            try {
              // Try to decode base64 JSON state
              const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString());
              if (decoded.org) {
                organizationSubdomain = decoded.org;
              }
            } catch (e) {
              // If not JSON, might be plain subdomain
              if (stateParam && stateParam.length < 50) {
                organizationSubdomain = stateParam;
              }
            }
          }
        }

        if (!organizationSubdomain) {
          return NextResponse.redirect(
            new URL("/error?message=Organization not found", request.url)
          );
        }

    // Create Supabase client for auth
    const supabaseAuth = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (_) {
            // ignore
          }
        },
      },
    });

    // Get the code from URL
    const code = request.nextUrl.searchParams.get("code");
    const error = request.nextUrl.searchParams.get("error");
    const errorDescription = request.nextUrl.searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      await logFailedSSOAttempt(
        organizationSubdomain,
        null,
        errorDescription || error,
        request.headers.get("x-forwarded-for") || undefined
      );

      return NextResponse.redirect(
        new URL(
          `/org/${organizationSubdomain}/login?error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    if (!code) {
      await logFailedSSOAttempt(
        organizationSubdomain,
        null,
        "Missing authorization code",
        request.headers.get("x-forwarded-for") || undefined
      );

      return NextResponse.redirect(
        new URL(
          `/org/${organizationSubdomain}/login?error=${encodeURIComponent("SSO authentication failed. Please try again.")}`,
          request.url
        )
      );
    }

    // Exchange code for session
    console.log("SSO Callback: Attempting to exchange code for session...");
    const { data: authData, error: authError } = await supabaseAuth.auth.exchangeCodeForSession(code);

    if (authError || !authData.user || !authData.session) {
      console.error("SSO Callback: Failed to exchange code:", {
        error: authError,
        hasUser: !!authData.user,
        hasSession: !!authData.session,
        errorMessage: authError?.message,
        errorStatus: authError?.status,
      });

      // More detailed error message
      let errorMessage = authError?.message || "SSO authentication failed";
      if (authError?.message?.includes("exchange") || authError?.message?.includes("external code")) {
        errorMessage = "OAuth configuration mismatch. Please verify Client ID and Secret in Supabase Dashboard match Google Cloud Console.";
      }

      await logFailedSSOAttempt(
        organizationSubdomain,
        authData.user?.email || null,
        errorMessage,
        request.headers.get("x-forwarded-for") || undefined
      );

      return NextResponse.redirect(
        new URL(
          `/org/${organizationSubdomain}/login?error=${encodeURIComponent(errorMessage)}`,
          request.url
        )
      );
    }

    const user = authData.user;
    const userEmail = user.email;

    if (!userEmail) {
      await logFailedSSOAttempt(
        organizationSubdomain,
        null,
        "No email in SSO response",
        request.headers.get("x-forwarded-for") || undefined
      );

      return NextResponse.redirect(
        new URL(
          `/org/${organizationSubdomain}/login?error=${encodeURIComponent("SSO provider did not return an email address")}`,
          request.url
        )
      );
    }

    // Handle SSO callback - create/update profile and verify organization
    const result = await handleSSOCallback(
      organizationSubdomain,
      userEmail,
      user.id,
      user.user_metadata || {}
    );

    if (!result.success) {
      // Sign out the user since we can't complete the login
      await supabaseAuth.auth.signOut();

      await logFailedSSOAttempt(
        organizationSubdomain,
        userEmail,
        result.error || "Failed to process SSO callback",
        request.headers.get("x-forwarded-for") || undefined
      );

      return NextResponse.redirect(
        new URL(
          `/org/${organizationSubdomain}/login?error=${encodeURIComponent(result.error || "SSO authentication failed")}`,
          request.url
        )
      );
    }

    // Success! Redirect to dashboard
    return NextResponse.redirect(
      new URL(`/org/${organizationSubdomain}/dashboard`, request.url)
    );
  } catch (error: any) {
    console.error("SSO callback error:", error);

    // Try to get organization subdomain for error redirect
    const hostname = request.headers.get("host") || "";
    const pathname = request.nextUrl.pathname;
    const organizationSubdomain = getOrganizationFromRequest(hostname, pathname);

    if (organizationSubdomain) {
      return NextResponse.redirect(
        new URL(
          `/org/${organizationSubdomain}/login?error=${encodeURIComponent("An unexpected error occurred during SSO authentication")}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL("/error?message=SSO authentication failed", request.url)
    );
  }
}

