// convex/schema/yourobc/accounting/schemas.ts
// Schema exports for accounting module

import { accountingTable } from './accounting';
import { accountingDashboardCacheTable } from './accountingDashboardCache';
import { incomingInvoiceTrackingTable } from './incomingInvoiceTracking';
import { invoiceAutoGenLogTable } from './invoiceAutoGenLog';
import { invoiceNumberingTable } from './invoiceNumbering';
import { statementOfAccountsTable } from './statementOfAccounts';

export const yourobcAccountingSchemas = {
  yourobcAccounting: accountingTable,
  yourobcAccountingDashboardCache: accountingDashboardCacheTable,
  yourobcIncomingInvoiceTracking: incomingInvoiceTrackingTable,
  yourobcInvoiceAutoGenLog: invoiceAutoGenLogTable,
  yourobcInvoiceNumbering: invoiceNumberingTable,
  yourobcStatementOfAccounts: statementOfAccountsTable,
};
