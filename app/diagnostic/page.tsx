"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiagnosticPage() {
  const [env, setEnv] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    try {
      // Check environment
      const { getEnvironment, getSupabaseConfig } = await import("@/lib/config/environment");
      const environment = getEnvironment();
      const config = getSupabaseConfig();

      setEnv({
        environment,
        url: config.url,
        hasKey: !!config.anonKey,
      });

      // Try to load organizations
      const { createMultiTenantClient } = await import("@/lib/supabase/multi-tenant-client");
      const supabase = createMultiTenantClient();

      const { data, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, slug, subdomain, status");

      if (orgError) {
        setError(orgError.message);
      } else {
        setOrgs(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Diagnostic Page</h1>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Detection</CardTitle>
          </CardHeader>
          <CardContent>
            {env ? (
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <strong>Environment:</strong> {env.environment}
                </div>
                <div>
                  <strong>Supabase URL:</strong> {env.url}
                </div>
                <div>
                  <strong>Has Anon Key:</strong> {env.hasKey ? "Yes" : "No"}
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </CardContent>
        </Card>

        {/* Organizations */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations in Database</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-600">Error: {error}</div>
            ) : orgs.length > 0 ? (
              <div className="space-y-3">
                {orgs.map((org) => (
                  <div key={org.id} className="p-3 border rounded">
                    <div className="font-semibold">{org.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Slug: {org.slug} | Subdomain: {org.subdomain} | Status: {org.status}
                    </div>
                    <div className="mt-2">
                      <a
                        href={`/org/${org.subdomain}/login`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Go to login →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No organizations found</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <a href="/org/codesquare/login" className="text-blue-600 hover:underline">
                CodeSquare Login
              </a>
            </div>
            <div>
              <a href="/org/al-bawani/login" className="text-blue-600 hover:underline">
                Al-Bawani Login
              </a>
            </div>
            <div>
              <a href="/superadmin/login" className="text-blue-600 hover:underline">
                Super Admin Login
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

