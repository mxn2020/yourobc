// convex/schema/yourobc/base.ts
/**
 * YourOBC Base Schema
 *
 * This file contains all validators and TypeScript types for the YourOBC system.
 * Following the template pattern, validators are defined once and imported
 * throughout the codebase.
 *
 * @module convex/schema/yourobc/base
 */

import { v } from 'convex/values'

// ============================================================================
// Generic Validators - Standard template validators
// ============================================================================

/**
 * Generic status validator (for template compliance)
 */
export const statusValidator = v.union(
  v.literal('draft'),
  v.literal('active'),
  v.literal('archived')
)
export type Status = 'draft' | 'active' | 'archived'

/**
 * Difficulty level validator
 */
export const difficultyValidator = v.union(
  v.literal('beginner'),
  v.literal('intermediate'),
  v.literal('advanced')
)
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

/**
 * Visibility level validator
 */
export const visibilityValidator = v.union(
  v.literal('public'),
  v.literal('private'),
  v.literal('shared'),
  v.literal('organization')
)
export type Visibility = 'public' | 'private' | 'shared' | 'organization'

// ============================================================================
// Status Validators - Entity status types
// ============================================================================

/**
 * Customer status validator
 */
export const customerStatusValidator = v.union(
  v.literal('active'),
  v.literal('inactive'),
  v.literal('blacklisted')
)
export type CustomerStatus = 'active' | 'inactive' | 'blacklisted'

/**
 * Quote status validator
 */
export const quoteStatusValidator = v.union(
  v.literal('draft'),
  v.literal('sent'),
  v.literal('pending'),
  v.literal('accepted'),
  v.literal('rejected'),
  v.literal('expired')
)
export type QuoteStatus = 'draft' | 'sent' | 'pending' | 'accepted' | 'rejected' | 'expired'

/**
 * Shipment status validator
 */
export const shipmentStatusValidator = v.union(
  v.literal('quoted'),
  v.literal('booked'),
  v.literal('pickup'),
  v.literal('in_transit'),
  v.literal('delivered'),
  v.literal('customs'),
  v.literal('document'),
  v.literal('invoiced'),
  v.literal('cancelled')
)
export type ShipmentStatus =
  | 'quoted'
  | 'booked'
  | 'pickup'
  | 'in_transit'
  | 'delivered'
  | 'customs'
  | 'document'
  | 'invoiced'
  | 'cancelled'

/**
 * Invoice status validator
 */
export const invoiceStatusValidator = v.union(
  v.literal('draft'),
  v.literal('sent'),
  v.literal('paid'),
  v.literal('overdue'),
  v.literal('cancelled')
)
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

/**
 * Partner status validator
 */
export const partnerStatusValidator = v.union(
  v.literal('active'),
  v.literal('inactive'),
  v.literal('suspended')
)
export type PartnerStatus = 'active' | 'inactive' | 'suspended'

/**
 * Courier status validator
 */
export const courierStatusValidator = v.union(
  v.literal('available'),
  v.literal('busy'),
  v.literal('offline'),
  v.literal('vacation')
)
export type CourierStatus = 'available' | 'busy' | 'offline' | 'vacation'

/**
 * Reminder status validator
 */
export const reminderStatusValidator = v.union(
  v.literal('pending'),
  v.literal('completed'),
  v.literal('cancelled'),
  v.literal('snoozed')
)
export type ReminderStatus = 'pending' | 'completed' | 'cancelled' | 'snoozed'

/**
 * Employee status validator
 */
export const employeeStatusValidator = v.union(
  v.literal('active'),
  v.literal('inactive'),
  v.literal('terminated'),
  v.literal('on_leave')
)
export type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'on_leave'

/**
 * Work status validator (for tracking employee availability)
 */
export const workStatusValidator = v.union(
  v.literal('available'),
  v.literal('busy'),
  v.literal('offline')
)
export type WorkStatus = 'available' | 'busy' | 'offline'

/**
 * Commission status validator (simplified)
 */
export const commissionSimpleStatusValidator = v.union(
  v.literal('pending'),
  v.literal('paid')
)
export type CommissionSimpleStatus = 'pending' | 'paid'

/**
 * Vacation status validator (simplified)
 */
export const vacationSimpleStatusValidator = v.union(
  v.literal('requested'),
  v.literal('approved'),
  v.literal('denied'),
  v.literal('cancelled'),
  v.literal('completed')
)
export type VacationSimpleStatus = 'requested' | 'approved' | 'denied' | 'cancelled' | 'completed'

// ============================================================================
// Service Type Validators - Business service types
// ============================================================================

/**
 * Quote service type validator
 */
export const quoteServiceTypeValidator = v.union(
  v.literal('OBC'),
  v.literal('NFO')
)
export type QuoteServiceType = 'OBC' | 'NFO'

/**
 * Service priority validator
 */
export const servicePriorityValidator = v.union(
  v.literal('standard'),
  v.literal('urgent'),
  v.literal('critical')
)
export type ServicePriority = 'standard' | 'urgent' | 'critical'

