// src/features/yourobc/employees/config.ts
/**
 * Employee Module Configuration
 * This configuration file allows enabling/disabling features of the employee module
 * to match the requirements from YOUROBC.md
 */

export interface EmployeesConfig {
  // Core features (always enabled as per YOUROBC.md requirement)
  core: {
    employeeProfiles: boolean
    roleManagement: boolean
    vacationTracking: boolean
  }

  // Work time tracking features
  timeTracking: {
    enabled: boolean
    loginLogoutTracking: boolean
    workingHoursSummary: boolean
    sessionTracking: boolean
    breakTracking: boolean
  }

  // KPI and performance features
  kpis: {
    enabled: boolean
    trackOffers: boolean
    trackOrders: boolean
    trackCommissions: boolean
    monthlyOverview: boolean
    yearlyOverview: boolean
    rankings: boolean
  }

  // Commission features
  commissions: {
    enabled: boolean
    automaticCalculation: boolean
    approvalWorkflow: boolean
    paymentTracking: boolean
  }

  // Vacation features
  vacations: {
    enabled: boolean
    requestApproval: boolean
    balanceTracking: boolean
    carryoverAllowed: boolean
    emergencyContactRequired: boolean
  }

  // Team management features
  team: {
    enabled: boolean
    hierarchyManagement: boolean
    directReports: boolean
    managerAssignment: boolean
  }

  // Advanced features (can be disabled)
  advanced: {
    multipleOfficeLocations: boolean
    emergencyContacts: boolean
    customFields: boolean
    auditLog: boolean
    advancedReporting: boolean
  }
}

/**
 * Default configuration matching YOUROBC.md requirements
 */
export const DEFAULT_EMPLOYEES_CONFIG: EmployeesConfig = {
  core: {
    employeeProfiles: true,
    roleManagement: true,
    vacationTracking: true,
  },

  timeTracking: {
    enabled: true,
    loginLogoutTracking: true,
    workingHoursSummary: true,
    sessionTracking: true,
    breakTracking: false,
  },

  kpis: {
    enabled: true,
    trackOffers: true,
    trackOrders: true,
    trackCommissions: true,
    monthlyOverview: true,
    yearlyOverview: true,
    rankings: false,
  },

  commissions: {
    enabled: true,
    automaticCalculation: true,
    approvalWorkflow: true,
    paymentTracking: true,
  },

  vacations: {
    enabled: true,
    requestApproval: true,
    balanceTracking: true,
    carryoverAllowed: true,
    emergencyContactRequired: false,
  },

  team: {
    enabled: true,
    hierarchyManagement: true,
    directReports: true,
    managerAssignment: true,
  },

  advanced: {
    multipleOfficeLocations: true,
    emergencyContacts: true,
    customFields: false,
    auditLog: true,
    advancedReporting: false,
  },
}

/**
 * Minimal configuration - only core YOUROBC.md requirements
 */
export const MINIMAL_EMPLOYEES_CONFIG: EmployeesConfig = {
  core: {
    employeeProfiles: true,
    roleManagement: true,
    vacationTracking: true,
  },

  timeTracking: {
    enabled: true,
    loginLogoutTracking: true,
    workingHoursSummary: true,
    sessionTracking: false,
    breakTracking: false,
  },

  kpis: {
    enabled: true,
    trackOffers: true,
    trackOrders: true,
    trackCommissions: true,
    monthlyOverview: true,
    yearlyOverview: true,
    rankings: false,
  },

  commissions: {
    enabled: true,
    automaticCalculation: true,
    approvalWorkflow: false,
    paymentTracking: true,
  },

  vacations: {
    enabled: true,
    requestApproval: true,
    balanceTracking: true,
    carryoverAllowed: false,
    emergencyContactRequired: false,
  },

  team: {
    enabled: false,
    hierarchyManagement: false,
    directReports: false,
    managerAssignment: false,
  },

  advanced: {
    multipleOfficeLocations: false,
    emergencyContacts: false,
    customFields: false,
    auditLog: false,
    advancedReporting: false,
  },
}

/**
 * Get the current employee module configuration
 */
export function getEmployeesConfig(): EmployeesConfig {
  const configOverride = process.env.NEXT_PUBLIC_EMPLOYEES_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_EMPLOYEES_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse EMPLOYEES_CONFIG, using defaults')
    }
  }

  return DEFAULT_EMPLOYEES_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: EmployeesConfig,
  category: keyof EmployeesConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

export const EMPLOYEES_CONFIG = getEmployeesConfig()
