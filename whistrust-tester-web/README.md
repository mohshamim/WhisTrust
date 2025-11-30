# WhisTrust Web-Based Testing Tool

A simple web-based testing interface that runs in your browser - no desktop app, no Rust compilation needed!

## ✅ **Why This Approach?**

- ✅ **No Rust Required** - Pure JavaScript/TypeScript
- ✅ **No Desktop App** - Runs in browser
- ✅ **Easy Setup** - Just `npm install` and `npm run dev`
- ✅ **Same Features** - Project selection, test types, environments
- ✅ **Organized Results** - Same folder structure
- ✅ **Screenshots & Errors** - Full capture support

---

## 🚀 **Quick Start**

### **Step 1: Install Dependencies**

```bash
cd whistrust-tester-web
npm install
npx playwright install chromium
```

### **Step 2: Run the Web Interface**

```bash
npm run dev
```

### **Step 3: Open in Browser**

Open `http://localhost:3000` (or the port shown)

---

## 📁 **Project Structure**

```
whistrust-tester-web/
├── app/                    # Next.js pages
│   ├── page.tsx           # Main testing interface
│   └── api/               # API routes
│       └── run-tests/     # Test execution endpoint
├── lib/                    # Utilities
│   ├── test-runner.ts     # Playwright test execution
│   └── screenshot-helper.ts
├── tests/                  # Playwright test files
├── results/                # Test results (auto-created)
└── config/                 # Configuration
    └── projects.json       # Project & test type config
```

---

## 🎯 **Features**

- ✅ Project selection dropdown
- ✅ Test type selection (E2E, UI, RBAC, All)
- ✅ Environment selection (Local, Demo, Production)
- ✅ Test file selection
- ✅ Real-time test execution
- ✅ Screenshot capture
- ✅ Error logging
- ✅ Results organization
- ✅ HTML reports

---

## 📋 **Usage**

1. Open the web interface
2. Select Project, Test Type, Environment
3. Select tests to run
4. Click "Start Testing"
5. Watch real-time progress
6. View results in organized folders

---

**Much simpler than desktop app!** 🎉

