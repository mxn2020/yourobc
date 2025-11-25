// convex/lib/yourobc/statistics/utils.ts
/**
 * Statistics Utilities
 * Validation and helper functions for statistics operations.
 */

import { STATISTICS_CONSTANTS } from './constants';
import type {
  CreateEmployeeCostData,
  UpdateEmployeeCostData,
  CreateOfficeCostData,
  UpdateOfficeCostData,
  CreateMiscExpenseData,
  UpdateMiscExpenseData,
  CreateKpiTargetData,
  UpdateKpiTargetData,
  CreateKpiCacheData,
  UpdateKpiCacheData,
  CurrencyAmount,
} from './types';

// ============================================================================
// Trim Functions
// ============================================================================

/**
 * Trim employee cost data
 */
export function trimEmployeeCostData<
  T extends Partial<CreateEmployeeCostData | UpdateEmployeeCostData>
>(data: T): T {
  const trimmed = { ...data } as any;

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim();
  }
  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim();
  }
  if (typeof trimmed.employeeName === 'string') {
    trimmed.employeeName = trimmed.employeeName.trim();
  }
  if (typeof trimmed.position === 'string') {
    trimmed.position = trimmed.position.trim();
  }
  if (typeof trimmed.department === 'string') {
    trimmed.department = trimmed.department.trim();
  }
  if (typeof trimmed.notes === 'string') {
    trimmed.notes = trimmed.notes.trim();
  }

  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t: any): t is string => typeof t === 'string')
      .map((t: string) => t.trim())
      .filter(Boolean);
    trimmed.tags = nextTags;
  }

  return trimmed as T;
}

/**
 * Trim office cost data
 */
export function trimOfficeCostData<
  T extends Partial<CreateOfficeCostData | UpdateOfficeCostData>
>(data: T): T {
  const trimmed = { ...data } as any;

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim();
  }
  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim();
  }
  if (typeof trimmed.vendor === 'string') {
    trimmed.vendor = trimmed.vendor.trim();
  }
  if (typeof trimmed.notes === 'string') {
    trimmed.notes = trimmed.notes.trim();
  }

  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t: any): t is string => typeof t === 'string')
      .map((t: string) => t.trim())
      .filter(Boolean);
    trimmed.tags = nextTags;
  }

  return trimmed as T;
}

/**
 * Trim misc expense data
 */
export function trimMiscExpenseData<
  T extends Partial<CreateMiscExpenseData | UpdateMiscExpenseData>
>(data: T): T {
  const trimmed = { ...data } as any;

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim();
  }
  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim();
  }
  if (typeof trimmed.vendor === 'string') {
    trimmed.vendor = trimmed.vendor.trim();
  }
  if (typeof trimmed.notes === 'string') {
    trimmed.notes = trimmed.notes.trim();
  }

  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t: any): t is string => typeof t === 'string')
      .map((t: string) => t.trim())
      .filter(Boolean);
    trimmed.tags = nextTags;
  }

  return trimmed as T;
}

/**
 * Trim KPI target data
 */
export function trimKpiTargetData<
  T extends Partial<CreateKpiTargetData | UpdateKpiTargetData>
>(data: T): T {
  const trimmed = { ...data } as any;

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim();
  }
  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim();
  }
  if (typeof trimmed.teamName === 'string') {
    trimmed.teamName = trimmed.teamName.trim();
  }
  if (typeof trimmed.notes === 'string') {
    trimmed.notes = trimmed.notes.trim();
  }

  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t: any): t is string => typeof t === 'string')
      .map((t: string) => t.trim())
      .filter(Boolean);
    trimmed.tags = nextTags;
  }

  return trimmed as T;
}

/**
 * Trim KPI cache data
 */
export function trimKpiCacheData<
  T extends Partial<CreateKpiCacheData | UpdateKpiCacheData>
>(data: T): T {
  const trimmed = { ...data } as any;

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim();
  }
  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim();
  }
  if (typeof trimmed.entityName === 'string') {
    trimmed.entityName = trimmed.entityName.trim();
  }

  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t: any): t is string => typeof t === 'string')
      .map((t: string) => t.trim())
      .filter(Boolean);
    trimmed.tags = nextTags;
  }

  return trimmed as T;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate employee cost data
 */
