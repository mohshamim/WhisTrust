"use client";

import { useEffect, useState } from "react";
import { getCurrentEnvironmentInfo } from "@/lib/supabase/multi-tenant-client";
import { getEnvironment, getEnvironmentDisplayName } from "@/lib/config/environment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Database, Globe, Key } from "lucide-react";

/**
 * Test Page: Environment & Supabase Connection Test
 * 
 * This page verifies that:
 * 1. Environment detection works correctly
 * 2. Correct Supabase credentials are loaded
 * 3. Connection switching logic functions properly
 */
export default function ConnectionTestPage() {
  const [mounted, setMounted] = useState(false);
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [environment, setEnvironment] = useState<'demo' | 'production'>('demo');
  const [displayName, setDisplayName] = useState("");
  const [envVarsStatus, setEnvVarsStatus] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    
    // Get environment info
    try {
      const info = getCurrentEnvironmentInfo();
      setEnvInfo(info);
      setCurrentUrl(window.location.href);
      
      const env = getEnvironment();
      setEnvironment(env);
      setDisplayName(getEnvironmentDisplayName(env));
      
      // Check which env vars are available (client-side only shows what's in NEXT_PUBLIC_)
      setEnvVarsStatus({
        hasDemoUrl: !!process.env.NEXT_PUBLIC_DEMO_SUPABASE_URL,
        hasDemoKey: !!process.env.NEXT_PUBLIC_DEMO_SUPABASE_ANON_KEY,
        hasProdUrl: !!process.env.NEXT_PUBLIC_PROD_SUPABASE_URL,
        hasProdKey: !!process.env.NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY,
        // Fallback to generic ones
        hasGenericUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasGenericKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });
    } catch (error: any) {
      console.error("Environment detection error:", error);
      setEnvInfo({ error: error.message });
    }
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              🧪 Environment Connection Test
            </h1>
            <p className="text-muted-foreground">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isDemo = environment === 'demo';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            🧪 Environment Connection Test
          </h1>
          <p className="text-muted-foreground">
            Verify Supabase multi-environment setup before deployment
          </p>
        </div>

        {/* Current Environment Status */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Current Environment
            </CardTitle>
            <CardDescription>Detected environment and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <span className="font-medium">Environment:</span>
              <Badge variant={isDemo ? "secondary" : "default"} className="text-lg px-4 py-1">
                {displayName}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Current URL:</span>
                <code className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                  {currentUrl}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supabase Connection Info */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Connection
            </CardTitle>
            <CardDescription>Active Supabase instance details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {envInfo && !envInfo.error ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Connection Configuration Loaded
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Environment: <strong>{envInfo.environment}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Key className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Supabase URL</p>
                        <code className="text-sm font-mono break-all">
                          {envInfo.supabaseUrl}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Key className="h-4 w-4 text-purple-500" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Anon Key (Preview)</p>
                        <code className="text-sm font-mono">
                          {envInfo.anonKeyPreview}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : envInfo?.error ? (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Configuration Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {envInfo.error}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Loading environment info...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Variables Status */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Environment Variables Check
            </CardTitle>
            <CardDescription>Verify all required environment variables are set</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <EnvVarStatus 
                label="Demo Supabase URL" 
                envVar="NEXT_PUBLIC_DEMO_SUPABASE_URL"
                isSet={envVarsStatus.hasDemoUrl || envVarsStatus.hasGenericUrl}
                fallback={!envVarsStatus.hasDemoUrl && envVarsStatus.hasGenericUrl ? "Using NEXT_PUBLIC_SUPABASE_URL" : null}
              />
              <EnvVarStatus 
                label="Demo Supabase Anon Key" 
                envVar="NEXT_PUBLIC_DEMO_SUPABASE_ANON_KEY"
                isSet={envVarsStatus.hasDemoKey || envVarsStatus.hasGenericKey}
                fallback={!envVarsStatus.hasDemoKey && envVarsStatus.hasGenericKey ? "Using NEXT_PUBLIC_SUPABASE_ANON_KEY" : null}
              />
              <EnvVarStatus 
                label="Production Supabase URL" 
                envVar="NEXT_PUBLIC_PROD_SUPABASE_URL"
                isSet={envVarsStatus.hasProdUrl}
                warning={!envVarsStatus.hasProdUrl ? "Not set - required for production multi-tenant" : null}
              />
              <EnvVarStatus 
                label="Production Supabase Anon Key" 
                envVar="NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY"
                isSet={envVarsStatus.hasProdKey}
                warning={!envVarsStatus.hasProdKey ? "Not set - required for production multi-tenant" : null}
              />
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <p className="font-medium">For Local Development:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                <li>Create new Supabase project for production</li>
                <li>Add credentials to <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">.env.local</code></li>
                <li>Restart dev server: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">npm run dev</code></li>
                <li>Refresh this page to verify</li>
              </ol>
            </div>

            <div className="space-y-2">
              <p className="font-medium">For Vercel Deployment:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                <li>Go to Vercel Project Settings → Environment Variables</li>
                <li>Add all four variables (DEMO and PROD)</li>
                <li>Redeploy the project</li>
                <li>Visit this page on deployment to verify</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EnvVarStatus({ 
  label, 
  envVar, 
  isSet, 
  fallback, 
  warning 
}: { 
  label: string; 
  envVar: string; 
  isSet: boolean; 
  fallback?: string | null;
  warning?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      {isSet ? (
        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
      )}
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <code className="text-xs text-muted-foreground">{envVar}</code>
        {fallback && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            ⚠️ {fallback}
          </p>
        )}
        {warning && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
            {warning}
          </p>
        )}
      </div>
    </div>
  );
}

