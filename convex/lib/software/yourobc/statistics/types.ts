// convex/lib/software/yourobc/statistics/types.ts
/**
 * Statistics Library Types
 *
 * Type definitions for statistics operations, DTOs, and function arguments.
 * Provides type-safe interfaces for CRUD operations across all 5 statistics tables.
 *
 * @module convex/lib/software/yourobc/statistics/types
 */

import { Id } from '../../../../_generated/dataModel'

// ============================================================================
// Re-export Schema Types
// ============================================================================

export type {
  EmployeeCost,
  OfficeCost,
  MiscExpense,
  KpiTarget,
  KpiCache,
  StatisticsEntity,
  StatisticsTableName,
  OfficeCostCategory,
  CostFrequency,
  MiscExpenseCategory,
  TargetType,
  KpiCacheType,
  Difficulty,
  Visibility,
} from '../../../../schema/software/yourobc/statistics/types'

// ============================================================================
// Currency Amount Type
// ============================================================================

/**
 * Currency amount with exchange rate support
 */
export interface CurrencyAmount {
  amount: number
  currency: 'EUR' | 'USD'
  exchangeRate?: number
  exchangeRateDate?: number
}

// ============================================================================
// Employee Cost Types
// ============================================================================

/**
 * Employee cost creation arguments
 */
