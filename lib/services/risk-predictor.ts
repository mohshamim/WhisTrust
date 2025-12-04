import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface RiskKeyword {
  word: string;
  weight: number;
  category: string;
}

// High-risk keywords with weights
const RISK_KEYWORDS: RiskKeyword[] = [
  // Critical severity
  { word: "threat", weight: 10, category: "safety" },
  { word: "violence", weight: 10, category: "safety" },
  { word: "assault", weight: 10, category: "safety" },
  { word: "harassment", weight: 9, category: "safety" },
  { word: "discrimination", weight: 8, category: "legal" },
  { word: "fraud", weight: 9, category: "financial" },
  { word: "embezzlement", weight: 9, category: "financial" },
  { word: "retaliation", weight: 8, category: "legal" },
  { word: "suicide", weight: 10, category: "safety" },
  { word: "weapon", weight: 10, category: "safety" },
  
  // High severity
  { word: "unsafe", weight: 7, category: "safety" },
  { word: "hostile", weight: 7, category: "environment" },
  { word: "abuse", weight: 8, category: "safety" },
  { word: "illegal", weight: 8, category: "legal" },
  { word: "violation", weight: 7, category: "compliance" },
  { word: "misconduct", weight: 6, category: "conduct" },
  { word: "bribery", weight: 8, category: "financial" },
  { word: "corruption", weight: 8, category: "financial" },
  
  // Medium severity
  { word: "bullying", weight: 6, category: "environment" },
  { word: "intimidation", weight: 6, category: "environment" },
  { word: "conflict", weight: 4, category: "general" },
  { word: "concern", weight: 3, category: "general" },
  { word: "complaint", weight: 4, category: "general" },
];

interface CaseData {
  id: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  attachmentCount?: number;
  aiAnalysisSummary?: string;
  aiAnalysisRiskLevel?: string;
}

interface RiskPrediction {
  overall_score: number;
  risk_level: "critical" | "high" | "medium" | "low";
  confidence_score: number;
  
  // Score breakdown
  keyword_score: number;
  category_score: number;
  attachment_score: number;
  description_score: number;
  ai_analysis_score: number;
  
  // AI analysis
  ai_sentiment: string;
  ai_urgency_level: string;
  ai_reasoning: string;
  
  // Detected factors
  detected_keywords: string[];
  risk_factors: string[];
  
  // Recommendations
  recommended_priority: "immediate" | "urgent" | "high" | "normal" | "low";
  recommended_actions: string[];
}

/**
 * Calculate keyword-based risk score
 */
function calculateKeywordScore(text: string): { score: number; detected: string[] } {
  const lowerText = text.toLowerCase();
  const detected: string[] = [];
  let totalWeight = 0;
  
  for (const keyword of RISK_KEYWORDS) {
    if (lowerText.includes(keyword.word)) {
      detected.push(keyword.word);
      totalWeight += keyword.weight;
    }
  }
  
  // Cap at 30 points
  const score = Math.min(totalWeight, 30);
  return { score, detected };
}

/**
 * Calculate category-based risk score
 */
function calculateCategoryScore(category: string): number {
  const categoryScores: Record<string, number> = {
    "Safety Concern": 25,
    "Harassment": 25,
    "Discrimination": 23,
    "Fraud": 23,
    "Ethics Violation": 20,
    "Policy Violation": 18,
    "Conflict of Interest": 15,
    "General Concern": 10,
    "Other": 10,
  };
  
  return categoryScores[category] || 10;
}

/**
 * Calculate attachment-based risk score
 */
function calculateAttachmentScore(count: number): number {
  if (count === 0) return 5; // No evidence
  if (count === 1) return 10;
  if (count === 2) return 15;
  return 20; // 3+ attachments suggests well-documented case
}

/**
 * Calculate description length score
 */
function calculateDescriptionScore(description: string): number {
  const wordCount = description.trim().split(/\s+/).length;
  
  if (wordCount < 50) return 5; // Too brief
  if (wordCount < 150) return 10;
  if (wordCount < 300) return 13;
  return 15; // Detailed description
}