/**
 * Notification priority validator
 */
export const notificationPriorityValidator = v.union(
  v.literal('normal'),
  v.literal('high'),
  v.literal('urgent')
)
export type NotificationPriority = 'normal' | 'high' | 'urgent'

/**
 * Currency validator
 */
export const currencyValidator = v.union(
  v.literal('EUR'),
  v.literal('USD')
)
export type Currency = 'EUR' | 'USD'

/**
 * Payment method validator
 */
export const paymentMethodValidator = v.union(
  v.literal('bank_transfer'),
  v.literal('credit_card'),
  v.literal('cash'),
  v.literal('check'),
  v.literal('paypal'),
  v.literal('wire_transfer'),
  v.literal('other'),
)
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'paypal' | 'wire_transfer' | 'other'

/**
 * Invoice type validator
 */
export const invoiceTypeValidator = v.union(
  v.literal('incoming'),
  v.literal('outgoing')
)
export type InvoiceType = 'incoming' | 'outgoing'

// ============================================================================
// Employee Validators - Employee-related types
// ============================================================================

/**
 * Commission type validator
 */
export const commissionTypeValidator = v.union(
  v.literal('percentage'),
  v.literal('fixed')
)
export type CommissionType = 'percentage' | 'fixed'

/**
 * Time entry type validator
 */
export const timeEntryTypeValidator = v.union(
  v.literal('login'),
  v.literal('logout')
)
export type TimeEntryType = 'login' | 'logout'

/**
 * Employee document type validator
 */
export const employeeDocumentTypeValidator = v.union(
  v.literal('employment_contract'),
  v.literal('id_document'),
  v.literal('training_certificate'),
  v.literal('performance_review'),
  v.literal('vacation_request'),
  v.literal('commission_statement'),
  v.literal('other')
)
export type EmployeeDocumentType =
  | 'employment_contract'
  | 'id_document'
  | 'training_certificate'
  | 'performance_review'
  | 'vacation_request'
  | 'commission_statement'
  | 'other'

// ============================================================================
// Accounting Validators - Financial and accounting types
// ============================================================================

/**
 * Incoming invoice status validator
 */
export const incomingInvoiceStatusValidator = v.union(
  v.literal('expected'),
  v.literal('received'),
  v.literal('approved'),
  v.literal('paid'),
  v.literal('missing'),
  v.literal('disputed'),
  v.literal('cancelled')
)
export type IncomingInvoiceStatus =
  | 'expected'
  | 'received'
  | 'approved'
  | 'paid'
  | 'missing'
  | 'disputed'
  | 'cancelled'

/**
 * Statement transaction type validator
 */
export const statementTransactionTypeValidator = v.union(
  v.literal('invoice'),
  v.literal('payment'),
  v.literal('credit_note'),
  v.literal('adjustment')
)
export type StatementTransactionType = 'invoice' | 'payment' | 'credit_note' | 'adjustment'

/**
 * Export format validator
 */
export const exportFormatValidator = v.union(
  v.literal('pdf'),
  v.literal('excel')
)
export type ExportFormat = 'pdf' | 'excel'

/**
 * Invoice auto-generation status validator
 */
export const invoiceAutoGenStatusValidator = v.union(
  v.literal('generated'),
  v.literal('notification_sent'),
  v.literal('notification_failed')
)
export type InvoiceAutoGenStatus = 'generated' | 'notification_sent' | 'notification_failed'

/**
 * Accounting metric validator
 * Used for dashboard and reporting metric types
 */
export const accountingMetricValidator = v.union(
  v.literal('receivables'),
  v.literal('payables'),
  v.literal('cashFlow'),
  v.literal('dunning')
)
export type AccountingMetric = 'receivables' | 'payables' | 'cashFlow' | 'dunning'

// ============================================================================
// Customer Validators - Customer-related types
// ============================================================================

/**
 * Margin service type validator
 */
export const marginServiceTypeValidator = v.union(
  v.literal('standard'),
  v.literal('express'),
  v.literal('overnight'),
  v.literal('international'),
  v.literal('freight'),
  v.literal('other')
)
export type MarginServiceType =
  | 'standard'
  | 'express'
  | 'overnight'
  | 'international'
  | 'freight'
  | 'other'

/**
 * Margin calculation method validator
 */
export const marginCalculationMethodValidator = v.union(
  v.literal('higher_wins'),
  v.literal('percentage_only'),
  v.literal('minimum_only'),
  v.literal('custom')
)
export type MarginCalculationMethod =
  | 'higher_wins'
  | 'percentage_only'
  | 'minimum_only'
  | 'custom'

/**
 * Contact type validator
 */
export const contactTypeValidator = v.union(
  v.literal('phone'),
  v.literal('email'),
  v.literal('meeting'),
  v.literal('video_call'),
  v.literal('chat'),
  v.literal('visit'),
  v.literal('other')
)
export type ContactType = 'phone' | 'email' | 'meeting' | 'video_call' | 'chat' | 'visit' | 'other'

