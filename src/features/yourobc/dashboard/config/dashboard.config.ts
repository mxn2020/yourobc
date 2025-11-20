// src/features/yourobc/dashboard/config/dashboard.config.ts
/**
 * Dashboard Module Configuration
 * This configuration file allows enabling/disabling features of the dashboard module
 */

export interface DashboardConfig {
  // Core dashboard features
  core: {
    overview: boolean
    activities: boolean
    alerts: boolean
    widgets: boolean
  }

  // Overview features
  overview: {
    enabled: boolean
    summaryCards: boolean
    recentShipments: boolean
    pendingTasks: boolean
    upcomingDeadlines: boolean
    quickStats: boolean
  }

  // Activity tracking features
  activities: {
    enabled: boolean
    recentActivities: boolean
    userActivities: boolean
    systemActivities: boolean
    activityFilters: boolean
    activitySearch: boolean
    exportActivities: boolean
  }

  // Alert features
  alerts: {
    enabled: boolean
    slaWarnings: boolean
    overdueItems: boolean
    systemAlerts: boolean
    customAlerts: boolean
    alertNotifications: boolean
    alertPriority: boolean
  }

  // Widget features
  widgets: {
    enabled: boolean
    customizableLayout: boolean
    dragAndDrop: boolean
    widgetLibrary: boolean
    personalizedWidgets: boolean
  }

  // Available widgets
  availableWidgets: {
    shipmentsOverview: boolean
    tasksWidget: boolean
    revenueChart: boolean
    kpiCards: boolean
    recentActivities: boolean
    upcomingDeadlines: boolean
    alertsWidget: boolean
    quickActions: boolean
    weatherWidget: boolean
    newsWidget: boolean
  }

  // Chart and visualization features
  visualizations: {
    enabled: boolean
    lineCharts: boolean
    barCharts: boolean
    pieCharts: boolean
    heatmaps: boolean
    timelines: boolean
    customCharts: boolean
  }

  // Quick actions features
  quickActions: {
    enabled: boolean
    createShipment: boolean
    createQuote: boolean
    createInvoice: boolean
    createTask: boolean
    customActions: boolean
  }

  // Filtering and search features
  filtering: {
    enabled: boolean
    dateRangeFilter: boolean
    statusFilter: boolean
    employeeFilter: boolean
    customerFilter: boolean
    savedFilters: boolean
  }

  // Refresh and real-time features
  realTime: {
    enabled: boolean
    autoRefresh: boolean
    refreshInterval: number // in seconds
    liveUpdates: boolean
    pushNotifications: boolean
  }

  // Display preferences
  display: {
    compactView: boolean
    gridLayout: boolean
    listLayout: boolean
    darkMode: boolean
    customTheme: boolean
  }

  // Advanced features
  advanced: {
    customDashboards: boolean
    multiDashboards: boolean
    dashboardSharing: boolean
    exportDashboard: boolean
    dashboardTemplates: boolean
  }
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  core: {
    overview: true,
    activities: true,
    alerts: true,
    widgets: true,
  },

  overview: {
    enabled: true,
    summaryCards: true,
    recentShipments: true,
    pendingTasks: true,
    upcomingDeadlines: true,
    quickStats: true,
  },

  activities: {
    enabled: true,
    recentActivities: true,
    userActivities: true,
    systemActivities: true,
    activityFilters: true,
    activitySearch: false,
    exportActivities: false,
  },

  alerts: {
    enabled: true,
    slaWarnings: true,
    overdueItems: true,
    systemAlerts: true,
    customAlerts: false,
    alertNotifications: true,
    alertPriority: true,
  },

  widgets: {
    enabled: true,
    customizableLayout: false,
    dragAndDrop: false,
    widgetLibrary: true,
    personalizedWidgets: false,
  },

  availableWidgets: {
    shipmentsOverview: true,
    tasksWidget: true,
    revenueChart: true,
    kpiCards: true,
    recentActivities: true,
    upcomingDeadlines: true,
    alertsWidget: true,
    quickActions: true,
    weatherWidget: false,
    newsWidget: false,
  },

