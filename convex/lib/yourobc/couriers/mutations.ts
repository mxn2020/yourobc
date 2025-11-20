// convex/lib/yourobc/couriers/mutations.ts
// convex/yourobc/couriers/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { COURIER_CONSTANTS } from './constants';
import { validateCourierData, generateCourierNumber } from './utils';
import {
  quoteServiceTypeValidator,
  timeEntryTypeValidator,
  courierStatusValidator,
  commissionTypeValidator,
} from '../../../schema/yourobc/base';

const skillsSchema = v.object({
  languages: v.array(v.string()),
  maxCarryWeight: v.optional(v.number()),
  availableServices: v.array(quoteServiceTypeValidator),
  certifications: v.optional(v.array(v.string())),
});

const locationSchema = v.object({
  country: v.string(),
  countryCode: v.string(),
  city: v.optional(v.string()),
});

const timeEntrySchema = v.object({
  type: timeEntryTypeValidator,
  timestamp: v.number(),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export const createCourier = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      userProfileId: v.optional(v.id('userProfiles')),
      authUserId: v.optional(v.string()),
      courierNumber: v.optional(v.string()),
      firstName: v.string(),
      middleName: v.optional(v.string()),
      lastName: v.string(),
      email: v.optional(v.string()),
      phone: v.string(),
      skills: skillsSchema,
      currentLocation: v.optional(locationSchema),
      timezone: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validateCourierData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    if (data.userProfileId) {
      const userProfile = await ctx.db.get(data.userProfileId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
    }

    if (data.authUserId) {
      const existing = await ctx.db
        .query('yourobcCouriers')
        .withIndex('by_authUserId', (q) => q.eq('authUserId', data.authUserId))
        .first();

      if (existing) {
        throw new Error('Courier record already exists for this user');
      }
    }

    let courierNumber = data.courierNumber;
    if (!courierNumber) {
      const existingCouriers = await ctx.db.query('yourobcCouriers').collect();
      courierNumber = generateCourierNumber('courier', existingCouriers.length + 1);
    }

    const existingNumber = await ctx.db
      .query('yourobcCouriers')
      .withIndex('by_courierNumber', (q) => q.eq('courierNumber', courierNumber))
      .first();

    if (existingNumber) {
      throw new Error('Courier number already exists');
    }

    const now = Date.now();

    const courierData = {
      userProfileId: data.userProfileId,
      authUserId: data.authUserId,
      courierNumber,
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || '',
      lastName: data.lastName?.trim() || '',
      email: data.email?.trim(),
      phone: data.phone.trim(),
      status: COURIER_CONSTANTS.STATUS.AVAILABLE,
      isActive: true,
      isOnline: false,
      skills: data.skills,
      currentLocation: data.currentLocation,
      timeEntries: [] as Array<{
        type: 'login' | 'logout';
        timestamp: number;
        location?: string;
        notes?: string;
      }>,
      timezone: data.timezone || COURIER_CONSTANTS.DEFAULT_VALUES.TIMEZONE,
      tags: [],
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    };

    const courierId = await ctx.db.insert('yourobcCouriers', courierData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'courier.created',
      entityType: 'yourobc_courier',
      entityId: courierId,
      entityTitle: `Courier ${courierNumber}`,
      description: `Created courier record for ${data.firstName}${data.middleName ? ' ' + data.middleName : ''} ${data.lastName}`,
      createdAt: now,
    });

    return courierId;
  },
});

export const updateCourier = mutation({
  args: {
    authUserId: v.string(),
    courierId: v.id('yourobcCouriers'),
    data: v.object({
      courierNumber: v.optional(v.string()),
      firstName: v.optional(v.string()),
      middleName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      status: v.optional(courierStatusValidator),
      isActive: v.optional(v.boolean()),
      isOnline: v.optional(v.boolean()),
      skills: v.optional(skillsSchema),
      currentLocation: v.optional(locationSchema),
      timezone: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, courierId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.EDIT);

    const courier = await ctx.db.get(courierId);
    if (!courier) {
      throw new Error('Courier not found');
    }

    const errors = validateCourierData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    if (data.courierNumber && data.courierNumber !== courier.courierNumber) {

      const courierNumber = data.courierNumber;

      const existing = await ctx.db
        .query('yourobcCouriers')
        .withIndex('by_courierNumber', (q) => q.eq('courierNumber', courierNumber))
        .first();

      if (existing && existing._id !== courierId) {
        throw new Error('Courier number already exists');
      }
    }

    const now = Date.now();
    const updateData = {
      ...data,
      updatedAt: now,
    };

    if (data.firstName) updateData.firstName = data.firstName.trim();
    if (data.middleName) updateData.middleName = data.middleName.trim();
    if (data.lastName) updateData.lastName = data.lastName.trim();
    if (data.email) updateData.email = data.email.trim();
    if (data.phone) updateData.phone = data.phone.trim();

    await ctx.db.patch(courierId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'courier.updated',
      entityType: 'yourobc_courier',
      entityId: courierId,
      entityTitle: `Courier ${courier.courierNumber}`,
      description: `Updated courier record`,
      createdAt: now,
    });

    return courierId;
  },
});

