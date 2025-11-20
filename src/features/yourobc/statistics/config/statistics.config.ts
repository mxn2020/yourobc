// src/features/yourobc/statistics/config/statistics.config.ts
/**
 * Statistics Module Configuration
 * This configuration file allows enabling/disabling features of the statistics module
 * Note: Revenue/profit visibility is controlled via better-auth permissions, not this config
 */

export interface StatisticsConfig {
  // Core statistics features
  core: {
    dashboard: boolean
    employeeKpis: boolean
    operatingCosts: boolean
    reporting: boolean
    revenue: boolean
  }

  // Employee KPIs features
  employeeKpis: {
    enabled: boolean
    offersTracking: boolean
    ordersTracking: boolean
    commissionsTracking: boolean
    monthlyOverview: boolean
    yearlyOverview: boolean
    rankings: boolean
    customKpis: boolean
    targetTracking: boolean
  }

  // Operating costs features
  operatingCosts: {
    enabled: boolean
    monthlyTracking: boolean
    categoryBreakdown: boolean
    budgetComparison: boolean
    forecastingEnabled: boolean
    costAllocation: boolean
    varianceAnalysis: boolean
  }

  // Reporting features
  reporting: {
    enabled: boolean
    predefinedReports: boolean
    customReports: boolean
    scheduledReports: boolean
    exportPdf: boolean
    exportExcel: boolean
    emailReports: boolean
    dataVisualization: boolean
  }

  // Revenue tracking features (feature flags only, NOT permissions)
  revenue: {
    enabled: boolean
    revenueByCustomer: boolean
    revenueByProduct: boolean
    revenueByRegion: boolean
    revenueByEmployee: boolean
    profitMargins: boolean
    trendAnalysis: boolean
    yearOverYear: boolean
    forecasting: boolean
  }

  // Advanced analytics features
  advanced: {
    predictiveAnalytics: boolean
    customDashboards: boolean
    realTimeUpdates: boolean
    dataExport: boolean
    apiAccess: boolean
    advancedFiltering: boolean
  }

  // Display preferences
  display: {
    compactView: boolean
    graphicalCharts: boolean
    tableView: boolean
    summaryCards: boolean
    detailedBreakdowns: boolean
  }

  // Time period options
  timePeriods: {
    daily: boolean
    weekly: boolean
    monthly: boolean
    quarterly: boolean
    yearly: boolean
    customRanges: boolean
  }
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_STATISTICS_CONFIG: StatisticsConfig = {
  core: {
    dashboard: true,
    employeeKpis: true,
    operatingCosts: true,
    reporting: true,
    revenue: true,
  },

  employeeKpis: {
    enabled: true,
    offersTracking: true,
    ordersTracking: true,
    commissionsTracking: true,
    monthlyOverview: true,
    yearlyOverview: true,
    rankings: false,
    customKpis: false,
    targetTracking: true,
  },

  operatingCosts: {
    enabled: true,
    monthlyTracking: true,
    categoryBreakdown: true,
    budgetComparison: true,
    forecastingEnabled: false,
    costAllocation: true,
    varianceAnalysis: false,
  },

  reporting: {
    enabled: true,
    predefinedReports: true,
    customReports: false,
    scheduledReports: false,
    exportPdf: true,
    exportExcel: true,
    emailReports: false,
    dataVisualization: true,
  },

  revenue: {
    enabled: true,
    revenueByCustomer: true,
    revenueByProduct: true,
    revenueByRegion: true,
    revenueByEmployee: true,
    profitMargins: true,
    trendAnalysis: true,
    yearOverYear: true,
    forecasting: false,
  },

  advanced: {
    predictiveAnalytics: false,
    customDashboards: false,
    realTimeUpdates: true,
    dataExport: true,
    apiAccess: false,
    advancedFiltering: true,
  },

  display: {
    compactView: false,
    graphicalCharts: true,
    tableView: true,
    summaryCards: true,
    detailedBreakdowns: false,
  },

  timePeriods: {
    daily: false,
    weekly: false,
    monthly: true,
    quarterly: true,
    yearly: true,
    customRanges: true,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_STATISTICS_CONFIG: StatisticsConfig = {
  core: {
    dashboard: true,
    employeeKpis: true,
    operatingCosts: false,
    reporting: false,
    revenue: true,
  },

  employeeKpis: {
    enabled: true,
    offersTracking: true,
    ordersTracking: true,
    commissionsTracking: true,
    monthlyOverview: true,
    yearlyOverview: false,
    rankings: false,
    customKpis: false,
    targetTracking: false,
  },

  operatingCosts: {
    enabled: false,
    monthlyTracking: false,
    categoryBreakdown: false,
    budgetComparison: false,
    forecastingEnabled: false,
    costAllocation: false,
    varianceAnalysis: false,
  },

  reporting: {
    enabled: false,
    predefinedReports: false,
    customReports: false,
    scheduledReports: false,
    exportPdf: false,
    exportExcel: false,
    emailReports: false,
    dataVisualization: false,
  },

  revenue: {
    enabled: true,
    revenueByCustomer: true,
    revenueByProduct: false,
    revenueByRegion: false,
    revenueByEmployee: false,
    profitMargins: false,
    trendAnalysis: false,
    yearOverYear: false,
    forecasting: false,
  },

  advanced: {
    predictiveAnalytics: false,
    customDashboards: false,
    realTimeUpdates: false,
    dataExport: false,
    apiAccess: false,
    advancedFiltering: false,
  },

  display: {
    compactView: true,
    graphicalCharts: false,
    tableView: true,
    summaryCards: true,
    detailedBreakdowns: false,
  },

  timePeriods: {
    daily: false,
    weekly: false,
    monthly: true,
    quarterly: false,
    yearly: false,
    customRanges: false,
  },
}

/**
 * Get the current statistics module configuration
 */
export function getStatisticsConfig(): StatisticsConfig {
  const configOverride = process.env.NEXT_PUBLIC_STATISTICS_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_STATISTICS_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse STATISTICS_CONFIG, using defaults')
    }
  }

  return DEFAULT_STATISTICS_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: StatisticsConfig,
  category: keyof StatisticsConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: StatisticsConfig,
  module: keyof StatisticsConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Check if employee KPIs are available
 */
export function hasEmployeeKpis(config: StatisticsConfig): boolean {
  return config.employeeKpis.enabled === true
}

/**
 * Check if operating costs tracking is available
 */
export function hasOperatingCosts(config: StatisticsConfig): boolean {
  return config.operatingCosts.enabled === true
}

/**
 * Check if revenue tracking is available (feature flag only)
 * Note: Actual access to revenue data is controlled by better-auth permissions
 */
export function hasRevenueTracking(config: StatisticsConfig): boolean {
  return config.revenue.enabled === true
}

/**
 * Check if reporting features are available
 */
export function hasReporting(config: StatisticsConfig): boolean {
  return config.reporting.enabled === true
}

export const STATISTICS_CONFIG = getStatisticsConfig()
