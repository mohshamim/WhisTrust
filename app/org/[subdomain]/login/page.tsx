"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Building2, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { signInClient, getOrganizationBySubdomain } from "@/lib/services/client-auth";
import type { ClientOrganization } from "@/lib/services/client-auth";

export default function ClientLoginPage() {
  const router = useRouter();
  const params = useParams();
  const subdomain = params.subdomain as string;
  
  const [organization, setOrganization] = useState<ClientOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrganization();
  }, [subdomain]);

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
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              {organization.branding?.logo_url ? (
                <img 
                  src={organization.branding.logo_url} 
                  alt={organization.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-primary" />
              )}
            </div>

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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
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
