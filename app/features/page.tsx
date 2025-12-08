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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Sparkles, Grid3x3, List, X, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  allFeatures,
  getFeaturesByCategory,
  type Feature,
} from "@/lib/data/features";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryLabels: Record<Feature["category"], string> = {
  security: "Security & Privacy",
  communication: "Communication",
  management: "Case Management",
  analytics: "Analytics & Reporting",
  integration: "Integration & Customization",
  compliance: "Compliance & Availability",
  ai: "AI-Powered Features",
};

const planLabels: Record<Feature["plan"], string> = {
  all: "All Plans",
  essential: "Essential",
  professional: "Professional",
  enterprise: "Enterprise",
};

const planColors: Record<Feature["plan"], string> = {
  all: "bg-green-500/10 text-green-700 border-green-500/20",
  essential: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  professional: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  enterprise: "bg-amber-500/10 text-amber-700 border-amber-500/20",
};

export default function FeaturesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    Feature["category"] | "all"
  >("all");
  const [selectedPlan, setSelectedPlan] = useState<Feature["plan"] | "all">(
    "all"
  );
  const [viewMode, setViewMode] = useState<"grid" | "grouped">("grid");

  const filteredFeatures = useMemo(() => {
    let features = allFeatures;

    // Filter by search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      features = features.filter(
        (f) =>
          f.title.toLowerCase().includes(searchLower) ||
          f.description.toLowerCase().includes(searchLower) ||
          f.category.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      features = features.filter((f) => f.category === selectedCategory);
    }

    // Filter by plan
    if (selectedPlan !== "all") {
      features = features.filter(
        (f) => f.plan === selectedPlan || f.plan === "all"
      );
    }

    return features;
  }, [searchTerm, selectedCategory, selectedPlan]);

  const categories = Object.keys(categoryLabels) as Feature["category"][];
  
  // Group features by category for grouped view
  const groupedFeatures = useMemo(() => {
    const grouped: Partial<Record<Feature["category"], Feature[]>> = {};
    filteredFeatures.forEach((feature) => {
      if (!grouped[feature.category]) {
        grouped[feature.category] = [];
      }
      grouped[feature.category]!.push(feature);
    });
    return grouped;
  }, [filteredFeatures]);
  
  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: allFeatures.length,
      filtered: filteredFeatures.length,
      byCategory: categories.reduce((acc, cat) => {
        acc[cat] = allFeatures.filter(f => f.category === cat).length;
        return acc;
      }, {} as Record<Feature["category"], number>),
    };
  }, [filteredFeatures.length]);
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedPlan("all");
  };
  
  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedPlan !== "all";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">WhisTrust</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            All Features
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover everything WhisTrust has to offer for secure, anonymous
            reporting. {stats.total} powerful features across {categories.length} categories.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-6 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Filter Features</CardTitle>
                  <CardDescription>
                    Search and filter to find exactly what you need
                  </CardDescription>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className="relative"
                  >
                    All Categories
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {allFeatures.length}
                    </Badge>
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className="relative"
                    >
                      {categoryLabels[cat]}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {stats.byCategory[cat]}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Plan Filter */}
              <div>
                <label className="text-sm font-medium mb-3 block">Plan</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedPlan === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPlan("all")}
                  >
                    All Plans
                  </Button>
                  {(["essential", "professional", "enterprise"] as const).map(
                    (plan) => (
                      <Button
                        key={plan}
                        variant={selectedPlan === plan ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        {planLabels[plan]}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count & View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing <strong className="text-foreground">{filteredFeatures.length}</strong> of{" "}
              <strong className="text-foreground">{allFeatures.length}</strong> features
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">View:</span>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "grouped" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grouped")}
              >
                <List className="h-4 w-4 mr-2" />
                Grouped
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid or Grouped */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {filteredFeatures.length === 0 ? (
            <Card className="text-center py-16 border-2 border-dashed">
              <CardContent>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No features found</h3>
                <p className="text-muted-foreground mb-6">
                  No features found matching your criteria. Try adjusting your
                  filters.
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group relative overflow-hidden"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all group-hover:scale-110 duration-300">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                        <Badge
                          variant="outline"
                          className={planColors[feature.plan]}
                        >
                          {planLabels[feature.plan]}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[feature.category]}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedFeatures).map(([category, features]) => {
                const categoryKey = category as Feature["category"];
                return (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-1 bg-primary rounded-full" />
                      <div>
                        <h2 className="text-2xl font-bold">{categoryLabels[categoryKey]}</h2>
                        <p className="text-sm text-muted-foreground">
                          {features?.length} {features?.length === 1 ? 'feature' : 'features'}
                        </p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {features?.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <Card
                            key={feature.id}
                            className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group relative overflow-hidden"
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between mb-4">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all group-hover:scale-110 duration-300">
                                  <Icon className="h-7 w-7 text-primary" />
                                </div>
                                <Badge
                                  variant="outline"
                                  className={planColors[feature.plan]}
                                >
                                  {planLabels[feature.plan]}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {feature.title}
                              </CardTitle>
                              <CardDescription className="text-base leading-relaxed">
                                {feature.description}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-xl">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Experience all {stats.total} features with a free demo or start your
                30-day trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/demo">See Demo</Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/#pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