  visualizations: {
    enabled: true,
    lineCharts: true,
    barCharts: true,
    pieCharts: true,
    heatmaps: false,
    timelines: false,
    customCharts: false,
  },

  quickActions: {
    enabled: true,
    createShipment: true,
    createQuote: true,
    createInvoice: true,
    createTask: true,
    customActions: false,
  },

  filtering: {
    enabled: true,
    dateRangeFilter: true,
    statusFilter: true,
    employeeFilter: true,
    customerFilter: true,
    savedFilters: false,
  },

  realTime: {
    enabled: true,
    autoRefresh: true,
    refreshInterval: 300, // 5 minutes
    liveUpdates: false,
    pushNotifications: true,
  },

  display: {
    compactView: false,
    gridLayout: true,
    listLayout: true,
    darkMode: false,
    customTheme: false,
  },

  advanced: {
    customDashboards: false,
    multiDashboards: false,
    dashboardSharing: false,
    exportDashboard: false,
    dashboardTemplates: false,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_DASHBOARD_CONFIG: DashboardConfig = {
  core: {
    overview: true,
    activities: true,
    alerts: true,
    widgets: false,
  },

  overview: {
    enabled: true,
    summaryCards: true,
    recentShipments: true,
    pendingTasks: true,
    upcomingDeadlines: false,
    quickStats: false,
  },

  activities: {
    enabled: true,
    recentActivities: true,
    userActivities: false,
    systemActivities: false,
    activityFilters: false,
    activitySearch: false,
    exportActivities: false,
  },

  alerts: {
    enabled: true,
    slaWarnings: true,
    overdueItems: true,
    systemAlerts: false,
    customAlerts: false,
    alertNotifications: false,
    alertPriority: false,
  },

  widgets: {
    enabled: false,
    customizableLayout: false,
    dragAndDrop: false,
    widgetLibrary: false,
    personalizedWidgets: false,
  },

  availableWidgets: {
    shipmentsOverview: false,
    tasksWidget: false,
    revenueChart: false,
    kpiCards: false,
    recentActivities: false,
    upcomingDeadlines: false,
    alertsWidget: false,
    quickActions: false,
    weatherWidget: false,
    newsWidget: false,
  },

  visualizations: {
    enabled: false,
    lineCharts: false,
    barCharts: false,
    pieCharts: false,
    heatmaps: false,
    timelines: false,
    customCharts: false,
  },

  quickActions: {
    enabled: true,
    createShipment: true,
    createQuote: false,
    createInvoice: false,
    createTask: false,
    customActions: false,
  },

  filtering: {
    enabled: false,
    dateRangeFilter: false,
    statusFilter: false,
    employeeFilter: false,
    customerFilter: false,
    savedFilters: false,
  },

  realTime: {
    enabled: false,
    autoRefresh: false,
    refreshInterval: 0,
    liveUpdates: false,
    pushNotifications: false,
  },

  display: {
    compactView: true,
    gridLayout: false,
    listLayout: true,
    darkMode: false,
    customTheme: false,
  },

  advanced: {
    customDashboards: false,
    multiDashboards: false,
    dashboardSharing: false,
    exportDashboard: false,
    dashboardTemplates: false,
  },
}

/**
 * Get the current dashboard module configuration
 */
export function getDashboardConfig(): DashboardConfig {
  const configOverride = process.env.NEXT_PUBLIC_DASHBOARD_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_DASHBOARD_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse DASHBOARD_CONFIG, using defaults')
    }
  }

  return DEFAULT_DASHBOARD_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: DashboardConfig,
  category: keyof DashboardConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: DashboardConfig,
  module: keyof DashboardConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Check if a widget is available
 */
export function isWidgetAvailable(
  config: DashboardConfig,
  widget: keyof DashboardConfig['availableWidgets']
): boolean {
  return config.availableWidgets[widget] === true
}

/**
 * Get refresh interval in seconds
 */
export function getRefreshInterval(config: DashboardConfig): number {
  return config.realTime.refreshInterval
}

export const DASHBOARD_CONFIG = getDashboardConfig()
