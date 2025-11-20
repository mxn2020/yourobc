// src/features/yourobc/dashboard/types/index.ts

import type { LucideIcon } from 'lucide-react'

// Base Types
export type MetricsPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type ActivityType = 
  | 'customer' 
  | 'quote' 
  | 'shipment' 
  | 'invoice' 
  | 'partner' 
  | 'courier' 
  | 'reminder' 
  | 'comment'
  | 'system'

export type TrendDirection = 'up' | 'down' | 'stable'

// Dashboard Configuration
export interface DashboardConfig {
  defaultPeriod?: MetricsPeriod
  autoRefresh?: boolean
  userRole?: string
  activityLimit?: number
  includePerformanceData?: boolean
  includeTrendData?: boolean
  trendMetrics?: string[]
  theme?: 'light' | 'dark'
  compactMode?: boolean
}

// Overview Data Structures
export interface YourOBCOverview {
  customers: {
    total: number
    active: number
    new: number
    inactive: number
    blacklisted: number
    growth: number
    conversionRate: number
    averageLifetimeValue: number
    topTier: number
  }
  quotes: {
    total: number
    pending: number
    accepted: number
    rejected: number
    expired: number
    totalValue: number
    averageValue: number
    conversionRate: number
    pendingValue: number
  }
  shipments: {
    total: number
    quoted: number
    booked: number
    inTransit: number
    delivered: number
    cancelled: number
    onTime: number
    averageDeliveryTime: number
    delayedShipments: number
  }
  invoices: {
    total: number
    draft: number
    sent: number
    paid: number
    overdue: number
    cancelled: number
    totalValue: number
    paidValue: number
    overdueValue: number
    paymentRate: number
  }
  partners: {
    total: number
    active: number
    inactive: number
    suspended: number
    performanceScore: number
    totalRevenue: number
    topPerformers: number
  }
  couriers: {
    total: number
    available: number
    busy: number
    offline: number
    vacation: number
    utilizationRate: number
    averageRating: number
    activeDeliveries: number
  }
  period: MetricsPeriod
  lastUpdated: string
}

// Metrics Data Structures
export interface YourOBCMetrics {
  revenue: {
    total: number
    growth: number
    target: number
    targetProgress: number
    breakdown: {
      customers: number
      partners: number
    }
    trend: Array<{
      period: string
      value: number
    }>
  }
  conversion: {
    quoteToOrder: number
    leadToCustomer: number
    proposalToContract: number
    inquiryToQuote: number
    trends: {
      quoteToOrder: number[]
      leadToCustomer: number[]
    }
  }
  performance: {
    slaCompliance: number
    customerSatisfaction: number
    responseTime: number
    deliveryAccuracy: number
    qualityScore: number
    trends: {
      slaCompliance: number[]
      customerSatisfaction: number[]
    }
  }
  efficiency: {
    processingTime: number
    resourceUtilization: number
    costPerTransaction: number
    automationRate: number
    errorRate: number
    trends: {
      processingTime: number[]
      resourceUtilization: number[]
    }
  }
  period: MetricsPeriod
  generatedAt: string
}

// Activity Data Structure
export interface YourOBCActivity {
  id: string
  type: ActivityType
  action: string
  entity: string
  entityId: string
  description: string
  user: string
  userId: string
  timestamp: string
  metadata?: {
    module?: string
    priority?: 'low' | 'medium' | 'high'
    value?: number
    currency?: 'EUR' | 'USD'
    category?: string
    destination?: string
    amount?: number
    dueDate?: string
    [key: string]: any
  }
}

// Alert Data Structure
export interface YourOBCAlert {
  id: string
  type: 'overdue' | 'expiring' | 'payment' | 'sla' | 'performance' | 'system'
  severity: AlertSeverity
  title: string
  message: string
  count?: number
  module: string
  action?: string
  actionUrl?: string
  createdAt: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
  metadata?: Record<string, any>
}

// Quick Action Data Structure
export interface YourOBCQuickAction {
  id: string
  label: string
  description: string
  icon: string
  href: string
  color: string
  permission?: string
  badge?: string | number
  disabled?: boolean
  external?: boolean
}

// Performance Data Structures
export interface YourOBCPerformanceData {
  revenue: Array<{
    period: string
    value: number
    target: number
    growth: number
  }>
  customers: Array<{
    period: string
    new: number
    active: number
    churned: number
    retention: number
  }>
  conversion: Array<{
    period: string
    leads: number
    quotes: number
    orders: number
    rate: number
  }>
  satisfaction: Array<{
    period: string
    score: number
    responses: number
    trend: TrendDirection
  }>
}

// Trend Data Structure
export interface YourOBCTrendData {
  revenue: {
    current: number
    previous: number
    change: number
    trend: TrendDirection
    forecast: number
  }
  customers: {
    current: number
    previous: number
    change: number
    trend: TrendDirection
    forecast: number
  }
  satisfaction: {
    current: number
    previous: number
    change: number
    trend: TrendDirection
    forecast: number
  }
  efficiency: {
    current: number
    previous: number
    change: number
    trend: TrendDirection
    forecast: number
  }
}

