// src/features/yourobc/accounting/index.ts

/**
 * YourOBC Accounting Module
 *
 * Comprehensive accounting system for managing:
 * - Incoming invoices (tracking, approval, payment)
 * - Outgoing invoices (auto-numbering, currency conversion)
 * - Statements of accounts
 * - Cash flow forecasting
 * - Dunning management
 */

// === Configuration ===
export {
  ACCOUNTING_CONFIG,
  isFeatureEnabled,
  checkFeature,
  getAccountingConfig,
  isCoreModuleEnabled,
} from './config/accounting.config'

// === Services ===
export { AccountingService, accountingService } from './services/AccountingService'

// === Hooks ===
export { useAccounting, useIncomingInvoices, useStatements } from './hooks/useAccounting'

// === Components ===
export { AccountingDashboard } from './components/AccountingDashboard'
export { ExpectedInvoicesList } from './components/ExpectedInvoicesList'
export { InvoiceApprovalQueue } from './components/InvoiceApprovalQueue'
export { MissingInvoiceAlert, MissingInvoiceWidget } from './components/MissingInvoiceAlert'
export { ReceivablesWidget } from './components/ReceivablesWidget'
export { PayablesWidget } from './components/PayablesWidget'
export { CashFlowForecast } from './components/CashFlowForecast'
export { StatementOfAccounts } from './components/StatementOfAccounts'
export { StatementExport, AgingReportExport } from './components/StatementExport'

// === Pages ===
export { AccountingDashboardPage } from './pages/AccountingDashboardPage'
export { IncomingInvoicesPage } from './pages/IncomingInvoicesPage'
export { InvoiceApprovalPage } from './pages/InvoiceApprovalPage'
export { StatementsPage } from './pages/StatementsPage'

// === Types ===
export type {
  Invoice,
  InvoiceId,
  IncomingInvoiceTracking,
  IncomingInvoiceTrackingId,
  StatementOfAccounts as StatementOfAccountsType,
  StatementOfAccountsId,
  Currency,
  CurrencyAmount,
  InvoiceStatus,
  IncomingInvoiceStatus,
  CreateOutgoingInvoiceData,
  CreateIncomingInvoiceTrackingData,
  UpdateIncomingInvoiceTrackingData,
  GenerateStatementData,
  AccountingMetrics,
  InvoiceListOptions,
  IncomingInvoiceListOptions,
} from './types'
