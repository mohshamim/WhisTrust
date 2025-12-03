# 🤖 AI Attachment Analyzer - Setup Guide

## 🎯 Feature Overview

WhisTrust now has **AI-powered attachment analysis** using Google Gemini API! Investigators can automatically analyze uploaded documents (PDFs, images, Word docs) to extract insights, detect entities, assess risk, and get AI-generated summaries.

---

## ✨ Features

### **AI Analysis Capabilities:**
- 📄 **Text Extraction** - Extracts all text from PDFs, images, documents
- 📊 **Automatic Summarization** - 2-3 sentence summary of content
- 🏷️ **Entity Detection** - Names, dates, amounts, locations, organizations, emails, phones
- 🎯 **Category Suggestion** - AI suggests the most appropriate category
- ⚠️ **Risk Assessment** - Assigns risk level (low, medium, high, critical)
- 🔍 **Key Findings** - 3-5 bullet points highlighting important evidence

### **Supported File Types:**
- ✅ PDF documents
- ✅ Images (JPG, PNG, GIF)
- ✅ Word documents (DOC, DOCX)
- ✅ Text files

---

## 🚀 Setup Instructions

### **Step 1: Run Database Migration**

1. Go to Supabase SQL Editor
2. Run the contents of: `supabase/CREATE_AI_ANALYSIS_TABLE.sql`
3. Verify table `report_attachments_ai_summary` is created

### **Step 2: Add Gemini API Key**

#### **For Local Development:**

Add to your `.env.local`:
```env
GEMINI_API_KEY=gen-lang-client-0973186684
```

#### **For Production (Vercel):**

1. Go to: https://vercel.com/mohshamim/whistrust/settings/environment-variables
2. Add new variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyDfgUVu4mVVTNO7VWAh_mldQcTQmq1L5CM`
   - **Environments:** Check all (Production, Preview, Development)
3. Click **Save**
4. **Redeploy** the application

### **Step 3: Restart Dev Server**

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### **Step 4: Test the Feature**

1. Go to demo reports: http://localhost:3000/org/demo/reports
2. Click on a case that has attachments
3. Below each attachment, you'll see:
   - **"Run AI Analysis"** button (if not analyzed yet)
   - **AI Analysis card** with insights (if already analyzed)

---

## 📋 Database Schema

### **Table:** `report_attachments_ai_summary`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `attachment_id` | UUID | Links to attachment (unique) |
| `organization_id` | UUID | Organization scope |
| `summary` | TEXT | AI-generated summary |
| `extracted_text` | TEXT | Full extracted text |
| `entities` | JSONB | Detected entities array |
| `suggested_category` | TEXT | AI category suggestion |
| `risk_level` | TEXT | low, medium, high, critical |
| `findings` | JSONB | Key findings array |
| `model_used` | TEXT | AI model (gemini-2.0-flash-exp) |
| `confidence_score` | NUMERIC | 0.00-1.00 |
| `processing_time_ms` | INTEGER | Analysis duration |
| `status` | TEXT | pending, processing, completed, failed |
| `analyzed_by` | UUID | Admin who requested analysis |

### **RLS Policies:**
- ✅ Admins can read summaries in their organization
- ✅ Admins can create/update summaries
- ✅ Organization-scoped (tenant isolation)

---

## 🎨 UI Components

### **1. Before Analysis:**

```
┌─────────────────────────────────┐
│ ✨ AI Analysis Available         │
│ Use AI to automatically analyze │
│ this attachment for insights    │
│                                 │
│ [✨ Run AI Analysis]            │
└─────────────────────────────────┘
```

### **2. After Analysis:**

```
┌─────────────────────────────────┐
│ ✨ AI Analysis    [🔄]          │
│ Powered by Gemini AI            │
│                                 │
│ Risk Level: 🔴 HIGH             │
│ Category: Fraud                 │
│                                 │
│ Summary:                        │
│ Document shows evidence of...   │
│                                 │
│ Key Findings:                   │
│ • Finding 1                     │
│ • Finding 2                     │
│ • Finding 3                     │
│                                 │
│ Detected Entities:              │
│ [👤 John Doe] [📅 Dec 3 2025]  │
│ [💰 $50,000] [📍 Dubai]        │
│                                 │
│ [▼ Extracted Text]              │
│                                 │
│ Confidence: 92%                 │
│ Processing Time: 1523ms         │
└─────────────────────────────────┘
```

---

## 🔐 Security Features

### **Access Control:**
- ✅ Only authenticated admins can request analysis
- ✅ Only admins in the same organization can view results
- ✅ RLS policies enforce organization isolation
- ✅ Rate limiting: 10 requests per 5 minutes per IP

### **Data Privacy:**
- ✅ File content sent to Gemini is deleted after analysis
- ✅ Analysis stored securely in Supabase
- ✅ Audit logs track who requested analysis
- ✅ Results visible only to authorized users

---

## 💻 API Endpoint

### **Route:** `/api/ai/analyze-attachment`

### **Method:** POST

### **Request Body:**
```json
{
  "attachmentId": "uuid",
  "organizationId": "uuid",
  "userId": "uuid"
}
```

### **Response (Success):**
```json
{
  "success": true,
  "analysis": {
    "id": "uuid",
    "summary": "...",
    "risk_level": "high",
    "suggested_category": "fraud",
    "entities": [...],
    "findings": [...],
    "confidence_score": 0.92
  },
  "processingTime": 1523
}
```

### **Response (Error):**
```json
{
  "error": "Failed to analyze attachment",
  "details": "..."
}
```

---

## 🧪 Testing Guide

### **Test 1: Analyze PDF Document**

1. Upload a PDF to a report
2. Open case details
3. Click **"Run AI Analysis"**
4. Wait 2-5 seconds
5. ✅ See AI insights appear

### **Test 2: Analyze Image**

1. Upload an image with text
2. Run analysis
3. ✅ AI extracts text from image
4. ✅ Detects entities in image

### **Test 3: Re-run Analysis**

1. Find attachment with existing analysis
2. Click refresh icon (🔄) in top-right of AI card
3. ✅ Analysis updates with latest AI model

### **Test 4: Multiple Attachments**

1. Upload 3+ attachments to one report
2. Each attachment gets separate AI analysis
3. ✅ Different risk levels and categories possible

---

## 📊 Example Analysis Output

### **Input:** Invoice PDF showing irregular payments

### **AI Output:**
```json
{
  "summary": "Invoice document shows multiple payments to the same vendor without proper purchase orders. Amounts are consistently below approval thresholds.",
  "extractedText": "INVOICE #12345...",
  "entities": [
    { "type": "organization", "value": "Acme Corp" },
    { "type": "amount", "value": "$49,500" },
    { "type": "date", "value": "November 15, 2024" },
    { "type": "person", "value": "John Manager" }
  ],
  "suggestedCategory": "fraud",
  "riskLevel": "high",
  "findings": [
    "Multiple invoices from same vendor without competitive bidding",
    "Amounts consistently below $50,000 approval threshold",
    "No purchase orders referenced",
    "Approver has conflict of interest (noted in description)",
    "Pattern suggests deliberate circumvention of controls"
  ],
  "confidenceScore": 0.89
}
```

---

## 🔧 Files Created

1. ✅ `supabase/CREATE_AI_ANALYSIS_TABLE.sql` - Database schema
2. ✅ `lib/services/ai-analyzer.ts` - AI analysis service
3. ✅ `app/api/ai/analyze-attachment/route.ts` - API endpoint
4. ✅ `components/ai-attachment-analysis.tsx` - UI component
5. ✅ `AI_ATTACHMENT_ANALYZER_SETUP.md` - This guide

### **Files Modified:**
- ✅ `app/org/[subdomain]/reports/page.tsx` - Integrated AI component
- ✅ `package.json` - Added @google/generative-ai dependency

---

## ⚙️ Configuration

### **Environment Variables:**

```env
# Gemini AI (Required for attachment analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://lyboxkxohvxkcolgrumw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🎯 Use Cases

