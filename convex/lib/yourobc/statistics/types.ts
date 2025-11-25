// convex/lib/yourobc/statistics/types.ts
/**
 * Statistics Types
 * TypeScript type definitions for statistics operations.
 */

import type { Doc, Id } from '@/generated/dataModel';
import type {
  OfficeCostCategory,
  CostFrequency,
  MiscExpenseCategory,
  TargetType,
  KpiCacheType,
  Difficulty,
  Visibility,
  CurrencyAmount,
} from '@/schema/yourobc/statistics/types';

// ============================================================================
// Base Entity Types
// ============================================================================

export type EmployeeCost = Doc<'yourobcStatisticsEmployeeCosts'>;
export type EmployeeCostId = Id<'yourobcStatisticsEmployeeCosts'>;

export type OfficeCost = Doc<'yourobcStatisticsOfficeCosts'>;
export type OfficeCostId = Id<'yourobcStatisticsOfficeCosts'>;

export type MiscExpense = Doc<'yourobcStatisticsMiscExpenses'>;
export type MiscExpenseId = Id<'yourobcStatisticsMiscExpenses'>;

export type KpiTarget = Doc<'yourobcStatisticsKpiTargets'>;
export type KpiTargetId = Id<'yourobcStatisticsKpiTargets'>;

export type KpiCache = Doc<'yourobcStatisticsKpiCache'>;
export type KpiCacheId = Id<'yourobcStatisticsKpiCache'>;

export type StatisticsEntity = EmployeeCost | OfficeCost | MiscExpense | KpiTarget | KpiCache;

// ============================================================================
// Re-export Schema Types
// ============================================================================

export type {
  OfficeCostCategory,
  CostFrequency,
  MiscExpenseCategory,
  TargetType,
  KpiCacheType,
  Difficulty,
  Visibility,
  CurrencyAmount,
};

// ============================================================================
// Employee Cost Operations
// ============================================================================

