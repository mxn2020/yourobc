// convex/lib/yourobc/trackingMessages/permissions.ts
// Access control and authorization logic for trackingMessages module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { TrackingMessage } from './types';
import { UserProfile } from '@/schema/system';


// ============================================================================
// View Access
// ============================================================================

export async function canViewTrackingMessage(
  ctx: QueryCtx | MutationCtx,
  message: TrackingMessage,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (message.ownerId === user._id) return true;

  // Creator can view
  if (message.createdBy === user._id) return true;

  // Recipient can view (check if user is in recipients list)
  if (message.recipients?.some(r => r.userId === user._id)) return true;

  // If message is related to a shipment, check shipment access
  if (message.shipmentId) {
    const shipment = await ctx.db.get(message.shipmentId);
    if (shipment && (shipment.createdBy === user._id || shipment.ownerId === user._id)) {
      return true;
    }
  }

  return false;
}

export async function requireViewTrackingMessageAccess(
  ctx: QueryCtx | MutationCtx,
  message: TrackingMessage,
  user: UserProfile
): Promise<void> {
  if (!(await canViewTrackingMessage(ctx, message, user))) {
    throw new Error('You do not have permission to view this tracking message');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditTrackingMessage(
  ctx: QueryCtx | MutationCtx,
  message: TrackingMessage,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (message.ownerId === user._id) return true;

  // Check if message is locked (only drafts can be edited)
  if (message.status !== 'draft') {
    // Only admins can edit non-draft messages
    return false;
  }

  return false;
}

export async function requireEditTrackingMessageAccess(
  ctx: QueryCtx | MutationCtx,
  message: TrackingMessage,
  user: UserProfile
): Promise<void> {
  if (!(await canEditTrackingMessage(ctx, message, user))) {
    throw new Error('You do not have permission to edit this tracking message');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteTrackingMessage(
  message: TrackingMessage,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (message.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteTrackingMessageAccess(
  message: TrackingMessage,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteTrackingMessage(message, user))) {
    throw new Error('You do not have permission to delete this tracking message');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterTrackingMessagesByAccess(
  ctx: QueryCtx | MutationCtx,
  messages: TrackingMessage[],
  user: UserProfile
): Promise<TrackingMessage[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return messages;
  }

  const accessible: TrackingMessage[] = [];

  for (const message of messages) {
    if (await canViewTrackingMessage(ctx, message, user)) {
      accessible.push(message);
    }
  }

  return accessible;
}
