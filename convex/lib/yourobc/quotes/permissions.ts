// convex/lib/yourobc/quotes/permissions.ts
// Access control and authorization logic for quotes module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Quote } from './types';
import { UserProfile } from '@/schema/system';


// ============================================================================
// View Access
// ============================================================================

export async function canViewQuote(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all quotes
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view (sales person who created the quote)
  if (quote.ownerId === user._id) return true;

  // Creator can view
  if (quote.createdBy === user._id) return true;

  // Assigned employee can view
  if (quote.employeeId && quote.employeeId === user._id) return true;

  return false;
}

export async function requireViewQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canViewQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to view this quote');
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
  // Admins can edit all quotes
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner (sales person) can edit their own quotes
  if (quote.ownerId === user._id) return true;

  // Assigned employee can edit
  if (quote.employeeId && quote.employeeId === user._id) return true;

  // Check if quote is locked (accepted, rejected, or expired quotes can only be edited by admins)
  if (quote.status === 'accepted' || quote.status === 'rejected' || quote.status === 'expired') {
    return false;
  }

  return false;
}

export async function requireEditQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canEditQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to edit this quote');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteQuote(
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete quotes
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (quote.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteQuoteAccess(
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteQuote(quote, user))) {
    throw new Error('You do not have permission to delete this quote');
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
  // Admins can send any quote
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner (sales person) can send their own quotes
  if (quote.ownerId === user._id) return true;

  // Assigned employee can send
  if (quote.employeeId && quote.employeeId === user._id) return true;

  return false;
}

export async function requireSendQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canSendQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to send this quote');
  }
}

// ============================================================================
// Accept/Reject Quote Access
// ============================================================================

export async function canAcceptOrRejectQuote(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Admins can accept/reject any quote
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner (sales person) can accept/reject their own quotes
  if (quote.ownerId === user._id) return true;

  // Assigned employee can accept/reject
  if (quote.employeeId && quote.employeeId === user._id) return true;

  return false;
}

export async function requireAcceptOrRejectQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canAcceptOrRejectQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to accept or reject this quote');
  }
}

// ============================================================================
// Convert Quote Access
// ============================================================================

export async function canConvertQuote(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<boolean> {
  // Admins can convert any quote
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner (sales person) can convert their own accepted quotes
  if (quote.ownerId === user._id) return true;

  // Assigned employee can convert
  if (quote.employeeId && quote.employeeId === user._id) return true;

  return false;
}

export async function requireConvertQuoteAccess(
  ctx: QueryCtx | MutationCtx,
  quote: Quote,
  user: UserProfile
): Promise<void> {
  if (!(await canConvertQuote(ctx, quote, user))) {
    throw new Error('You do not have permission to convert this quote');
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
    return quotes;
  }

  const accessible: Quote[] = [];

  for (const quote of quotes) {
    if (await canViewQuote(ctx, quote, user)) {
      accessible.push(quote);
    }
  }

  return accessible;
}
