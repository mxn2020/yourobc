// convex/schema/yourobc/index.ts
/**
 * Central export point for all yourobc schema tables
 *
 * This module re-exports all table schemas from the yourobc software modules
 * for registration with the main Convex schema.
 */

// Import individual table exports
export { customersTable } from './customers/customers';
export { quotesTable } from './quotes/quotes';
export { shipmentsTable, shipmentStatusHistoryTable } from './shipments/shipments';
export { invoicesTable } from './invoices/invoices';
export { partnersTable } from './partners/partners';
export { tasksTable } from './tasks/tasks';
export { trackingMessagesTable } from './trackingMessages/trackingMessages';

// Employees module
export { employeesTable, vacationDaysTable } from './employees/employees';

// Couriers module
export { couriersTable } from './couriers/couriers';
export { commissionsTable } from './couriers/commissions';

// Employee sessions module
export { employeeSessionsTable } from './employeeSessions/employeeSessions';
export { workHoursSummaryTable } from './employeeSessions/workHoursSummary';

// Employee KPIs module
export { employeeKPIsTable } from './employeeKPIs/employeeKPIs';
export { employeeTargetsTable } from './employeeKPIs/employeeTargets';

// Employee commissions module
export { employeeCommissionsTable } from './employeeCommissions/employeeCommissions';
export { employeeCommissionRulesTable } from './employeeCommissions/employeeCommissionRules';

// Customer margins module
export { customerMarginsTable } from './customerMargins/customerMargins';
export { contactLogTable } from './customerMargins/contactLog';
export { customerAnalyticsTable } from './customerMargins/customerAnalytics';
export { customerDunningConfigTable } from './customerMargins/customerDunningConfig';

// Supporting module
export { exchangeRatesTable } from './supporting/exchangeRates';
export { inquirySourcesTable } from './supporting/inquirySources';
export { wikiEntriesTable } from './supporting/wikiEntries';
export { commentsTable } from './supporting/comments';
export { followupRemindersTable } from './supporting/followupReminders';
export { documentsTable } from './supporting/documents';
export { notificationsTable } from './supporting/notifications';
export { countersTable } from './supporting/counters';

// Accounting module
export { accountingTable } from './accounting/accounting';
export { incomingInvoiceTrackingTable } from './accounting/incomingInvoiceTracking';
export { invoiceNumberingTable } from './accounting/invoiceNumbering';
export { statementOfAccountsTable } from './accounting/statementOfAccounts';
export { accountingDashboardCacheTable } from './accounting/accountingDashboardCache';
export { invoiceAutoGenLogTable } from './accounting/invoiceAutoGenLog';

// Statistics module
export { employeeCostsTable } from './statistics/employeeCosts';
export { officeCostsTable } from './statistics/officeCosts';
export { miscExpensesTable } from './statistics/miscExpenses';
export { kpiTargetsTable } from './statistics/kpiTargets';
export { kpiCacheTable } from './statistics/kpiCache';

// Dashboard module
export { dashboardAlertAcknowledgmentsTable } from './dashboard/dashboardAlertAcknowledgments';
