"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  User,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

interface AIAnalysis {
  id: string;
  summary: string;
  extracted_text: string | null;
  entities: Array<{
    type: string;
    value: string;
  }>;
  suggested_category: string;
  risk_level: string;
  findings: string[];
  confidence_score: number;
  model_used: string;
  processing_time_ms: number;
  status: string;
  created_at: string;
}

interface AIAttachmentAnalysisProps {
  attachmentId: string;
  organizationId: string;
  userId: string;
  fileName: string;
  existingAnalysis?: AIAnalysis | null;
  onAnalysisComplete?: (analysis: AIAnalysis) => void;
}

export function AIAttachmentAnalysis({
  attachmentId,
  organizationId,
  userId,
  fileName,
  existingAnalysis,
  onAnalysisComplete,
}: AIAttachmentAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(existingAnalysis || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-attachment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attachmentId,
          organizationId,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.analysis);
      toast.success("AI analysis completed!");
      onAnalysisComplete?.(data.analysis);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze attachment");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "person":
        return <User className="h-3 w-3" />;
      case "date":
        return <Calendar className="h-3 w-3" />;
      case "amount":
        return <DollarSign className="h-3 w-3" />;
      case "location":
        return <MapPin className="h-3 w-3" />;
      case "organization":
        return <Building2 className="h-3 w-3" />;
      case "email":
        return <Mail className="h-3 w-3" />;
      case "phone":
        return <Phone className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (!analysis) {
    return (
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Analysis Available
          </CardTitle>
          <CardDescription>
            Use AI to automatically analyze this attachment for key insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Analysis
            </CardTitle>
            <CardDescription className="mt-1">
              Powered by Gemini AI • {analysis.model_used}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
              title="Re-run AI Analysis"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="sm"
              className="gap-2 flex-shrink-0"
            >
              <span className="text-xs">
                {isExpanded 
                  ? "Collapse" 
                  : "Click to view the AI analysis of attached document"}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Risk Level and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Risk Level
              </p>
              <Badge className={`${getRiskLevelColor(analysis.risk_level)} border flex items-center gap-1 w-fit`}>
                {getRiskIcon(analysis.risk_level)}
                <span className="capitalize">{analysis.risk_level}</span>
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Suggested Category
              </p>
              <Badge variant="outline" className="capitalize w-fit">
                {analysis.suggested_category.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Summary</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Key Findings */}
          {analysis.findings && analysis.findings.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Key Findings</p>
              <ul className="space-y-1.5">
                {analysis.findings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Entities */}
          {analysis.entities && analysis.entities.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Detected Entities</p>
              <div className="flex flex-wrap gap-2">
                {analysis.entities.map((entity, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    {getEntityIcon(entity.type)}
                    <span className="capitalize">{entity.type}:</span>
                    <span className="font-semibold">{entity.value}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Text (Collapsible) */}
          {analysis.extracted_text && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="w-full justify-between h-auto p-2 hover:bg-muted/50"
              >
                <span className="text-sm font-semibold">Extracted Text</span>
                {showExtractedText ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {showExtractedText && (
                <div className="p-3 bg-muted/50 rounded-lg border text-xs font-mono max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-words">
                    {analysis.extracted_text}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="pt-3 border-t text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Confidence Score:</span>
              <span className="font-semibold">
                {(analysis.confidence_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Processing Time:</span>
              <span className="font-semibold">{analysis.processing_time_ms}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Analyzed:</span>
              <span className="font-semibold">
                {new Date(analysis.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