export interface CreateEmployeeCostData {
  name: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  employeeId?: Id<'yourobcEmployees'>;
  employeeName?: string;
  position: string;
  department?: string;
  monthlySalary: CurrencyAmount;
  benefits?: CurrencyAmount;
  bonuses?: CurrencyAmount;
  otherCosts?: CurrencyAmount;
  startDate: number;
  endDate?: number;
  notes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface UpdateEmployeeCostData {
  name?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  employeeId?: Id<'yourobcEmployees'>;
  employeeName?: string;
  position?: string;
  department?: string;
  monthlySalary?: CurrencyAmount;
  benefits?: CurrencyAmount;
  bonuses?: CurrencyAmount;
  otherCosts?: CurrencyAmount;
  startDate?: number;
  endDate?: number;
  notes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface EmployeeCostListResponse {
  items: EmployeeCost[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

export interface EmployeeCostFilters {
  employeeId?: Id<'yourobcEmployees'>;
  department?: string;
  startDate?: number;
  endDate?: number;
  isOfficial?: boolean;
  category?: string;
}

// ============================================================================
// Office Cost Operations
// ============================================================================

export interface CreateOfficeCostData {
  name: string;
  description: string;
  icon?: string;
  thumbnail?: string;
  amount: CurrencyAmount;
  frequency: CostFrequency;
  date: number;
  endDate?: number;
  vendor?: string;
  notes?: string;
  category: OfficeCostCategory;
  tags?: string[];
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface UpdateOfficeCostData {
  name?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  amount?: CurrencyAmount;
  frequency?: CostFrequency;
  date?: number;
  endDate?: number;
  vendor?: string;
  notes?: string;
  category?: OfficeCostCategory;
  tags?: string[];
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface OfficeCostListResponse {
  items: OfficeCost[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

export interface OfficeCostFilters {
  category?: OfficeCostCategory;
  frequency?: CostFrequency;
  startDate?: number;
  endDate?: number;
  isOfficial?: boolean;
}

// ============================================================================
// Misc Expense Operations
// ============================================================================

export interface CreateMiscExpenseData {
  name: string;
  description: string;
  icon?: string;
  thumbnail?: string;
  amount: CurrencyAmount;
  date: number;
  relatedEmployeeId?: Id<'yourobcEmployees'>;
  relatedProjectId?: Id<'projects'>;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
  category: MiscExpenseCategory;
  tags?: string[];
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface UpdateMiscExpenseData {
  name?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  amount?: CurrencyAmount;
  date?: number;
  relatedEmployeeId?: Id<'yourobcEmployees'>;
  relatedProjectId?: Id<'projects'>;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
  category?: MiscExpenseCategory;
  tags?: string[];
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface MiscExpenseListResponse {
  items: MiscExpense[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

export interface MiscExpenseFilters {
  category?: MiscExpenseCategory;
  approved?: boolean;
  relatedEmployeeId?: Id<'yourobcEmployees'>;
  startDate?: number;
  endDate?: number;
  isOfficial?: boolean;
}

// ============================================================================
// KPI Target Operations
// ============================================================================

export interface CreateKpiTargetData {
  name: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  targetType: TargetType;
  employeeId?: Id<'yourobcEmployees'>;
  teamName?: string;
  year: number;
  month?: number;
  quarter?: number;
  revenueTarget?: CurrencyAmount;
  marginTarget?: CurrencyAmount;
  quoteCountTarget?: number;
  orderCountTarget?: number;
  conversionRateTarget?: number;
  averageMarginTarget?: CurrencyAmount;
  notes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface UpdateKpiTargetData {
  name?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  targetType?: TargetType;
  employeeId?: Id<'yourobcEmployees'>;
  teamName?: string;
  year?: number;
  month?: number;
  quarter?: number;
  revenueTarget?: CurrencyAmount;
  marginTarget?: CurrencyAmount;
  quoteCountTarget?: number;
  orderCountTarget?: number;
  conversionRateTarget?: number;
  averageMarginTarget?: CurrencyAmount;
  notes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface KpiTargetListResponse {
  items: KpiTarget[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

export interface KpiTargetFilters {
  targetType?: TargetType;
  employeeId?: Id<'yourobcEmployees'>;
  teamName?: string;
  year?: number;
  month?: number;
  quarter?: number;
  isOfficial?: boolean;
}

// ============================================================================
// KPI Cache Operations
// ============================================================================

export interface CreateKpiCacheData {
  name: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  cacheType: KpiCacheType;
  entityId?: string;
  entityName?: string;
  year: number;
  month?: number;
  quarter?: number;
  totalRevenue: CurrencyAmount;
  totalCost?: CurrencyAmount;
  totalMargin: CurrencyAmount;
  averageMargin: CurrencyAmount;
  quoteCount: number;
  averageQuoteValue: CurrencyAmount;
  orderCount: number;
  averageOrderValue: CurrencyAmount;
  averageMarginPerOrder: CurrencyAmount;
  conversionRate: number;
  totalCommission?: CurrencyAmount;
  previousPeriodRevenue?: CurrencyAmount;
  previousPeriodMargin?: CurrencyAmount;
  growthRate?: number;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface UpdateKpiCacheData {
  name?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  cacheType?: KpiCacheType;
  entityId?: string;
  entityName?: string;
  year?: number;
  month?: number;
  quarter?: number;
  totalRevenue?: CurrencyAmount;
  totalCost?: CurrencyAmount;
  totalMargin?: CurrencyAmount;
  averageMargin?: CurrencyAmount;
  quoteCount?: number;
  averageQuoteValue?: CurrencyAmount;
  orderCount?: number;
  averageOrderValue?: CurrencyAmount;
  averageMarginPerOrder?: CurrencyAmount;
  conversionRate?: number;
  totalCommission?: CurrencyAmount;
  previousPeriodRevenue?: CurrencyAmount;
  previousPeriodMargin?: CurrencyAmount;
  growthRate?: number;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
  useCase?: string;
  difficulty?: Difficulty;
  visibility?: Visibility;
  isOfficial?: boolean;
}

export interface KpiCacheListResponse {
  items: KpiCache[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

export interface KpiCacheFilters {
  cacheType?: KpiCacheType;
  entityId?: string;
  year?: number;
  month?: number;
  quarter?: number;
  isOfficial?: boolean;
}