// convex/lib/software/yourobc/customers/mutations.ts
// Write operations for customers module

import type { MutationCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import type { Customer, CustomerId, CreateCustomerInput, UpdateCustomerInput } from '@/schema/software/yourobc/customers';
import type { CustomerSuspensionData, CustomerReactivationData } from './types';
import {
  canEditCustomer,
  canDeleteCustomer,
  canRestoreCustomer,
  canSuspendCustomer,
  canReactivateCustomer,
  canChangeCustomerStatus,
  requireEditPermission,
  requireDeletePermission,
  requireRestorePermission,
  validateCustomerExists,
} from './permissions';
import {
  validateCustomerData,
  validateCustomerUpdateData,
  generatePublicId,
} from './utils';
import { CUSTOMERS_CONSTANTS } from './constants';

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

/**
 * Create customer
 */
export async function createCustomer(
  ctx: MutationCtx,
  data: CreateCustomerInput
): Promise<CustomerId> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. VALIDATE: Check data validity
  validateCustomerData(data);

  // 3. PROCESS: Generate IDs and prepare data
  const publicId = generatePublicId();
  const now = Date.now();

  // 4. CREATE: Insert into database
  const customerId = await ctx.db.insert('yourobcCustomers', {
    publicId,
    companyName: data.companyName.trim(),
    shortName: data.shortName?.trim(),
    website: data.website?.trim(),
    ownerId: user._id,
    status: CUSTOMERS_CONSTANTS.DEFAULT_VALUES.STATUS as any,
    primaryContact: data.primaryContact,
    additionalContacts: data.additionalContacts || [],
    billingAddress: data.billingAddress,
    shippingAddress: data.shippingAddress,
    defaultCurrency: data.defaultCurrency,
    paymentTerms: data.paymentTerms,
    paymentMethod: data.paymentMethod,
    margin: data.margin,
    inquirySourceId: data.inquirySourceId,
    stats: CUSTOMERS_CONSTANTS.DEFAULT_VALUES.STATS as any,
    notes: data.notes,
    internalNotes: data.internalNotes,
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
    CUSTOMERS_CONSTANTS.AUDIT_ACTIONS.CREATED,
    CUSTOMERS_CONSTANTS.ENTITY_TYPE,
    publicId,
    data.companyName.trim(),
    `Created customer: ${data.companyName.trim()}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { companyName: data.companyName, currency: data.defaultCurrency }
  );

  // 6. RETURN: Return entity ID
  return customerId;
}

/**
 * Update customer
 */
export async function updateCustomer(
  ctx: MutationCtx,
  customerId: CustomerId,
  updates: UpdateCustomerInput
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const customer = await ctx.db.get(customerId);
  validateCustomerExists(customer);

  // 3. AUTHORIZE: Check edit permission
  await requireEditPermission(customer, user);

  // 4. VALIDATE: Check update data validity
  validateCustomerUpdateData(updates);

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
  if (updateData.shortName) {
    updateData.shortName = updateData.shortName.trim();
  }
  if (updateData.website) {
    updateData.website = updateData.website.trim();
  }

  await ctx.db.patch(customerId, updateData);

  // 6. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    CUSTOMERS_CONSTANTS.AUDIT_ACTIONS.UPDATED,
    CUSTOMERS_CONSTANTS.ENTITY_TYPE,
    customer.publicId,
    customer.companyName,
    `Updated customer: ${customer.companyName}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { updates: Object.keys(updates) }
  );
}

/**
 * Delete customer (soft delete)
 */
export async function deleteCustomer(
  ctx: MutationCtx,
  customerId: CustomerId
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const customer = await ctx.db.get(customerId);
  validateCustomerExists(customer);

  // 3. AUTHORIZE: Check delete permission
  await requireDeletePermission(customer, user);

  // 4. DELETE: Soft delete
  const now = Date.now();
  await ctx.db.patch(customerId, {
    deletedAt: now,
    deletedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    CUSTOMERS_CONSTANTS.AUDIT_ACTIONS.DELETED,
    CUSTOMERS_CONSTANTS.ENTITY_TYPE,
    customer.publicId,
    customer.companyName,
    `Deleted customer: ${customer.companyName}`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

/**
 * Restore customer (undo soft delete)
 */
export async function restoreCustomer(
  ctx: MutationCtx,
  customerId: CustomerId
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity (including deleted)
  const customer = await ctx.db.get(customerId);
  if (!customer) {
    throw new Error(CUSTOMERS_CONSTANTS.ERRORS.NOT_FOUND);
  }

  // Check if actually deleted
  if (!customer.deletedAt) {
    throw new Error('Customer is not deleted');
  }

  // 3. AUTHORIZE: Check restore permission
  await requireRestorePermission(customer, user);

  // 4. RESTORE: Remove deletion markers
  await ctx.db.patch(customerId, {
    deletedAt: undefined,
    deletedBy: undefined,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    CUSTOMERS_CONSTANTS.AUDIT_ACTIONS.RESTORED,
    CUSTOMERS_CONSTANTS.ENTITY_TYPE,
    customer.publicId,
    customer.companyName,
    `Restored customer: ${customer.companyName}`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

/**
 * Archive customer (set status to inactive)
 */
export async function archiveCustomer(
  ctx: MutationCtx,
  customerId: CustomerId
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const customer = await ctx.db.get(customerId);
  validateCustomerExists(customer);

  // 3. AUTHORIZE: Check permission
  const canChange = await canChangeCustomerStatus(customer, user);
  if (!canChange) {
    throw new Error('You do not have permission to archive this customer');
  }

  // 4. ARCHIVE: Set status to inactive
  await ctx.db.patch(customerId, {
    status: CUSTOMERS_CONSTANTS.STATUS.INACTIVE as any,
    updatedAt: Date.now(),
    updatedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    CUSTOMERS_CONSTANTS.AUDIT_ACTIONS.ARCHIVED,
    CUSTOMERS_CONSTANTS.ENTITY_TYPE,
    customer.publicId,
    customer.companyName,
    `Archived customer: ${customer.companyName}`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

/**
 * Suspend customer service
 */
export async function suspendCustomer(
  ctx: MutationCtx,
  customerId: CustomerId,
  suspensionData: CustomerSuspensionData
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const customer = await ctx.db.get(customerId);
  validateCustomerExists(customer);

  // 3. AUTHORIZE: Check permission
  const canSuspend = await canSuspendCustomer(customer, user);
  if (!canSuspend) {
    throw new Error('You do not have permission to suspend this customer');
  }

  // 4. SUSPEND: Set suspension fields
  const now = Date.now();
  await ctx.db.patch(customerId, {
    serviceSuspended: true,
    serviceSuspendedDate: now,
    serviceSuspendedReason: suspensionData.reason,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    CUSTOMERS_CONSTANTS.AUDIT_ACTIONS.SUSPENDED,
    CUSTOMERS_CONSTANTS.ENTITY_TYPE,
    customer.publicId,
    customer.companyName,
    `Suspended customer: ${customer.companyName} - Reason: ${suspensionData.reason}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { reason: suspensionData.reason, notes: suspensionData.notes }
  );
}

/**
 * Reactivate customer service
 */
export async function reactivateCustomer(
  ctx: MutationCtx,
  customerId: CustomerId,
  reactivationData: CustomerReactivationData = {}
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const customer = await ctx.db.get(customerId);
  validateCustomerExists(customer);

  // 3. AUTHORIZE: Check permission
  const canReactivate = await canReactivateCustomer(customer, user);
  if (!canReactivate) {
    throw new Error('You do not have permission to reactivate this customer');
  }

  // 4. REACTIVATE: Clear suspension fields
  const now = Date.now();
  await ctx.db.patch(customerId, {
    serviceSuspended: false,
    serviceReactivatedDate: now,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    CUSTOMERS_CONSTANTS.AUDIT_ACTIONS.REACTIVATED,
    CUSTOMERS_CONSTANTS.ENTITY_TYPE,
    customer.publicId,
    customer.companyName,
    `Reactivated customer: ${customer.companyName}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { notes: reactivationData.notes }
  );
}

/**
 * Change customer status
 */
export async function changeCustomerStatus(
  ctx: MutationCtx,
  customerId: CustomerId,
  newStatus: string
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const customer = await ctx.db.get(customerId);
  validateCustomerExists(customer);

  // 3. AUTHORIZE: Check permission
  const canChange = await canChangeCustomerStatus(customer, user);
  if (!canChange) {
    throw new Error('You do not have permission to change customer status');
  }

  // 4. VALIDATE: Check valid status
  const validStatuses = [
    CUSTOMERS_CONSTANTS.STATUS.ACTIVE,
    CUSTOMERS_CONSTANTS.STATUS.INACTIVE,
    CUSTOMERS_CONSTANTS.STATUS.BLACKLISTED,
  ];
  if (!validStatuses.includes(newStatus as any)) {
    throw new Error('Invalid customer status');
  }

  // 5. UPDATE: Change status
  const now = Date.now();
  await ctx.db.patch(customerId, {
    status: newStatus as any,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 6. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    CUSTOMERS_CONSTANTS.AUDIT_ACTIONS.STATUS_CHANGED,
    CUSTOMERS_CONSTANTS.ENTITY_TYPE,
    customer.publicId,
    customer.companyName,
    `Changed customer status: ${customer.companyName} from ${customer.status} to ${newStatus}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { oldStatus: customer.status, newStatus }
  );
}
