"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Shield, MessageSquare, FileText, Users, Lock, BarChart3, Bell, Upload, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            WhisTrust
          </Link>
          <Link 
            href="/demo" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Back to Demo →
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">WhisTrust Documentation</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete guide to using WhisTrust - your secure digital whistleblowing system
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Introduction to WhisTrust
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong>WhisTrust</strong> is a secure, confidential digital whistleblowing system designed for organizations 
              to receive and manage anonymous reports of misconduct, fraud, safety concerns, and policy violations.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Purpose</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable confidential reporting, secure communication, and transparent case resolution
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Security First</h4>
                  <p className="text-sm text-muted-foreground">
                    End-to-end encryption, metadata cleaning, and compliance-ready data handling
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">For Reporters (Anonymous Users)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  <span>Visit the <Link href="/report" className="text-primary hover:underline">Report Portal</Link></span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  <span>Fill in report details (category, description, optional contact info)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  <span>Upload any supporting files securely</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">4</Badge>
                  <span>Receive a unique tracking code to monitor your case</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">For Admin Users</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  <span>Visit the <Link href="/admin/login" className="text-primary hover:underline">Admin Portal</Link></span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  <span>Login with your credentials (e.g., admin@whistrust.com)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  <span>Access Dashboard, Cases, Analytics, and Audit Logs</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Workflows */}
        <div className="space-y-8 mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">System Workflows</h2>

          {/* Workflow 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Workflow 1: Anonymous Report Submission
              </CardTitle>
              <CardDescription>
                Submit a confidential report without revealing your identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Allows users to submit reports of misconduct, fraud, or policy violations securely and anonymously. 
                  Each submission receives a unique tracking code for follow-up.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Step-by-Step Instructions</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Navigate to the Report Portal</li>
                  <li>Select report category (fraud, harassment, safety, etc.)</li>
                  <li>Enter detailed description of the incident</li>
                  <li>Optionally provide name and email (not required for anonymity)</li>
                  <li>Attach supporting documents or evidence (optional)</li>
                  <li>Click "Submit Report"</li>
                  <li>Save your unique tracking code for case monitoring</li>
                </ol>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Submit a test report with all fields filled</li>
                  <li>Verify tracking code is generated (e.g., "ABC1234")</li>
                  <li>Check report appears in admin dashboard</li>
                  <li>Confirm file uploads are successful</li>
                  <li>Test with anonymous submission (no name/email)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Workflow 2: Case Tracking & Two-Way Messaging
              </CardTitle>
              <CardDescription>
                Communicate securely with administrators about your case
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Enables encrypted two-way communication between reporters and administrators. Messages are 
                  encrypted before storage and decrypted on display to ensure maximum privacy.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Step-by-Step Instructions</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Enter your tracking code on the Track Your Case page</li>
                  <li>View case status and timeline</li>
                  <li>Review previous messages from administrators</li>
                  <li>Type your response in the message box</li>
                  <li>Send message (encrypted automatically)</li>
                  <li>Receive real-time notifications of new messages</li>
                </ol>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Track a case using valid tracking code</li>
                  <li>Send a test message from reporter view</li>
                  <li>Verify message appears in admin panel</li>
                  <li>Send reply from admin and confirm it appears to reporter</li>
                  <li>Check encryption/decryption works correctly</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Workflow 3: Admin Dashboard & Case Management
              </CardTitle>
              <CardDescription>
                Manage and resolve cases with comprehensive admin tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Provides administrators with a complete case management interface including case assignment, 
                  status updates, priority management, custom labels, and file access.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Case Overview:</strong> View all reports with filtering and search</li>
                  <li><strong>Case Details:</strong> Side drawer with full case information, messages, and attachments</li>
                  <li><strong>Assignment:</strong> Assign cases to specific administrators or investigators</li>
                  <li><strong>Status Management:</strong> Update case status (Pending → In Review → In Progress → Resolved)</li>
                  <li><strong>Priority & Labels:</strong> Set priority levels (Low/Medium/High) and add custom labels</li>
                  <li><strong>Two-Way Messaging:</strong> Communicate with reporters securely</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Open a case and review all details</li>
                  <li>Assign case to another admin user</li>
                  <li>Update case status and priority</li>
                  <li>Add custom labels to case</li>
                  <li>Filter cases by status, priority, or label</li>
                  <li>Send message to reporter from case details</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-500" />
                Workflow 4: File Upload Security & Privacy
              </CardTitle>
              <CardDescription>
                Secure file handling with metadata cleaning and encryption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Ensures all uploaded files are stored securely with metadata stripped to prevent identity exposure. 
                  Files are accessible only to authorized administrators via signed URLs.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Security Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Automatic metadata cleaning (removes EXIF, author info, timestamps)</li>
                  <li>Secure storage in Supabase with access control</li>
                  <li>Signed URLs for temporary file access</li>
                  <li>File type validation and size limits</li>
                  <li>Admin-only download permissions</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Upload file during report submission</li>
                  <li>Verify file appears in admin case details</li>
                  <li>Download file from admin panel</li>
                  <li>Check file metadata is cleaned</li>
                  <li>Test with different file types (PDF, images, docs)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 5 - Offline Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-500" />
                Workflow 5: Offline / Proxy Case Entry
              </CardTitle>
              <CardDescription>
                Allow administrators to submit cases on behalf of reporters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Enables authorized administrators to submit reports on behalf of individuals who cannot 
                  access the system directly. Source marked as "proxy" or "offline".
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Admin creates case via offline entry form</li>
                  <li>Verify source is marked as "proxy" or "offline"</li>
                  <li>Confirm case appears in system with special badge</li>
                  <li>Test case management flows work normally</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 6 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                Workflow 6: Audit Logs & Notifications
              </CardTitle>
              <CardDescription>
                Track all system activities and receive real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive audit trail of all system actions (report creation, status changes, assignments, messages) 
                  and real-time notification system for admins.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Audit Log Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Track all user actions with timestamps</li>
                  <li>Filter by action type, resource, user, and date range</li>
                  <li>View detailed metadata for each action</li>
                  <li>Export logs for compliance reporting</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Notification Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Real-time bell notifications for new reports</li>
                  <li>Notifications for case assignments and message replies</li>
                  <li>Badge showing unread count</li>
                  <li>Mark notifications as read</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Submit a new report and check audit log entry</li>
                  <li>Assign a case and verify notification appears</li>
                  <li>Check notification bell updates in real-time</li>
                  <li>Filter audit logs by date and action type</li>
                  <li>Mark notifications as read and verify badge count</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 7 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                Workflow 7: Encryption & Security Layers
              </CardTitle>
              <CardDescription>
                Multi-layer security to protect sensitive data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Implements multiple security layers including client-side message encryption, metadata cleaning, 
                  role-based access control, and secure authentication.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Security Layers</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Message Encryption:</strong> AES encryption for all messages</li>
                  <li><strong>File Metadata Cleaning:</strong> Automatic removal of identifying information</li>
                  <li><strong>Row-Level Security (RLS):</strong> Database-level access control</li>
                  <li><strong>Role-Based Access:</strong> Admin, Manager, Investigator roles with different permissions</li>
                  <li><strong>Secure Authentication:</strong> Supabase Auth with session management</li>
                  <li><strong>HTTPS Only:</strong> All connections encrypted in transit</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 8 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-indigo-500" />
                Workflow 8: Priority & Label Management
              </CardTitle>
              <CardDescription>
                Organize and filter cases with custom labels and priorities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Allows administrators to set case priorities (Low/Medium/High) and add custom labels 
                  for better organization and filtering.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Set priority levels with color-coded badges</li>
                  <li>Add multiple custom labels per case</li>
                  <li>Filter cases by priority in the table</li>
                  <li>Visual indicators for quick case assessment</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>Add labels to a case (e.g., "Finance", "Urgent")</li>
                  <li>Change case priority from dropdown</li>
                  <li>Verify priority badge displays correctly</li>
                  <li>Filter cases by priority level</li>
                  <li>Confirm filters work together (status + priority)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow 9 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-500" />
                Workflow 9: Reports & Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive insights into case volumes and trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What This Does</h4>
                <p className="text-sm text-muted-foreground">
                  Provides administrators with key metrics, category breakdowns, trend analysis, 
                  and exportable reports for compliance and management purposes.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Analytics Features</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Total reports count and status breakdown</li>
                  <li>Average resolution time tracking</li>
                  <li>Category distribution with percentages</li>
                  <li>Trend analysis over time</li>
                  <li>CSV export functionality</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testing Checklist
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-900 dark:text-green-100">
                  <li>View analytics dashboard with real data</li>
                  <li>Verify metrics match actual report counts</li>
                  <li>Check category breakdown is accurate</li>
                  <li>Export analytics data to CSV</li>
                  <li>Verify CSV contains all expected data</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testing Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Test User Roles</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Reporter</h4>
                  <p className="text-xs text-muted-foreground">
                    No login required. Use tracking codes to access cases.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Admin</h4>
                  <p className="text-xs text-muted-foreground">
                    Full access. Login: admin@whistrust.com
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Compliance Officer</h4>
                  <p className="text-xs text-muted-foreground">
                    Manager role with case management access.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Sample Test Data</h3>
              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <p className="mb-2"><strong>Sample Tracking Code:</strong> ABC1234</p>
                <p className="mb-2"><strong>Test Categories:</strong> Fraud, Harassment, Safety, Ethical Violations</p>
                <p className="mb-2"><strong>Test File Types:</strong> PDF, JPG, PNG, DOCX (max 10MB each)</p>
                <p><strong>Admin Login:</strong> admin@whistrust.com / Admin@123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Data Handling */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security & Data Handling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All messages are encrypted using AES encryption before storage. Files are encrypted in transit and at rest.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Metadata Cleaning</h4>
                <p className="text-sm text-muted-foreground">
                  Automatic removal of EXIF data, author information, and timestamps from uploaded files to prevent identity exposure.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Access Control</h4>
                <p className="text-sm text-muted-foreground">
                  Role-based permissions with database-level security. Only authorized admins can access specific cases.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Data Storage</h4>
                <p className="text-sm text-muted-foreground">
                  Secure cloud storage with signed URLs for temporary file access. Full audit trail maintained for compliance.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance Ready
              </h4>
              <p className="text-sm text-blue-900 dark:text-blue-100">
                WhisTrust is designed to meet data localization requirements and compliance standards. 
                All data handling follows security best practices and can be hosted in compliant jurisdictions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              FAQ & Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Why can't I see my messages?</h4>
                <p className="text-sm text-muted-foreground">
                  Make sure you're using the correct tracking code. Messages may take a moment to sync. 
                  Try refreshing the page or checking your tracking code.
                </p>
              </div>
              
              <Separator />

              <div>
                <h4 className="font-semibold mb-1">File upload failed. What should I do?</h4>
                <p className="text-sm text-muted-foreground">
                  Check file size (max 10MB per file), file type is supported (PDF, images, docs), 
                  and your internet connection is stable. Try uploading one file at a time.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-1">I forgot my tracking code. Can I get it back?</h4>
                <p className="text-sm text-muted-foreground">
                  If you provided an email during submission, you should have received the tracking code. 
                  For security, we cannot retrieve tracking codes without authentication.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-1">How secure is my data?</h4>
                <p className="text-sm text-muted-foreground">
                  All data is encrypted in transit (HTTPS) and at rest. Messages use client-side encryption, 
                  and files have metadata removed. Only authorized admins can access case data.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Need More Help?</h4>
              <p className="text-sm text-muted-foreground">
                For additional support, please contact your organization's compliance team or system administrator. 
                Technical issues can be reported through your organization's IT support channels.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12 pb-8">
          <p>WhisTrust Documentation v1.0 | Last Updated: {new Date().toLocaleDateString()}</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/demo" className="text-primary hover:underline">
              Try Demo
            </Link>
            <span>•</span>
            <Link href="/" className="text-primary hover:underline">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
