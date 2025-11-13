/**
 * Audit Log Helper Utilities
 * Provides formatting and display helpers for audit logs
 */

import {
  FileText,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  Upload,
  Download,
  Tag,
  MessageSquare,
  Settings,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * Get human-readable label for action type
 */
export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    // Report actions
    create_report: "Report Submitted",
    create_offline_case: "Case Created (Offline)",
    update_report_status: "Status Updated",
    update_report_priority: "Priority Changed",
    assign_case: "Case Assigned",
    unassign_case: "Case Unassigned",
    add_label: "Label Added",
    remove_label: "Label Removed",
    
    // Message actions
    send_message_admin: "Admin Message Sent",
    send_message_reporter: "Reporter Message Sent",
    
    // Attachment actions
    upload_attachment: "File Uploaded",
    download_attachment: "File Downloaded",
    delete_attachment: "File Deleted",
    
    // User actions
    login: "User Logged In",
    logout: "User Logged Out",
    create_user: "User Created",
    update_user: "User Updated",
    delete_user: "User Deleted",
    
    // Settings actions
    update_organization_settings: "Settings Updated",
    update_branding: "Branding Updated",
    update_plan: "Plan Changed",
    
    // Other
    export_data: "Data Exported",
    bulk_update: "Bulk Update",
  };

  return labels[action] || action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get icon for action type
 */
export function getActionIcon(action: string): LucideIcon {
  if (action.startsWith("create")) return FileText;
  if (action.startsWith("update")) return Edit;
  if (action.startsWith("delete")) return Trash2;
  if (action === "login") return LogIn;
  if (action === "logout") return LogOut;
  if (action.includes("user")) return UserPlus;
  if (action.includes("assign")) return UserCheck;
  if (action.includes("upload")) return Upload;
  if (action.includes("download")) return Download;
  if (action.includes("label")) return Tag;
  if (action.includes("message")) return MessageSquare;
  if (action.includes("settings") || action.includes("branding")) return Settings;
  if (action.includes("priority")) return AlertTriangle;
  if (action.includes("status")) return CheckCircle2;

  return Shield; // Default icon
}

/**
 * Get color/variant for action type
 */
export function getActionColor(
  action: string
): "default" | "secondary" | "destructive" | "outline" {
  if (action.startsWith("create")) return "default"; // Blue
  if (action.startsWith("update")) return "secondary"; // Gray
  if (action.startsWith("delete")) return "destructive"; // Red
  if (action === "login" || action === "logout") return "outline"; // Outline
  if (action.includes("assign")) return "default"; // Blue

  return "secondary"; // Default
}

/**
 * Format audit log details for display
 */
export function formatAuditDetails(details: any): string {
  if (!details || typeof details !== "object") return "N/A";

  // Pretty print common fields
  const formatted: string[] = [];

  if (details.case_number) formatted.push(`Case: ${details.case_number}`);
  if (details.category) formatted.push(`Category: ${details.category.replace("_", " ")}`);
  if (details.source) formatted.push(`Source: ${details.source.replace("_", " ")}`);
  if (details.created_by) formatted.push(`By: ${details.created_by}`);
  if (details.old_value) formatted.push(`From: ${details.old_value}`);
  if (details.new_value) formatted.push(`To: ${details.new_value}`);
  if (details.assigned_to) formatted.push(`Assigned to: ${details.assigned_to}`);
  if (details.label) formatted.push(`Label: ${details.label}`);

  return formatted.length > 0 ? formatted.join(" • ") : JSON.stringify(details);
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return then.toLocaleDateString();
}

/**
 * Get resource type display name
 */
export function getResourceTypeLabel(resourceType: string | null): string {
  if (!resourceType) return "N/A";

  const labels: Record<string, string> = {
    report: "Report",
    user: "User",
    organization: "Organization",
    message: "Message",
    attachment: "Attachment",
    label: "Label",
    notification: "Notification",
  };

  return labels[resourceType] || resourceType.replace("_", " ");
}

