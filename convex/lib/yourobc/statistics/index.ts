// convex/lib/yourobc/statistics/index.ts
// convex/lib/statistics/index.ts

/**
 * Statistics & KPIs Module
 *
 * Provides comprehensive analytics including:
 * - Revenue analysis (invoice-based with margin calculation)
 * - Employee KPIs (quotes, orders, margins, conversion rates)
 * - Operating costs tracking (employees, office, misc expenses)
 * - Customer analysis (top customers by revenue/margin/count)
 * - Reporting (monthly, customer, employee, order analysis)
 * - Real profit calculation (revenue - costs - commissions - operating expenses)
 */

// Export sub-modules with explicit namespaces
export * as revenue from './revenue'
export * as employee_kpis from './employee_kpis'
export * as operating_costs from './operating_costs'
export * as reporting from './reporting'
