// convex/schema/yourobc/yourobc.ts

export { customersTable as yourobcCustomersTable } from './customers'
export { quotesTable as yourobcQuotesTable } from './quotes'
export { shipmentsTable as yourobcShipmentsTable, shipmentStatusHistoryTable as yourobcShipmentStatusHistoryTable } from './shipments'
export { invoicesTable as yourobcInvoicesTable } from './invoices'
export { partnersTable as yourobcPartnersTable } from './partners'
export { employeesTable as yourobcEmployeesTable, vacationDaysTable as yourobcVacationDaysTable } from './employees'
export { couriersTable as yourobcCouriersTable, commissionsTable as yourobcCommissionsTable } from './couriers'
export { tasksTable as yourobcTasksTable } from './tasks'
export { trackingMessagesTable as yourobcTrackingMessagesTable } from './trackingMessages'
export { employeeSessionsTable as yourobcEmployeeSessionsTable, workHoursSummaryTable as yourobcWorkHoursSummaryTable } from './employeeSessions'
export { employeeKPIsTable as yourobcEmployeeKPIsTable, employeeTargetsTable as yourobcEmployeeTargetsTable } from './employeeKPIs'
export { employeeCommissionsTable as yourobcEmployeeCommissionsTable, employeeCommissionRulesTable as yourobcEmployeeCommissionRulesTable } from './employeeCommissions'
export {
  customerMarginsTable as yourobcCustomerMarginsTable,
  contactLogTable as yourobcContactLogTable,
  customerAnalyticsTable as yourobcCustomerAnalyticsTable,
  customerDunningConfigTable as yourobcCustomerDunningConfigTable,
} from './customerMargins'
export {
  documentsTable as yourobcDocumentsTable,
  notificationsTable as yourobcNotificationsTable,
  exchangeRatesTable as yourobcExchangeRatesTable,
  inquirySourcesTable as yourobcInquirySourcesTable,
  wikiEntriesTable as yourobcWikiEntriesTable,
  commentsTable as yourobcCommentsTable,
  followupRemindersTable as yourobcFollowupRemindersTable,
  countersTable as yourobcCountersTable // Added counters table
} from './supporting'
export {
  incomingInvoiceTrackingTable as yourobcIncomingInvoiceTrackingTable,
  invoiceNumberingTable as yourobcInvoiceNumberingTable,
  statementOfAccountsTable as yourobcStatementOfAccountsTable,
  accountingDashboardCacheTable as yourobcAccountingDashboardCacheTable,
  invoiceAutoGenLogTable as yourobcInvoiceAutoGenLogTable,
} from './accounting'
export {
  employeeCostsTable as yourobcEmployeeCostsTable,
  officeCostsTable as yourobcOfficeCostsTable,
  miscExpensesTable as yourobcMiscExpensesTable,
  kpiTargetsTable as yourobcKpiTargetsTable,
  kpiCacheTable as yourobcKpiCacheTable,
} from './statistics'
export {
  dashboardAlertAcknowledgmentsTable as yourobcDashboardAlertAcknowledgmentsTable,
} from './dashboard'

export * from './base'