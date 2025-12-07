import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { checkAIUsageLimit, incrementAIUsage } from "@/lib/services/ai-limits";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        { success: false, error: "AI service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const { query, subdomain } = await request.json();
    
    // Check AI usage limit BEFORE processing (only for demo)
    if (subdomain) {
      const usageCheck = await checkAIUsageLimit(subdomain, 'smart_search');
      
      if (!usageCheck.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: usageCheck.message || "AI usage limit reached",
            usage: {
              used: usageCheck.used,
              limit: usageCheck.limit,
              remaining: usageCheck.remaining,
              resetAt: usageCheck.resetAt
            }
          },
          { status: 429 }
        );
      }
    }
    
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    console.log("Processing smart search query:", query);
    // Using gemini-2.5-flash which has available quota in free tier
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Get current date for relative date calculations
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    const prompt = `You are a query parser for a whistleblower case management system.
Convert the natural language query into structured filters.

Available fields:
- category: "Harassment", "Discrimination", "Fraud", "Safety Concern", "Policy Violation", "Ethics Violation", "Conflict of Interest", "General Concern", "Other"
- status: "pending", "under_review", "resolved", "closed"
- risk_level: "critical", "high", "medium", "low"
- date_from: ISO date string (YYYY-MM-DD)
- date_to: ISO date string (YYYY-MM-DD)
- priority: "immediate", "urgent", "high", "normal", "low"
- search_text: keywords to search in title/description

Current date context:
- Today: ${today.toISOString().split('T')[0]}
- Current year: ${currentYear}
- Current month: ${currentMonth}

User query: "${query}"

Instructions:
1. Parse the query and extract relevant filters
2. For date ranges like "last month", "Q4", "this year", calculate actual dates
3. Return ONLY valid JSON (no markdown, no explanation)

Output format:
{
  "category": "string or null",
  "status": "string or null",
  "risk_level": "string or null",
  "date_from": "YYYY-MM-DD or null",
  "date_to": "YYYY-MM-DD or null",
  "priority": "string or null",
  "search_text": "string or null"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const filters = JSON.parse(jsonMatch[0]);
      
      // Validate and clean filters
      const cleanedFilters = {
        category: filters.category || null,
        status: filters.status || null,
        risk_level: filters.risk_level || null,
        date_from: filters.date_from || null,
        date_to: filters.date_to || null,
        priority: filters.priority || null,
        search_text: filters.search_text || null,
      };
      
      // Increment usage AFTER successful API call (only for demo)
      if (subdomain) {
        await incrementAIUsage(subdomain, 'smart_search');
      }

      return NextResponse.json({ 
        success: true, 
        filters: cleanedFilters,
        original_query: query 
      });
    }
    
    return NextResponse.json(
      { success: false, error: "Could not parse query. Please try rephrasing." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Smart search error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
    });
    
    // Check for quota/rate limit errors
    const errorMessage = error?.message || "";
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "API quota exceeded. Please check your Gemini API key quota or try again later. If you're using a free tier key, you may need to wait a few minutes or upgrade your plan.",
          quotaError: true
        },
        { status: 429 }
      );
    }
    
    // Check for API key errors
    if (errorMessage.includes("API_KEY") || errorMessage.includes("authentication") || errorMessage.includes("401")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid API key. Please check your GEMINI_API_KEY configuration."
        },
        { status: 401 }
      );
    }
    
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage || "Search failed. Please try again.",
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

