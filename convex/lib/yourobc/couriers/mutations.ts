// convex/lib/yourobc/couriers/mutations.ts
// Write operations for couriers module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { couriersValidators } from '@/schema/yourobc/couriers/validators';
import { currencyValidator } from '@/schema/base';
import { COURIERS_CONSTANTS } from './constants';
import { validateCourierData, trimCourierData, buildSearchableText } from './utils';
import {
  requireEditCourierAccess,
  requireDeleteCourierAccess,
  canEditCourier,
  canDeleteCourier,
} from './permissions';
import type { Courier, CourierId, UpdateCourierData } from './types';
import { baseFields } from '@/schema/base.validators';

type CourierUpdatePatch = Partial<UpdateCourierData> & Pick<Courier, 'updatedAt' | 'updatedBy'>;

/**
 * Create new courier
 * 🔒 Authentication: Required
 * 🔒 Authorization: User with CREATE permission
 */
export const createCourier = mutation({
  args: {
    data: v.object({
      name: v.string(),
      shortName: v.optional(v.string()),
      website: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      primaryContact: baseFields.contact,
      additionalContacts: v.optional(v.array(baseFields.contact)),
      headquartersAddress: v.optional(baseFields.address),
      serviceCoverage: v.object({
        countries: v.array(v.string()),
        regions: v.optional(v.array(v.string())),
        cities: v.optional(v.array(v.string())),
        airports: v.optional(v.array(v.string())),
      }),
      serviceTypes: v.array(couriersValidators.serviceType),
      deliverySpeeds: v.array(couriersValidators.deliverySpeed),
      maxWeightKg: v.optional(v.number()),
      maxDimensionsCm: v.optional(
        v.object({
          length: v.number(),
          width: v.number(),
          height: v.number(),
        })
      ),
      handlesHazmat: v.optional(v.boolean()),
      handlesRefrigerated: v.optional(v.boolean()),
      handlesFragile: v.optional(v.boolean()),
      pricingModel: couriersValidators.pricingModel,
      defaultCurrency: currencyValidator,
      costStructure: v.optional(
        v.object({
          baseFee: v.optional(v.number()),
          perKgRate: v.optional(v.number()),
          perKmRate: v.optional(v.number()),
          fuelSurcharge: v.optional(v.number()),
          handlingFee: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      ),
      deliveryTimes: v.optional(
        v.object({
          standardDomestic: v.optional(v.string()),
          standardInternational: v.optional(v.string()),
          expressDomestic: v.optional(v.string()),
          expressInternational: v.optional(v.string()),
          notes: v.optional(v.string()),
        })
      ),
      apiIntegration: v.optional(
        v.object({
          enabled: v.boolean(),
          apiType: couriersValidators.apiType,
          baseUrl: v.optional(v.string()),
          apiVersion: v.optional(v.string()),
          hasTracking: v.optional(v.boolean()),
          hasRateQuotes: v.optional(v.boolean()),
          hasLabelGeneration: v.optional(v.boolean()),
          notes: v.optional(v.string()),
        })
      ),
      apiCredentials: v.optional(
        v.object({
          apiKey: v.optional(v.string()),
          apiSecret: v.optional(v.string()),
          accountNumber: v.optional(v.string()),
          username: v.optional(v.string()),
          password: v.optional(v.string()),
          additionalFields: v.optional(v.object({})),
        })
      ),
      metrics: v.optional(
        v.object({
          reliabilityScore: v.optional(v.number()),
          onTimeDeliveryRate: v.optional(v.number()),
          averageTransitDays: v.optional(v.number()),
          lastUpdated: v.optional(v.number()),
        })
      ),
      status: v.optional(couriersValidators.status),
      isPreferred: v.optional(v.boolean()),
      isActive: v.optional(v.boolean()),
      notes: v.optional(v.string()),
      internalNotes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.object({})),
    }),
  },
  handler: async (ctx, { data }): Promise<CourierId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, COURIERS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. TRIM: Trim string fields first
    const trimmedData = trimCourierData(data);

    // 4. VALIDATE: Check data validity
    const errors = validateCourierData(trimmedData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcCouriers');
    const now = Date.now();

    // Build searchable text
    const searchableText = buildSearchableText(trimmedData);

    // 6. CREATE: Insert into database
    const courierId = await ctx.db.insert('yourobcCouriers', {
      publicId,
      searchableText,
      name: trimmedData.name,
      shortName: trimmedData.shortName,
      website: trimmedData.website,
      email: trimmedData.email,
      phone: trimmedData.phone,
      primaryContact: trimmedData.primaryContact || data.primaryContact,
      additionalContacts: trimmedData.additionalContacts || data.additionalContacts || [],
      headquartersAddress: data.headquartersAddress,
      serviceCoverage: data.serviceCoverage,
      serviceTypes: data.serviceTypes,
      deliverySpeeds: data.deliverySpeeds,
      maxWeightKg: data.maxWeightKg,
      maxDimensionsCm: data.maxDimensionsCm,
      handlesHazmat: data.handlesHazmat,
      handlesRefrigerated: data.handlesRefrigerated,
      handlesFragile: data.handlesFragile,
      pricingModel: data.pricingModel,
      defaultCurrency: data.defaultCurrency,
      costStructure: data.costStructure,
      deliveryTimes: data.deliveryTimes,
      apiIntegration: data.apiIntegration,
      apiCredentials: data.apiCredentials,
      metrics: data.metrics,
      status: trimmedData.status || 'active',
      isPreferred: data.isPreferred || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      notes: trimmedData.notes,
      internalNotes: trimmedData.internalNotes,
      tags: trimmedData.tags || [],
      category: data.category,
      customFields: data.customFields,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'couriers.created',
      entityType: 'yourobcCouriers',
      entityId: publicId,
      entityTitle: trimmedData.name,
      description: `Created courier: ${trimmedData.name}`,
      metadata: {
        status: trimmedData.status || 'active',
        serviceTypes: data.serviceTypes,
        pricingModel: data.pricingModel,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return courierId;
  },
});

/**
 * Update existing courier
 */
export const updateCourier = mutation({
  args: {
    courierId: v.id('yourobcCouriers'),
    updates: v.object({
      name: v.optional(v.string()),
      shortName: v.optional(v.string()),
      website: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      primaryContact: v.optional(baseFields.contact),
      additionalContacts: v.optional(v.array(baseFields.contact)),
      headquartersAddress: v.optional(baseFields.address),
      serviceCoverage: v.optional(
        v.object({
          countries: v.array(v.string()),
          regions: v.optional(v.array(v.string())),
          cities: v.optional(v.array(v.string())),
          airports: v.optional(v.array(v.string())),
        })
      ),
      serviceTypes: v.optional(v.array(couriersValidators.serviceType)),
      deliverySpeeds: v.optional(v.array(couriersValidators.deliverySpeed)),
      maxWeightKg: v.optional(v.number()),
      maxDimensionsCm: v.optional(
        v.object({
          length: v.number(),
          width: v.number(),
          height: v.number(),
        })
      ),
      handlesHazmat: v.optional(v.boolean()),
      handlesRefrigerated: v.optional(v.boolean()),
      handlesFragile: v.optional(v.boolean()),
      pricingModel: v.optional(couriersValidators.pricingModel),
      defaultCurrency: v.optional(currencyValidator),
      costStructure: v.optional(
        v.object({
          baseFee: v.optional(v.number()),
          perKgRate: v.optional(v.number()),
          perKmRate: v.optional(v.number()),
          fuelSurcharge: v.optional(v.number()),
          handlingFee: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      ),
      deliveryTimes: v.optional(
        v.object({
          standardDomestic: v.optional(v.string()),
          standardInternational: v.optional(v.string()),
          expressDomestic: v.optional(v.string()),
          expressInternational: v.optional(v.string()),
          notes: v.optional(v.string()),
        })
      ),
      apiIntegration: v.optional(
        v.object({
          enabled: v.boolean(),
          apiType: couriersValidators.apiType,
          baseUrl: v.optional(v.string()),
          apiVersion: v.optional(v.string()),
          hasTracking: v.optional(v.boolean()),
          hasRateQuotes: v.optional(v.boolean()),
          hasLabelGeneration: v.optional(v.boolean()),
          notes: v.optional(v.string()),
        })
      ),
      apiCredentials: v.optional(
        v.object({
          apiKey: v.optional(v.string()),
          apiSecret: v.optional(v.string()),
          accountNumber: v.optional(v.string()),
          username: v.optional(v.string()),
          password: v.optional(v.string()),
          additionalFields: v.optional(v.object({})),
        })
      ),
      metrics: v.optional(
        v.object({
          reliabilityScore: v.optional(v.number()),
          onTimeDeliveryRate: v.optional(v.number()),
          averageTransitDays: v.optional(v.number()),
          lastUpdated: v.optional(v.number()),
        })
      ),
      status: v.optional(couriersValidators.status),
      isPreferred: v.optional(v.boolean()),
      isActive: v.optional(v.boolean()),
      notes: v.optional(v.string()),
      internalNotes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.object({})),
    }),
  },
  handler: async (ctx, { courierId, updates }): Promise<CourierId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const courier = await ctx.db.get(courierId);
    if (!courier || courier.deletedAt) {
      throw new Error('Courier not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditCourierAccess(ctx, courier, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateCourierData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: CourierUpdatePatch = {
      updatedAt: now,
      updatedBy: user._id,
    };

    // Trim and assign string fields
    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.shortName !== undefined) {
      updateData.shortName = updates.shortName?.trim();
    }
    if (updates.website !== undefined) {
      updateData.website = updates.website?.trim();
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email?.trim();
    }
    if (updates.phone !== undefined) {
      updateData.phone = updates.phone?.trim();
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes?.trim();
    }
    if (updates.internalNotes !== undefined) {
      updateData.internalNotes = updates.internalNotes?.trim();
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map((tag) => tag.trim());
    }
  if (updates.primaryContact !== undefined) {
    updateData.primaryContact = {
      ...updates.primaryContact,
      role: updates.primaryContact.role as any,
      name: updates.primaryContact.name.trim(),
      email: updates.primaryContact.email?.trim(),
      phone: updates.primaryContact.phone?.trim(),
    } as any;
  }
    if (updates.additionalContacts !== undefined) {
      updateData.additionalContacts = updates.additionalContacts.map((contact) => ({
        ...contact,
        name: contact.name.trim(),
        email: contact.email?.trim(),
        phone: contact.phone?.trim(),
      }));
    }
    if (updates.serviceCoverage !== undefined) {
      updateData.serviceCoverage = {
        countries: updates.serviceCoverage.countries.map((c) => c.trim().toUpperCase()),
        regions: updates.serviceCoverage.regions?.map((r) => r.trim()),
        cities: updates.serviceCoverage.cities?.map((c) => c.trim()),
        airports: updates.serviceCoverage.airports?.map((a) => a.trim().toUpperCase()),
      };
    }

    // Assign other fields
    if (updates.headquartersAddress !== undefined) updateData.headquartersAddress = updates.headquartersAddress;
    if (updates.serviceTypes !== undefined) updateData.serviceTypes = updates.serviceTypes;
    if (updates.deliverySpeeds !== undefined) updateData.deliverySpeeds = updates.deliverySpeeds;
    if (updates.maxWeightKg !== undefined) updateData.maxWeightKg = updates.maxWeightKg;
    if (updates.maxDimensionsCm !== undefined) updateData.maxDimensionsCm = updates.maxDimensionsCm;
    if (updates.handlesHazmat !== undefined) updateData.handlesHazmat = updates.handlesHazmat;
    if (updates.handlesRefrigerated !== undefined) updateData.handlesRefrigerated = updates.handlesRefrigerated;
    if (updates.handlesFragile !== undefined) updateData.handlesFragile = updates.handlesFragile;
    if (updates.pricingModel !== undefined) updateData.pricingModel = updates.pricingModel;
    if (updates.defaultCurrency !== undefined) updateData.defaultCurrency = updates.defaultCurrency;
    if (updates.costStructure !== undefined) updateData.costStructure = updates.costStructure;
    if (updates.deliveryTimes !== undefined) updateData.deliveryTimes = updates.deliveryTimes;
    if (updates.apiIntegration !== undefined) updateData.apiIntegration = updates.apiIntegration;
    if (updates.apiCredentials !== undefined) updateData.apiCredentials = updates.apiCredentials;
    if (updates.metrics !== undefined) updateData.metrics = updates.metrics;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.isPreferred !== undefined) updateData.isPreferred = updates.isPreferred;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.customFields !== undefined) updateData.customFields = updates.customFields;

    // 6. UPDATE: Apply changes
    await ctx.db.patch(courierId, updateData as any);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'couriers.updated',
      entityType: 'yourobcCouriers',
      entityId: courier.publicId,
      entityTitle: updateData.name || courier.name,
      description: `Updated courier: ${updateData.name || courier.name}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return courierId;
  },
});

/**
 * Delete courier (soft delete)
 */
export const deleteCourier = mutation({
  args: {
    courierId: v.id('yourobcCouriers'),
  },
  handler: async (ctx, { courierId }): Promise<CourierId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const courier = await ctx.db.get(courierId);
    if (!courier || courier.deletedAt) {
      throw new Error('Courier not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteCourierAccess(courier, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(courierId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'couriers.deleted',
      entityType: 'yourobcCouriers',
      entityId: courier.publicId,
      entityTitle: courier.name,
      description: `Deleted courier: ${courier.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return courierId;
  },
});

/**
 * Restore soft-deleted courier
 */
export const restoreCourier = mutation({
  args: {
    courierId: v.id('yourobcCouriers'),
  },
  handler: async (ctx, { courierId }): Promise<CourierId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const courier = await ctx.db.get(courierId);
    if (!courier) {
      throw new Error('Courier not found');
    }
    if (!courier.deletedAt) {
      throw new Error('Courier is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      courier.ownerId !== user.authUserId &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this courier');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(courierId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'couriers.restored',
      entityType: 'yourobcCouriers',
      entityId: courier.publicId,
      entityTitle: courier.name,
      description: `Restored courier: ${courier.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return courierId;
  },
});

/**
 * Archive courier (status-based soft delete alternative)
 */
export const archiveCourier = mutation({
  args: {
    courierId: v.id('yourobcCouriers'),
  },
  handler: async (ctx, { courierId }): Promise<CourierId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const courier = await ctx.db.get(courierId);
    if (!courier || courier.deletedAt) {
      throw new Error('Courier not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditCourierAccess(ctx, courier, user);

    // 4. ARCHIVE: Update status
    const now = Date.now();
    await ctx.db.patch(courierId, {
      status: 'archived',
      isActive: false,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'couriers.archived',
      entityType: 'yourobcCouriers',
      entityId: courier.publicId,
      entityTitle: courier.name,
      description: `Archived courier: ${courier.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return courierId;
  },
});

/**
 * Bulk update multiple couriers
 */
export const bulkUpdateCouriers = mutation({
  args: {
    courierIds: v.array(v.id('yourobcCouriers')),
    updates: v.object({
      status: v.optional(couriersValidators.status),
      isPreferred: v.optional(v.boolean()),
      isActive: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { courierIds, updates }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check bulk edit permission
    await requirePermission(ctx, COURIERS_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check update data
    const errors = validateCourierData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const results: { id: (typeof courierIds)[number]; success: boolean }[] = [];
    const failed: { id: (typeof courierIds)[number]; reason: string }[] = [];

    // 4. PROCESS: Update each entity
    for (const courierId of courierIds) {
      try {
        const courier = await ctx.db.get(courierId);
        if (!courier || courier.deletedAt) {
          failed.push({ id: courierId, reason: 'Not found' });
          continue;
        }

        // Check individual edit access
        const canEdit = await canEditCourier(ctx, courier, user);
        if (!canEdit) {
          failed.push({ id: courierId, reason: 'No permission' });
          continue;
        }

        // Apply updates
        const updateData: CourierUpdatePatch = {
          updatedAt: now,
          updatedBy: user._id,
        };

        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.isPreferred !== undefined) updateData.isPreferred = updates.isPreferred;
        if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
        if (updates.tags !== undefined) {
          updateData.tags = updates.tags.map((tag) => tag.trim());
        }

        await ctx.db.patch(courierId, updateData as any);
        results.push({ id: courierId, success: true });
      } catch (error: any) {
        failed.push({ id: courierId, reason: error.message });
      }
    }

    // 5. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'couriers.bulk_updated',
      entityType: 'yourobcCouriers',
      entityId: 'bulk',
      entityTitle: `${results.length} couriers`,
      description: `Bulk updated ${results.length} couriers`,
      metadata: {
        successful: results.length,
        failed: failed.length,
        updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return results summary
    return {
      updated: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});

/**
 * Bulk delete multiple couriers (soft delete)
 */
export const bulkDeleteCouriers = mutation({
  args: {
    courierIds: v.array(v.id('yourobcCouriers')),
  },
  handler: async (ctx, { courierIds }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check delete permission
    await requirePermission(ctx, COURIERS_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const results: { id: (typeof courierIds)[number]; success: boolean }[] = [];
    const failed: { id: (typeof courierIds)[number]; reason: string }[] = [];

    // 3. PROCESS: Delete each entity
    for (const courierId of courierIds) {
      try {
        const courier = await ctx.db.get(courierId);
        if (!courier || courier.deletedAt) {
          failed.push({ id: courierId, reason: 'Not found' });
          continue;
        }

        // Check individual delete access
        const canDelete = await canDeleteCourier(courier, user);
        if (!canDelete) {
          failed.push({ id: courierId, reason: 'No permission' });
          continue;
        }

        // Soft delete
        await ctx.db.patch(courierId, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });

        results.push({ id: courierId, success: true });
      } catch (error: any) {
        failed.push({ id: courierId, reason: error.message });
      }
    }

    // 4. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'couriers.bulk_deleted',
      entityType: 'yourobcCouriers',
      entityId: 'bulk',
      entityTitle: `${results.length} couriers`,
      description: `Bulk deleted ${results.length} couriers`,
      metadata: {
        successful: results.length,
        failed: failed.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 5. RETURN: Return results summary
    return {
      deleted: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});
