// convex/schema/yourobc/accounting/schemas.ts
// Schema exports for accounting module

import {
  accountingTable,
  accountingDashboardCacheTable,
  incomingInvoiceTrackingTable,
  invoiceAutoGenLogTable,
  invoiceNumberingTable,
  statementOfAccountsTable
} from './tables';

export const yourobcAccountingSchemas = {
  yourobcAccounting: accountingTable,
  yourobcAccountingDashboardCache: accountingDashboardCacheTable,
  yourobcIncomingInvoiceTracking: incomingInvoiceTrackingTable,
  yourobcInvoiceAutoGenLog: invoiceAutoGenLogTable,
  yourobcInvoiceNumbering: invoiceNumberingTable,
  yourobcStatementOfAccounts: statementOfAccountsTable,
};
