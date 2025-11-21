// convex/lib/system/supporting/scheduling/permissions.ts
// Access control and authorization logic for scheduling module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';

type ScheduledEvent = Doc<'scheduledEvents'>;
type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewScheduledEvent(
  ctx: QueryCtx | MutationCtx,
  event: ScheduledEvent,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Public visibility
  if (event.visibility === 'public') return true;

  // Team visibility (all authenticated users can view)
  if (event.visibility === 'team') return true;

  // Owner can view
  if (event.ownerId === user._id) return true;

  // Organizer can view
  if (event.organizerId === user._id) return true;

  // Creator can view
  if (event.createdBy === user._id) return true;

  // Attendee can view
  if (event.attendees) {
    const isAttendee = event.attendees.some(a => a.userId === user._id);
    if (isAttendee) return true;
  }

  return false;
}

export async function requireViewScheduledEventAccess(
  ctx: QueryCtx | MutationCtx,
  event: ScheduledEvent,
  user: UserProfile
): Promise<void> {
  if (!(await canViewScheduledEvent(ctx, event, user))) {
    throw new Error('You do not have permission to view this scheduled event');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditScheduledEvent(
  ctx: QueryCtx | MutationCtx,
  event: ScheduledEvent,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (event.ownerId === user._id) return true;

  // Organizer can edit
  if (event.organizerId === user._id) return true;

  // Check if event is completed/cancelled
  if (event.status === 'completed' || event.status === 'cancelled') {
    // Only admins can edit completed/cancelled events
    return false;
  }

  return false;
}

export async function requireEditScheduledEventAccess(
  ctx: QueryCtx | MutationCtx,
  event: ScheduledEvent,
  user: UserProfile
): Promise<void> {
  if (!(await canEditScheduledEvent(ctx, event, user))) {
    throw new Error('You do not have permission to edit this scheduled event');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteScheduledEvent(
  event: ScheduledEvent,
  user: UserProfile
): Promise<boolean> {
  // Only admins, owners, and organizers can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (event.ownerId === user._id) return true;
  if (event.organizerId === user._id) return true;
  return false;
}

export async function requireDeleteScheduledEventAccess(
  event: ScheduledEvent,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteScheduledEvent(event, user))) {
    throw new Error('You do not have permission to delete this scheduled event');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterScheduledEventsByAccess(
  ctx: QueryCtx | MutationCtx,
  events: ScheduledEvent[],
  user: UserProfile
): Promise<ScheduledEvent[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return events;
  }

  const accessible: ScheduledEvent[] = [];

  for (const event of events) {
    if (await canViewScheduledEvent(ctx, event, user)) {
      accessible.push(event);
    }
  }

  return accessible;
}
