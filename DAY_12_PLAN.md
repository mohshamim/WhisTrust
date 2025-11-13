# 📊 Day 12: Analytics Dashboard - Implementation Plan

**Date:** November 13, 2025  
**Feature:** Comprehensive analytics and reporting dashboard  
**Status:** Starting Implementation  

---

## 🎯 **OBJECTIVES**

Create a powerful analytics dashboard for tenant admins to:
- Visualize report trends and patterns
- Monitor team performance
- Track key metrics
- Make data-driven decisions
- Export analytics data

---

## 📋 **FEATURES TO IMPLEMENT**

### **1. Overview Metrics (Top Cards)**
- Total Reports (all time)
- Reports This Month
- Avg Response Time (hours)
- Resolution Rate (%)
- Reports by Priority (Critical/High count)

### **2. Visual Charts**

#### **Chart 1: Reports by Status** (Pie/Donut Chart)
- Submitted
- Under Review
- Investigating
- Resolved
- Closed
- Dismissed

#### **Chart 2: Reports by Category** (Bar Chart)
- Fraud
- Harassment
- Safety
- Corruption
- Data Breach
- Theft
- Ethical

#### **Chart 3: Reports Trend** (Line Chart)
- Last 30 days
- Daily submissions
- 7-day moving average

#### **Chart 4: Reports by Priority** (Donut Chart)
- Critical
- High
- Medium
- Low

### **3. Filters**
- Date Range (Last 7/30/90 days, Custom)
- Category filter
- Status filter
- Priority filter

### **4. Data Tables**
- Top Categories (with counts)
- Response Time by Category
- Most Active Days
- Closure Rate by Category

### **5. Export Options**
- Download as CSV
- Download as PDF
- Export charts as PNG

---

## 🗄️ **DATABASE QUERIES NEEDED**

```sql
-- 1. Total counts by status
SELECT status, COUNT(*) as count
FROM reports
WHERE organization_id = $1
GROUP BY status;

-- 2. Counts by category
SELECT category, COUNT(*) as count
FROM reports
WHERE organization_id = $1
GROUP BY category
ORDER BY count DESC;

-- 3. Daily trend (last 30 days)
SELECT DATE(created_at) as date, COUNT(*) as count
FROM reports
WHERE organization_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- 4. Avg resolution time
SELECT 
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours
FROM reports
WHERE organization_id = $1
  AND status IN ('resolved', 'closed');

-- 5. Reports by priority
SELECT priority, COUNT(*) as count
FROM reports
WHERE organization_id = $1
GROUP BY priority;
```

---

## 🎨 **UI COMPONENTS**

### **Page Structure:**
```
/org/[subdomain]/analytics
├── Header (Title + Date Range Filter)
├── Metrics Cards Row (4-5 cards)
├── Charts Grid (2x2 layout)
│   ├── Status Pie Chart
│   ├── Category Bar Chart
│   ├── Trend Line Chart
│   └── Priority Donut Chart
├── Data Tables Section
│   ├── Top Categories Table
│   └── Performance Metrics Table
└── Export Buttons
```

### **Shadcn UI Components to Use:**
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Select` for filters
- `Button` for export
- `Table` for data tables
- `Chart` components (already have from previous work)
- `Badge` for status/category labels
- `Separator` for sections

---

## 📁 **FILES TO CREATE/MODIFY**

### **1. Analytics Page:**
```
app/org/[subdomain]/analytics/page.tsx
```

### **2. Analytics Service:**
```
lib/services/analytics.ts
```
- `getAnalyticsSummary(organizationId, dateRange)`
- `getReportsByStatus(organizationId, dateRange)`
- `getReportsByCategory(organizationId, dateRange)`
- `getReportsTrend(organizationId, days)`
- `getReportsByPriority(organizationId, dateRange)`
- `exportAnalyticsCSV(organizationId, dateRange)`

### **3. Chart Components** (if needed)
- Use existing chart components from `components/ui/chart.tsx`
- May need custom chart wrappers for specific data

---

## 🔄 **IMPLEMENTATION STEPS**

### **Step 1: Create Analytics Service** (15 min)
- Database queries
- Data aggregation
- Date range filtering

### **Step 2: Build Analytics Page** (30 min)
- Layout structure
- Metrics cards
- Chart placeholders

### **Step 3: Implement Charts** (30 min)
- Status pie chart
- Category bar chart
- Trend line chart
- Priority donut chart

### **Step 4: Add Filters** (15 min)
- Date range selector
- Category/Status/Priority filters
- Apply filters to all charts

### **Step 5: Add Export** (15 min)
- CSV export
- PDF export (optional)
- Chart image export (optional)

### **Step 6: Test** (15 min)
- Load test data
- Verify charts render
- Test filters
- Test exports

**Total Estimated Time:** 2 hours

---

## 🎯 **SUCCESS CRITERIA**

- ✅ Page loads without errors
- ✅ All metrics display correctly
- ✅ 4 charts render with data
- ✅ Filters work on all visualizations
- ✅ CSV export downloads
- ✅ Responsive design (mobile-friendly)
- ✅ Loading states for data fetching
- ✅ Empty states for no data

---

## 🚀 **READY TO START!**

Beginning with Step 1: Analytics Service...

---

*Starting Day 12 Implementation - November 13, 2025*

