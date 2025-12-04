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
  FileCheck,
  Users,
  CheckCircle2,
  ArrowLeft,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Essential Plan - WhisTrust",
  description:
    "Compliance Foundation for small to mid-sized companies requiring core legal compliance",
};

export default function EssentialPlanPage() {
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
            Essential Plan
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Compliance Foundation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Perfect for small to mid-sized companies requiring core legal
            compliance (Minimum Viable Product)
          </p>

          {/* Pricing Box */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">$499</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-center mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Up to 500 employees</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-12" size="lg" asChild>
                <Link href="/demo">Start Free Trial</Link>
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
                  <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Secure Anonymous Reporting
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Unique tracking codes with end-to-end encryption
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Basic Attachments & Metadata Stripping
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Automatic cleaning of file metadata for privacy
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Single Gatekeeper Access
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Dedicated compliance manager with audit logging
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Standard Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Email support with standard response times
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
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Mandatory Anonymous Reporting
                    </span>
                    <p className="text-sm text-muted-foreground">
                      All reports submitted anonymously by default
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Unique Tracking Code Generation
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Secure tracking system for case status updates
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      End-to-End Encryption (E2EE)
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Military-grade encryption for all communications
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Attachments (Basic)</span>
                    <p className="text-sm text-muted-foreground">
                      Upload supporting documents with reports
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Automatic Metadata Stripping
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Remove identifying information from uploaded files
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
                <FileCheck className="h-5 w-5 text-primary" />
                Case Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Single Triage Gatekeeper Access
                    </span>
                    <p className="text-sm text-muted-foreground">
                      One designated compliance manager for all reports
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Basic Auditable Activity Log
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Track all actions taken on each case
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Internal Case Notes (non-shareable)
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Private notes for internal investigation tracking
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Basic Status Check for Reporters
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Reporters can track case progress with tracking code
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
                <Users className="h-5 w-5 text-primary" />
                Access & Usability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Web-Based Form Access (Secure URL)
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Simple, secure web interface for reporting
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Standard Reporting Form</span>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive form with all essential fields
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Limited Language Support
                    </span>
                    <p className="text-sm text-muted-foreground">
                      English + 1 local language of your choice
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">
                      Email Support (Standard SLA)
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Email support with 24-48 hour response time
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6">
                Start your 30-day free trial today. No credit card required.
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
