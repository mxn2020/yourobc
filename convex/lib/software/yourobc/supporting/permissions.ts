// convex/lib/software/yourobc/supporting/permissions.ts
/**
 * Supporting Module Permissions
 *
 * Permission checks for all supporting entities.
 * Implements role-based access control and entity-level permissions.
 *
 * @module convex/lib/software/yourobc/supporting/permissions
 */

import type { Id } from '../../../../_generated/dataModel'
import type {
  ExchangeRate,
  InquirySource,
  WikiEntry,
  Comment,
  FollowupReminder,
  Document,
  Notification,
  Counter,
} from './types'

// ============================================================================
// Permission Types
// ============================================================================

export interface PermissionContext {
  userId: string
  role: string
  permissions: string[]
}

export enum Permission {
  // Exchange Rates
  EXCHANGE_RATES_VIEW = 'exchangeRates.view',
  EXCHANGE_RATES_CREATE = 'exchangeRates.create',
  EXCHANGE_RATES_UPDATE = 'exchangeRates.update',
  EXCHANGE_RATES_DELETE = 'exchangeRates.delete',

  // Inquiry Sources
  INQUIRY_SOURCES_VIEW = 'inquirySources.view',
  INQUIRY_SOURCES_CREATE = 'inquirySources.create',
  INQUIRY_SOURCES_UPDATE = 'inquirySources.update',
  INQUIRY_SOURCES_DELETE = 'inquirySources.delete',

  // Wiki Entries
  WIKI_VIEW_PUBLIC = 'wiki.viewPublic',
  WIKI_VIEW_ALL = 'wiki.viewAll',
  WIKI_CREATE = 'wiki.create',
  WIKI_UPDATE = 'wiki.update',
  WIKI_DELETE = 'wiki.delete',
  WIKI_PUBLISH = 'wiki.publish',

  // Comments
  COMMENTS_VIEW = 'comments.view',
  COMMENTS_VIEW_INTERNAL = 'comments.viewInternal',
  COMMENTS_CREATE = 'comments.create',
  COMMENTS_UPDATE = 'comments.update',
  COMMENTS_DELETE = 'comments.delete',

  // Followup Reminders
  REMINDERS_VIEW_OWN = 'reminders.viewOwn',
  REMINDERS_VIEW_ALL = 'reminders.viewAll',
  REMINDERS_CREATE = 'reminders.create',
  REMINDERS_UPDATE = 'reminders.update',
  REMINDERS_DELETE = 'reminders.delete',
  REMINDERS_ASSIGN = 'reminders.assign',

  // Documents
  DOCUMENTS_VIEW_PUBLIC = 'documents.viewPublic',
  DOCUMENTS_VIEW_ALL = 'documents.viewAll',
  DOCUMENTS_VIEW_CONFIDENTIAL = 'documents.viewConfidential',
  DOCUMENTS_UPLOAD = 'documents.upload',
  DOCUMENTS_UPDATE = 'documents.update',
  DOCUMENTS_DELETE = 'documents.delete',

  // Notifications
  NOTIFICATIONS_VIEW_OWN = 'notifications.viewOwn',
  NOTIFICATIONS_CREATE = 'notifications.create',
  NOTIFICATIONS_DELETE = 'notifications.delete',

  // Counters
  COUNTERS_VIEW = 'counters.view',
  COUNTERS_UPDATE = 'counters.update',
  COUNTERS_RESET = 'counters.reset',
}

