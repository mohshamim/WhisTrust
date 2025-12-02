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
  Menu,
  X,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Table of Contents data
const tocSections = [
  { id: "introduction", label: "Getting Started", icon: FileText },
  { id: "anonymous-reporting", label: "Anonymous Reporting", icon: Shield },
  { id: "tracking", label: "Tracking Your Case", icon: Search },
  { id: "for-admins", label: "For Administrators", icon: Users },
  { id: "features", label: "Platform Features", icon: BarChart3 },
  { id: "security", label: "Security & Privacy", icon: Lock },
  { id: "workflows", label: "Testing Workflows", icon: CheckCircle },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
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
        if (isScrollingRef.current) return;

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          const visibleEntries = entries.filter(
            (entry) => entry.isIntersecting
          );
          if (visibleEntries.length > 0) {
            const mostVisible = visibleEntries.reduce((prev, current) => {
              return current.intersectionRatio > prev.intersectionRatio
                ? current
                : prev;
            });
            setActiveSection(mostVisible.target.id);
          }
        }, 100);
      },
      {
        rootMargin: "-20% 0px -35% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
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
      setActiveSection(id);
      isScrollingRef.current = true;

      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

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
              {tocOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              <span className="ml-2">Contents</span>
            </Button>
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
              {tocSections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={cn(
                    "w-full text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-2",
                    activeSection === id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
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
                <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                  <FileText className="h-4 w-4" />
                  Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {tocSections.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={cn(
                      "w-full text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-2",
                      activeSection === id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 pt-0">
                <Link
                  href="/demo"
                  className="flex items-center gap-2 p-2 rounded text-sm hover:bg-muted transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Try Demo</span>
                  <ArrowRight className="h-3 w-3 ml-auto" />
                </Link>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-4xl space-y-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <Shield className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold">WhisTrust Documentation</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Enterprise Multi-Tenant Whistleblowing Platform - Complete User
                Guide
              </p>
            </div>

            {/* Getting Started */}
            <section id="introduction" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <FileText className="h-5 w-5" />
                    Getting Started
                  </CardTitle>
                  <CardDescription>
                    Learn the basics of using the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">For New Users</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Navigate to the reporting page to submit a concern
                          anonymously
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Provide as much detail as possible to help
                          investigators
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Save your unique tracking code to monitor progress
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Use the tracking page anytime to check your case
                          status
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">What Happens Next</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          1
                        </Badge>
                        <span>
                          Your report is immediately submitted to the compliance
                          team
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          2
                        </Badge>
                        <span>Cases are reviewed within 24-48 hours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          3
                        </Badge>
                        <span>
                          Investigators may request additional information via
                          secure messaging
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          4
                        </Badge>
                        <span>
                          You'll receive updates as your case progresses through
                          review stages
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Anonymous Reporting */}
            <section id="anonymous-reporting" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Shield className="h-5 w-5" />
                    Anonymous Reporting
                  </CardTitle>
                  <CardDescription>
                    How to submit secure, confidential reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Submitting a Report</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Choose the appropriate category for your concern
                          (ethics, fraud, harassment, etc.)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Provide a clear, detailed description of the issue
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Include dates, locations, and names if relevant
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Upload any supporting documents or evidence (optional)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Submit and save your unique tracking code</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Your Privacy</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          No personal information is required to submit a report
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Your IP address is not logged or tracked</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>All data is encrypted end-to-end</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Only authorized investigators can access reports
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Use your tracking code to maintain anonymity while
                          following up
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Tracking */}
            <section id="tracking" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <Search className="h-5 w-5" />
                    Tracking Your Case
                  </CardTitle>
                  <CardDescription>
                    Monitor the progress of your report
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">
                      Using Your Tracking Code
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Enter your unique tracking code on the tracking page
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          View the current status of your case (Submitted, Under
                          Review, Investigating, Resolved, Closed)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          See timeline of all updates and actions taken
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Check for any messages from investigators</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Respond to follow-up questions securely</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">
                      Report Statuses Explained
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Badge variant="outline">Submitted</Badge>
                        <span className="text-sm text-muted-foreground">
                          Your report has been received and is awaiting review
                        </span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Badge variant="outline">Under Review</Badge>
                        <span className="text-sm text-muted-foreground">
                          A compliance officer is evaluating your concern
                        </span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Badge variant="outline">Investigating</Badge>
                        <span className="text-sm text-muted-foreground">
                          An investigator is actively working on your case
                        </span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Badge variant="outline">Resolved</Badge>
                        <span className="text-sm text-muted-foreground">
                          The issue has been addressed and resolved
                        </span>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Badge variant="outline">Closed</Badge>
                        <span className="text-sm text-muted-foreground">
                          The case is complete with documented outcomes
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* For Administrators */}
            <section id="for-admins" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Users className="h-5 w-5" />
                    For Administrators
                  </CardTitle>
                  <CardDescription>
                    Managing reports and your compliance team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Dashboard Overview</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          View key metrics: total reports, pending cases,
                          resolution times
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Monitor report volume by category and priority
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Track SLA compliance and at-risk cases</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Access quick actions for common workflows</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Review recent activity and submissions</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Case Management</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Assign reports to appropriate investigators</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Set priority levels (Low, Medium, High, Critical)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Add internal notes and update case status</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Communicate with reporters via secure messaging
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Export reports and generate compliance documentation
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Team Collaboration</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Invite team members with role-based access (Admin,
                          Manager, Investigator)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Assign cases based on expertise and workload
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Leave internal comments for team coordination
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>View audit logs of all user actions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Track investigator performance and case resolution
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">
                      Settings & Customization
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Customize your profile with 12 professional avatar
                          styles
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Update organization settings and preferences
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Configure notification preferences and alerts
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Manage team member profiles and permissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Set up custom categories and workflows</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Platform Features */}
            <section id="features" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-600">
                    <BarChart3 className="h-5 w-5" />
                    Platform Features
                  </CardTitle>
                  <CardDescription>
                    Explore all available capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Report Categories</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="secondary">
                        Ethics & Code of Conduct
                      </Badge>
                      <Badge variant="secondary">
                        Fraud & Financial Misconduct
                      </Badge>
                      <Badge variant="secondary">
                        Harassment & Discrimination
                      </Badge>
                      <Badge variant="secondary">
                        Safety & Health Violations
                      </Badge>
                      <Badge variant="secondary">Data Privacy & Security</Badge>
                      <Badge variant="secondary">Environmental Issues</Badge>
                      <Badge variant="secondary">Conflicts of Interest</Badge>
                      <Badge variant="secondary">
                        Other Compliance Matters
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Key Capabilities</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Anonymous & confidential reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Secure file uploads (documents, images, audio)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Real-time status tracking with unique codes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Two-way secure messaging between reporters and
                          investigators
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Customizable workflows and case assignment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Advanced analytics and compliance reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Role-based access control (Admin, Manager,
                          Investigator)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Complete audit trail of all actions</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">
                      User Interface Enhancements
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Fixed headers for easy navigation across all pages
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Smooth scrolling documentation with interactive table
                          of contents
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Professional avatar system with multiple style options
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Responsive design optimized for all devices and screen
                          sizes
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Real-time updates and notifications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Intuitive case status tracking with visual indicators
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Security & Privacy */}
            <section id="security" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Lock className="h-5 w-5" />
                    Security & Privacy
                  </CardTitle>
                  <CardDescription>
                    How we protect your information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Data Protection</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          End-to-end encryption for all data in transit and at
                          rest
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>No IP address logging or tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Secure file storage with access controls</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Regular security audits and penetration testing
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          SOC 2 and ISO 27001 compliant infrastructure
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Access Controls</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Role-based permissions ensure least-privilege access
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Multi-factor authentication available for
                          administrators
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Session timeouts and automatic logout for security
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Comprehensive audit logging of all user actions
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Data retention policies and secure deletion</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Compliance</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>GDPR, CCPA, and SOX compliance ready</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Whistleblower protection act alignment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Configurable data retention policies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Right to access and data portability</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Regular compliance training and documentation
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">
                      Technical Security Measures
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Built on Supabase with Row-Level Security (RLS)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>PostgreSQL database with encrypted storage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Secure file uploads to private storage buckets
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Session management with automatic timeout</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Real-time data synchronization with encryption
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Multi-tenant architecture with complete data isolation
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Testing Workflows */}
            <section id="workflows" className="scroll-mt-24">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary text-2xl">
                    <CheckCircle className="h-6 w-6" />
                    Testing Workflows - Try It Yourself!
                  </CardTitle>
                  <CardDescription>
                    Step-by-step guides to test the platform by role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Anonymous Reporter Workflow */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Shield className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          Workflow 1: Anonymous Reporter
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Test the complete anonymous reporting flow
                        </p>
                      </div>
                    </div>

                    <div className="ml-12 space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-blue-500">Step 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Submit Anonymous Report
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Navigate to the report submission page and create a
                            test report.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • Visit{" "}
                              <Link
                                href="/demo"
                                className="text-primary hover:underline"
                              >
                                /demo
                              </Link>{" "}
                              or your organization's report page
                            </li>
                            <li>
                              • Select category (e.g., "Ethics Violation")
                            </li>
                            <li>
                              • Write a description (minimum 50 characters)
                            </li>
                            <li>• Optional: Upload a test file</li>
                            <li>• Optional: Provide contact information</li>
                            <li>• Click "Submit Report"</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-blue-500">Step 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Save Tracking Code
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            After submission, you'll receive a unique tracking
                            code.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • Copy the tracking code (e.g., "TR-ABC123")
                            </li>
                            <li>• Save it securely for testing</li>
                            <li>
                              • You'll need this code to track your report
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-blue-500">Step 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Track Your Report
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Use the tracking code to monitor case status.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Go to the tracking page</li>
                            <li>• Enter your tracking code</li>
                            <li>• View case status, timeline, and messages</li>
                            <li>• Send a message to the compliance team</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          ✓ Workflow Complete! You've tested anonymous reporting
                          and tracking.
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Admin Workflow */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Users className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          Workflow 2: Organization Admin
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Test the admin dashboard and case management
                        </p>
                      </div>
                    </div>

                    <div className="ml-12 space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-purple-500">Step 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Login as Admin</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Access the admin portal with test credentials.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • Navigate to{" "}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                /org/codesquare/login
                              </code>
                            </li>
                            <li>
                              • Email:{" "}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                admin@codesquare.com
                              </code>
                            </li>
                            <li>
                              • Password:{" "}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                CodeSquare@2024
                              </code>
                            </li>
                            <li>• Click "Sign In"</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-purple-500">Step 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">View Dashboard</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Explore the admin dashboard and metrics.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • Review total reports, pending cases, resolution
                              times
                            </li>
                            <li>
                              • Check recent submissions and activity feed
                            </li>
                            <li>• View charts and analytics</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-purple-500">Step 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Manage Reports</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Find and manage the report you created.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Go to "Reports" in the sidebar</li>
                            <li>
                              • Find your test report (filter by status:
                              Submitted)
                            </li>
                            <li>• Click to open case details</li>
                            <li>• Update status to "Under Review"</li>
                            <li>• Set priority (e.g., "Medium")</li>
                            <li>• Add an internal note</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-purple-500">Step 4</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Assign to Investigator
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Assign the case to a team member.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Click "Assign" button</li>
                            <li>• Select investigator from dropdown</li>
                            <li>• Add assignment notes (optional)</li>
                            <li>• Confirm assignment</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-purple-500">Step 5</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Message Reporter
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Communicate with the anonymous reporter.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Scroll to "Messages" section</li>
                            <li>
                              • Type a message (e.g., "Thank you for your
                              report. We're reviewing your concern.")
                            </li>
                            <li>• Click "Send Message"</li>
                            <li>• Message appears in case timeline</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-purple-500">Step 6</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Explore Other Features
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Test additional admin capabilities.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • <strong>Analytics:</strong> View charts and
                              trends
                            </li>
                            <li>
                              • <strong>Users:</strong> See team members and
                              their roles
                            </li>
                            <li>
                              • <strong>Audit Logs:</strong> Review all system
                              activity
                            </li>
                            <li>
                              • <strong>Settings:</strong> Customize avatar and
                              preferences
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          ✓ Workflow Complete! You've tested the full admin
                          experience.
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Manager Workflow */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          Workflow 3: Manager Role
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Test manager-level oversight and review
                        </p>
                      </div>
                    </div>

                    <div className="ml-12 space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-orange-500">Step 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Login as Manager
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Access with manager credentials.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • Navigate to{" "}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                /org/codesquare/login
                              </code>
                            </li>
                            <li>
                              • Email:{" "}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                manager@codesquare.com
                              </code>
                            </li>
                            <li>
                              • Password:{" "}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                Manager@2024
                              </code>
                            </li>
                            <li>• Click "Sign In"</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-orange-500">Step 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Review Dashboard & Analytics
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Managers have full visibility into cases and trends.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• View departmental dashboard</li>
                            <li>• Check analytics for trends and patterns</li>
                            <li>• Review audit logs for compliance</li>
                            <li>
                              • Can view all reports (not just assigned ones)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-orange-500">Step 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Oversee Case Progress
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Review cases and provide oversight.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Open any case to review details</li>
                            <li>• Read internal notes from investigators</li>
                            <li>• Adjust priority if needed</li>
                            <li>• Add manager comments for guidance</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          ✓ Workflow Complete! You've tested manager oversight
                          capabilities.
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Investigator Workflow */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Search className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          Workflow 4: Investigator Role
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Test case investigation and resolution
                        </p>
                      </div>
                    </div>

                    <div className="ml-12 space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-green-500">Step 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Login as Investigator
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Access with investigator credentials.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • Navigate to{" "}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                /org/codesquare/login
                              </code>
                            </li>
                            <li>
                              • Email:{" "}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                investigator@codesquare.com
                              </code>
                            </li>
                            <li>
                              • Password:{" "}
                              <code className="bg-muted px-1 py-0.5 rounded">
                                Investigator@2024
                              </code>
                            </li>
                            <li>• Click "Sign In"</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-green-500">Step 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            View Assigned Cases
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Investigators only see cases assigned to them.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Dashboard shows only your assigned cases</li>
                            <li>• Go to "Reports" to see full list</li>
                            <li>• Open the case assigned to you earlier</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-green-500">Step 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">
                            Investigate & Document
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Update case status and add investigation notes.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Update status to "Investigating"</li>
                            <li>
                              • Add internal notes about your investigation
                            </li>
                            <li>• Review any uploaded attachments</li>
                            <li>
                              • Request more information via messaging if needed
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                        <Badge className="bg-green-500">Step 4</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Resolve Case</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Complete investigation and mark as resolved.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Update status to "Resolved"</li>
                            <li>• Add resolution notes summarizing findings</li>
                            <li>• Send final message to reporter (optional)</li>
                            <li>• Case moves to closed state</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          ✓ Workflow Complete! You've tested the investigator
                          role end-to-end.
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Complete End-to-End */}
                  <div className="p-6 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border-2 border-primary/20 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/20 rounded-xl">
                        <CheckCircle className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2">
                          Complete End-to-End Testing
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Follow all 4 workflows in sequence to experience the
                          complete platform lifecycle:
                        </p>
                        <ol className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-0.5">
                              1
                            </Badge>
                            <span>
                              <strong>Anonymous Reporter:</strong> Submit a
                              report and save tracking code
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-0.5">
                              2
                            </Badge>
                            <span>
                              <strong>Admin:</strong> Review, prioritize, and
                              assign the report
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-0.5">
                              3
                            </Badge>
                            <span>
                              <strong>Manager:</strong> Oversee progress and
                              provide guidance
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-0.5">
                              4
                            </Badge>
                            <span>
                              <strong>Investigator:</strong> Investigate,
                              document, and resolve
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-0.5">
                              5
                            </Badge>
                            <span>
                              <strong>Back to Reporter:</strong> Check tracking
                              page to see final status
                            </span>
                          </li>
                        </ol>
                        <div className="mt-4 p-3 bg-background rounded-lg border">
                          <p className="text-sm font-medium text-primary mb-1">
                            💡 Pro Tip
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Use browser incognito/private windows to test
                            multiple roles simultaneously, or log out between
                            role changes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* FAQs */}
            <section id="faqs" className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-600">
                    <HelpCircle className="h-5 w-5" />
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>
                    Common questions about using WhisTrust
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Q: Is my report truly anonymous?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A: Yes, we do not collect any identifying information
                        unless you choose to provide it. Your IP address is not
                        logged or tracked.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Q: How long does an investigation take?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A: Most cases are resolved within 2-4 weeks, depending
                        on complexity and the nature of the concern.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Q: Can I update my report after submission?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A: Yes, use your tracking code to add information via
                        secure messaging. You can provide additional details
                        anytime.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Q: Who can see my report?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A: Only authorized compliance team members assigned to
                        your case can view your report. Access is strictly
                        controlled.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Q: What if I need to report urgent safety concerns?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A: Mark your report as 'Critical' priority during
                        submission for immediate attention from the compliance
                        team.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Q: Can I attach files to my report?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A: Yes, you can upload documents, images, and audio
                        files securely. All files are encrypted and stored
                        privately.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Q: How do I know my case is being worked on?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A: Check your tracking page regularly for status updates
                        and messages from investigators. You'll see a complete
                        timeline of actions.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Q: What happens if I lose my tracking code?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A: Unfortunately, tracking codes cannot be recovered to
                        protect anonymity. Please save your tracking code
                        securely when you submit a report.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
              <p>Built with ❤️ for secure and ethical reporting</p>
              <p className="mt-2">
                <Link href="/demo" className="text-primary hover:underline">
                  Try the Demo
                </Link>
                {" • "}
                <Link href="/" className="text-primary hover:underline">
                  Back to Home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
