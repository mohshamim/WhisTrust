// Role-Based Access Control (RBAC) Utilities

export type UserRole = 'admin' | 'manager' | 'investigator' | 'hr';

export interface Permission {
  canEditStatus: boolean;
  canEditPriority: boolean;
  canAssignCases: boolean;
  canDeleteReports: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canManageSettings: boolean;
  canAddLabels: boolean;
  canSendMessages: boolean;
  canViewAnalytics: boolean;
}

/**
 * Get permissions for a given role
 */
export function getPermissions(role: UserRole): Permission {
  switch (role) {
    case 'admin':
      // Admin has all permissions
      return {
        canEditStatus: true,
        canEditPriority: true,
        canAssignCases: true,
        canDeleteReports: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canManageSettings: true,
        canAddLabels: true,
        canSendMessages: true,
        canViewAnalytics: true,
      };

    case 'manager':
      // Manager can do most things except user/settings management
      return {
        canEditStatus: true,
        canEditPriority: true,
        canAssignCases: true,
        canDeleteReports: false,
        canManageUsers: false,
        canViewAuditLogs: true,
        canManageSettings: false,
        canAddLabels: true,
        canSendMessages: true,
        canViewAnalytics: true,
      };

    case 'investigator':
      // Investigator can update cases but not manage org
      return {
        canEditStatus: true,
        canEditPriority: false,   // PO: cannot manage priority
        canAssignCases: false,    // PO: cannot assign/reassign
        canDeleteReports: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canManageSettings: false,
        canAddLabels: false,      // PO: cannot manage labels
        canSendMessages: true,
        canViewAnalytics: false,
      };

    case 'hr':
      // HR can view and update but limited control
      return {
        canEditStatus: true,
        canEditPriority: false,
        canAssignCases: false,
        canDeleteReports: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canManageSettings: false,
        canAddLabels: true,
        canSendMessages: true,
        canViewAnalytics: false,
      };

    default:
      // Default: minimal permissions
      return {
        canEditStatus: false,
        canEditPriority: false,
        canAssignCases: false,
        canDeleteReports: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canManageSettings: false,
        canAddLabels: false,
        canSendMessages: true,
        canViewAnalytics: false,
      };
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  const permissions = getPermissions(role);
  return permissions[permission];
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    investigator: 'Investigator',
    hr: 'HR Specialist',
  };
  return roleNames[role] || role;
}

