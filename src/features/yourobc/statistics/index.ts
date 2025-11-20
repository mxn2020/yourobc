// src/features/yourobc/statistics/index.ts

/**
 * Statistics & KPIs Feature
 *
 * Comprehensive business analytics including:
 * - Revenue analysis (invoice-based with margin calculation)
 * - Employee KPIs (quotes, orders, margins, conversion rates)
 * - Operating costs management
 * - Top customer analysis
 * - Business reports and exports
 */

// Export pages
export { StatisticsDashboardPage } from './pages/StatisticsDashboardPage'
export { RevenueAnalysisPage } from './pages/RevenueAnalysisPage'
export { EmployeeKPIsPage } from './pages/EmployeeKPIsPage'
export { OperatingCostsPage } from './pages/OperatingCostsPage'
export { TopCustomersPage } from './pages/TopCustomersPage'
export { ReportsPage } from './pages/ReportsPage'
export { MonthlyReportPage } from './pages/MonthlyReportPage'
export { ExecutiveReportPage } from './pages/ExecutiveReportPage'
export { EmployeeReportPage } from './pages/EmployeeReportPage'
export { CustomerReportPage } from './pages/CustomerReportPage'
export { OrderAnalysisReportPage } from './pages/OrderAnalysisReportPage'

// Export components
export { KPICard } from './components/KPICard'

// Export service
export { statisticsService, StatisticsService } from './services/StatisticsService'

// Export hooks
export * from './hooks/useStatistics'
export * from './hooks/useOperatingCosts'
export * from './hooks/useKPIManagement'

// Export types
export * from './types'

// Export utilities
export * from './utils/formatters'
