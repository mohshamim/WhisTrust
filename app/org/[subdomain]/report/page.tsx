"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ArrowRight, Lock, Check, Copy, AlertCircle, FileUp, Mail, User } from "lucide-react";
import { getOrganizationBySubdomain } from "@/lib/services/client-auth";
import type { ClientOrganization } from "@/lib/services/client-auth";
import { toast } from "sonner";

export default function AnonymousReportPage() {
  const router = useRouter();
  const params = useParams();
  const subdomain = params.subdomain as string;
  
  const [organization, setOrganization] = useState<ClientOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    file: null as File | null,
    provideIdentity: false,
    name: "",
    email: "",
  });
  
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isFormValid = () => {
    const hasCategory = formData.category && formData.category.trim().length > 0;
    const hasTitle = formData.title && formData.title.trim().length > 0;
    const hasDescription = formData.description && formData.description.trim().length >= 50;
    return hasCategory && hasTitle && hasDescription;
  };

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

      if (result.organization.status !== 'active') {
        setError("This organization is not currently accepting reports.");
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
    setSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Submit the report
      const response = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          category: formData.category,
          title: formData.title,
          description: formData.description,
          reporterEmail: formData.provideIdentity && formData.email ? formData.email : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `Failed to submit report (${response.status})`);
      }

      const data = await response.json();

      // Step 2: Upload file if present
      if (formData.file && data.reportId) {
        setUploadProgress(10);

        const attachmentFormData = new FormData();
        attachmentFormData.append("reportId", data.reportId);
        attachmentFormData.append("file", formData.file);

        const uploadResponse = await fetch("/api/reports/upload-attachment", {
          method: "POST",
          body: attachmentFormData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success) {
          const message =
            uploadData?.error ||
            "File upload failed. Please try again without the attachment.";
          console.error("File upload failed:", message);
          setError(
            `Report submitted successfully, but file upload failed: ${message}`
          );
        } else {
          setUploadProgress(100);
        }
      }

      // Store tracking code and case number in session storage
      sessionStorage.setItem("trackingCode", data.trackingCode);
      if (data.caseNumber) {
        sessionStorage.setItem("caseNumber", data.caseNumber);
      }

      // Redirect to global success page
      router.push(`/success`);
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Unsupported file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.");
        return;
      }
      setFormData({ ...formData, file });
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

  // Success screen
  if (trackingCode) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-500">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Report Submitted Successfully
              </CardTitle>
              <CardDescription className="text-base">
                Your anonymous report has been received and is being reviewed by our compliance team.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Tracking Code Display */}
              <div className="bg-muted/50 rounded-lg p-6 border-2 border-dashed border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Your Tracking Code
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(trackingCode)}
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
                  Save this code to track your case status. This is the only way to access your report.
                </p>
              </div>

              {/* Info Boxes */}
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
                      <li>Our team may request additional information anonymously</li>
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
                      Keep your tracking code safe and confidential. Without it, you won&apos;t be able to access updates about your report.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={() => router.push(`/org/${subdomain}/track`)}
                  className="w-full h-12 text-base font-semibold"
                >
                  Track My Case
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button 
                  onClick={() => window.location.href = `/org/${subdomain}/report`}
                  variant="outline"
                  className="w-full"
                >
                  Submit Another Report
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-center text-muted-foreground">
                  Need assistance? Contact your organization&apos;s compliance team
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const features = (organization as any).features || {};
  const monthUsed = (organization as any).current_reports_count || 0;
  const monthCap = (organization as any).max_reports_per_month || 0;
  const atMonthlyLimit = monthCap > 0 && monthUsed >= monthCap;
  const nearMonthlyLimit = monthCap > 0 && monthUsed / monthCap >= 0.8 && !atMonthlyLimit;

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
              Your identity will remain confidential. All information is securely encrypted.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!features.anonymous_reporting && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Anonymous reporting is currently disabled for this organization.
                </AlertDescription>
              </Alert>
            )}
            {atMonthlyLimit && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Monthly report limit reached ({monthUsed} / {monthCap}). Please try again next month.
                </AlertDescription>
              </Alert>
            )}
            {!atMonthlyLimit && features.anonymous_reporting && (
              <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  Your report is submitted anonymously. You&apos;ll receive a tracking code to monitor progress.
                  {nearMonthlyLimit && (
                    <> You&apos;re nearing the monthly report limit ({monthUsed} / {monthCap}).</>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger id="category" className="h-12 w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fraud">Fraud & Financial Misconduct</SelectItem>
                    <SelectItem value="harassment">Harassment & Discrimination</SelectItem>
                    <SelectItem value="safety">Safety & Health Violations</SelectItem>
                    <SelectItem value="ethical">Ethical Violations</SelectItem>
                    <SelectItem value="data_breach">Data Privacy & Security</SelectItem>
                    <SelectItem value="theft">Theft / Misappropriation</SelectItem>
                    <SelectItem value="corruption">Corruption / Bribery</SelectItem>
                    <SelectItem value="conflict">Conflict of Interest</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Brief summary of the incident"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={submitting}
                  maxLength={200}
                  className="h-12"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please provide a detailed description of the incident, including when and where it occurred..."
                  className="min-h-[180px] sm:min-h-[220px] resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  disabled={submitting}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Minimum 50 characters
                  </p>
                  <p className={`text-xs font-medium ${
                    formData.description.trim().length >= 50 
                      ? 'text-green-600 dark:text-green-500' 
                      : 'text-muted-foreground'
                  }`}>
                    {formData.description.trim().length}/50
                  </p>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    id="attachment"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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

              {/* Contact Information Checkbox */}
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
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button and Validation */}
              <div className="pt-4 space-y-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-sm hover:shadow-md transition-shadow"
                  disabled={submitting || !isFormValid() || !features.anonymous_reporting || atMonthlyLimit}
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
                
                {/* Validation feedback */}
                {!isFormValid() && !submitting && (
                  <p className="text-xs text-center text-destructive">
                    {!formData.category && "Please select a category. "}
                    {!formData.title && "Please provide a title. "}
                    {formData.description.trim().length < 50 && 
                      `Please provide at least ${50 - formData.description.trim().length} more characters in the description.`
                    }
                  </p>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
