// convex/lib/software/yourobc/partners/queries.ts
// Query operations for partners module

import type { QueryCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import { canViewPartner, canViewInternalNotes } from './permissions';
import type { Partner, PartnerListFilters } from './types';

// ============================================================================
// Partner Queries
// ============================================================================

/**
 * Get partner by ID
 */
export async function getPartner(
  ctx: QueryCtx,
  partnerId: Id<'yourobcPartners'>,
  userId: string
): Promise<Partner | null> {
  const partner = await ctx.db.get(partnerId);

  if (!partner || partner.deletedAt) {
    return null;
  }

  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authUserId'), userId))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  const hasAccess = await canViewPartner(ctx, partner, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this partner');
  }

  return partner;
}

/**
 * Get partner by public ID
 */
export async function getPartnerByPublicId(
  ctx: QueryCtx,
  publicId: string,
  userId: string
): Promise<Partner | null> {
  const partner = await ctx.db
    .query('yourobcPartners')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first();

  if (!partner) {
    return null;
  }

  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authUserId'), userId))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  const hasAccess = await canViewPartner(ctx, partner, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this partner');
  }

  return partner;
}

/**
 * Get partner by company name
 */
export async function getPartnerByCompanyName(
  ctx: QueryCtx,
  companyName: string,
  userId: string
): Promise<Partner | null> {
  const partner = await ctx.db
    .query('yourobcPartners')
    .withIndex('by_company_name', (q) => q.eq('companyName', companyName))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first();

  if (!partner) {
    return null;
  }

  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authUserId'), userId))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  const hasAccess = await canViewPartner(ctx, partner, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this partner');
  }

  return partner;
}

/**
 * List partners with access control and filtering
 */
export async function listPartners(
  ctx: QueryCtx,
  userId: string,
  filters?: PartnerListFilters,
  options?: { limit?: number; includeDeleted?: boolean }
): Promise<Partner[]> {
  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authUserId'), userId))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  let query = ctx.db.query('yourobcPartners');

  // Apply filters
  if (filters?.status) {
    query = query.withIndex('by_status', (q) => q.eq('status', filters.status!));
  }

  // Get all partners (we'll filter in memory for complex queries)
  let partners = await query.collect();

  // Filter out deleted unless explicitly requested
  if (!options?.includeDeleted) {
    partners = partners.filter((p) => !p.deletedAt);
  }

  // Apply additional filters
  if (filters?.serviceType) {
    partners = partners.filter((p) => p.serviceType === filters.serviceType);
  }

  if (filters?.country) {
    partners = partners.filter((p) => p.serviceCoverage.countries.includes(filters.country!));
  }

  if (filters?.city) {
    partners = partners.filter((p) => p.serviceCoverage.cities.includes(filters.city!));
  }

  if (filters?.airport) {
    partners = partners.filter((p) => p.serviceCoverage.airports.includes(filters.airport!));
  }

  if (filters?.ranking) {
    partners = partners.filter((p) => p.ranking === filters.ranking);
  }

  if (filters?.minRanking) {
    partners = partners.filter((p) => p.ranking && p.ranking >= filters.minRanking!);
  }

  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    partners = partners.filter(
      (p) =>
        p.companyName.toLowerCase().includes(query) ||
        p.shortName?.toLowerCase().includes(query) ||
        p.partnerCode?.toLowerCase().includes(query)
    );
  }

  if (filters?.tags && filters.tags.length > 0) {
    partners = partners.filter((p) => filters.tags!.some((tag) => p.tags.includes(tag)));
  }

  // Filter by access control
  const accessiblePartners: Partner[] = [];
  for (const partner of partners) {
    const hasAccess = await canViewPartner(ctx, partner, user);
    if (hasAccess) {
      accessiblePartners.push(partner);
    }
  }

  // Apply limit
  if (options?.limit) {
    return accessiblePartners.slice(0, options.limit);
  }

  return accessiblePartners;
}

