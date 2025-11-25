// convex/lib/yourobc/partners/mutations.ts
// Write operations for partners module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { chunkIds } from '@/shared/bulk.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { partnersValidators, partnersFields } from '@/schema/yourobc/partners/validators';
import { PARTNERS_CONSTANTS } from './constants';
import { trimPartnerData, validatePartnerData } from './utils';
import { requireEditPartnerAccess, requireDeletePartnerAccess, canEditPartner, canDeletePartner } from './permissions';
import type { PartnerId } from './types';
import { baseValidators } from '@/schema/base.validators';

/**
 * Create new partner
 */
export const createPartner = mutation({
  args: {
    data: v.object({
      companyName: v.string(),
      shortName: v.optional(v.string()),
      partnerCode: v.optional(v.string()),
      primaryContact: partnersFields.contact,
      quotingEmail: v.optional(v.string()),
      address: partnersFields.address,
      serviceCoverage: partnersFields.serviceCoverage,
      serviceType: partnersValidators.partnerServiceType,
      preferredCurrency: baseValidators.currency,
      paymentTerms: v.number(),
      ranking: v.optional(v.number()),
      rankingNotes: v.optional(v.string()),
      internalPaymentNotes: v.optional(v.string()),
      serviceCapabilities: v.optional(partnersFields.serviceCapabilities),
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

    // 3. TRIM: Trim all string fields
    const trimmed = trimPartnerData(data);

    // 4. VALIDATE: Check data validity
    const errors = validatePartnerData(trimmed);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcPartners');
    const now = Date.now();

    // 5. CREATE: Insert into database
    const partnerId = await ctx.db.insert('yourobcPartners', {
      publicId,
      companyName: trimmed.companyName || '',
      shortName: trimmed.shortName,
      partnerCode: trimmed.partnerCode,
      primaryContact: trimmed.primaryContact!,
      quotingEmail: trimmed.quotingEmail,
      address: trimmed.address!,
      serviceCoverage: trimmed.serviceCoverage!,
      serviceType: trimmed.serviceType!,
      preferredCurrency: trimmed.preferredCurrency!,
      paymentTerms: trimmed.paymentTerms!,
      ranking: trimmed.ranking,
      rankingNotes: trimmed.rankingNotes,
      internalPaymentNotes: trimmed.internalPaymentNotes,
      serviceCapabilities: trimmed.serviceCapabilities,
      commissionRate: trimmed.commissionRate,
      apiEnabled: trimmed.apiEnabled,
      apiKey: trimmed.apiKey,
      apiEndpoint: trimmed.apiEndpoint,
      status: trimmed.status || 'active',
      notes: trimmed.notes,
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
      entityType: 'yourobcPartners',
      entityId: publicId,
      entityTitle: trimmed.companyName || '',
      description: `Created partner: ${trimmed.companyName}`,
      metadata: {
        status: trimmed.status || 'active',
        serviceType: trimmed.serviceType,
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
      primaryContact: v.optional(partnersFields.contact),
      quotingEmail: v.optional(v.string()),
      address: v.optional(partnersFields.address),
      serviceCoverage: v.optional(partnersFields.serviceCoverage),
      serviceType: v.optional(partnersValidators.partnerServiceType),
      preferredCurrency: v.optional(baseValidators.currency),
      paymentTerms: v.optional(v.number()),
      ranking: v.optional(v.number()),
      rankingNotes: v.optional(v.string()),
      internalPaymentNotes: v.optional(v.string()),
      serviceCapabilities: v.optional(partnersFields.serviceCapabilities),
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

    // 4. TRIM: Trim all string fields
    const trimmed = trimPartnerData(updates);

    // 5. VALIDATE: Check update data validity
    const errors = validatePartnerData(trimmed);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 7. UPDATE: Apply changes (use trimmed data)
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    // Copy trimmed values
    if (trimmed.companyName !== undefined) updateData.companyName = trimmed.companyName;
    if (trimmed.shortName !== undefined) updateData.shortName = trimmed.shortName;
    if (trimmed.partnerCode !== undefined) updateData.partnerCode = trimmed.partnerCode;
    if (trimmed.primaryContact !== undefined) updateData.primaryContact = trimmed.primaryContact;
    if (trimmed.quotingEmail !== undefined) updateData.quotingEmail = trimmed.quotingEmail;
    if (trimmed.address !== undefined) updateData.address = trimmed.address;
    if (trimmed.serviceCoverage !== undefined) updateData.serviceCoverage = trimmed.serviceCoverage;
    if (trimmed.serviceType !== undefined) updateData.serviceType = trimmed.serviceType;
    if (trimmed.preferredCurrency !== undefined) updateData.preferredCurrency = trimmed.preferredCurrency;
    if (trimmed.paymentTerms !== undefined) updateData.paymentTerms = trimmed.paymentTerms;
    if (trimmed.ranking !== undefined) updateData.ranking = trimmed.ranking;
    if (trimmed.rankingNotes !== undefined) updateData.rankingNotes = trimmed.rankingNotes;
    if (trimmed.internalPaymentNotes !== undefined) updateData.internalPaymentNotes = trimmed.internalPaymentNotes;
    if (trimmed.serviceCapabilities !== undefined) updateData.serviceCapabilities = trimmed.serviceCapabilities;
    if (trimmed.commissionRate !== undefined) updateData.commissionRate = trimmed.commissionRate;
    if (trimmed.apiEnabled !== undefined) updateData.apiEnabled = trimmed.apiEnabled;
    if (trimmed.apiKey !== undefined) updateData.apiKey = trimmed.apiKey;
    if (trimmed.apiEndpoint !== undefined) updateData.apiEndpoint = trimmed.apiEndpoint;
    if (trimmed.status !== undefined) updateData.status = trimmed.status;
    if (trimmed.notes !== undefined) updateData.notes = trimmed.notes;

    await ctx.db.patch(partnerId, updateData);

    // 8. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'partners.updated',
      entityType: 'yourobcPartners',
      entityId: partner.publicId,
      entityTitle: updateData.companyName || partner.companyName,
      description: `Updated partner: ${updateData.companyName || partner.companyName}`,
      metadata: { changes: trimmed },
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
      entityType: 'yourobcPartners',
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
      entityType: 'yourobcPartners',
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
      entityType: 'yourobcPartners',
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

/**
 * Bulk update multiple partners
 */
export const bulkUpdatePartners = mutation({
  args: {
    ids: v.array(v.id('yourobcPartners')),
    updates: v.object({
      status: v.optional(partnersValidators.status),
      ranking: v.optional(v.number()),
      rankingNotes: v.optional(v.string()),
      commissionRate: v.optional(v.number()),
    }),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, updates, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, PARTNERS_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    const trimmed = trimPartnerData(updates);
    const errors = validatePartnerData(trimmed);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);
    let updatedCount = 0;
    const denied: string[] = [];

    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;

        const canEdit = await canEditPartner(ctx, doc, user);
        if (!canEdit) {
          denied.push(doc.publicId);
          continue;
        }

        await ctx.db.patch(doc._id, {
          ...trimmed,
          updatedAt: now,
          updatedBy: user._id,
        });

        updatedCount++;
      }
    }

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'partners.bulk_updated',
      entityType: 'yourobcPartners',
      entityId: 'bulk',
      entityTitle: 'partners bulk update',
      description: `Bulk updated ${updatedCount} partners`,
      metadata: {
        updates: trimmed,
        denied,
        requestedCount: ids.length,
        updatedCount,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return {
      requestedCount: ids.length,
      updatedCount,
      denied,
    };
  },
});

/**
 * Bulk delete multiple partners
 */
export const bulkDeletePartners = mutation({
  args: {
    ids: v.array(v.id('yourobcPartners')),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, PARTNERS_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);
    let deletedCount = 0;
    const denied: string[] = [];

    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;

        const canDel = await canDeletePartner(doc, user);
        if (!canDel) {
          denied.push(doc.publicId);
          continue;
        }

        await ctx.db.patch(doc._id, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });

        deletedCount++;
      }
    }

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'partners.bulk_deleted',
      entityType: 'yourobcPartners',
      entityId: 'bulk',
      entityTitle: 'partners bulk delete',
      description: `Bulk deleted ${deletedCount} partners`,
      metadata: {
        denied,
        requestedCount: ids.length,
        deletedCount,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return {
      requestedCount: ids.length,
      deletedCount,
      denied,
    };
  },
});
