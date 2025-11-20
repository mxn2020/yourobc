// convex/lib/yourobc/accounting/index.ts

/**
 * Main Accounting Module (YourOBC)
 *
 * This module provides comprehensive accounting functionality including:
 * - Incoming invoice tracking and approval workflow
 * - Outgoing invoice auto-numbering and currency conversion
 * - Statement of accounts generation and export
 * - Accounting dashboard with receivables/payables overview
 * - Expected invoices tracking
 * - Invoice approval workflow
 */

// Export incoming invoices
export * as incomingInvoices from './incoming_invoices'

// Export outgoing invoices
export * as outgoingInvoices from './outgoing_invoices'

// Export statements
export * as statements from './statements'

// Export dashboard
export * as dashboard from './dashboard'

// Export expected invoices
export * as expectedInvoices from './expected_invoices'

// Export approval workflow
export * as approval from './approval'