/**
 * Contact direction validator
 */
export const contactDirectionValidator = v.union(
  v.literal('inbound'),
  v.literal('outbound')
)
export type ContactDirection = 'inbound' | 'outbound'

/**
 * Contact outcome validator
 */
export const contactOutcomeValidator = v.union(
  v.literal('successful'),
  v.literal('no_answer'),
  v.literal('left_message'),
  v.literal('callback_requested'),
  v.literal('issue_resolved'),
  v.literal('issue_escalated'),
  v.literal('quote_sent'),
  v.literal('order_received'),
  v.literal('complaint'),
  v.literal('inquiry'),
  v.literal('follow_up_needed'),
  v.literal('other')
)
export type ContactOutcome =
  | 'successful'
  | 'no_answer'
  | 'left_message'
  | 'callback_requested'
  | 'issue_resolved'
  | 'issue_escalated'
  | 'quote_sent'
  | 'order_received'
  | 'complaint'
  | 'inquiry'
  | 'follow_up_needed'
  | 'other'

/**
 * Contact category validator
 */
export const contactCategoryValidator = v.union(
  v.literal('sales'),
  v.literal('support'),
  v.literal('billing'),
  v.literal('complaint'),
  v.literal('general'),
  v.literal('other')
)
export type ContactCategory = 'sales' | 'support' | 'billing' | 'complaint' | 'general' | 'other'

/**
 * Contact priority validator
 */
export const contactPriorityValidator = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
  v.literal('urgent')
)
export type ContactPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Dunning method validator
 */
export const dunningMethodValidator = v.union(
  v.literal('email'),
  v.literal('phone'),
  v.literal('letter'),
  v.literal('legal')
)
export type DunningMethod = 'email' | 'phone' | 'letter' | 'legal'

// ============================================================================
// Employee Commission Validators - Commission-related types
// ============================================================================

/**
 * Employee commission type validator (detailed)
 */
export const employeeCommissionTypeValidator = v.union(
  v.literal('margin_percentage'),
  v.literal('revenue_percentage'),
  v.literal('fixed_amount'),
  v.literal('tiered')
)
export type EmployeeCommissionType =
  | 'margin_percentage'
  | 'revenue_percentage'
  | 'fixed_amount'
  | 'tiered'

/**
 * Commission status validator (detailed)
 */
export const commissionStatusValidator = v.union(
  v.literal('pending'),
  v.literal('approved'),
  v.literal('paid'),
  v.literal('cancelled')
)
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled'

/**
 * Invoice payment status validator
 */
export const invoicePaymentStatusValidator = v.union(
  v.literal('unpaid'),
  v.literal('partial'),
  v.literal('paid')
)
export type InvoicePaymentStatus = 'unpaid' | 'partial' | 'paid'

// ============================================================================
// Employee Management Validators - Management-related types
// ============================================================================

/**
 * Rank by metric validator
 */
export const rankByMetricValidator = v.union(
  v.literal('orders'),
  v.literal('revenue'),
  v.literal('conversion'),
  v.literal('commissions')
)
export type RankByMetric = 'orders' | 'revenue' | 'conversion' | 'commissions'

/**
 * Vacation type validator
 */
export const vacationTypeValidator = v.union(
  v.literal('annual'),
  v.literal('sick'),
  v.literal('personal'),
  v.literal('unpaid'),
  v.literal('parental'),
  v.literal('bereavement'),
  v.literal('maternity'),
  v.literal('paternity'),
  v.literal('other')
)
export type VacationType =
  | 'annual'
  | 'sick'
  | 'personal'
  | 'unpaid'
  | 'parental'
  | 'bereavement'
  | 'maternity'
  | 'paternity'
  | 'other'

/**
 * Vacation status validator (detailed)
 */
export const vacationStatusValidator = v.union(
  v.literal('pending'),
  v.literal('approved'),
  v.literal('rejected'),
  v.literal('cancelled')
)
export type VacationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

/**
 * Session type validator
 */
export const sessionTypeValidator = v.union(
  v.literal('manual'),
  v.literal('automatic')
)
export type SessionType = 'manual' | 'automatic'

/**
 * Break type validator
 */
export const breakTypeValidator = v.union(
  v.literal('lunch'),
  v.literal('coffee'),
  v.literal('personal'),
  v.literal('meeting')
)
export type BreakType = 'lunch' | 'coffee' | 'personal' | 'meeting'

// ============================================================================
// Partner Validators - Partner-related types
// ============================================================================

/**
 * Partner service type validator
 */
export const partnerServiceTypeValidator = v.union(
  v.literal('OBC'),
  v.literal('NFO'),
  v.literal('both')
)
export type PartnerServiceType = 'OBC' | 'NFO' | 'both'

/**
 * Shipment type validator (for NFO quotes)
 */
export const shipmentTypeValidator = v.union(
  v.literal('door-door'),
  v.literal('door-airport'),
  v.literal('airport-door'),
  v.literal('airport-airport')
)
export type ShipmentType = 'door-door' | 'door-airport' | 'airport-door' | 'airport-airport'

