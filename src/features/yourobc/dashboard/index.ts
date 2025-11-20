// src/features/yourobc/dashboard/index.ts

// Export services
export { YourOBCDashboardService } from './services/YourOBCDashboardService'

// Export hooks
export { 
  useYourOBCDashboard,
  useYourOBCOverview,
  useYourOBCMetrics,
  useYourOBCRecentActivity,
  useYourOBCAlerts,
  useYourOBCPerformance,
  useYourOBCTrends
} from './hooks/useYourOBCDashboard'

// Export components
export { YourOBCOverview } from './components/YourOBCOverview'
export { YourOBCMetrics } from './components/YourOBCMetrics'
export { YourOBCAlerts } from './components/YourOBCAlerts'
export { YourOBCRecentActivity } from './components/YourOBCRecentActivity'
export { YourOBCQuickActions } from './components/YourOBCQuickActions'

// Export pages
export { YourOBCDashboardPage } from './pages/YourOBCDashboardPage'

// Export types
export type {
  YourOBCOverview as YourOBCOverviewType,
  YourOBCMetrics as YourOBCMetricsType,
  YourOBCActivity,
  YourOBCAlert,
  YourOBCQuickAction,
  YourOBCPerformanceData,
  YourOBCTrendData,
  MetricsPeriod,
  AlertSeverity,
  ActivityType,
  TrendDirection,
  DashboardConfig,
  DashboardError,
  DashboardNotification,
  SystemStatus,
  DashboardPermissions,
  MetricCardProps,
  AlertCardProps,
  ActivityItemProps,
  QuickActionProps
} from './types'