export const recordCourierTimeEntry = mutation({
  args: {
    authUserId: v.string(),
    courierId: v.optional(v.id('yourobcCouriers')),
    timeEntry: timeEntrySchema,
  },
  handler: async (ctx, { authUserId, courierId, timeEntry }) => {
    let courier;
    if (courierId) {
      await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.VIEW_TIME_ENTRIES);
      courier = await ctx.db.get(courierId);
    } else {
      courier = await ctx.db
        .query('yourobcCouriers')
        .withIndex('by_authUserId', (q) => q.eq('authUserId', authUserId))
        .first();
    }

    if (!courier) {
      throw new Error('Courier not found');
    }

    const updatedEntries = [...courier.timeEntries, timeEntry];

    await ctx.db.patch(courier._id, {
      timeEntries: updatedEntries,
      updatedAt: Date.now(),
    });

    return courier._id;
  },
});

export const deleteCourier = mutation({
  args: {
    authUserId: v.string(),
    courierId: v.id('yourobcCouriers'),
  },
  handler: async (ctx, { authUserId, courierId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.DELETE);

    const courier = await ctx.db.get(courierId);
    if (!courier) {
      throw new Error('Courier not found');
    }

    const hasShipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_assignedCourier', (q) => q.eq('assignedCourierId', courierId))
      .first();

    if (hasShipments) {
      throw new Error('Cannot delete courier with existing shipments. Deactivate instead.');
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(courierId, {
      deletedAt: now,
      deletedBy: authUserId,
    });
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'courier.deleted',
      entityType: 'yourobc_courier',
      entityId: courierId,
      entityTitle: `Courier ${courier.courierNumber}`,
      description: `Deleted courier record`,
      createdAt: now,
    });

    return courierId;
  },
});

export const createCommission = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      courierId: v.id('yourobcCouriers'),
      shipmentId: v.id('yourobcShipments'),
      type: commissionTypeValidator,
      rate: v.number(),
      baseAmount: v.number(),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.EDIT_COMMISSIONS);

    const { calculateCommission, validateCommissionData } = await import('./utils');
    const commissionAmount = calculateCommission(data.baseAmount, data.rate, data.type);

    const commissionData = {
      ...data,
      commissionAmount,
    };

    const errors = validateCommissionData(commissionData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const existing = await ctx.db
      .query('yourobcCommissions')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', data.shipmentId))
      .first();

    if (existing) {
      throw new Error('Commission already exists for this shipment');
    }

    const now = Date.now();
    const commissionId = await ctx.db.insert('yourobcCommissions', {
      courierId: data.courierId,
      shipmentId: data.shipmentId,
      type: data.type,
      rate: data.rate,
      baseAmount: data.baseAmount,
      commissionAmount,
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    });

    return commissionId;
  },
});

export const markCommissionPaid = mutation({
  args: {
    authUserId: v.string(),
    commissionId: v.id('yourobcCommissions'),
    paymentReference: v.optional(v.string()),
    paymentMethod: v.optional(v.union(
      v.literal('bank_transfer'),
      v.literal('credit_card'),
      v.literal('cash'),
      v.literal('check'),
      v.literal('paypal'),
      v.literal('wire_transfer'),
      v.literal('other'),
    )),
  },
  handler: async (ctx, { authUserId, commissionId, paymentReference, paymentMethod }) => {
    await requirePermission(ctx, authUserId, COURIER_CONSTANTS.PERMISSIONS.EDIT_COMMISSIONS);

    const commission = await ctx.db.get(commissionId);
    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status === 'paid') {
      throw new Error('Commission is already marked as paid');
    }

    const now = Date.now();
    await ctx.db.patch(commissionId, {
      status: 'paid' as const,
      paidDate: now,
      paymentReference,
      paymentMethod,
      updatedAt: now,
    });

    return commissionId;
  },
});