// ============================================================================
// Communication Validators - Communication-related types
// ============================================================================

/**
 * Communication channel validator
 */
export const communicationChannelValidator = v.union(
  v.literal('email'),
  v.literal('whatsapp'),
  v.literal('phone'),
  v.literal('other')
)

// Enhanced Communication Channels (per YOUROBC.md line 681)
export interface CommunicationChannel {
  type: 'email' | 'whatsapp' | 'phone' | 'other'
  identifier: string // email address, phone number, group name
  label?: string // friendly name
}

// ============================================================================
// Statistics Validators - Statistics and reporting types
// ============================================================================

/**
 * Office cost category validator
 */
export const officeCostCategoryValidator = v.union(
  v.literal('rent'),
  v.literal('utilities'),
  v.literal('insurance'),
  v.literal('maintenance'),
  v.literal('supplies'),
  v.literal('technology'),
  v.literal('other')
)
export type OfficeCostCategory =
  | 'rent'
  | 'utilities'
  | 'insurance'
  | 'maintenance'
  | 'supplies'
  | 'technology'
  | 'other'

/**
 * Cost frequency validator
 */
export const costFrequencyValidator = v.union(
  v.literal('one_time'),
  v.literal('monthly'),
  v.literal('quarterly'),
  v.literal('yearly')
)
export type CostFrequency = 'one_time' | 'monthly' | 'quarterly' | 'yearly'

/**
 * Miscellaneous expense category validator
 */
export const miscExpenseCategoryValidator = v.union(
  v.literal('trade_show'),
  v.literal('marketing'),
  v.literal('tools'),
  v.literal('software'),
  v.literal('travel'),
  v.literal('entertainment'),
  v.literal('other')
)
export type MiscExpenseCategory =
  | 'trade_show'
  | 'marketing'
  | 'tools'
  | 'software'
  | 'travel'
  | 'entertainment'
  | 'other'

/**
 * Target type validator
 */
export const targetTypeValidator = v.union(
  v.literal('employee'),
  v.literal('team'),
  v.literal('company')
)
export type TargetType = 'employee' | 'team' | 'company'

/**
 * KPI cache type validator
 */
export const kpiCacheTypeValidator = v.union(
  v.literal('employee'),
  v.literal('customer'),
  v.literal('company'),
  v.literal('department')
)
export type KpiCacheType = 'employee' | 'customer' | 'company' | 'department'

// ============================================================================
// Supporting Validators - Supporting entity types
// ============================================================================

/**
 * Inquiry source type validator
 */
export const inquirySourceTypeValidator = v.union(
  v.literal('website'),
  v.literal('referral'),
  v.literal('partner'),
  v.literal('advertising'),
  v.literal('direct')
)
export type InquirySourceType = 'website' | 'referral' | 'partner' | 'advertising' | 'direct'

/**
 * Wiki entry type validator
 */
export const wikiEntryTypeValidator = v.union(
  v.literal('sop'),
  v.literal('airline_rules'),
  v.literal('partner_info'),
  v.literal('procedure')
)
export type WikiEntryType = 'sop' | 'airline_rules' | 'partner_info' | 'procedure'

/**
 * Wiki status validator
 */
export const wikiStatusValidator = v.union(
  v.literal('draft'),
  v.literal('published'),
  v.literal('archived')
)
export type WikiStatus = 'draft' | 'published' | 'archived'

/**
 * Comment type validator
 */
export const commentTypeValidator = v.union(
  v.literal('note'),
  v.literal('status_update'),
  v.literal('customer_communication'),
  v.literal('internal')
)
export type CommentType = 'note' | 'status_update' | 'customer_communication' | 'internal'

/**
 * Reminder type validator
 */
export const reminderTypeValidator = v.union(
  v.literal('follow_up'),
  v.literal('deadline'),
  v.literal('review'),
  v.literal('payment'),
  v.literal('vacation_approval'),
  v.literal('commission_review'),
  v.literal('performance_review')
)
export type ReminderType =
  | 'follow_up'
  | 'deadline'
  | 'review'
  | 'payment'
  | 'vacation_approval'
  | 'commission_review'
  | 'performance_review'

/**
 * Recurrence frequency validator
 */
export const recurrenceFrequencyValidator = v.union(
  v.literal('daily'),
  v.literal('weekly'),
  v.literal('monthly'),
  v.literal('yearly')
)
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * Document type validator (comprehensive)
 */
export const documentTypeValidator = v.union(
  v.literal('contract'),
  v.literal('awb'),
  v.literal('pod'),
  v.literal('invoice'),
  v.literal('certificate'),
  v.literal('customs'),
  v.literal('photo'),
  // Employee document types
  v.literal('employment_contract'),
  v.literal('id_document'),
  v.literal('training_certificate'),
  v.literal('performance_review'),
  v.literal('vacation_request'),
  v.literal('commission_statement'),
  v.literal('other')
)
export type DocumentType =
  | 'contract'
  | 'awb'
  | 'pod'
  | 'invoice'
  | 'certificate'
  | 'customs'
  | 'photo'
  | 'employment_contract'
  | 'id_document'
  | 'training_certificate'
  | 'performance_review'
  | 'vacation_request'
  | 'commission_statement'
  | 'other'

