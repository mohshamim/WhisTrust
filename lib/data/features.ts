import {
  Lock,
  MessageSquare,
  FileCheck,
  Eye,
  Clock,
  Globe,
  Shield,
  Users,
  BarChart3,
  Zap,
  Database,
  Bell,
  Search,
  TrendingUp,
  FileText,
  Key,
  Server,
  Smartphone,
  Workflow,
  Headphones,
  CheckCircle2,
  Upload,
  Download,
  Settings,
  UserCheck,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Tag,
  Filter,
  Archive,
  History,
  Link,
  Code,
  Languages,
  Palette,
  BellRing,
  ShieldCheck,
  FileLock,
  MessageCircle,
  Activity,
  Target,
  Award,
  Sparkles,
  Camera,
} from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: "security" | "communication" | "management" | "analytics" | "integration" | "compliance" | "ai";
  plan: "essential" | "professional" | "enterprise" | "all";
  highlighted?: boolean; // For Powerful Features section
}

export const allFeatures: Feature[] = [
  // Security & Privacy
  {
    id: "anonymous",
    title: "100% Anonymous",
    description: "Military-grade encryption ensures your identity stays protected. No IP tracking, no metadata collection.",
    icon: Lock,
    category: "security",
    plan: "all",
    highlighted: true,
  },
  {
    id: "encryption",
    title: "End-to-End Encryption",
    description: "AES-256 encryption for all messages and data. Your communications are protected at every step.",
    icon: ShieldCheck,
    category: "security",
    plan: "all",
  },
  {
    id: "metadata-cleaning",
    title: "Metadata Stripping",
    description: "Automatic removal of metadata from uploaded files to protect reporter anonymity.",
    icon: FileLock,
    category: "security",
    plan: "professional",
  },
  {
    id: "audit-trail",
    title: "Complete Audit Trail",
    description: "Comprehensive logging of all system activities for compliance and security monitoring.",
    icon: History,
    category: "security",
    plan: "all",
  },
  {
    id: "rbac",
    title: "Role-Based Access Control",
    description: "Granular permissions system with Admin, Manager, Investigator, and HR roles.",
    icon: UserCheck,
    category: "security",
    plan: "professional",
  },
  {
    id: "sso",
    title: "SSO Integration",
    description: "Single Sign-On support for enterprise authentication systems (SAML, OAuth).",
    icon: Key,
    category: "security",
    plan: "enterprise",
  },
  {
    id: "ip-control",
    title: "IP Access Control",
    description: "Restrict access to specific IP addresses or ranges for enhanced security.",
    icon: Server,
    category: "security",
    plan: "enterprise",
  },

  // Communication
  {
    id: "real-time-tracking",
    title: "Real-time Tracking",
    description: "Monitor your case status and communicate securely with compliance teams in real-time.",
    icon: MessageSquare,
    category: "communication",
    plan: "all",
    highlighted: true,
  },
  {
    id: "two-way-messaging",
    title: "Encrypted Two-Way Messaging",
    description: "Secure anonymous communication channel between reporters and compliance team.",
    icon: MessageCircle,
    category: "communication",
    plan: "professional",
  },
  {
    id: "notifications",
    title: "Real-time Notifications",
    description: "Instant alerts for new reports, updates, and case assignments via email and in-app.",
    icon: BellRing,
    category: "communication",
    plan: "professional",
  },
  {
    id: "email-support",
    title: "Email Integration",
    description: "Submit reports via email and receive automated responses with tracking codes.",
    icon: Mail,
    category: "communication",
    plan: "professional",
  },

  // Case Management
  {
    id: "professional-review",
    title: "Professional Review",
    description: "All reports reviewed by certified compliance professionals within 24 hours.",
    icon: FileCheck,
    category: "management",
    plan: "all",
    highlighted: true,
  },
  {
    id: "case-assignment",
    title: "Case Assignment & Delegation",
    description: "Assign cases to team members and automate triage processes based on rules.",
    icon: Users,
    category: "management",
    plan: "professional",
  },
  {
    id: "priority-management",
    title: "Priority Management",
    description: "Set and manage case priorities (Low, Medium, High, Urgent) with visual indicators.",
    icon: AlertTriangle,
    category: "management",
    plan: "all",
  },
  {
    id: "labels-tags",
    title: "Labels & Tags",
    description: "Organize cases with custom labels and tags for better categorization and search.",
    icon: Tag,
    category: "management",
    plan: "professional",
  },
  {
    id: "status-workflow",
    title: "Status Workflow",
    description: "Track cases through custom status workflows: New → In Progress → Resolved → Archived.",
    icon: Workflow,
    category: "management",
    plan: "professional",
  },
  {
    id: "offline-entry",
    title: "Offline Case Entry",
    description: "Manually create cases from phone calls, in-person meetings, emails, and written complaints.",
    icon: Phone,
    category: "management",
    plan: "professional",
  },
  {
    id: "file-attachments",
    title: "Secure File Attachments",
    description: "Upload supporting documents, images, and files with automatic metadata cleaning.",
    icon: Upload,
    category: "management",
    plan: "all",
  },
  {
    id: "internal-notes",
    title: "Internal Notes",
    description: "Add private notes and comments visible only to compliance team members.",
    icon: FileText,
    category: "management",
    plan: "all",
  },

  // Analytics & Reporting
  {
    id: "dashboard-analytics",
    title: "Dashboard Analytics",
    description: "Comprehensive insights and reporting for compliance managers with real-time metrics.",
    icon: Eye,
    category: "analytics",
    plan: "all",
    highlighted: true,
  },
  {
    id: "advanced-reporting",
    title: "Advanced Reporting",
    description: "Generate detailed reports with filters, date ranges, and export to PDF/CSV.",
    icon: BarChart3,
    category: "analytics",
    plan: "professional",
  },
  {
    id: "trend-analysis",
    title: "Trend Analysis",
    description: "Identify patterns and trends in reporting data with visual charts and graphs.",
    icon: TrendingUp,
    category: "analytics",
    plan: "enterprise",
  },
  {
    id: "custom-dashboards",
    title: "Custom Dashboards",
    description: "Create personalized dashboards with widgets and metrics tailored to your needs.",
    icon: Activity,
    category: "analytics",
    plan: "enterprise",
  },

  // AI Features
  {
    id: "smart-search",
    title: "AI-Powered Smart Search",
    description: "Natural language search across all cases, messages, and documents using AI.",
    icon: Search,
    category: "ai",
    plan: "enterprise",
  },
  {
    id: "risk-predictor",
    title: "Risk Prediction",
    description: "AI analyzes reports to predict risk levels and suggest priority assignments.",
    icon: Target,
    category: "ai",
    plan: "enterprise",
  },
  {
    id: "attachment-analyzer",
    title: "Attachment Analyzer",
    description: "AI-powered analysis of uploaded documents to extract key information and insights.",
    icon: FileText,
    category: "ai",
    plan: "enterprise",
  },

  // Integration & Customization
  {
    id: "custom-branding",
    title: "Custom Branding",
    description: "White-label the platform with your logo, colors, and domain name.",
    icon: Palette,
    category: "integration",
    plan: "enterprise",
  },

  // Compliance & Availability
  {
    id: "24-7-availability",
    title: "24/7 Availability",
    description: "Submit reports anytime, anywhere with our cloud-based platform. No downtime.",
    icon: Clock,
    category: "compliance",
    plan: "all",
    highlighted: true,
  },
  {
    id: "gdpr-compliance",
    title: "GDPR Compliance",
    description: "Fully compliant with GDPR, SOX, HIPAA, and other regulatory requirements.",
    icon: Shield,
    category: "compliance",
    plan: "all",
  },
  {
    id: "soc2-iso",
    title: "SOC 2 & ISO 27001",
    description: "Certified security standards for enterprise-grade data protection.",
    icon: Award,
    category: "compliance",
    plan: "enterprise",
  },
  {
    id: "data-retention",
    title: "Data Retention Policies",
    description: "Configure automatic data retention and archival policies per compliance requirements.",
    icon: Archive,
    category: "compliance",
    plan: "enterprise",
  },

  // PWA & Mobile Features (NEW - Just Implemented!)
  {
    id: "pwa-support",
    title: "Progressive Web App",
    description: "Install WhisTrust as a native app on your device. Works offline, faster loading, and app-like experience with push notifications.",
    icon: Smartphone,
    category: "integration",
    plan: "all",
    highlighted: true,
  },
  {
    id: "mobile-camera",
    title: "Mobile Camera Integration",
    description: "Capture photos directly from your device camera when submitting reports. Automatic image compression for faster uploads.",
    icon: Camera,
    category: "management",
    plan: "all",
  },
  {
    id: "mobile-optimized",
    title: "Mobile-Optimized Interface",
    description: "Touch-friendly design with larger buttons, bottom sheet selectors, and responsive layouts optimized for all mobile devices.",
    icon: Smartphone,
    category: "integration",
    plan: "all",
  },

  // User Management
  {
    id: "user-management",
    title: "User Management System",
    description: "Complete user management with role assignment, activation controls, avatar customization, and profile management.",
    icon: Users,
    category: "management",
    plan: "professional",
  },


  // Documentation
  {
    id: "documentation-system",
    title: "Documentation Management",
    description: "Create and manage organization-specific documentation for your team and reporters with rich text editing.",
    icon: FileText,
    category: "management",
    plan: "professional",
  },

  // Usage Tracking
  {
    id: "usage-tracking",
    title: "Usage Monitoring",
    description: "Real-time tracking of reports, storage, and user counts with visual indicators, progress bars, and limit warnings.",
    icon: Activity,
    category: "analytics",
    plan: "all",
  },

  // AI Usage Controls
  {
    id: "ai-usage-controls",
    title: "AI Usage Controls",
    description: "Set daily limits for AI features with usage tracking, automatic enforcement, and usage badges per organization.",
    icon: Zap,
    category: "ai",
    plan: "professional",
  },

  // Multi-Format Export
  {
    id: "multi-format-export",
    title: "Multi-Format Export",
    description: "Export reports and analytics to CSV, PDF, and Excel formats with custom filters, date ranges, and formatting options.",
    icon: Download,
    category: "analytics",
    plan: "professional",
  },
];

// Default features for Powerful Features section (can be customized)
export const defaultPowerfulFeatures = [
  "anonymous",
  "real-time-tracking",
  "professional-review",
  "dashboard-analytics",
  "24-7-availability",
  "multi-language",
];

export function getFeaturesByIds(ids: string[]): Feature[] {
  return ids
    .map((id) => allFeatures.find((f) => f.id === id))
    .filter((f): f is Feature => f !== undefined);
}

export function getFeaturesByCategory(category: Feature["category"]): Feature[] {
  return allFeatures.filter((f) => f.category === category);
}

export function getFeaturesByPlan(plan: Feature["plan"]): Feature[] {
  if (plan === "all") return allFeatures;
  return allFeatures.filter((f) => f.plan === plan || f.plan === "all");
}
