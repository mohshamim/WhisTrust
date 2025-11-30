"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "An error occurred";
  
  // Try to extract organization subdomain from various sources
  const getLoginUrl = () => {
    if (typeof window === 'undefined') return '/';
    
    // Try to get from URL params
    const orgParam = searchParams.get("org");
    if (orgParam) {
      return `/org/${orgParam}/login`;
    }
    
    // Try to extract from hostname (for subdomain-based routing)
    try {
      const hostname = window.location.hostname;
      const hostParts = hostname.split('.');
      if (hostParts.length >= 3) {
        const possibleSubdomain = hostParts[0];
        if (possibleSubdomain && 
            possibleSubdomain !== 'www' && 
            possibleSubdomain !== 'demo' && 
            possibleSubdomain !== 'superadmin') {
          return `/org/${possibleSubdomain}/login`;
        }
      }
    } catch (e) {
      // Ignore
    }
    
    // Try to get from referrer
    if (document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        const referrerHostname = referrerUrl.hostname;
        const referrerParts = referrerHostname.split('.');
        if (referrerParts.length >= 3) {
          const possibleSubdomain = referrerParts[0];
          if (possibleSubdomain && 
              possibleSubdomain !== 'www' && 
              possibleSubdomain !== 'demo' && 
              possibleSubdomain !== 'superadmin') {
            return `/org/${possibleSubdomain}/login`;
          }
        }
        // Also check pathname
        const pathMatch = referrerUrl.pathname.match(/\/org\/([a-z0-9-]+)/);
        if (pathMatch) {
          return `/org/${pathMatch[1]}/login`;
        }
      } catch (e) {
        // Ignore
      }
    }
    
    // Default to homepage if we can't determine
    return '/';
  };

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Error</CardTitle>
          </div>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you were trying to log in with SSO, please try again from your organization's login page.
            </p>
            {loginUrl !== '/' ? (
              <Button asChild className="w-full">
                <Link href={loginUrl}>Go to Login Page</Link>
              </Button>
            ) : (
              <Button asChild className="w-full" variant="outline">
                <Link href="/">Go to Homepage</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