/**
 * Document status validator
 */
export const documentStatusValidator = v.union(
  v.literal('ready'),
  v.literal('processing'),
  v.literal('error')
)
export type DocumentStatus = 'ready' | 'processing' | 'error'

/**
 * Notification type validator
 */
export const notificationTypeValidator = v.union(
  v.literal('quote_expiring'),
  v.literal('sla_warning'),
  v.literal('payment_overdue'),
  v.literal('task_assigned'),
  v.literal('reminder_due'),
  v.literal('vacation_request'),
  v.literal('vacation_approved'),
  v.literal('vacation_denied'),
  v.literal('commission_ready'),
  v.literal('performance_review_due'),
  v.literal('employee_status_change')
)
export type NotificationType =
  | 'quote_expiring'
  | 'sla_warning'
  | 'payment_overdue'
  | 'task_assigned'
  | 'reminder_due'
  | 'vacation_request'
  | 'vacation_approved'
  | 'vacation_denied'
  | 'commission_ready'
  | 'performance_review_due'
  | 'employee_status_change'

/**
 * Counter type validator
 */
export const counterTypeValidator = v.union(
  v.literal('customer'),
  v.literal('quote'),
  v.literal('shipment'),
  v.literal('invoice'),
  v.literal('employee'),
  v.literal('courier')
)
export type CounterType = 'customer' | 'quote' | 'shipment' | 'invoice' | 'employee' | 'courier'

// ============================================================================
// Task Validators - Task management types
// ============================================================================

/**
 * Task type validator
 */
export const taskTypeValidator = v.union(
  v.literal('manual'),
  v.literal('automatic')
)
export type TaskType = 'manual' | 'automatic'

/**
 * Task status validator
 */
export const taskStatusValidator = v.union(
  v.literal('pending'),
  v.literal('in_progress'),
  v.literal('completed'),
  v.literal('cancelled')
)
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

/**
 * Task priority validator
 */
export const taskPriorityValidator = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
  v.literal('critical')
)
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

// ============================================================================
// Tracking Message Validators - Tracking communication types
// ============================================================================

/**
 * Language validator
 */
export const languageValidator = v.union(
  v.literal('en'),
  v.literal('de')
)
export type Language = 'en' | 'de'

/**
 * Message category validator
 */
export const messageCategoryValidator = v.union(
  v.literal('booking'),
  v.literal('pickup'),
  v.literal('in_transit'),
  v.literal('delivery'),
  v.literal('customs'),
  v.literal('general')
)
export type MessageCategory = 'booking' | 'pickup' | 'in_transit' | 'delivery' | 'customs' | 'general'

// ============================================================================
// Contact Role Validators - Contact person roles
// ============================================================================

/**
 * Contact role validator
 */
export const contactRoleValidator = v.union(
  v.literal('Entscheider'), // Decision maker
  v.literal('Buchhaltung'), // Accounting
  v.literal('Logistik'), // Logistics
  v.literal('Einkauf'), // Purchasing
  v.literal('Geschäftsführung'), // Management
  v.literal('Sonstiges') // Other
)
export type ContactRole =
  | 'Entscheider'
  | 'Buchhaltung'
  | 'Logistik'
  | 'Einkauf'
  | 'Geschäftsführung'
  | 'Sonstiges'

/**
 * Preferred contact method validator
 */
export const preferredContactMethodValidator = v.union(
  v.literal('email'),
  v.literal('phone'),
  v.literal('mobile')
)
export type PreferredContactMethod = 'email' | 'phone' | 'mobile'

// ============================================================================
// Dimension and Unit Validators - Measurement types
// ============================================================================

/**
 * Dimension unit validator
 */
export const dimensionUnitValidator = v.union(
  v.literal('cm'),
  v.literal('inch')
)
export type DimensionUnit = 'cm' | 'inch'

/**
 * Weight unit validator
 */
export const weightUnitValidator = v.union(
  v.literal('kg'),
  v.literal('lb')
)
export type WeightUnit = 'kg' | 'lb'

// ============================================================================
// SLA Validators - Service level agreement types
// ============================================================================

/**
 * SLA status validator
 */
export const slaStatusValidator = v.union(
  v.literal('on_time'),
  v.literal('warning'),
  v.literal('overdue')
)
export type SlaStatus = 'on_time' | 'warning' | 'overdue'

// ============================================================================
// Document Status Validators - Shipment document statuses
// ============================================================================

/**
 * Document completion status validator
 */
export const documentCompletionStatusValidator = v.union(
  v.literal('missing'),
  v.literal('pending'),
  v.literal('complete')
)
export type DocumentCompletionStatus = 'missing' | 'pending' | 'complete'

