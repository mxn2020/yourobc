// convex/schema/software/yourobc/accounting/types.ts
// Type extractions from validators for accounting module

import { Infer } from 'convex/values';
import { accountingValidators } from './validators';

// Extract types from validators
export type AccountingStatus = Infer<typeof accountingValidators.status>;
export type AccountingTransactionType = Infer<typeof accountingValidators.transactionType>;
export type AccountingReconciliationStatus = Infer<typeof accountingValidators.reconciliationStatus>;
export type AccountingApprovalStatus = Infer<typeof accountingValidators.approvalStatus>;
