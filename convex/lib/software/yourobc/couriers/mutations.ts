// convex/lib/software/yourobc/couriers/mutations.ts
// Write operations for couriers module

import type { MutationCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import type {
  Courier,
  CourierId,
  Commission,
  CommissionId,
  CreateCourierInput,
  UpdateCourierInput,
  CreateCommissionInput,
  UpdateCommissionInput,
} from '@/schema/software/yourobc/couriers';
import type { TimeTrackingData, CommissionApprovalData, CommissionPaymentData } from './types';
import {
  canEditCourier,
  canDeleteCourier,
  canRestoreCourier,
  canEditCommission,
  canDeleteCommission,
  canRestoreCommission,
  canApproveCommission,
  canPayCommission,
  requireEditPermission,
  requireDeletePermission,
  requireRestorePermission,
  requireCommissionEditPermission,
  requireCommissionDeletePermission,
  requireCommissionRestorePermission,
  validateCourierExists,
  validateCommissionExists,
} from './permissions';
import {
  validateCourierData,
  validateCourierUpdateData,
  validateCommissionData,
  validateCommissionUpdateData,
  generatePublicId,
  generateCommissionPublicId,
  getCommissionDisplayDate,
} from './utils';
import { COURIERS_CONSTANTS, COMMISSIONS_CONSTANTS } from './constants';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current user or throw error
 */
async function requireCurrentUser(ctx: MutationCtx) {
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

/**
 * Create an audit log entry
 */
async function createAuditLog(
  ctx: MutationCtx,
  action: string,
  entityType: string,
  entityId: string,
  entityTitle: string,
  description: string,
  userId: Id<'userProfiles'>,
  userName: string,
  metadata?: Record<string, any>
): Promise<void> {
  const now = Date.now();
  await ctx.db.insert('auditLogs', {
    userId,
    userName,
    action,
    entityType,
    entityId,
    entityTitle,
    description,
    metadata: metadata || {},
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
  });
}

// ============================================================================
// Courier Mutations
// ============================================================================

/**
 * Create courier
 */
export async function createCourier(
  ctx: MutationCtx,
  data: CreateCourierInput
): Promise<CourierId> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. VALIDATE: Check data validity
  validateCourierData(data);

  // 3. PROCESS: Generate IDs and prepare data
  const publicId = generatePublicId();
  const now = Date.now();

  // 4. CREATE: Insert into database
  const courierId = await ctx.db.insert('yourobcCouriers', {
    publicId,
    companyName: data.companyName.trim(),
    ownerId: user._id,
    status: COURIERS_CONSTANTS.DEFAULT_VALUES.STATUS as any,
    courierNumber: data.courierNumber.trim(),
    firstName: data.firstName.trim(),
    middleName: data.middleName?.trim(),
    lastName: data.lastName.trim(),
    email: data.email?.trim(),
    phone: data.phone.trim(),
    userProfileId: data.userProfileId,
    authUserId: data.authUserId,
    isActive: data.isActive,
    isOnline: data.isOnline,
    skills: data.skills,
    timeEntries: [],
    timezone: data.timezone,
    currentLocation: data.currentLocation,
    ranking: data.ranking,
    rankingNotes: data.rankingNotes,
    costProfile: data.costProfile,
    notes: data.notes,
    serviceCoverage: data.serviceCoverage,
    tags: data.tags || [],
    category: data.category,
    customFields: {},
    createdAt: now,
    updatedAt: now,
    createdBy: user._id,
    deletedAt: undefined,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COURIERS_CONSTANTS.AUDIT_ACTIONS.CREATED,
    COURIERS_CONSTANTS.ENTITY_TYPE,
    publicId,
    data.companyName.trim(),
    `Created courier: ${data.companyName.trim()}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { courierNumber: data.courierNumber, name: `${data.firstName} ${data.lastName}` }
  );

  // 6. RETURN: Return entity ID
  return courierId;
}

/**
 * Update courier
 */
export async function updateCourier(
  ctx: MutationCtx,
  courierId: CourierId,
  updates: UpdateCourierInput
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const courier = await ctx.db.get(courierId);
  validateCourierExists(courier);

  // 3. AUTHORIZE: Check edit permission
  await requireEditPermission(courier, user);

  // 4. VALIDATE: Check update data validity
  validateCourierUpdateData(updates);

  // 5. UPDATE: Apply changes
  const now = Date.now();
  const updateData: any = {
    ...updates,
    updatedAt: now,
    updatedBy: user._id,
  };

  // Trim string fields
  if (updateData.companyName) {
    updateData.companyName = updateData.companyName.trim();
  }
  if (updateData.firstName) {
    updateData.firstName = updateData.firstName.trim();
  }
  if (updateData.middleName) {
    updateData.middleName = updateData.middleName.trim();
  }
  if (updateData.lastName) {
    updateData.lastName = updateData.lastName.trim();
  }
  if (updateData.email) {
    updateData.email = updateData.email.trim();
  }
  if (updateData.phone) {
    updateData.phone = updateData.phone.trim();
  }

  await ctx.db.patch(courierId, updateData);

  // 6. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COURIERS_CONSTANTS.AUDIT_ACTIONS.UPDATED,
    COURIERS_CONSTANTS.ENTITY_TYPE,
    courier.publicId,
    courier.companyName,
    `Updated courier: ${courier.companyName}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { updates: Object.keys(updates) }
  );
}

/**
 * Delete courier (soft delete)
 */
export async function deleteCourier(
  ctx: MutationCtx,
  courierId: CourierId
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const courier = await ctx.db.get(courierId);
  validateCourierExists(courier);

  // 3. AUTHORIZE: Check delete permission
  await requireDeletePermission(courier, user);

  // 4. DELETE: Soft delete
  const now = Date.now();
  await ctx.db.patch(courierId, {
    deletedAt: now,
    deletedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COURIERS_CONSTANTS.AUDIT_ACTIONS.DELETED,
    COURIERS_CONSTANTS.ENTITY_TYPE,
    courier.publicId,
    courier.companyName,
    `Deleted courier: ${courier.companyName}`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

/**
 * Restore courier (undo soft delete)
 */
export async function restoreCourier(
  ctx: MutationCtx,
  courierId: CourierId
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity (including deleted)
  const courier = await ctx.db.get(courierId);
  if (!courier) {
    throw new Error(COURIERS_CONSTANTS.ERRORS.NOT_FOUND);
  }

  // Check if actually deleted
  if (!courier.deletedAt) {
    throw new Error('Courier is not deleted');
  }

  // 3. AUTHORIZE: Check restore permission
  await requireRestorePermission(courier, user);

  // 4. RESTORE: Remove deletion markers
  await ctx.db.patch(courierId, {
    deletedAt: undefined,
    deletedBy: undefined,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COURIERS_CONSTANTS.AUDIT_ACTIONS.RESTORED,
    COURIERS_CONSTANTS.ENTITY_TYPE,
    courier.publicId,
    courier.companyName,
    `Restored courier: ${courier.companyName}`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

/**
 * Add time entry for courier
 */
export async function addTimeEntry(
  ctx: MutationCtx,
  courierId: CourierId,
  timeData: TimeTrackingData
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const courier = await ctx.db.get(courierId);
  validateCourierExists(courier);

  // 3. AUTHORIZE: Check edit permission
  await requireEditPermission(courier, user);

  // 4. ADD: Add time entry
  const now = Date.now();
  const newTimeEntry = {
    type: timeData.type,
    timestamp: now,
    location: timeData.location,
    notes: timeData.notes,
  };

  const updatedTimeEntries = [...courier.timeEntries, newTimeEntry];

  await ctx.db.patch(courierId, {
    timeEntries: updatedTimeEntries,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COURIERS_CONSTANTS.AUDIT_ACTIONS.TIME_ENTRY_ADDED,
    COURIERS_CONSTANTS.ENTITY_TYPE,
    courier.publicId,
    courier.companyName,
    `Added time entry (${timeData.type}) for courier: ${courier.companyName}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { type: timeData.type, location: timeData.location }
  );
}

/**
 * Change courier status
 */
export async function changeCourierStatus(
  ctx: MutationCtx,
  courierId: CourierId,
  newStatus: 'available' | 'busy' | 'offline' | 'vacation'
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const courier = await ctx.db.get(courierId);
  validateCourierExists(courier);

  // 3. AUTHORIZE: Check edit permission
  await requireEditPermission(courier, user);

  // 4. UPDATE: Change status
  const now = Date.now();
  await ctx.db.patch(courierId, {
    status: newStatus as any,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COURIERS_CONSTANTS.AUDIT_ACTIONS.STATUS_CHANGED,
    COURIERS_CONSTANTS.ENTITY_TYPE,
    courier.publicId,
    courier.companyName,
    `Changed courier status: ${courier.companyName} from ${courier.status} to ${newStatus}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { oldStatus: courier.status, newStatus }
  );
}

// ============================================================================
// Commission Mutations
// ============================================================================

/**
 * Create commission
 */
export async function createCommission(
  ctx: MutationCtx,
  data: CreateCommissionInput
): Promise<CommissionId> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. VALIDATE: Check data validity
  validateCommissionData(data);

  // 3. PROCESS: Generate IDs and prepare data
  const publicId = generateCommissionPublicId();
  const displayDate = getCommissionDisplayDate();
  const now = Date.now();

  // 4. CREATE: Insert into database
  const commissionId = await ctx.db.insert('yourobcCourierCommissions', {
    publicId,
    displayDate,
    ownerId: user._id,
    courierId: data.courierId,
    shipmentId: data.shipmentId,
    type: data.type,
    rate: data.rate,
    baseAmount: data.baseAmount,
    commissionAmount: data.commissionAmount,
    currency: data.currency,
    status: COMMISSIONS_CONSTANTS.DEFAULT_VALUES.STATUS as any,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: user._id,
    deletedAt: undefined,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COMMISSIONS_CONSTANTS.AUDIT_ACTIONS.CREATED,
    COMMISSIONS_CONSTANTS.ENTITY_TYPE,
    publicId,
    `Commission ${publicId}`,
    `Created commission: ${data.commissionAmount} for courier`,
    user._id,
    user.name || user.email || 'Unknown User',
    { type: data.type, amount: data.commissionAmount, courierId: data.courierId }
  );

  // 6. RETURN: Return entity ID
  return commissionId;
}

/**
 * Update commission
 */
export async function updateCommission(
  ctx: MutationCtx,
  commissionId: CommissionId,
  updates: UpdateCommissionInput
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const commission = await ctx.db.get(commissionId);
  validateCommissionExists(commission);

  // 3. AUTHORIZE: Check edit permission
  await requireCommissionEditPermission(commission, user);

  // 4. VALIDATE: Check update data validity
  validateCommissionUpdateData(updates);

  // 5. UPDATE: Apply changes
  const now = Date.now();
  const updateData: any = {
    ...updates,
    updatedAt: now,
    updatedBy: user._id,
  };

  await ctx.db.patch(commissionId, updateData);

  // 6. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COMMISSIONS_CONSTANTS.AUDIT_ACTIONS.UPDATED,
    COMMISSIONS_CONSTANTS.ENTITY_TYPE,
    commission.publicId,
    `Commission ${commission.publicId}`,
    `Updated commission: ${commission.publicId}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { updates: Object.keys(updates) }
  );
}

/**
 * Delete commission (soft delete)
 */
export async function deleteCommission(
  ctx: MutationCtx,
  commissionId: CommissionId
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const commission = await ctx.db.get(commissionId);
  validateCommissionExists(commission);

  // 3. AUTHORIZE: Check delete permission
  await requireCommissionDeletePermission(commission, user);

  // 4. DELETE: Soft delete
  const now = Date.now();
  await ctx.db.patch(commissionId, {
    deletedAt: now,
    deletedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COMMISSIONS_CONSTANTS.AUDIT_ACTIONS.DELETED,
    COMMISSIONS_CONSTANTS.ENTITY_TYPE,
    commission.publicId,
    `Commission ${commission.publicId}`,
    `Deleted commission: ${commission.publicId}`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

/**
 * Restore commission (undo soft delete)
 */
export async function restoreCommission(
  ctx: MutationCtx,
  commissionId: CommissionId
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity (including deleted)
  const commission = await ctx.db.get(commissionId);
  if (!commission) {
    throw new Error(COMMISSIONS_CONSTANTS.ERRORS.NOT_FOUND);
  }

  // Check if actually deleted
  if (!commission.deletedAt) {
    throw new Error('Commission is not deleted');
  }

  // 3. AUTHORIZE: Check restore permission
  await requireCommissionRestorePermission(commission, user);

  // 4. RESTORE: Remove deletion markers
  await ctx.db.patch(commissionId, {
    deletedAt: undefined,
    deletedBy: undefined,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COMMISSIONS_CONSTANTS.AUDIT_ACTIONS.RESTORED,
    COMMISSIONS_CONSTANTS.ENTITY_TYPE,
    commission.publicId,
    `Commission ${commission.publicId}`,
    `Restored commission: ${commission.publicId}`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

/**
 * Approve commission
 */
export async function approveCommission(
  ctx: MutationCtx,
  commissionId: CommissionId,
  approvalData: CommissionApprovalData
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const commission = await ctx.db.get(commissionId);
  validateCommissionExists(commission);

  // 3. AUTHORIZE: Check approval permission
  const canApprove = await canApproveCommission(commission, user);
  if (!canApprove) {
    throw new Error('You do not have permission to approve this commission');
  }

  // 4. APPROVE: Set approval fields
  const now = Date.now();
  await ctx.db.patch(commissionId, {
    approvedBy: approvalData.approvedBy,
    approvedDate: now,
    notes: approvalData.notes || commission.notes,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COMMISSIONS_CONSTANTS.AUDIT_ACTIONS.APPROVED,
    COMMISSIONS_CONSTANTS.ENTITY_TYPE,
    commission.publicId,
    `Commission ${commission.publicId}`,
    `Approved commission: ${commission.publicId}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { approvedBy: approvalData.approvedBy, notes: approvalData.notes }
  );
}

/**
 * Pay commission
 */
export async function payCommission(
  ctx: MutationCtx,
  commissionId: CommissionId,
  paymentData: CommissionPaymentData
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const commission = await ctx.db.get(commissionId);
  validateCommissionExists(commission);

  // 3. AUTHORIZE: Check payment permission
  const canPay = await canPayCommission(commission, user);
  if (!canPay) {
    throw new Error('You do not have permission to pay this commission');
  }

  // 4. PAY: Set payment fields
  const now = Date.now();
  await ctx.db.patch(commissionId, {
    status: COMMISSIONS_CONSTANTS.STATUS.PAID as any,
    paidDate: paymentData.paidDate,
    paymentReference: paymentData.paymentReference,
    paymentMethod: paymentData.paymentMethod,
    notes: paymentData.notes || commission.notes,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    COMMISSIONS_CONSTANTS.AUDIT_ACTIONS.PAID,
    COMMISSIONS_CONSTANTS.ENTITY_TYPE,
    commission.publicId,
    `Commission ${commission.publicId}`,
    `Paid commission: ${commission.publicId} - ${commission.commissionAmount}`,
    user._id,
    user.name || user.email || 'Unknown User',
    {
      amount: commission.commissionAmount,
      paymentReference: paymentData.paymentReference,
      paymentMethod: paymentData.paymentMethod,
    }
  );
}