// ============================================================================
// Collection Method Validators - Debt collection methods
// ============================================================================

/**
 * Collection method validator
 */
export const collectionMethodValidator = v.union(
  v.literal('email'),
  v.literal('phone'),
  v.literal('letter'),
  v.literal('legal_notice'),
  v.literal('debt_collection')
)
export type CollectionMethod = 'email' | 'phone' | 'letter' | 'legal_notice' | 'debt_collection'

// ============================================================================
// Reusable Schemas - Complex object validators
// ============================================================================

/**
 * Address schema validator
 */
export const addressSchema = v.object({
  street: v.optional(v.string()),
  city: v.string(),
  postalCode: v.optional(v.string()),
  country: v.string(),
  countryCode: v.string(),
})

/**
 * Contact person schema validator
 */
export const contactSchema = v.object({
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  isPrimary: v.boolean(),
  role: v.optional(contactRoleValidator),
  position: v.optional(v.string()),
  department: v.optional(v.string()),
  mobile: v.optional(v.string()),
  preferredContactMethod: v.optional(preferredContactMethodValidator),
  notes: v.optional(v.string()),
})

/**
 * Dimensions schema validator
 */
export const dimensionsSchema = v.object({
  length: v.number(),
  width: v.number(),
  height: v.number(),
  weight: v.number(),
  unit: dimensionUnitValidator,
  weightUnit: weightUnitValidator,
  chargeableWeight: v.optional(v.number()), // Calculated chargeable weight (YOUROBC.md line 454)
})

/**
 * Currency amount schema validator
 */
export const currencyAmountSchema = v.object({
  amount: v.number(),
  currency: currencyValidator,
  exchangeRate: v.optional(v.number()),
  exchangeRateDate: v.optional(v.number()),
})

/**
 * SLA schema validator
 */
export const slaSchema = v.object({
  deadline: v.number(),
  status: slaStatusValidator,
  remainingHours: v.optional(v.number()),
})

/**
 * Time entry schema validator
 */
export const timeEntrySchema = v.object({
  type: timeEntryTypeValidator,
  timestamp: v.number(),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),
})

/**
 * Skills schema validator
 */
export const skillsSchema = v.object({
  languages: v.array(v.string()),
  maxCarryWeight: v.optional(v.number()),
  availableServices: v.array(quoteServiceTypeValidator),
  certifications: v.optional(v.array(v.string())),
})

/**
 * Flight details schema validator
 */
export const flightDetailsSchema = v.object({
  flightNumber: v.optional(v.string()),
  airline: v.optional(v.string()),
  airlineCode: v.optional(v.string()),
  departureTime: v.optional(v.number()),
  arrivalTime: v.optional(v.number()),
  departureAirport: v.optional(v.string()),
  arrivalAirport: v.optional(v.string()),
})

/**
 * Line item schema validator
 */
export const lineItemSchema = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: currencyAmountSchema,
  totalPrice: currencyAmountSchema,
})

/**
 * Partner quote schema validator
 */
export const partnerQuoteSchema = v.object({
  partnerId: v.id('yourobcPartners'),
  partnerName: v.string(),
  quotedPrice: currencyAmountSchema,
  transitTime: v.optional(v.number()),
  validUntil: v.optional(v.number()),
  receivedAt: v.number(),
  notes: v.optional(v.string()),
  isSelected: v.optional(v.boolean()),
})

/**
 * Airline rules schema validator
 * Applied airline rules for courier calculation
 */
export const airlineRulesSchema = v.object({
  airlineCode: v.string(),
  airlineName: v.string(),
  maxBaggageWeight: v.number(),
  maxBaggagePieces: v.number(),
  excessBaggageFee: v.optional(v.number()),
  couriersRequired: v.optional(v.number()),
})

/**
 * Next task schema validator
 */
export const nextTaskSchema = v.object({
  description: v.string(),
  assignedTo: v.optional(v.string()),
  dueDate: v.optional(v.number()),
  priority: servicePriorityValidator,
})

/**
 * Service coverage schema validator
 */
export const serviceCoverageSchema = v.object({
  countries: v.array(v.string()),
  cities: v.array(v.string()),
  airports: v.array(v.string()),
})

/**
 * Collection attempt schema validator
 */
export const collectionAttemptSchema = v.object({
  date: v.number(),
  method: collectionMethodValidator,
  result: v.string(),
  createdBy: v.string(),
})

/**
 * Routing schema validator
 */
export const routingSchema = v.object({
  outboundFlight: v.optional(flightDetailsSchema),
  returnFlight: v.optional(flightDetailsSchema),
  cwt: v.optional(v.number()), // Calculated chargeable weight (for NFO)
  preAlertCwt: v.optional(v.number()), // Pre-Alert chargeable weight (for NFO validation - YOUROBC.md lines 474, 572)
})

/**
 * Document status schema validator
 */
