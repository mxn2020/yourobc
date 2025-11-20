// convex/lib/yourobc/couriers/queries.ts
// convex/yourobc/couriers/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { COURIER_CONSTANTS } from './constants';
import { 
  isCourierAvailableForShipment,
  getCourierWorkStatus 
} from './utils';
import { calculateWorkingHours } from '../shared';

export const getCouriers = query({
  args: {
    authUserId: v.string(),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      sortBy: v.optional(v.string()),
      sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
      filters: v.optional(v.object({
        status: v.optional(v.array(v.string())),
        isActive: v.optional(v.boolean()),
        isOnline: v.optional(v.boolean()),
        languages: v.optional(v.array(v.string())),
        services: v.optional(v.array(v.string())),
        location: v.optional(v.array(v.string())),
        search: v.optional(v.string()),
      }))
    }))
  },
  handler: async (ctx, { authUserId, options = {} }) => {
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.VIEW);

    const {
      limit = 50,
      offset = 0,
      sortOrder = 'asc',
      filters = {}
    } = options;

    let couriersQuery = ctx.db.query('yourobcCouriers');

    const { status, isActive, isOnline } = filters;

    if (status?.length) {
      couriersQuery = couriersQuery.filter((q) =>
        q.or(...status.map(s => q.eq(q.field('status'), s)))
      );
    }

    if (isActive !== undefined) {
      couriersQuery = couriersQuery.filter((q) => q.eq(q.field('isActive'), isActive));
    }

    if (isOnline !== undefined) {
      couriersQuery = couriersQuery.filter((q) => q.eq(q.field('isOnline'), isOnline));
    }

    const couriers = await couriersQuery
      .order(sortOrder === 'desc' ? 'desc' : 'asc')
      .collect();

    let filteredCouriers = couriers;

    if (filters.languages?.length) {
      filteredCouriers = filteredCouriers.filter(courier =>
        courier.skills.languages.some(lang => filters.languages!.includes(lang))
      );
    }

    if (filters.services?.length) {
      filteredCouriers = filteredCouriers.filter(courier =>
        courier.skills.availableServices.some(service => filters.services!.includes(service))
      );
    }

    if (filters.location?.length) {
      filteredCouriers = filteredCouriers.filter(courier =>
        courier.currentLocation && filters.location!.includes(courier.currentLocation.countryCode)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredCouriers = filteredCouriers.filter(courier =>
        courier.firstName.toLowerCase().includes(searchTerm) ||
        courier.middleName?.toLowerCase().includes(searchTerm) ||
        courier.lastName.toLowerCase().includes(searchTerm) ||
        courier.courierNumber.toLowerCase().includes(searchTerm) ||
        courier.phone.toLowerCase().includes(searchTerm) ||
        courier.email?.toLowerCase().includes(searchTerm)
      );
    }

    const couriersWithProfiles = await Promise.all(
      filteredCouriers.slice(offset, offset + limit).map(async (courier) => {
        const userProfile = courier.userProfileId ? await ctx.db.get(courier.userProfileId) : null;
        const workStatus = getCourierWorkStatus(courier);
        
        return {
          ...courier,
          userProfile: userProfile ? {
            name: userProfile.name,
            email: userProfile.email,
            avatar: userProfile.avatar,
          } : null,
          workStatus,
        };
      })
    );

    return {
      couriers: couriersWithProfiles,
      total: filteredCouriers.length,
      hasMore: filteredCouriers.length > offset + limit,
    };
  },
});

export const getCourier = query({
  args: {
    courierId: v.optional(v.id('yourobcCouriers')),
    authUserId: v.string()
  },
  handler: async (ctx, { courierId, authUserId }) => {
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.VIEW);

    if (!courierId) {
      return null;
    }

    const courier = await ctx.db.get(courierId);
    if (!courier) {
      throw new Error('Courier not found');
    }

    const userProfile = courier.userProfileId ? await ctx.db.get(courier.userProfileId) : null;
    const workStatus = getCourierWorkStatus(courier);

    return {
      ...courier,
      userProfile: userProfile ? {
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
        role: userProfile.role,
        isActive: userProfile.isActive,
      } : null,
      workStatus,
    };
  },
});

