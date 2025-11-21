// convex/schema/yourobc/validators.ts

import { yourobcSchemas } from './schemas'

// ============================================================================
// Accounting validators
// ============================================================================
export const accounting = yourobcSchemas.yourobcAccounting.validator
export const accountingDashboardCache = yourobcSchemas.yourobcAccountingDashboardCache.validator
export const incomingInvoiceTracking = yourobcSchemas.yourobcIncomingInvoiceTracking.validator
export const invoiceAutoGenLog = yourobcSchemas.yourobcInvoiceAutoGenLog.validator
export const invoiceNumbering = yourobcSchemas.yourobcInvoiceNumbering.validator
export const statementOfAccounts = yourobcSchemas.yourobcStatementOfAccounts.validator

// ============================================================================
// Couriers validators
// ============================================================================
export const courier = yourobcSchemas.yourobcCouriers.validator
export const courierCommission = yourobcSchemas.yourobcCourierCommissions.validator

// ============================================================================
// Customers validators
// ============================================================================
export const customer = yourobcSchemas.yourobcCustomers.validator

// ============================================================================
// Customer Margins validators
// ============================================================================
export const customerMargin = yourobcSchemas.yourobcCustomerMargins.validator
export const contactLog = yourobcSchemas.yourobcContactLog.validator
export const customerAnalytics = yourobcSchemas.yourobcCustomerAnalytics.validator
export const customerDunningConfig = yourobcSchemas.yourobcCustomerDunningConfig.validator

// ============================================================================
// Dashboard validators
// ============================================================================
export const dashboardAlertAcknowledgment = yourobcSchemas.dashboardAlertAcknowledgments.validator

// ============================================================================
// Employees validators
// ============================================================================
export const employee = yourobcSchemas.yourobcEmployees.validator
export const vacationDay = yourobcSchemas.yourobcVacationDays.validator

// ============================================================================
// Employee Commissions validators
// ============================================================================
export const employeeCommission = yourobcSchemas.yourobcEmployeeCommissions.validator

// ============================================================================
// Employee KPIs validators
// ============================================================================
export const employeeKPI = yourobcSchemas.yourobcEmployeeKPIs.validator

// ============================================================================
// Employee Sessions validators
// ============================================================================
export const employeeSession = yourobcSchemas.yourobcEmployeeSessions.validator
export const workHoursSummary = yourobcSchemas.yourobcWorkHoursSummary.validator

// ============================================================================
// Invoices validators
// ============================================================================
export const invoice = yourobcSchemas.yourobcInvoices.validator

// ============================================================================
// Partners validators
// ============================================================================
export const partner = yourobcSchemas.yourobcPartners.validator

// ============================================================================
// Quotes validators
// ============================================================================
export const quote = yourobcSchemas.yourobcQuotes.validator

// ============================================================================
// Shipments validators
// ============================================================================
export const shipment = yourobcSchemas.yourobcShipments.validator
export const shipmentStatusHistory = yourobcSchemas.yourobcShipmentStatusHistory.validator

// ============================================================================
// Statistics validators
// ============================================================================
export const employeeCost = yourobcSchemas.yourobcEmployeeCosts.validator
export const officeCost = yourobcSchemas.yourobcOfficeCosts.validator
export const miscExpense = yourobcSchemas.yourobcMiscExpenses.validator
export const kpiTarget = yourobcSchemas.yourobcKpiTargets.validator
export const kpiCache = yourobcSchemas.yourobcKpiCache.validator

// ============================================================================
// Supporting validators
// ============================================================================
export const exchangeRate = yourobcSchemas.exchangeRates.validator
export const inquirySource = yourobcSchemas.inquirySources.validator
export const wikiEntry = yourobcSchemas.wikiEntries.validator
export const comment = yourobcSchemas.comments.validator
export const followupReminder = yourobcSchemas.yourobcFollowupReminders.validator
export const document = yourobcSchemas.yourobcDocuments.validator
export const notification = yourobcSchemas.yourobcNotifications.validator
export const counter = yourobcSchemas.yourobcCounters.validator

// ============================================================================
// Tasks validators
// ============================================================================
export const task = yourobcSchemas.yourobcTasks.validator

// ============================================================================
// Tracking Messages validators
// ============================================================================
export const trackingMessage = yourobcSchemas.yourobcTrackingMessages.validator

