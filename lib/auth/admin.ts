/**
 * Admin Authentication & Authorization Module
 *
 * SECURITY FEATURES:
 * - OWASP A01:2021 - Broken Access Control mitigation
 * - OWASP A07:2021 - Identification and Authentication Failures mitigation
 * - Role-based access control (RBAC)
 * - Account lockout after failed attempts
 * - Audit logging for all admin actions
 *
 * This module provides secure admin authentication helpers for:
 * - Verifying admin role and permissions
 * - Checking admin status and account locks
 * - Logging admin actions for security audits
 */

import { createServiceRoleClient } from '@/lib/supabase/server';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Admin levels define permission hierarchy
 */
export enum AdminLevel {
  VIEWER = 'viewer', // Read-only access
  MODERATOR = 'moderator', // Can approve/reject actions
  SUPER_ADMIN = 'super_admin', // Full access including admin management
}

/**
 * Admin user interface
 */
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  adminLevel: AdminLevel;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
}

/**
 * Admin verification result
 */
export interface AdminVerificationResult {
  isAdmin: boolean;
  isActive: boolean;
  isLocked: boolean;
  adminUser?: AdminUser;
  error?: string;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  adminId: string;
  adminEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Verifies if a user is an admin with active status
 *
 * SECURITY:
 * - Checks user_metadata.role === 'admin'
 * - Verifies admin_users table entry exists
 * - Checks is_active flag
 * - Validates account is not locked
 *
 * @param token - JWT token from request
 * @returns Admin verification result
 */
export async function verifyAdminUser(
  token: string
): Promise<AdminVerificationResult> {
  try {
    const supabase = createServiceRoleClient();

    // Verify JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return {
        isAdmin: false,
        isActive: false,
        isLocked: false,
        error: 'Invalid authentication token',
      };
    }

    // Check if user has admin role in metadata
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return {
        isAdmin: false,
        isActive: false,
        isLocked: false,
        error: 'User does not have admin privileges',
      };
    }

    // Get admin user details from admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (adminError || !adminData) {
      return {
        isAdmin: true, // Has role but no admin_users entry
        isActive: false,
        isLocked: false,
        error: 'Admin account not properly configured',
      };
    }

    // Check if account is locked
    const isLocked = adminData.locked_until
      ? new Date(adminData.locked_until) > new Date()
      : false;

    if (isLocked) {
      return {
        isAdmin: true,
        isActive: adminData.is_active,
        isLocked: true,
        error: 'Account is temporarily locked due to failed login attempts',
      };
    }

    // Check if account is active
    if (!adminData.is_active) {
      return {
        isAdmin: true,
        isActive: false,
        isLocked: false,
        error: 'Admin account is deactivated',
      };
    }

    // Build admin user object
    const adminUser: AdminUser = {
      id: user.id,
      email: user.email!,
      role: 'admin',
      adminLevel: adminData.admin_level as AdminLevel,
      permissions: adminData.permissions || [],
      isActive: adminData.is_active,
      lastLoginAt: adminData.last_login_at,
    };

    return {
      isAdmin: true,
      isActive: true,
      isLocked: false,
      adminUser,
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return {
      isAdmin: false,
      isActive: false,
      isLocked: false,
      error: 'Failed to verify admin status',
    };
  }
}

/**
 * Checks if an admin has a specific permission level
 *
 * Permission hierarchy:
 * - super_admin: Has all permissions
 * - moderator: Can approve/reject but not manage admins
 * - viewer: Read-only access
 *
 * @param adminUser - Admin user object
 * @param requiredLevel - Required admin level
 * @returns true if admin has sufficient permissions
 */
export function hasAdminPermission(
  adminUser: AdminUser,
  requiredLevel: AdminLevel
): boolean {
  const levels = [AdminLevel.VIEWER, AdminLevel.MODERATOR, AdminLevel.SUPER_ADMIN];
  const userLevelIndex = levels.indexOf(adminUser.adminLevel);
  const requiredLevelIndex = levels.indexOf(requiredLevel);

  return userLevelIndex >= requiredLevelIndex;
}

/**
 * Checks if admin has a specific granular permission
 *
 * @param adminUser - Admin user object
 * @param permission - Permission string (e.g., 'withdrawals.approve')
 * @returns true if admin has the permission
 */
export function hasSpecificPermission(
  adminUser: AdminUser,
  permission: string
): boolean {
  // Super admins have all permissions
  if (adminUser.adminLevel === AdminLevel.SUPER_ADMIN) {
    return true;
  }

  // Check if permission exists in permissions array
  return adminUser.permissions.includes(permission);
}

