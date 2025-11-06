"use client";

import { useState, useEffect, useRef } from "react";
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
  CheckCircle,
  Shield,
  MessageSquare,
  FileText,
  Users,
  Lock,
  BarChart3,
  Bell,
  Upload,
  Search,
  Filter,
  GitBranch,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Table of Contents data
const tocSections = [
  { id: "introduction", label: "Introduction" },
  { id: "getting-started", label: "Getting Started" },
  { id: "workflow-1", label: "Anonymous Report Submission" },
  { id: "workflow-2", label: "Case Tracking & Messaging" },
  { id: "workflow-3", label: "Admin Dashboard" },
  { id: "workflow-4", label: "File Upload Security" },
  { id: "workflow-5", label: "Offline Case Entry" },
  { id: "workflow-6", label: "Audit Logs & Notifications" },
  { id: "workflow-7", label: "Encryption & Security" },
  { id: "workflow-8", label: "Priority & Label Management" },
  { id: "workflow-9", label: "Role-Based Access Control" },
  { id: "workflow-10", label: "Reports & Analytics" },
  { id: "workflow-11", label: "User Management" },
  { id: "testing", label: "Testing Instructions" },
  { id: "security", label: "Security & Data Handling" },
  { id: "faq", label: "FAQ & Troubleshooting" },
];

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [tocOpen, setTocOpen] = useState(false);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track active section on scroll
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip updates during programmatic scrolling
        if (isScrollingRef.current) return;

        // Debounce the state update to prevent flickering
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          const visibleEntries = entries.filter(entry => entry.isIntersecting);
          if (visibleEntries.length > 0) {
            const mostVisible = visibleEntries.reduce((prev, current) => {
              return current.intersectionRatio > prev.intersectionRatio ? current : prev;
            });
            setActiveSection(mostVisible.target.id);
          }
        }, 100);
      },
      { 
        rootMargin: "-20% 0px -35% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    tocSections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      clearTimeout(debounceTimeout);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Set active immediately for instant feedback
      setActiveSection(id);
      
      // Disable observer during scroll
      isScrollingRef.current = true;
      
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Re-enable observer after scroll completes
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);

      setTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            WhisTrust
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setTocOpen(!tocOpen)}
            >
              {tocOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="ml-2">Contents</span>
            </Button>
            {/* <Link
              href="/docs/workflow"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <GitBranch className="h-4 w-4" />
              Workflow
            </Link> */}
            <Link
              href="/demo"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Back to Demo →
            </Link>
          </div>
        </div>
      </div>

      {/* Table of Contents - Mobile Drawer */}
      {tocOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-background border-r shadow-lg overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contents
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTocOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-1">
              {tocSections.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={cn(
                    "w-full text-left text-sm px-3 py-2 rounded-md transition-colors",
                    activeSection === id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex gap-8 items-start">
          {/* Table of Contents - Desktop Sidebar */}
          <aside className="hidden lg:block sticky top-24 w-64 shrink-0 h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {tocSections.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={cn(
                      "w-full text-left text-sm px-3 py-2 rounded-md transition-colors",
                      activeSection === id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">WhisTrust Documentation</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Complete guide to using WhisTrust - your secure digital
            whistleblowing system
          </p>
          {/* <div className="flex items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/docs/workflow">
                <GitBranch className="h-5 w-5" />
                View Interactive Workflow Diagram
              </Link>
            </Button>
          </div> */}
        </div>

        {/* Introduction */}
        <Card id="introduction" className="mb-8 scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Introduction to WhisTrust
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong>WhisTrust</strong> is a secure, confidential digital
              whistleblowing system designed for organizations to receive and
              manage anonymous reports of misconduct, fraud, safety concerns,
              and policy violations.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Purpose</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable confidential reporting, secure communication, and
                    transparent case resolution
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Security First</h4>
                  <p className="text-sm text-muted-foreground">
                    End-to-end encryption, metadata cleaning, and
                    compliance-ready data handling
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card id="getting-started" className="mb-8 scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                For Reporters (Anonymous Users)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  <span>
                    Visit the{" "}
                    <Link
                      href="/report"
                      className="text-primary hover:underline"
                    >
                      Report Portal
                    </Link>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  <span>
                    Fill in report details (category, description, optional
                    contact info)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  <span>Upload any supporting files securely</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">4</Badge>
                  <span>
                    Receive a unique tracking code to monitor your case
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">For Admin Users</h3>
              <p className="text-sm text-muted-foreground mb-3">
                WhisTrust uses Role-Based Access Control (RBAC). Your access
                depends on your assigned role:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  <span>
                    Visit the{" "}
                    <Link
                      href="/admin/login"
                      className="text-primary hover:underline"
                    >
                      Admin Portal
                    </Link>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  <span>
                    Login with your credentials (e.g., admin@whistrust.com)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  <span>
                    Access features based on your role (see Role Permissions
                    section below)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Workflows */}
        <div className="space-y-8 mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            System Workflows
          </h2>

          {/* Workflow 1 */}
          <Card id="workflow-1" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Workflow 1: Anonymous Report Submission
              </CardTitle>
              <CardDescription>
                Submit a confidential report without revealing your identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Allows users to submit reports of misconduct, fraud, or policy
                  violations securely and anonymously. Each submission receives
                  a unique tracking code for follow-up.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  Step-by-Step Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Navigate to the Report Portal</li>
                  <li>
                    Select report category (fraud, harassment, safety, etc.)
                  </li>
                  <li>Enter detailed description of the incident</li>
                  <li>
                    Optionally provide name and email (not required for
                    anonymity)
                  </li>
                  <li>Attach supporting documents or evidence (optional)</li>
                  <li>Click "Submit Report"</li>
                  <li>Save your unique tracking code for case monitoring</li>
                </ol>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Submit a test report with all fields filled</li>
                  <li>Verify tracking code is generated (e.g., "ABC1234")</li>
                  <li>Check report appears in admin dashboard</li>
                  <li>Confirm file uploads are successful</li>
                  <li>Test with anonymous submission (no name/email)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 2 */}
          <Card id="workflow-2" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Workflow 2: Case Tracking & Two-Way Messaging
              </CardTitle>
              <CardDescription>
                Communicate securely with administrators about your case
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Enables encrypted two-way communication between reporters and
                  administrators. Messages are encrypted before storage and
                  decrypted on display to ensure maximum privacy.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  Step-by-Step Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Enter your tracking code on the Track Your Case page</li>
                  <li>View case status and timeline</li>
                  <li>Review previous messages from administrators</li>
                  <li>Type your response in the message box</li>
                  <li>Send message (encrypted automatically)</li>
                  <li>Receive real-time notifications of new messages</li>
                </ol>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Track a case using valid tracking code</li>
                  <li>Send a test message from reporter view</li>
                  <li>Verify message appears in admin panel</li>
                  <li>
                    Send reply from admin and confirm it appears to reporter
                  </li>
                  <li>Check encryption/decryption works correctly</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 3 */}
          <Card id="workflow-3" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Workflow 3: Admin Dashboard & Case Management
              </CardTitle>
              <CardDescription>
                Manage and resolve cases with comprehensive admin tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Provides administrators with a complete case management
                  interface including case assignment, status updates, priority
                  management, custom labels, and file access.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <strong>Case Overview:</strong> View reports with role-based
                    filtering:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Admin: All cases</li>
                      <li>
                        Manager: Cases assigned to users in their department
                      </li>
                      <li>Investigator: Only cases assigned to them</li>
                      <li>HR: Only HR-related categories</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Case Details:</strong> Side drawer with full case
                    information, messages, and attachments
                  </li>
                  <li>
                    <strong>Assignment:</strong> Assign cases to specific
                    administrators or investigators (Admin & Manager only -
                    Investigator/HR cannot assign)
                  </li>
                  <li>
                    <strong>Status Management:</strong> Update case status
                    (Pending → In Review → In Progress → Resolved) - Admin,
                    Manager, and Investigator can update; HR is read-only
                  </li>
                  <li>
                    <strong>Priority & Labels:</strong> Set priority levels
                    (Low/Medium/High) and add custom labels - HR role cannot
                    edit priority
                  </li>
                  <li>
                    <strong>Two-Way Messaging:</strong> Communicate with
                    reporters securely (all roles can send messages)
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Open a case and review all details</li>
                  <li>
                    Verify case filtering works per role (Admin sees all,
                    Manager sees department, etc.)
                  </li>
                  <li>As Admin/Manager: Assign case to another user</li>
                  <li>
                    As Investigator/HR: Verify assignment controls are hidden
                  </li>
                  <li>
                    Update case status and priority (Admin, Manager,
                    Investigator)
                  </li>
                  <li>
                    As HR: Verify status/priority controls are disabled with
                    tooltips
                  </li>
                  <li>Add custom labels to case</li>
                  <li>Filter cases by status, priority, or label</li>
                  <li>
                    Send message to reporter from case details (all roles)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 4 */}
          <Card id="workflow-4" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-500" />
                Workflow 4: File Upload Security & Privacy
              </CardTitle>
              <CardDescription>
                Secure file handling with metadata cleaning and encryption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Ensures all uploaded files are stored securely with metadata
                  stripped to prevent identity exposure. Files are accessible
                  only to authorized administrators via signed URLs.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Security Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    Automatic metadata cleaning (removes EXIF, author info,
                    timestamps)
                  </li>
                  <li>Secure storage in Supabase with access control</li>
                  <li>Signed URLs for temporary file access</li>
                  <li>File type validation and size limits</li>
                  <li>Admin-only download permissions</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Upload file during report submission</li>
                  <li>Verify file appears in admin case details</li>
                  <li>Download file from admin panel</li>
                  <li>Check file metadata is cleaned</li>
                  <li>Test with different file types (PDF, images, docs)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 5 - Offline Entry */}
          <Card id="workflow-5" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-500" />
                Workflow 5: Offline / Proxy Case Entry
              </CardTitle>
              <CardDescription>
                Allow administrators to submit cases on behalf of reporters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Enables authorized administrators to submit reports on behalf
                  of individuals who cannot access the system directly. Source
                  marked as "proxy" or "offline".
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Admin creates case via offline entry form</li>
                  <li>Verify source is marked as "proxy" or "offline"</li>
                  <li>Confirm case appears in system with special badge</li>
                  <li>Test case management flows work normally</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 6 */}
          <Card id="workflow-6" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                Workflow 6: Audit Logs & Notifications
              </CardTitle>
              <CardDescription>
                Track all system activities and receive real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive audit trail of all system actions (report
                  creation, status changes, assignments, messages) and real-time
                  notification system for admins.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Audit Log Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    Track all user actions with timestamps and user role
                    information
                  </li>
                  <li>
                    Automatic role capture: Every audit entry automatically
                    includes the{" "}
                    <code className="bg-muted px-1 rounded">user_role</code>{" "}
                    field
                  </li>
                  <li>
                    Track user management actions: Role changes, user
                    activation/deactivation are logged with full details
                  </li>
                  <li>
                    Filter by action type, resource, user, role, and date range
                  </li>
                  <li>
                    View detailed metadata for each action (old/new values,
                    target user info)
                  </li>
                  <li>Export logs for compliance reporting</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Notification Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Real-time bell notifications for new reports</li>
                  <li>
                    Notifications for case assignments and message replies
                  </li>
                  <li>Badge showing unread count</li>
                  <li>Mark notifications as read</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Submit a new report and check audit log entry</li>
                  <li>Assign a case and verify notification appears</li>
                  <li>Check notification bell updates in real-time</li>
                  <li>Filter audit logs by date and action type</li>
                  <li>Mark notifications as read and verify badge count</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 7 */}
          <Card id="workflow-7" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                Workflow 7: Encryption & Security Layers
              </CardTitle>
              <CardDescription>
                Multi-layer security to protect sensitive data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Implements multiple security layers including client-side
                  message encryption, metadata cleaning, role-based access
                  control, and secure authentication.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Security Layers</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <strong>Message Encryption:</strong> AES encryption for all
                    messages
                  </li>
                  <li>
                    <strong>File Metadata Cleaning:</strong> Automatic removal
                    of identifying information
                  </li>
                  <li>
                    <strong>Row-Level Security (RLS):</strong> Database-level
                    access control
                  </li>
                  <li>
                    <strong>Role-Based Access Control (RBAC):</strong> Four
                    distinct roles (Admin, Manager, Investigator, HR) with
                    granular permissions. Each role sees only authorized
                    features and data.
                  </li>
                  <li>
                    <strong>Secure Authentication:</strong> Supabase Auth with
                    session management
                  </li>
                  <li>
                    <strong>HTTPS Only:</strong> All connections encrypted in
                    transit
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 8 */}
          <Card id="workflow-8" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-indigo-500" />
                Workflow 8: Priority & Label Management
              </CardTitle>
              <CardDescription>
                Organize and filter cases with custom labels and priorities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Allows administrators to set case priorities (Low/Medium/High)
                  and add custom labels for better organization and filtering.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Set priority levels with color-coded badges</li>
                  <li>Add multiple custom labels per case</li>
                  <li>Filter cases by priority in the table</li>
                  <li>Visual indicators for quick case assessment</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Add labels to a case (e.g., "Finance", "Urgent")</li>
                  <li>Change case priority from dropdown</li>
                  <li>Verify priority badge displays correctly</li>
                  <li>Filter cases by priority level</li>
                  <li>Confirm filters work together (status + priority)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 9 - RBAC */}
          <Card id="workflow-9" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Workflow 9: Role-Based Access Control (RBAC)
              </CardTitle>
              <CardDescription>
                Granular permissions and access control for different user roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  WhisTrust implements comprehensive role-based access control
                  with four distinct roles. Each role has specific permissions,
                  sees only relevant data, and has access to appropriate
                  features. Unauthorized routes are automatically blocked with
                  clear access-denied messaging.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Role Permissions</h4>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">Admin</Badge>
                      <span className="text-xs text-muted-foreground">
                        Full System Access
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>View all cases across all departments</li>
                      <li>Assign cases to any user</li>
                      <li>Update case status and priority</li>
                      <li>View Analytics dashboard</li>
                      <li>Access Audit Logs</li>
                      <li>
                        Manage user accounts - change roles, activate/deactivate
                        users (see User Management section)
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Manager</Badge>
                      <span className="text-xs text-muted-foreground">
                        Department Oversight
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>
                        View cases assigned to users in their department
                        (department-based filtering)
                      </li>
                      <li>
                        Assign cases to investigators within their department
                      </li>
                      <li>Update case status and priority</li>
                      <li>View Analytics dashboard</li>
                      <li>Access Audit Logs</li>
                      <li>
                        <span className="text-destructive">Cannot</span> manage
                        users or access user management page
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Investigator</Badge>
                      <span className="text-xs text-muted-foreground">
                        Case Investigation
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>View only cases assigned to them</li>
                      <li>Update status and priority of assigned cases</li>
                      <li>Send messages and manage assigned cases</li>
                      <li>
                        <span className="text-destructive">Cannot</span> assign
                        cases
                      </li>
                      <li>
                        <span className="text-destructive">Cannot</span> view
                        Analytics or Audit Logs
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">HR</Badge>
                      <span className="text-xs text-muted-foreground">
                        Human Resources Focus
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>
                        View only HR-related categories (Workplace Conduct,
                        Harassment, Discrimination, Bullying)
                      </li>
                      <li>Send messages to reporters</li>
                      <li>
                        <span className="text-destructive">Read-only:</span>{" "}
                        Cannot edit status or priority
                      </li>
                      <li>
                        <span className="text-destructive">Cannot</span> assign
                        cases
                      </li>
                      <li>
                        <span className="text-destructive">Cannot</span> view
                        Analytics or Audit Logs
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">UI Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <strong>Role Badge:</strong> Your role is displayed next to
                    your name in the sidebar with color-coding (Admin: primary,
                    Manager: secondary, Investigator/HR: outline)
                  </li>
                  <li>
                    <strong>Conditional Navigation:</strong> Only authorized
                    menu items appear in the sidebar. Unauthorized routes (e.g.,
                    Users page for non-admin) are hidden
                  </li>
                  <li>
                    <strong>Disabled Controls:</strong> Unauthorized actions
                    (like status updates for HR) show helpful tooltips when
                    hovered, explaining permission restrictions
                  </li>
                  <li>
                    <strong>Access Denied Page:</strong> Attempting to access
                    unauthorized routes (e.g., /admin/users as Manager)
                    redirects to a clear access-denied page with navigation
                    options
                  </li>
                  <li>
                    <strong>Case Filtering:</strong> Cases are automatically
                    filtered based on your role's permissions:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>
                        <strong>Admin:</strong> All cases
                      </li>
                      <li>
                        <strong>Manager:</strong> Cases assigned to users in the
                        same department
                      </li>
                      <li>
                        <strong>Investigator:</strong> Only cases assigned to
                        them
                      </li>
                      <li>
                        <strong>HR:</strong> Only HR-related categories
                        (Workplace Conduct, Harassment, Discrimination,
                        Bullying)
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>User Management (Admin Only):</strong> Admin users
                    can manage other admin accounts - change roles,
                    activate/deactivate users. All actions are logged in audit
                    trail with user role information
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Tooltip Examples</h4>
                <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                  <p>
                    <strong>HR trying to update status:</strong> "You don't have
                    permission to edit reports. Only Admin, Manager, and
                    Investigator can update case status."
                  </p>
                  <p>
                    <strong>Non-admin trying to manage users:</strong> "Only
                    Admin can change user roles." or "Only Admin can
                    activate/deactivate users."
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>
                    Login as each role and verify sidebar shows correct menu
                    items
                  </li>
                  <li>
                    Check role badge displays correctly next to your name with
                    appropriate color
                  </li>
                  <li>
                    Verify case filtering works:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Admin sees all cases</li>
                      <li>
                        Manager sees only cases assigned to users in their
                        department
                      </li>
                      <li>Investigator sees only assigned cases</li>
                      <li>HR sees only HR-related categories</li>
                    </ul>
                  </li>
                  <li>
                    Attempt to access restricted routes (e.g., /admin/users as
                    Manager) - should redirect to access-denied page
                  </li>
                  <li>
                    Hover over disabled controls (status/priority for HR, user
                    management for non-admin) and verify tooltips appear
                  </li>
                  <li>
                    As Admin: Change a user's role and verify audit log entry
                    shows{" "}
                    <code className="bg-white/20 px-1 rounded">
                      user_role_updated
                    </code>{" "}
                    with old/new values
                  </li>
                  <li>
                    Check audit logs show correct{" "}
                    <code className="bg-white/20 px-1 rounded">user_role</code>{" "}
                    column for each action
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 10 */}
          <Card id="workflow-10" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-500" />
                Workflow 10: Reports & Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive insights into case volumes and trends (Admin &
                Manager only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Provides administrators with key metrics, category breakdowns,
                  trend analysis, and exportable reports for compliance and
                  management purposes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Analytics Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Total reports count and status breakdown</li>
                  <li>Average resolution time tracking</li>
                  <li>Category distribution with percentages</li>
                  <li>Trend analysis over time</li>
                  <li>CSV export functionality</li>
                  <li>
                    <strong>Access:</strong> Admin and Manager roles only
                    (Investigator and HR cannot access Analytics)
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>
                    As Admin/Manager: View analytics dashboard with real data
                  </li>
                  <li>Verify metrics match actual report counts</li>
                  <li>Check category breakdown is accurate</li>
                  <li>Export analytics data to CSV</li>
                  <li>Verify CSV contains all expected data</li>
                  <li>
                    As Investigator/HR: Attempt to access /admin/analytics -
                    should redirect to access-denied page
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 11 - User Management */}
          <Card id="workflow-11" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-pink-500" />
                Workflow 11: User Management (Admin Only)
              </CardTitle>
              <CardDescription>
                Manage admin user accounts, roles, and activation status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Allows Admin users to manage other admin accounts in the
                  system. This includes changing user roles (Admin, Manager,
                  Investigator, HR), activating or deactivating accounts, and
                  viewing user information. All user management actions are
                  automatically logged in the audit trail with full details
                  including who performed the action and what changed.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <strong>User List:</strong> View all admin users with their
                    roles, departments, and activation status
                  </li>
                  <li>
                    <strong>Role Management:</strong> Change user roles between
                    Admin, Manager, Investigator, and HR
                  </li>
                  <li>
                    <strong>Account Activation:</strong> Activate or deactivate
                    user accounts (inactive users cannot log in)
                  </li>
                  <li>
                    <strong>Audit Logging:</strong> All changes are logged with:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Who made the change (user and role)</li>
                      <li>What changed (old/new role, activation status)</li>
                      <li>When the change occurred</li>
                      <li>Target user details</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Access Control:</strong> Only Admin role can access
                    this page. Other roles attempting to access will be
                    redirected to the access-denied page.
                  </li>
                  <li>
                    <strong>UI Restrictions:</strong> Non-admin users see
                    disabled controls with helpful tooltips explaining
                    permission requirements.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">User Management Actions</h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h5 className="font-semibold text-sm mb-1">
                      Change User Role
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Update a user's role. This immediately affects their
                      permissions and access. Logged as{" "}
                      <code className="bg-muted px-1 rounded">
                        user_role_updated
                      </code>{" "}
                      with old and new role values.
                    </p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h5 className="font-semibold text-sm mb-1">
                      Activate/Deactivate Account
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Control user access. Deactivated users cannot log in.
                      Logged as{" "}
                      <code className="bg-muted px-1 rounded">
                        user_activated
                      </code>{" "}
                      or{" "}
                      <code className="bg-muted px-1 rounded">
                        user_deactivated
                      </code>{" "}
                      with user details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>As Admin: Access /admin/users page</li>
                  <li>View list of all admin users with their roles</li>
                  <li>Change a user's role (e.g., Manager → Investigator)</li>
                  <li>
                    Verify audit log shows{" "}
                    <code className="bg-white/20 px-1 rounded">
                      user_role_updated
                    </code>{" "}
                    entry
                  </li>
                  <li>Deactivate a user account</li>
                  <li>
                    Verify audit log shows{" "}
                    <code className="bg-white/20 px-1 rounded">
                      user_deactivated
                    </code>{" "}
                    entry
                  </li>
                  <li>Activate the user account again</li>
                  <li>
                    Verify audit log shows{" "}
                    <code className="bg-white/20 px-1 rounded">
                      user_activated
                    </code>{" "}
                    entry
                  </li>
                  <li>
                    As Manager/Investigator/HR: Attempt to access /admin/users -
                    should redirect to access-denied
                  </li>
                  <li>
                    Check audit logs verify{" "}
                    <code className="bg-white/20 px-1 rounded">user_role</code>{" "}
                    is captured for all actions
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testing Instructions */}
        <Card id="testing" className="mb-8 scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Test User Roles</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">
                    Reporter (Anonymous)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    No login required. Use tracking codes to access cases. Can
                    submit reports and communicate via messages.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    Admin
                    <Badge variant="default" className="text-xs">
                      Full Access
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Full system access including user management.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Login: admin@whistrust.com
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    Manager
                    <Badge variant="secondary" className="text-xs">
                      Department
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Department-based case oversight. Sees cases assigned to
                    users in their department. Can view analytics and audit
                    logs.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cannot manage users or access user management page.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    Investigator
                    <Badge variant="outline" className="text-xs">
                      Assigned Cases
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    View and manage only assigned cases.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cannot assign cases or view analytics.
                  </p>
                </div>
                <div className="p-4 border rounded-lg md:col-span-2">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    HR
                    <Badge variant="outline" className="text-xs">
                      HR Categories
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    View HR-related cases only (Workplace Conduct, Harassment,
                    Discrimination, Bullying).
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Read-only access. Cannot edit case status or priority.
                    Cannot view analytics.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Sample Test Data</h3>
              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <p className="mb-2">
                  <strong>Sample Tracking Code:</strong> ABC1234
                </p>
                <p className="mb-2">
                  <strong>Test Categories:</strong> Fraud, Harassment, Safety,
                  Ethical Violations
                </p>
                <p className="mb-2">
                  <strong>Test File Types:</strong> PDF, JPG, PNG, DOCX (max
                  10MB each)
                </p>
                <p>
                  <strong>Admin Login:</strong> admin@whistrust.com / Admin@123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Data Handling */}
        <Card id="security" className="mb-8 scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security & Data Handling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All messages are encrypted using AES encryption before
                  storage. Files are encrypted in transit and at rest.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Metadata Cleaning</h4>
                <p className="text-sm text-muted-foreground">
                  Automatic removal of EXIF data, author information, and
                  timestamps from uploaded files to prevent identity exposure.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Access Control</h4>
                <p className="text-sm text-muted-foreground">
                  Role-based permissions with database-level security. Only
                  authorized admins can access specific cases.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Data Storage</h4>
                <p className="text-sm text-muted-foreground">
                  Secure cloud storage with signed URLs for temporary file
                  access. Full audit trail maintained for compliance.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance Ready
              </h4>
              <p className="text-sm text-blue-900 dark:text-blue-100">
                WhisTrust is designed to meet data localization requirements and
                compliance standards. All data handling follows security best
                practices and can be hosted in compliant jurisdictions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card id="faq" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              FAQ & Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">
                  Why can't I see my messages?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Make sure you're using the correct tracking code. Messages may
                  take a moment to sync. Try refreshing the page or checking
                  your tracking code.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-1">
                  File upload failed. What should I do?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Check file size (max 10MB per file), file type is supported
                  (PDF, images, docs), and your internet connection is stable.
                  Try uploading one file at a time.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-1">
                  I forgot my tracking code. Can I get it back?
                </h4>
                <p className="text-sm text-muted-foreground">
                  If you provided an email during submission, you should have
                  received the tracking code. For security, we cannot retrieve
                  tracking codes without authentication.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-1">How secure is my data?</h4>
                <p className="text-sm text-muted-foreground">
                  All data is encrypted in transit (HTTPS) and at rest. Messages
                  use client-side encryption, and files have metadata removed.
                  Only authorized admins can access case data.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Need More Help?</h4>
              <p className="text-sm text-muted-foreground">
                For additional support, please contact your organization's
                compliance team or system administrator. Technical issues can be
                reported through your organization's IT support channels.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12 pb-8">
          <p>
            WhisTrust Documentation v1.0 | Last Updated:{" "}
            {new Date().toLocaleDateString()}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/demo" className="text-primary hover:underline">
              Try Demo
            </Link>
            <span>•</span>
            <Link href="/" className="text-primary hover:underline">
              Home
            </Link>
          </div>
        </div>
          </div> {/* End Main Content */}
        </div> {/* End Flex Container */}
      </div> {/* End Container */}
    </div>
  );
}
