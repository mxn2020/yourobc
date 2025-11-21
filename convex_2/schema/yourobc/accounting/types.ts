// convex/schema/yourobc/accounting/types.ts
// Type extractions from validators for accounting module

import { Infer } from 'convex/values';
import { accountingValidators, accountingFields } from './validators';

// Extract types from validators
export type AccountingStatus = Infer<typeof accountingValidators.status>;
export type AccountingTransactionType = Infer<typeof accountingValidators.transactionType>;
export type AccountingReconciliationStatus = Infer<typeof accountingValidators.reconciliationStatus>;
export type AccountingApprovalStatus = Infer<typeof accountingValidators.approvalStatus>;
export type AccountingIncomingInvoiceStatus = Infer<typeof accountingValidators.incomingInvoiceStatus>;
export type AccountingStatementTransactionType = Infer<typeof accountingValidators.statementTransactionType>;
export type AccountingExportFormat = Infer<typeof accountingValidators.exportFormat>;
export type AccountingInvoiceAutoGenStatus = Infer<typeof accountingValidators.invoiceAutoGenStatus>;
export type AccountingAttachment = Infer<typeof accountingFields.attachment>;
export type AccountingExpectedCashflowItem = Infer<typeof accountingFields.expectedCashflowItem>;
export type AccountingStatementTransaction = Infer<typeof accountingFields.statementTransaction>;
export type AccountingOutstandingInvoice = Infer<typeof accountingFields.outstandingInvoice>;