### **For Investigators:**
1. **Quick Review** - Get instant summary without reading full document
2. **Entity Extraction** - Automatically identify key people, dates, amounts
3. **Risk Triage** - Prioritize high-risk attachments first
4. **Category Validation** - Verify reporter's category selection
5. **Evidence Compilation** - Key findings for case reports

### **For Managers:**
1. **Case Prioritization** - Focus on high/critical risk cases
2. **Resource Allocation** - Assign based on AI category suggestions
3. **Audit Trail** - AI analysis timestamps and confidence scores
4. **Compliance** - Systematic analysis of all submitted evidence

---

## 📈 Benefits

- ⚡ **Speed** - 2-5 seconds vs 10-30 minutes manual review
- 🎯 **Accuracy** - Gemini 2.0's advanced OCR and understanding
- 📊 **Consistency** - Same analysis criteria for all attachments
- 🔍 **Thoroughness** - Never miss key entities or patterns
- 💰 **Cost-Effective** - Gemini Flash model is fast and affordable
- 🔄 **Reusable** - Re-run analysis anytime with latest models

---

## ⚠️ Limitations

1. **File Size** - Max 10MB per file (Supabase + Gemini limits)
2. **Languages** - Best for English, supports other languages
3. **Complex PDFs** - Scanned documents work better than complex layouts
4. **Privacy** - File content sent to Google Gemini (inform users)
5. **Cost** - Gemini API usage incurs costs (track in Google Cloud Console)

---

## 🔍 Troubleshooting

### **"AI analysis is not configured"**
- Check `GEMINI_API_KEY` in environment variables
- Verify key is valid in Google AI Studio
- Restart dev server after adding key

### **Analysis fails**
- Check file is accessible in Supabase Storage
- Verify file type is supported
- Check Gemini API quotas/limits
- Review server logs for detailed error

### **No "Run AI Analysis" button**
- Verify user is authenticated
- Check user has permissions (admin/manager/investigator)
- Verify attachment exists and is linked correctly

---

## 📊 Monitoring

### **Check Analysis Results:**
```sql
-- View all AI analyses
SELECT 
  a.file_name,
  ai.risk_level,
  ai.suggested_category,
  ai.confidence_score,
  ai.processing_time_ms,
  ai.created_at
FROM report_attachments a
JOIN report_attachments_ai_summary ai ON a.id = ai.attachment_id
ORDER BY ai.created_at DESC
LIMIT 20;
```

### **Check High-Risk Attachments:**
```sql
SELECT * 
FROM report_attachments_ai_summary 
WHERE risk_level IN ('high', 'critical')
ORDER BY created_at DESC;
```

---

## 🚀 Next Steps

1. **Run database migration** (CREATE_AI_ANALYSIS_TABLE.sql)
2. **Add GEMINI_API_KEY** to .env.local
3. **Restart dev server**
4. **Test with sample attachments**
5. **(Optional) Deploy to production**

---

## ✅ Quick Start Checklist

- [ ] Database table created
- [ ] Gemini API key added to .env.local
- [ ] Dev server restarted
- [ ] Upload test attachment to report
- [ ] Click "Run AI Analysis"
- [ ] Verify AI insights appear
- [ ] Check extracted entities
- [ ] Test re-run analysis button

---

**Status:** ✅ **READY TO USE**  
**Created:** December 3, 2025  
**AI Model:** Gemini 2.0 Flash Experimental  
**Integration:** Complete