export const getCourierByAuthId = query({
  args: {
    authUserId: v.string(),
    targetAuthUserId: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, targetAuthUserId }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const targetUserId = targetAuthUserId || authUserId;
    
    const courier = await ctx.db
      .query('yourobcCouriers')
      .withIndex('by_authUserId', (q) => q.eq('authUserId', targetUserId))
      .first();

    if (!courier) {
      return null;
    }

    const userProfile = courier.userProfileId ? await ctx.db.get(courier.userProfileId) : null;
    const workStatus = getCourierWorkStatus(courier);

    return {
      ...courier,
      userProfile,
      workStatus,
    };
  },
});

export const getAvailableCouriers = query({
  args: {
    authUserId: v.string(),
    serviceType: v.optional(v.union(v.literal('OBC'), v.literal('NFO'))),
    requiredLanguages: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, serviceType, requiredLanguages, limit = 50 }) => {
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.VIEW);

    const couriers = await ctx.db
      .query('yourobcCouriers')
      .withIndex('by_status', (q) => q.eq('status', COURIER_CONSTANTS.STATUS.AVAILABLE))
      .filter((q) => q.eq(q.field('isActive'), true))
      .take(limit * 2);

    const availableCouriers = couriers.filter(courier =>
      isCourierAvailableForShipment(courier, serviceType || 'OBC', requiredLanguages)
    );

    const couriersWithProfiles = await Promise.all(
      availableCouriers.slice(0, limit).map(async (courier) => {
        const userProfile = courier.userProfileId ? await ctx.db.get(courier.userProfileId) : null;
        
        return {
          ...courier,
          userProfile: userProfile ? {
            name: userProfile.name,
            email: userProfile.email,
          } : null,
        };
      })
    );

    return couriersWithProfiles;
  },
});

export const getCourierStats = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.VIEW);

    const couriers = await ctx.db.query('yourobcCouriers').collect();

    const couriersByLocation = couriers.reduce((acc, courier) => {
      if (courier.currentLocation) {
        const key = courier.currentLocation.country;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      totalCouriers: couriers.length,
      activeCouriers: couriers.filter(c => c.isActive).length,
      onlineCouriers: couriers.filter(c => c.isOnline).length,
      couriersByStatus: {
        available: couriers.filter(c => c.status === COURIER_CONSTANTS.STATUS.AVAILABLE).length,
        busy: couriers.filter(c => c.status === COURIER_CONSTANTS.STATUS.BUSY).length,
        offline: couriers.filter(c => c.status === COURIER_CONSTANTS.STATUS.OFFLINE).length,
      },
      couriersByLocation,
      avgShipmentsPerCourier: 0,
    };

    return stats;
  },
});

export const getCourierTimeEntries = query({
  args: {
    authUserId: v.string(),
    courierId: v.optional(v.id('yourobcCouriers')),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, { authUserId, courierId, dateRange }) => {
    await requireCurrentUser(ctx, authUserId);

    let targetCourierId = courierId;
    if (!targetCourierId) {
      const courier = await ctx.db
        .query('yourobcCouriers')
        .withIndex('by_authUserId', (q) => q.eq('authUserId', authUserId))
        .first();
      
      if (!courier) {
        throw new Error('Courier record not found');
      }
      targetCourierId = courier._id;
    }

    if (targetCourierId !== courierId) {
      await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.VIEW_TIME_ENTRIES);
    }

    const courier = await ctx.db.get(targetCourierId);
    if (!courier) {
      throw new Error('Courier not found');
    }

    let timeEntries = courier.timeEntries;

    if (dateRange) {
      timeEntries = timeEntries.filter(entry =>
        entry.timestamp >= dateRange.start &&
        entry.timestamp <= dateRange.end
      );
    }

    const entriesByDay = timeEntries.reduce((acc, entry) => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      const dayKey = date.getTime();

      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(entry);

      return acc;
    }, {} as Record<number, typeof timeEntries>);

    const dailySummary = Object.entries(entriesByDay).map(([dayKey, entries]) => ({
      date: parseInt(dayKey),
      entries,
      totalHours: calculateWorkingHours(entries),
      isWorkingDay: entries.length > 0,
    }));

    const totalHours = dailySummary.reduce((sum, day) => sum + day.totalHours, 0);

    return {
      timeEntries,
      dailySummary,
      totalHours,
      workStatus: getCourierWorkStatus(courier),
    };
  },
});

