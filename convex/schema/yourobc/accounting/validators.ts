// convex/schema/yourobc/accounting/validators.ts
// Grouped validators for accounting module

import { v } from 'convex/values';

export const accountingValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('pending'),
    v.literal('approved'),
    v.literal('posted'),
    v.literal('reconciled'),
    v.literal('cancelled'),
    v.literal('archived')
  ),

  transactionType: v.union(
    v.literal('journal_entry'),
    v.literal('invoice'),
    v.literal('expense'),
    v.literal('payment'),
    v.literal('transfer'),
    v.literal('adjustment')
  ),

  reconciliationStatus: v.union(
    v.literal('unreconciled'),
    v.literal('partial'),
    v.literal('reconciled'),
    v.literal('disputed')
  ),

  approvalStatus: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected'),
    v.literal('revision_requested')
  ),
} as const;
