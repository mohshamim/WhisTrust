"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ClientSidebar } from "@/components/client-sidebar";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAvatarUrl } from "@/lib/services/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { UsageBanner } from "@/components/usage-banner";

export default function CreateCasePage() {
  const router = useRouter();
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    priority: "medium",
    source: "",
    reporter_email: "",
    reporter_phone: "",
    internal_notes: "",
    has_contact_info: false,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdCase, setCreatedCase] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user: clientUser, organization: org } = await getCurrentClientAdmin();
      if (!clientUser || !org) {
        router.push(`/org/${subdomain}/login`);
        return;
      }
      setUser(clientUser);
      setOrganization(org);
    } catch (error) {
      console.error("Auth error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user || !organization) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const monthUsed = organization.current_reports_count || 0;
  const monthCap = organization.max_reports_per_month || 0;
  const atMonthlyLimit = monthCap > 0 && monthUsed >= monthCap;
  const nearMonthlyLimit = monthCap > 0 && monthUsed / monthCap >= 0.8 && !atMonthlyLimit;

  const categories = [
    { value: "fraud", label: "Fraud & Financial Misconduct" },
    { value: "harassment", label: "Harassment & Discrimination" },
    { value: "safety", label: "Safety & Health Violations" },
    { value: "corruption", label: "Corruption & Bribery" },
    { value: "data_breach", label: "Data Breach & Privacy" },
    { value: "theft", label: "Theft & Misappropriation" },
    { value: "ethical", label: "Ethical Violations" },
  ];

  const sources = [
    { value: "phone", label: "Phone Call" },
    { value: "in_person", label: "In-Person Meeting" },
    { value: "email", label: "Email Submission" },
    { value: "walk_in", label: "Walk-In" },
    { value: "written", label: "Written Complaint" },
  ];

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.category) newErrors.push("Please select a category");
    if (!formData.title.trim()) newErrors.push("Please provide a title");
    if (formData.description.trim().length < 50)
      newErrors.push("Description must be at least 50 characters");
    if (!formData.source) newErrors.push("Please select a source");

    if (formData.has_contact_info) {
      if (!formData.reporter_email && !formData.reporter_phone) {
        newErrors.push("Please provide either email or phone number");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch("/api/reports/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent with the request
        body: JSON.stringify({
          category: formData.category,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          source: formData.source,
          reporter_email: formData.has_contact_info ? formData.reporter_email : null,
          reporter_phone: formData.has_contact_info ? formData.reporter_phone : null,
          internal_notes: formData.internal_notes,
          is_anonymous: !formData.has_contact_info,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setCreatedCase(result.report);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push(`/org/${subdomain}/reports`);
        }, 3000);
      } else {
        setErrors([result.error || "Failed to create case"]);
      }
    } catch (error) {
      console.error("Error creating case:", error);
      setErrors(["An unexpected error occurred. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && createdCase) {
    return (
      <SidebarProvider>
        <ClientSidebar 
          user={{
            name: user.full_name || user.email,
            email: user.email,
            avatar: getAvatarUrl({ avatar_url: user.avatar_url, email: user.email }),
          }}
          organization={{
            name: organization.name,
            subdomain: organization.subdomain,
          }}
          userRole={user.role || "admin"}
        />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center p-6">
            <Card className="max-w-2xl w-full">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-500/10 rounded-full ring-8 ring-green-500/10">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Case Created Successfully!</CardTitle>
                <CardDescription className="text-base mt-2">
                  The offline case has been recorded in the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Case Number:</span>
                    <span className="font-mono font-bold">{createdCase.case_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Tracking Code:</span>
                    <span className="font-mono font-bold">{createdCase.tracking_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <span className="capitalize font-semibold">{createdCase.status}</span>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Redirecting to reports list in a few seconds...
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push(`/org/${subdomain}/reports`)}
                    className="flex-1"
                  >
                    View All Reports
                  </Button>
                  <Button
                    onClick={() => router.push(`/org/${subdomain}/reports/create`)}
                    variant="outline"
                  >
                    Create Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <ClientSidebar 
        user={{
          name: user.full_name || user.email,
          email: user.email,
          avatar: getAvatarUrl({ avatar_url: user.avatar_url, email: user.email }),
        }}
        organization={{
          name: organization.name,
          subdomain: organization.subdomain,
        }}
        userRole={user.role || "admin"}
      />
      <SidebarInset>
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Create New Case</h1>
                <p className="text-sm text-muted-foreground">
                  Manually record a report from offline sources
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationsDropdown 
                userId={user?.id || ""} 
                organizationId={organization?.id || ""} 
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-w-4xl mx-auto w-full">
            <UsageBanner organization={organization} />
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.push(`/org/${subdomain}/reports`)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>

            {/* Info / Limits Alert */}
            {atMonthlyLimit ? (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Monthly report limit reached ({monthUsed} / {monthCap}). Increase your plan or wait
                  until next period to record new cases.
                </AlertDescription>
              </Alert>
            ) : nearMonthlyLimit ? (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  You&apos;re nearing your monthly report limit ({monthUsed} / {monthCap}).
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Use this form to manually record reports received through phone calls, 
                  in-person meetings, emails, or other offline channels. All required information 
                  will be collected to ensure proper case tracking.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Case Details Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Case Details
                  </CardTitle>
                  <CardDescription>
                    Essential information about the incident
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Brief summary of the incident"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed information about the incident, including when and where it occurred, who was involved, and any other relevant details..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="min-h-[200px]"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Minimum 50 characters</span>
                      <span
                        className={
                          formData.description.length >= 50
                            ? "text-green-600 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {formData.description.length}/50
                      </span>
                    </div>
                  </div>

                  {/* Priority & Source */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source">
                        Source <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) =>
                          setFormData({ ...formData, source: value })
                        }
                      >
                        <SelectTrigger id="source">
                          <SelectValue placeholder="How was this received?" />
                        </SelectTrigger>
                        <SelectContent>
                          {sources.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reporter Information Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Reporter Information
                  </CardTitle>
                  <CardDescription>
                    Optional contact details if the reporter chose to provide them
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_contact_info"
                      checked={formData.has_contact_info}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          has_contact_info: checked as boolean,
                          reporter_email: checked ? formData.reporter_email : "",
                          reporter_phone: checked ? formData.reporter_phone : "",
                        })
                      }
                    />
                    <Label
                      htmlFor="has_contact_info"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Reporter provided contact information
                    </Label>
                  </div>

                  {/* Contact Fields */}
                  {formData.has_contact_info && (
                    <div className="grid md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="reporter_email">Email Address</Label>
                        <Input
                          id="reporter_email"
                          type="email"
                          placeholder="reporter@example.com"
                          value={formData.reporter_email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reporter_email: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reporter_phone">Phone Number</Label>
                        <Input
                          id="reporter_phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.reporter_phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reporter_phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Internal Notes Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Internal Notes
                  </CardTitle>
                  <CardDescription>
                    Add any additional context or notes for your team (not visible to reporter)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="internal_notes"
                    placeholder="Add any internal observations, follow-up actions, or relevant context..."
                    value={formData.internal_notes}
                    onChange={(e) =>
                      setFormData({ ...formData, internal_notes: e.target.value })
                    }
                    className="min-h-[120px]"
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || atMonthlyLimit}
                  className="flex-1"
                  size="lg"
                >
                  {isSubmitting ? "Creating Case..." : "Create Case"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/org/${subdomain}/reports`)}
                  disabled={isSubmitting}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

