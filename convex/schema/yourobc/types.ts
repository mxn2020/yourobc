// convex/schema/yourobc/types.ts
// Type exports for yourobc schema module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import * as validators from './validators';

// ============================================================================
// Accounting Types
// ============================================================================

// Full document types (includes _id and _creationTime)
export type Accounting = Doc<'yourobcAccounting'>;
export type AccountingId = Id<'yourobcAccounting'>;

export type AccountingDashboardCache = Doc<'yourobcAccountingDashboardCache'>;
export type AccountingDashboardCacheId = Id<'yourobcAccountingDashboardCache'>;

export type IncomingInvoiceTracking = Doc<'yourobcIncomingInvoiceTracking'>;
export type IncomingInvoiceTrackingId = Id<'yourobcIncomingInvoiceTracking'>;

export type InvoiceAutoGenLog = Doc<'yourobcInvoiceAutoGenLog'>;
export type InvoiceAutoGenLogId = Id<'yourobcInvoiceAutoGenLog'>;

export type InvoiceNumbering = Doc<'yourobcInvoiceNumbering'>;
export type InvoiceNumberingId = Id<'yourobcInvoiceNumbering'>;

export type StatementOfAccounts = Doc<'yourobcStatementOfAccounts'>;
export type StatementOfAccountsId = Id<'yourobcStatementOfAccounts'>;

// Validator types (field definitions only)
export type AccountingSchema = Infer<typeof validators.accounting>;
export type AccountingDashboardCacheSchema = Infer<typeof validators.accountingDashboardCache>;
export type IncomingInvoiceTrackingSchema = Infer<typeof validators.incomingInvoiceTracking>;
export type InvoiceAutoGenLogSchema = Infer<typeof validators.invoiceAutoGenLog>;
export type InvoiceNumberingSchema = Infer<typeof validators.invoiceNumbering>;
export type StatementOfAccountsSchema = Infer<typeof validators.statementOfAccounts>;

// ============================================================================
// Couriers Types
// ============================================================================

// Full document types
export type Courier = Doc<'yourobcCouriers'>;
export type CourierId = Id<'yourobcCouriers'>;

export type CourierCommission = Doc<'yourobcCourierCommissions'>;
export type CourierCommissionId = Id<'yourobcCourierCommissions'>;

// Validator types
export type CourierSchema = Infer<typeof validators.courier>;
export type CourierCommissionSchema = Infer<typeof validators.courierCommission>;

// ============================================================================
// Customers Types
// ============================================================================

// Full document types
export type Customer = Doc<'yourobcCustomers'>;
export type CustomerId = Id<'yourobcCustomers'>;

// Validator types
export type CustomerSchema = Infer<typeof validators.customer>;

// ============================================================================
// Customer Margins Types
// ============================================================================

// Full document types
export type CustomerMargin = Doc<'yourobcCustomerMargins'>;
export type CustomerMarginId = Id<'yourobcCustomerMargins'>;

export type ContactLog = Doc<'yourobcContactLog'>;
export type ContactLogId = Id<'yourobcContactLog'>;

export type CustomerAnalytics = Doc<'yourobcCustomerAnalytics'>;
export type CustomerAnalyticsId = Id<'yourobcCustomerAnalytics'>;

export type CustomerDunningConfig = Doc<'yourobcCustomerDunningConfig'>;
export type CustomerDunningConfigId = Id<'yourobcCustomerDunningConfig'>;

// Validator types
export type CustomerMarginSchema = Infer<typeof validators.customerMargin>;
export type ContactLogSchema = Infer<typeof validators.contactLog>;
export type CustomerAnalyticsSchema = Infer<typeof validators.customerAnalytics>;
export type CustomerDunningConfigSchema = Infer<typeof validators.customerDunningConfig>;

// ============================================================================
// Dashboard Types
// ============================================================================

// Full document types
export type DashboardAlertAcknowledgment = Doc<'dashboardAlertAcknowledgments'>;
export type DashboardAlertAcknowledgmentId = Id<'dashboardAlertAcknowledgments'>;

// Validator types
export type DashboardAlertAcknowledgmentSchema = Infer<typeof validators.dashboardAlertAcknowledgment>;

// ============================================================================
// Employees Types
// ============================================================================

// Full document types
export type Employee = Doc<'yourobcEmployees'>;
export type EmployeeId = Id<'yourobcEmployees'>;

export type VacationDay = Doc<'yourobcVacationDays'>;
export type VacationDayId = Id<'yourobcVacationDays'>;

// Validator types
export type EmployeeSchema = Infer<typeof validators.employee>;
export type VacationDaySchema = Infer<typeof validators.vacationDay>;

// ============================================================================
// Employee Commissions Types
// ============================================================================

// Full document types
export type EmployeeCommission = Doc<'yourobcEmployeeCommissions'>;
export type EmployeeCommissionId = Id<'yourobcEmployeeCommissions'>;

// Validator types
export type EmployeeCommissionSchema = Infer<typeof validators.employeeCommission>;

// ============================================================================
// Employee KPIs Types
// ============================================================================

// Full document types
export type EmployeeKPI = Doc<'yourobcEmployeeKPIs'>;
export type EmployeeKPIId = Id<'yourobcEmployeeKPIs'>;

// Validator types
export type EmployeeKPISchema = Infer<typeof validators.employeeKPI>;

// ============================================================================
// Employee Sessions Types
// ============================================================================