// ============================================================================
// Role Definitions
// ============================================================================

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(Permission),

  manager: [
    // Exchange Rates
    Permission.EXCHANGE_RATES_VIEW,
    Permission.EXCHANGE_RATES_CREATE,
    Permission.EXCHANGE_RATES_UPDATE,

    // Inquiry Sources
    Permission.INQUIRY_SOURCES_VIEW,
    Permission.INQUIRY_SOURCES_CREATE,
    Permission.INQUIRY_SOURCES_UPDATE,

    // Wiki
    Permission.WIKI_VIEW_PUBLIC,
    Permission.WIKI_VIEW_ALL,
    Permission.WIKI_CREATE,
    Permission.WIKI_UPDATE,
    Permission.WIKI_PUBLISH,

    // Comments
    Permission.COMMENTS_VIEW,
    Permission.COMMENTS_VIEW_INTERNAL,
    Permission.COMMENTS_CREATE,
    Permission.COMMENTS_UPDATE,

    // Reminders
    Permission.REMINDERS_VIEW_OWN,
    Permission.REMINDERS_VIEW_ALL,
    Permission.REMINDERS_CREATE,
    Permission.REMINDERS_UPDATE,
    Permission.REMINDERS_ASSIGN,

    // Documents
    Permission.DOCUMENTS_VIEW_PUBLIC,
    Permission.DOCUMENTS_VIEW_ALL,
    Permission.DOCUMENTS_VIEW_CONFIDENTIAL,
    Permission.DOCUMENTS_UPLOAD,
    Permission.DOCUMENTS_UPDATE,

    // Notifications
    Permission.NOTIFICATIONS_VIEW_OWN,
    Permission.NOTIFICATIONS_CREATE,

    // Counters
    Permission.COUNTERS_VIEW,
  ],

  user: [
    // Exchange Rates
    Permission.EXCHANGE_RATES_VIEW,

    // Inquiry Sources
    Permission.INQUIRY_SOURCES_VIEW,

    // Wiki
    Permission.WIKI_VIEW_PUBLIC,
    Permission.WIKI_CREATE,

    // Comments
    Permission.COMMENTS_VIEW,
    Permission.COMMENTS_CREATE,
    Permission.COMMENTS_UPDATE,

    // Reminders
    Permission.REMINDERS_VIEW_OWN,
    Permission.REMINDERS_CREATE,
    Permission.REMINDERS_UPDATE,

    // Documents
    Permission.DOCUMENTS_VIEW_PUBLIC,
    Permission.DOCUMENTS_UPLOAD,

    // Notifications
    Permission.NOTIFICATIONS_VIEW_OWN,

    // Counters
    Permission.COUNTERS_VIEW,
  ],
}

// ============================================================================
// Permission Check Functions
// ============================================================================

export function hasPermission(
  ctx: PermissionContext,
  permission: Permission,
): boolean {
  // Admin has all permissions
  if (ctx.role === 'admin') {
    return true
  }

  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[ctx.role] || []
  if (rolePermissions.includes(permission)) {
    return true
  }

  // Check explicit permissions
  return ctx.permissions.includes(permission)
}

export function requirePermission(
  ctx: PermissionContext,
  permission: Permission,
): void {
  if (!hasPermission(ctx, permission)) {
    throw new Error(`Permission denied: ${permission}`)
  }
}

// ============================================================================
// Exchange Rates Permissions
// ============================================================================

export function canViewExchangeRates(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.EXCHANGE_RATES_VIEW)
}

export function canCreateExchangeRate(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.EXCHANGE_RATES_CREATE)
}

export function canUpdateExchangeRate(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.EXCHANGE_RATES_UPDATE)
}

export function canDeleteExchangeRate(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.EXCHANGE_RATES_DELETE)
}

// ============================================================================
// Inquiry Sources Permissions
// ============================================================================

export function canViewInquirySources(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.INQUIRY_SOURCES_VIEW)
}

export function canCreateInquirySource(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.INQUIRY_SOURCES_CREATE)
}

export function canUpdateInquirySource(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.INQUIRY_SOURCES_UPDATE)
}

export function canDeleteInquirySource(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.INQUIRY_SOURCES_DELETE)
}

// ============================================================================
// Wiki Entries Permissions
// ============================================================================

export function canViewWikiEntry(
  ctx: PermissionContext,
  wiki: WikiEntry,
): boolean {
  // Public wikis can be viewed by anyone with basic permission
  if (wiki.isPublic && hasPermission(ctx, Permission.WIKI_VIEW_PUBLIC)) {
    return true
  }

  // Non-public wikis require viewAll permission
  return hasPermission(ctx, Permission.WIKI_VIEW_ALL)
}

export function canCreateWikiEntry(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.WIKI_CREATE)
}

export function canUpdateWikiEntry(
  ctx: PermissionContext,
  wiki: WikiEntry,
): boolean {
  // Can update if has general permission or is the creator
  if (hasPermission(ctx, Permission.WIKI_UPDATE)) {
    return true
  }

  return wiki.createdBy === ctx.userId
}

export function canDeleteWikiEntry(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.WIKI_DELETE)
}

export function canPublishWikiEntry(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.WIKI_PUBLISH)
}

// ============================================================================
// Comments Permissions
// ============================================================================

export function canViewComment(
  ctx: PermissionContext,
  comment: Comment,
): boolean {
  // Internal comments require special permission
  if (
    comment.isInternal &&
    !hasPermission(ctx, Permission.COMMENTS_VIEW_INTERNAL)
  ) {
    return false
  }

  return hasPermission(ctx, Permission.COMMENTS_VIEW)
}

export function canCreateComment(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.COMMENTS_CREATE)
}

export function canUpdateComment(
  ctx: PermissionContext,
  comment: Comment,
): boolean {
  // Can update if has general permission or is the creator
  if (hasPermission(ctx, Permission.COMMENTS_UPDATE)) {
    return true
  }

  return comment.createdBy === ctx.userId
}

