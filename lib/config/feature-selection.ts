/**
 * Feature Selection Configuration
 * 
 * Customize which features appear in the "Powerful Features" section on the homepage.
 * Simply update the array below with feature IDs from lib/data/features.ts
 * 
 * Available feature IDs:
 * - anonymous
 * - encryption
 * - metadata-cleaning
 * - audit-trail
 * - rbac
 * - sso
 * - ip-control
 * - real-time-tracking
 * - two-way-messaging
 * - notifications
 * - email-support
 * - professional-review
 * - case-assignment
 * - priority-management
 * - labels-tags
 * - status-workflow
 * - offline-entry
 * - file-attachments
 * - internal-notes
 * - dashboard-analytics
 * - advanced-reporting
 * - trend-analysis
 * - custom-dashboards
 * - smart-search
 * - risk-predictor
 * - attachment-analyzer
 * - api-webhooks
 * - custom-branding
 * - mobile-apps
 * - multi-language
 * - 24-7-availability
 * - gdpr-compliance
 * - soc2-iso
 * - data-retention
 * - pwa-support (NEW)
 * - mobile-camera (NEW)
 * - mobile-optimized (NEW)
 * - user-management (NEW)
 * - advanced-branding (NEW)
 * - documentation-system (NEW)
 * - usage-tracking (NEW)
 * - ai-usage-controls (NEW)
 * - multi-format-export (NEW)
 */

// Select up to 6 features to display in the Powerful Features section
// The order matters - features will be displayed in this order
// 
// RECOMMENDED: Balanced approach - Shows core value, new PWA feature, communication, business value, and reliability
export const selectedPowerfulFeatures = [
  "anonymous",              // 100% Anonymous - Core value proposition
  "pwa-support",          // Progressive Web App - NEW! Modern, convenient
  "real-time-tracking",   // Real-time Tracking - Communication
  "professional-review",  // Professional Review - Quality assurance
  "dashboard-analytics",  // Dashboard Analytics - Business value
  "24-7-availability",    // 24/7 Availability - Reliability
];

// Alternative selections you can use:

// Security-focused selection:
// export const selectedPowerfulFeatures = [
//   "anonymous",
//   "encryption",
//   "audit-trail",
//   "rbac",
//   "gdpr-compliance",
//   "soc2-iso",
// ];

// Communication-focused selection:
// export const selectedPowerfulFeatures = [
//   "real-time-tracking",
//   "two-way-messaging",
//   "notifications",
//   "email-support",
//   "mobile-apps",
//   "multi-language",
// ];

// Management-focused selection:
// export const selectedPowerfulFeatures = [
//   "professional-review",
//   "case-assignment",
//   "priority-management",
//   "status-workflow",
//   "labels-tags",
//   "offline-entry",
// ];

// Enterprise-focused selection:
// export const selectedPowerfulFeatures = [
//   "smart-search",
//   "risk-predictor",
//   "api-webhooks",
//   "custom-branding",
//   "soc2-iso",
//   "custom-dashboards",
// ];
