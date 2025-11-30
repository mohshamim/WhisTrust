"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Building2, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { signInClient, getOrganizationBySubdomain } from "@/lib/services/client-auth";
import type { ClientOrganization } from "@/lib/services/client-auth";
import { getSSOConfig, initiateSSOLogin, type SSOProvider } from "@/lib/services/sso-auth";

export default function ClientLoginPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  
  const [organization, setOrganization] = useState<ClientOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<SSOProvider | null>(null); // Track which provider is loading
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [ssoConfig, setSsoConfig] = useState<{
    enabled: boolean;
    provider: SSOProvider | null;
  } | null>(null);

  // Check for error in URL (from SSO callback)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
      // Clear error from URL
      router.replace(`/org/${subdomain}/login`);
    }
  }, [searchParams, router, subdomain]);

  useEffect(() => {
    loadOrganization();
  }, [subdomain]);

  useEffect(() => {
    if (organization) {
      loadSSOConfig();
    }
  }, [organization, subdomain]);

  // Apply branding theme and favicon live
  useEffect(() => {
    if (!organization) return;
    const mode = organization.branding?.theme_mode;
    if (mode === "dark") document.documentElement.classList.add("dark");
    if (mode === "light") document.documentElement.classList.remove("dark");
    const hex = organization.branding?.primary_color as string | undefined;
    if (hex) {
      const toHsl = (h: string) => {
        let c = h.replace("#", "");
        if (c.length === 3) c = c.split("").map((x) => x + x).join("");
        const r = parseInt(c.substring(0, 2), 16) / 255;
        const g = parseInt(c.substring(2, 4), 16) / 255;
        const b = parseInt(c.substring(4, 6), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let hh = 0;
        let s = 0;
        const l = (max + min) / 2;
        const d = max - min;
        if (d !== 0) {
          s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
          switch (max) {
            case r:
              hh = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              hh = (b - r) / d + 2;
              break;
            case b:
              hh = (r - g) / d + 4;
              break;
          }
          hh /= 6;
        }
        return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };
      const hsl = toHsl(hex);
      document.documentElement.style.setProperty("--brand-primary", hex);
      document.documentElement.style.setProperty("--primary", hsl);
      document.documentElement.style.setProperty("--ring", hsl);
      document.documentElement.style.setProperty("--sidebar-primary", hsl);
      const [hStr, sStr, lStr] = hsl.split(" ");
      const h = hStr;
      const s = sStr;
      const baseL = parseInt(lStr);
      const steps = [0, -10, 10, -20, 20];
      steps.forEach((delta, idx) => {
        const l = Math.max(0, Math.min(100, baseL + delta));
        document.documentElement.style.setProperty(`--chart-${idx + 1}`, `${h} ${s} ${l}%`);
      });
    }
    if (organization.branding?.favicon_url) {
      const existing = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      const link = existing || document.createElement("link");
      link.rel = "icon";
      link.href = organization.branding.favicon_url;
      if (!existing) document.head.appendChild(link);
    }
  }, [organization]);

  const loadOrganization = async () => {
    try {
      const result = await getOrganizationBySubdomain(subdomain);
      
      if (!result.success || !result.organization) {
        setError("Organization not found. Please check the URL.");
        setLoading(false);
        return;
      }

      if (result.organization.status === 'cancelled') {
        setError("This organization is no longer active. Please contact support.");
        setLoading(false);
        return;
      }

      setOrganization(result.organization);
    } catch (err) {
      console.error("Failed to load organization:", err);
      setError("Failed to load organization details.");
    } finally {
      setLoading(false);
    }
  };

  const loadSSOConfig = async () => {
    try {
      const result = await getSSOConfig(subdomain);
      if (result.success && result.config) {
        setSsoConfig({
          enabled: result.config.sso_enabled,
          provider: result.config.sso_provider,
        });
      }
    } catch (err) {
      console.error("Failed to load SSO config:", err);
      // Don't show error - SSO is optional
    }
  };

  const handleSSOLogin = async (provider: SSOProvider) => {
    setSsoLoading(provider); // Set which provider is loading
    setError("");

    try {
      const result = await initiateSSOLogin(subdomain, provider);
      
      if (!result.success) {
        setError(result.error || "Failed to initiate SSO login");
        setSsoLoading(null);
        return;
      }

      // Redirect to OAuth provider
      if (result.redirectUrl) {
        // Don't reset loading state - we're redirecting
        window.location.href = result.redirectUrl;
      } else {
        setSsoLoading(null);
      }
    } catch (err: any) {
      console.error("SSO login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setSsoLoading(null);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signInClient(formData.email, formData.password, subdomain);

      if (!result.success) {
        setError(result.error || "Login failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      router.push(`/org/${subdomain}/dashboard`);
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Organization Not Found</CardTitle>
              <CardDescription>{error || "The organization you're looking for doesn't exist."}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Please check the URL and try again, or contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Secure Staff Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center space-y-4">
            {/* Organization Logo */}
            {(() => {
              const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");
              const logo =
                (isDark ? organization.branding?.logo_dark_url : organization.branding?.logo_light_url) ||
                organization.branding?.logo_url ||
                "";
              return (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  {logo ? (
                    <img src={logo} alt={organization.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <Building2 className="h-8 w-8 text-primary" />
                  )}
                </div>
              );
            })()}

            {/* Organization Title */}
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">{organization.name}</CardTitle>
              <CardDescription className="text-base">
                Staff Portal - Secure Access
              </CardDescription>
            </div>

            {/* Status Badges */}
            {organization.status === 'trial' && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                Trial Account
              </span>
            )}
            {organization.status === 'suspended' && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  Account Suspended - Contact Administrator
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {organization.status === 'suspended' ? (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-destructive">Account Suspended</p>
                  <p className="text-sm text-muted-foreground">Please contact your administrator for assistance.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* SSO Login Buttons */}
                {ssoConfig?.enabled && (
                  <div className="space-y-3">
                    {/* Google SSO Button */}
                    <Button
                      type="button"
                      size="lg"
                      variant="ghost"
                      className="w-full h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition-all duration-200 font-medium text-gray-700 dark:text-gray-200"
                      onClick={() => handleSSOLogin("google")}
                      disabled={ssoLoading !== null || isLoading}
                    >
                      <div className="flex items-center justify-center gap-3 w-full">
                        {ssoLoading === "google" ? (
                          <>
                            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Redirecting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            <span className="text-sm font-medium">Sign in with Google</span>
                          </>
                        )}
                      </div>
                    </Button>

                    {/* Microsoft SSO Button */}
                    <Button
                      type="button"
                      size="lg"
                      variant="ghost"
                      className="w-full h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition-all duration-200 font-medium text-gray-700 dark:text-gray-200"
                      onClick={() => handleSSOLogin("azure")}
                      disabled={ssoLoading !== null || isLoading}
                    >
                      <div className="flex items-center justify-center gap-3 w-full">
                        {ssoLoading === "azure" ? (
                          <>
                            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Redirecting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                              <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                              <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                              <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                            </svg>
                            <span className="text-sm font-medium">Sign in with Microsoft</span>
                          </>
                        )}
                      </div>
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={isLoading || ssoLoading !== null}
                      className="h-11"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      disabled={isLoading || ssoLoading !== null}
                      className="h-11"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    variant="default"
                    className="w-full h-12 rounded-lg shadow-md hover:shadow-lg focus-visible:ring-4"
                    disabled={isLoading || ssoLoading}
                  >
                    {isLoading ? "Signing in..." : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-6 border-t space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Secure access to {organization.name} compliance portal</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Powered by <strong className="font-semibold">WhisTrust</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground text-center">
          Need help? Contact your organization administrator
        </p>
      </div>
    </div>
  );
}
