// convex/lib/yourobc/statistics/mutations.ts
/**
 * Statistics Mutation Operations
 *
 * Write operations for all 5 statistics tables.
 * Provides create, update, delete for employee costs, office costs,
 * miscellaneous expenses, KPI targets, and KPI cache entries.
 *
 * @module convex/lib/yourobc/statistics/mutations
 */

import { MutationCtx } from '../../../_generated/server'
import { Id } from '../../../_generated/dataModel'
import type {
  CreateEmployeeCostArgs,
  UpdateEmployeeCostArgs,
  CreateOfficeCostArgs,
  UpdateOfficeCostArgs,
  CreateMiscExpenseArgs,
  UpdateMiscExpenseArgs,
  ApproveExpenseArgs,
  CreateKpiTargetArgs,
  UpdateKpiTargetArgs,
  CreateKpiCacheArgs,
  UpdateKpiCacheArgs,
} from './types'
import {
  canEditEmployeeCost,
  canDeleteEmployeeCost,
  canEditOfficeCost,
  canDeleteOfficeCost,
  canEditMiscExpense,
  canDeleteMiscExpense,
  canApproveMiscExpense,
  canEditKpiTarget,
  canDeleteKpiTarget,
  canEditKpiCache,
  canDeleteKpiCache,
  getAuthUserId,
} from './permissions'
import {
  generateEmployeeCostPublicId,
  generateOfficeCostPublicId,
  generateMiscExpensePublicId,
  generateKpiTargetPublicId,
  generateKpiCachePublicId,
  validateDateRange,
} from './utils'
import { ERROR_MESSAGES } from './constants'

// ============================================================================
// Employee Cost Mutations
// ============================================================================

/**
 * Create employee cost entry
 */
export async function createEmployeeCost(
  ctx: MutationCtx,
  args: CreateEmployeeCostArgs
): Promise<Id<'yourobcStatisticsEmployeeCosts'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  // Validate date range
  if (!validateDateRange(args.startDate, args.endDate)) {
    throw new Error(ERROR_MESSAGES.INVALID_EMPLOYEE_COST_DATES)
  }

  const employeeCostId = await ctx.db.insert('yourobcStatisticsEmployeeCosts', {
    publicId: generateEmployeeCostPublicId(),
    name: args.name,
    description: args.description,
    icon: args.icon,
    thumbnail: args.thumbnail,
    employeeId: args.employeeId,
    employeeName: args.employeeName,
    position: args.position,
    department: args.department,
    monthlySalary: args.monthlySalary,
    benefits: args.benefits,
    bonuses: args.bonuses,
    otherCosts: args.otherCosts,
    startDate: args.startDate,
    endDate: args.endDate,
    notes: args.notes,
    tags: args.tags || [],
    category: args.category,
    customFields: args.customFields,
    useCase: args.useCase,
    difficulty: args.difficulty,
    visibility: args.visibility,
    ownerId: userId,
    isOfficial: args.isOfficial,
    stats: undefined,
    createdBy: userId,
    createdAt: now,
    updatedBy: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    deletedBy: undefined,
  })

  return employeeCostId
}

/**
 * Update employee cost entry
 */
