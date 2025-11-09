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
  MessageSquare,
  Users,
  Globe,
  CheckCircle2,
  ArrowLeft,
  Bell,
  Smartphone,
  Workflow,
} from "lucide-react";

export const metadata = {
  title: "Professional Plan - WhisTrust",
  description:
    "Advanced Investigation tools for mid-to-large organizations needing comprehensive case management",
};

export default function ProfessionalPlanPage() {
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
          <Badge className="mb-4">
            Most Popular
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Professional Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Advanced investigation tools for mid-to-large organizations needing
            multi-language support and workflow automation
          </p>

          {/* Pricing Box */}
          <Card className="max-w-md mx-auto border-primary shadow-lg">
            <CardHeader>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">$1,200</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-center mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>501 – 2,500 employees</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-12 shadow-md" size="lg" asChild>
                <Link href="/demo">
                  Start Free Trial
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Key Highlights */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Key Highlights
          </h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0">
                    ✓ Essential
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Includes all Essential plan features
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Encrypted Two-Way Messaging
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Anonymous communication between reporters and admins
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Workflow className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Delegation & Workflow Automation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Assign cases and automate triage processes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Multi-Language Interface
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Support for 5+ languages and mobile apps
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Priority Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Priority email/chat support with admin training
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

          {/* Security & Reporting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security & Reporting
              </CardTitle>
              <CardDescription>
                Everything in Essential, plus:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Encrypted Two-Way Messaging
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Secure anonymous communication channel between reporters
                      and compliance team
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Customizable Reporting Forms
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Tailor intake forms to your organization's specific needs
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Anonymized Voice Messages
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Allow reporters to submit audio recordings securely
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">iOS/Android App Access</span>
                    <p className="text-sm text-muted-foreground">
                      Native mobile applications for on-the-go reporting
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
                <Workflow className="h-5 w-5 text-primary" />
                Case Management
              </CardTitle>
              <CardDescription>
                Everything in Essential, plus:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Full Auditable Case Lifecycle
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Track cases from triage through investigation to
                      resolution with complete audit trail
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Delegation & Triage Logic
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Automatically route cases based on category, severity, or
                      department
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Notifications & Alerts</span>
                    <p className="text-sm text-muted-foreground">
                      Real-time notifications for new reports, updates, and
                      escalations
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Access & Usability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Access & Usability
              </CardTitle>
              <CardDescription>
                Everything in Essential, plus:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Multi-Language Support (5+ languages)
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Interface and forms available in English, Spanish, French,
                      German, Arabic, and more
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Admin Training (Webinars)</span>
                    <p className="text-sm text-muted-foreground">
                      Monthly training webinars and onboarding sessions for your
                      compliance team
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Priority Email/Chat Support
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Priority queue with 4-12 hour response time via email and
                      live chat
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto border-primary">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">
                Upgrade Your Compliance Program
              </h3>
              <p className="text-muted-foreground mb-6">
                Start your 30-day free trial with full Professional features. No
                credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/demo">Start Free Trial</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/#pricing">Compare All Plans</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

