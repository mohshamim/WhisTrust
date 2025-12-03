"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function ContactSetupPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/contact/test");
      const data = await response.json();
      setDiagnostics(data);
    } catch (error) {
      console.error("Diagnostic error:", error);
      setDiagnostics({ error: "Failed to run diagnostics" });
    }
    setLoading(false);
  };

  const copySQL = () => {
    const sql = `-- Run this in Supabase SQL Editor

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  company_size TEXT,
  subject TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (anonymous submissions)
CREATE POLICY "Allow public to insert contact submissions"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated admins to read
CREATE POLICY "Allow authenticated admins to read contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated admins to update
CREATE POLICY "Allow authenticated admins to update contact submissions"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_submissions_updated_at();`;

    navigator.clipboard.writeText(sql);
    toast.success("SQL copied to clipboard!");
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return status ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Contact Form Setup</h1>
        <p className="text-gray-600">
          Diagnostic tool to check and fix contact form issues
        </p>
      </div>

      <div className="space-y-6">
        {/* Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>System Diagnostics</CardTitle>
            <CardDescription>
              Current status of contact form components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Running diagnostics...</div>
            ) : diagnostics?.error ? (
              <div className="text-red-600">{diagnostics.error}</div>
            ) : (
              <>
                {/* Environment Variables */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Environment Variables</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Supabase URL</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {diagnostics?.diagnostics?.env_check?.supabaseUrl}
                        </span>
                        <StatusIcon
                          status={
                            diagnostics?.diagnostics?.env_check?.supabaseUrl !==
                            "MISSING"
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Supabase Anon Key</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {diagnostics?.diagnostics?.env_check?.supabaseAnonKey}
                        </span>
                        <StatusIcon
                          status={
                            diagnostics?.diagnostics?.env_check
                              ?.supabaseAnonKey !== "MISSING"
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Resend API Key</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {diagnostics?.diagnostics?.env_check?.resendKey}
                        </span>
                        <StatusIcon
                          status={
                            diagnostics?.diagnostics?.env_check?.resendKey !==
                            "MISSING"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Database Table Check */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Database Table</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">contact_submissions table</span>
                      <div className="flex items-center gap-2">
                        {diagnostics?.diagnostics?.table_check?.exists ? (
                          <Badge variant="outline" className="bg-green-50">
                            Exists
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50">
                            Missing
                          </Badge>
                        )}
                        <StatusIcon
                          status={diagnostics?.diagnostics?.table_check?.exists}
                        />
                      </div>
                    </div>
                    {diagnostics?.diagnostics?.table_check?.error && (
                      <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                        {diagnostics.diagnostics.table_check.error}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Button onClick={runDiagnostics} variant="outline" className="w-full">
              Refresh Diagnostics
            </Button>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {!loading &&
          diagnostics?.diagnostics?.table_check?.exists === false && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">
                  Setup Required
                </CardTitle>
                <CardDescription className="text-orange-700">
                  The contact_submissions table needs to be created in Supabase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Step 1: Copy SQL Script</h4>
                  <Button onClick={copySQL} className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy SQL to Clipboard
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">
                    Step 2: Run in Supabase SQL Editor
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      Go to{" "}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        Supabase Dashboard
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </li>
                    <li>Open your project</li>
                    <li>Go to SQL Editor (left sidebar)</li>
                    <li>Click "New Query"</li>
                    <li>Paste the SQL script you copied</li>
                    <li>Click "Run" button</li>
                    <li>
                      Return here and click "Refresh Diagnostics" to verify
                    </li>
                  </ol>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold">
                    Step 3: Add Resend API Key (Optional)
                  </h4>
                  <p className="text-sm text-gray-600">
                    For email notifications, add <code>RESEND_API_KEY</code> to
                    your environment variables in Vercel or .env.local
                  </p>
                  <p className="text-xs text-gray-500">
                    Note: Contact form will work without this, but won't send
                    email notifications
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Success State */}
        {!loading && diagnostics?.diagnostics?.table_check?.exists === true && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Setup Complete!
              </CardTitle>
              <CardDescription className="text-green-700">
                Contact form is ready to use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  The contact_submissions table exists and the form should work
                  correctly.
                </p>
                {diagnostics?.diagnostics?.env_check?.resendKey === "MISSING" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <strong>Note:</strong> Email notifications are disabled
                    because RESEND_API_KEY is not configured. Submissions will
                    still be saved to the database.
                  </div>
                )}
                <Button asChild className="w-full">
                  <a href="/contact">Test Contact Form</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternative File Location */}
        <Card>
          <CardHeader>
            <CardTitle>Alternative: Use Migration File</CardTitle>
            <CardDescription>
              You can also find the complete SQL script in your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">
              File location:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                supabase/RUN_CONTACT_MIGRATION.sql
              </code>
            </p>
            <p className="text-sm text-gray-600">
              Open this file, copy its contents, and run it in the Supabase SQL
              Editor.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