export function validateEmployeeCostData(
  data: Partial<CreateEmployeeCostData | UpdateEmployeeCostData>
): string[] {
  const errors: string[] = [];

  // Name validation
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('Name must be a string');
    } else {
      const name = data.name.trim();
      if (!name) {
        errors.push('Name is required');
      }
      if (name.length < STATISTICS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
        errors.push(`Name must be at least ${STATISTICS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
      }
      if (name.length > STATISTICS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
        errors.push(`Name cannot exceed ${STATISTICS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
      }
    }
  }

  // Description validation
  if (data.description !== undefined && typeof data.description === 'string') {
    const desc = data.description.trim();
    if (desc.length > STATISTICS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${STATISTICS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Position validation
  if (data.position !== undefined) {
    if (typeof data.position !== 'string') {
      errors.push('Position must be a string');
    } else if (!data.position.trim()) {
      errors.push('Position is required');
    }
  }

  // Date range validation
  if (data.startDate !== undefined && data.endDate !== undefined) {
    if (data.endDate <= data.startDate) {
      errors.push('End date must be after start date');
    }
  }

  // Tags validation
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    } else if (data.tags.length > STATISTICS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${STATISTICS_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }
  }

  // Currency amount validation
  if (data.monthlySalary !== undefined) {
    const salaryErrors = validateCurrencyAmount(data.monthlySalary);
    errors.push(...salaryErrors);
  }

  return errors;
}

/**
 * Validate office cost data
 */
export function validateOfficeCostData(
  data: Partial<CreateOfficeCostData | UpdateOfficeCostData>
): string[] {
  const errors: string[] = [];

  // Name validation
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('Name must be a string');
    } else {
      const name = data.name.trim();
      if (!name) {
        errors.push('Name is required');
      }
      if (name.length < STATISTICS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
        errors.push(`Name must be at least ${STATISTICS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
      }
      if (name.length > STATISTICS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
        errors.push(`Name cannot exceed ${STATISTICS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
      }
    }
  }

  // Date range validation
  if (data.date !== undefined && data.endDate !== undefined) {
    if (data.endDate <= data.date) {
      errors.push('End date must be after start date');
    }
  }

  // Amount validation
  if (data.amount !== undefined) {
    const amountErrors = validateCurrencyAmount(data.amount);
    errors.push(...amountErrors);
  }

  return errors;
}

/**
 * Validate misc expense data
 */
export function validateMiscExpenseData(
  data: Partial<CreateMiscExpenseData | UpdateMiscExpenseData>
): string[] {
  const errors: string[] = [];

  // Name validation
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('Name must be a string');
    } else {
      const name = data.name.trim();
      if (!name) {
        errors.push('Name is required');
      }
      if (name.length < STATISTICS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
        errors.push(`Name must be at least ${STATISTICS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
      }
      if (name.length > STATISTICS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
        errors.push(`Name cannot exceed ${STATISTICS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
      }
    }
  }

  // Amount validation
  if (data.amount !== undefined) {
    const amountErrors = validateCurrencyAmount(data.amount);
    errors.push(...amountErrors);
  }

  return errors;
}

/**
 * Validate KPI target data
 */
export function validateKpiTargetData(
  data: Partial<CreateKpiTargetData | UpdateKpiTargetData>
): string[] {
  const errors: string[] = [];

  // Name validation
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('Name must be a string');
    } else {
      const name = data.name.trim();
      if (!name) {
        errors.push('Name is required');
      }
    }
  }

  // Year validation
  if (data.year !== undefined) {
    const currentYear = new Date().getFullYear();
    if (data.year < 2000 || data.year > currentYear + 10) {
      errors.push('Invalid year');
    }
  }

  // Month validation
  if (data.month !== undefined) {
    if (data.month < 1 || data.month > 12) {
      errors.push('Month must be between 1 and 12');
    }
  }

  // Quarter validation
  if (data.quarter !== undefined) {
    if (data.quarter < 1 || data.quarter > 4) {
      errors.push('Quarter must be between 1 and 4');
    }
  }

  return errors;
}

/**
 * Validate KPI cache data
 */
export function validateKpiCacheData(
  data: Partial<CreateKpiCacheData | UpdateKpiCacheData>
): string[] {
  const errors: string[] = [];

  // Name validation
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('Name must be a string');
    } else if (!data.name.trim()) {
      errors.push('Name is required');
    }
  }

  // Year validation
  if (data.year !== undefined) {
    const currentYear = new Date().getFullYear();
    if (data.year < 2000 || data.year > currentYear + 10) {
      errors.push('Invalid year');
    }
  }

  return errors;
}

/**
 * Validate currency amount
 */
export function validateCurrencyAmount(amount: CurrencyAmount): string[] {
  const errors: string[] = [];

  if (typeof amount.amount !== 'number') {
    errors.push('Amount must be a number');
  } else {
    if (amount.amount < STATISTICS_CONSTANTS.LIMITS.MIN_COST_AMOUNT) {
      errors.push('Amount cannot be negative');
    }
    if (amount.amount > STATISTICS_CONSTANTS.LIMITS.MAX_COST_AMOUNT) {
      errors.push('Amount exceeds maximum allowed');
    }
  }

  if (!['EUR', 'USD'].includes(amount.currency)) {
    errors.push('Currency must be EUR or USD');
  }

  return errors;
}

// ============================================================================
// Currency Utilities
// ============================================================================

/**
 * Create a currency amount
 */
export function createCurrencyAmount(
  amount: number,
  currency: 'EUR' | 'USD' = STATISTICS_CONSTANTS.DEFAULT_CURRENCY as 'EUR'
): CurrencyAmount {
  return {
    amount,
    currency,
  };
}

/**
 * Calculate total employee cost
 */
export function calculateTotalEmployeeCost(
  monthlySalary: CurrencyAmount,
  benefits?: CurrencyAmount,
  bonuses?: CurrencyAmount,
  otherCosts?: CurrencyAmount
): number {
  let total = monthlySalary.amount;

  if (benefits) total += benefits.amount;
  if (bonuses) total += bonuses.amount;
  if (otherCosts) total += otherCosts.amount;

  return total;
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(quoteCount: number, orderCount: number): number {
  if (quoteCount === 0) return 0;
  return (orderCount / quoteCount) * 100;
}

/**
 * Calculate growth rate
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: CurrencyAmount): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount.amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}
