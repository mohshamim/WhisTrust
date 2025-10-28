"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, FileUp, Lock, Mail, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    file: null as File | null,
    provideIdentity: false,
    name: "",
    email: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Import the services
      const { submitReport } = await import("@/lib/services/reports");
      const { uploadFile } = await import("@/lib/services/storage");

      // Submit report to Supabase first
      const result = await submitReport({
        category: formData.category,
        description: formData.description,
        reporter_name:
          formData.provideIdentity && formData.name ? formData.name : undefined,
        reporter_email:
          formData.provideIdentity && formData.email
            ? formData.email
            : undefined,
      });

      if (result.success && result.trackingCode) {
        // Get the report ID for file upload
        const { getReportByTrackingCode } = await import(
          "@/lib/services/reports"
        );
        const reportResult = await getReportByTrackingCode(result.trackingCode);

        // If file exists, upload it
        if (formData.file && reportResult.report) {
          setUploadProgress(0);
          await uploadFile({
            reportId: reportResult.report.id,
            file: formData.file,
            onProgress: (progress) => {
              setUploadProgress(progress);
            },
          });
        }

        // Store tracking code in sessionStorage
        sessionStorage.setItem("trackingCode", result.trackingCode);
        setUploadProgress(0);
        router.push("/success");
      } else {
        alert(result.error || "Failed to submit report. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      // Validate supported types
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type. Please upload images or PDF files.");
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold leading-tight">
              Submit Anonymous Report
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Your identity will remain confidential. All information is
              securely encrypted.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                Your report is submitted anonymously. You&apos;ll receive a
                tracking code to monitor progress.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger id="category" className="h-12 w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fraud">
                      Fraud & Financial Misconduct
                    </SelectItem>
                    <SelectItem value="harassment">
                      Harassment & Discrimination
                    </SelectItem>
                    <SelectItem value="safety">
                      Safety & Health Violations
                    </SelectItem>
                    <SelectItem value="ethical">Ethical Violations</SelectItem>
                    <SelectItem value="data">
                      Data Privacy & Security
                    </SelectItem>
                    <SelectItem value="compliance">
                      Regulatory Compliance
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please provide a detailed description of the incident, including when and where it occurred..."
                  className="min-h-[180px] sm:min-h-[220px] resize-y"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    id="attachment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="attachment" className="cursor-pointer">
                    <FileUp className="h-10 w-10 mx-auto mb-2 text-muted-foreground group-hover:text-primary" />
                    {formData.file ? (
                      <>
                        <p className="text-sm font-medium">
                          {formData.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-full bg-muted rounded-full h-2 mt-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX, JPG, PNG (max 10MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="provideIdentity"
                    checked={showIdentity}
                    onCheckedChange={(checked) => setShowIdentity(!!checked)}
                  />
                  <Label
                    htmlFor="provideIdentity"
                    className="text-sm cursor-pointer"
                  >
                    I would like to provide my contact information (optional)
                  </Label>
                </div>

                {showIdentity && (
                  <div className="space-y-4 ml-7 p-4 bg-muted/50 rounded-lg border border-border animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        <User className="inline h-4 w-4 mr-1" />
                        Name (Optional)
                      </Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email (Optional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-sm hover:shadow-md transition-shadow"
                  disabled={
                    isSubmitting || !formData.category || !formData.description
                  }
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="underline hover:text-foreground"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
