// convex/lib/software/yourobc/couriers/queries.ts
// Read operations for couriers module

import type { QueryCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import type { Courier, CourierId, Commission, CommissionId } from '@/schema/software/yourobc/couriers';
import { canViewCourier, canViewCommission } from './permissions';
import { COURIERS_CONSTANTS, COMMISSIONS_CONSTANTS } from './constants';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current user or throw error
 */
async function requireCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }

  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authSubject'), identity.subject))
    .first();

  if (!user) {
    throw new Error('User profile not found');
  }

  return user;
}

// ============================================================================
// Courier Queries
// ============================================================================

/**
 * Get courier by ID
 */
export async function getCourierById(
  ctx: QueryCtx,
  courierId: CourierId
): Promise<Courier | null> {
  const user = await requireCurrentUser(ctx);
  const courier = await ctx.db.get(courierId);

  if (!courier) return null;

  if (!canViewCourier(courier, user)) {
    throw new Error(COURIERS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  return courier;
}

/**
 * Get courier by public ID
 */
export async function getCourierByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<Courier | null> {
  const user = await requireCurrentUser(ctx);
  const courier = await ctx.db
    .query('yourobcCouriers')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first();

  if (!courier) return null;

  if (!canViewCourier(courier, user)) {
    throw new Error(COURIERS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  return courier;
}

/**
 * Get courier by courier number
 */
export async function getCourierByCourierNumber(
  ctx: QueryCtx,
  courierNumber: string
): Promise<Courier | null> {
  const user = await requireCurrentUser(ctx);
  const courier = await ctx.db
    .query('yourobcCouriers')
    .withIndex('by_courierNumber', (q) => q.eq('courierNumber', courierNumber))
    .first();

  if (!courier) return null;

  if (!canViewCourier(courier, user)) {
    throw new Error(COURIERS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  return courier;
}

/**
 * List all couriers
 */
export async function listCouriers(
  ctx: QueryCtx,
  options?: {
    status?: 'available' | 'busy' | 'offline' | 'vacation';
    isActive?: boolean;
    isOnline?: boolean;
    includeDeleted?: boolean;
  }
): Promise<Courier[]> {
  const user = await requireCurrentUser(ctx);
  let query = ctx.db.query('yourobcCouriers');

  // Apply filters
  const couriers = await query.collect();

  return couriers.filter((courier) => {
    // Check permissions
    if (!canViewCourier(courier, user)) return false;

    // Filter by deleted status
    if (!options?.includeDeleted && courier.deletedAt) return false;

    // Filter by status
    if (options?.status && courier.status !== options.status) return false;

    // Filter by isActive
    if (options?.isActive !== undefined && courier.isActive !== options.isActive) return false;

    // Filter by isOnline
    if (options?.isOnline !== undefined && courier.isOnline !== options.isOnline) return false;

    return true;
  });
}

/**
 * List couriers by owner
 */
export async function listCouriersByOwner(
  ctx: QueryCtx,
  ownerId: Id<'userProfiles'>,
  includeDeleted?: boolean
): Promise<Courier[]> {
  const user = await requireCurrentUser(ctx);

  const couriers = await ctx.db
    .query('yourobcCouriers')
    .withIndex('by_owner', (q) => q.eq('ownerId', ownerId))
    .collect();

  return couriers.filter((courier) => {
    if (!canViewCourier(courier, user)) return false;
    if (!includeDeleted && courier.deletedAt) return false;
    return true;
  });
}

/**
 * Search couriers
 */
export async function searchCouriers(
  ctx: QueryCtx,
  searchTerm: string
): Promise<Courier[]> {
  const user = await requireCurrentUser(ctx);
  const allCouriers = await ctx.db.query('yourobcCouriers').collect();

  const searchLower = searchTerm.toLowerCase();

  return allCouriers.filter((courier) => {
    if (!canViewCourier(courier, user)) return false;
    if (courier.deletedAt) return false;

    return (
      courier.companyName.toLowerCase().includes(searchLower) ||
      courier.courierNumber.toLowerCase().includes(searchLower) ||
      courier.firstName.toLowerCase().includes(searchLower) ||
      courier.lastName.toLowerCase().includes(searchLower) ||
      courier.email?.toLowerCase().includes(searchLower) ||
      courier.phone.includes(searchTerm)
    );
  });
}

// ============================================================================
// Commission Queries
// ============================================================================

/**
 * Get commission by ID
 */
export async function getCommissionById(
  ctx: QueryCtx,
  commissionId: CommissionId
): Promise<Commission | null> {
  const user = await requireCurrentUser(ctx);
  const commission = await ctx.db.get(commissionId);

  if (!commission) return null;

  if (!canViewCommission(commission, user)) {
    throw new Error(COMMISSIONS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  return commission;
}

/**
 * Get commission by public ID
 */
export async function getCommissionByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<Commission | null> {
  const user = await requireCurrentUser(ctx);
  const commission = await ctx.db
    .query('yourobcCourierCommissions')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first();

  if (!commission) return null;

  if (!canViewCommission(commission, user)) {
    throw new Error(COMMISSIONS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  return commission;
}

/**
 * List commissions by courier
 */
export async function listCommissionsByCourier(
  ctx: QueryCtx,
  courierId: CourierId,
  options?: {
    status?: 'pending' | 'paid';
    includeDeleted?: boolean;
  }
): Promise<Commission[]> {
  const user = await requireCurrentUser(ctx);

  const commissions = await ctx.db
    .query('yourobcCourierCommissions')
    .withIndex('by_courier', (q) => q.eq('courierId', courierId))
    .collect();

  return commissions.filter((commission) => {
    if (!canViewCommission(commission, user)) return false;
    if (!options?.includeDeleted && commission.deletedAt) return false;
    if (options?.status && commission.status !== options.status) return false;
    return true;
  });
}

/**
 * List commissions by shipment
 */
export async function listCommissionsByShipment(
  ctx: QueryCtx,
  shipmentId: Id<'yourobcShipments'>,
  includeDeleted?: boolean
): Promise<Commission[]> {
  const user = await requireCurrentUser(ctx);

  const commissions = await ctx.db
    .query('yourobcCourierCommissions')
    .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))
    .collect();

  return commissions.filter((commission) => {
    if (!canViewCommission(commission, user)) return false;
    if (!includeDeleted && commission.deletedAt) return false;
    return true;
  });
}

/**
 * List all commissions
 */
export async function listCommissions(
  ctx: QueryCtx,
  options?: {
    status?: 'pending' | 'paid';
    courierId?: CourierId;
    includeDeleted?: boolean;
  }
): Promise<Commission[]> {
  const user = await requireCurrentUser(ctx);
  const commissions = await ctx.db.query('yourobcCourierCommissions').collect();

  return commissions.filter((commission) => {
    if (!canViewCommission(commission, user)) return false;
    if (!options?.includeDeleted && commission.deletedAt) return false;
    if (options?.status && commission.status !== options.status) return false;
    if (options?.courierId && commission.courierId !== options.courierId) return false;
    return true;
  });
}

/**
 * Get commission summary for a courier
 */
export async function getCommissionSummaryForCourier(
  ctx: QueryCtx,
  courierId: CourierId
): Promise<{
  totalPending: number;
  totalPaid: number;
  pendingAmount: number;
  paidAmount: number;
}> {
  const user = await requireCurrentUser(ctx);

  const commissions = await ctx.db
    .query('yourobcCourierCommissions')
    .withIndex('by_courier', (q) => q.eq('courierId', courierId))
    .collect();

  const filteredCommissions = commissions.filter((commission) => {
    return canViewCommission(commission, user) && !commission.deletedAt;
  });

  const summary = {
    totalPending: 0,
    totalPaid: 0,
    pendingAmount: 0,
    paidAmount: 0,
  };

  for (const commission of filteredCommissions) {
    if (commission.status === 'pending') {
      summary.totalPending++;
      summary.pendingAmount += commission.commissionAmount;
    } else if (commission.status === 'paid') {
      summary.totalPaid++;
      summary.paidAmount += commission.commissionAmount;
    }
  }

  return summary;
}