export const searchCouriers = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, searchTerm, limit = 20, includeInactive = false }) => {
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.VIEW);

    if (searchTerm.length < 2) {
      return [];
    }

    let couriersQuery = ctx.db.query('yourobcCouriers');
    
    if (!includeInactive) {
      couriersQuery = couriersQuery.filter((q) => q.eq(q.field('isActive'), true));
    }

    const couriers = await couriersQuery.collect();
    const searchLower = searchTerm.toLowerCase();

    const filtered = couriers.filter(courier =>
      courier.firstName.toLowerCase().includes(searchLower) ||
      courier.middleName?.toLowerCase().includes(searchLower) ||
      courier.lastName.toLowerCase().includes(searchLower) ||
      courier.courierNumber.toLowerCase().includes(searchLower) ||
      courier.phone.toLowerCase().includes(searchLower) ||
      courier.email?.toLowerCase().includes(searchLower)
    );

    const couriersWithProfiles = await Promise.all(
      filtered.slice(0, limit).map(async (courier) => {
        const userProfile = courier.userProfileId ? await ctx.db.get(courier.userProfileId) : null;
        const workStatus = getCourierWorkStatus(courier);

        return {
           ...courier,
          userProfile: userProfile ? {
            name: userProfile.name,
            email: userProfile.email,
            avatar: userProfile.avatar,
          } : null,
          workStatus,
        };
      })
    );

    return couriersWithProfiles;
  },
});

export const getCommissions = query({
  args: {
    authUserId: v.string(),
    filters: v.optional(v.object({
      courierId: v.optional(v.id('yourobcCouriers')),
      status: v.optional(v.array(v.string())),
      dateRange: v.optional(v.object({
        start: v.number(),
        end: v.number(),
      })),
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    }))
  },
  handler: async (ctx, { authUserId, filters = {} }) => {
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.VIEW_COMMISSIONS);

    const { limit = 50, offset = 0 } = filters;

    let commissionsQuery;

    if (filters.courierId) {
      const courierId = filters.courierId;
      
      commissionsQuery = ctx.db
        .query('yourobcCommissions')
        .withIndex('by_courier', (q) => q.eq('courierId', courierId));
    } else {
      commissionsQuery = ctx.db.query('yourobcCommissions');
    }

    if (filters.status?.length) {
      commissionsQuery = commissionsQuery.filter((q) =>
        q.or(...filters.status!.map(s => q.eq(q.field('status'), s)))
      );
    }

    let commissions = await commissionsQuery
      .order('desc')
      .collect();

    if (filters.dateRange) {
      commissions = commissions.filter(commission =>
        commission.createdAt >= filters.dateRange!.start &&
        commission.createdAt <= filters.dateRange!.end
      );
    }

    const commissionsWithDetails = await Promise.all(
      commissions.slice(offset, offset + limit).map(async (commission) => {
        const courier = await ctx.db.get(commission.courierId);
        const shipment = await ctx.db.get(commission.shipmentId);
        const userProfile = courier && courier.userProfileId ? await ctx.db.get(courier.userProfileId) : null;

        return {
          ...commission,
          courier: courier ? {
            ...courier,
            userProfile: userProfile ? {
              name: userProfile.name,
              email: userProfile.email,
            } : null,
          } : null,
          shipment: shipment ? {
            shipmentNumber: shipment.shipmentNumber,
            customerId: shipment.customerId,
          } : null,
        };
      })
    );

    return {
      commissions: commissionsWithDetails,
      total: commissions.length,
      hasMore: commissions.length > offset + limit,
    };
  },
});

export const getCourierCommissions = query({
  args: {
    authUserId: v.string(),
    courierId: v.optional(v.id('yourobcCouriers')),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, { authUserId, courierId, dateRange }) => {
    await requireCurrentUser(ctx, authUserId);

    let targetCourierId = courierId;
    if (!targetCourierId) {
      const courier = await ctx.db
        .query('yourobcCouriers')
        .withIndex('by_authUserId', (q) => q.eq('authUserId', authUserId))
        .first();
      
      if (!courier) {
        throw new Error('Courier record not found');
      }
      targetCourierId = courier._id;
    }

    let commissionsQuery = ctx.db
      .query('yourobcCommissions')
      .withIndex('by_courier', (q) => q.eq('courierId', targetCourierId));

    let commissions = await commissionsQuery.collect();

    if (dateRange) {
      commissions = commissions.filter(commission =>
        commission.createdAt >= dateRange.start &&
        commission.createdAt <= dateRange.end
      );
    }

    const totalPending = commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commissionAmount, 0);

    const totalPaid = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commissionAmount, 0);

    return {
      commissions,
      summary: {
        totalCommissions: commissions.length,
        totalPending,
        totalPaid,
        totalEarnings: totalPending + totalPaid,
      },
    };
  },
});