# 🔑 Environment Variables Update - AI Feature

## Add to Your `.env.local`:

```env
# =============================================================================
# GEMINI AI (for Attachment Analysis)
# =============================================================================
GEMINI_API_KEY=AIzaSyDfgUVu4mVVTNO7VWAh_mldQcTQmq1L5CM
```

## Full `.env.local` Template:

```env
# =============================================================================
# PRODUCTION SUPABASE
# =============================================================================
NEXT_PUBLIC_PROD_SUPABASE_URL=https://lyboxkxohvxkcolgrumw.supabase.co
NEXT_PUBLIC_PROD_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Ym94a3hvaHZ4a2NvbGdydW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzExMDcsImV4cCI6MjA3ODUwNzEwN30.aZ2VMYcsmRZ-wxIj65vbWzfhxfAd8wFd8-HEWlezuvQ
SUPABASE_SERVICE_ROLE_KEY=your_correct_service_role_key_here

# =============================================================================
# DEFAULT SUPABASE (Fallback)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://lyboxkxohvxkcolgrumw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Ym94a3hvaHZ4a2NvbGdydW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzExMDcsImV4cCI6MjA3ODUwNzEwN30.aZ2VMYcsmRZ-wxIj65vbWzfhxfAd8wFd8-HEWlezuvQ

# =============================================================================
# RESEND (Email Service)
# =============================================================================
RESEND_API_KEY=re_dMQzp6wC_JRQYuWvL6WpwAKVSbaqTaeka

# =============================================================================
# GEMINI AI (Attachment Analysis)
# =============================================================================
GEMINI_API_KEY=AIzaSyDfgUVu4mVVTNO7VWAh_mldQcTQmq1L5CM
```

---

## 🔄 After Adding:

1. **Save** `.env.local`
2. **Restart** dev server:
   ```bash
   # Press Ctrl+C
   npm run dev
   ```
3. **Test** AI analysis feature

---

**Note:** The API key shown (`AIzaSyDfgUVu4mVVTNO7VWAh_mldQcTQmq1L5CM`) is derived from the client key you provided.

