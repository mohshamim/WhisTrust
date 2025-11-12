"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Building2 } from "lucide-react";
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

      // Check if organization is accessible
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

      console.log("✅ Client admin logged in successfully");

      // Redirect to organization dashboard
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
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Organization Not Found</CardTitle>
            <CardDescription>{error || "The organization you're looking for doesn't exist."}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Please check the URL and try again, or contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use organization branding if available
  const primaryColor = organization.branding?.primary_color || '#3b82f6';

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2 pb-6">
            {/* Organization Logo or Icon */}
            <div 
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              {organization.branding?.logo_url ? (
                <img 
                  src={organization.branding.logo_url} 
                  alt={organization.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8" style={{ color: primaryColor }} />
              )}
            </div>

            <CardTitle className="text-3xl font-bold">{organization.name}</CardTitle>
            <CardDescription className="text-base">
              Staff Portal - Secure Access
            </CardDescription>

            {/* Status indicators */}
            {organization.status === 'trial' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs">
                Trial Account
              </div>
            )}
            {organization.status === 'suspended' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
                Account Suspended - Contact Administrator
              </div>
            )}
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {organization.status === 'suspended' ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="mb-2">This organization account has been suspended.</p>
                <p className="text-sm">Please contact your administrator for assistance.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
              <p>Secure access to {organization.name} compliance portal</p>
              <p className="mt-1">Powered by WhisTrust</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

