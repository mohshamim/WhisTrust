"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Import Supabase client
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      // Sign in with Supabase (client-side)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError || !authData.user) {
        setError(authError?.message || "Authentication failed");
        setIsLoading(false);
        return;
      }

      console.log("✅ Authentication successful for:", authData.user.email);

      // Verify user is a super admin
      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("is_super_admin, role")
        .eq("id", authData.user.id)
        .maybeSingle();

      console.log("Profile check:", { profile, profileError });

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setError("Failed to verify admin privileges. Please try again.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!profile || !profile.is_super_admin) {
        setError("Access denied. Super admin privileges required.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      console.log("✅ Super admin verified! Redirecting to dashboard...");

      // Update last login
      await supabase
        .from("admin_profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", authData.user.id);

      // Redirect to super admin dashboard
      router.push("/superadmin/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Super Admin Portal</CardTitle>
            <CardDescription className="text-base">
              Platform administration - Manage all organizations
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="superadmin@whistrust.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
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
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In as Super Admin"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
              <p>Super Admin access is restricted to platform administrators.</p>
              <p className="mt-1">All login attempts are logged for security.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

