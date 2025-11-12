# 📊 Sample Organizations Guide

## 🎯 Overview

This SQL script creates 5 diverse sample organizations for testing all features of the Super Admin Portal.

---

## 📦 **ORGANIZATIONS INCLUDED**

### **1. TechFlow Innovations** 🚀
```
Plan: Essential
Status: Trial (14 days remaining)
Subdomain: techflow.whistrust.app
Contact: Sarah Johnson (sarah.johnson@techflow.io)

Details:
- Startup company
- 5 max users
- 50 reports/month
- 1GB storage
- Basic features only
- Interested in upgrading to Professional
```

**Use for testing:** Trial period features, upgrade paths

---

### **2. GlobalCorp Industries** 🏢
```
Plan: Enterprise
Status: Active
Subdomain: globalcorp.whistrust.app
Contact: Michael Chen (compliance@globalcorp.com)

Details:
- Large corporation
- 100 max users
- 1,000 reports/month
- 25GB storage
- ALL features enabled (SSO, API, Custom Branding, etc.)
- VIP client - Annual contract
- Active for 3 months
```

**Use for testing:** Enterprise features, all capabilities

---

### **3. HealthTech Solutions** 🏥
```
Plan: Professional
Status: Active
Subdomain: healthtech.whistrust.app
Contact: Dr. Aisha Rahman (compliance.officer@healthtech.com)

Details:
- Healthcare industry
- 15 max users
- 200 reports/month
- 5GB storage
- Custom categories: Patient Safety, HIPAA, Billing Fraud, etc.
- HIPAA-compliant requirements
- Professional features enabled
```

**Use for testing:** Custom categories, industry-specific needs

---

### **4. RetailMax Group** 🛒
```
Plan: Professional
Status: Trial (7 days remaining)
Subdomain: retailmax.whistrust.app
Contact: James Peterson (hr.director@retailmax.com)

Details:
- Retail chain (50+ locations)
- 15 max users
- 200 reports/month
- 5GB storage
- Custom categories: Harassment, Theft, Safety, etc.
- Hot lead for Professional plan
- Evaluating before rollout
```

**Use for testing:** Trial expiration, conversion scenarios

---

### **5. FinanceFirst Corp** 🏦
```
Plan: Enterprise
Status: Suspended ⚠️
Subdomain: financefirst.whistrust.app
Contact: Robert Williams (risk@financefirst.com)

Details:
- Financial services
- 100 max users
- 1,000 reports/month
- 25GB storage
- All enterprise features
- PAYMENT ISSUE - Suspended
- Active for 6 months before suspension
```

**Use for testing:** Suspension/reactivation, payment issues

---

## 🎯 **TESTING SCENARIOS**

### **Scenario 1: Trial Conversions**
- TechFlow (14 days left) - Will they upgrade?
- RetailMax (7 days left) - Urgent conversion!

### **Scenario 2: Enterprise Management**
- GlobalCorp - VIP client, all features
- FinanceFirst - Suspended, needs reactivation

### **Scenario 3: Industry-Specific**
- HealthTech - HIPAA compliance, custom categories
- RetailMax - Multi-location rollout

### **Scenario 4: Plan Tiers**
- Essential: TechFlow (basic)
- Professional: HealthTech, RetailMax (mid-tier)
- Enterprise: GlobalCorp, FinanceFirst (full features)

### **Scenario 5: Status Management**
- Active: GlobalCorp, HealthTech
- Trial: TechFlow, RetailMax
- Suspended: FinanceFirst

---

## 📊 **DASHBOARD STATS AFTER IMPORT**

```
Total Organizations: 7 (5 new + 2 existing)
Active: 2
Trial: 4
Suspended: 1
Cancelled: 0

By Plan:
- Essential: 1
- Professional: 4
- Enterprise: 2
```

---

## 🧪 **HOW TO USE**

### **Step 1: Run SQL**
1. Open Production Supabase → SQL Editor
2. Copy all contents of `sample_organizations.sql`
3. Paste and click "Run"
4. Wait for success message

**Expected Output:**
```
✅ Sample organizations created successfully!
📦 5 organizations added
🎯 Total: 5 diverse sample organizations
```

---

### **Step 2: Refresh Dashboard**
1. Go to: `http://localhost:3000/superadmin/dashboard`
2. Refresh page (F5)
3. **You should see:**
   - Total Organizations: 7
   - Active: 2
   - Trial: 4

---

