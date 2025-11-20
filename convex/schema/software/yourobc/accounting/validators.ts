// convex/schema/software/yourobc/accounting/validators.ts
/**
 * Accounting Validators
 *
 * All validators for the accounting module.
 * These are imported from the base schema and re-exported for convenience.
 *
 * @module convex/schema/software/yourobc/accounting/validators
 */

import { v } from 'convex/values'
import {
  incomingInvoiceStatusValidator,
  statementTransactionTypeValidator,
  exportFormatValidator,
  invoiceAutoGenStatusValidator,
  currencyAmountSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from '../../../yourobc/base'

// Re-export validators from base
export {
  incomingInvoiceStatusValidator,
  statementTransactionTypeValidator,
  exportFormatValidator,
  invoiceAutoGenStatusValidator,
  currencyAmountSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
}

// Additional validators specific to accounting module if needed in the future
// can be defined here