export const documentStatusSchema = v.object({
  awb: documentCompletionStatusValidator,
  hawb: v.optional(documentCompletionStatusValidator), // NFO only
  mawb: v.optional(documentCompletionStatusValidator), // NFO only
  pod: documentCompletionStatusValidator, // Proof of Delivery
})

/**
 * Customs information schema validator
 */
export const customsInfoSchema = v.object({
  hasExport: v.boolean(),
  hasImport: v.boolean(),
  hasTransit: v.boolean(),
  exportDocuments: v.optional(v.array(v.string())),
  importDocuments: v.optional(v.array(v.string())),
  transitDocuments: v.optional(v.array(v.string())),
  customsValue: v.optional(currencyAmountSchema),
  customsNotes: v.optional(v.string()),
})

/**
 * Scheduled time schema validator
 * Stores a moment in time with its timezone context
 * Use utcTimestamp for comparisons/sorting, timezone for display
 */
export const scheduledTimeSchema = v.object({
  utcTimestamp: v.number(), // Unix epoch timestamp in milliseconds (UTC)
  timezone: v.string(), // IANA timezone identifier (e.g., 'America/Los_Angeles', 'Europe/Berlin')
})

export type ScheduledTime = {
  utcTimestamp: number  // Unix epoch timestamp in milliseconds (UTC)
  timezone: string      // IANA timezone identifier
}

/**
 * Entity statistics schema validator
 */
export const entityStatsSchema = v.object({
  totalQuotes: v.number(),
  acceptedQuotes: v.number(),
  totalRevenue: v.number(),
  lastQuoteDate: v.optional(v.number()),
  lastShipmentDate: v.optional(v.number()),
})

/**
 * Metadata schema validator
 * Provides standard fields for tagging, categorization, and custom data
 */
export const metadataSchema = {
  tags: v.array(v.string()),
  category: v.optional(v.string()),
  customFields: v.optional(v.object({})),
}

/**
 * Statistics schema validator (for usage tracking)
 */
export const statsSchema = v.object({
  usageCount: v.number(),
  rating: v.optional(v.number()),
  ratingCount: v.optional(v.number()),
})

// ============================================================================
// Audit Fields - Standard audit tracking fields
// ============================================================================

/**
 * Audit fields for tracking creation and updates
 */
export const auditFields = {
  createdBy: v.string(), // authUserId
  createdAt: v.number(),
  updatedBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
}

/**
 * Soft delete fields for logical deletion
 */
export const softDeleteFields = {
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.string()),
}

// ============================================================================
// Namespace Organization - Grouped validators for cleaner imports
// ============================================================================

/**
 * Customer-related validators
 */
export const customerTypes = {
  status: customerStatusValidator,
  marginServiceType: marginServiceTypeValidator,
  marginCalculationMethod: marginCalculationMethodValidator,
  contactType: contactTypeValidator,
  contactDirection: contactDirectionValidator,
  contactOutcome: contactOutcomeValidator,
  contactCategory: contactCategoryValidator,
  contactPriority: contactPriorityValidator,
}

/**
 * Quote-related validators
 */
export const quoteTypes = {
  status: quoteStatusValidator,
  serviceType: quoteServiceTypeValidator,
  priority: servicePriorityValidator,
}

/**
 * Shipment-related validators
 */
export const shipmentTypes = {
  status: shipmentStatusValidator,
  priority: servicePriorityValidator,
  slaStatus: slaStatusValidator,
  documentCompletionStatus: documentCompletionStatusValidator,
}

/**
 * Invoice-related validators
 */
export const invoiceTypes = {
  status: invoiceStatusValidator,
  type: invoiceTypeValidator,
  paymentStatus: invoicePaymentStatusValidator,
  paymentMethod: paymentMethodValidator,
  incomingStatus: incomingInvoiceStatusValidator,
  autoGenStatus: invoiceAutoGenStatusValidator,
}

/**
 * Accounting-related validators
 */
export const accountingTypes = {
  metric: accountingMetricValidator,
  incomingInvoiceStatus: incomingInvoiceStatusValidator,
  autoGenStatus: invoiceAutoGenStatusValidator,
  exportFormat: exportFormatValidator,
  statementTransactionType: statementTransactionTypeValidator,
}

/**
 * Employee-related validators
 */
export const employeeTypes = {
  status: employeeStatusValidator,
  workStatus: workStatusValidator,
  commissionType: employeeCommissionTypeValidator,
  commissionStatus: commissionStatusValidator,
  commissionSimpleStatus: commissionSimpleStatusValidator,
  vacationType: vacationTypeValidator,
  vacationStatus: vacationStatusValidator,
  vacationSimpleStatus: vacationSimpleStatusValidator,
  sessionType: sessionTypeValidator,
  breakType: breakTypeValidator,
  timeEntryType: timeEntryTypeValidator,
  documentType: employeeDocumentTypeValidator,
  rankByMetric: rankByMetricValidator,
}

/**
 * Task-related validators
 */
export const taskTypes = {
  type: taskTypeValidator,
  status: taskStatusValidator,
  priority: taskPriorityValidator,
}

