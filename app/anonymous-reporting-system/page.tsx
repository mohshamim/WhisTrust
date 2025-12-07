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
  Eye,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Users,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AnonymousReportingSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="mb-4" variant="outline">
            Secure Anonymous Reporting System
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Anonymous Reporting System
            <span className="block text-primary mt-2">
              for Modern Organizations
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enable confidential employee reporting with our secure anonymous
            reporting system. Enterprise-grade security, end-to-end encryption,
            and GDPR/SOX compliance built-in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/demo">Try Free Demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Anonymous Reporting System?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>100% Anonymous</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  True anonymity with end-to-end encryption. Employee identities
                  are protected with advanced security measures.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bank-level encryption, RBAC, and audit logging. GDPR, SOX,
                  and HIPAA compliant reporting system.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Confidential Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Secure communication channels with metadata stripping and
                  automatic file encryption for all attachments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Compliance Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built for regulatory compliance including GDPR, SOX, HIPAA, and
                  other industry standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Multi-Tenant Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Support multiple organizations with complete data isolation
                  and custom branding per tenant.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive reporting dashboard with real-time analytics and
                  case management tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Use Cases for Anonymous Reporting System
          </h2>
          <div className="space-y-4">
            {[
              "Fraud and Financial Misconduct Reporting",
              "Workplace Harassment and Discrimination",
              "Safety Violations and Unsafe Working Conditions",
              "Ethics Violations and Code of Conduct Breaches",
              "Regulatory Compliance Issues",
              "Data Privacy and Security Concerns",
            ].map((useCase, index) => (
              <Card key={index}>
                <CardContent className="flex items-center gap-4 p-6">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <p className="text-lg">{useCase}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to Implement an Anonymous Reporting System?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join organizations worldwide using WhisTrust for secure, confidential
            employee reporting.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/demo">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

