"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shield, FileText, Users, Bell, Lock, HelpCircle, CheckCircle, AlertTriangle, MessageSquare, BarChart3, Search, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getOrganizationBySubdomain, getCurrentClientAdmin } from "@/lib/services/client-auth";
import { ClientSidebar } from "@/components/client-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getAvatarUrl } from "@/lib/services/avatar";

interface DocSection {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  content: {
    subtitle: string;
    items: string[];
  }[];
}

export default function DocumentationPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const [organization, setOrganization] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [subdomain]);

  const loadData = async () => {
    try {
      const orgResult = await getOrganizationBySubdomain(subdomain);

      if (orgResult.success && orgResult.organization) {
        setOrganization(orgResult.organization);
      }
      
      // Try to get admin, but don't fail if not logged in
      try {
        const adminResult = await getCurrentClientAdmin();
        console.log("Admin result:", adminResult);
        if (adminResult && adminResult.user) {
          setAdmin(adminResult.user);
          console.log("Admin set:", adminResult.user);
        } else {
          console.log("No admin found, showing standalone");
        }
      } catch (e) {
        // User not logged in - that's okay, show documentation anyway
        console.log("Error getting admin:", e);
      }
    } catch (error) {
      console.error("Error loading documentation:", error);
    } finally {
      setLoading(false);
    }
  };

  const sections: DocSection[] = [
    {
      id: "getting-started",
      icon: FileText,
      title: "Getting Started",
      description: "Learn the basics of using the platform",
      color: "text-blue-600",
      content: [
        {
          subtitle: "For New Users",
          items: [
            "Navigate to the reporting page to submit a concern anonymously",
            "Provide as much detail as possible to help investigators",
            "Save your unique tracking code to monitor progress",
            "Use the tracking page anytime to check your case status",
          ],
        },
        {
          subtitle: "What Happens Next",
          items: [
            "Your report is immediately submitted to the compliance team",
            "Cases are reviewed within 24-48 hours",
            "Investigators may request additional information via secure messaging",
            "You'll receive updates as your case progresses through review stages",
          ],
        },
      ],
    },
    {
      id: "anonymous-reporting",
      icon: Shield,
      title: "Anonymous Reporting",
      description: "How to submit secure, confidential reports",
      color: "text-green-600",
      content: [
        {
          subtitle: "Submitting a Report",
          items: [
            "Choose the appropriate category for your concern (ethics, fraud, harassment, etc.)",
            "Provide a clear, detailed description of the issue",
            "Include dates, locations, and names if relevant",
            "Upload any supporting documents or evidence (optional)",
            "Submit and save your unique tracking code",
          ],
        },
        {
          subtitle: "Your Privacy",
          items: [
            "No personal information is required to submit a report",
            "Your IP address is not logged or tracked",
            "All data is encrypted end-to-end",
            "Only authorized investigators can access reports",
            "Use your tracking code to maintain anonymity while following up",
          ],
        },
      ],
    },
    {
      id: "tracking",
      icon: Search,
      title: "Tracking Your Case",
      description: "Monitor the progress of your report",
      color: "text-purple-600",
      content: [
        {
          subtitle: "Using Your Tracking Code",
          items: [
            "Enter your unique tracking code on the tracking page",
            "View the current status of your case (Submitted, Under Review, Investigating, Resolved, Closed)",
            "See timeline of all updates and actions taken",
            "Check for any messages from investigators",
            "Respond to follow-up questions securely",
          ],
        },
        {
          subtitle: "Report Statuses Explained",
          items: [
            "Submitted - Your report has been received and is awaiting review",
            "Under Review - A compliance officer is evaluating your concern",
            "Investigating - An investigator is actively working on your case",
            "Resolved - The issue has been addressed and resolved",
            "Closed - The case is complete with documented outcomes",
          ],
        },
      ],
    },
    {
      id: "for-admins",
      icon: Users,
      title: "For Administrators",
      description: "Managing reports and your compliance team",
      color: "text-orange-600",
      content: [
        {
          subtitle: "Dashboard Overview",
          items: [
            "View key metrics: total reports, pending cases, resolution times",
            "Monitor report volume by category and priority",
            "Track SLA compliance and at-risk cases",
            "Access quick actions for common workflows",
            "Review recent activity and submissions",
          ],
        },
        {
          subtitle: "Case Management",
          items: [
            "Assign reports to appropriate investigators",
            "Set priority levels (Low, Medium, High, Critical)",
            "Add internal notes and update case status",
            "Communicate with reporters via secure messaging",
            "Export reports and generate compliance documentation",
          ],
        },
        {
          subtitle: "Team Collaboration",
          items: [
            "Invite team members with role-based access (Admin, Manager, Investigator)",
            "Assign cases based on expertise and workload",
            "Leave internal comments for team coordination",
            "View audit logs of all user actions",
            "Track investigator performance and case resolution",
          ],
        },
      ],
    },
    {
      id: "features",
      icon: BarChart3,
      title: "Platform Features",
      description: "Explore all available capabilities",
      color: "text-indigo-600",
      content: [
        {
          subtitle: "Report Categories",
          items: [
            "Ethics & Code of Conduct Violations",
            "Fraud & Financial Misconduct",
            "Harassment & Discrimination",
            "Safety & Health Violations",
            "Data Privacy & Security Concerns",
            "Environmental Issues",
            "Conflicts of Interest",
            "Other Compliance Matters",
          ],
        },
        {
          subtitle: "Key Capabilities",
          items: [
            "Anonymous & confidential reporting",
            "Secure file uploads (documents, images, audio)",
            "Real-time status tracking with unique codes",
            "Two-way secure messaging between reporters and investigators",
            "Customizable workflows and case assignment",
            "Advanced analytics and compliance reporting",
            "Role-based access control (Admin, Manager, Investigator)",
            "Complete audit trail of all actions",
          ],
        },
      ],
    },
    {
      id: "security",
      icon: Lock,
      title: "Security & Privacy",
      description: "How we protect your information",
      color: "text-red-600",
      content: [
        {
          subtitle: "Data Protection",
          items: [
            "End-to-end encryption for all data in transit and at rest",
            "No IP address logging or tracking",
            "Secure file storage with access controls",
            "Regular security audits and penetration testing",
            "SOC 2 and ISO 27001 compliant infrastructure",
          ],
        },
        {
          subtitle: "Access Controls",
          items: [
            "Role-based permissions ensure least-privilege access",
            "Multi-factor authentication available for administrators",
            "Session timeouts and automatic logout for security",
            "Comprehensive audit logging of all user actions",
            "Data retention policies and secure deletion",
          ],
        },
        {
          subtitle: "Compliance",
          items: [
            "GDPR, CCPA, and SOX compliance ready",
            "Whistleblower protection act alignment",
            "Configurable data retention policies",
            "Right to access and data portability",
            "Regular compliance training and documentation",
          ],
        },
      ],
    },
    {
      id: "faqs",
      icon: HelpCircle,
      title: "FAQs",
      description: "Frequently asked questions",
      color: "text-teal-600",
      content: [
        {
          subtitle: "Common Questions",
          items: [
            "Q: Is my report truly anonymous? A: Yes, we do not collect any identifying information unless you choose to provide it.",
            "Q: How long does an investigation take? A: Most cases are resolved within 2-4 weeks, depending on complexity.",
            "Q: Can I update my report after submission? A: Yes, use your tracking code to add information via secure messaging.",
            "Q: Who can see my report? A: Only authorized compliance team members assigned to your case.",
            "Q: What if I need to report urgent safety concerns? A: Mark your report as 'Critical' priority for immediate attention.",
            "Q: Can I attach files to my report? A: Yes, you can upload documents, images, and audio files securely.",
            "Q: How do I know my case is being worked on? A: Check your tracking page regularly for status updates and messages.",
            "Q: What happens if I lose my tracking code? A: Unfortunately, tracking codes cannot be recovered to protect anonymity. Save it securely.",
          ],
        },
      ],
    },
  ];

  const filteredSections = sections.filter((section) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.content.some((c) =>
        c.items.some((item) => item.toLowerCase().includes(query))
      )
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Organization not found</p>
        </div>
      </div>
    );
  }

  // Always show with sidebar if admin exists, otherwise show standalone
  const showWithSidebar = admin && admin.email;

  if (showWithSidebar) {
    return (
      <SidebarProvider className="h-screen overflow-hidden">
        <ClientSidebar
          user={{
            name: admin.full_name || admin.name || admin.email.split("@")[0],
            email: admin.email,
            avatar: getAvatarUrl({ avatar_url: admin.avatar_url, email: admin.email }),
          }}
          organization={{
            name: organization.name,
            subdomain: subdomain,
          }}
          userRole={admin.role || 'viewer'}
        />
        <SidebarInset className="flex flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/org/${subdomain}/dashboard`}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Documentation</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header Section */}
          <div className="flex-shrink-0 bg-background border-b px-4 py-6">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {organization?.name} Documentation
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Everything you need to know about using the compliance platform
                  </p>
                </div>
                <Badge variant="outline" className="mt-1 flex-shrink-0">
                  <FileText className="h-3 w-3 mr-1" />
                  {sections.length} Sections
                </Badge>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content Area with Fixed Sidebar */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto px-4 py-6">
              {/* Two-column Layout */}
              <div className="flex gap-8">
                {/* Sidebar Navigation - Sticky Position */}
                <aside className="hidden lg:block w-[280px] flex-shrink-0">
                  <div className="sticky top-4 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
              <Card className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase tracking-wider">
                    Contents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-3 pt-0">
              <nav className="space-y-1">
                {filteredSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-muted ${section.color}`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 font-medium">{section.title}</span>
                    </a>
                  );
                })}
              </nav>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 pt-0">
                  <a
                    href={`/org/${subdomain}/report`}
                    className="flex items-center gap-2 p-2 rounded text-sm hover:bg-muted transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Submit Report</span>
                  </a>
                  <a
                    href={`/org/${subdomain}/track`}
                    className="flex items-center gap-2 p-2 rounded text-sm hover:bg-muted transition-colors"
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Track Case</span>
                  </a>
                  <a
                    href={`/org/${subdomain}/dashboard`}
                    className="flex items-center gap-2 p-2 rounded text-sm hover:bg-muted transition-colors"
                  >
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Dashboard</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          </aside>

                {/* Main Content - Takes remaining space */}
                <div className="flex-1 min-w-0 space-y-8">
            {/* Mobile Navigation (visible on small screens) */}
            <Card className="mb-8 lg:hidden border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5 text-primary" />
                  Quick Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {filteredSections.slice(0, 4).map((section) => {
                    const Icon = section.icon;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="flex items-center gap-2 p-3 rounded-lg border bg-background hover:bg-muted transition-colors"
                      >
                        <Icon className={`h-4 w-4 ${section.color}`} />
                        <span className="text-sm font-medium truncate">{section.title}</span>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Documentation Sections */}
            <div className="space-y-8">
              {filteredSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <Card key={section.id} id={section.id} className="scroll-mt-24">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-muted ${section.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl">{section.title}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {section.description}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {String(index + 1).padStart(2, "0")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {section.content.map((contentBlock, idx) => (
                        <div key={idx}>
                          {idx > 0 && <Separator className="my-6" />}
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <CheckCircle className={`h-4 w-4 ${section.color}`} />
                            {contentBlock.subtitle}
                          </h3>
                          <ul className="space-y-2.5">
                            {contentBlock.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex gap-3 text-muted-foreground">
                                <span className="text-primary mt-1.5 text-xs">●</span>
                                <span className="flex-1 leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredSections.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No documentation found matching &quot;{searchQuery}&quot;. Try a different search term.
                </AlertDescription>
              </Alert>
            )}

              {/* Footer */}
              <Card className="mt-12 border-muted">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <p className="font-medium">Need More Help?</p>
                      <p className="text-sm text-muted-foreground">
                        Contact your organization administrator for additional support
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Powered by WhisTrust</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    );
  }

  // Standalone documentation (no sidebar) for non-logged-in users
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {organization?.name} Documentation
            </h1>
            <p className="text-muted-foreground mt-1">
              Everything you need to know about using the compliance platform
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Documentation Sections */}
          <div className="space-y-8">
            {filteredSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} id={section.id} className="scroll-mt-24">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-muted ${section.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{section.title}</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {section.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {String(index + 1).padStart(2, "0")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {section.content.map((contentBlock, idx) => (
                      <div key={idx}>
                        {idx > 0 && <Separator className="my-6" />}
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${section.color}`} />
                          {contentBlock.subtitle}
                        </h3>
                        <ul className="space-y-2.5">
                          {contentBlock.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex gap-3 text-muted-foreground">
                              <span className="text-primary mt-1.5 text-xs">●</span>
                              <span className="flex-1 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredSections.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No documentation found matching &quot;{searchQuery}&quot;. Try a different search term.
              </AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <Card className="mt-12 border-muted">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="font-medium">Need More Help?</p>
                  <p className="text-sm text-muted-foreground">
                    Contact your organization administrator for additional support
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Powered by WhisTrust</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