// Widget Configuration Types
export interface WidgetConfig {
  id: string
  title: string
  type: 'metric' | 'chart' | 'list' | 'progress' | 'status'
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  visible: boolean
  refreshInterval?: number
}

export interface DashboardLayout {
  widgets: WidgetConfig[]
  columns: number
  compactMode: boolean
}

// Chart Data Types
export interface ChartDataPoint {
  name: string
  value: number
  change?: number
  trend?: TrendDirection
  target?: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
  target?: number
  forecast?: boolean
}

// Component Props Types
export interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: TrendDirection
  icon?: LucideIcon
  color?: string
  format?: 'number' | 'currency' | 'percentage'
  precision?: number
  subtitle?: string
  loading?: boolean
  error?: Error | null
}

export interface AlertCardProps {
  alert: YourOBCAlert
  onAcknowledge?: (id: string) => void
  onAction?: (url: string) => void
  compact?: boolean
  showActions?: boolean
}

export interface ActivityItemProps {
  activity: YourOBCActivity
  onClick?: (activity: YourOBCActivity) => void
  showDetails?: boolean
  compact?: boolean
}

export interface QuickActionProps {
  action: YourOBCQuickAction
  onClick?: (action: YourOBCQuickAction) => void
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'compact' | 'minimal'
}

// Filter and Search Types
export interface ActivityFilters {
  types?: ActivityType[]
  modules?: string[]
  users?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  priorities?: Array<'low' | 'medium' | 'high'>
}

export interface AlertFilters {
  severities?: AlertSeverity[]
  types?: YourOBCAlert['type'][]
  modules?: string[]
  acknowledged?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

// API Response Types
export interface DashboardRefreshResponse {
  overview: YourOBCOverview
  metrics: YourOBCMetrics
  activities: YourOBCActivity[]
  alerts: YourOBCAlert[]
  refreshedAt: string
}

export interface MetricResponse<T = any> {
  data: T
  period: MetricsPeriod
  generatedAt: string
  cacheExpiry?: string
}

// Error Types
export interface DashboardError {
  code: string
  message: string
  module?: string
  timestamp: string
  recoverable?: boolean
}

// Export Configuration
export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'json'
  period: MetricsPeriod
  modules: string[]
  includeCharts: boolean
  includeDetails: boolean
}

// Notification Types
export interface DashboardNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Real-time Update Types
export interface RealTimeUpdate {
  type: 'activity' | 'alert' | 'metric' | 'status'
  data: any
  timestamp: string
  module: string
}

// User Preferences
export interface DashboardPreferences {
  layout: DashboardLayout
  defaultPeriod: MetricsPeriod
  autoRefresh: boolean
  refreshInterval: number
  notifications: {
    critical: boolean
    moderate: boolean
    info: boolean
  }
  theme: 'light' | 'dark' | 'auto'
  compactMode: boolean
  favoriteActions: string[]
}

// Status Types
export interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical'
  services: Array<{
    name: string
    status: 'online' | 'offline' | 'degraded'
    lastCheck: string
    responseTime?: number
  }>
  lastUpdate: string
}

// Permission Types
export interface DashboardPermissions {
  canViewOverview: boolean
  canViewMetrics: boolean
  canViewActivities: boolean
  canManageAlerts: boolean
  canExportData: boolean
  canConfigureLayout: boolean
  modules: {
    customers: boolean
    quotes: boolean
    shipments: boolean
    invoices: boolean
    partners: boolean
    couriers: boolean
  }
}

// Color Theme Types
export interface ColorTheme {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  surface: string
  text: string
  textMuted: string
}

// Constants
export const METRIC_PERIODS: Record<MetricsPeriod, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year'
} as const

export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  low: 'blue',
  medium: 'yellow',
  high: 'orange',
  critical: 'red'
} as const

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  customer: 'blue',
  quote: 'green',
  shipment: 'purple',
  invoice: 'orange',
  partner: 'indigo',
  courier: 'teal',
  reminder: 'amber',
  comment: 'pink',
  system: 'gray'
} as const

export const TREND_COLORS: Record<TrendDirection, string> = {
  up: 'green',
  down: 'red',
  stable: 'gray'
} as const

// Default configurations
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  defaultPeriod: 'week',
  autoRefresh: true,
  userRole: 'user',
  activityLimit: 20,
  includePerformanceData: true,
  includeTrendData: true,
  trendMetrics: ['revenue', 'yourobcCustomers', 'satisfaction'],
  theme: 'light',
  compactMode: false
}

export const DEFAULT_REFRESH_INTERVALS = {
  overview: 5 * 60 * 1000, // 5 minutes
  metrics: 10 * 60 * 1000, // 10 minutes
  activities: 2 * 60 * 1000, // 2 minutes
  alerts: 1 * 60 * 1000, // 1 minute
  performance: 15 * 60 * 1000, // 15 minutes
  trends: 20 * 60 * 1000 // 20 minutes
} as const