/**
 * List partners by owner
 */
export async function listPartnersByOwner(
  ctx: QueryCtx,
  ownerId: string,
  userId: string,
  options?: { limit?: number; includeDeleted?: boolean }
): Promise<Partner[]> {
  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authUserId'), userId))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  let partners = await ctx.db
    .query('yourobcPartners')
    .withIndex('by_owner', (q) => q.eq('ownerId', ownerId))
    .collect();

  // Filter out deleted unless explicitly requested
  if (!options?.includeDeleted) {
    partners = partners.filter((p) => !p.deletedAt);
  }

  // Filter by access control
  const accessiblePartners: Partner[] = [];
  for (const partner of partners) {
    const hasAccess = await canViewPartner(ctx, partner, user);
    if (hasAccess) {
      accessiblePartners.push(partner);
    }
  }

  // Apply limit
  if (options?.limit) {
    return accessiblePartners.slice(0, options.limit);
  }

  return accessiblePartners;
}

/**
 * List active partners
 */
export async function listActivePartners(
  ctx: QueryCtx,
  userId: string,
  options?: { limit?: number }
): Promise<Partner[]> {
  return listPartners(ctx, userId, { status: 'active' }, options);
}

/**
 * Search partners by service coverage
 */
export async function searchPartnersByLocation(
  ctx: QueryCtx,
  userId: string,
  location: { country?: string; city?: string; airport?: string },
  options?: { serviceType?: 'OBC' | 'NFO' | 'both'; limit?: number }
): Promise<Partner[]> {
  const filters: PartnerListFilters = {
    status: 'active',
    ...location,
    serviceType: options?.serviceType,
  };

  return listPartners(ctx, userId, filters, { limit: options?.limit });
}

/**
 * Get partners count by status
 */
export async function getPartnersCountByStatus(
  ctx: QueryCtx,
  userId: string
): Promise<{ active: number; inactive: number; suspended: number; total: number }> {
  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authUserId'), userId))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  const allPartners = await ctx.db.query('yourobcPartners').collect();

  const nonDeletedPartners = allPartners.filter((p) => !p.deletedAt);

  // Filter by access control
  const accessiblePartners: Partner[] = [];
  for (const partner of nonDeletedPartners) {
    const hasAccess = await canViewPartner(ctx, partner, user);
    if (hasAccess) {
      accessiblePartners.push(partner);
    }
  }

  return {
    active: accessiblePartners.filter((p) => p.status === 'active').length,
    inactive: accessiblePartners.filter((p) => p.status === 'inactive').length,
    suspended: accessiblePartners.filter((p) => p.status === 'suspended').length,
    total: accessiblePartners.length,
  };
}

/**
 * Get top rated partners
 */
export async function getTopRatedPartners(
  ctx: QueryCtx,
  userId: string,
  options?: { limit?: number; serviceType?: 'OBC' | 'NFO' | 'both' }
): Promise<Partner[]> {
  const partners = await listPartners(
    ctx,
    userId,
    {
      status: 'active',
      serviceType: options?.serviceType,
      minRanking: 4, // 4+ stars
    },
    { limit: options?.limit || 10 }
  );

  // Sort by ranking (descending)
  return partners.sort((a, b) => {
    const rankA = a.ranking || 0;
    const rankB = b.ranking || 0;
    return rankB - rankA;
  });
}

/**
 * Check if partner exists by company name
 */
export async function partnerExistsByCompanyName(
  ctx: QueryCtx,
  companyName: string,
  excludePartnerId?: Id<'yourobcPartners'>
): Promise<boolean> {
  const partner = await ctx.db
    .query('yourobcPartners')
    .withIndex('by_company_name', (q) => q.eq('companyName', companyName))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first();

  if (!partner) {
    return false;
  }

  // If we're checking for update, exclude the current partner
  if (excludePartnerId && partner._id === excludePartnerId) {
    return false;
  }

  return true;
}