/**
 * Calculate score from existing AI analysis
 */
function calculateAIAnalysisScore(riskLevel?: string): number {
  if (!riskLevel) return 0;
  
  const scores: Record<string, number> = {
    "critical": 25,
    "high": 20,
    "medium": 13,
    "low": 5,
  };
  
  return scores[riskLevel.toLowerCase()] || 0;
}

/**
 * Use Gemini AI to analyze sentiment and urgency
 */
async function analyzeWithGemini(description: string, category: string): Promise<{
  sentiment: string;
  urgency: string;
  reasoning: string;
  riskFactors: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are an expert risk analyst for workplace incident reports. Analyze the following case and provide a structured assessment.

Case Category: ${category}
Case Description: ${description}

Provide your analysis in the following JSON format:
{
  "sentiment": "positive|negative|neutral|urgent",
  "urgency": "immediate|high|moderate|low",
  "reasoning": "Brief explanation of why this case has the given risk level",
  "riskFactors": ["factor1", "factor2", "factor3"]
}

Focus on:
1. Safety concerns (threats, violence, harm)
2. Legal implications (discrimination, harassment, violations)
3. Financial impact (fraud, theft, corruption)
4. Urgency indicators (ongoing, imminent, time-sensitive)

Be concise and specific. Output ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        sentiment: analysis.sentiment || "neutral",
        urgency: analysis.urgency || "moderate",
        reasoning: analysis.reasoning || "AI analysis completed",
        riskFactors: analysis.riskFactors || [],
      };
    }
    
    // Fallback if JSON parsing fails
    return {
      sentiment: "neutral",
      urgency: "moderate",
      reasoning: "Unable to perform detailed AI analysis",
      riskFactors: [],
    };
  } catch (error) {
    console.error("Gemini AI analysis error:", error);
    // Return neutral values on error
    return {
      sentiment: "neutral",
      urgency: "moderate",
      reasoning: "AI analysis unavailable",
      riskFactors: [],
    };
  }
}

/**
 * Determine risk level from overall score
 */
