import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Users,
  Globe,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Award,
  Zap,
  Database,
  Headphones,
  FileKey,
} from "lucide-react";

export const metadata = {
  title: "Enterprise Plan - WhisTrust",
  description:
    "Ultimate Security & Customization for large international organizations",
};

export default function EnterprisePlanPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">WhisTrust</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/#pricing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Enterprise Plan
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ultimate Security & Customization
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            For large international organizations needing full compliance,
            integration, and 24/7 dedicated support
          </p>

          {/* Pricing Box */}
          <Card className="max-w-md mx-auto border-2">
            <CardHeader>
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-5xl font-bold">Custom Quote</span>
                <span className="text-muted-foreground">
                  Tailored to your needs
                </span>
              </div>
              <CardDescription className="text-center mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>2,500+ employees</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-12" size="lg" variant="default" asChild>
                <Link href="/contact">Request Custom Quote</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Key Highlights */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Key Highlights
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0">
                    ✓ Professional
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Includes all Professional plan features
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      SSO & IP Access Control
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enterprise authentication and security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      SOC 2 & ISO 27001 Compliance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Certified enterprise-grade security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Advanced RBAC & Dashboards
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Granular permissions and custom reporting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      API & Webhooks Integration
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with your existing systems
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Headphones className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Dedicated CSM & 24/7 Support
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      White-glove support with SLA guarantees
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Detailed Features */}
        <section className="space-y-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Complete Feature Breakdown
          </h2>

          {/* Critical Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Critical Security
              </CardTitle>
              <CardDescription>
                Everything in Professional, plus:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">SSO Integration</span>
                    <p className="text-sm text-muted-foreground">
                      SAML 2.0 and OAuth 2.0 support for seamless enterprise
                      authentication (Okta, Azure AD, Google Workspace)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">IP Access Restrictions</span>
                    <p className="text-sm text-muted-foreground">
                      Whitelist specific IP ranges for admin access and
                      geo-fencing capabilities
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      SOC 2 & ISO 27001 Compliance
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Independently audited and certified for data security and
                      privacy standards
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Data Sovereignty (EU/US/APAC)
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Choose your data residency region to comply with local
                      regulations (GDPR, CCPA, etc.)
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Case Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileKey className="h-5 w-5 text-primary" />
                Advanced Case Management
              </CardTitle>
              <CardDescription>
                Everything in Professional, plus:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Committee Final Review Workflow
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Multi-stage approval process with designated review
                      committees before case closure
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Granular RBAC</span>
                    <p className="text-sm text-muted-foreground">
                      Fine-grained role and permission control: view-only,
                      investigator, manager, admin roles with custom permissions
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">API Access & Webhooks</span>
                    <p className="text-sm text-muted-foreground">
                      RESTful API and webhook integrations to connect with your
                      HRIS, case management, or BI tools
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Advanced Reporting Dashboards
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Custom dashboards with real-time metrics, trend analysis,
                      and executive reporting
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Support & SLA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-primary" />
                Support & SLA
              </CardTitle>
              <CardDescription>
                Everything in Professional, plus:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Dedicated Customer Success Manager
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Named CSM for strategic guidance, onboarding, and ongoing
                      optimization
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      24/7/365 Priority Support
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Round-the-clock phone, email, and chat support with
                      immediate escalation
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Formal SLA for Uptime & Resolution
                    </span>
                    <p className="text-sm text-muted-foreground">
                      99.9% uptime guarantee with committed response and
                      resolution times
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Deployment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Deployment & Migration
              </CardTitle>
              <CardDescription>Enterprise onboarding services:</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Full Data Migration Support
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Migrate your existing case data from legacy systems with
                      zero data loss
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Custom Onboarding & Deployment Consultation
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Dedicated deployment team to configure, test, and launch
                      your custom instance
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Additional Benefits */}
        <section className="mt-16">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-center">
                Why Choose Enterprise?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">
                      Compliance & Certifications
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Meet the strictest regulatory requirements with SOC 2 Type
                      II, ISO 27001, GDPR, and CCPA compliance built-in.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Global Scale</h4>
                    <p className="text-sm text-muted-foreground">
                      Deploy across multiple regions with data residency options
                      in EU, US, and APAC to meet local regulations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">
                      Seamless Integration
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Connect WhisTrust with your existing tech stack using our
                      REST API, webhooks, and pre-built integrations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">White-Glove Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Your dedicated Customer Success Manager ensures smooth
                      operations and helps maximize ROI from day one.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto border-2">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready for Enterprise-Grade Compliance?
              </h3>
              <p className="text-muted-foreground mb-6">
                Contact our team for a personalized demo and custom pricing
                tailored to your organization's needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/contact">Request Custom Quote</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/demo">Schedule Demo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

