"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, Clock, CheckCircle2, AlertCircle, ArrowRight, Eye } from "lucide-react";
import { getOrganizationBySubdomain } from "@/lib/services/client-auth";
import type { ClientOrganization } from "@/lib/services/client-auth";

interface Report {
  case_number: string;
  tracking_code: string;
  category: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export default function TrackReportPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  
  const [organization, setOrganization] = useState<ClientOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [report, setReport] = useState<Report | null>(null);
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

      setOrganization(result.organization);
    } catch (err) {
      console.error("Failed to load organization:", err);
      setError("Failed to load organization details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setReport(null);
    setSearching(true);

    try {
      const response = await fetch('/api/reports/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          trackingCode: trackingCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Report not found');
        setSearching(false);
        return;
      }

      setReport(data.report);
    } catch (err: any) {
      console.error("Track error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-500/15 text-blue-700 border-blue-500/30 border-2';
      case 'under_review':
        return 'bg-purple-500/15 text-purple-700 border-purple-500/30 border-2';
      case 'investigating':
        return 'bg-amber-500/15 text-amber-700 border-amber-500/30 border-2';
      case 'resolved':
        return 'bg-green-500/15 text-green-700 border-green-500/30 border-2';
      case 'closed':
        return 'bg-gray-500/15 text-gray-700 border-gray-500/50 border-2';
      case 'dismissed':
        return 'bg-red-500/15 text-red-700 border-red-500/30 border-2';
      default:
        return 'bg-slate-500/15 text-slate-700 border-slate-500/50 border-2';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/15 text-red-700 border-red-500/30 border-2';
      case 'high':
        return 'bg-orange-500/15 text-orange-700 border-orange-500/30 border-2';
      case 'medium':
        return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30 border-2';
      case 'low':
        return 'bg-green-500/15 text-green-700 border-green-500/30 border-2';
      default:
        return 'bg-gray-500/15 text-gray-700 border-gray-500/50 border-2';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Organization Not Found</CardTitle>
              <CardDescription>{error}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Search className="h-6 w-6" />
              Track Your Case
            </CardTitle>
            <CardDescription className="text-base">
              Enter your tracking code to view case status and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Enter tracking code (e.g., ABC1234-WXYZ)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                className="font-mono h-12"
                required
                maxLength={13}
              />
              <Button type="submit" disabled={searching} className="h-12">
                {searching ? "Loading..." : "View Case"}
              </Button>
            </form>

            {error && !report && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Case Details Card */}
        {report && (
          <>
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">Case Details</CardTitle>
                    <CardDescription>
                      Tracking Code: {report.tracking_code}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Case Info */}
                <div>
                  <h3 className="text-2xl font-bold mb-1">Case {report.case_number}</h3>
                  <p className="text-base text-muted-foreground">{report.title}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p className="mt-1 capitalize">{report.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Priority
                    </p>
                    <div className="mt-1">
                      <Badge variant="outline" className={getPriorityColor(report.priority)}>
                        {report.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Submitted
                    </p>
                    <p className="mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="mt-1">{new Date(report.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status Info */}
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                    {report.status === 'submitted' && "✅ Your report has been received and is awaiting review by our compliance team."}
                    {report.status === 'under_review' && "👀 Your report is under review by our compliance team."}
                    {report.status === 'investigating' && "🔍 Your report is currently being investigated by our team."}
                    {report.status === 'resolved' && "✅ Your report has been investigated and resolved."}
                    {report.status === 'closed' && "✅ This case has been closed. Thank you for your report."}
                    {report.status === 'dismissed' && "ℹ️ This report has been reviewed and dismissed."}
                  </AlertDescription>
                </Alert>

                {/* Security Notice */}
                <Alert className="border-primary/20 bg-primary/5">
                  <Shield className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    <strong className="font-semibold">Your anonymity is protected.</strong> Only authorized compliance staff can view this report. Your identity remains confidential.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Submit New Report Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="h-12"
                onClick={() => window.location.href = `/org/${subdomain}/report`}
              >
                Submit a New Report
              </Button>
            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-sm text-muted-foreground text-center">
          Powered by <strong className="font-semibold">WhisTrust</strong> - Secure Anonymous Reporting Platform
        </p>
      </div>
    </div>
  );
}
