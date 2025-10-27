/**
 * Database Types
 * 
 * Type definitions for Supabase tables
 * These match the database schema defined in supabase/migrations/
 */

export interface Report {
  id: string;
  tracking_code: string;
  category: string;
  description: string;
  reporter_name: string | null;
  reporter_email: string | null;
  status: "pending" | "in_review" | "in_progress" | "resolved" | "closed";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  report_id: string;
  sender_type: "reporter" | "admin";
  sender_id: string | null; // admin user id if sender_type is admin
  content: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "manager" | "investigator" | "hr";
  department?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportAttachment {
  id: string;
  report_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface ReportStatistics {
  total_reports: number;
  pending_reports: number;
  in_review_reports: number;
  in_progress_reports: number;
  resolved_reports: number;
  closed_reports: number;
  reports_last_7_days: number;
  reports_last_30_days: number;
  avg_resolution_days: number | null;
}

export interface CategoryStatistics {
  category: string;
  total_count: number;
  count_last_30_days: number;
  percentage: number;
}

export interface ActivityTimeline {
  date: string;
  report_count: number;
}

// Insert types (for creating new records)
export interface NewReport {
  category: string;
  description: string;
  reporter_name?: string;
  reporter_email?: string;
}

export interface NewMessage {
  report_id: string;
  sender_type: "reporter" | "admin";
  sender_id?: string;
  content: string;
}

export interface NewAdmin {
  email: string;
  full_name?: string;
  role?: "admin" | "manager";
}

// Update types
export interface UpdateReport {
  status?: string;
  assigned_to?: string;
  description?: string;
}
