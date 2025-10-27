# WhisTrust Quick Start Guide

Quick guide to run and test WhisTrust locally.

## 🚀 Local Development

### 1. Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get these from:**
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy the values

### 4. Run the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or next available port).

### 5. Test the Application

#### Test Public Pages

1. **Homepage**: http://localhost:3000
   - Should show the WhisTrust landing page

2. **Report Form**: http://localhost:3000/report
   - Fill out the form
   - Submit a test report
   - Copy the tracking code

3. **Success Page**: Automatically redirected after submission
   - Should display your tracking code

4. **Track Report**: http://localhost:3000/track
   - Enter your tracking code
   - Should see report details

#### Test Admin Pages

1. **Login**: http://localhost:3000/admin/login
   - Enter admin credentials
   - Should redirect to dashboard

2. **Dashboard**: http://localhost:3000/admin/dashboard
   - Should show statistics
   - Live updates badge should appear

3. **Cases**: http://localhost:3000/admin/cases
   - Should list all reports
   - Try filtering and search

4. **Analytics**: http://localhost:3000/admin/analytics
   - Should show analytics dashboard

### 6. Test Features

#### ✓ Anonymous Reporting
- [ ] Submit a report without login
- [ ] Generate tracking code
- [ ] Copy tracking code to clipboard

#### ✓ Case Tracking
- [ ] Enter tracking code
- [ ] View report details
- [ ] Send a message
- [ ] See "Live" badge when connected

#### ✓ Admin Dashboard
- [ ] Login as admin
- [ ] View dashboard statistics
- [ ] See live updates (try submitting from another tab)
- [ ] Filter cases by status
- [ ] Update case status

#### ✓ Real-time Messaging
- [ ] Open tracking page
- [ ] Open admin dashboard
- [ ] Send message from tracking page
- [ ] Message appears instantly in admin view

#### ✓ File Upload (if enabled)
- [ ] Select a file in report form
- [ ] See upload progress
- [ ] File should upload successfully

### 7. Test Security

- [ ] Try accessing `/admin/dashboard` without login (should redirect to login)
- [ ] Try submitting without required fields (should show validation)
- [ ] Verify tracking code is case-insensitive

### 8. Common Issues

#### Issue: "Missing environment variables"
**Solution**: Make sure `.env.local` exists and has correct values

#### Issue: "Port already in use"
**Solution**: Kill the process or use a different port:
```bash
# Windows
taskkill /F /IM node.exe
# Then restart
npm run dev
```

#### Issue: "Cannot connect to Supabase"
**Solution**: 
- Check internet connection
- Verify Supabase credentials
- Check Supabase project status

#### Issue: "RLS policy violation"
**Solution**: Make sure you ran the SQL schemas in Supabase

### 9. Build for Production

```bash
npm run build
npm start
```

### 10. Next Steps

After local testing passes:
1. Set up Supabase database (see `SUPABASE_SETUP.md`)
2. Deploy to Vercel (see `DEPLOYMENT.md`)
3. Test in production environment

---

## 🎯 Quick Test Checklist

Run through this checklist to verify everything works:

- [x] Development server starts without errors
- [ ] Homepage loads
- [ ] Report form displays correctly
- [ ] Can submit a report
- [ ] Receive tracking code
- [ ] Can track report with code
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Can view all cases
- [ ] Real-time updates work
- [ ] File upload works (if enabled)

---

## 📝 Notes

- The app runs in development mode by default
- Hot reload is enabled (changes reflect immediately)
- Check browser console for any errors
- Use browser DevTools to inspect network requests

## 🆘 Need Help?

- Check documentation in repository
- Review Supabase docs: [docs.supabase.com](https://docs.supabase.com)
- Review Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
