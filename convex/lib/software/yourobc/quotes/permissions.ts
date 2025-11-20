// convex/lib/software/yourobc/quotes/permissions.ts
/**
 * Quote Permissions
 *
 * Access control and authorization logic for quote management.
 *
 * @module convex/lib/software/yourobc/quotes/permissions
 */

import type { QueryCtx, MutationCtx } from '@/generated/server'
import type { Quote } from './types'
import type { Doc } from '@/generated/dataModel'

type UserProfile = Doc<'userProfiles'>

// ============================================================================
// View Access
// ============================================================================

export async function canViewQuote(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true

  // Owner can view
  if (quote.ownerId === user._id) return true

  // Creator can view
  if (quote.createdBy === user._id) return true

  // Employee assigned to the quote can view
  if (quote.employeeId === user._id) return true

  // Check if user has access to the customer
  if (quote.customerId) {
    const customer = await ctx.db.get(quote.customerId)
    if (customer && customer.ownerId === user._id) return true
  }

  return false
}

export async function requireViewQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canViewQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to view this quote')
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditQuote(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true

  // Owner can edit
  if (quote.ownerId === user._id) return true

  // Employee assigned to the quote can edit
  if (quote.employeeId === user._id) return true

  // Check if quote is locked (accepted, rejected, or expired)
  if (
    quote.status === 'accepted' ||
    quote.status === 'rejected' ||
    quote.status === 'expired'
  ) {
    // Only admins can edit locked quotes
    return false
  }

  return false
}

export async function requireEditQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canEditQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to edit this quote')
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteQuote(quote: Quote, user: UserProfile): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true
  if (quote.ownerId === user._id) return true

  // Cannot delete accepted or converted quotes
  if (quote.status === 'accepted' || quote.convertedToShipmentId) {
    return false
  }

  return false
}

export async function requireDeleteQuoteAccess(
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteQuote(quote, user))) {
    throw new Error('You do not have permission to delete this quote')
  }
}

// ============================================================================
// Send Quote Access
// ============================================================================

export async function canSendQuote(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Must have edit access to send
  if (!(await canEditQuote(ctx, quote, user))) return false

  // Quote must be in draft or pending status
  if (quote.status !== 'draft' && quote.status !== 'pending') return false

  // Quote must have a total price
  if (!quote.totalPrice) return false

  return true
}

export async function requireSendQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canSendQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to send this quote')
  }
}

// ============================================================================
// Accept/Reject Quote Access
// ============================================================================

export async function canAcceptQuote(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Admins can accept any quote
  if (user.role === 'admin' || user.role === 'superadmin') return true

  // Owner and assigned employee can accept
  if (quote.ownerId === user._id || quote.employeeId === user._id) {
    // Quote must be sent or pending
    if (quote.status !== 'sent' && quote.status !== 'pending') return false

    // Quote must not be expired
    if (quote.validUntil < Date.now()) return false

    return true
  }

  return false
}

export async function requireAcceptQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canAcceptQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to accept this quote')
  }
}

export async function canRejectQuote(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Admins can reject any quote
  if (user.role === 'admin' || user.role === 'superadmin') return true

  // Owner and assigned employee can reject
  if (quote.ownerId === user._id || quote.employeeId === user._id) {
    // Quote must be sent or pending
    if (quote.status !== 'sent' && quote.status !== 'pending') return false

    return true
  }

  return false
}

export async function requireRejectQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canRejectQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to reject this quote')
  }
}

// ============================================================================
// Convert to Shipment Access
// ============================================================================

export async function canConvertToShipment(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Admins can convert any accepted quote
  if (user.role === 'admin' || user.role === 'superadmin') return true

  // Owner and assigned employee can convert
  if (quote.ownerId === user._id || quote.employeeId === user._id) {
    // Quote must be accepted
    if (quote.status !== 'accepted') return false

    // Quote must not already be converted
    if (quote.convertedToShipmentId) return false

    return true
  }

  return false
}

export async function requireConvertToShipmentAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canConvertToShipment(ctx, quote, user))) {
    throw new Error('You do not have permission to convert this quote to a shipment')
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterQuotesByAccess(
  ctx: QueryCtx | MutationCtx,
  quotes: Quote[],
  user: UserProfile
): Promise<Quote[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return quotes
  }

  const accessible: Quote[] = []

  for (const quote of quotes) {
    if (await canViewQuote(ctx, quote, user)) {
      accessible.push(quote)
    }
  }

  return accessible
}