export function canDeleteComment(
  ctx: PermissionContext,
  comment: Comment,
): boolean {
  // Can delete if has general permission or is the creator
  if (hasPermission(ctx, Permission.COMMENTS_DELETE)) {
    return true
  }

  return comment.createdBy === ctx.userId
}

// ============================================================================
// Followup Reminders Permissions
// ============================================================================

export function canViewReminder(
  ctx: PermissionContext,
  reminder: FollowupReminder,
): boolean {
  // Can view all reminders
  if (hasPermission(ctx, Permission.REMINDERS_VIEW_ALL)) {
    return true
  }

  // Can view own reminders
  if (
    hasPermission(ctx, Permission.REMINDERS_VIEW_OWN) &&
    (reminder.assignedTo === ctx.userId ||
      reminder.assignedBy === ctx.userId ||
      reminder.createdBy === ctx.userId)
  ) {
    return true
  }

  return false
}

export function canCreateReminder(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.REMINDERS_CREATE)
}

export function canUpdateReminder(
  ctx: PermissionContext,
  reminder: FollowupReminder,
): boolean {
  // Can update if has general permission
  if (hasPermission(ctx, Permission.REMINDERS_UPDATE)) {
    return true
  }

  // Can update if assigned to the reminder
  return reminder.assignedTo === ctx.userId
}

export function canDeleteReminder(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.REMINDERS_DELETE)
}

export function canAssignReminder(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.REMINDERS_ASSIGN)
}

// ============================================================================
// Documents Permissions
// ============================================================================

export function canViewDocument(
  ctx: PermissionContext,
  document: Document,
): boolean {
  // Public documents can be viewed by anyone with basic permission
  if (
    document.isPublic &&
    hasPermission(ctx, Permission.DOCUMENTS_VIEW_PUBLIC)
  ) {
    return true
  }

  // Confidential documents require special permission
  if (
    document.isConfidential &&
    !hasPermission(ctx, Permission.DOCUMENTS_VIEW_CONFIDENTIAL)
  ) {
    return false
  }

  // All other documents require viewAll permission
  return hasPermission(ctx, Permission.DOCUMENTS_VIEW_ALL)
}

export function canUploadDocument(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.DOCUMENTS_UPLOAD)
}

export function canUpdateDocument(
  ctx: PermissionContext,
  document: Document,
): boolean {
  // Can update if has general permission or is the uploader
  if (hasPermission(ctx, Permission.DOCUMENTS_UPDATE)) {
    return true
  }

  return document.uploadedBy === ctx.userId
}

export function canDeleteDocument(
  ctx: PermissionContext,
  document: Document,
): boolean {
  // Can delete if has general permission or is the uploader
  if (hasPermission(ctx, Permission.DOCUMENTS_DELETE)) {
    return true
  }

  return document.uploadedBy === ctx.userId
}

// ============================================================================
// Notifications Permissions
// ============================================================================

export function canViewNotification(
  ctx: PermissionContext,
  notification: Notification,
): boolean {
  // Users can only view their own notifications
  if (
    hasPermission(ctx, Permission.NOTIFICATIONS_VIEW_OWN) &&
    notification.userId === ctx.userId
  ) {
    return true
  }

  // Admins can view all notifications
  return ctx.role === 'admin'
}

export function canCreateNotification(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.NOTIFICATIONS_CREATE)
}

export function canDeleteNotification(
  ctx: PermissionContext,
  notification: Notification,
): boolean {
  // Can delete own notifications
  if (
    hasPermission(ctx, Permission.NOTIFICATIONS_VIEW_OWN) &&
    notification.userId === ctx.userId
  ) {
    return true
  }

  // Or has general delete permission
  return hasPermission(ctx, Permission.NOTIFICATIONS_DELETE)
}

// ============================================================================
// Counters Permissions
// ============================================================================

export function canViewCounters(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.COUNTERS_VIEW)
}

export function canUpdateCounter(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.COUNTERS_UPDATE)
}

export function canResetCounter(ctx: PermissionContext): boolean {
  return hasPermission(ctx, Permission.COUNTERS_RESET)
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

export function canPerformAction(
  ctx: PermissionContext,
  action: string,
  resource?: any,
): boolean {
  const permission = action as Permission

  // Check basic permission
  if (!hasPermission(ctx, permission)) {
    return false
  }

  // Additional resource-specific checks
  if (resource) {
    switch (true) {
      case action.startsWith('wiki'):
        return canViewWikiEntry(ctx, resource as WikiEntry)
      case action.startsWith('comments'):
        return canViewComment(ctx, resource as Comment)
      case action.startsWith('reminders'):
        return canViewReminder(ctx, resource as FollowupReminder)
      case action.startsWith('documents'):
        return canViewDocument(ctx, resource as Document)
      case action.startsWith('notifications'):
        return canViewNotification(ctx, resource as Notification)
    }
  }

  return true
}
