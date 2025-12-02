"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Search,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  BarChart3,
  Settings,
  Bell,
  Lock,
  Globe,
  Smartphone,
  Database,
  Cloud,
  HelpCircle,
  ExternalLink,
  PlayCircle,
  FileQuestion,
  BookMarked,
  GraduationCap,
  Rocket,
  Target,
  TrendingUp,
  FileCheck,
  ClipboardList,
  MessageSquare,
  Eye,
  Filter,
  PieChart,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminDocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    {
      icon: FileText,
      title: "Anonymous Reporting",
      description: "Secure, encrypted report submission with unique tracking codes",
      status: "Live",
      category: "Core Features",
    },
    {
      icon: Shield,
      title: "Role-Based Access Control",
      description: "Granular permissions for Admin, Manager, Investigator, and HR roles",
      status: "Live",
      category: "Security",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Add, edit, and manage team members with department-based filtering",
      status: "Live",
      category: "Administration",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time dashboards with reports by status, category, and priority",
      status: "Live",
      category: "Analytics",
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Instant updates via WebSocket for new reports and status changes",
      status: "Live",
      category: "Communication",
    },
    {
      icon: Activity,
      title: "Audit Logging",
      description: "Complete trail of all user actions with exportable reports",
      status: "Live",
      category: "Compliance",
    },
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data encrypted in transit (HTTPS) and at rest",
      status: "Live",
      category: "Security",
    },
    {
      icon: Globe,
      title: "SSO Integration",
      description: "Single Sign-On support for Google, Azure, and OAuth providers",
      status: "Live",
      category: "Authentication",
    },
    {
      icon: Database,
      title: "Multi-Tenant Architecture",
      description: "Complete data isolation between organizations",
      status: "Live",
      category: "Infrastructure",
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: "Optimized for desktop, tablet, and mobile devices",
      status: "Live",
      category: "User Experience",
    },
    {
      icon: Download,
      title: "Export Capabilities",
      description: "Export reports to PDF and password-protected Excel",
      status: "Live",
      category: "Data Management",
    },
    {
      icon: Filter,
      title: "Advanced Filtering",
      description: "Search and filter reports by status, category, date, and assignee",
      status: "Live",
      category: "Data Management",
    },
  ];

  const documents = [
    {
      title: "Platform Overview",
      description: "Complete introduction to WhisTrust and its capabilities",
      icon: BookOpen,
      type: "PDF",
      size: "2.4 MB",
      lastUpdated: "Dec 2024",
      link: "#",
    },
    {
      title: "Admin User Guide",
      description: "Step-by-step guide for administrators",
      icon: FileText,
      type: "PDF",
      size: "3.8 MB",
      lastUpdated: "Dec 2024",
      link: "#",
    },
    {
      title: "Security & Compliance",
      description: "GDPR, ISO 27001, and security best practices",
      icon: Shield,
      type: "PDF",
      size: "1.9 MB",
      lastUpdated: "Dec 2024",
      link: "#",
    },
    {
      title: "API Documentation",
      description: "RESTful API reference and integration guide",
      icon: FileCheck,
      type: "PDF",
      size: "4.2 MB",
      lastUpdated: "Dec 2024",
      link: "#",
    },
    {
      title: "Report Management Guide",
      description: "How to create, assign, and manage reports",
      icon: ClipboardList,
      type: "PDF",
      size: "2.1 MB",
      lastUpdated: "Dec 2024",
      link: "#",
    },
    {
      title: "Analytics Dashboard",
      description: "Understanding metrics and generating insights",
      icon: PieChart,
      type: "PDF",
      size: "1.6 MB",
      lastUpdated: "Dec 2024",
      link: "#",
    },
  ];

  const videos = [
    {
      title: "Platform Introduction",
      description: "5-minute overview of WhisTrust platform",
      duration: "5:32",
      thumbnail: "🎬",
      views: "1.2K",
    },
    {
      title: "Setting Up Your Organization",
      description: "Complete setup walkthrough for new admins",
      duration: "8:45",
      thumbnail: "🎥",
      views: "890",
    },
    {
      title: "Managing Reports & Cases",
      description: "How to review, assign, and resolve reports",
      duration: "12:15",
      thumbnail: "📹",
      views: "1.5K",
    },
    {
      title: "User Roles & Permissions",
      description: "Understanding RBAC and setting up your team",
      duration: "6:20",
      thumbnail: "🎬",
      views: "760",
    },
    {
      title: "Analytics & Reporting",
      description: "Generating insights from your data",
      duration: "9:40",
      thumbnail: "🎥",
      views: "650",
    },
    {
      title: "Security Best Practices",
      description: "Ensuring compliance and data protection",
      duration: "7:55",
      thumbnail: "📹",
      views: "540",
    },
  ];

  const quickLinks = [
    { title: "Getting Started", icon: Rocket, url: "#getting-started" },
    { title: "User Roles", icon: Users, url: "#roles" },
    { title: "Report Workflow", icon: Target, url: "#workflow" },
    { title: "Analytics", icon: TrendingUp, url: "#analytics" },
    { title: "Security", icon: Lock, url: "#security" },
    { title: "Troubleshooting", icon: HelpCircle, url: "#troubleshooting" },
  ];

  const faqs = [
    {
      question: "How do I create a new user?",
      answer: "Navigate to Users → Add User. Enter their email, name, role, and department. An invitation email will be sent automatically.",
    },
    {
      question: "What's the difference between user roles?",
      answer: "Admin has full access. Manager can manage cases and view analytics. Investigator handles assigned cases only. HR has limited read access to specific categories.",
    },
    {
      question: "How can I export reports?",
      answer: "Go to Reports → Select filters → Click 'Export PDF' or 'Export Excel'. Excel files are password-protected by default (password: WhisTrust!2025).",
    },
    {
      question: "Can I customize report categories?",
      answer: "Yes! Navigate to Settings → Report Categories. You can add, edit, or disable categories as needed.",
    },
    {
      question: "How does SSO integration work?",
      answer: "Go to Settings → SSO Configuration. Choose your provider (Google/Azure/OAuth), enter credentials, and save. The SSO button will appear on your login page automatically.",
    },
    {
      question: "What is the maximum file size for attachments?",
      answer: "The default limit is 10MB per file. Contact support if you need to increase this limit for your organization.",
    },
  ];

  const filteredFeatures = features.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 flex-1">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Documentation Center</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Hero Section */}
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Welcome to WhisTrust Docs
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Everything you need to manage your whistleblowing platform effectively
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Always Up-to-Date
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      <Zap className="h-3 w-3 mr-1" />
                      Quick Reference
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      <Video className="h-3 w-3 mr-1" />
                      Video Tutorials
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                    <BookMarked className="h-16 w-16 text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search features, guides, or FAQs..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex-col gap-2 p-4 hover:bg-primary/5 hover:border-primary/30"
                asChild
              >
                <a href={link.url}>
                  <link.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">{link.title}</span>
                </a>
              </Button>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="features" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="features">
                <Zap className="h-4 w-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="faq">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </TabsTrigger>
            </TabsList>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Platform Features
                  </CardTitle>
                  <CardDescription>
                    Comprehensive list of all WhisTrust capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredFeatures.map((feature, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-md transition-shadow border-l-4 border-l-primary/20 hover:border-l-primary"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <feature.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {feature.title}
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {feature.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            {feature.description}
                          </p>
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-700"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {feature.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Documentation Library
                  </CardTitle>
                  <CardDescription>
                    Download comprehensive guides and reference materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {documents.map((doc, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <doc.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <CardTitle className="text-base group-hover:text-primary transition-colors">
                                {doc.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {doc.description}
                              </p>
                              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {doc.type}
                                </span>
                                <span>{doc.size}</span>
                                <span>{doc.lastUpdated}</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button
                            className="w-full"
                            variant="outline"
                            asChild
                          >
                            <a href={doc.link}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Resources */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <GraduationCap className="h-6 w-6 text-primary" />
                      <span className="font-semibold">Training Materials</span>
                      <span className="text-xs text-muted-foreground">
                        Staff onboarding guides
                      </span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <span className="font-semibold">Best Practices</span>
                      <span className="text-xs text-muted-foreground">
                        Industry standards
                      </span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <FileQuestion className="h-6 w-6 text-primary" />
                      <span className="font-semibold">Case Studies</span>
                      <span className="text-xs text-muted-foreground">
                        Real-world examples
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Video Tutorials
                  </CardTitle>
                  <CardDescription>
                    Watch step-by-step guides and walkthroughs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video, index) => (
                      <Card
                        key={index}
                        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                          <div className="text-6xl">{video.thumbnail}</div>
                          <Button
                            size="icon"
                            className="absolute inset-0 m-auto h-16 w-16 rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
                          >
                            <PlayCircle className="h-8 w-8" />
                          </Button>
                          <Badge className="absolute top-2 right-2 bg-black/60">
                            {video.duration}
                          </Badge>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-base line-clamp-1">
                            {video.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {video.description}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {video.views} views
                            </span>
                            <Button variant="link" size="sm" className="h-auto p-0">
                              Watch Now
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>
                    Quick answers to common questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <Card key={index} className="border-l-4 border-l-primary/20">
                        <CardHeader>
                          <CardTitle className="text-base flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            {faq.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground pl-7">
                            {faq.answer}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold">Still need help?</h3>
                      <p className="text-sm text-muted-foreground">
                        Our support team is here to assist you 24/7
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Help Center
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

