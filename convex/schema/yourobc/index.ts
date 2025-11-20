// convex/schema/yourobc/yourobc.ts
// Barrel exports for all YouROBC schema tables
// All entities follow the GUIDE pattern in convex/schema/software/yourobc/

// Single-table entities
export {
  customersTable as yourobcCustomersTable,
} from '../software/yourobc/customers/schemas'
export {
  quotesTable as yourobcQuotesTable,
} from '../software/yourobc/quotes/schemas'
export {
  shipmentsTable as yourobcShipmentsTable,
  shipmentStatusHistoryTable as yourobcShipmentStatusHistoryTable,
} from '../software/yourobc/shipments/schemas'
export {
  invoicesTable as yourobcInvoicesTable,
} from '../software/yourobc/invoices/schemas'
export {
  partnersTable as yourobcPartnersTable,
} from '../software/yourobc/partners/schemas'
export {
  tasksTable as yourobcTasksTable,
} from '../software/yourobc/tasks/schemas'
export {
  trackingMessagesTable as yourobcTrackingMessagesTable,
} from '../software/yourobc/trackingMessages/schemas'

// Multi-table entities
export {
  employeesTable as yourobcEmployeesTable,
  vacationDaysTable as yourobcVacationDaysTable,
} from '../software/yourobc/employees/schemas'
export {
  couriersTable as yourobcCouriersTable,
  commissionsTable as yourobcCommissionsTable,
} from '../software/yourobc/couriers/schemas'
export {
  employeeSessionsTable as yourobcEmployeeSessionsTable,
  workHoursSummaryTable as yourobcWorkHoursSummaryTable,
} from '../software/yourobc/employeeSessions/schemas'
export {
  employeeKPIsTable as yourobcEmployeeKPIsTable,
  employeeTargetsTable as yourobcEmployeeTargetsTable,
} from '../software/yourobc/employeeKPIs/schemas'
export {
  employeeCommissionsTable as yourobcEmployeeCommissionsTable,
  employeeCommissionRulesTable as yourobcEmployeeCommissionRulesTable,
} from '../software/yourobc/employeeCommissions/schemas'

// Complex multi-module entities
export {
  customerMarginsTable as yourobcCustomerMarginsTable,
  contactLogTable as yourobcContactLogTable,
  customerAnalyticsTable as yourobcCustomerAnalyticsTable,
  customerDunningConfigTable as yourobcCustomerDunningConfigTable,
} from '../software/yourobc/customerMargins/schemas'
export {
  exchangeRatesTable as yourobcExchangeRatesTable,
  inquirySourcesTable as yourobcInquirySourcesTable,
  wikiEntriesTable as yourobcWikiEntriesTable,
  commentsTable as yourobcCommentsTable,
  followupRemindersTable as yourobcFollowupRemindersTable,
  documentsTable as yourobcDocumentsTable,
  notificationsTable as yourobcNotificationsTable,
  countersTable as yourobcCountersTable,
} from '../software/yourobc/supporting/schemas'
export {
  incomingInvoiceTrackingTable as yourobcIncomingInvoiceTrackingTable,
  invoiceNumberingTable as yourobcInvoiceNumberingTable,
  statementOfAccountsTable as yourobcStatementOfAccountsTable,
  accountingDashboardCacheTable as yourobcAccountingDashboardCacheTable,
  invoiceAutoGenLogTable as yourobcInvoiceAutoGenLogTable,
} from '../software/yourobc/accounting/schemas'
export {
  employeeCostsTable as yourobcEmployeeCostsTable,
  officeCostsTable as yourobcOfficeCostsTable,
  miscExpensesTable as yourobcMiscExpensesTable,
  kpiTargetsTable as yourobcKpiTargetsTable,
  kpiCacheTable as yourobcKpiCacheTable,
} from '../software/yourobc/statistics/schemas'
export {
  dashboardAlertAcknowledgmentsTable as yourobcDashboardAlertAcknowledgmentsTable,
} from '../software/yourobc/dashboard/schemas'

export * from './base'