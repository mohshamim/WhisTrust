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
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Check,
  X,
  ArrowLeft,
  Star,
  Users,
  Zap,
  Crown,
  Calculator,
} from "lucide-react";
import { CustomQuoteModal } from "@/components/custom-quote-modal";

export default function ComparePlansPage() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const plans = [
    {
      name: "Essential",
      icon: Shield,
      description: "Compliance Foundation",
      badge: null,
      target: "Small/Mid-sized companies",
      price: "Custom Quote",
      features: {
        "Secure anonymous reporting": true,
        "End-to-End Encryption": true,
        "Basic attachments": true,
        "Single gatekeeper access": true,
        "Audit logs": true,
        "Standard email support": true,
        "Encrypted two-way messaging": false,
        "Delegation & workflow automation": false,
        "Multi-language support": false,
        "Mobile apps": false,
        "Priority support": false,
        "Admin training": false,
        "SSO integration": false,
        "IP control": false,
        "Advanced RBAC": false,
        "Reporting dashboards": false,
        "API & Webhooks": false,
        "Dedicated CSM": false,
        "24/7 support with SLA": false,
      },
    },
    {
      name: "Professional",
      icon: Zap,
      description: "Advanced Investigation",
      badge: "Most Popular",
      target: "Mid-to-Large organizations",
      price: "Custom Quote",
      features: {
        "Secure anonymous reporting": true,
        "End-to-End Encryption": true,
        "Basic attachments": true,
        "Single gatekeeper access": true,
        "Audit logs": true,
        "Standard email support": true,
        "Encrypted two-way messaging": true,
        "Delegation & workflow automation": true,
        "Multi-language support": true,
        "Mobile apps": true,
        "Priority support": true,
        "Admin training": true,
        "SSO integration": false,
        "IP control": false,
        "Advanced RBAC": false,
        "Reporting dashboards": false,
        "API & Webhooks": false,
        "Dedicated CSM": false,
        "24/7 support with SLA": false,
      },
    },
    {
      name: "Enterprise",
      icon: Crown,
      description: "Ultimate Security & Customization",
      badge: null,
      target: "Large international organizations",
      price: "Custom Quote",
      features: {
        "Secure anonymous reporting": true,
        "End-to-End Encryption": true,
        "Basic attachments": true,
        "Single gatekeeper access": true,
        "Audit logs": true,
        "Standard email support": true,
        "Encrypted two-way messaging": true,
        "Delegation & workflow automation": true,
        "Multi-language support": true,
        "Mobile apps": true,
        "Priority support": true,
        "Admin training": true,
        "SSO integration": true,
        "IP control": true,
        "Advanced RBAC": true,
        "Reporting dashboards": true,
        "API & Webhooks": true,
        "Dedicated CSM": true,
        "24/7 support with SLA": true,
      },
    },
  ];

  const featureCategories = [
    {
      title: "Core Features",
      features: [
        "Secure anonymous reporting",
        "End-to-End Encryption",
        "Basic attachments",
        "Single gatekeeper access",
        "Audit logs",
        "Standard email support",
      ],
    },
    {
      title: "Communication & Workflow",
      features: [
        "Encrypted two-way messaging",
        "Delegation & workflow automation",
        "Multi-language support",
        "Mobile apps",
      ],
    },
    {
      title: "Support & Training",
      features: [
        "Priority support",
        "Admin training",
        "Dedicated CSM",
        "24/7 support with SLA",
      ],
    },
    {
      title: "Enterprise Security",
      features: [
        "SSO integration",
        "IP control",
        "Advanced RBAC",
        "Reporting dashboards",
        "API & Webhooks",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">WhisTrust</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/demo">See Demo</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4">
            Plan Comparison
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose the Perfect Plan for Your Organization
          </h1>
          <p className="text-xl text-muted-foreground">
            Compare features across all plans to find the best fit for your compliance and security needs.
          </p>
        </div>

        {/* Quick Plan Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative ${
                  index === 1
                    ? "border-primary shadow-lg"
                    : "border-border"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground shadow-md">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      Custom Pricing
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {plan.target}
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    className="w-full"
                    variant={index === 1 ? "default" : "outline"}
                    onClick={() => setIsQuoteModalOpen(true)}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Get Custom Quote
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Comparison Table */}
        <Card className="max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Detailed Feature Comparison
            </CardTitle>
            <CardDescription className="text-center">
              All plans include enterprise-grade encryption and anonymous reporting by default
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold w-1/3">
                      Features
                    </th>
                    {plans.map((plan, index) => (
                      <th
                        key={plan.name}
                        className={`text-center py-4 px-4 font-semibold min-w-[200px] ${
                          index === 1 ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <plan.icon className="h-5 w-5 text-primary" />
                          <span>{plan.name}</span>
                          {plan.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureCategories.map((category, categoryIndex) => (
                    <>
                      <tr key={category.title} className="bg-muted/30">
                        <td
                          colSpan={4}
                          className="py-3 px-4 font-semibold text-primary"
                        >
                          {category.title}
                        </td>
                      </tr>
                      {category.features.map((feature, featureIndex) => (
                        <tr
                          key={feature}
                          className={`border-b border-border/50 ${
                            featureIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                          }`}
                        >
                          <td className="py-3 px-4 text-sm">{feature}</td>
                          {plans.map((plan, planIndex) => (
                            <td
                              key={`${plan.name}-${feature}`}
                              className={`text-center py-3 px-4 ${
                                planIndex === 1 ? "bg-primary/5" : ""
                              }`}
                            >
                              {plan.features[feature] ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Not sure which plan is right for you?
            </h2>
            <p className="text-muted-foreground mb-6">
              Contact our team for a personalized consultation and custom quote tailored to your organization's specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setIsQuoteModalOpen(true)}>
                <Calculator className="mr-2 h-4 w-4" />
                Get Custom Quote
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">
                  Contact Sales Team
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </section>

      {/* Custom Quote Modal */}
      <CustomQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </div>
  );
}
