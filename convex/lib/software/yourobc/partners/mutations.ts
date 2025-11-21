// convex/lib/software/yourobc/partners/mutations.ts
// Write operations for partners module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { partnersValidators } from '@/schema/software/yourobc/partners/validators';
import { partnerServiceTypeValidator, currencyValidator, addressSchema, contactSchema, serviceCoverageSchema } from '@/schema/yourobc/base';
import { PARTNERS_CONSTANTS } from './constants';
import { validatePartnerData } from './utils';
import { requireEditPartnerAccess, requireDeletePartnerAccess, canEditPartner, canDeletePartner } from './permissions';
import type { PartnerId } from './types';

/**
 * Create new partner
 */
export const createPartner = mutation({
  args: {
    data: v.object({
      companyName: v.string(),
      shortName: v.optional(v.string()),
      partnerCode: v.optional(v.string()),
      primaryContact: contactSchema,
      quotingEmail: v.optional(v.string()),
      address: addressSchema,
      serviceCoverage: serviceCoverageSchema,
      serviceType: partnerServiceTypeValidator,
      preferredCurrency: currencyValidator,
      paymentTerms: v.number(),
      ranking: v.optional(v.number()),
      rankingNotes: v.optional(v.string()),
      internalPaymentNotes: v.optional(v.string()),
      serviceCapabilities: v.optional(v.object({
        handlesCustoms: v.optional(v.boolean()),
        handlesPickup: v.optional(v.boolean()),
        handlesDelivery: v.optional(v.boolean()),
        handlesNFO: v.optional(v.boolean()),
        handlesTrucking: v.optional(v.boolean()),
      })),
      commissionRate: v.optional(v.number()),
      apiEnabled: v.optional(v.boolean()),
      apiKey: v.optional(v.string()),
      apiEndpoint: v.optional(v.string()),
      status: v.optional(partnersValidators.status),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<PartnerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, PARTNERS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validatePartnerData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcPartners');
    const now = Date.now();

    // 5. CREATE: Insert into database
    const partnerId = await ctx.db.insert('yourobcPartners', {
      publicId,
      companyName: data.companyName.trim(),
      shortName: data.shortName?.trim(),
      partnerCode: data.partnerCode?.trim(),
      primaryContact: data.primaryContact,
      quotingEmail: data.quotingEmail?.trim(),
      address: data.address,
      serviceCoverage: data.serviceCoverage,
      serviceType: data.serviceType,
      preferredCurrency: data.preferredCurrency,
      paymentTerms: data.paymentTerms,
      ranking: data.ranking,
      rankingNotes: data.rankingNotes?.trim(),
      internalPaymentNotes: data.internalPaymentNotes?.trim(),
      serviceCapabilities: data.serviceCapabilities,
      commissionRate: data.commissionRate,
      apiEnabled: data.apiEnabled,
      apiKey: data.apiKey?.trim(),
      apiEndpoint: data.apiEndpoint?.trim(),
      status: data.status || 'active',
      notes: data.notes?.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'partners.created',
      entityType: 'system_partners',
      entityId: publicId,
      entityTitle: data.companyName.trim(),
      description: `Created partner: ${data.companyName.trim()}`,
      metadata: {
        status: data.status || 'active',
        serviceType: data.serviceType,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return partnerId;
  },
});

/**
 * Update existing partner
 */
export const updatePartner = mutation({
  args: {
    partnerId: v.id('yourobcPartners'),
    updates: v.object({
      companyName: v.optional(v.string()),
      shortName: v.optional(v.string()),
      partnerCode: v.optional(v.string()),
      primaryContact: v.optional(contactSchema),
      quotingEmail: v.optional(v.string()),
      address: v.optional(addressSchema),
      serviceCoverage: v.optional(serviceCoverageSchema),
      serviceType: v.optional(partnerServiceTypeValidator),
      preferredCurrency: v.optional(currencyValidator),
      paymentTerms: v.optional(v.number()),
      ranking: v.optional(v.number()),
      rankingNotes: v.optional(v.string()),
      internalPaymentNotes: v.optional(v.string()),
      serviceCapabilities: v.optional(v.object({
        handlesCustoms: v.optional(v.boolean()),
        handlesPickup: v.optional(v.boolean()),
        handlesDelivery: v.optional(v.boolean()),
        handlesNFO: v.optional(v.boolean()),
        handlesTrucking: v.optional(v.boolean()),
      })),
      commissionRate: v.optional(v.number()),
      apiEnabled: v.optional(v.boolean()),
      apiKey: v.optional(v.string()),
      apiEndpoint: v.optional(v.string()),
      status: v.optional(partnersValidators.status),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { partnerId, updates }): Promise<PartnerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const partner = await ctx.db.get(partnerId);
    if (!partner || partner.deletedAt) {
      throw new Error('Partner not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditPartnerAccess(ctx, partner, user);

    // 4. VALIDATE: Check update data validity
    const errors = validatePartnerData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.companyName !== undefined) {
      updateData.companyName = updates.companyName.trim();
    }
    if (updates.shortName !== undefined) {
      updateData.shortName = updates.shortName?.trim();
    }
    if (updates.partnerCode !== undefined) {
      updateData.partnerCode = updates.partnerCode?.trim();
    }
    if (updates.primaryContact !== undefined) {
      updateData.primaryContact = updates.primaryContact;
    }
    if (updates.quotingEmail !== undefined) {
      updateData.quotingEmail = updates.quotingEmail?.trim();
    }
    if (updates.address !== undefined) {
      updateData.address = updates.address;
    }
    if (updates.serviceCoverage !== undefined) {
      updateData.serviceCoverage = updates.serviceCoverage;
    }
    if (updates.serviceType !== undefined) {
      updateData.serviceType = updates.serviceType;
    }
    if (updates.preferredCurrency !== undefined) {
      updateData.preferredCurrency = updates.preferredCurrency;
    }
    if (updates.paymentTerms !== undefined) {
      updateData.paymentTerms = updates.paymentTerms;
    }
    if (updates.ranking !== undefined) {
      updateData.ranking = updates.ranking;
    }
    if (updates.rankingNotes !== undefined) {
      updateData.rankingNotes = updates.rankingNotes?.trim();
    }
    if (updates.internalPaymentNotes !== undefined) {
      updateData.internalPaymentNotes = updates.internalPaymentNotes?.trim();
    }
    if (updates.serviceCapabilities !== undefined) {
      updateData.serviceCapabilities = updates.serviceCapabilities;
    }
    if (updates.commissionRate !== undefined) {
      updateData.commissionRate = updates.commissionRate;
    }
    if (updates.apiEnabled !== undefined) {
      updateData.apiEnabled = updates.apiEnabled;
    }
    if (updates.apiKey !== undefined) {
      updateData.apiKey = updates.apiKey?.trim();
    }
    if (updates.apiEndpoint !== undefined) {
      updateData.apiEndpoint = updates.apiEndpoint?.trim();
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes?.trim();
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(partnerId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'partners.updated',
      entityType: 'system_partners',
      entityId: partner.publicId,
      entityTitle: updateData.companyName || partner.companyName,
      description: `Updated partner: ${updateData.companyName || partner.companyName}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return partnerId;
  },
});

/**
 * Delete partner (soft delete)
 */
export const deletePartner = mutation({
  args: {
    partnerId: v.id('yourobcPartners'),
  },
  handler: async (ctx, { partnerId }): Promise<PartnerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const partner = await ctx.db.get(partnerId);
    if (!partner || partner.deletedAt) {
      throw new Error('Partner not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeletePartnerAccess(partner, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(partnerId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'partners.deleted',
      entityType: 'system_partners',
      entityId: partner.publicId,
      entityTitle: partner.companyName,
      description: `Deleted partner: ${partner.companyName}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return partnerId;
  },
});

/**
 * Restore soft-deleted partner
 */
export const restorePartner = mutation({
  args: {
    partnerId: v.id('yourobcPartners'),
  },
  handler: async (ctx, { partnerId }): Promise<PartnerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const partner = await ctx.db.get(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }
    if (!partner.deletedAt) {
      throw new Error('Partner is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      partner.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this partner');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(partnerId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'partners.restored',
      entityType: 'system_partners',
      entityId: partner.publicId,
      entityTitle: partner.companyName,
      description: `Restored partner: ${partner.companyName}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return partnerId;
  },
});

/**
 * Archive partner
 */
export const archivePartner = mutation({
  args: {
    partnerId: v.id('yourobcPartners'),
  },
  handler: async (ctx, { partnerId }): Promise<PartnerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const partner = await ctx.db.get(partnerId);
    if (!partner || partner.deletedAt) {
      throw new Error('Partner not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditPartnerAccess(ctx, partner, user);

    // 4. ARCHIVE: Update status
    const now = Date.now();
    await ctx.db.patch(partnerId, {
      status: 'archived',
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'partners.archived',
      entityType: 'system_partners',
      entityId: partner.publicId,
      entityTitle: partner.companyName,
      description: `Archived partner: ${partner.companyName}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return partnerId;
  },
});
