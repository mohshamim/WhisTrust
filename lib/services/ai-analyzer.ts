/**
 * AI Attachment Analyzer Service
 * Uses Google Gemini API to analyze report attachments
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface AnalysisResult {
  summary: string;
  extractedText: string;
  entities: Array<{
    type: "person" | "date" | "amount" | "location" | "organization" | "email" | "phone";
    value: string;
  }>;
  suggestedCategory: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  findings: string[];
  confidenceScore: number;
}

/**
 * Analyze attachment content using Gemini AI
 */
export async function analyzeAttachment(
  fileContent: string,
  fileName: string,
  mimeType: string
): Promise<AnalysisResult> {
  const startTime = Date.now();

  try {
    // Updated to gemini-2.5-flash which has available quota in free tier
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an AI compliance analyst for a whistleblowing platform. Analyze this document attachment.

File: ${fileName}
Type: ${mimeType}

Content:
${fileContent}

Provide a structured analysis in JSON format with these fields:

1. summary: A concise 2-3 sentence summary of the document's main content and purpose
2. extractedText: The full text extracted from the document
3. entities: Array of detected entities, each with:
   - type: "person" | "date" | "amount" | "location" | "organization" | "email" | "phone"
   - value: the actual entity value
4. suggestedCategory: One of these categories that best fits:
   - "fraud" (financial misconduct, embezzlement)
   - "harassment" (workplace harassment, discrimination)
   - "safety" (health and safety violations)
   - "ethical" (code of conduct violations, conflicts of interest)
   - "data_breach" (data privacy, security breaches)
   - "theft" (theft, misappropriation of assets)
   - "corruption" (bribery, kickbacks)
   - "conflict" (conflicts of interest)
   - "other" (if none fit)
5. riskLevel: "low" | "medium" | "high" | "critical" based on severity
6. findings: Array of 3-5 bullet points highlighting key issues or evidence
7. confidenceScore: A number between 0.00 and 1.00 indicating analysis confidence

Return ONLY valid JSON, no markdown formatting or explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleanedText);

    const processingTime = Date.now() - startTime;

    console.log(`✅ AI Analysis completed in ${processingTime}ms`);
    console.log(`   Risk Level: ${analysis.riskLevel}`);
    console.log(`   Category: ${analysis.suggestedCategory}`);
    console.log(`   Entities: ${analysis.entities?.length || 0}`);

    return {
      summary: analysis.summary || "Analysis completed",
      extractedText: analysis.extractedText || fileContent,
      entities: analysis.entities || [],
      suggestedCategory: analysis.suggestedCategory || "other",
      riskLevel: analysis.riskLevel || "medium",
      findings: analysis.findings || [],
      confidenceScore: analysis.confidenceScore || 0.7,
    };
  } catch (error) {
    console.error("AI Analysis error:", error);
    throw new Error(`Failed to analyze attachment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from different file types
 */
export async function extractTextFromFile(
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  // For PDFs and Word docs, we'll use the Gemini vision capabilities
  // For images, Gemini can directly analyze them
  
  if (mimeType.includes('image')) {
    // For images, convert to base64 and let Gemini analyze directly
    return fileBuffer.toString('base64');
  }
  
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) {
    // For documents, convert to base64 for Gemini
    return fileBuffer.toString('base64');
  }
  
  // For text files, just return the content
  if (mimeType.includes('text')) {
    return fileBuffer.toString('utf-8');
  }
  
  throw new Error(`Unsupported file type: ${mimeType}`);
}

/**
 * Analyze image/PDF using Gemini vision
 */
export async function analyzeFileWithVision(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<AnalysisResult> {
  try {
    // Updated to gemini-2.5-flash which has available quota in free tier (supports vision)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an AI compliance analyst. Analyze this document/image for a whistleblowing case.

File: ${fileName}

Extract and analyze:
1. All text content
2. Key entities (names, dates, amounts, locations, organizations)
3. Main concerns or issues
4. Suggested category (fraud, harassment, safety, ethical, data_breach, theft, corruption, conflict, other)
5. Risk level (low, medium, high, critical)
6. Key findings (3-5 bullet points)

Return a JSON object with:
{
  "summary": "2-3 sentence summary",
  "extractedText": "all text found in document",
  "entities": [{"type": "person|date|amount|location|organization|email|phone", "value": "..."}],
  "suggestedCategory": "category",
  "riskLevel": "low|medium|high|critical",
  "findings": ["finding 1", "finding 2", ...],
  "confidenceScore": 0.85
}

Return ONLY the JSON object.`;

    const imagePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleanedText);

    return {
      summary: analysis.summary || "Analysis completed",
      extractedText: analysis.extractedText || "",
      entities: analysis.entities || [],
      suggestedCategory: analysis.suggestedCategory || "other",
      riskLevel: analysis.riskLevel || "medium",
      findings: analysis.findings || [],
      confidenceScore: analysis.confidenceScore || 0.7,
    };
  } catch (error) {
    console.error("Vision analysis error:", error);
    throw new Error(`Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

