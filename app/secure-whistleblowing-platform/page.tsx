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
  Lock,
  CheckCircle2,
  ArrowRight,
  Key,
  Eye,
  FileCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SecureWhistleblowingPlatformPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="mb-4" variant="outline">
            Enterprise Secure Whistleblowing Platform
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Secure Whistleblowing Platform
            <span className="block text-primary mt-2">
              with End-to-End Encryption
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Protect whistleblowers with our secure whistleblowing platform.
            Enterprise-grade encryption, anonymous reporting, and GDPR/SOX
            compliance built-in.
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
            Security Features of Our Whistleblowing Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-4" />
                <CardTitle>End-to-End Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All whistleblower reports are encrypted from submission to
                  storage. Bank-level encryption ensures maximum security.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Key className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Anonymous Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  True anonymity with no IP logging, metadata stripping, and
                  identity protection measures.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  RBAC, audit logging, and multi-tenant architecture with
                  complete data isolation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Zero-Knowledge Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Even platform administrators cannot access encrypted
                  whistleblower reports without proper authorization.
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
                  Built for GDPR, SOX, HIPAA, and other regulatory requirements.
                  Automated compliance reporting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Whistleblower Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive protection measures to ensure whistleblowers
                  remain safe and anonymous throughout the process.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Security Matters in Whistleblowing
          </h2>
          <div className="space-y-4">
            {[
              "Protect whistleblower identities from retaliation",
              "Ensure confidential information remains secure",
              "Comply with data protection regulations",
              "Build trust with potential whistleblowers",
              "Maintain integrity of reported information",
              "Enable safe reporting of sensitive issues",
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
            Secure Your Whistleblowing Program Today
          </h2>
          <p className="text-xl text-muted-foreground">
            Join organizations protecting whistleblowers with our secure
            platform.
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

