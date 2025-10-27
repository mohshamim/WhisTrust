# WhisTrust Testing Guide - Step by Step

Quick guide to test all workflows in WhisTrust.

## 🎯 Prerequisites

Before you start:

1. ✅ Supabase project created (see `SUPABASE_SETUP.md`)
2. ✅ Environment variables set up (`.env.local`)
3. ✅ Development server running

## 🚀 Quick Start

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Start development server
npm run dev

# 3. Open browser to http://localhost:3000
```

---

## 📋 Complete Testing Workflow

### **Step 1: Set Up Supabase Database**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run `supabase/schema.sql` (creates tables)
5. Run `supabase/schema-rbac-audit.sql` (adds RBAC features)
6. Go to **Storage** → Create bucket named `report-attachments` (private)

### **Step 2: Create Admin User**

1. Go to **Authentication** → **Users** → **Add User**
2. Enter email (e.g., `admin@whistrust.com`)
3. Enter password (e.g., `Test123456`)
4. Click **Create User**
5. Copy the **User UUID** (you'll need this)
6. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO admin_profiles (id, full_name, role, is_active)
   VALUES ('YOUR_USER_UUID', 'Admin User', 'admin', true);
   ```

### **Step 3: Test Anonymous Reporting**

1. Open browser → `http://localhost:3000/report`
2. Fill out the form:
   - **Category**: Select any (e.g., "Fraud & Financial Misconduct")
   - **Description**: Write test description
   - **Attachment**: Optional - upload a file
   - **Contact Info**: Optional - check box and add name/email
3. Click **Submit Report**
4. **✅ Success**: You should see a success page with tracking code
5. **Copy the tracking code** (save it for next steps)

### **Step 4: Test Case Tracking**

1. Open browser → `http://localhost:3000/track`
2. **Paste the tracking code** from Step 3
3. Click **Track Report**
4. **✅ Success**: You should see:
   - Report details (category, description, status)
   - Message thread (currently empty)
   - Option to send a message

### **Step 5: Test Admin Login**

1. Open browser → `http://localhost:3000/admin/login`
2. Enter credentials:
   - **Email**: `admin@whistrust.com`
   - **Password**: `Test123456`
3. Click **Sign In**
4. **✅ Success**: You should be redirected to the dashboard

### **Step 6: Test Admin Dashboard**

1. You should see the dashboard with:
   - **Total Reports** count
   - **Open Cases** count
   - **Resolved Cases** count
   - **Live badge** (pulsing icon)
2. **Check Recent Cases** section
3. **✅ Success**: Your test report from Step 3 should appear

### **Step 7: Test Cases List**

1. Click **Cases** in the sidebar (or go to `http://localhost:3000/admin/cases`)
2. You should see a table with all reports
3. Try filtering by status
4. Click **View** on your test report
5. **✅ Success**: You should see:
   - Report details
   - Description
   - Status
   - Option to change status

### **Step 8: Test Real-time Messaging (Reporter Side)**

1. Open a **new browser tab** → `http://localhost:3000/track`
2. Enter the same tracking code from Step 3
3. Scroll to the message section
4. Type a message: "This is a test message from reporter"
5. Click **Send Message**
6. **✅ Success**: Message should appear in the thread

### **Step 9: Test Real-time Messaging (Admin Side)**

1. Go back to the admin dashboard tab
2. Open the case details for your test report
3. Scroll to the message section
4. **✅ Success**: You should see the message from Step 8 appear **live**
5. Reply with: "Thank you for reporting. We're looking into it."
6. **✅ Success**: Message should send and appear in thread

### **Step 10: Test Two-Way Communication**

1. Go back to the reporter tab (tracking page)
2. **✅ Success**: The admin's reply should appear automatically (real-time!)
3. Send another message from reporter side
4. Check the admin side
5. **✅ Success**: Both messages should sync in real-time

### **Step 11: Test Status Updates**

1. In the admin dashboard, find your test report
2. Open case details
3. Change **Status** (e.g., from "Pending" to "In Review")
4. **✅ Success**: Status should update
5. Go to reporter tracking page
6. **✅ Success**: New status should appear