export async function updateEmployeeCost(
  ctx: MutationCtx,
  args: UpdateEmployeeCostArgs
): Promise<Id<'yourobcStatisticsEmployeeCosts'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const employeeCost = await ctx.db.get(args.id)
  if (!employeeCost) {
    throw new Error(ERROR_MESSAGES.EMPLOYEE_COST_NOT_FOUND)
  }

  if (!canEditEmployeeCost(userId, employeeCost)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  // Validate date range if dates are being updated
  const startDate = args.startDate ?? employeeCost.startDate
  const endDate = args.endDate ?? employeeCost.endDate
  if (!validateDateRange(startDate, endDate)) {
    throw new Error(ERROR_MESSAGES.INVALID_EMPLOYEE_COST_DATES)
  }

  await ctx.db.patch(args.id, {
    ...(args.name !== undefined && { name: args.name }),
    ...(args.description !== undefined && { description: args.description }),
    ...(args.icon !== undefined && { icon: args.icon }),
    ...(args.thumbnail !== undefined && { thumbnail: args.thumbnail }),
    ...(args.employeeId !== undefined && { employeeId: args.employeeId }),
    ...(args.employeeName !== undefined && { employeeName: args.employeeName }),
    ...(args.position !== undefined && { position: args.position }),
    ...(args.department !== undefined && { department: args.department }),
    ...(args.monthlySalary !== undefined && { monthlySalary: args.monthlySalary }),
    ...(args.benefits !== undefined && { benefits: args.benefits }),
    ...(args.bonuses !== undefined && { bonuses: args.bonuses }),
    ...(args.otherCosts !== undefined && { otherCosts: args.otherCosts }),
    ...(args.startDate !== undefined && { startDate: args.startDate }),
    ...(args.endDate !== undefined && { endDate: args.endDate }),
    ...(args.notes !== undefined && { notes: args.notes }),
    ...(args.tags !== undefined && { tags: args.tags }),
    ...(args.category !== undefined && { category: args.category }),
    ...(args.customFields !== undefined && { customFields: args.customFields }),
    ...(args.useCase !== undefined && { useCase: args.useCase }),
    ...(args.difficulty !== undefined && { difficulty: args.difficulty }),
    ...(args.visibility !== undefined && { visibility: args.visibility }),
    ...(args.isOfficial !== undefined && { isOfficial: args.isOfficial }),
    updatedBy: userId,
    updatedAt: now,
  })

  return args.id
}

/**
 * Delete employee cost entry (soft delete)
 */
export async function deleteEmployeeCost(
  ctx: MutationCtx,
  id: Id<'yourobcStatisticsEmployeeCosts'>
): Promise<void> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const employeeCost = await ctx.db.get(id)
  if (!employeeCost) {
    throw new Error(ERROR_MESSAGES.EMPLOYEE_COST_NOT_FOUND)
  }

  if (!canDeleteEmployeeCost(userId, employeeCost)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  await ctx.db.patch(id, {
    deletedAt: now,
    deletedBy: userId,
  })
}

// ============================================================================
// Office Cost Mutations
// ============================================================================

/**
 * Create office cost entry
 */
export async function createOfficeCost(
  ctx: MutationCtx,
  args: CreateOfficeCostArgs
): Promise<Id<'yourobcStatisticsOfficeCosts'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  // Validate date range
  if (!validateDateRange(args.date, args.endDate)) {
    throw new Error(ERROR_MESSAGES.INVALID_OFFICE_COST_DATES)
  }

  const officeCostId = await ctx.db.insert('yourobcStatisticsOfficeCosts', {
    publicId: generateOfficeCostPublicId(),
    name: args.name,
    description: args.description,
    icon: args.icon,
    thumbnail: args.thumbnail,
    amount: args.amount,
    frequency: args.frequency,
    date: args.date,
    endDate: args.endDate,
    vendor: args.vendor,
    notes: args.notes,
    tags: args.tags || [],
    category: args.category,
    customFields: args.customFields,
    useCase: args.useCase,
    difficulty: args.difficulty,
    visibility: args.visibility,
    ownerId: userId,
    isOfficial: args.isOfficial,
    stats: undefined,
    createdBy: userId,
    createdAt: now,
    updatedBy: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    deletedBy: undefined,
  })

  return officeCostId
}

/**
 * Update office cost entry
 */
