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
import { FileText, Shield, AlertTriangle, Scale, CheckCircle } from "lucide-react";

export default function TermsOfServicePage() {
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
              href="/privacy-policy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
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
            <Scale className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            WhisTrust Terms of Service
          </p>
        </div>

        {/* Legal Compliance Notice */}
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">
                  Governed by Applicable Laws and Regulations
                </h3>
                <p className="text-sm text-muted-foreground">
                  These Terms of Service are governed by and construed in accordance with
                  applicable laws and regulations in your jurisdiction, including but not
                  limited to e-commerce, electronic transactions, cybersecurity, and data
                  protection laws. By using WhisTrust, you agree to comply with all
                  applicable regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agreement to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              1. Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              These Terms of Service ("Terms") constitute a legally binding agreement between
              you and WhisTrust ("we," "us," or "our") governing your access to and use of
              the WhisTrust whistleblowing platform, including any related services,
              applications, and websites (collectively, the "Service").
            </p>
            <p className="text-muted-foreground">
              By accessing or using our Service, you acknowledge that you have read,
              understood, and agree to be bound by these Terms. If you do not agree to
              these Terms, you must not access or use the Service.
            </p>
          </CardContent>
        </Card>

        {/* User Eligibility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              2. User Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">To use WhisTrust, you must:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts under applicable law</li>
              <li>Not be prohibited from using the Service under any applicable law</li>
              <li>Provide accurate and complete information when registering (admin users)</li>
              <li>Comply with all applicable laws and regulations in your jurisdiction</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Types and Access */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              3. User Types and Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">3.1 Anonymous Reporters</h3>
              <p className="text-sm text-muted-foreground mb-2">
                You may submit anonymous reports without registration. By submitting a report:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>You warrant that all information provided is truthful and accurate</li>
                <li>You understand that false reports may have legal consequences</li>
                <li>You retain a tracking code for case follow-up</li>
                <li>You may communicate with administrators through encrypted messaging</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">3.2 Admin Users</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Organizations may register admin users with role-based access:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>Admin accounts are created by system administrators</li>
                <li>You must maintain the confidentiality of your login credentials</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized access</li>
                <li>You must comply with your organization's internal policies</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              4. Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You agree to use WhisTrust only for lawful purposes and in accordance with
              these Terms. You agree NOT to:
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-destructive pl-4">
                <h4 className="font-semibold text-sm mb-1">Prohibited Activities</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                  <li>Submit false, misleading, or malicious reports</li>
                  <li>Use the Service to harass, defame, or harm others</li>
                  <li>Attempt to identify anonymous reporters</li>
                  <li>Circumvent security measures or access controls</li>
                  <li>Upload malware, viruses, or harmful code</li>
                  <li>Interfere with the operation of the Service</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Use the Service for any illegal purpose</li>
                  <li>Share your admin credentials with unauthorized persons</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting Obligations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              5. Reporting Obligations and Good Faith
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              WhisTrust is designed to facilitate legitimate reporting of misconduct. All
              users must:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>Submit reports in good faith with reasonable belief in their accuracy</li>
              <li>Provide factual information to the best of their knowledge</li>
              <li>Not use the platform for personal vendettas or false accusations</li>
              <li>Understand that knowingly false reports may result in legal action under Saudi law</li>
            </ul>
            <div className="bg-muted/50 p-4 rounded-lg mt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Many jurisdictions impose penalties for defamation
                and false accusations made through electronic means. Users are responsible
                for ensuring their reports are truthful and comply with local laws.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              6. Intellectual Property Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The Service and its entire contents, features, and functionality (including
              but not limited to all information, software, code, text, displays, graphics,
              photographs, video, audio, design, and the selection and arrangement thereof)
              are owned by WhisTrust, its licensors, or other providers of such material
              and are protected by international copyright, trademark, patent, trade secret,
              and other intellectual property or proprietary rights laws.
            </p>
            <p className="text-sm text-muted-foreground">
              You may not reproduce, distribute, modify, create derivative works of,
              publicly display, or exploit any part of the Service without our express
              written permission.
            </p>
          </CardContent>
        </Card>

        {/* Data and Privacy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              7. Data Protection and Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your use of the Service is also governed by our Privacy Policy, which
              complies with applicable data protection laws and regulations. By using
              the Service, you consent to our collection, use, and disclosure of your
              information as described in the Privacy Policy.
            </p>
            <p className="text-sm text-muted-foreground">
              Key privacy commitments:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Secure data storage with optional localization</li>
              <li>End-to-end encryption for messages and files</li>
              <li>Automatic metadata removal from uploads</li>
              <li>Compliance with industry cybersecurity standards</li>
            </ul>
          </CardContent>
        </Card>

        {/* Confidentiality */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              8. Confidentiality and Anonymity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">8.1 Reporter Anonymity</h3>
              <p className="text-sm text-muted-foreground">
                We implement technical measures to protect reporter anonymity. However,
                absolute anonymity cannot be guaranteed if:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>You voluntarily provide identifying information</li>
                <li>Information in your report reveals your identity</li>
                <li>We are legally required to disclose information by competent authorities</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">8.2 Admin User Obligations</h3>
              <p className="text-sm text-muted-foreground">
                Admin users must:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>Maintain strict confidentiality of all case information</li>
                <li>Not attempt to identify anonymous reporters</li>
                <li>Comply with data protection and confidentiality obligations</li>
                <li>Use case information only for legitimate business purposes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              9. Service Availability and Modifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We strive to provide continuous Service availability. However:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>The Service may be temporarily unavailable due to maintenance, upgrades, or technical issues</li>
              <li>We may modify, suspend, or discontinue any aspect of the Service at any time</li>
              <li>We will provide reasonable notice of material changes when possible</li>
              <li>We are not liable for any Service interruptions or modifications</li>
            </ul>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              10. Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To the fullest extent permitted by applicable law:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-muted-foreground">
                WhisTrust is provided "as is" and "as available" without warranties of any kind,
                either express or implied. We do not warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>The Service will meet your requirements or be uninterrupted</li>
                <li>The Service will be secure or error-free</li>
                <li>The results obtained from using the Service will be accurate</li>
                <li>Any errors will be corrected</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                In no event shall WhisTrust be liable for any indirect, incidental, special,
                consequential, or punitive damages arising out of or related to your use of
                the Service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              11. Indemnification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You agree to indemnify, defend, and hold harmless WhisTrust, its officers,
              directors, employees, agents, and affiliates from any claims, liabilities,
              damages, losses, costs, or expenses (including reasonable attorneys' fees)
              arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>Your violation of these Terms</li>
              <li>Your violation of any applicable law or regulation</li>
              <li>Your infringement of any third-party rights</li>
              <li>False or malicious reports submitted through the Service</li>
              <li>Unauthorized access to or use of the Service</li>
            </ul>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              12. Dispute Resolution and Governing Law
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">12.1 Governing Law</h3>
              <p className="text-sm text-muted-foreground">
                These Terms shall be governed by and construed in accordance with applicable
                laws in your jurisdiction, without regard to its conflict of law provisions.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">12.2 Jurisdiction</h3>
              <p className="text-sm text-muted-foreground">
                Any disputes arising from these Terms or your use of the Service shall be
                subject to the jurisdiction of the competent courts in your jurisdiction.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">12.3 Alternative Dispute Resolution</h3>
              <p className="text-sm text-muted-foreground">
                Before initiating formal legal proceedings, parties agree to attempt to
                resolve disputes through good faith negotiations. If negotiations fail,
                disputes may be resolved through arbitration in accordance with applicable
                arbitration laws.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              13. Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">13.1 Termination by Us</h3>
              <p className="text-sm text-muted-foreground mb-2">
                We may terminate or suspend your access to the Service immediately, without
                prior notice or liability, for any reason, including:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Security concerns</li>
              <li>At the request of competent authorities</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">13.2 Effect of Termination</h3>
              <p className="text-sm text-muted-foreground">
                Upon termination, your right to use the Service will immediately cease.
                However, data retention provisions in our Privacy Policy will continue to apply.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              14. Regulatory Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              WhisTrust is designed to comply with applicable regulations including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>Data protection and privacy laws</li>
              <li>Cybersecurity regulations and standards</li>
              <li>E-commerce and electronic transactions laws</li>
              <li>Anti-cybercrime legislation</li>
              <li>Industry-specific compliance requirements</li>
              <li>International data transfer regulations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Severability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              15. Severability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If any provision of these Terms is held to be unenforceable or invalid under
              applicable law, such provision will be changed and interpreted to accomplish the
              objectives of such provision to the greatest extent possible, and the
              remaining provisions will continue in full force and effect.
            </p>
          </CardContent>
        </Card>

        {/* Entire Agreement */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              16. Entire Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              These Terms, together with our Privacy Policy, constitute the entire agreement
              between you and WhisTrust regarding the Service and supersede all prior
              agreements and understandings.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              17. Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify users
              of material changes by posting the updated Terms on our website with a new
              "Last Updated" date. Your continued use of the Service after changes become
              effective constitutes acceptance of the modified Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              18. Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              For questions about these Terms of Service:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Email:</strong>{" "}
                <a href="mailto:legal@whistrust.com" className="text-primary hover:underline">
                  legal@whistrust.com
                </a>
              </p>
              <p className="text-sm">
                <strong>Support:</strong>{" "}
                <a href="mailto:support@whistrust.com" className="text-primary hover:underline">
                  support@whistrust.com
                </a>
              </p>
              <p className="text-sm">
                <strong>Website:</strong> www.whistrust.com
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12 pb-8">
          <p className="mb-4">
            By using WhisTrust, you acknowledge that you have read, understood, and agree
            to be bound by these Terms of Service
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="text-primary hover:underline">
              Home
            </Link>
            <span>•</span>
            <Link href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
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