### **Step 12: Test Analytics Dashboard**

1. In admin sidebar, click **Analytics** (or go to `http://localhost:3000/admin/analytics`)
2. You should see:
   - Total reports
   - Reports by status
   - Category breakdown
   - Activity timeline
3. **✅ Success**: All charts and statistics should load

---

## 🧪 Advanced Testing

### Test File Upload

1. Submit a new report with a file attachment
2. Check the upload progress bar
3. **✅ Success**: File should upload successfully
4. In admin panel, open the case
5. **✅ Success**: Attachment should be visible

### Test Multiple Users

1. Open multiple browser tabs
2. Submit multiple reports
3. Check admin dashboard
4. **✅ Success**: All reports should appear in real-time

### Test Filtering

1. In admin cases page, use search box
2. Filter by status dropdown
3. **✅ Success**: Results should filter correctly

### Test Security

1. Try accessing `/admin/dashboard` without logging in
2. **✅ Success**: Should redirect to login page
3. Try accessing someone else's tracking code
4. **✅ Success**: Should show "Report not found"

---

## ✅ Testing Checklist

Use this checklist to verify all features:

- [ ] Can submit anonymous report
- [ ] Receiving tracking code after submission
- [ ] Can track report with tracking code
- [ ] Admin login works
- [ ] Admin dashboard loads with stats
- [ ] Cases list shows all reports
- [ ] Can view case details
- [ ] Can change case status
- [ ] Live updates work (dashboard shows new reports instantly)
- [ ] Reposter can send messages
- [ ] Admin can send messages
- [ ] Real-time messaging works (no page refresh needed)
- [ ] File upload works
- [ ] Analytics dashboard loads
- [ ] Search and filter work
- [ ] Security checks work (redirects to login)

---

## 🐛 Common Issues & Solutions

### Issue: "Missing environment variables"

**Solution**: Check `.env.local` file has correct values

### Issue: "Report not found"

**Solution**: Make sure you copied the tracking code correctly

### Issue: "Cannot login"

**Solution**:

1. Check user exists in Supabase Auth
2. Check user exists in `admin_profiles` table
3. Verify password is correct

### Issue: "Real-time not working"

**Solution**:

1. Check browser console for errors
2. Verify Supabase project is running
3. Check Realtime is enabled in Supabase dashboard

### Issue: "File upload fails"

**Solution**:

1. Check storage bucket exists
2. Verify bucket is named `report-attachments`
3. Check file size (max 10MB)

---

## 📊 What to Look For

### ✅ Good Signs

- ⚡ Fast page loads (< 2 seconds)
- 🔄 Live updates work smoothly
- 📱 Responsive design on mobile
- 🔒 Redirects to login when accessing admin pages
- 💬 Messages sync instantly

### ⚠️ Warning Signs

- ❌ Pages load slowly (> 5 seconds)
- ❌ Real-time updates don't work
- ❌ Console errors in browser
- ❌ Forms don't submit
- ❌ Login redirects don't work

---

## 🎉 Success Criteria

Your WhisTrust app is working correctly if:

1. ✅ Reporters can submit anonymous reports
2. ✅ Reporters can track their reports
3. ✅ Real-time messaging works both ways
4. ✅ Admin can login and see dashboard
5. ✅ Admin can view and manage cases
6. ✅ Status updates reflect immediately
7. ✅ File uploads work
8. ✅ Analytics dashboard displays data

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Deploy to Production** (see `DEPLOYMENT.md`)
2. **Set up domain** (custom domain for your app)
3. **Configure backups** (Supabase backups)
4. **Enable monitoring** (error tracking, analytics)

---

## 📞 Need Help?

- Check `SUPABASE_SETUP.md` for database setup
- Check `REALTIME_GUIDE.md` for realtime features
- Check `RBAC_AUDIT_SETUP.md` for RBAC features
- Review Supabase documentation: [docs.supabase.com](https://docs.supabase.com)

---

**Happy Testing! 🎉**
