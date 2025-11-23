// convex/lib/system/email/email_templates/permissions.ts
// Access control and authorization logic for email templates module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { EmailTemplate } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewEmailTemplate(
  ctx: QueryCtx | MutationCtx,
  template: EmailTemplate,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Templates can be viewed by system (no user required for email sending)
  // But for management, admin access is required
  return false;
}

export async function requireViewEmailTemplateAccess(
  ctx: QueryCtx | MutationCtx,
  template: EmailTemplate,
  user: UserProfile
): Promise<void> {
  if (!(await canViewEmailTemplate(ctx, template, user))) {
    throw new Error('Permission denied: Admin access required to view email templates');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditEmailTemplate(
  ctx: QueryCtx | MutationCtx,
  template: EmailTemplate,
  user: UserProfile
): Promise<boolean> {
  // Only admins can edit email templates
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Check if template is locked/archived
  if (template.status === 'archived') {
    // Only superadmins can edit archived templates
    return user.role === 'superadmin';
  }

  return false;
}

export async function requireEditEmailTemplateAccess(
  ctx: QueryCtx | MutationCtx,
  template: EmailTemplate,
  user: UserProfile
): Promise<void> {
  if (!(await canEditEmailTemplate(ctx, template, user))) {
    throw new Error('Permission denied: Admin access required to edit email templates');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteEmailTemplate(
  template: EmailTemplate,
  user: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireDeleteEmailTemplateAccess(
  template: EmailTemplate,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteEmailTemplate(template, user))) {
    throw new Error('Permission denied: Admin access required to delete email templates');
  }
}

// ============================================================================
// Create Access
// ============================================================================

export function canCreateEmailTemplate(user: UserProfile): boolean {
  // Only admins can create email templates
  return user.role === 'admin' || user.role === 'superadmin';
}

export function requireCreateEmailTemplateAccess(user: UserProfile): void {
  if (!canCreateEmailTemplate(user)) {
    throw new Error('Permission denied: Admin access required to create email templates');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterEmailTemplatesByAccess(
  ctx: QueryCtx | MutationCtx,
  templates: EmailTemplate[],
  user: UserProfile
): Promise<EmailTemplate[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return templates;
  }

  // Non-admins see nothing (for management)
  return [];
}
