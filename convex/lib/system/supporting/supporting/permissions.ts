// convex/lib/boilerplate/supporting/supporting/permissions.ts
// Access control and authorization logic for supporting module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import { SUPPORTING_CONSTANTS } from './constants';
import type {
  WikiEntry,
  Comment,
  Reminder,
  Document,
  ScheduledEvent,
  AvailabilityPreference,
} from './types';

type UserProfile = Doc<'userProfiles'>;
type SupportingEntity =
  | WikiEntry
  | Comment
  | Reminder
  | Document
  | ScheduledEvent
  | AvailabilityPreference;

// ============================================================================
// Generic Access Control
// ============================================================================

/**
 * Check if user has ownership or admin access to an entity
 */
function hasOwnershipOrAdmin(entity: SupportingEntity, user: UserProfile): boolean {
  // Admins and superadmins can access all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check ownerId field
  if ('ownerId' in entity && entity.ownerId === user._id) {
    return true;
  }

  // For comments, check createdBy
  if ('createdBy' in entity && entity.createdBy === user._id) {
    return true;
  }

  // For availability preferences, check userId
  if ('userId' in entity && entity.userId === user._id) {
    return true;
  }

  return false;
}

/**
 * Check if entity is publicly accessible
 */
function isPubliclyAccessible(entity: SupportingEntity): boolean {
  // Check visibility field
  if ('visibility' in entity && entity.visibility === 'public') {
    return true;
  }

  // Check isPublic field for documents
  if ('isPublic' in entity && entity.isPublic === true) {
    return true;
  }

  return false;
}

// ============================================================================
// Wiki Entries
// ============================================================================

export async function canViewWikiEntry(
  ctx: QueryCtx | MutationCtx,
  wikiEntry: WikiEntry,
  user: UserProfile
): Promise<boolean> {
  // Admin or owner can view
  if (hasOwnershipOrAdmin(wikiEntry, user)) {
    return true;
  }

  // Public or published wiki entries visible to all
  if (
    wikiEntry.visibility === 'public' ||
    wikiEntry.status === SUPPORTING_CONSTANTS.WIKI.STATUS.PUBLISHED
  ) {
    return true;
  }

  return false;
}

export async function canEditWikiEntry(
  wikiEntry: WikiEntry,
  user: UserProfile
): Promise<boolean> {
  return hasOwnershipOrAdmin(wikiEntry, user);
}

export async function canDeleteWikiEntry(
  wikiEntry: WikiEntry,
  user: UserProfile
): Promise<boolean> {
  return hasOwnershipOrAdmin(wikiEntry, user);
}

// ============================================================================
// Comments
// ============================================================================

export async function canViewComment(
  ctx: QueryCtx | MutationCtx,
  comment: Comment,
  user: UserProfile
): Promise<boolean> {
  // Admin can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Creator can view
  if (comment.createdBy === user._id) {
    return true;
  }

  // Internal comments need special access
  if (comment.isInternal) {
    return user.role === 'admin' || user.role === 'superadmin';
  }

  // TODO: Check if user has access to parent entity
  return true;
}

export async function canEditComment(comment: Comment, user: UserProfile): Promise<boolean> {
  // Admin or creator can edit
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return comment.createdBy === user._id;
}

export async function canDeleteComment(comment: Comment, user: UserProfile): Promise<boolean> {
  // Admin or creator can delete
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return comment.createdBy === user._id;
}

// ============================================================================
// Reminders
// ============================================================================

export async function canViewReminder(
  ctx: QueryCtx | MutationCtx,
  reminder: Reminder,
  user: UserProfile
): Promise<boolean> {
  // Admin can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner, assignee, or creator can view
  if (
    reminder.ownerId === user._id ||
    reminder.assignedTo === user._id ||
    reminder.assignedBy === user._id
  ) {
    return true;
  }

  return false;
}

export async function canEditReminder(reminder: Reminder, user: UserProfile): Promise<boolean> {
  // Admin, owner, or assignee can edit
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return reminder.ownerId === user._id || reminder.assignedTo === user._id;
}

export async function canDeleteReminder(reminder: Reminder, user: UserProfile): Promise<boolean> {
  // Admin or owner can delete
  return hasOwnershipOrAdmin(reminder, user);
}

// ============================================================================
// Documents
// ============================================================================

export async function canViewDocument(
  ctx: QueryCtx | MutationCtx,
  document: Document,
  user: UserProfile
): Promise<boolean> {
  // Admin can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner or uploader can view
  if (document.ownerId === user._id || document.uploadedBy === user._id) {
    return true;
  }

  // Public documents visible to all
  if (document.isPublic) {
    return true;
  }

  // Confidential documents only for admin or owner
  if (document.isConfidential) {
    return false;
  }

  // TODO: Check if user has access to parent entity
  return true;
}

export async function canEditDocument(document: Document, user: UserProfile): Promise<boolean> {
  // Admin or owner can edit
  return hasOwnershipOrAdmin(document, user);
}

export async function canDeleteDocument(document: Document, user: UserProfile): Promise<boolean> {
  // Admin or owner can delete
  return hasOwnershipOrAdmin(document, user);
}

// ============================================================================
// Scheduled Events
// ============================================================================

export async function canViewScheduledEvent(
  ctx: QueryCtx | MutationCtx,
  event: ScheduledEvent,
  user: UserProfile
): Promise<boolean> {
  // Admin can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner or organizer can view
  if (event.ownerId === user._id || event.organizerId === user._id) {
    return true;
  }

  // Check if user is an attendee
  if (event.attendees?.some((attendee) => attendee.userId === user._id)) {
    return true;
  }

  // Public events visible to all
  if (event.visibility === 'public') {
    return true;
  }

  return false;
}

export async function canEditScheduledEvent(
  event: ScheduledEvent,
  user: UserProfile
): Promise<boolean> {
  // Admin, owner, or organizer can edit
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return event.ownerId === user._id || event.organizerId === user._id;
}

export async function canDeleteScheduledEvent(
  event: ScheduledEvent,
  user: UserProfile
): Promise<boolean> {
  // Admin or owner can delete
  return hasOwnershipOrAdmin(event, user);
}

// ============================================================================
// Availability Preferences
// ============================================================================

export async function canViewAvailability(
  ctx: QueryCtx | MutationCtx,
  availability: AvailabilityPreference,
  user: UserProfile
): Promise<boolean> {
  // Admin can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // User can view their own availability
  return availability.userId === user._id;
}

export async function canEditAvailability(
  availability: AvailabilityPreference,
  user: UserProfile
): Promise<boolean> {
  // Admin can edit all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // User can edit their own availability
  return availability.userId === user._id;
}

export async function canDeleteAvailability(
  availability: AvailabilityPreference,
  user: UserProfile
): Promise<boolean> {
  // Admin can delete all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // User can delete their own availability
  return availability.userId === user._id;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Require access or throw error
 */
export async function requireAccess(
  hasAccess: boolean,
  message: string = 'You do not have permission to perform this action'
): Promise<void> {
  if (!hasAccess) {
    throw new Error(message);
  }
}
