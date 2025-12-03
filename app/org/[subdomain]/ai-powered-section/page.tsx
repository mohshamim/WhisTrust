"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  FileText, 
  Brain, 
  TrendingUp, 
  Shield, 
  Search,
  Zap,
  Globe,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ClientSidebar } from "@/components/client-sidebar";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentClientAdmin } from "@/lib/services/client-auth";
import { getAvatarUrl } from "@/lib/services/avatar";

export default function AIPoweredSectionPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    todayAnalyses: 0,
    avgProcessingTime: 0,
  });
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user: currentUser, organization: currentOrg } = await getCurrentClientAdmin();
        if (!currentUser || !currentOrg) {
          router.push(`/org/${subdomain}/login`);
          return;
        }
        setUser(currentUser);
        setOrganization(currentOrg);

        // Load AI usage stats (placeholder for now)
        setStats({
          totalAnalyses: 15,
          todayAnalyses: 8,
          avgProcessingTime: 4.5,
        });
      } catch (error) {
        console.error("Failed to load data:", error);
        router.push(`/org/${subdomain}/login`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subdomain, router]);

  const activeFeatures = [
    {
      id: "attachment-analyzer",
      title: "Attachment Analyzer",
      description: "Automatically analyze PDFs and images to extract insights, detect entities, and assess risk levels.",
      icon: FileText,
      status: "active",
      usageCount: stats.todayAnalyses,
      href: `/org/${subdomain}/ai-powered-section/attachment-analyzer`,
      features: [
        "Extract text from PDFs and images",
        "Detect risk levels (Low to Critical)",
        "Identify entities (dates, names, locations)",
        "Generate summary and key findings",
      ],
    },
  ];

  const comingSoonFeatures = [
    {
      id: "case-summarizer",
      title: "Case Summarizer",
      description: "Generate executive summaries of entire cases with AI-powered timeline reconstruction.",
      icon: Brain,
      status: "coming_soon",
      estimatedRelease: "Q1 2026",
    },
    {
      id: "risk-predictor",
      title: "Risk Predictor",
      description: "Predict case severity and priority using historical patterns and machine learning.",
      icon: TrendingUp,
      status: "coming_soon",
      estimatedRelease: "Q2 2026",
    },
    {
      id: "smart-search",
      title: "Smart Search",
      description: "Search cases using natural language. Ask questions like 'Find harassment cases in Q4'.",
      icon: Search,
      status: "coming_soon",
      estimatedRelease: "Q2 2026",
    },
    {
      id: "compliance-checker",
      title: "Compliance Checker",
      description: "Automatically check reports against company policies and flag potential violations.",
      icon: Shield,
      status: "coming_soon",
      estimatedRelease: "Q3 2026",
    },
    {
      id: "auto-translation",
      title: "Auto Translation",
      description: "Translate reports and documents into multiple languages for global organizations.",
      icon: Globe,
      status: "coming_soon",
      estimatedRelease: "Q3 2026",
    },
    {
      id: "predictive-insights",
      title: "Predictive Insights",
      description: "Get AI predictions on case resolution time and recommended next steps.",
      icon: Zap,
      status: "coming_soon",
      estimatedRelease: "Q4 2026",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !organization) {
    return null;
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <NotificationsDropdown 
              userId={user?.id || ""} 
              organizationId={organization?.id || ""} 
            />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
          <div className="container mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Powered Section</h1>
              <p className="text-muted-foreground mt-1">
                Smart tools to make your work easier and faster
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Analyses</p>
                    <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold">{stats.todayAnalyses}</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Processing</p>
                    <p className="text-2xl font-bold">{stats.avgProcessingTime}s</p>
                  </div>
                  <Zap className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Features */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Available Now</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {activeFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {feature.title}
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Active
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.usageCount} today
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Features List */}
                      <div>
                        <p className="text-sm font-semibold mb-2">What it does:</p>
                        <ul className="space-y-1.5">
                          {feature.features.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Powered by Gemini AI
                        </p>
                        <Button asChild>
                          <a href={feature.href}>
                            Use Attachment Analyzer
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Coming Soon</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comingSoonFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="relative overflow-hidden opacity-75 hover:opacity-90 transition-opacity">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                        Planned
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" disabled className="w-full">
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <Card className="mt-8 border-dashed bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Have questions about AI features or want to suggest new capabilities? We'd love to hear from you!
            </p>
            <Button variant="outline" asChild>
              <a href="/contact">
                Contact WhisTrust Support
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