export async function updateOfficeCost(
  ctx: MutationCtx,
  args: UpdateOfficeCostArgs
): Promise<Id<'yourobcStatisticsOfficeCosts'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const officeCost = await ctx.db.get(args.id)
  if (!officeCost) {
    throw new Error(ERROR_MESSAGES.OFFICE_COST_NOT_FOUND)
  }

  if (!canEditOfficeCost(userId, officeCost)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  // Validate date range if dates are being updated
  const date = args.date ?? officeCost.date
  const endDate = args.endDate ?? officeCost.endDate
  if (!validateDateRange(date, endDate)) {
    throw new Error(ERROR_MESSAGES.INVALID_OFFICE_COST_DATES)
  }

  await ctx.db.patch(args.id, {
    ...(args.name !== undefined && { name: args.name }),
    ...(args.description !== undefined && { description: args.description }),
    ...(args.icon !== undefined && { icon: args.icon }),
    ...(args.thumbnail !== undefined && { thumbnail: args.thumbnail }),
    ...(args.amount !== undefined && { amount: args.amount }),
    ...(args.frequency !== undefined && { frequency: args.frequency }),
    ...(args.date !== undefined && { date: args.date }),
    ...(args.endDate !== undefined && { endDate: args.endDate }),
    ...(args.vendor !== undefined && { vendor: args.vendor }),
    ...(args.notes !== undefined && { notes: args.notes }),
    ...(args.tags !== undefined && { tags: args.tags }),
    ...(args.category !== undefined && { category: args.category }),
    ...(args.customFields !== undefined && { customFields: args.customFields }),
    ...(args.useCase !== undefined && { useCase: args.useCase }),
    ...(args.difficulty !== undefined && { difficulty: args.difficulty }),
    ...(args.visibility !== undefined && { visibility: args.visibility }),
    ...(args.isOfficial !== undefined && { isOfficial: args.isOfficial }),
    updatedBy: userId,
    updatedAt: now,
  })

  return args.id
}

/**
 * Delete office cost entry (soft delete)
 */
export async function deleteOfficeCost(
  ctx: MutationCtx,
  id: Id<'yourobcStatisticsOfficeCosts'>
): Promise<void> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const officeCost = await ctx.db.get(id)
  if (!officeCost) {
    throw new Error(ERROR_MESSAGES.OFFICE_COST_NOT_FOUND)
  }

  if (!canDeleteOfficeCost(userId, officeCost)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  await ctx.db.patch(id, {
    deletedAt: now,
    deletedBy: userId,
  })
}

// ============================================================================
// Miscellaneous Expense Mutations
// ============================================================================

/**
 * Create miscellaneous expense
 */
export async function createMiscExpense(
  ctx: MutationCtx,
  args: CreateMiscExpenseArgs
): Promise<Id<'yourobcStatisticsMiscExpenses'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const miscExpenseId = await ctx.db.insert('yourobcStatisticsMiscExpenses', {
    publicId: generateMiscExpensePublicId(),
    name: args.name,
    description: args.description,
    icon: args.icon,
    thumbnail: args.thumbnail,
    amount: args.amount,
    date: args.date,
    relatedEmployeeId: args.relatedEmployeeId,
    relatedProjectId: args.relatedProjectId,
    vendor: args.vendor,
    receiptUrl: args.receiptUrl,
    approved: args.approved ?? false,
    approvedBy: args.approvedBy,
    approvedDate: args.approvedDate,
    notes: args.notes,
    tags: args.tags || [],
    category: args.category,
    customFields: args.customFields,
    useCase: args.useCase,
    difficulty: args.difficulty,
    visibility: args.visibility,
    ownerId: userId,
    isOfficial: args.isOfficial,
    stats: undefined,
    createdBy: userId,
    createdAt: now,
    updatedBy: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    deletedBy: undefined,
  })

  return miscExpenseId
}

/**
 * Update miscellaneous expense
 */
export async function updateMiscExpense(
  ctx: MutationCtx,
  args: UpdateMiscExpenseArgs
): Promise<Id<'yourobcStatisticsMiscExpenses'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const miscExpense = await ctx.db.get(args.id)
  if (!miscExpense) {
    throw new Error(ERROR_MESSAGES.MISC_EXPENSE_NOT_FOUND)
  }

  if (!canEditMiscExpense(userId, miscExpense)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  await ctx.db.patch(args.id, {
    ...(args.name !== undefined && { name: args.name }),
    ...(args.description !== undefined && { description: args.description }),
    ...(args.icon !== undefined && { icon: args.icon }),
    ...(args.thumbnail !== undefined && { thumbnail: args.thumbnail }),
    ...(args.amount !== undefined && { amount: args.amount }),
    ...(args.date !== undefined && { date: args.date }),
    ...(args.relatedEmployeeId !== undefined && { relatedEmployeeId: args.relatedEmployeeId }),
    ...(args.relatedProjectId !== undefined && { relatedProjectId: args.relatedProjectId }),
    ...(args.vendor !== undefined && { vendor: args.vendor }),
    ...(args.receiptUrl !== undefined && { receiptUrl: args.receiptUrl }),
    ...(args.approved !== undefined && { approved: args.approved }),
    ...(args.approvedBy !== undefined && { approvedBy: args.approvedBy }),
    ...(args.approvedDate !== undefined && { approvedDate: args.approvedDate }),
    ...(args.notes !== undefined && { notes: args.notes }),
    ...(args.tags !== undefined && { tags: args.tags }),
    ...(args.category !== undefined && { category: args.category }),
    ...(args.customFields !== undefined && { customFields: args.customFields }),
    ...(args.useCase !== undefined && { useCase: args.useCase }),
    ...(args.difficulty !== undefined && { difficulty: args.difficulty }),
    ...(args.visibility !== undefined && { visibility: args.visibility }),
    ...(args.isOfficial !== undefined && { isOfficial: args.isOfficial }),
    updatedBy: userId,
    updatedAt: now,
  })

  return args.id
}

