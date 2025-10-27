# WhisTrust UI Testing Guide - Simple & Easy

Quick guide to test the user interface and workflows in your browser.

## 🎯 Before You Start

**Make sure the app is running:**

1. Open your terminal/command prompt
2. Type: `npm run dev`
3. Wait for: "✓ Ready" message
4. Open browser to: **http://localhost:3000**

---

## 🧪 Test Each Feature (One by One)

### **1. Test Anonymous Report Submission** ⏱️ 2 minutes

**What to do:**

1. Click **"Submit Report"** on homepage (or go to `/report`)
2. Fill in:
   - Category: Choose any (e.g., "Harassment")
   - Description: Type test text like "This is a test report"
3. Click **"Submit Report"** button

**✅ What you should see:**

- Success page appears
- A tracking code is shown (e.g., "ABC1234")
- Copy this code! You'll need it for the next test

---

### **2. Test Case Tracking** ⏱️ 1 minute

**What to do:**

1. Open new tab → Go to `/track`
2. Paste your tracking code
3. Click **"Track Report"**

**✅ What you should see:**

- Your report details
- Current status (probably "Pending")
- Message box at the bottom

---

### **3. Test Admin Login** ⏱️ 1 minute

**What to do:**

1. Go to `/admin/login`
2. Enter:
   - Email: `admin@whistrust.com` (or your admin email)
   - Password: Your password
3. Click **"Sign In"**

**✅ What you should see:**

- Dashboard appears
- You see statistics (total reports, etc.)

---

### **4. Test Viewing Cases** ⏱️ 1 minute

**What to do:**

1. On the dashboard, click **"Cases"** in the sidebar
2. You should see a table with reports

**✅ What you should see:**

- Your test report from step 1 appears in the list
- Columns show: Tracking Code, Category, Status, Date

---

### **5. Test Real-time Messaging** ⏱️ 3 minutes

**Setup:**

- Open **2 browser tabs** side by side
- Tab 1: Track page with your tracking code
- Tab 2: Admin dashboard → Open your test report

**What to do:**

1. In **Tab 1** (Tracking page):
   - Type: "Hello, this is a test message"
   - Click **"Send"**
2. Check **Tab 2** (Admin):
   - **✅ Your message should appear instantly!**
   - Reply with: "Thank you for reporting"
3. Check **Tab 1** again:
   - **✅ Admin's reply should appear instantly!**

---

### **6. Test Status Update** ⏱️ 1 minute

**What to do:**

1. In Admin dashboard, open your test report
2. Change status from "Pending" to "In Review"
3. Click **"Update"**
4. Go back to tracking page (Tab 1)

**✅ What you should see:**

- Status changed to "In Review" on the tracking page

---

### **7. Test File Upload** ⏱️ 2 minutes

**What to do:**

1. Go to `/report` again
2. Fill form as before
3. **Click "Choose File"** and select any small file (image, PDF, etc.)
4. Submit the report

**✅ What you should see:**

- File upload progress bar
- Upload completes
- Success page appears

---

## ✅ Quick Checklist

Use this to make sure everything works:

- [ ] Can submit a report without logging in
- [ ] Get a tracking code after submission
- [ ] Can track report with the code
- [ ] Admin can login
- [ ] Admin dashboard shows statistics
- [ ] Cases list shows all reports
- [ ] Messages send and receive in real-time
- [ ] Status updates work
- [ ] File upload works

---

## 🎥 Visual Guide (What Each Screen Looks Like)

### Homepage (`/`)

- Hero section with "Submit Report" button
- Features section
- Footer

### Report Form (`/report`)

- Category dropdown
- Description textarea
- File upload button
- Optional contact info
- Submit button

### Success Page (`/success`)

- Big checkmark icon
- Tracking code displayed
- "Track Your Report" button

### Track Page (`/track`)

- Input box for tracking code
- Report details card
- Message thread
- Send message box

### Admin Login (`/admin/login`)

- Email input
- Password input
- Sign in button

### Admin Dashboard (`/admin/dashboard`)

- Statistics cards (Total Reports, Open Cases, etc.)
- Recent cases list
- Sidebar navigation

### Cases Page (`/admin/cases`)

- Table with all reports
- Filter dropdown
- Search box
- View button for each report

---

## 💡 Pro Tips

1. **Keep tracking codes** - Write them down to test multiple times
2. **Use two tabs** - Best way to test real-time messaging
3. **Check browser console** - Press F12 to see any errors
4. **Try different browsers** - Test on Chrome, Firefox, Edge

---

## ❌ Common Problems & Quick Fixes

| Problem              | Fix                               |
| -------------------- | --------------------------------- |
| Page won't load      | Check if `npm run dev` is running |
| Can't login          | Check email/password is correct   |
| Messages not syncing | Check both tabs are open          |
| File won't upload    | Try smaller file (< 10MB)         |

---

## 🎉 Success!

If all tests pass, your UI is working perfectly!

**Next step:** Deploy to production (see `DEPLOYMENT.md`)

---

**Need help?** Check the main `TESTING_GUIDE.md` for detailed troubleshooting.
