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

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">WhisTrust</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
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
                {/* Custom burger - synced visually, sheet controls the state */}
                <label className="burger text-foreground" aria-label="Open menu">
                  <input type="checkbox" aria-hidden="true" />
                  <span></span>
                  <span></span>
                  <span></span>
                </label>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
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
      <section className="container mx-auto px-4 py-20 md:py-32">
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

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-8 pt-16 border-t">
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Reports</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Organizations</div>
            </div>
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
              <div className="absolute top-10 left-1/2 h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent hidden md:block"></div>
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
              <div className="absolute top-10 left-1/2 h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent hidden md:block"></div>
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
        className="container-enhanced py-20 bg-gradient-to-b from-background to-muted/20"
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
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 my-16">
            {/* Free Plan */}
            <Card className="card-enhanced hover-lift group relative flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Free</CardTitle>
                <CardDescription className="text-sm">
                  For individuals or small teams
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$0</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Forever</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Up to 10 reports/month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Basic tracking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Email support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Anonymous reporting</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-auto">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Starter Plan */}
            <Card className="card-enhanced hover-lift group relative flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Starter</CardTitle>
                <CardDescription className="text-sm">
                  For micro organizations
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">~109 SAR</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Up to 100 reports/month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Case assignment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Audit log</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">CSV export</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-auto">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan - Most Popular */}
            <Card className="card-enhanced hover-lift group relative flex flex-col border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-primary text-primary-foreground shadow-md">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-xl">Pro</CardTitle>
                <CardDescription className="text-sm">
                  For small & medium organizations
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$59</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">~221 SAR</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Unlimited reports</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Encrypted messaging</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Labels & priorities</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Analytics dashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">API access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Role-based permissions</span>
                  </div>
                </div>
                <Button className="w-full mt-auto shadow-md hover:shadow-lg">
                  See Demo
                </Button>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="card-enhanced hover-lift group relative flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Business</CardTitle>
                <CardDescription className="text-sm">
                  For large teams or compliance departments
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">~371 SAR</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Everything in Pro</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Advanced RBAC & SSO</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Custom branding</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Notification center</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-auto">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="card-enhanced hover-lift group relative flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <CardDescription className="text-sm">
                  For large organizations & government entities
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    from $149+/mo
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">On-prem / Data residency</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Dedicated support & SLA</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Data retention & DPA</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">Custom integrations</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-auto">
                  Request Quote
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
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 WhisTrust. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