/**
 * Approve or reject miscellaneous expense
 */
export async function approveMiscExpense(
  ctx: MutationCtx,
  args: ApproveExpenseArgs
): Promise<Id<'yourobcStatisticsMiscExpenses'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const miscExpense = await ctx.db.get(args.id)
  if (!miscExpense) {
    throw new Error(ERROR_MESSAGES.MISC_EXPENSE_NOT_FOUND)
  }

  if (!canApproveMiscExpense(userId, miscExpense)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  if (miscExpense.approved) {
    throw new Error(ERROR_MESSAGES.EXPENSE_ALREADY_APPROVED)
  }

  await ctx.db.patch(args.id, {
    approved: args.approved,
    approvedBy: args.approvedBy ?? userId,
    approvedDate: args.approvedDate ?? now,
    updatedBy: userId,
    updatedAt: now,
  })

  return args.id
}

/**
 * Delete miscellaneous expense (soft delete)
 */
export async function deleteMiscExpense(
  ctx: MutationCtx,
  id: Id<'yourobcStatisticsMiscExpenses'>
): Promise<void> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const miscExpense = await ctx.db.get(id)
  if (!miscExpense) {
    throw new Error(ERROR_MESSAGES.MISC_EXPENSE_NOT_FOUND)
  }

  if (!canDeleteMiscExpense(userId, miscExpense)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  await ctx.db.patch(id, {
    deletedAt: now,
    deletedBy: userId,
  })
}

// ============================================================================
// KPI Target Mutations
// ============================================================================

/**
 * Create KPI target
 */
export async function createKpiTarget(
  ctx: MutationCtx,
  args: CreateKpiTargetArgs
): Promise<Id<'yourobcStatisticsKpiTargets'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const kpiTargetId = await ctx.db.insert('yourobcStatisticsKpiTargets', {
    publicId: generateKpiTargetPublicId(),
    name: args.name,
    description: args.description,
    icon: args.icon,
    thumbnail: args.thumbnail,
    targetType: args.targetType,
    employeeId: args.employeeId,
    teamName: args.teamName,
    year: args.year,
    month: args.month,
    quarter: args.quarter,
    revenueTarget: args.revenueTarget,
    marginTarget: args.marginTarget,
    quoteCountTarget: args.quoteCountTarget,
    orderCountTarget: args.orderCountTarget,
    conversionRateTarget: args.conversionRateTarget,
    averageMarginTarget: args.averageMarginTarget,
    notes: args.notes,
    tags: args.tags || [],
    category: args.category,
    customFields: args.customFields,
    useCase: args.useCase,
    difficulty: args.difficulty,
    visibility: args.visibility,
    ownerId: userId,
    isOfficial: args.isOfficial,
    stats: undefined,
    createdBy: userId,
    createdAt: now,
    updatedBy: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    deletedBy: undefined,
  })

  return kpiTargetId
}

/**
 * Update KPI target
 */