/**
 * Updates admin's last login timestamp and IP
 *
 * SECURITY: Track login activity for audit purposes
 *
 * @param adminId - Admin user ID
 * @param ipAddress - Client IP address
 */
export async function updateAdminLastLogin(
  adminId: string,
  ipAddress?: string
): Promise<void> {
  try {
    const supabase = createServiceRoleClient();

    await supabase.rpc('update_admin_last_login', {
      p_admin_id: adminId,
      p_ip_address: ipAddress,
    });
  } catch (error) {
    console.error('Failed to update admin last login:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Increments failed login attempts for admin account
 *
 * SECURITY: Brute force protection
 * - Tracks failed login attempts
 * - Locks account for 30 minutes after 5 failures
 *
 * @param email - Admin email address
 * @returns Number of failed attempts
 */
export async function incrementFailedLoginAttempts(
  email: string
): Promise<number> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase.rpc('increment_admin_failed_login', {
      p_email: email,
    });

    if (error) {
      console.error('Failed to increment login attempts:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error incrementing failed login attempts:', error);
    return 0;
  }
}

/**
 * Checks if an admin account is currently locked
 *
 * @param userId - Admin user ID
 * @returns true if account is locked
 */
export async function isAdminLocked(userId: string): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase.rpc('is_admin_locked', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Failed to check admin lock status:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error checking admin lock status:', error);
    return false;
  }
}

/**
 * Logs an admin action to the audit log
 *
 * SECURITY: OWASP A09:2021 - Security Logging and Monitoring
 * - Immutable audit trail
 * - IP and User-Agent tracking
 * - Success/failure recording
 *
 * @param entry - Audit log entry
 * @returns Log entry ID or null
 */
export async function logAdminAction(
  entry: AuditLogEntry
): Promise<string | null> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase.rpc('log_admin_action', {
      p_admin_id: entry.adminId,
      p_admin_email: entry.adminEmail,
      p_action: entry.action,
      p_resource_type: entry.resourceType,
      p_resource_id: entry.resourceId || null,
      p_details: entry.details || {},
      p_old_values: entry.oldValues || null,
      p_new_values: entry.newValues || null,
      p_ip_address: entry.ipAddress || null,
      p_user_agent: entry.userAgent || null,
      p_success: entry.success !== false, // Default to true
      p_error_message: entry.errorMessage || null,
    });

    if (error) {
      console.error('Failed to log admin action:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
}

/**
 * Helper to create an audit log entry for a successful action
 *
 * @param params - Partial audit log entry
 * @returns Complete audit log entry
 */
export function createAuditLogEntry(
  params: Pick<AuditLogEntry, 'adminId' | 'adminEmail' | 'action' | 'resourceType'> &
    Partial<AuditLogEntry>
): AuditLogEntry {
  return {
    adminId: params.adminId,
    adminEmail: params.adminEmail,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    details: params.details,
    oldValues: params.oldValues,
    newValues: params.newValues,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    success: params.success !== false,
    errorMessage: params.errorMessage,
  };
}

/**
 * Rate limiting check for admin operations
 *
 * SECURITY: Prevent abuse of admin endpoints
 *
 * @param adminId - Admin user ID
 * @param action - Action being performed
 * @param maxAttempts - Maximum attempts allowed
 * @param windowSeconds - Time window in seconds
 * @returns true if rate limit exceeded
 */
export async function isRateLimited(
  adminId: string,
  action: string,
  maxAttempts: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();

    // Count actions in the time window
    const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

    const { count, error } = await supabase
      .from('admin_audit_log')
      .select('*', { count: 'exact', head: true })
      .eq('admin_id', adminId)
      .eq('action', action)
      .gte('created_at', windowStart);

    if (error) {
      console.error('Rate limit check error:', error);
      return false; // Fail open in case of error
    }

    return (count || 0) >= maxAttempts;
  } catch (error) {
    console.error('Rate limit check exception:', error);
    return false;
  }
}

/**
 * Sanitizes admin input to prevent injection attacks
 *
 * SECURITY: OWASP A03:2021 - Injection prevention
 *
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeAdminInput(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Validates admin action request
 *
 * @param actionType - Type of action (approve, reject, etc.)
 * @returns true if valid action type
 */
export function isValidAdminAction(actionType: string): boolean {
  const validActions = ['approve', 'reject', 'complete', 'cancel', 'update'];
  return validActions.includes(actionType);
}