/**
 * Partner-related validators
 */
export const partnerTypes = {
  status: partnerStatusValidator,
  serviceType: partnerServiceTypeValidator,
}

/**
 * Statistics and KPI validators
 */
export const statisticsTypes = {
  officeCostCategory: officeCostCategoryValidator,
  costFrequency: costFrequencyValidator,
  miscExpenseCategory: miscExpenseCategoryValidator,
  targetType: targetTypeValidator,
  kpiCacheType: kpiCacheTypeValidator,
}

/**
 * Communication validators
 */
export const communicationTypes = {
  channel: communicationChannelValidator,
  language: languageValidator,
  messageCategory: messageCategoryValidator,
  notificationType: notificationTypeValidator,
  notificationPriority: notificationPriorityValidator,
}

/**
 * Supporting entity validators
 */
export const supportingTypes = {
  reminderType: reminderTypeValidator,
  reminderStatus: reminderStatusValidator,
  recurrenceFrequency: recurrenceFrequencyValidator,
  documentType: documentTypeValidator,
  documentStatus: documentStatusValidator,
  commentType: commentTypeValidator,
  wikiEntryType: wikiEntryTypeValidator,
  wikiStatus: wikiStatusValidator,
  inquirySourceType: inquirySourceTypeValidator,
  courierStatus: courierStatusValidator,
  counterType: counterTypeValidator,
  dunningMethod: dunningMethodValidator,
  collectionMethod: collectionMethodValidator,
}

/**
 * Generic template validators
 */
export const templateTypes = {
  status: statusValidator,
  difficulty: difficultyValidator,
  visibility: visibilityValidator,
  priority: servicePriorityValidator, // Reusing service priority for templates
}

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * This file is the SINGLE SOURCE OF TRUTH for all YourOBC validators and types.
 *
 * ✅ DO:
 * - Define all Convex validators here using v.union(), v.literal(), etc.
 * - Export corresponding TypeScript types for each validator
 * - Import these validators in schema table definitions
 * - Import these validators in mutations/queries args
 * - Import these types in TypeScript type definitions
 * - Use spread operator for auditFields, softDeleteFields, metadataSchema
 * - Use namespace imports for cleaner, organized code (customerTypes, taskTypes, etc.)
 *
 * ❌ DON'T:
 * - Redefine validators in constants.ts or other files
 * - Redefine validators in mutations.ts or queries.ts
 * - Duplicate type definitions elsewhere
 * - Use inline v.union() in multiple places
 * - Use compatibility objects (e.g., yourobcStatusTypes)
 *
 * EXAMPLES:
 *
 * In schema table definitions (individual imports):
 *   import { customerStatusValidator, auditFields } from './base'
 *   export const customersTable = defineTable({
 *     status: customerStatusValidator,
 *     ...auditFields,
 *     ...softDeleteFields,
 *   })
 *
 * In schema table definitions (namespace imports):
 *   import { customerTypes, auditFields } from './base'
 *   export const customersTable = defineTable({
 *     status: customerTypes.status,
 *     contactType: customerTypes.contactType,
 *     ...auditFields,
 *   })
 *
 * In mutations (individual imports):
 *   import { customerStatusValidator } from '../../../../schema/yourobc/base'
 *   export const updateCustomer = mutation({
 *     args: { status: v.optional(customerStatusValidator) }
 *   })
 *
 * In mutations (namespace imports):
 *   import { customerTypes } from '../../../../schema/yourobc/base'
 *   export const updateCustomer = mutation({
 *     args: { status: v.optional(customerTypes.status) }
 *   })
 *
 * In TypeScript types:
 *   import type { CustomerStatus, QuoteStatus } from '../../../../schema/yourobc/base'
 *   export interface CustomerData {
 *     status: CustomerStatus
 *     quoteStatus: QuoteStatus
 *   }
 *
 * NAMESPACE ORGANIZATION:
 *
 * Validators are organized into namespaces for cleaner imports:
 * - customerTypes: Customer-related validators (status, contact types, margins, priority, etc.)
 * - quoteTypes: Quote-related validators (status, service type, priority)
 * - shipmentTypes: Shipment-related validators (status, SLA, documents)
 * - invoiceTypes: Invoice-related validators (status, type, payment)
 * - accountingTypes: Accounting-related validators (metrics, formats, transaction types)
 * - employeeTypes: Employee-related validators (status, commission, vacation, sessions)
 * - taskTypes: Task-related validators (type, status, priority)
 * - partnerTypes: Partner-related validators (status, service type)
 * - statisticsTypes: Statistics and KPI validators (costs, targets, cache types)
 * - communicationTypes: Communication validators (channels, languages, messages)
 * - supportingTypes: Supporting entity validators (reminders, documents, wiki, etc.)
 * - templateTypes: Generic template validators (status, difficulty, visibility)
 *
 * You can use either individual imports or namespace imports based on your preference.
 * Namespace imports are recommended when using multiple validators from the same domain.
 */

