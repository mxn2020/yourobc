// convex/lib/software/yourobc/convex/lib/software/yourobc/invoices/mutations.ts
// Write operations for invoices module

import { v } from 'convex/values';
import type { MutationCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import { INVOICE_CONSTANTS } from './constants';
import {
  validateCreateInvoiceData,
  validateUpdateInvoiceData,
  validateProcessPaymentData,
  validateCollectionAttemptData,
  generateSearchableText,
  isInvoiceOverdue,
  calculateDaysOverdue,
  calculateDunningLevel,
  calculateDunningFee,
} from './utils';
import {
  canEditInvoice,
  canDeleteInvoice,
  canSendInvoice,
  canProcessPayment,
  canManageCollections,
  canCreateInvoice,
  requireAccess,
} from './permissions';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  ProcessPaymentInput,
  AddCollectionAttemptInput,
  UpdateDunningLevelInput,
} from './types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique public ID for an entity
 */
async function generateUniquePublicId(
  ctx: MutationCtx,
  prefix: string = 'inv_'
): Promise<string> {
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
// Invoice Mutations
// ============================================================================

/**
 * Create invoice
 */
export async function createInvoice(
  ctx: MutationCtx,
  data: CreateInvoiceInput
): Promise<Id<'yourobcInvoices'>> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. AUTHORIZE: Check create permission
  const canCreate = await canCreateInvoice(user);
  await requireAccess(canCreate, 'You do not have permission to create invoices');

  // 3. VALIDATE: Check data validity
  validateCreateInvoiceData(data);

  // 4. PROCESS: Generate IDs and prepare data
  const publicId = await generateUniquePublicId(ctx, 'inv_');
  const now = Date.now();

  // 5. CREATE: Insert into database
  const invoiceId = await ctx.db.insert('yourobcInvoices', {
    publicId,
    invoiceNumber: data.invoiceNumber,
    externalInvoiceNumber: data.externalInvoiceNumber,
    type: data.type,
    ownerId: user._id,
    shipmentId: data.shipmentId,
    customerId: data.customerId,
    partnerId: data.partnerId,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    description: data.description,
    lineItems: data.lineItems,
    billingAddress: data.billingAddress,
    subtotal: data.subtotal,
    taxRate: data.taxRate || INVOICE_CONSTANTS.DEFAULT_VALUES.TAX_RATE,
    taxAmount: data.taxAmount,
    totalAmount: data.totalAmount,
    paymentTerms: data.paymentTerms || INVOICE_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
    purchaseOrderNumber: data.purchaseOrderNumber,
    status: INVOICE_CONSTANTS.DEFAULT_VALUES.STATUS as any,
    collectionAttempts: [],
    dunningLevel: INVOICE_CONSTANTS.DEFAULT_VALUES.DUNNING_LEVEL,
    dunningFee: INVOICE_CONSTANTS.DEFAULT_VALUES.DUNNING_FEE,
    notes: data.notes,
    metadata: {
      tags: data.tags || [],
      category: undefined,
      customFields: undefined,
    },
    createdAt: now,
    createdBy: user._id,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 6. AUDIT: Log creation
  await createAuditLog(
    ctx,
    'create',
    'invoice',
    invoiceId,
    data.invoiceNumber,
    `Created invoice ${data.invoiceNumber}`,
    user._id,
    user.name || user.email,
    { type: data.type, totalAmount: data.totalAmount.amount }
  );

  return invoiceId;
}

/**
 * Update invoice
 */
export async function updateInvoice(
  ctx: MutationCtx,
  invoiceId: Id<'yourobcInvoices'>,
  data: UpdateInvoiceInput
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // 3. AUTHORIZE: Check edit permission
  const canEdit = await canEditInvoice(invoice, user);
  await requireAccess(canEdit, 'You do not have permission to edit this invoice');

  // 4. VALIDATE: Check data validity
  validateUpdateInvoiceData(data);

  // 5. UPDATE: Apply changes
  const now = Date.now();
  await ctx.db.patch(invoiceId, {
    ...data,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 6. AUDIT: Log update
  await createAuditLog(
    ctx,
    'update',
    'invoice',
    invoiceId,
    invoice.invoiceNumber,
    `Updated invoice ${invoice.invoiceNumber}`,
    user._id,
    user.name || user.email,
    { changes: Object.keys(data) }
  );
}

/**
 * Delete invoice (soft delete)
 */
export async function deleteInvoice(
  ctx: MutationCtx,
  invoiceId: Id<'yourobcInvoices'>
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // 3. AUTHORIZE: Check delete permission
  const canDelete = await canDeleteInvoice(invoice, user);
  await requireAccess(canDelete, 'You do not have permission to delete this invoice');

  // 4. DELETE: Soft delete
  const now = Date.now();
  await ctx.db.patch(invoiceId, {
    deletedAt: now,
    deletedBy: user._id,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 5. AUDIT: Log deletion
  await createAuditLog(
    ctx,
    'delete',
    'invoice',
    invoiceId,
    invoice.invoiceNumber,
    `Deleted invoice ${invoice.invoiceNumber}`,
    user._id,
    user.name || user.email
  );
}

/**
 * Restore deleted invoice
 */
export async function restoreInvoice(
  ctx: MutationCtx,
  invoiceId: Id<'yourobcInvoices'>
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // 3. AUTHORIZE: Admin only
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error('Only administrators can restore deleted invoices');
  }

  // 4. RESTORE: Remove deletion fields
  const now = Date.now();
  await ctx.db.patch(invoiceId, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 5. AUDIT: Log restoration
  await createAuditLog(
    ctx,
    'restore',
    'invoice',
    invoiceId,
    invoice.invoiceNumber,
    `Restored invoice ${invoice.invoiceNumber}`,
    user._id,
    user.name || user.email
  );
}

/**
 * Send invoice
 */
export async function sendInvoice(
  ctx: MutationCtx,
  invoiceId: Id<'yourobcInvoices'>
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // 3. AUTHORIZE: Check send permission
  const canSend = await canSendInvoice(invoice, user);
  await requireAccess(canSend, 'You do not have permission to send this invoice');

  // 4. UPDATE: Mark as sent
  const now = Date.now();
  await ctx.db.patch(invoiceId, {
    status: INVOICE_CONSTANTS.STATUS.SENT as any,
    sentAt: now,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 5. AUDIT: Log send action
  await createAuditLog(
    ctx,
    'send',
    'invoice',
    invoiceId,
    invoice.invoiceNumber,
    `Sent invoice ${invoice.invoiceNumber}`,
    user._id,
    user.name || user.email
  );
}

/**
 * Process payment
 */
export async function processPayment(
  ctx: MutationCtx,
  invoiceId: Id<'yourobcInvoices'>,
  data: ProcessPaymentInput
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // 3. AUTHORIZE: Check payment permission
  const canProcess = await canProcessPayment(invoice, user);
  await requireAccess(canProcess, 'You do not have permission to process payment for this invoice');

  // 4. VALIDATE: Check data validity
  validateProcessPaymentData(data);

  // 5. UPDATE: Record payment
  const now = Date.now();
  await ctx.db.patch(invoiceId, {
    status: INVOICE_CONSTANTS.STATUS.PAID as any,
    paymentMethod: data.paymentMethod as any,
    paymentDate: data.paymentDate,
    paidDate: data.paymentDate,
    paymentReference: data.paymentReference,
    paidAmount: data.paidAmount,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 6. AUDIT: Log payment
  await createAuditLog(
    ctx,
    'process_payment',
    'invoice',
    invoiceId,
    invoice.invoiceNumber,
    `Processed payment for invoice ${invoice.invoiceNumber}`,
    user._id,
    user.name || user.email,
    {
      paymentMethod: data.paymentMethod,
      paidAmount: data.paidAmount.amount,
    }
  );
}

/**
 * Add collection attempt
 */
export async function addCollectionAttempt(
  ctx: MutationCtx,
  invoiceId: Id<'yourobcInvoices'>,
  data: AddCollectionAttemptInput
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // 3. AUTHORIZE: Check collections permission
  const canManage = await canManageCollections(invoice, user);
  await requireAccess(canManage, 'You do not have permission to manage collections for this invoice');

  // 4. VALIDATE: Check data validity
  validateCollectionAttemptData(data);

  // 5. UPDATE: Add collection attempt
  const now = Date.now();
  const collectionAttempt = {
    date: now,
    method: data.method as any,
    result: data.result,
    createdBy: user.name || user.email,
  };

  const updatedAttempts = [...invoice.collectionAttempts, collectionAttempt];

  // Check limits
  if (updatedAttempts.length > INVOICE_CONSTANTS.LIMITS.MAX_COLLECTION_ATTEMPTS) {
    throw new Error(
      `Cannot exceed ${INVOICE_CONSTANTS.LIMITS.MAX_COLLECTION_ATTEMPTS} collection attempts`
    );
  }

  await ctx.db.patch(invoiceId, {
    collectionAttempts: updatedAttempts,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 6. AUDIT: Log collection attempt
  await createAuditLog(
    ctx,
    'add_collection_attempt',
    'invoice',
    invoiceId,
    invoice.invoiceNumber,
    `Added collection attempt for invoice ${invoice.invoiceNumber}`,
    user._id,
    user.name || user.email,
    { method: data.method, result: data.result }
  );
}

/**
 * Update dunning level
 */
export async function updateDunningLevel(
  ctx: MutationCtx,
  invoiceId: Id<'yourobcInvoices'>,
  data: UpdateDunningLevelInput
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // 3. AUTHORIZE: Check collections permission
  const canManage = await canManageCollections(invoice, user);
  await requireAccess(canManage, 'You do not have permission to manage collections for this invoice');

  // 4. VALIDATE: Check dunning level
  if (data.dunningLevel < 0 || data.dunningLevel > 3) {
    throw new Error('Dunning level must be between 0 and 3');
  }

  // 5. UPDATE: Set dunning level
  const now = Date.now();
  const dunningFee = data.dunningFee !== undefined ? data.dunningFee : calculateDunningFee(data.dunningLevel);

  await ctx.db.patch(invoiceId, {
    dunningLevel: data.dunningLevel,
    dunningFee,
    lastDunningDate: now,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 6. AUDIT: Log dunning level update
  await createAuditLog(
    ctx,
    'update_dunning_level',
    'invoice',
    invoiceId,
    invoice.invoiceNumber,
    `Updated dunning level for invoice ${invoice.invoiceNumber} to level ${data.dunningLevel}`,
    user._id,
    user.name || user.email,
    { dunningLevel: data.dunningLevel, dunningFee }
  );
}

/**
 * Cancel invoice
 */
export async function cancelInvoice(
  ctx: MutationCtx,
  invoiceId: Id<'yourobcInvoices'>,
  reason?: string
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // 3. AUTHORIZE: Check edit permission
  const canEdit = await canEditInvoice(invoice, user);
  await requireAccess(canEdit, 'You do not have permission to cancel this invoice');

  // 4. VALIDATE: Cannot cancel paid invoices
  if (invoice.status === INVOICE_CONSTANTS.STATUS.PAID) {
    throw new Error('Cannot cancel a paid invoice');
  }

  // 5. UPDATE: Mark as cancelled
  const now = Date.now();
  await ctx.db.patch(invoiceId, {
    status: INVOICE_CONSTANTS.STATUS.CANCELLED as any,
    notes: reason ? `${invoice.notes || ''}\n\nCancellation reason: ${reason}` : invoice.notes,
    updatedAt: now,
    updatedBy: user._id,
  });

  // 6. AUDIT: Log cancellation
  await createAuditLog(
    ctx,
    'cancel',
    'invoice',
    invoiceId,
    invoice.invoiceNumber,
    `Cancelled invoice ${invoice.invoiceNumber}`,
    user._id,
    user.name || user.email,
    { reason }
  );
}

/**
 * Auto-update overdue invoices (scheduled task)
 */
export async function autoUpdateOverdueInvoices(ctx: MutationCtx): Promise<number> {
  // Get all non-paid, non-cancelled invoices
  const invoices = await ctx.db
    .query('yourobcInvoices')
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  let updatedCount = 0;
  const now = Date.now();

  for (const invoice of invoices) {
    // Skip if already paid or cancelled
    if (
      invoice.status === INVOICE_CONSTANTS.STATUS.PAID ||
      invoice.status === INVOICE_CONSTANTS.STATUS.CANCELLED
    ) {
      continue;
    }

    // Check if overdue
    if (isInvoiceOverdue(invoice) && invoice.status !== INVOICE_CONSTANTS.STATUS.OVERDUE) {
      // Update status to overdue
      await ctx.db.patch(invoice._id, {
        status: INVOICE_CONSTANTS.STATUS.OVERDUE as any,
        updatedAt: now,
      });

      updatedCount++;

      // Calculate and update dunning level if needed
      const daysOverdue = calculateDaysOverdue(invoice.dueDate);
      const newDunningLevel = calculateDunningLevel(daysOverdue);

      if (newDunningLevel > (invoice.dunningLevel || 0)) {
        const dunningFee = calculateDunningFee(newDunningLevel);
        await ctx.db.patch(invoice._id, {
          dunningLevel: newDunningLevel,
          dunningFee,
          lastDunningDate: now,
        });
      }
    }
  }

  return updatedCount;
}
