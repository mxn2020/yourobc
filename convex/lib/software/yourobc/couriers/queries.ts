// convex/lib/software/yourobc/couriers/queries.ts
// Read operations for couriers module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { couriersValidators } from '@/schema/software/yourobc/couriers/validators';
import { filterCouriersByAccess, requireViewCourierAccess } from './permissions';
import type { CourierListResponse, CourierStatsResponse } from './types';

/**
 * Get paginated list of couriers with filtering
 */
export const getCouriers = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(
      v.object({
        status: v.optional(v.array(couriersValidators.status)),
        serviceTypes: v.optional(v.array(couriersValidators.serviceType)),
        deliverySpeeds: v.optional(v.array(couriersValidators.deliverySpeed)),
        pricingModel: v.optional(v.array(couriersValidators.pricingModel)),
        search: v.optional(v.string()),
        country: v.optional(v.string()),
        isPreferred: v.optional(v.boolean()),
        isActive: v.optional(v.boolean()),
        hasApiIntegration: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args): Promise<CourierListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with deletedAt filter
    let couriers = await ctx.db
      .query('yourobcCouriers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    couriers = await filterCouriersByAccess(ctx, couriers, user);

    // Apply status filter
    if (filters.status?.length) {
      couriers = couriers.filter((item) => filters.status!.includes(item.status));
    }

    // Apply service types filter
    if (filters.serviceTypes?.length) {
      couriers = couriers.filter((item) =>
        filters.serviceTypes!.some((st) => item.serviceTypes.includes(st))
      );
    }

    // Apply delivery speeds filter
    if (filters.deliverySpeeds?.length) {
      couriers = couriers.filter((item) =>
        filters.deliverySpeeds!.some((ds) => item.deliverySpeeds.includes(ds))
      );
    }

    // Apply pricing model filter
    if (filters.pricingModel?.length) {
      couriers = couriers.filter((item) => filters.pricingModel!.includes(item.pricingModel));
    }

    // Apply preferred filter
    if (filters.isPreferred !== undefined) {
      couriers = couriers.filter((item) => item.isPreferred === filters.isPreferred);
    }

    // Apply active filter
    if (filters.isActive !== undefined) {
      couriers = couriers.filter((item) => item.isActive === filters.isActive);
    }

    // Apply API integration filter
    if (filters.hasApiIntegration !== undefined) {
      couriers = couriers.filter(
        (item) => item.apiIntegration?.enabled === filters.hasApiIntegration
      );
    }

    // Apply country filter
    if (filters.country) {
      const countryCode = filters.country.toUpperCase();
      couriers = couriers.filter((item) => item.serviceCoverage.countries.includes(countryCode));
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      couriers = couriers.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.shortName && item.shortName.toLowerCase().includes(term)) ||
          (item.email && item.email.toLowerCase().includes(term)) ||
          (item.notes && item.notes.toLowerCase().includes(term))
      );
    }

    // Sort by preferred, then active, then name
    couriers.sort((a, b) => {
      if (a.isPreferred !== b.isPreferred) {
        return a.isPreferred ? -1 : 1;
      }
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    // Paginate
    const total = couriers.length;
    const items = couriers.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single courier by ID
 */
export const getCourier = query({
  args: {
    courierId: v.id('yourobcCouriers'),
  },
  handler: async (ctx, { courierId }) => {
    const user = await requireCurrentUser(ctx);

    const courier = await ctx.db.get(courierId);
    if (!courier || courier.deletedAt) {
      throw new Error('Courier not found');
    }

    await requireViewCourierAccess(ctx, courier, user);

    return courier;
  },
});

/**
 * Get courier by public ID
 */
export const getCourierByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const courier = await ctx.db
      .query('yourobcCouriers')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!courier) {
      throw new Error('Courier not found');
    }

    await requireViewCourierAccess(ctx, courier, user);

    return courier;
  },
});

/**
 * Get courier by name
 */
export const getCourierByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const user = await requireCurrentUser(ctx);

    const courier = await ctx.db
      .query('yourobcCouriers')
      .withIndex('by_name', (q) => q.eq('name', name))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!courier) {
      throw new Error('Courier not found');
    }

    await requireViewCourierAccess(ctx, courier, user);

    return courier;
  },
});

/**
 * Get preferred couriers
 */
