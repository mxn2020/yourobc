// convex/lib/yourobc/statistics/mutations.ts
/**
 * Statistics Mutations
 * Write operations for statistics module.
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { statisticsValidators, statisticsFields } from '@/schema/yourobc/statistics/validators';
import { STATISTICS_CONSTANTS } from './constants';
import {
  trimEmployeeCostData,
  validateEmployeeCostData,
  trimOfficeCostData,
  validateOfficeCostData,
  trimMiscExpenseData,
  validateMiscExpenseData,
  trimKpiTargetData,
  validateKpiTargetData,
  trimKpiCacheData,
  validateKpiCacheData,
} from './utils';
import {
  requireEditEmployeeCostAccess,
  requireDeleteEmployeeCostAccess,
  requireEditOfficeCostAccess,
  requireDeleteOfficeCostAccess,
  requireEditMiscExpenseAccess,
  requireDeleteMiscExpenseAccess,
  requireApproveMiscExpenseAccess,
  requireEditKpiTargetAccess,
  requireDeleteKpiTargetAccess,
  requireEditKpiCacheAccess,
  requireDeleteKpiCacheAccess,
} from './permissions';

// ============================================================================
// Employee Cost Mutations
// ============================================================================

/**
 * Create employee cost
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users
 */
export const createEmployeeCost = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      employeeId: v.optional(v.id('yourobcEmployees')),
      employeeName: v.optional(v.string()),
      position: v.string(),
      department: v.optional(v.string()),
      monthlySalary: statisticsFields.currencyAmount,
      benefits: v.optional(statisticsFields.currencyAmount),
      bonuses: v.optional(statisticsFields.currencyAmount),
      otherCosts: v.optional(statisticsFields.currencyAmount),
      startDate: v.number(),
      endDate: v.optional(v.number()),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Trim and validate
    const trimmed = trimEmployeeCostData(data);
    const errors = validateEmployeeCostData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'yourobcStatisticsEmployeeCosts');

    // Insert record
    const id = await ctx.db.insert('yourobcStatisticsEmployeeCosts', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      stats: undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: undefined,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'employee_cost.created',
      entityType: 'yourobcStatisticsEmployeeCosts',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Created employee cost: ${trimmed.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update employee cost
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const updateEmployeeCost = mutation({
  args: {
    id: v.id('yourobcStatisticsEmployeeCosts'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      employeeId: v.optional(v.id('yourobcEmployees')),
      employeeName: v.optional(v.string()),
      position: v.optional(v.string()),
      department: v.optional(v.string()),
      monthlySalary: v.optional(statisticsFields.currencyAmount),
      benefits: v.optional(statisticsFields.currencyAmount),
      bonuses: v.optional(statisticsFields.currencyAmount),
      otherCosts: v.optional(statisticsFields.currencyAmount),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Employee cost not found');
    }

    // Check permissions
    await requireEditEmployeeCostAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimEmployeeCostData(updates);
    const errors = validateEmployeeCostData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'employee_cost.updated',
      entityType: 'yourobcStatisticsEmployeeCosts',
      entityId: existing.publicId,
      entityTitle: trimmed.name ?? existing.name,
      description: `Updated employee cost: ${trimmed.name ?? existing.name}`,
      metadata: { data: { changes: trimmed } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Delete employee cost (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const deleteEmployeeCost = mutation({
  args: { id: v.id('yourobcStatisticsEmployeeCosts') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Employee cost not found');
    }

    // Check permissions
    await requireDeleteEmployeeCostAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'employee_cost.deleted',
      entityType: 'yourobcStatisticsEmployeeCosts',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: `Deleted employee cost: ${existing.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

// ============================================================================
// Office Cost Mutations
// ============================================================================

/**
 * Create office cost
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users
 */
export const createOfficeCost = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.string(),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      amount: statisticsFields.currencyAmount,
      frequency: statisticsValidators.costFrequency,
      date: v.number(),
      endDate: v.optional(v.number()),
      vendor: v.optional(v.string()),
      notes: v.optional(v.string()),
      category: statisticsValidators.officeCostCategory,
      tags: v.optional(v.array(v.string())),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Trim and validate
    const trimmed = trimOfficeCostData(data);
    const errors = validateOfficeCostData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'yourobcStatisticsOfficeCosts');

    // Insert record
    const id = await ctx.db.insert('yourobcStatisticsOfficeCosts', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      stats: undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: undefined,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'office_cost.created',
      entityType: 'yourobcStatisticsOfficeCosts',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Created office cost: ${trimmed.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update office cost
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const updateOfficeCost = mutation({
  args: {
    id: v.id('yourobcStatisticsOfficeCosts'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      amount: v.optional(statisticsFields.currencyAmount),
      frequency: v.optional(statisticsValidators.costFrequency),
      date: v.optional(v.number()),
      endDate: v.optional(v.number()),
      vendor: v.optional(v.string()),
      notes: v.optional(v.string()),
      category: v.optional(statisticsValidators.officeCostCategory),
      tags: v.optional(v.array(v.string())),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Office cost not found');
    }

    // Check permissions
    await requireEditOfficeCostAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimOfficeCostData(updates);
    const errors = validateOfficeCostData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'office_cost.updated',
      entityType: 'yourobcStatisticsOfficeCosts',
      entityId: existing.publicId,
      entityTitle: trimmed.name ?? existing.name,
      description: `Updated office cost: ${trimmed.name ?? existing.name}`,
      metadata: { data: { changes: trimmed } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Delete office cost (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const deleteOfficeCost = mutation({
  args: { id: v.id('yourobcStatisticsOfficeCosts') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Office cost not found');
    }

    // Check permissions
    await requireDeleteOfficeCostAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'office_cost.deleted',
      entityType: 'yourobcStatisticsOfficeCosts',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: `Deleted office cost: ${existing.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

// ============================================================================
// Misc Expense Mutations
// ============================================================================

/**
 * Create misc expense
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users
 */
export const createMiscExpense = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.string(),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      amount: statisticsFields.currencyAmount,
      date: v.number(),
      relatedEmployeeId: v.optional(v.id('yourobcEmployees')),
      relatedProjectId: v.optional(v.id('projects')),
      vendor: v.optional(v.string()),
      receiptUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
      category: statisticsValidators.miscExpenseCategory,
      tags: v.optional(v.array(v.string())),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Trim and validate
    const trimmed = trimMiscExpenseData(data);
    const errors = validateMiscExpenseData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'yourobcStatisticsMiscExpenses');

    // Insert record
    const id = await ctx.db.insert('yourobcStatisticsMiscExpenses', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      approved: false, // Default to not approved
      approvedBy: undefined,
      approvedDate: undefined,
      stats: undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: undefined,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'misc_expense.created',
      entityType: 'yourobcStatisticsMiscExpenses',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Created misc expense: ${trimmed.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update misc expense
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin (only if not approved)
 */
export const updateMiscExpense = mutation({
  args: {
    id: v.id('yourobcStatisticsMiscExpenses'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      amount: v.optional(statisticsFields.currencyAmount),
      date: v.optional(v.number()),
      relatedEmployeeId: v.optional(v.id('yourobcEmployees')),
      relatedProjectId: v.optional(v.id('projects')),
      vendor: v.optional(v.string()),
      receiptUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
      category: v.optional(statisticsValidators.miscExpenseCategory),
      tags: v.optional(v.array(v.string())),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Misc expense not found');
    }

    // Check permissions
    await requireEditMiscExpenseAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimMiscExpenseData(updates);
    const errors = validateMiscExpenseData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'misc_expense.updated',
      entityType: 'yourobcStatisticsMiscExpenses',
      entityId: existing.publicId,
      entityTitle: trimmed.name ?? existing.name,
      description: `Updated misc expense: ${trimmed.name ?? existing.name}`,
      metadata: { data: { changes: trimmed } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Approve or reject misc expense
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin or manager (not expense owner)
 */
export const approveMiscExpense = mutation({
  args: {
    id: v.id('yourobcStatisticsMiscExpenses'),
    approved: v.boolean(),
  },
  handler: async (ctx, { id, approved }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Misc expense not found');
    }

    // Check permissions
    await requireApproveMiscExpenseAccess(existing, user);

    if (existing.approved) {
      throw new Error('Expense has already been approved');
    }

    const now = Date.now();

    // Update approval status
    await ctx.db.patch(id, {
      approved,
      approvedBy: user._id,
      approvedDate: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: approved ? 'misc_expense.approved' : 'misc_expense.rejected',
      entityType: 'yourobcStatisticsMiscExpenses',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: `${approved ? 'Approved' : 'Rejected'} misc expense: ${existing.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Delete misc expense (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin (only if not approved)
 */
export const deleteMiscExpense = mutation({
  args: { id: v.id('yourobcStatisticsMiscExpenses') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Misc expense not found');
    }

    // Check permissions
    await requireDeleteMiscExpenseAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'misc_expense.deleted',
      entityType: 'yourobcStatisticsMiscExpenses',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: `Deleted misc expense: ${existing.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

// ============================================================================
// KPI Target Mutations
// ============================================================================

/**
 * Create KPI target
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users
 */
export const createKpiTarget = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      targetType: statisticsValidators.targetType,
      employeeId: v.optional(v.id('yourobcEmployees')),
      teamName: v.optional(v.string()),
      year: v.number(),
      month: v.optional(v.number()),
      quarter: v.optional(v.number()),
      revenueTarget: v.optional(statisticsFields.currencyAmount),
      marginTarget: v.optional(statisticsFields.currencyAmount),
      quoteCountTarget: v.optional(v.number()),
      orderCountTarget: v.optional(v.number()),
      conversionRateTarget: v.optional(v.number()),
      averageMarginTarget: v.optional(statisticsFields.currencyAmount),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Trim and validate
    const trimmed = trimKpiTargetData(data);
    const errors = validateKpiTargetData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'yourobcStatisticsKpiTargets');

    // Insert record
    const id = await ctx.db.insert('yourobcStatisticsKpiTargets', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      stats: undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: undefined,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'kpi_target.created',
      entityType: 'yourobcStatisticsKpiTargets',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Created KPI target: ${trimmed.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update KPI target
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const updateKpiTarget = mutation({
  args: {
    id: v.id('yourobcStatisticsKpiTargets'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      targetType: v.optional(statisticsValidators.targetType),
      employeeId: v.optional(v.id('yourobcEmployees')),
      teamName: v.optional(v.string()),
      year: v.optional(v.number()),
      month: v.optional(v.number()),
      quarter: v.optional(v.number()),
      revenueTarget: v.optional(statisticsFields.currencyAmount),
      marginTarget: v.optional(statisticsFields.currencyAmount),
      quoteCountTarget: v.optional(v.number()),
      orderCountTarget: v.optional(v.number()),
      conversionRateTarget: v.optional(v.number()),
      averageMarginTarget: v.optional(statisticsFields.currencyAmount),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('KPI target not found');
    }

    // Check permissions
    await requireEditKpiTargetAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimKpiTargetData(updates);
    const errors = validateKpiTargetData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'kpi_target.updated',
      entityType: 'yourobcStatisticsKpiTargets',
      entityId: existing.publicId,
      entityTitle: trimmed.name ?? existing.name,
      description: `Updated KPI target: ${trimmed.name ?? existing.name}`,
      metadata: { data: { changes: trimmed } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Delete KPI target (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const deleteKpiTarget = mutation({
  args: { id: v.id('yourobcStatisticsKpiTargets') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('KPI target not found');
    }

    // Check permissions
    await requireDeleteKpiTargetAccess(existing, user);

    const now = Date.now();

//Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'kpi_target.deleted',
      entityType: 'yourobcStatisticsKpiTargets',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: `Deleted KPI target: ${existing.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

// ============================================================================
// KPI Cache Mutations
// ============================================================================

/**
 * Create KPI cache
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users
 */
export const createKpiCache = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      cacheType: statisticsValidators.kpiCacheType,
      entityId: v.optional(v.string()),
      entityName: v.optional(v.string()),
      year: v.number(),
      month: v.optional(v.number()),
      quarter: v.optional(v.number()),
      totalRevenue: statisticsFields.currencyAmount,
      totalCost: v.optional(statisticsFields.currencyAmount),
      totalMargin: statisticsFields.currencyAmount,
      averageMargin: statisticsFields.currencyAmount,
      quoteCount: v.number(),
      averageQuoteValue: statisticsFields.currencyAmount,
      orderCount: v.number(),
      averageOrderValue: statisticsFields.currencyAmount,
      averageMarginPerOrder: statisticsFields.currencyAmount,
      conversionRate: v.number(),
      totalCommission: v.optional(statisticsFields.currencyAmount),
      previousPeriodRevenue: v.optional(statisticsFields.currencyAmount),
      previousPeriodMargin: v.optional(statisticsFields.currencyAmount),
      growthRate: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Trim and validate
    const trimmed = trimKpiCacheData(data);
    const errors = validateKpiCacheData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'yourobcStatisticsKpiCache');

    // Insert record
    const id = await ctx.db.insert('yourobcStatisticsKpiCache', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      calculatedAt: now,
      calculatedBy: user._id,
      stats: undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: undefined,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'kpi_cache.created',
      entityType: 'yourobcStatisticsKpiCache',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Created KPI cache: ${trimmed.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update KPI cache
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const updateKpiCache = mutation({
  args: {
    id: v.id('yourobcStatisticsKpiCache'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      cacheType: v.optional(statisticsValidators.kpiCacheType),
      entityId: v.optional(v.string()),
      entityName: v.optional(v.string()),
      year: v.optional(v.number()),
      month: v.optional(v.number()),
      quarter: v.optional(v.number()),
      totalRevenue: v.optional(statisticsFields.currencyAmount),
      totalCost: v.optional(statisticsFields.currencyAmount),
      totalMargin: v.optional(statisticsFields.currencyAmount),
      averageMargin: v.optional(statisticsFields.currencyAmount),
      quoteCount: v.optional(v.number()),
      averageQuoteValue: v.optional(statisticsFields.currencyAmount),
      orderCount: v.optional(v.number()),
      averageOrderValue: v.optional(statisticsFields.currencyAmount),
      averageMarginPerOrder: v.optional(statisticsFields.currencyAmount),
      conversionRate: v.optional(v.number()),
      totalCommission: v.optional(statisticsFields.currencyAmount),
      previousPeriodRevenue: v.optional(statisticsFields.currencyAmount),
      previousPeriodMargin: v.optional(statisticsFields.currencyAmount),
      growthRate: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.any()),
      useCase: v.optional(v.string()),
      difficulty: v.optional(statisticsValidators.difficulty),
      visibility: v.optional(statisticsValidators.visibility),
      isOfficial: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('KPI cache not found');
    }

    // Check permissions
    await requireEditKpiCacheAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimKpiCacheData(updates);
    const errors = validateKpiCacheData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      calculatedAt: now,
      calculatedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'kpi_cache.updated',
      entityType: 'yourobcStatisticsKpiCache',
      entityId: existing.publicId,
      entityTitle: trimmed.name ?? existing.name,
      description: `Updated KPI cache: ${trimmed.name ?? existing.name}`,
      metadata: { data: { changes: trimmed } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Delete KPI cache (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const deleteKpiCache = mutation({
  args: { id: v.id('yourobcStatisticsKpiCache') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('KPI cache not found');
    }

    // Check permissions
    await requireDeleteKpiCacheAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'kpi_cache.deleted',
      entityType: 'yourobcStatisticsKpiCache',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: `Deleted KPI cache: ${existing.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
