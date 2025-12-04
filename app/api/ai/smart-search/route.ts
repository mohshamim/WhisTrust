import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
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
  } catch (error) {
    console.error("Smart search error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}

