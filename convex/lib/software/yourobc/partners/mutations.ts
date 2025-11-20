// convex/lib/software/yourobc/partners/mutations.ts
// Write operations for partners module

import { v } from 'convex/values';
import type { MutationCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import { PARTNERS_CONSTANTS } from './constants';
import { validatePartnerData, validatePartnerUpdateData, generatePartnerCode } from './utils';
import {
  canEditPartner,
  canDeletePartner,
  canRestorePartner,
  canChangePartnerStatus,
  canTransferPartnerOwnership,
  requireAdminAccess,
} from './permissions';
import type { CreatePartnerInput, UpdatePartnerInput } from './types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique public ID for a partner
 */
async function generateUniquePublicId(ctx: MutationCtx, prefix: string = 'ptn_'): Promise<string> {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${prefix}${timestamp}${randomString}`;
}

/**
 * Get current user or throw error
 */
async function requireCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }

  // Get user profile by auth subject
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
// Partner Mutations
// ============================================================================

/**
 * Create partner
 */
export async function createPartner(
  ctx: MutationCtx,
  data: CreatePartnerInput
): Promise<Id<'yourobcPartners'>> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. VALIDATE: Check data validity
  validatePartnerData(data);

  // 3. CHECK: Ensure company name doesn't already exist
  const existingPartner = await ctx.db
    .query('yourobcPartners')
    .withIndex('by_company_name', (q) => q.eq('companyName', data.companyName))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first();

  if (existingPartner) {
    throw new Error(`Partner with company name "${data.companyName}" already exists`);
  }

  // 4. PROCESS: Generate IDs and prepare data
  const publicId = await generateUniquePublicId(ctx);
  const partnerCode = data.partnerCode || generatePartnerCode(data.companyName);
  const now = Date.now();

  // 5. CREATE: Insert into database
  const partnerId = await ctx.db.insert('yourobcPartners', {
    publicId,
    companyName: data.companyName.trim(),
    shortName: data.shortName?.trim(),
    partnerCode,
    ownerId: user.authUserId, // Use authUserId instead of _id
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
    serviceCapabilities: data.serviceCapabilities || PARTNERS_CONSTANTS.DEFAULT_VALUES.SERVICE_CAPABILITIES,
    status: (data.status as any) || PARTNERS_CONSTANTS.DEFAULT_VALUES.STATUS,
    notes: data.notes?.trim(),
    tags: data.tags || [],
    category: data.category,
    customFields: {},
    createdAt: now,
    createdBy: user.authUserId,
    updatedAt: now,
    updatedBy: user.authUserId,
  });

  return partnerId;
}

/**
 * Update partner
 */
export async function updatePartner(
  ctx: MutationCtx,
  partnerId: Id<'yourobcPartners'>,
  data: UpdatePartnerInput
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing partner
  const partner = await ctx.db.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }

  // 3. AUTHORIZE: Check edit permissions
  const canEdit = await canEditPartner(ctx, partner, user);
  if (!canEdit) {
    throw new Error('You do not have permission to edit this partner');
  }

  // 4. VALIDATE: Check update data validity
  validatePartnerUpdateData(data);

  // 5. CHECK: If updating company name, ensure it doesn't conflict
  if (data.companyName && data.companyName !== partner.companyName) {
    const existingPartner = await ctx.db
      .query('yourobcPartners')
      .withIndex('by_company_name', (q) => q.eq('companyName', data.companyName!))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (existingPartner && existingPartner._id !== partnerId) {
      throw new Error(`Partner with company name "${data.companyName}" already exists`);
    }
  }

  // 6. UPDATE: Prepare update object
  const now = Date.now();
  const updates: any = {
    updatedAt: now,
    updatedBy: user.authUserId,
  };

  // Only include fields that are being updated
  if (data.companyName !== undefined) updates.companyName = data.companyName.trim();
  if (data.shortName !== undefined) updates.shortName = data.shortName?.trim();
  if (data.partnerCode !== undefined) updates.partnerCode = data.partnerCode?.trim();
  if (data.primaryContact !== undefined) updates.primaryContact = data.primaryContact;
  if (data.quotingEmail !== undefined) updates.quotingEmail = data.quotingEmail?.trim();
  if (data.address !== undefined) updates.address = data.address;
  if (data.serviceCoverage !== undefined) updates.serviceCoverage = data.serviceCoverage;
  if (data.serviceType !== undefined) updates.serviceType = data.serviceType;
  if (data.preferredCurrency !== undefined) updates.preferredCurrency = data.preferredCurrency;
  if (data.paymentTerms !== undefined) updates.paymentTerms = data.paymentTerms;
  if (data.ranking !== undefined) updates.ranking = data.ranking;
  if (data.rankingNotes !== undefined) updates.rankingNotes = data.rankingNotes?.trim();
  if (data.internalPaymentNotes !== undefined) updates.internalPaymentNotes = data.internalPaymentNotes?.trim();
  if (data.serviceCapabilities !== undefined) updates.serviceCapabilities = data.serviceCapabilities;
  if (data.status !== undefined) updates.status = data.status;
  if (data.notes !== undefined) updates.notes = data.notes?.trim();
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.category !== undefined) updates.category = data.category;

  // 7. PERSIST: Update in database
  await ctx.db.patch(partnerId, updates);
}

/**
 * Delete partner (soft delete)
 */
export async function deletePartner(ctx: MutationCtx, partnerId: Id<'yourobcPartners'>): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing partner
  const partner = await ctx.db.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }

  // 3. AUTHORIZE: Check delete permissions
  const canDelete = await canDeletePartner(ctx, partner, user);
  if (!canDelete) {
    throw new Error('You do not have permission to delete this partner');
  }

  // 4. DELETE: Soft delete by setting deletedAt
  const now = Date.now();
  await ctx.db.patch(partnerId, {
    deletedAt: now,
    deletedBy: user.authUserId,
    updatedAt: now,
    updatedBy: user.authUserId,
  });
}

/**
 * Restore deleted partner
 */
export async function restorePartner(ctx: MutationCtx, partnerId: Id<'yourobcPartners'>): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing partner
  const partner = await ctx.db.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }

  // 3. AUTHORIZE: Check restore permissions
  const canRestore = await canRestorePartner(ctx, partner, user);
  if (!canRestore) {
    throw new Error('You do not have permission to restore this partner');
  }

  // 4. RESTORE: Remove deletedAt and deletedBy
  const now = Date.now();
  await ctx.db.patch(partnerId, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedAt: now,
    updatedBy: user.authUserId,
  });
}

/**
 * Change partner status
 */
export async function changePartnerStatus(
  ctx: MutationCtx,
  partnerId: Id<'yourobcPartners'>,
  newStatus: 'active' | 'inactive' | 'suspended'
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing partner
  const partner = await ctx.db.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }

  // 3. AUTHORIZE: Check status change permissions
  const canChange = await canChangePartnerStatus(ctx, partner, user);
  if (!canChange) {
    throw new Error('You do not have permission to change this partner status');
  }

  // 4. UPDATE: Change status
  const now = Date.now();
  await ctx.db.patch(partnerId, {
    status: newStatus,
    updatedAt: now,
    updatedBy: user.authUserId,
  });
}

/**
 * Update partner ranking
 */
export async function updatePartnerRanking(
  ctx: MutationCtx,
  partnerId: Id<'yourobcPartners'>,
  ranking: 1 | 2 | 3 | 4 | 5,
  notes?: string
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing partner
  const partner = await ctx.db.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }

  // 3. AUTHORIZE: Check edit permissions
  const canEdit = await canEditPartner(ctx, partner, user);
  if (!canEdit) {
    throw new Error('You do not have permission to update this partner ranking');
  }

  // 4. UPDATE: Update ranking
  const now = Date.now();
  await ctx.db.patch(partnerId, {
    ranking,
    rankingNotes: notes?.trim(),
    updatedAt: now,
    updatedBy: user.authUserId,
  });
}

/**
 * Transfer partner ownership
 */
export async function transferPartnerOwnership(
  ctx: MutationCtx,
  partnerId: Id<'yourobcPartners'>,
  newOwnerId: string
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing partner
  const partner = await ctx.db.get(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }

  // 3. AUTHORIZE: Check transfer permissions
  const canTransfer = await canTransferPartnerOwnership(ctx, partner, user);
  if (!canTransfer) {
    throw new Error('You do not have permission to transfer ownership of this partner');
  }

  // 4. VALIDATE: Check new owner exists
  const newOwner = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authUserId'), newOwnerId))
    .first();

  if (!newOwner) {
    throw new Error('New owner not found');
  }

  // 5. UPDATE: Transfer ownership
  const now = Date.now();
  await ctx.db.patch(partnerId, {
    ownerId: newOwnerId,
    updatedAt: now,
    updatedBy: user.authUserId,
  });
}

/**
 * Bulk update partner status
 */
export async function bulkUpdatePartnerStatus(
  ctx: MutationCtx,
  partnerIds: Id<'yourobcPartners'>[],
  newStatus: 'active' | 'inactive' | 'suspended'
): Promise<{ success: number; failed: number }> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);
  await requireAdminAccess(ctx, user);

  let success = 0;
  let failed = 0;

  for (const partnerId of partnerIds) {
    try {
      const partner = await ctx.db.get(partnerId);
      if (!partner || partner.deletedAt) {
        failed++;
        continue;
      }

      const now = Date.now();
      await ctx.db.patch(partnerId, {
        status: newStatus,
        updatedAt: now,
        updatedBy: user.authUserId,
      });

      success++;
    } catch (error) {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Bulk delete partners (soft delete)
 */
export async function bulkDeletePartners(
  ctx: MutationCtx,
  partnerIds: Id<'yourobcPartners'>[]
): Promise<{ success: number; failed: number }> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);
  await requireAdminAccess(ctx, user);

  let success = 0;
  let failed = 0;

  for (const partnerId of partnerIds) {
    try {
      const partner = await ctx.db.get(partnerId);
      if (!partner || partner.deletedAt) {
        failed++;
        continue;
      }

      const now = Date.now();
      await ctx.db.patch(partnerId, {
        deletedAt: now,
        deletedBy: user.authUserId,
        updatedAt: now,
        updatedBy: user.authUserId,
      });

      success++;
    } catch (error) {
      failed++;
    }
  }

  return { success, failed };
}
