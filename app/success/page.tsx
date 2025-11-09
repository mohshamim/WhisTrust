"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

export default function SuccessPage() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get tracking code from sessionStorage
    const code = sessionStorage.getItem("trackingCode");
    if (!code) {
      // If no tracking code, redirect to report page
      router.push("/report");
    } else {
      // Set tracking code after checking for existence
      setTrackingCode(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyCode = async () => {
    if (trackingCode) {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      toast.success("Tracking code copied to clipboard!");
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-500">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Report Submitted Successfully
            </CardTitle>
            <CardDescription className="text-base">
              Your anonymous report has been received and is being reviewed by
              our compliance team.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 border-2 border-dashed border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Your Tracking Code
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className={`h-8 transition-colors ${
                    copied ? 'text-green-600 hover:text-green-600' : ''
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Code Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-center">
                <code className="text-4xl font-mono font-bold text-primary tracking-wider">
                  {trackingCode}
                </code>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Save this code to track your case status. This is the only way
                to access your report.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                </div>
                <div className="flex-1 text-sm space-y-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    What happens next?
                  </p>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Your report will be reviewed within 24-48 hours</li>
                    <li>You can track your case using the code above</li>
                    <li>
                      Our team may request additional information anonymously
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                <div className="mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-amber-600" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Important
                  </p>
                  <p className="text-amber-800 dark:text-amber-200">
                    Keep your tracking code safe and confidential. Without it,
                    you won&apos;t be able to access updates about your report.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button asChild className="w-full h-12 text-base font-semibold">
                <Link href={`/track?code=${trackingCode}`}>
                  Track My Case
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/report">Submit Another Report</Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                Need assistance? Contact{" "}
                <Link
                  href="mailto:compliance@whistrust.com"
                  className="underline hover:text-foreground"
                >
                  compliance@whistrust.com
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