export interface CreateEmployeeCostArgs {
  name: string
  description?: string
  icon?: string
  thumbnail?: string
  employeeId?: Id<'yourobcEmployees'>
  employeeName?: string
  position: string
  department?: string
  monthlySalary: CurrencyAmount
  benefits?: CurrencyAmount
  bonuses?: CurrencyAmount
  otherCosts?: CurrencyAmount
  startDate: number
  endDate?: number
  notes?: string
  tags?: string[]
  category?: string
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

/**
 * Employee cost update arguments
 */
export interface UpdateEmployeeCostArgs {
  id: Id<'yourobcStatisticsEmployeeCosts'>
  name?: string
  description?: string
  icon?: string
  thumbnail?: string
  employeeId?: Id<'yourobcEmployees'>
  employeeName?: string
  position?: string
  department?: string
  monthlySalary?: CurrencyAmount
  benefits?: CurrencyAmount
  bonuses?: CurrencyAmount
  otherCosts?: CurrencyAmount
  startDate?: number
  endDate?: number
  notes?: string
  tags?: string[]
  category?: string
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

// ============================================================================
// Office Cost Types
// ============================================================================

/**
 * Office cost creation arguments
 */
export interface CreateOfficeCostArgs {
  name: string
  description: string
  icon?: string
  thumbnail?: string
  amount: CurrencyAmount
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly'
  date: number
  endDate?: number
  vendor?: string
  notes?: string
  category: 'rent' | 'utilities' | 'insurance' | 'maintenance' | 'supplies' | 'technology' | 'other'
  tags?: string[]
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

/**
 * Office cost update arguments
 */
export interface UpdateOfficeCostArgs {
  id: Id<'yourobcStatisticsOfficeCosts'>
  name?: string
  description?: string
  icon?: string
  thumbnail?: string
  amount?: CurrencyAmount
  frequency?: 'one_time' | 'monthly' | 'quarterly' | 'yearly'
  date?: number
  endDate?: number
  vendor?: string
  notes?: string
  category?: 'rent' | 'utilities' | 'insurance' | 'maintenance' | 'supplies' | 'technology' | 'other'
  tags?: string[]
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

// ============================================================================
// Miscellaneous Expense Types
// ============================================================================

/**
 * Miscellaneous expense creation arguments
 */
export interface CreateMiscExpenseArgs {
  name: string
  description: string
  icon?: string
  thumbnail?: string
  amount: CurrencyAmount
  date: number
  relatedEmployeeId?: Id<'yourobcEmployees'>
  relatedProjectId?: Id<'projects'>
  vendor?: string
  receiptUrl?: string
  approved?: boolean
  approvedBy?: string
  approvedDate?: number
  notes?: string
  category: 'trade_show' | 'marketing' | 'tools' | 'software' | 'travel' | 'entertainment' | 'other'
  tags?: string[]
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

/**
 * Miscellaneous expense update arguments
 */
export interface UpdateMiscExpenseArgs {
  id: Id<'yourobcStatisticsMiscExpenses'>
  name?: string
  description?: string
  icon?: string
  thumbnail?: string
  amount?: CurrencyAmount
  date?: number
  relatedEmployeeId?: Id<'yourobcEmployees'>
  relatedProjectId?: Id<'projects'>
  vendor?: string
  receiptUrl?: string
  approved?: boolean
  approvedBy?: string
  approvedDate?: number
  notes?: string
  category?: 'trade_show' | 'marketing' | 'tools' | 'software' | 'travel' | 'entertainment' | 'other'
  tags?: string[]
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

/**
 * Expense approval arguments
 */
export interface ApproveExpenseArgs {
  id: Id<'yourobcStatisticsMiscExpenses'>
  approved: boolean
  approvedBy?: string
  approvedDate?: number
}

// ============================================================================
// KPI Target Types
// ============================================================================

/**
 * KPI target creation arguments
 */
export interface CreateKpiTargetArgs {
  name: string
  description?: string
  icon?: string
  thumbnail?: string
  targetType: 'employee' | 'team' | 'company'
  employeeId?: Id<'yourobcEmployees'>
  teamName?: string
  year: number
  month?: number
  quarter?: number
  revenueTarget?: CurrencyAmount
  marginTarget?: CurrencyAmount
  quoteCountTarget?: number
  orderCountTarget?: number
  conversionRateTarget?: number
  averageMarginTarget?: CurrencyAmount
  notes?: string
  tags?: string[]
  category?: string
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

/**
 * KPI target update arguments
 */
export interface UpdateKpiTargetArgs {
  id: Id<'yourobcStatisticsKpiTargets'>
  name?: string
  description?: string
  icon?: string
  thumbnail?: string
  targetType?: 'employee' | 'team' | 'company'
  employeeId?: Id<'yourobcEmployees'>
  teamName?: string
  year?: number
  month?: number
  quarter?: number
  revenueTarget?: CurrencyAmount
  marginTarget?: CurrencyAmount
  quoteCountTarget?: number
  orderCountTarget?: number
  conversionRateTarget?: number
  averageMarginTarget?: CurrencyAmount
  notes?: string
  tags?: string[]
  category?: string
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

// ============================================================================
// KPI Cache Types
// ============================================================================

/**
 * KPI cache creation arguments
 */
export interface CreateKpiCacheArgs {
  name: string
  description?: string
  icon?: string
  thumbnail?: string
  cacheType: 'employee' | 'customer' | 'company' | 'department'
  entityId?: string
  entityName?: string
  year: number
  month?: number
  quarter?: number
  totalRevenue: CurrencyAmount
  totalCost?: CurrencyAmount
  totalMargin: CurrencyAmount
  averageMargin: CurrencyAmount
  quoteCount: number
  averageQuoteValue: CurrencyAmount
  orderCount: number
  averageOrderValue: CurrencyAmount
  averageMarginPerOrder: CurrencyAmount
  conversionRate: number
  totalCommission?: CurrencyAmount
  previousPeriodRevenue?: CurrencyAmount
  previousPeriodMargin?: CurrencyAmount
  growthRate?: number
  calculatedAt: number
  calculatedBy: string
  tags?: string[]
  category?: string
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

/**
 * KPI cache update arguments
 */
export interface UpdateKpiCacheArgs {
  id: Id<'yourobcStatisticsKpiCache'>
  name?: string
  description?: string
  icon?: string
  thumbnail?: string
  cacheType?: 'employee' | 'customer' | 'company' | 'department'
  entityId?: string
  entityName?: string
  year?: number
  month?: number
  quarter?: number
  totalRevenue?: CurrencyAmount
  totalCost?: CurrencyAmount
  totalMargin?: CurrencyAmount
  averageMargin?: CurrencyAmount
  quoteCount?: number
  averageQuoteValue?: CurrencyAmount
  orderCount?: number
  averageOrderValue?: CurrencyAmount
  averageMarginPerOrder?: CurrencyAmount
  conversionRate?: number
  totalCommission?: CurrencyAmount
  previousPeriodRevenue?: CurrencyAmount
  previousPeriodMargin?: CurrencyAmount
  growthRate?: number
  calculatedAt?: number
  calculatedBy?: string
  tags?: string[]
  category?: string
  customFields?: Record<string, unknown>
  useCase?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  isOfficial?: boolean
}

// ============================================================================
// Query Filter Types
// ============================================================================

/**
 * Employee cost filter arguments
 */
export interface EmployeeCostFilterArgs {
  employeeId?: Id<'yourobcEmployees'>
  department?: string
  startDate?: number
  endDate?: number
  isOfficial?: boolean
  category?: string
  includeDeleted?: boolean
}

/**
 * Office cost filter arguments
 */
export interface OfficeCostFilterArgs {
  category?: 'rent' | 'utilities' | 'insurance' | 'maintenance' | 'supplies' | 'technology' | 'other'
  frequency?: 'one_time' | 'monthly' | 'quarterly' | 'yearly'
  startDate?: number
  endDate?: number
  isOfficial?: boolean
  includeDeleted?: boolean
}

/**
 * Miscellaneous expense filter arguments
 */
export interface MiscExpenseFilterArgs {
  category?: 'trade_show' | 'marketing' | 'tools' | 'software' | 'travel' | 'entertainment' | 'other'
  approved?: boolean
  relatedEmployeeId?: Id<'yourobcEmployees'>
  startDate?: number
  endDate?: number
  isOfficial?: boolean
  includeDeleted?: boolean
}

/**
 * KPI target filter arguments
 */
export interface KpiTargetFilterArgs {
  targetType?: 'employee' | 'team' | 'company'
  employeeId?: Id<'yourobcEmployees'>
  teamName?: string
  year?: number
  month?: number
  quarter?: number
  isOfficial?: boolean
  includeDeleted?: boolean
}

/**
 * KPI cache filter arguments
 */
export interface KpiCacheFilterArgs {
  cacheType?: 'employee' | 'customer' | 'company' | 'department'
  entityId?: string
  year?: number
  month?: number
  quarter?: number
  isOfficial?: boolean
  includeDeleted?: boolean
}