export async function updateKpiTarget(
  ctx: MutationCtx,
  args: UpdateKpiTargetArgs
): Promise<Id<'yourobcStatisticsKpiTargets'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const kpiTarget = await ctx.db.get(args.id)
  if (!kpiTarget) {
    throw new Error(ERROR_MESSAGES.KPI_TARGET_NOT_FOUND)
  }

  if (!canEditKpiTarget(userId, kpiTarget)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  await ctx.db.patch(args.id, {
    ...(args.name !== undefined && { name: args.name }),
    ...(args.description !== undefined && { description: args.description }),
    ...(args.icon !== undefined && { icon: args.icon }),
    ...(args.thumbnail !== undefined && { thumbnail: args.thumbnail }),
    ...(args.targetType !== undefined && { targetType: args.targetType }),
    ...(args.employeeId !== undefined && { employeeId: args.employeeId }),
    ...(args.teamName !== undefined && { teamName: args.teamName }),
    ...(args.year !== undefined && { year: args.year }),
    ...(args.month !== undefined && { month: args.month }),
    ...(args.quarter !== undefined && { quarter: args.quarter }),
    ...(args.revenueTarget !== undefined && { revenueTarget: args.revenueTarget }),
    ...(args.marginTarget !== undefined && { marginTarget: args.marginTarget }),
    ...(args.quoteCountTarget !== undefined && { quoteCountTarget: args.quoteCountTarget }),
    ...(args.orderCountTarget !== undefined && { orderCountTarget: args.orderCountTarget }),
    ...(args.conversionRateTarget !== undefined && { conversionRateTarget: args.conversionRateTarget }),
    ...(args.averageMarginTarget !== undefined && { averageMarginTarget: args.averageMarginTarget }),
    ...(args.notes !== undefined && { notes: args.notes }),
    ...(args.tags !== undefined && { tags: args.tags }),
    ...(args.category !== undefined && { category: args.category }),
    ...(args.customFields !== undefined && { customFields: args.customFields }),
    ...(args.useCase !== undefined && { useCase: args.useCase }),
    ...(args.difficulty !== undefined && { difficulty: args.difficulty }),
    ...(args.visibility !== undefined && { visibility: args.visibility }),
    ...(args.isOfficial !== undefined && { isOfficial: args.isOfficial }),
    updatedBy: userId,
    updatedAt: now,
  })

  return args.id
}

/**
 * Delete KPI target (soft delete)
 */
export async function deleteKpiTarget(
  ctx: MutationCtx,
  id: Id<'yourobcStatisticsKpiTargets'>
): Promise<void> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const kpiTarget = await ctx.db.get(id)
  if (!kpiTarget) {
    throw new Error(ERROR_MESSAGES.KPI_TARGET_NOT_FOUND)
  }

  if (!canDeleteKpiTarget(userId, kpiTarget)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  await ctx.db.patch(id, {
    deletedAt: now,
    deletedBy: userId,
  })
}

// ============================================================================
// KPI Cache Mutations
// ============================================================================

/**
 * Create KPI cache entry
 */
export async function createKpiCache(
  ctx: MutationCtx,
  args: CreateKpiCacheArgs
): Promise<Id<'yourobcStatisticsKpiCache'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const kpiCacheId = await ctx.db.insert('yourobcStatisticsKpiCache', {
    publicId: generateKpiCachePublicId(),
    name: args.name,
    description: args.description,
    icon: args.icon,
    thumbnail: args.thumbnail,
    cacheType: args.cacheType,
    entityId: args.entityId,
    entityName: args.entityName,
    year: args.year,
    month: args.month,
    quarter: args.quarter,
    totalRevenue: args.totalRevenue,
    totalCost: args.totalCost,
    totalMargin: args.totalMargin,
    averageMargin: args.averageMargin,
    quoteCount: args.quoteCount,
    averageQuoteValue: args.averageQuoteValue,
    orderCount: args.orderCount,
    averageOrderValue: args.averageOrderValue,
    averageMarginPerOrder: args.averageMarginPerOrder,
    conversionRate: args.conversionRate,
    totalCommission: args.totalCommission,
    previousPeriodRevenue: args.previousPeriodRevenue,
    previousPeriodMargin: args.previousPeriodMargin,
    growthRate: args.growthRate,
    calculatedAt: args.calculatedAt,
    calculatedBy: args.calculatedBy,
    tags: args.tags || [],
    category: args.category,
    customFields: args.customFields,
    useCase: args.useCase,
    difficulty: args.difficulty,
    visibility: args.visibility,
    ownerId: userId,
    isOfficial: args.isOfficial,
    stats: undefined,
    createdBy: userId,
    createdAt: now,
    updatedBy: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    deletedBy: undefined,
  })

  return kpiCacheId
}