// Full document types
export type EmployeeSession = Doc<'yourobcEmployeeSessions'>;
export type EmployeeSessionId = Id<'yourobcEmployeeSessions'>;

export type WorkHoursSummary = Doc<'yourobcWorkHoursSummary'>;
export type WorkHoursSummaryId = Id<'yourobcWorkHoursSummary'>;

// Validator types
export type EmployeeSessionSchema = Infer<typeof validators.employeeSession>;
export type WorkHoursSummarySchema = Infer<typeof validators.workHoursSummary>;

// ============================================================================
// Invoices Types
// ============================================================================

// Full document types
export type Invoice = Doc<'yourobcInvoices'>;
export type InvoiceId = Id<'yourobcInvoices'>;

// Validator types
export type InvoiceSchema = Infer<typeof validators.invoice>;

// ============================================================================
// Partners Types
// ============================================================================

// Full document types
export type Partner = Doc<'yourobcPartners'>;
export type PartnerId = Id<'yourobcPartners'>;

// Validator types
export type PartnerSchema = Infer<typeof validators.partner>;

// ============================================================================
// Quotes Types
// ============================================================================

// Full document types
export type Quote = Doc<'yourobcQuotes'>;
export type QuoteId = Id<'yourobcQuotes'>;

// Validator types
export type QuoteSchema = Infer<typeof validators.quote>;

// ============================================================================
// Shipments Types
// ============================================================================

// Full document types
export type Shipment = Doc<'yourobcShipments'>;
export type ShipmentId = Id<'yourobcShipments'>;

export type ShipmentStatusHistory = Doc<'yourobcShipmentStatusHistory'>;
export type ShipmentStatusHistoryId = Id<'yourobcShipmentStatusHistory'>;

// Validator types
export type ShipmentSchema = Infer<typeof validators.shipment>;
export type ShipmentStatusHistorySchema = Infer<typeof validators.shipmentStatusHistory>;

// ============================================================================
// Statistics Types
// ============================================================================

// Full document types
export type EmployeeCost = Doc<'yourobcStatisticsEmployeeCosts'>;
export type EmployeeCostId = Id<'yourobcStatisticsEmployeeCosts'>;

export type OfficeCost = Doc<'yourobcStatisticsOfficeCosts'>;
export type OfficeCostId = Id<'yourobcStatisticsOfficeCosts'>;

export type MiscExpense = Doc<'yourobcStatisticsMiscExpenses'>;
export type MiscExpenseId = Id<'yourobcStatisticsMiscExpenses'>;

export type KpiTarget = Doc<'yourobcStatisticsKpiTargets'>;
export type KpiTargetId = Id<'yourobcStatisticsKpiTargets'>;

export type KpiCache = Doc<'yourobcStatisticsKpiCache'>;
export type KpiCacheId = Id<'yourobcStatisticsKpiCache'>;

// Validator types
export type EmployeeCostSchema = Infer<typeof validators.employeeCost>;
export type OfficeCostSchema = Infer<typeof validators.officeCost>;
export type MiscExpenseSchema = Infer<typeof validators.miscExpense>;
export type KpiTargetSchema = Infer<typeof validators.kpiTarget>;
export type KpiCacheSchema = Infer<typeof validators.kpiCache>;

// ============================================================================
// Supporting Types
// ============================================================================

// Full document types
export type ExchangeRate = Doc<'yourobcExchangeRates'>;
export type ExchangeRateId = Id<'yourobcExchangeRates'>;

export type InquirySource = Doc<'yourobcInquirySources'>;
export type InquirySourceId = Id<'yourobcInquirySources'>;

export type WikiEntry = Doc<'yourobcWikiEntries'>;
export type WikiEntryId = Id<'yourobcWikiEntries'>;

export type Comment = Doc<'yourobcComments'>;
export type CommentId = Id<'yourobcComments'>;

export type FollowupReminder = Doc<'yourobcFollowupReminders'>;
export type FollowupReminderId = Id<'yourobcFollowupReminders'>;

export type Document = Doc<'yourobcDocuments'>;
export type DocumentId = Id<'yourobcDocuments'>;

export type Notification = Doc<'yourobcNotifications'>;
export type NotificationId = Id<'yourobcNotifications'>;

export type Counter = Doc<'yourobcCounters'>;
export type CounterId = Id<'yourobcCounters'>;

// Validator types
export type ExchangeRateSchema = Infer<typeof validators.exchangeRate>;
export type InquirySourceSchema = Infer<typeof validators.inquirySource>;
export type WikiEntrySchema = Infer<typeof validators.wikiEntry>;
export type CommentSchema = Infer<typeof validators.comment>;
export type FollowupReminderSchema = Infer<typeof validators.followupReminder>;
export type DocumentSchema = Infer<typeof validators.document>;
export type NotificationSchema = Infer<typeof validators.notification>;
export type CounterSchema = Infer<typeof validators.counter>;

// ============================================================================
// Tasks Types
// ============================================================================

// Full document types
export type Task = Doc<'yourobcTasks'>;
export type TaskId = Id<'yourobcTasks'>;

// Validator types
export type TaskSchema = Infer<typeof validators.task>;

// ============================================================================
// Tracking Messages Types
// ============================================================================

// Full document types
export type TrackingMessage = Doc<'yourobcTrackingMessages'>;
export type TrackingMessageId = Id<'yourobcTrackingMessages'>;

// Validator types
export type TrackingMessageSchema = Infer<typeof validators.trackingMessage>;
