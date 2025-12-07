import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Users,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  FileText,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EmployeeReportingSoftwarePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="mb-4" variant="outline">
            Secure Employee Reporting Software
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Employee Reporting Software
            <span className="block text-primary mt-2">
              for Safe Workplaces
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empower your employees to report workplace concerns safely and
            confidentially. Secure employee reporting software with anonymous
            reporting capabilities and enterprise-grade security.
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

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Organizations Choose Our Employee Reporting Software
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Employee-Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Designed with employee safety and confidentiality in mind.
                  Easy-to-use interface encourages reporting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Anonymous Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  True anonymity with end-to-end encryption. Employees can
                  report concerns without fear of retaliation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <AlertTriangle className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Incident Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive case management for workplace incidents,
                  harassment, safety violations, and ethics concerns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Secure & Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enterprise security with GDPR, SOX, and HIPAA compliance.
                  Protect sensitive employee data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete documentation and audit trails for all employee
                  reports. Essential for compliance and investigations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Quick Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time notifications and workflow automation ensure
                  employee concerns are addressed promptly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Employees Can Report
          </h2>
          <div className="space-y-4">
            {[
              "Workplace Harassment and Discrimination",
              "Safety Violations and Unsafe Conditions",
              "Fraud and Financial Misconduct",
              "Ethics Violations and Code Breaches",
              "Bullying and Hostile Work Environment",
              "Data Privacy and Security Concerns",
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="flex items-center gap-4 p-6">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <p className="text-lg">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Protect Your Employees with Secure Reporting
          </h2>
          <p className="text-xl text-muted-foreground">
            Join organizations creating safer workplaces with our employee
            reporting software.
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

