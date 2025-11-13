"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Copy,
  Check,
  Info,
  AlertTriangle,
  FileSearch,
} from "lucide-react";

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;

  const [trackingCode, setTrackingCode] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get tracking code from URL params or session storage
    const codeFromUrl = searchParams.get("code");
    const caseFromUrl = searchParams.get("case");

    if (codeFromUrl) {
      setTrackingCode(codeFromUrl);
      if (caseFromUrl) {
        setCaseNumber(caseFromUrl);
      }
    } else {
      // Fallback to session storage (if redirected from report page)
      const storedCode = sessionStorage.getItem("trackingCode");
      const storedCase = sessionStorage.getItem("caseNumber");

      if (storedCode) {
        setTrackingCode(storedCode);
        if (storedCase) {
          setCaseNumber(storedCase);
        }
        // Clear from session storage after reading
        sessionStorage.removeItem("trackingCode");
        sessionStorage.removeItem("caseNumber");
      } else {
        // No tracking code found, redirect back to report page
        router.push(`/org/${subdomain}/report`);
      }
    }
  }, [subdomain, router, searchParams]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!trackingCode) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-3xl space-y-6">
        {/* Success Header */}
        <Card className="shadow-lg border-green-200 dark:border-green-900">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold text-green-700 dark:text-green-500">
              Report Submitted Successfully!
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Your report has been received and is being reviewed by our team.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tracking Code */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Your Tracking Code</h3>
              </div>
              
              <div className="bg-muted p-6 rounded-lg border-2 border-dashed border-primary/30">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Use this code to track your case:
                    </p>
                    <p className="text-3xl font-mono font-bold text-primary tracking-wider">
                      {trackingCode}
                    </p>
                    {caseNumber && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Case Number: <span className="font-semibold">{caseNumber}</span>
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Code Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <div className="space-y-3">
                  <p className="font-semibold">What happens next?</p>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li>Our compliance team will review your report within 24-48 hours</li>
                    <li>You can track the status of your case using the tracking code above</li>
                    <li>We may reach out for additional information if needed</li>
                    <li>All communication will be kept confidential</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Important Notice */}
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <div className="space-y-2">
                  <p className="font-semibold">Important:</p>
                  <ul className="space-y-1 ml-4 list-disc text-sm">
                    <li>Save your tracking code - this is the ONLY way to access your case</li>
                    <li>We recommend taking a screenshot or writing it down</li>
                    <li>This code cannot be recovered if lost</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href={`/org/${subdomain}/track?code=${trackingCode}`}
                className="flex-1"
              >
                <Button size="lg" className="w-full">
                  Track My Case
                </Button>
              </Link>
              
              <Link
                href={`/org/${subdomain}/report`}
                className="flex-1"
              >
                <Button size="lg" variant="outline" className="w-full">
                  Submit Another Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              If you have any questions or concerns about your report, you can:
            </p>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Use your tracking code to check the status and add messages</li>
              <li>Our team will respond to your messages within the case</li>
              <li>All communication remains anonymous unless you choose to identify yourself</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

