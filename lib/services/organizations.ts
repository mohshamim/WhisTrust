/**
 * Organizations Service
 * 
 * Handles all CRUD operations for organizations (tenants)
 * Super Admin only
 */

import { createMultiTenantServerClient } from "@/lib/supabase/multi-tenant-server";
import { createMultiTenantClient } from "@/lib/supabase/multi-tenant-client";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  primary_contact_email: string;
  primary_contact_name: string | null;
  billing_email: string | null;
  plan: 'essential' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  trial_ends_at: string | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  max_admin_users: number;
  max_reports_per_month: number;
  max_storage_mb: number;
  current_admin_users: number;
  current_reports_count: number;
  current_storage_mb: number;
  features: Record<string, boolean>;
  branding: Record<string, any>;
  custom_categories: any[];
  settings: Record<string, any>;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateOrganizationInput {
  name: string;
  subdomain: string;
  primary_contact_email: string;
  primary_contact_name?: string;
  billing_email?: string;
  plan: 'essential' | 'professional' | 'enterprise';
  status?: 'active' | 'trial';
  max_admin_users?: number;
  max_reports_per_month?: number;
  max_storage_mb?: number;
  internal_notes?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  primary_contact_email?: string;
  primary_contact_name?: string;
  billing_email?: string;
  plan?: 'essential' | 'professional' | 'enterprise';
  status?: 'active' | 'suspended' | 'trial' | 'cancelled';
  max_admin_users?: number;
  max_reports_per_month?: number;
  max_storage_mb?: number;
  features?: Record<string, boolean>;
  branding?: Record<string, any>;
  settings?: Record<string, any>;
  internal_notes?: string;
}

/**
 * Get all organizations (Super Admin only)
 */
export async function getAllOrganizations() {
  try {
    const supabase = await createMultiTenantServerClient();
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Organization[] };
  } catch (error: any) {
    console.error('Get organizations error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string) {
  try {
    const supabase = await createMultiTenantServerClient();
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Organization };
  } catch (error: any) {
    console.error('Get organization error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get organization by subdomain
 */
export async function getOrganizationBySubdomain(subdomain: string) {
  try {
    const supabase = await createMultiTenantServerClient();
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', subdomain)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Organization };
  } catch (error: any) {
    console.error('Get organization by subdomain error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create new organization
 */
export async function createOrganization(input: CreateOrganizationInput) {
  try {
    const supabase = await createMultiTenantServerClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Generate slug from name
    const slug = input.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Set defaults based on plan
    const planDefaults = {
      essential: { max_admin_users: 5, max_reports_per_month: 50, max_storage_mb: 1000 },
      professional: { max_admin_users: 15, max_reports_per_month: 200, max_storage_mb: 5000 },
      enterprise: { max_admin_users: 100, max_reports_per_month: 1000, max_storage_mb: 25000 },
    };

    const defaults = planDefaults[input.plan];

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: input.name,
        slug,
        subdomain: input.subdomain,
        primary_contact_email: input.primary_contact_email,
        primary_contact_name: input.primary_contact_name,
        billing_email: input.billing_email,
        plan: input.plan,
        status: input.status || 'trial',
        max_admin_users: input.max_admin_users || defaults.max_admin_users,
        max_reports_per_month: input.max_reports_per_month || defaults.max_reports_per_month,
        max_storage_mb: input.max_storage_mb || defaults.max_storage_mb,
        internal_notes: input.internal_notes,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: data.id,
      user_id: user.id,
      user_email: user.email,
      action: 'organization_created',
      resource_type: 'organization',
      resource_id: data.id,
      new_values: data,
    });

    return { success: true, data: data as Organization };
  } catch (error: any) {
    console.error('Create organization error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update organization
 */
export async function updateOrganization(id: string, input: UpdateOrganizationInput) {
  try {
    const supabase = await createMultiTenantServerClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get old values for audit log
    const { data: oldData } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('organizations')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: id,
      user_id: user.id,
      user_email: user.email,
      action: 'organization_updated',
      resource_type: 'organization',
      resource_id: id,
      old_values: oldData,
      new_values: data,
    });

    return { success: true, data: data as Organization };
  } catch (error: any) {
    console.error('Update organization error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete organization (soft delete by changing status)
 */
export async function deleteOrganization(id: string) {
  try {
    const supabase = await createMultiTenantServerClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Soft delete by setting status to cancelled
    const { data, error } = await supabase
      .from('organizations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: id,
      user_id: user.id,
      user_email: user.email,
      action: 'organization_deleted',
      resource_type: 'organization',
      resource_id: id,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Delete organization error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats() {
  try {
    const supabase = await createMultiTenantServerClient();
    
    // Get total organizations
    const { count: totalOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });

    // Get active organizations
    const { count: activeOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get trial organizations
    const { count: trialOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'trial');

    // Get total users across all organizations
    const { count: totalUsers } = await supabase
      .from('admin_profiles')
      .select('*', { count: 'exact', head: true })
      .not('organization_id', 'is', null);

    // Get total reports
    const { count: totalReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    return {
      success: true,
      data: {
        totalOrganizations: totalOrgs || 0,
        activeOrganizations: activeOrgs || 0,
        trialOrganizations: trialOrgs || 0,
        totalUsers: totalUsers || 0,
        totalReports: totalReports || 0,
      },
    };
  } catch (error: any) {
    console.error('Get organization stats error:', error);
    return { success: false, error: error.message };
  }
}

