// convex/schema.ts
// Central Convex schema definition
// Includes both system tables and YouROBC business entity tables

import { defineSchema } from 'convex/server'

import { systemSchemas } from './schema/system'
import {
  // Single-table entities
  yourobcCustomersTable,
  yourobcQuotesTable,
  yourobcShipmentsTable,
  yourobcShipmentStatusHistoryTable,
  yourobcInvoicesTable,
  yourobcPartnersTable,
  yourobcTasksTable,
  yourobcTrackingMessagesTable,
  // Multi-table entities
  yourobcEmployeesTable,
  yourobcVacationDaysTable,
  yourobcCouriersTable,
  yourobcCommissionsTable,
  yourobcEmployeeSessionsTable,
  yourobcWorkHoursSummaryTable,
  yourobcEmployeeKPIsTable,
  yourobcEmployeeTargetsTable,
  yourobcEmployeeCommissionsTable,
  yourobcEmployeeCommissionRulesTable,
  // Complex multi-module entities
  yourobcCustomerMarginsTable,
  yourobcContactLogTable,
  yourobcCustomerAnalyticsTable,
  yourobcCustomerDunningConfigTable,
  yourobcExchangeRatesTable,
  yourobcInquirySourcesTable,
  yourobcWikiEntriesTable,
  yourobcCommentsTable,
  yourobcFollowupRemindersTable,
  yourobcDocumentsTable,
  yourobcNotificationsTable,
  yourobcCountersTable,
  yourobcIncomingInvoiceTrackingTable,
  yourobcInvoiceNumberingTable,
  yourobcStatementOfAccountsTable,
  yourobcAccountingDashboardCacheTable,
  yourobcInvoiceAutoGenLogTable,
  yourobcEmployeeCostsTable,
  yourobcOfficeCostsTable,
  yourobcMiscExpensesTable,
  yourobcKpiTargetsTable,
  yourobcKpiCacheTable,
  yourobcDashboardAlertAcknowledgmentsTable,
} from './schema/yourobc/index'

const schema = defineSchema({
  // System Tables
  ...systemSchemas,

  // YouROBC Single-Table Entities
  yourobcCustomers: yourobcCustomersTable,
  yourobcQuotes: yourobcQuotesTable,
  yourobcShipments: yourobcShipmentsTable,
  yourobcShipmentStatusHistory: yourobcShipmentStatusHistoryTable,
  yourobcInvoices: yourobcInvoicesTable,
  yourobcPartners: yourobcPartnersTable,
  yourobcTasks: yourobcTasksTable,
  yourobcTrackingMessages: yourobcTrackingMessagesTable,

  // YouROBC Multi-Table Entities
  yourobcEmployees: yourobcEmployeesTable,
  yourobcVacationDays: yourobcVacationDaysTable,
  yourobcCouriers: yourobcCouriersTable,
  yourobcCommissions: yourobcCommissionsTable,
  yourobcEmployeeSessions: yourobcEmployeeSessionsTable,
  yourobcWorkHoursSummary: yourobcWorkHoursSummaryTable,
  yourobcEmployeeKPIs: yourobcEmployeeKPIsTable,
  yourobcEmployeeTargets: yourobcEmployeeTargetsTable,
  yourobcEmployeeCommissions: yourobcEmployeeCommissionsTable,
  yourobcEmployeeCommissionRules: yourobcEmployeeCommissionRulesTable,

  // YouROBC Complex Multi-Module Entities
  yourobcCustomerMargins: yourobcCustomerMarginsTable,
  yourobcContactLog: yourobcContactLogTable,
  yourobcCustomerAnalytics: yourobcCustomerAnalyticsTable,
  yourobcCustomerDunningConfig: yourobcCustomerDunningConfigTable,
  yourobcExchangeRates: yourobcExchangeRatesTable,
  yourobcInquirySources: yourobcInquirySourcesTable,
  yourobcWikiEntries: yourobcWikiEntriesTable,
  yourobcComments: yourobcCommentsTable,
  yourobcFollowupReminders: yourobcFollowupRemindersTable,
  yourobcDocuments: yourobcDocumentsTable,
  yourobcNotifications: yourobcNotificationsTable,
  yourobcCounters: yourobcCountersTable,
  yourobcIncomingInvoiceTracking: yourobcIncomingInvoiceTrackingTable,
  yourobcInvoiceNumbering: yourobcInvoiceNumberingTable,
  yourobcStatementOfAccounts: yourobcStatementOfAccountsTable,
  yourobcAccountingDashboardCache: yourobcAccountingDashboardCacheTable,
  yourobcInvoiceAutoGenLog: yourobcInvoiceAutoGenLogTable,
  yourobcEmployeeCosts: yourobcEmployeeCostsTable,
  yourobcOfficeCosts: yourobcOfficeCostsTable,
  yourobcMiscExpenses: yourobcMiscExpensesTable,
  yourobcKpiTargets: yourobcKpiTargetsTable,
  yourobcKpiCache: yourobcKpiCacheTable,
  yourobcDashboardAlertAcknowledgments: yourobcDashboardAlertAcknowledgmentsTable,
})

export default schema

