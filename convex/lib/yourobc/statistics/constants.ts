// convex/lib/yourobc/statistics/constants.ts
/**
 * Statistics Constants
 * Canonical business constants and permissions for statistics operations.
 */

export const STATISTICS_CONSTANTS = {
  PERMISSIONS: {
    // Employee Costs
    VIEW_EMPLOYEE_COSTS: 'statistics:employee_costs:view',
    CREATE_EMPLOYEE_COSTS: 'statistics:employee_costs:create',
    EDIT_EMPLOYEE_COSTS: 'statistics:employee_costs:edit',
    DELETE_EMPLOYEE_COSTS: 'statistics:employee_costs:delete',

    // Office Costs
    VIEW_OFFICE_COSTS: 'statistics:office_costs:view',
    CREATE_OFFICE_COSTS: 'statistics:office_costs:create',
    EDIT_OFFICE_COSTS: 'statistics:office_costs:edit',
    DELETE_OFFICE_COSTS: 'statistics:office_costs:delete',

    // Misc Expenses
    VIEW_MISC_EXPENSES: 'statistics:misc_expenses:view',
    CREATE_MISC_EXPENSES: 'statistics:misc_expenses:create',
    EDIT_MISC_EXPENSES: 'statistics:misc_expenses:edit',
    DELETE_MISC_EXPENSES: 'statistics:misc_expenses:delete',
    APPROVE_MISC_EXPENSES: 'statistics:misc_expenses:approve',

    // KPI Targets
    VIEW_KPI_TARGETS: 'statistics:kpi_targets:view',
    CREATE_KPI_TARGETS: 'statistics:kpi_targets:create',
    EDIT_KPI_TARGETS: 'statistics:kpi_targets:edit',
    DELETE_KPI_TARGETS: 'statistics:kpi_targets:delete',

    // KPI Cache
    VIEW_KPI_CACHE: 'statistics:kpi_cache:view',
    CREATE_KPI_CACHE: 'statistics:kpi_cache:create',
    EDIT_KPI_CACHE: 'statistics:kpi_cache:edit',
    DELETE_KPI_CACHE: 'statistics:kpi_cache:delete',
    RECALCULATE_KPI_CACHE: 'statistics:kpi_cache:recalculate',
  },

  OFFICE_COST_CATEGORIES: {
    RENT: 'rent',
    UTILITIES: 'utilities',
    INSURANCE: 'insurance',
    MAINTENANCE: 'maintenance',
    SUPPLIES: 'supplies',
    TECHNOLOGY: 'technology',
    OTHER: 'other',
  },

  MISC_EXPENSE_CATEGORIES: {
    TRADE_SHOW: 'trade_show',
    MARKETING: 'marketing',
    TOOLS: 'tools',
    SOFTWARE: 'software',
    TRAVEL: 'travel',
    ENTERTAINMENT: 'entertainment',
    OTHER: 'other',
  },

  COST_FREQUENCIES: {
    ONE_TIME: 'one_time',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
  },

  TARGET_TYPES: {
    EMPLOYEE: 'employee',
    TEAM: 'team',
    COMPANY: 'company',
  },

  KPI_CACHE_TYPES: {
    EMPLOYEE: 'employee',
    CUSTOMER: 'customer',
    COMPANY: 'company',
    DEPARTMENT: 'department',
  },

  VISIBILITY: {
    PUBLIC: 'public',
    PRIVATE: 'private',
    SHARED: 'shared',
    ORGANIZATION: 'organization',
  },

  DIFFICULTY: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
  },

  LIMITS: {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_NOTES_LENGTH: 5000,
    MIN_COST_AMOUNT: 0,
    MAX_COST_AMOUNT: 999999999,
    MAX_TAGS: 20,
  },

  KPI_CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
  KPI_CACHE_STALE_THRESHOLD: 60 * 60 * 1000, // 1 hour
  MAX_CACHED_KPIS_PER_ENTITY: 24,

  DEFAULT_CURRENCY: 'EUR',

  QUARTERS: {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
    4: [10, 11, 12],
  },
} as const;

export const STATISTICS_VALUES = {
  officeCostCategories: Object.values(STATISTICS_CONSTANTS.OFFICE_COST_CATEGORIES),
  miscExpenseCategories: Object.values(STATISTICS_CONSTANTS.MISC_EXPENSE_CATEGORIES),
  costFrequencies: Object.values(STATISTICS_CONSTANTS.COST_FREQUENCIES),
  targetTypes: Object.values(STATISTICS_CONSTANTS.TARGET_TYPES),
  kpiCacheTypes: Object.values(STATISTICS_CONSTANTS.KPI_CACHE_TYPES),
  visibility: Object.values(STATISTICS_CONSTANTS.VISIBILITY),
  difficulty: Object.values(STATISTICS_CONSTANTS.DIFFICULTY),
} as const;