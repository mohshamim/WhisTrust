"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ArrowRight,
  Copy,
  Check,
  User,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DemoPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const demoCredentials = {
    email: "admin@whistrust.com",
    password: "Admin@123",
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">WhisTrust</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Interactive Demo</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Try WhisTrust
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience our platform from both perspectives - as a reporter or as
            a compliance manager
          </p>
        </div>

        {/* Demo Options */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Reporter Demo */}
          <Card className="border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl">Test as Reporter</CardTitle>
                <CardDescription className="text-base">
                  Experience the anonymous reporting process
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Submit an anonymous report</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Upload supporting documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Get a tracking code</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Track your case status</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full h-12">
                <Link href="/report">
                  Start Report Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Compliance Manager Demo */}
          <Card className="border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl">Test as Manager</CardTitle>
                <CardDescription className="text-base">
                  Access the compliance dashboard
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>View dashboard analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Manage reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Assign cases</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Track resolution times</span>
                </div>
              </div>

              {/* Demo Credentials */}
              <Alert className="border-primary/20 bg-primary/5">
                <Lock className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <strong>Demo Credentials:</strong> Use these credentials to
                  access the admin dashboard
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs mb-2 block">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      value={demoCredentials.email}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(demoCredentials.email, "email")
                      }
                    >
                      {copied === "email" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Password</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={demoCredentials.password}
                        readOnly
                        className="font-mono text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(demoCredentials.password, "password")
                      }
                    >
                      {copied === "password" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${demoCredentials.email}\n${demoCredentials.password}`
                    );
                    setCopied("both");
                    setTimeout(() => setCopied(null), 2000);
                  }}
                >
                  {copied === "both" ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy All
                    </>
                  )}
                </Button>
                <Button asChild size="lg" className="flex-1 h-12">
                  <Link href="/admin/login">
                    Login to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="max-w-2xl mx-auto mt-16">
          <Card className="bg-muted/30 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold">Demo Environment</h3>
                  <p className="text-sm text-muted-foreground">
                    This is a demo environment with sample data. All information
                    is fictional and used for demonstration purposes only. Your
                    data is not stored or shared.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
