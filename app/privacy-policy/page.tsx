import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Globe, FileText, AlertCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            WhisTrust
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/terms-of-service"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Back to Home →
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            WhisTrust Privacy Policy
          </p>
        </div>

        {/* PDPL Compliance Notice */}
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">
                  Compliance with Data Protection Laws
                </h3>
                <p className="text-sm text-muted-foreground">
                  This Privacy Policy is designed to comply with applicable data protection
                  and privacy laws in your jurisdiction. WhisTrust is committed to
                  protecting your privacy and handling your personal data in accordance
                  with industry best practices and legal requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              1. Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              WhisTrust ("we," "us," or "our") operates a secure whistleblowing platform
              that enables anonymous reporting of misconduct, fraud, and policy violations
              within organizations. This Privacy Policy explains how we collect, use,
              protect, and disclose personal information in compliance with Saudi Arabian
              law.
            </p>
            <p className="text-muted-foreground">
              By using WhisTrust, you agree to the collection and use of information in
              accordance with this policy. If you do not agree with our policies and
              practices, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Data Controller */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              2. Data Controller Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              WhisTrust acts as the data controller for personal information processed
              through our platform. For inquiries regarding your personal data:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Contact Information:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Email: privacy@whistrust.com</li>
                <li>Data Protection Officer: dpo@whistrust.com</li>
                <li>Website: www.whistrust.com</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Information Collection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              3. Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">3.1 Information from Anonymous Reporters</h3>
              <p className="text-sm text-muted-foreground mb-2">
                We collect minimal information to maintain anonymity:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>Report details (category, description, incident information)</li>
                <li>Optional contact information (if you choose to provide it)</li>
                <li>File attachments (automatically stripped of metadata)</li>
                <li>Encrypted messages exchanged through the platform</li>
                <li>Unique tracking code (for case follow-up)</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">3.2 Information from Admin Users</h3>
              <p className="text-sm text-muted-foreground mb-2">
                For authenticated administrators:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>Name and email address</li>
                <li>Job title and department</li>
                <li>Login credentials (encrypted)</li>
                <li>Role and permission level</li>
                <li>Audit trail of actions performed</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">3.3 Technical Information</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>IP addresses (anonymized where possible)</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage analytics and system logs</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              4. How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              In accordance with data protection principles, we process personal data only for
              specified, explicit, and legitimate purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>To facilitate anonymous reporting and case management</li>
              <li>To enable secure communication between reporters and administrators</li>
              <li>To maintain audit logs for compliance and security purposes</li>
              <li>To improve our services and user experience</li>
              <li>To comply with legal obligations under applicable law</li>
              <li>To prevent fraud and ensure platform security</li>
              <li>To provide technical support when requested</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Localization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              5. Data Localization and Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              In compliance with data protection regulations:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Data Storage Location</h4>
                <p className="text-sm text-muted-foreground">
                  Personal data is stored in secure, compliant data centers. We offer data
                  localization options to meet regional regulatory requirements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Data Transfers</h4>
                <p className="text-sm text-muted-foreground">
                  We implement appropriate safeguards for international data transfers,
                  including standard contractual clauses and encryption, in accordance
                  with applicable regulations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Cloud Infrastructure</h4>
                <p className="text-sm text-muted-foreground">
                  Our cloud services are hosted in certified, secure data centers that meet
                  industry standards and regulatory requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              6. Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We implement comprehensive security measures in accordance with industry
              best practices and cybersecurity standards:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>End-to-end encryption for all messages and file uploads</li>
              <li>AES-256 encryption for data at rest</li>
              <li>TLS 1.3 for data in transit</li>
              <li>Automatic metadata removal from uploaded files</li>
              <li>Role-based access control (RBAC) with audit logging</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Multi-factor authentication for admin users</li>
              <li>Incident response and breach notification procedures</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              7. Your Data Protection Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Under applicable data protection laws, you have the following rights:
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-sm mb-1">Right to Access</h4>
                <p className="text-sm text-muted-foreground">
                  Request access to your personal data we hold
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-sm mb-1">Right to Rectification</h4>
                <p className="text-sm text-muted-foreground">
                  Request correction of inaccurate personal data
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-sm mb-1">Right to Deletion</h4>
                <p className="text-sm text-muted-foreground">
                  Request deletion of your personal data (subject to legal obligations)
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-sm mb-1">Right to Withdraw Consent</h4>
                <p className="text-sm text-muted-foreground">
                  Withdraw consent for data processing at any time
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-sm mb-1">Right to Object</h4>
                <p className="text-sm text-muted-foreground">
                  Object to certain types of data processing
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-sm mb-1">Right to File a Complaint</h4>
                <p className="text-sm text-muted-foreground">
                  Lodge a complaint with the relevant Data Protection Authority in your jurisdiction
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@whistrust.com" className="text-primary hover:underline">
                privacy@whistrust.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              8. Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We retain personal data only for as long as necessary to fulfill the purposes
              outlined in this policy or as required by applicable law:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>Case reports: Retained for 7 years after case closure (or as required by applicable regulations)</li>
              <li>Admin account data: Retained during employment + 2 years</li>
              <li>Audit logs: Retained for 5 years for compliance purposes</li>
              <li>Anonymous tracking codes: Retained for 1 year after case closure</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Breach Notification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              9. Data Breach Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              In the event of a data breach affecting personal data, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>Notify relevant Data Protection Authorities as required by law</li>
              <li>Notify affected individuals without undue delay if the breach poses a high risk</li>
              <li>Implement immediate remediation measures</li>
              <li>Document all breach incidents and response actions</li>
            </ul>
          </CardContent>
        </Card>

        {/* Third-Party Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              10. Third-Party Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We do not sell personal data. We may share information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>With your organization's authorized administrators (for case management)</li>
              <li>With cloud infrastructure providers (under data processing agreements)</li>
              <li>When required by applicable law or court order</li>
              <li>To protect our rights, safety, or property</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              All third parties are contractually obligated to protect your data in accordance
              with applicable data protection laws.
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              11. Cookies and Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We use essential cookies to ensure platform functionality. We do not use
              advertising or third-party tracking cookies. You can control cookie
              settings through your browser.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              12. Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              WhisTrust is not intended for individuals under 18 years of age. We do not
              knowingly collect personal information from minors. If you become aware that
              a child has provided us with personal data, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              13. Changes to This Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. Changes will be posted
              on this page with an updated "Last Updated" date. Continued use of WhisTrust
              after changes constitutes acceptance of the revised policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              14. Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              For questions about this Privacy Policy or our data practices:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@whistrust.com" className="text-primary hover:underline">
                  privacy@whistrust.com
                </a>
              </p>
              <p className="text-sm">
                <strong>Data Protection Officer:</strong>{" "}
                <a href="mailto:dpo@whistrust.com" className="text-primary hover:underline">
                  dpo@whistrust.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
          <div className="text-center text-sm text-muted-foreground mt-12 pb-8">
            <p className="mb-4">
              This Privacy Policy is governed by applicable laws in your jurisdiction
            </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="text-primary hover:underline">
              Home
            </Link>
            <span>•</span>
            <Link href="/terms-of-service" className="text-primary hover:underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/documentation" className="text-primary hover:underline">
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

