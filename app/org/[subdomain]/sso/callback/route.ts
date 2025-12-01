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
    
    // Get organization subdomain from URL path (most reliable - it's in the route)
    const hostname = request.headers.get("host") || "";
    const pathname = request.nextUrl.pathname;
    const fullUrl = request.nextUrl.toString();
    
    console.log("[SSO Callback] Request details:", {
      hostname,
      pathname,
      fullUrl,
      searchParams: Object.fromEntries(request.nextUrl.searchParams),
    });
    
    let organizationSubdomain = getOrganizationFromRequest(hostname, pathname);
    
    // Fallback 1: Try to get from query parameter (we pass it in queryParams)
    if (!organizationSubdomain) {
      organizationSubdomain = request.nextUrl.searchParams.get("organization_subdomain") || null;
      console.log("[SSO Callback] Extracted from query param:", organizationSubdomain);
    }
    
    // Fallback 2: Try to extract from pathname manually (more robust)
    if (!organizationSubdomain && pathname) {
      const pathMatch = pathname.match(/\/org\/([a-z0-9-]+)/);
      if (pathMatch && pathMatch[1]) {
        organizationSubdomain = pathMatch[1];
        console.log("[SSO Callback] Extracted from pathname:", organizationSubdomain);
      }
    }
    
    // Fallback 3: Try to extract from referer header
    if (!organizationSubdomain) {
      const referer = request.headers.get("referer");
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          const refererPathMatch = refererUrl.pathname.match(/\/org\/([a-z0-9-]+)/);
          if (refererPathMatch && refererPathMatch[1]) {
            organizationSubdomain = refererPathMatch[1];
            console.log("[SSO Callback] Extracted from referer:", organizationSubdomain);
          }
        } catch (e) {
          console.error("[SSO Callback] Error parsing referer:", e);
        }
      }
    }

    if (!organizationSubdomain) {
      console.error("[SSO Callback] Failed to extract organization subdomain", {
        hostname,
        pathname,
        fullUrl,
        referer: request.headers.get("referer"),
        searchParams: Object.fromEntries(request.nextUrl.searchParams),
      });
      return NextResponse.redirect(
        new URL("/error?message=Organization not found. Please try logging in again from your organization's login page.", request.url)
      );
    }
    
    console.log("[SSO Callback] Organization subdomain:", organizationSubdomain);

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
    console.log("[SSO Callback] Attempting to exchange code for session...", {
      codeLength: code.length,
      organizationSubdomain,
    });
    const { data: authData, error: authError } = await supabaseAuth.auth.exchangeCodeForSession(code);

    if (authError || !authData.user || !authData.session) {
      console.error("[SSO Callback] Failed to exchange code:", {
        error: authError,
        errorCode: authError?.code,
        errorMessage: authError?.message,
        errorStatus: authError?.status,
        hasUser: !!authData.user,
        hasSession: !!authData.session,
        organizationSubdomain,
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
    console.log("[SSO Callback] Processing SSO callback:", {
      organizationSubdomain,
      userEmail,
      userId: user.id,
    });
    
    const result = await handleSSOCallback(
      organizationSubdomain,
      userEmail,
      user.id,
      user.user_metadata || {}
    );

    if (!result.success) {
      console.error("[SSO Callback] handleSSOCallback failed:", {
        error: result.error,
        organizationSubdomain,
        userEmail,
      });
      
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
    
    console.log("[SSO Callback] Success! Redirecting to dashboard");

    // Success! Redirect to dashboard
    return NextResponse.redirect(
      new URL(`/org/${organizationSubdomain}/dashboard`, request.url)
    );
  } catch (error: any) {
    console.error("[SSO Callback] Unexpected error:", {
      error: error.message,
      stack: error.stack,
      hostname: request.headers.get("host"),
      pathname: request.nextUrl.pathname,
      fullUrl: request.nextUrl.toString(),
    });

    // Try to get organization subdomain for error redirect
    const hostname = request.headers.get("host") || "";
    const pathname = request.nextUrl.pathname;
    const organizationSubdomain = getOrganizationFromRequest(hostname, pathname);

    if (organizationSubdomain) {
      return NextResponse.redirect(
        new URL(
          `/org/${organizationSubdomain}/login?error=${encodeURIComponent("An unexpected error occurred during SSO authentication. Please try again.")}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL("/error?message=SSO authentication failed. Please try logging in again from your organization's login page.", request.url)
    );
  }
}

