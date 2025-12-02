"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { ClientSidebar } from "@/components/client-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Loader2,
  Shield,
  Users,
  Lock,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ORG_DOC_SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "getting-started", label: "Getting Started" },
  { id: "reporting", label: "Reporting" },
  { id: "case-management", label: "Case Management" },
  { id: "user-management", label: "User Management" },
  { id: "security", label: "Security & Compliance" },
  { id: "faqs", label: "FAQs" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "downloads", label: "Downloads & Templates" },
  { id: "policies", label: "Organization Policies" },
] as const;

export default function OrganizationDocumentationPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { user: clientUser, organization: org } =
        await getCurrentClientAdmin();

      if (!clientUser || !org || org.subdomain !== subdomain) {
        router.push(`/org/${subdomain}/login`);
        return;
      }

      setUser(clientUser);
      setOrganization(org);
    } catch (error) {
      console.error("Documentation auth/load error:", error);
      router.push(`/org/${subdomain}/login`);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80;
    const rect = el.getBoundingClientRect();
    const target = rect.top + window.scrollY - offset;
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading Documentation Center...
          </p>
        </div>
      </div>
    );
  }

  if (!organization || !user) {
    return null;
  }

  const orgName = organization.name as string;

  return (
    <SidebarProvider>
      <ClientSidebar
        user={{
          name: user.full_name || "User",
          email: user.email,
          avatar: user.avatar_url || "/avatars/default.jpg",
        }}
        organization={{
          name: organization.name,
          subdomain,
        }}
        userRole={user.role}
      />
      <SidebarInset>
        {/* Header inside org layout - keep visible while scrolling */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-base sm:text-lg">
                  Documentation Center
                </h1>
                <Badge variant="outline" className="text-[10px]">
                  Org-scoped
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                How reporting, case management, and security work in {orgName}.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-muted/30">
          <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              {/* TOC sidebar */}
              <aside className="w-full lg:w-64 lg:sticky lg:top-24 lg:h-[calc(100vh-112px)] lg:overflow-y-auto">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Contents
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Key guidance for the {orgName} workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {ORG_DOC_SECTIONS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => scrollToSection(id)}
                        className={cn(
                          "w-full text-left text-sm px-3 py-2 rounded-md transition-colors",
                          "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </aside>

              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-8">
                {/* Hero / overview */}
                <div className="text-left">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {orgName} Compliance Documentation
                    </h2>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                    This guide explains how your team uses WhisTrust to capture
                    reports, manage cases, and stay compliant inside the{" "}
                    <span className="font-semibold">{orgName}</span> tenant.
                  </p>
                </div>

                {/* Introduction */}
                <Card id="introduction" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Introduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      The <span className="font-semibold">{orgName}</span>{" "}
                      workspace is an isolated tenant on the WhisTrust platform.
                      All reports, users, and configurations you see here are
                      scoped only to your organization.
                    </p>
                    <p>
                      Use this Documentation Center as your internal reference
                      for how staff should submit, triage, and close cases, and
                      how administrators configure the system.
                    </p>
                  </CardContent>
                </Card>

                {/* Getting Started */}
                <Card id="getting-started" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Getting Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p className="font-medium">
                      Access your tenant at{" "}
                      <code className="px-1.5 py-0.5 rounded bg-muted text-xs">
                        /org/{subdomain}
                      </code>
                      .
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Admins and reviewers log in from the staff portal using
                        the credentials provisioned for them.
                      </li>
                      <li>
                        Only users created in the <strong>Users</strong> section
                        of this org can access cases for {orgName}.
                      </li>
                      <li>
                        Invite new admins, managers, or investigators from{" "}
                        <span className="font-semibold">Users &gt; Invite</span>.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Reporting */}
                <Card id="reporting" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Reporting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Reporters submit new cases using the anonymous
                      whistleblowing form configured for {orgName}. Submitted
                      reports immediately appear in the{" "}
                      <strong>Reports</strong> section for authorized staff.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Status lifecycle:{" "}
                        <span className="font-mono text-xs">
                          submitted → under_review → investigating → resolved →
                          closed
                        </span>
                      </li>
                      <li>
                        Each submission generates a tracking code that reporters
                        can use on the <strong>Track Case</strong> page.
                      </li>
                      <li>
                        Attachments are stored securely and only visible to
                        permitted roles within this organization.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Case Management */}
                <Card id="case-management" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Case Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Admins and managers assign cases to investigators, set
                      priority, and coordinate internal notes from the{" "}
                      <strong>Reports</strong> workspace.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Use <strong>priority</strong> to highlight critical and
                        high-risk issues first.
                      </li>
                      <li>
                        Internal notes are only visible to your internal team
                        and are captured in the audit log.
                      </li>
                      <li>
                        Messaging on the case timeline keeps communication
                        between reporter and staff in a single secure channel.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* User Management */}
                <Card id="user-management" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Roles in {orgName} control who can see which data and
                      perform which actions.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>Admin</strong> – full configuration access,
                        user management, reports.
                      </li>
                      <li>
                        <strong>Manager</strong> – manages cases and teams,
                        limited settings.
                      </li>
                      <li>
                        <strong>Investigator</strong> – works only on assigned
                        cases.
                      </li>
                      <li>
                        Other read‑only roles (e.g. HR, Viewer) can be added as
                        needed with restricted visibility.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Security & Compliance */}
                <Card id="security" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Security & Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      WhisTrust is built on Supabase Postgres with strict Row
                      Level Security (RLS). The{" "}
                      <span className="font-semibold">{orgName}</span> tenant
                      is fully isolated from other organizations.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Every report row is stamped with{" "}
                        <code className="px-1 rounded bg-muted text-xs">
                          organization_id
                        </code>{" "}
                        and constrained by RLS.
                      </li>
                      <li>
                        Audit logs record sensitive actions like status changes,
                        assignments, and login events.
                      </li>
                      <li>
                        Only authenticated users with the correct role can
                        access internal data for this tenant.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* FAQs */}
                <Card id="faqs" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      FAQs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p className="font-medium">
                      Common questions from {orgName} admins and reviewers.
                    </p>
                    <ul className="space-y-2">
                      <li>
                        <span className="font-semibold">
                          How do reporters track their case?
                        </span>
                        <br />
                        Use the tracking code on the{" "}
                        <strong>/org/{subdomain}/track</strong> page.
                      </li>
                      <li>
                        <span className="font-semibold">
                          Who can see anonymous reports?
                        </span>
                        <br />
                        Only Admins, Managers, and Investigators in this
                        organization.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Troubleshooting */}
                <Card id="troubleshooting" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Troubleshooting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        If staff cannot log in, confirm their account is active
                        in <strong>Users</strong> and that they are using the{" "}
                        <strong>{subdomain}</strong> tenant URL.
                      </li>
                      <li>
                        If reports or analytics look incorrect, verify that
                        filters (date range, status) are set as expected.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Downloads & Templates / Policies */}
                <Card id="downloads" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Downloads & Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Store your internal policies, investigation checklists, or
                      training PDFs in a shared location for your team. For
                      now, this section documents which resources should be
                      available; uploads can be handled via your preferred file
                      system.
                    </p>
                  </CardContent>
                </Card>

                <Card id="policies" className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Organization Policies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Link your internal Code of Conduct, Anti‑fraud policy,
                      and Investigation SOP here so investigators and managers
                      always know which standard to follow when handling cases.
                    </p>
                  </CardContent>
                </Card>

                <Separator className="my-4" />
                <p className="text-[11px] text-muted-foreground">
                  Need a change in this documentation? Contact your WhisTrust
                  implementation partner to update org-level guidance for{" "}
                  {orgName}.
                </p>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