export const getPreferredCouriers = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    let couriers = await ctx.db
      .query('yourobcCouriers')
      .withIndex('by_isPreferred', (q) => q.eq('isPreferred', true))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    couriers = await filterCouriersByAccess(ctx, couriers, user);

    // Filter active only
    couriers = couriers.filter((c) => c.status === 'active' && c.isActive);

    // Sort by name
    couriers.sort((a, b) => a.name.localeCompare(b.name));

    return couriers;
  },
});

/**
 * Get couriers by service type
 */
export const getCouriersByServiceType = query({
  args: {
    serviceType: couriersValidators.serviceType,
  },
  handler: async (ctx, { serviceType }) => {
    const user = await requireCurrentUser(ctx);

    let couriers = await ctx.db
      .query('yourobcCouriers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    couriers = await filterCouriersByAccess(ctx, couriers, user);

    // Filter by service type
    couriers = couriers.filter((c) => c.serviceTypes.includes(serviceType));

    // Filter active only
    couriers = couriers.filter((c) => c.status === 'active' && c.isActive);

    // Sort by preferred, then name
    couriers.sort((a, b) => {
      if (a.isPreferred !== b.isPreferred) {
        return a.isPreferred ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return couriers;
  },
});

/**
 * Get couriers covering a country
 */
export const getCouriersByCountry = query({
  args: {
    countryCode: v.string(),
  },
  handler: async (ctx, { countryCode }) => {
    const user = await requireCurrentUser(ctx);

    let couriers = await ctx.db
      .query('yourobcCouriers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    couriers = await filterCouriersByAccess(ctx, couriers, user);

    // Filter by country coverage
    const upperCountryCode = countryCode.toUpperCase();
    couriers = couriers.filter((c) => c.serviceCoverage.countries.includes(upperCountryCode));

    // Filter active only
    couriers = couriers.filter((c) => c.status === 'active' && c.isActive);

    // Sort by preferred, then name
    couriers.sort((a, b) => {
      if (a.isPreferred !== b.isPreferred) {
        return a.isPreferred ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return couriers;
  },
});

/**
 * Get courier statistics
 */
export const getCourierStats = query({
  args: {},
  handler: async (ctx): Promise<CourierStatsResponse> => {
    const user = await requireCurrentUser(ctx);

    let couriers = await ctx.db
      .query('yourobcCouriers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterCouriersByAccess(ctx, couriers, user);

    // Calculate stats
    const byStatus = {
      active: accessible.filter((c) => c.status === 'active').length,
      inactive: accessible.filter((c) => c.status === 'inactive').length,
      archived: accessible.filter((c) => c.status === 'archived').length,
    };

    const byServiceType: Record<string, number> = {};
    accessible.forEach((c) => {
      c.serviceTypes.forEach((st) => {
        byServiceType[st] = (byServiceType[st] || 0) + 1;
      });
    });

    const byPricingModel: Record<string, number> = {};
    accessible.forEach((c) => {
      byPricingModel[c.pricingModel] = (byPricingModel[c.pricingModel] || 0) + 1;
    });

    const withApiIntegration = accessible.filter((c) => c.apiIntegration?.enabled).length;
    const preferredCouriers = accessible.filter((c) => c.isPreferred).length;
    const activeCouriers = accessible.filter((c) => c.isActive).length;

    // Calculate average reliability score
    const reliabilityScores = accessible
      .map((c) => c.metrics?.reliabilityScore)
      .filter((score): score is number => score !== undefined);
    const averageReliabilityScore =
      reliabilityScores.length > 0
        ? reliabilityScores.reduce((sum, score) => sum + score, 0) / reliabilityScores.length
        : 0;

    // Calculate average on-time rate
    const onTimeRates = accessible
      .map((c) => c.metrics?.onTimeDeliveryRate)
      .filter((rate): rate is number => rate !== undefined);
    const averageOnTimeRate =
      onTimeRates.length > 0
        ? onTimeRates.reduce((sum, rate) => sum + rate, 0) / onTimeRates.length
        : 0;

    return {
      total: accessible.length,
      byStatus,
      byServiceType,
      byPricingModel,
      withApiIntegration,
      preferredCouriers,
      activeCouriers,
      averageReliabilityScore: Math.round(averageReliabilityScore * 100) / 100,
      averageOnTimeRate: Math.round(averageOnTimeRate * 100) / 100,
    };
  },
});