### **Step 3: Explore Organizations**
1. Click "View Organizations"
2. **You should see all 7 organizations:**
   - Acme Corporation (your manual test)
   - Test Company Inc (your manual test)
   - TechFlow Innovations (Essential, Trial)
   - GlobalCorp Industries (Enterprise, Active)
   - HealthTech Solutions (Professional, Active)
   - RetailMax Group (Professional, Trial)
   - FinanceFirst Corp (Enterprise, Suspended)

---

### **Step 4: Test Features**

**Test Edit:**
- Click "Edit" on GlobalCorp
- Change plan or status
- Save changes
- Verify update works

**Test Suspend/Activate:**
- View HealthTech details
- Click "⏸️ Suspend"
- Confirm dialog
- Verify status changes to "Suspended"
- Click "✅ Activate" to reactivate

**Test Search:**
- Go to Organizations list
- Search "health"
- Should filter to HealthTech only
- Search "trial"
- Should show TechFlow and RetailMax

**Test Details:**
- Click "View Details" on any organization
- Verify all information displays correctly
- Check usage bars
- Check enabled features
- Check action buttons

---

## 🎨 **DATA HIGHLIGHTS**

### **Realistic Details:**
- ✅ Industry-appropriate names
- ✅ Realistic contact emails
- ✅ Varied plans (Essential, Professional, Enterprise)
- ✅ Different statuses (Trial, Active, Suspended)
- ✅ Custom categories per industry
- ✅ Internal notes with context
- ✅ Trial end dates set
- ✅ Subscription periods defined
- ✅ Features enabled per plan

### **Diversity:**
- 🏢 Tech startup
- 🌐 Large corporation
- 🏥 Healthcare
- 🛒 Retail
- 🏦 Financial services

---

## 🔍 **VERIFICATION QUERIES**

### **Check All Organizations:**
```sql
SELECT 
    name,
    subdomain,
    plan,
    status,
    primary_contact_email,
    max_admin_users,
    created_at
FROM organizations
ORDER BY plan, status, name;
```

---

### **Check by Plan:**
```sql
-- Essential tier
SELECT name, status FROM organizations WHERE plan = 'essential';

-- Professional tier  
SELECT name, status FROM organizations WHERE plan = 'professional';

-- Enterprise tier
SELECT name, status FROM organizations WHERE plan = 'enterprise';
```

---

### **Check by Status:**
```sql
-- Active organizations
SELECT name, plan FROM organizations WHERE status = 'active';

-- Trial organizations (with days remaining)
SELECT 
    name,
    plan,
    EXTRACT(DAY FROM (trial_ends_at - NOW())) as days_remaining
FROM organizations 
WHERE status = 'trial'
ORDER BY trial_ends_at;

-- Suspended organizations
SELECT name, plan, internal_notes FROM organizations WHERE status = 'suspended';
```

---

### **Check Features:**
```sql
-- Organizations with SSO enabled
SELECT name, plan 
FROM organizations 
WHERE features->>'sso' = 'true';

-- Organizations with custom branding
SELECT name, plan, branding->>'primary_color' as color
FROM organizations 
WHERE features->>'custom_branding' = 'true';
```

---

### **Check Custom Categories:**
```sql
-- Organizations with custom categories
SELECT 
    name,
    custom_categories
FROM organizations 
WHERE custom_categories IS NOT NULL 
AND custom_categories != '[]'::jsonb;
```

---

## 🎯 **AFTER RUNNING SQL**

Your Super Admin Portal will have:
- ✅ Realistic test data
- ✅ All plan tiers represented
- ✅ Different statuses to test
- ✅ Trial expiration scenarios
- ✅ Suspended organization to reactivate
- ✅ Enterprise client with all features
- ✅ Industry-specific examples

---

## 💡 **TIPS**

### **For Demo/Presentation:**
- Use GlobalCorp to show enterprise features
- Use HealthTech to show custom categories
- Use TechFlow to show trial period
- Use FinanceFirst to show suspension/reactivation

### **For Testing:**
- Test suspension on HealthTech (active → suspended)
- Test activation on FinanceFirst (suspended → active)
- Test plan changes on TechFlow (Essential → Professional)
- Test editing on any organization

---

## 🚀 **READY TO USE**

**Just run the SQL and refresh your dashboard!**

You'll have a fully populated Super Admin portal with realistic, diverse data! 💪

---

**Bismillah - Sample data ready for comprehensive testing!** 🌟

