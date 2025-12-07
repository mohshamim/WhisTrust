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
  Scale,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Users,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EthicsHotlineSoftwarePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="mb-4" variant="outline">
            Enterprise Ethics Hotline Software
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Ethics Hotline Software
            <span className="block text-primary mt-2">
              for Compliance & Ethics Management
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive ethics hotline software for managing compliance
            reporting, ethics violations, and confidential employee concerns.
            Built for enterprise organizations with regulatory compliance needs.
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
            Key Features of Our Ethics Hotline Software
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Scale className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Compliance Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built-in compliance frameworks for GDPR, SOX, HIPAA, and other
                  regulatory requirements. Automated compliance reporting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Secure & Confidential</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  End-to-end encryption ensures all ethics reports remain
                  confidential. Anonymous reporting with identity protection.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Case Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive case management system with workflow automation,
                  assignment, and tracking capabilities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced RBAC ensures only authorized personnel can access
                  sensitive ethics reports and compliance data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time analytics and reporting on ethics violations,
                  compliance trends, and case resolution metrics.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Audit Logging</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete audit trail for all ethics reports and compliance
                  activities. Immutable logs for regulatory requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Benefits of Using Ethics Hotline Software
          </h2>
          <div className="space-y-4">
            {[
              "Ensure regulatory compliance with automated reporting",
              "Protect employee confidentiality with anonymous reporting",
              "Reduce risk of ethics violations going unreported",
              "Improve organizational culture and transparency",
              "Streamline compliance management and reporting",
              "Gain insights into ethics trends and patterns",
            ].map((benefit, index) => (
              <Card key={index}>
                <CardContent className="flex items-center gap-4 p-6">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <p className="text-lg">{benefit}</p>
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
            Ready to Implement Ethics Hotline Software?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join leading organizations using WhisTrust for ethics and compliance
            management.
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

