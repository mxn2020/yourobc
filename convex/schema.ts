// convex/schema.ts
// Central Convex schema definition
// Includes both system tables and YouROBC business entity tables

import { defineSchema } from 'convex/server'

import { systemSchemas } from './schema/system'
import {
  // Single-table entities
  customersTable,
  quotesTable,
  shipmentsTable,
  shipmentStatusHistoryTable,
  invoicesTable,
  partnersTable,
  tasksTable,
  trackingMessagesTable,
  // Multi-table entities
  employeesTable,
  vacationDaysTable,
  couriersTable,
  commissionsTable,
  employeeSessionsTable,
  workHoursSummaryTable,
  employeeKPIsTable,
  employeeTargetsTable,
  employeeCommissionsTable,
  employeeCommissionRulesTable,
  // Complex multi-module entities
  customerMarginsTable,
  contactLogTable,
  customerAnalyticsTable,
  customerDunningConfigTable,
  exchangeRatesTable,
  inquirySourcesTable,
  wikiEntriesTable,
  commentsTable,
  followupRemindersTable,
  documentsTable,
  notificationsTable,
  countersTable,
  incomingInvoiceTrackingTable,
  invoiceNumberingTable,
  statementOfAccountsTable,
  accountingDashboardCacheTable,
  invoiceAutoGenLogTable,
  accountingTable,
  employeeCostsTable,
  officeCostsTable,
  miscExpensesTable,
  kpiTargetsTable,
  kpiCacheTable,
  dashboardAlertAcknowledgmentsTable,
} from './schema/yourobc/index'

const schema = defineSchema({
  // System Tables
  ...systemSchemas,

  // YouROBC Single-Table Entities
  customers: customersTable,
  quotes: quotesTable,
  shipments: shipmentsTable,
  shipmentStatusHistory: shipmentStatusHistoryTable,
  invoices: invoicesTable,
  partners: partnersTable,
  tasks: tasksTable,
  trackingMessages: trackingMessagesTable,

  // YouROBC Multi-Table Entities
  employees: employeesTable,
  vacationDays: vacationDaysTable,
  couriers: couriersTable,
  commissions: commissionsTable,
  employeeSessions: employeeSessionsTable,
  workHoursSummary: workHoursSummaryTable,
  employeeKPIs: employeeKPIsTable,
  employeeTargets: employeeTargetsTable,
  employeeCommissions: employeeCommissionsTable,
  employeeCommissionRules: employeeCommissionRulesTable,

  // YouROBC Complex Multi-Module Entities
  customerMargins: customerMarginsTable,
  contactLog: contactLogTable,
  customerAnalytics: customerAnalyticsTable,
  customerDunningConfig: customerDunningConfigTable,
  exchangeRates: exchangeRatesTable,
  inquirySources: inquirySourcesTable,
  wikiEntries: wikiEntriesTable,
  comments: commentsTable,
  followupReminders: followupRemindersTable,
  documents: documentsTable,
  notifications: notificationsTable,
  counters: countersTable,
  incomingInvoiceTracking: incomingInvoiceTrackingTable,
  invoiceNumbering: invoiceNumberingTable,
  statementOfAccounts: statementOfAccountsTable,
  accountingDashboardCache: accountingDashboardCacheTable,
  invoiceAutoGenLog: invoiceAutoGenLogTable,
  accounting: accountingTable,
  employeeCosts: employeeCostsTable,
  officeCosts: officeCostsTable,
  miscExpenses: miscExpensesTable,
  kpiTargets: kpiTargetsTable,
  kpiCache: kpiCacheTable,
  dashboardAlertAcknowledgments: dashboardAlertAcknowledgmentsTable,
})

export default schema