/**
 * Update KPI cache entry
 */
export async function updateKpiCache(
  ctx: MutationCtx,
  args: UpdateKpiCacheArgs
): Promise<Id<'yourobcStatisticsKpiCache'>> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const kpiCache = await ctx.db.get(args.id)
  if (!kpiCache) {
    throw new Error(ERROR_MESSAGES.KPI_CACHE_NOT_FOUND)
  }

  if (!canEditKpiCache(userId, kpiCache)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  await ctx.db.patch(args.id, {
    ...(args.name !== undefined && { name: args.name }),
    ...(args.description !== undefined && { description: args.description }),
    ...(args.icon !== undefined && { icon: args.icon }),
    ...(args.thumbnail !== undefined && { thumbnail: args.thumbnail }),
    ...(args.cacheType !== undefined && { cacheType: args.cacheType }),
    ...(args.entityId !== undefined && { entityId: args.entityId }),
    ...(args.entityName !== undefined && { entityName: args.entityName }),
    ...(args.year !== undefined && { year: args.year }),
    ...(args.month !== undefined && { month: args.month }),
    ...(args.quarter !== undefined && { quarter: args.quarter }),
    ...(args.totalRevenue !== undefined && { totalRevenue: args.totalRevenue }),
    ...(args.totalCost !== undefined && { totalCost: args.totalCost }),
    ...(args.totalMargin !== undefined && { totalMargin: args.totalMargin }),
    ...(args.averageMargin !== undefined && { averageMargin: args.averageMargin }),
    ...(args.quoteCount !== undefined && { quoteCount: args.quoteCount }),
    ...(args.averageQuoteValue !== undefined && { averageQuoteValue: args.averageQuoteValue }),
    ...(args.orderCount !== undefined && { orderCount: args.orderCount }),
    ...(args.averageOrderValue !== undefined && { averageOrderValue: args.averageOrderValue }),
    ...(args.averageMarginPerOrder !== undefined && { averageMarginPerOrder: args.averageMarginPerOrder }),
    ...(args.conversionRate !== undefined && { conversionRate: args.conversionRate }),
    ...(args.totalCommission !== undefined && { totalCommission: args.totalCommission }),
    ...(args.previousPeriodRevenue !== undefined && { previousPeriodRevenue: args.previousPeriodRevenue }),
    ...(args.previousPeriodMargin !== undefined && { previousPeriodMargin: args.previousPeriodMargin }),
    ...(args.growthRate !== undefined && { growthRate: args.growthRate }),
    ...(args.calculatedAt !== undefined && { calculatedAt: args.calculatedAt }),
    ...(args.calculatedBy !== undefined && { calculatedBy: args.calculatedBy }),
    ...(args.tags !== undefined && { tags: args.tags }),
    ...(args.category !== undefined && { category: args.category }),
    ...(args.customFields !== undefined && { customFields: args.customFields }),
    ...(args.useCase !== undefined && { useCase: args.useCase }),
    ...(args.difficulty !== undefined && { difficulty: args.difficulty }),
    ...(args.visibility !== undefined && { visibility: args.visibility }),
    ...(args.isOfficial !== undefined && { isOfficial: args.isOfficial }),
    updatedBy: userId,
    updatedAt: now,
  })

  return args.id
}

/**
 * Delete KPI cache entry (soft delete)
 */
export async function deleteKpiCache(
  ctx: MutationCtx,
  id: Id<'yourobcStatisticsKpiCache'>
): Promise<void> {
  const userId = await getAuthUserId(ctx)
  const now = Date.now()

  const kpiCache = await ctx.db.get(id)
  if (!kpiCache) {
    throw new Error(ERROR_MESSAGES.KPI_CACHE_NOT_FOUND)
  }

  if (!canDeleteKpiCache(userId, kpiCache)) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  await ctx.db.patch(id, {
    deletedAt: now,
    deletedBy: userId,
  })
}
