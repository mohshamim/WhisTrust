"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Lock,
  MessageSquare,
  FileCheck,
  ArrowRight,
  Check,
  Zap,
  Users,
  BarChart3,
  Eye,
  Clock,
  Globe,
  Award,
  TrendingUp,
  ChevronDown,
  Menu,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  OrganizationSchema,
  SoftwareApplicationSchema,
  FAQSchema,
  WebSiteSchema,
} from "@/components/structured-data";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle OAuth callback that lands on homepage (fallback)
  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    // Handle both successful OAuth (code) and failed OAuth (error)
    if (code || error) {
      setIsRedirecting(true); // Prevent page from rendering
      
      // Try multiple methods to get organization subdomain
      let orgSubdomain: string | null = null;
      
      // Method 1: Try to get from query parameter (we pass it in queryParams)
      if (!orgSubdomain) {
        orgSubdomain = searchParams.get("organization_subdomain");
      }
      
      // Method 2: Try localStorage (set before SSO redirect)
      if (!orgSubdomain) {
        orgSubdomain = localStorage.getItem("sso_org_subdomain");
      }
      
      // Method 3: Try cookie (more reliable, set before SSO redirect)
      if (!orgSubdomain && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const ssoCookie = cookies.find(c => c.trim().startsWith('sso_org_subdomain='));
        if (ssoCookie) {
          orgSubdomain = ssoCookie.split('=')[1]?.trim() || null;
        }
      }
      
      // Method 3: Try to extract from current hostname (for subdomain-based routing in production)
      if (!orgSubdomain && typeof window !== 'undefined') {
        try {
          const hostname = window.location.hostname;
          // Check if we're on a subdomain (e.g., codesquare.whistrust.app)
          const hostParts = hostname.split('.');
          if (hostParts.length >= 3) {
            // e.g., codesquare.whistrust.app -> codesquare
            const possibleSubdomain = hostParts[0];
            // Exclude known non-tenant subdomains
            if (possibleSubdomain && 
                possibleSubdomain !== 'www' && 
                possibleSubdomain !== 'demo' && 
                possibleSubdomain !== 'superadmin') {
              orgSubdomain = possibleSubdomain;
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Method 4: Try to extract from referrer URL
      if (!orgSubdomain && typeof document !== 'undefined' && document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          const referrerHostname = referrerUrl.hostname;
          // Try subdomain from referrer hostname
          const referrerParts = referrerHostname.split('.');
          if (referrerParts.length >= 3) {
            const possibleSubdomain = referrerParts[0];
            if (possibleSubdomain && 
                possibleSubdomain !== 'www' && 
                possibleSubdomain !== 'demo' && 
                possibleSubdomain !== 'superadmin') {
              orgSubdomain = possibleSubdomain;
            }
          }
          // Also try path-based routing from referrer
          if (!orgSubdomain) {
            const referrerPath = referrerUrl.pathname;
            const pathMatch = referrerPath.match(/\/org\/([a-z0-9-]+)/);
            if (pathMatch) {
              orgSubdomain = pathMatch[1];
            }
          }
        } catch (e) {
          // Ignore URL parsing errors
        }
      }
      
      if (orgSubdomain) {
        // Clear the stored subdomain
        localStorage.removeItem("sso_org_subdomain");
        if (typeof document !== 'undefined') {
          document.cookie = 'sso_org_subdomain=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        
        // If we have a code, redirect to callback route
        if (code) {
          window.location.replace(`/org/${orgSubdomain}/sso/callback?code=${code}`);
          return;
        }
        
        // If we have an error, redirect to login page with error message
        if (error) {
          const errorMsg = errorDescription || error || "SSO authentication failed";
          window.location.replace(`/org/${orgSubdomain}/login?error=${encodeURIComponent(errorMsg)}`);
          return;
        }
      }
      
      // If no subdomain found, try one more time to extract subdomain
      let errorOrgSubdomain: string | null = null;
      
      if (typeof window !== 'undefined') {
        // Try hostname
        try {
          const hostname = window.location.hostname;
          const hostParts = hostname.split('.');
          if (hostParts.length >= 3) {
            const possibleSubdomain = hostParts[0];
            if (possibleSubdomain && 
                possibleSubdomain !== 'www' && 
                possibleSubdomain !== 'demo' && 
                possibleSubdomain !== 'superadmin') {
              errorOrgSubdomain = possibleSubdomain;
            }
          }
        } catch (e) {
          // Ignore
        }
        
        // Try referrer if still not found
        if (!errorOrgSubdomain && document.referrer) {
          try {
            const referrerUrl = new URL(document.referrer);
            const referrerHostname = referrerUrl.hostname;
            const referrerParts = referrerHostname.split('.');
            if (referrerParts.length >= 3) {
              const possibleSubdomain = referrerParts[0];
              if (possibleSubdomain && 
                  possibleSubdomain !== 'www' && 
                  possibleSubdomain !== 'demo' && 
                  possibleSubdomain !== 'superadmin') {
                errorOrgSubdomain = possibleSubdomain;
              }
            }
            if (!errorOrgSubdomain) {
              const pathMatch = referrerUrl.pathname.match(/\/org\/([a-z0-9-]+)/);
              if (pathMatch) {
                errorOrgSubdomain = pathMatch[1];
              }
            }
          } catch (e) {
            // Ignore
          }
        }
        
        console.error('[SSO Fallback] Could not determine organization subdomain', {
          hostname: window.location.hostname,
          referrer: document.referrer,
          hasLocalStorage: !!localStorage.getItem("sso_org_subdomain"),
          cookies: document.cookie,
          extractedOrg: errorOrgSubdomain,
          hasCode: !!code,
          hasError: !!error,
        });
        
        // If we found an org, redirect to login page with error
        if (errorOrgSubdomain) {
          const errorMsg = errorDescription || error || "SSO authentication failed";
          window.location.replace(`/org/${errorOrgSubdomain}/login?error=${encodeURIComponent(errorMsg)}`);
          return;
        }
      }
      
      // Last resort: redirect to error page
      let errorUrl = `/error?message=${encodeURIComponent("SSO authentication failed. Please try logging in again from your organization's login page.")}`;
      if (errorOrgSubdomain) {
        errorUrl += `&org=${errorOrgSubdomain}`;
      }
      window.location.replace(errorUrl);
    }
  }, [searchParams, router]);

  // Show loading state while redirecting (prevents homepage flash)
  if (isRedirecting || searchParams.get("code")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data for SEO */}
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <FAQSchema />
      <WebSiteSchema />
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold">WhisTrust</span>
          </div>
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="#features"
              className="text-sm hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm hover:text-primary transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-sm hover:text-primary transition-colors"
            >
              Contact
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/documentation">Documentation</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/demo">
                See Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className="size-9 rounded-xl border bg-background/70 shadow-sm hover:bg-muted transition"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-sm p-0">
                <SheetHeader className="px-4 py-4 border-b">
                  <SheetTitle className="text-lg">Menu</SheetTitle>
                </SheetHeader>
                <nav className="p-3">
                  <ul className="flex flex-col gap-1">
                    <li>
                      <Link
                        href="#features"
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-base hover:bg-muted transition"
                      >
                        Features
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#how-it-works"
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-base hover:bg-muted transition"
                      >
                        How It Works
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#pricing"
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-base hover:bg-muted transition"
                      >
                        Pricing
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-base hover:bg-muted transition"
                      >
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/documentation"
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-base hover:bg-muted transition"
                      >
                        Documentation
                      </Link>
                    </li>
                  </ul>
                  <Separator className="my-3" />
                  <Button asChild className="w-full h-11 mt-1 shadow-sm">
                    <Link href="/demo">
                      See Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-14 md:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 animate-in fade-in-0 zoom-in-95 duration-500">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Secure & Anonymous Reporting Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            Protect Whistleblowers.
            <br />
            <span className="text-primary">Enable Justice.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in-0 slide-in-from-bottom-5 duration-800">
            A secure, anonymous whistleblowing and ethics reporting platform
            that protects reporters while ensuring transparency and
            accountability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in-0 slide-in-from-bottom-6 duration-1000">
            <Button asChild size="lg" className="text-base h-14 px-8 shadow-lg">
              <Link href="/demo">
                See Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base h-14 px-8"
            >
              <Link href="/documentation">Documentation</Link>
            </Button>
          </div>

          
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="container mx-auto px-4 py-20 bg-muted/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for secure, anonymous reporting
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>100% Anonymous</CardTitle>
                <CardDescription>
                  Military-grade encryption ensures your identity stays
                  protected.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-time Tracking</CardTitle>
                <CardDescription>
                  Monitor your case status and communicate securely with
                  compliance teams.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Professional Review</CardTitle>
                <CardDescription>
                  All reports reviewed by certified compliance professionals
                  within 24 hours.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Dashboard Analytics</CardTitle>
                <CardDescription>
                  Comprehensive insights and reporting for compliance managers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>24/7 Availability</CardTitle>
                <CardDescription>
                  Submit reports anytime, anywhere with our cloud-based
                  platform.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-language Support</CardTitle>
                <CardDescription>
                  Available in multiple languages for global organizations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple, secure, and anonymous reporting in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 relative">
              <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                1
              </div>
              <div className="absolute top-10 left-1/2 h-0.5 w-full bg-linear-to-r from-primary/50 to-transparent hidden md:block"></div>
              <h3 className="text-xl font-semibold">Submit Report</h3>
              <p className="text-muted-foreground">
                Provide details about the incident anonymously. Upload
                supporting documents securely.
              </p>
            </div>

            <div className="text-center space-y-4 relative">
              <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                2
              </div>
              <div className="absolute top-10 left-1/2 h-0.5 w-full bg-linear-to-r from-primary/50 to-transparent hidden md:block"></div>
              <h3 className="text-xl font-semibold">Get Tracking Code</h3>
              <p className="text-muted-foreground">
                Receive a unique tracking code to monitor your case and
                communicate with the team.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold">Track Progress</h3>
              <p className="text-muted-foreground">
                View updates and respond to follow-up questions from compliance
                professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="container-enhanced py-20 bg-linear-to-b from-background to-muted/20"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <Badge variant="secondary" className="mb-4">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Lower cost. Same enterprise security.
              </span>
            </Badge>
            <h2 className="text-5xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for your organization
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 my-16 max-w-6xl mx-auto">
            {/* Essential Plan */}
            <Card className="card-enhanced hover-lift group relative flex flex-col">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Essential</CardTitle>
                <CardDescription className="text-sm mt-2">
                  Compliance Foundation
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-2">
                  Small/Mid-sized companies requiring core legal compliance
                </p>
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">$700</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <Users className="h-3 w-3 inline mr-1" />
                    Up to 500 employees
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Secure anonymous reporting with tracking codes
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">
                      End-to-End Encryption & basic attachments
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Single gatekeeper access with audit log
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Standard email support</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-auto h-11"
                  asChild
                >
                  <Link href="/plan-details/essential">
                    See Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan - Most Popular */}
            <Card className="card-enhanced hover-lift group relative flex flex-col border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-primary text-primary-foreground shadow-md">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="pb-6 pt-6">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription className="text-sm mt-2">
                  Advanced Investigation
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-2">
                  Mid-to-Large organizations needing advanced investigation
                  tools
                </p>
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">$1,200</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <Users className="h-3 w-3 inline mr-1" />
                    501 – 2,500 employees
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">
                      All Essential features
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Encrypted two-way anonymous messaging
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Delegation & workflow automation
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Multi-language & mobile apps</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Priority support & admin training
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-auto h-11 shadow-md" asChild>
                  <Link href="/plan-details/professional">
                    See Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="card-enhanced hover-lift group relative flex flex-col">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription className="text-sm mt-2">
                  Ultimate Security & Customization
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-2">
                  Large international organizations needing full compliance
                </p>
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">Custom Quote</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <Users className="h-3 w-3 inline mr-1" />
                    2,500+ employees
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">
                      All Professional features
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">
                      SSO, IP control, SOC 2 & ISO 27001
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Advanced RBAC & reporting dashboards
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">API & Webhooks integration</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">
                      Dedicated CSM & 24/7 support with SLA
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-auto h-11"
                  asChild
                >
                  <Link href="/plan-details/enterprise">
                    See Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Included in all plans */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              All plans include enterprise-grade encryption, audit logs, and
              anonymous reporting by default.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Is my data encrypted?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely. All data is encrypted in transit and at rest using
                  industry-standard AES encryption. Messages use client-side
                  encryption for maximum security.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Can I upgrade or downgrade anytime?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes take effect immediately, and we'll prorate any charges
                  for the billing cycle.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Do you offer NGO or educational discounts?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, we offer special pricing for NGOs, educational
                  institutions, and non-profit organizations. Contact our sales
                  team for details.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  How does WhisTrust compare to other providers?
                </AccordionTrigger>
                <AccordionContent>
                  WhisTrust offers enterprise-grade security at a fraction of
                  the cost. We provide unlimited reports, advanced encryption,
                  metadata cleaning, real-time messaging, and comprehensive
                  audit logging. All at transparent, affordable pricing with KSA
                  data residency options.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 max-w-4xl mx-auto">
          <CardHeader className="text-center space-y-4">
            <Award className="h-12 w-12 text-primary mx-auto" />
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of organizations trusting WhisTrust for secure
              reporting.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8">
              <Link href="/demo">
                See Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8">
              <Link href="/documentation">View Documentation</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">WhisTrust</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure, anonymous whistleblowing platform for organizations
                worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/demo"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Demo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documentation"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    About
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025{" "}
            <a
              href="http://aisar.sa/"
            target="_blank"
            rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
              Aisar Technologies
          </a>
            {" "}| All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
