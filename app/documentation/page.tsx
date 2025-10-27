"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  MessageSquare,
  Shield,
  BarChart3,
  History,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">WhisTrust</h1>
              <p className="text-sm text-muted-foreground">Documentation</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <FileText className="h-8 w-8 text-primary" />
              Welcome to WhisTrust Documentation
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Learn how to explore and test the WhisTrust platform step-by-step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              This documentation explains the features, workflows, and testing
              procedures for the WhisTrust anonymous whistleblowing platform.
              Use this guide to understand how the system works and how to test
              all functionality in the demo environment.
            </p>
          </CardContent>
        </Card>

        {/* Section 1: Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              What is WhisTrust?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              WhisTrust is a secure, anonymous whistleblowing platform designed
              to help organizations maintain transparency and compliance. The
              platform enables employees and other stakeholders to report
              concerns anonymously while allowing compliance teams to manage and
              investigate cases efficiently.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">For Reporters</h4>
                <p className="text-sm text-muted-foreground">
                  Submit reports anonymously, track your case status, and
                  communicate with compliance officers securely.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">For Administrators</h4>
                <p className="text-sm text-muted-foreground">
                  Manage reports, assign cases to investigators, track
                  analytics, and maintain audit logs for compliance.
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>Note:</strong> This is a demo environment for learning
                and testing purposes. Data may reset periodically. Please do not
                submit real confidential information.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Application Workflows */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Application Workflows
            </CardTitle>
            <CardDescription>
              Step-by-step guides for each main feature of WhisTrust
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workflow 1 */}
            <div className="border-l-4 border-primary pl-4">
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    1. Submit a Report
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Create an anonymous report about any concern or violation.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      Navigate to the "Submit Report" page from the homepage
                    </li>
                    <li>Select a category that best describes your concern</li>
                    <li>Provide a detailed description of the issue</li>
                    <li>
                      Optionally attach supporting documents (images, PDFs)
                    </li>
                    <li>
                      Optionally provide your contact information for follow-up
                    </li>
                    <li>Click "Submit Report"</li>
                    <li>
                      <strong className="text-foreground">
                        Save your tracking code!
                      </strong>{" "}
                      You'll need it to track your case
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <Separator />

            {/* Workflow 2 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-start gap-3">
                <Search className="h-6 w-6 text-blue-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    2. Track Your Case
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Monitor the status of your submitted report and view all
                    related communications.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Go to the "Track My Case" page</li>
                    <li>Enter your unique tracking code</li>
                    <li>
                      View your case details, current status, and message thread
                    </li>
                    <li>
                      Send additional messages or respond to admin inquiries
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <Separator />

            {/* Workflow 3 */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-6 w-6 text-green-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    3. Real-time Messaging
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Communicate securely with compliance officers about your
                    case.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Open your tracked case</li>
                    <li>Type your message in the message box at the bottom</li>
                    <li>Click "Send Message"</li>
                    <li>
                      Your message appears instantly (no page refresh needed)
                    </li>
                    <li>
                      New messages from admins appear automatically in real-time
                    </li>
                  </ol>
                  <Badge variant="outline" className="mt-3">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Updates
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Workflow 4 */}
            <div className="border-l-4 border-purple-500 pl-4">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-purple-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    4. Admin Dashboard
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Access the admin interface to manage reports and cases (Demo
                    credentials provided below).
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Navigate to "Admin Login" from the homepage</li>
                    <li>Use demo credentials to log in</li>
                    <li>
                      View the dashboard with key metrics and recent cases
                    </li>
                    <li>Browse all cases with filters and search</li>
                    <li>Click any case to view full details in a drawer</li>
                    <li>Change case status and send messages to reporters</li>
                  </ol>
                </div>
              </div>
            </div>

            <Separator />

            {/* Workflow 5 */}
            <div className="border-l-4 border-orange-500 pl-4">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-6 w-6 text-orange-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    5. Analytics & Audit Logs
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    View insights and track all system activities.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Open the Analytics page from the admin sidebar</li>
                    <li>
                      View report statistics, category breakdowns, and trends
                    </li>
                    <li>Export data to CSV for reporting</li>
                    <li>
                      Visit Audit Logs to see all system actions with timestamps
                    </li>
                    <li>Filter logs by date, user, or action type</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Test Scenarios */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Testing Checklist
            </CardTitle>
            <CardDescription>
              Follow these steps to verify all features are working correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Step</TableHead>
                    <TableHead>What to Do</TableHead>
                    <TableHead>Expected Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">1</TableCell>
                    <TableCell>
                      Submit a new report with category and description
                    </TableCell>
                    <TableCell>
                      Success message appears with unique tracking code
                      displayed prominently
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">2</TableCell>
                    <TableCell>
                      Track the case using the provided tracking code
                    </TableCell>
                    <TableCell>
                      Case details load showing status, description, category,
                      and message thread
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">3</TableCell>
                    <TableCell>
                      Send a test message from the reporter view
                    </TableCell>
                    <TableCell>
                      Message appears instantly in the thread without page
                      refresh, "Live" badge shows connection status
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">4</TableCell>
                    <TableCell>Admin replies via admin dashboard</TableCell>
                    <TableCell>
                      Reply appears instantly in reporter's view, real-time sync
                      works both ways
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">5</TableCell>
                    <TableCell>
                      Admin changes case status (pending → in progress →
                      resolved)
                    </TableCell>
                    <TableCell>
                      Status badge updates immediately, changes reflected in
                      dashboard and audit logs
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">6</TableCell>
                    <TableCell>Check Analytics dashboard</TableCell>
                    <TableCell>
                      Metrics update with new report data, category breakdown
                      shows distribution, CSV export works
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">7</TableCell>
                    <TableCell>View Audit Logs page</TableCell>
                    <TableCell>
                      All recent actions (status changes, messages, logins)
                      appear with timestamps, filters work correctly
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
            <CardDescription>
              For detailed guides, testing instructions, and technical
              documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">Visitor Testing Guide</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Step-by-step guide for end-users to test reporting and
                  tracking workflows.
                </p>
                <Badge variant="secondary">New</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">Setup Guides</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Quick Start, Supabase Setup, RBAC & Audit, and Deployment
                  guides available in project files.
                </p>
                <Badge variant="secondary">Technical</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  Implementation Reports
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Comprehensive reports on features, architecture, and Phase 3
                  implementation status.
                </p>
                <Badge variant="secondary">Documentation</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  Verification Documents
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Testing checklists, verification results, and status reports
                  for all workflows.
                </p>
                <Badge variant="secondary">Testing</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              All detailed documentation files are available in the project
              repository under root directory.
            </p>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Demo Credentials</CardTitle>
            <CardDescription>
              Use these credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg font-mono text-sm">
              <p>
                <strong>Email:</strong> admin@whistrust.com
              </p>
              <p className="mt-2">
                <strong>Password:</strong> Admin@123
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Note: These are demo credentials for testing purposes only. The
              actual production system will have proper authentication and
              role-based access control.
            </p>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Ready to Explore?</h3>
              <p className="text-muted-foreground">
                Start testing WhisTrust by submitting your first report or
                logging into the admin dashboard.
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Link href="/report">
                  <Button size="lg">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit a Report
                  </Button>
                </Link>
                <Link href="/track">
                  <Button size="lg" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Track a Case
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button size="lg" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home Button */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="ghost" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16 bg-background">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>WhisTrust Documentation - Demo Environment</p>
          <p className="mt-2">
            For questions or feedback, please contact the development team.
          </p>
        </div>
      </footer>
    </div>
  );
}