function determineRiskLevel(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Determine recommended priority
 */
function determineRecommendedPriority(
  riskLevel: string,
  urgency: string
): "immediate" | "urgent" | "high" | "normal" | "low" {
  if (riskLevel === "critical" || urgency === "immediate") return "immediate";
  if (riskLevel === "high" || urgency === "high") return "urgent";
  if (riskLevel === "medium" || urgency === "moderate") return "high";
  if (riskLevel === "low") return "normal";
  return "normal";
}

/**
 * Generate recommended actions based on risk assessment
 */
function generateRecommendedActions(
  riskLevel: string,
  urgency: string,
  riskFactors: string[]
): string[] {
  const actions: string[] = [];
  
  if (riskLevel === "critical" || urgency === "immediate") {
    actions.push("🚨 Immediate review required");
    actions.push("Notify senior management within 1 hour");
    actions.push("Consider involving legal/HR immediately");
  } else if (riskLevel === "high" || urgency === "high") {
    actions.push("⚠️ Priority investigation required");
    actions.push("Assign to senior investigator");
    actions.push("Review within 24 hours");
  } else if (riskLevel === "medium") {
    actions.push("Standard investigation protocol");
    actions.push("Review within 3-5 business days");
    actions.push("Monitor for escalation");
  } else {
    actions.push("Standard review process");
    actions.push("Assign to appropriate team member");
  }
  
  // Add specific actions based on risk factors
  if (riskFactors.some(f => f.toLowerCase().includes("safety") || f.toLowerCase().includes("threat"))) {
    actions.push("🛡️ Assess immediate safety concerns");
  }
  if (riskFactors.some(f => f.toLowerCase().includes("legal") || f.toLowerCase().includes("compliance"))) {
    actions.push("⚖️ Consult legal team");
  }
  if (riskFactors.some(f => f.toLowerCase().includes("evidence") || f.toLowerCase().includes("document"))) {
    actions.push("📄 Review all attached evidence");
  }
  
  return actions;
}

/**
 * Calculate confidence score based on available data
 */
function calculateConfidenceScore(caseData: CaseData, hasAIAnalysis: boolean): number {
  let confidence = 50; // Base confidence
  
  // More description = higher confidence
  const wordCount = caseData.description.trim().split(/\s+/).length;
  if (wordCount > 200) confidence += 15;
  else if (wordCount > 100) confidence += 10;
  else if (wordCount > 50) confidence += 5;
  
  // Attachments increase confidence
  if ((caseData.attachmentCount || 0) > 0) confidence += 10;
  if ((caseData.attachmentCount || 0) >= 3) confidence += 10;
  
  // AI analysis increases confidence
  if (hasAIAnalysis) confidence += 15;
  
  // Category specificity
  if (caseData.category && caseData.category !== "Other") confidence += 5;
  
  return Math.min(confidence, 100);
}

/**
 * Main function: Predict risk for a case
 */
export async function predictCaseRisk(caseData: CaseData): Promise<RiskPrediction> {
  // Step 1: Calculate rule-based scores
  const keywordAnalysis = calculateKeywordScore(caseData.description);
  const keyword_score = keywordAnalysis.score;
  const detected_keywords = keywordAnalysis.detected;
  
  const category_score = calculateCategoryScore(caseData.category);
  const attachment_score = calculateAttachmentScore(caseData.attachmentCount || 0);
  const description_score = calculateDescriptionScore(caseData.description);
  const ai_analysis_score = calculateAIAnalysisScore(caseData.aiAnalysisRiskLevel);
  
  // Step 2: Calculate rule-based total (max 100)
  const ruleBasedScore = keyword_score + category_score + attachment_score + description_score + ai_analysis_score;
  
  // Step 3: Get AI enhancement
  const aiAnalysis = await analyzeWithGemini(caseData.description, caseData.category);
  
  // Map AI urgency to score (0-100)
  const urgencyScores: Record<string, number> = {
    "immediate": 95,
    "high": 75,
    "moderate": 50,
    "low": 25,
  };
  const aiScore = urgencyScores[aiAnalysis.urgency] || 50;
  
  // Step 4: Combine scores (60% rule-based, 40% AI)
  const overall_score = Math.round((ruleBasedScore * 0.6) + (aiScore * 0.4));
  
  // Step 5: Determine risk level and confidence
  const risk_level = determineRiskLevel(overall_score);
  const confidence_score = calculateConfidenceScore(caseData, !!caseData.aiAnalysisRiskLevel);
  
  // Step 6: Generate recommendations
  const recommended_priority = determineRecommendedPriority(risk_level, aiAnalysis.urgency);
  const recommended_actions = generateRecommendedActions(risk_level, aiAnalysis.urgency, aiAnalysis.riskFactors);
  
  return {
    overall_score,
    risk_level,
    confidence_score,
    
    keyword_score,
    category_score,
    attachment_score,
    description_score,
    ai_analysis_score,
    
    ai_sentiment: aiAnalysis.sentiment,
    ai_urgency_level: aiAnalysis.urgency,
    ai_reasoning: aiAnalysis.reasoning,
    
    detected_keywords,
    risk_factors: aiAnalysis.riskFactors,
    
    recommended_priority,
    recommended_actions,
  };
}

/**
 * Helper: Get risk level color
 */
export function getRiskLevelColor(level: string): string {
  const colors: Record<string, string> = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    low: "text-green-600 bg-green-50 border-green-200",
  };
  return colors[level] || colors.low;
}

/**
 * Helper: Get risk level emoji
 */
export function getRiskLevelEmoji(level: string): string {
  const emojis: Record<string, string> = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🟢",
  };
  return emojis[level] || "⚪";
}

