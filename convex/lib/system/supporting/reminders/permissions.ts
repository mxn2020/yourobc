// convex/lib/system/supporting/reminders/permissions.ts
// Access control and authorization logic for reminders module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';

type Reminder = Doc<'reminders'>;
type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewReminder(
  ctx: QueryCtx | MutationCtx,
  reminder: Reminder,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (reminder.ownerId === user._id) return true;

  // Assigned user can view
  if (reminder.assignedTo === user._id) return true;

  // Assigner can view
  if (reminder.assignedBy === user._id) return true;

  // Creator can view
  if (reminder.createdBy === user._id) return true;

  return false;
}

export async function requireViewReminderAccess(
  ctx: QueryCtx | MutationCtx,
  reminder: Reminder,
  user: UserProfile
): Promise<void> {
  if (!(await canViewReminder(ctx, reminder, user))) {
    throw new Error('You do not have permission to view this reminder');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditReminder(
  ctx: QueryCtx | MutationCtx,
  reminder: Reminder,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (reminder.ownerId === user._id) return true;

  // Assigned user can edit (to update status, add notes)
  if (reminder.assignedTo === user._id) return true;

  // Check if reminder is completed/cancelled
  if (reminder.status === 'completed' || reminder.status === 'cancelled') {
    // Only admins can edit completed/cancelled reminders
    return false;
  }

  return false;
}

export async function requireEditReminderAccess(
  ctx: QueryCtx | MutationCtx,
  reminder: Reminder,
  user: UserProfile
): Promise<void> {
  if (!(await canEditReminder(ctx, reminder, user))) {
    throw new Error('You do not have permission to edit this reminder');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteReminder(
  reminder: Reminder,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (reminder.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteReminderAccess(
  reminder: Reminder,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteReminder(reminder, user))) {
    throw new Error('You do not have permission to delete this reminder');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterRemindersByAccess(
  ctx: QueryCtx | MutationCtx,
  reminders: Reminder[],
  user: UserProfile
): Promise<Reminder[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return reminders;
  }

  const accessible: Reminder[] = [];

  for (const reminder of reminders) {
    if (await canViewReminder(ctx, reminder, user)) {
      accessible.push(reminder);
    }
  }

  return accessible;
}
