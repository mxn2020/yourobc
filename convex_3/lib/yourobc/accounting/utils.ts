// convex/lib/yourobc/accounting/utils.ts
// Validation functions and utility helpers for accounting module

import { ACCOUNTING_CONSTANTS } from './constants';
import type { CreateAccountingEntryData, UpdateAccountingEntryData } from './types';

/**
 * Validate accounting entry data for creation/update
 */
export function validateAccountingEntryData(
  data: Partial<CreateAccountingEntryData | UpdateAccountingEntryData>
): string[] {
  const errors: string[] = [];

  // Validate journal entry number if provided
  if (data.journalEntryNumber !== undefined) {
    const trimmed = data.journalEntryNumber.trim();

    if (trimmed.length < ACCOUNTING_CONSTANTS.LIMITS.MIN_JOURNAL_ENTRY_NUMBER_LENGTH) {
      errors.push(`Journal entry number must be at least ${ACCOUNTING_CONSTANTS.LIMITS.MIN_JOURNAL_ENTRY_NUMBER_LENGTH} characters`);
    } else if (trimmed.length > ACCOUNTING_CONSTANTS.LIMITS.MAX_JOURNAL_ENTRY_NUMBER_LENGTH) {
      errors.push(`Journal entry number cannot exceed ${ACCOUNTING_CONSTANTS.LIMITS.MAX_JOURNAL_ENTRY_NUMBER_LENGTH} characters`);
    } else if (!ACCOUNTING_CONSTANTS.VALIDATION.JOURNAL_ENTRY_NUMBER_PATTERN.test(trimmed)) {
      errors.push('Journal entry number contains invalid characters (use A-Z, 0-9, -, _)');
    }
  }

  // Validate reference number
  if (data.referenceNumber !== undefined && data.referenceNumber.trim()) {
    const trimmed = data.referenceNumber.trim();
    if (trimmed.length > ACCOUNTING_CONSTANTS.LIMITS.MAX_REFERENCE_NUMBER_LENGTH) {
      errors.push(`Reference number cannot exceed ${ACCOUNTING_CONSTANTS.LIMITS.MAX_REFERENCE_NUMBER_LENGTH} characters`);
    }
  }

  // Validate currency code
  if (data.currency !== undefined) {
    if (!ACCOUNTING_CONSTANTS.VALIDATION.CURRENCY_CODE_PATTERN.test(data.currency)) {
      errors.push('Currency code must be a valid ISO 4217 code (e.g., EUR, USD, GBP)');
    }
  }

  // Validate amounts
  if ('debitAmount' in data && data.debitAmount !== undefined) {
    if (data.debitAmount < 0) {
      errors.push('Debit amount cannot be negative');
    }
  }

  if ('creditAmount' in data && data.creditAmount !== undefined) {
    if (data.creditAmount < 0) {
      errors.push('Credit amount cannot be negative');
    }
  }

  // Validate balanced entry for journal entries
  if ('debitAmount' in data && 'creditAmount' in data && data.debitAmount !== undefined && data.creditAmount !== undefined) {
    if (data.debitAmount !== data.creditAmount) {
      errors.push('Debit and credit amounts must be equal for a balanced entry');
    }
  }

  // Validate tax rate
  if (data.taxRate !== undefined) {
    if (data.taxRate < 0 || data.taxRate > 100) {
      errors.push('Tax rate must be between 0 and 100');
    }
  }

  // Validate memo
  if (data.memo !== undefined && data.memo.trim()) {
    const trimmed = data.memo.trim();
    if (trimmed.length > ACCOUNTING_CONSTANTS.LIMITS.MAX_MEMO_LENGTH) {
      errors.push(`Memo cannot exceed ${ACCOUNTING_CONSTANTS.LIMITS.MAX_MEMO_LENGTH} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > ACCOUNTING_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${ACCOUNTING_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate approval notes
  if ('approvalNotes' in data && data.approvalNotes && data.approvalNotes.trim()) {
    const trimmed = data.approvalNotes.trim();
    if (trimmed.length > ACCOUNTING_CONSTANTS.LIMITS.MAX_APPROVAL_NOTES_LENGTH) {
      errors.push(`Approval notes cannot exceed ${ACCOUNTING_CONSTANTS.LIMITS.MAX_APPROVAL_NOTES_LENGTH} characters`);
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > ACCOUNTING_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${ACCOUNTING_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  // Validate attachments
  if ('attachments' in data && data.attachments) {
    if (data.attachments.length > ACCOUNTING_CONSTANTS.LIMITS.MAX_ATTACHMENTS) {
      errors.push(`Cannot exceed ${ACCOUNTING_CONSTANTS.LIMITS.MAX_ATTACHMENTS} attachments`);
    }
  }

  return errors;
}

/**
 * Normalize accounting entry input data (trim strings, uppercase codes, remove empty tags)
 */
export function normalizeAccountingEntryData<
  T extends Partial<CreateAccountingEntryData | UpdateAccountingEntryData>
>(data: T): T {
  const normalized: Partial<CreateAccountingEntryData & UpdateAccountingEntryData> = { ...data };

  const trimIfString = (value?: string | null) =>
    value !== undefined && value !== null ? value.trim() : value;

  normalized.journalEntryNumber = trimIfString(data.journalEntryNumber) ?? undefined;
  normalized.referenceNumber = trimIfString(data.referenceNumber) ?? undefined;
  normalized.debitAccountId = trimIfString(data.debitAccountId) ?? undefined;
  normalized.creditAccountId = trimIfString(data.creditAccountId) ?? undefined;
  normalized.accountCode = trimIfString(data.accountCode) ?? undefined;
  normalized.relatedExpenseId = trimIfString(data.relatedExpenseId) ?? undefined;
  normalized.memo = trimIfString(data.memo) ?? undefined;
  normalized.description = trimIfString(data.description) ?? undefined;
  normalized.taxCategory = trimIfString(data.taxCategory) ?? undefined;
  normalized.approvalNotes = trimIfString((data as UpdateAccountingEntryData).approvalNotes) ?? undefined;
  normalized.rejectionReason = trimIfString((data as UpdateAccountingEntryData).rejectionReason) ?? undefined;
  normalized.category = trimIfString(data.category) ?? undefined;

  if (data.currency) {
    normalized.currency = data.currency.toUpperCase();
  }

  if (data.tags) {
    const trimmedTags = data.tags.map(tag => tag.trim()).filter(Boolean);
    normalized.tags = trimmedTags;
  }

  if (data.attachments) {
    normalized.attachments = data.attachments.map(attachment => ({
      ...attachment,
      id: attachment.id.trim(),
      name: attachment.name.trim(),
      url: attachment.url.trim(),
      type: attachment.type.trim(),
    }));
  }

  return normalized as T;
}

/**
 * Format accounting entry display name
 */
export function formatAccountingEntryDisplayName(entry: { journalEntryNumber: string; status?: string }): string {
  const statusBadge = entry.status ? ` [${entry.status}]` : '';
  return `${entry.journalEntryNumber}${statusBadge}`;
}

/**
 * Generate unique journal entry number
 */
export function generateJournalEntryNumber(fiscalYear: number, sequence: number): string {
  const year = fiscalYear.toString().slice(-2);
  const seq = sequence.toString().padStart(6, '0');
  return `JE${year}-${seq}`;
}

/**
 * Check if accounting entry is editable
 */
export function isAccountingEntryEditable(entry: { status: string; deletedAt?: number }): boolean {
  if (entry.deletedAt) return false;
  return entry.status === 'draft' || entry.status === 'pending';
}

/**
 * Calculate fiscal period from date
 */
export function calculateFiscalPeriod(date: number, fiscalYearStart: number = 1): number {
  const d = new Date(date);
  const month = d.getMonth() + 1; // 1-12

  // Adjust for fiscal year start
  let period = month - fiscalYearStart + 1;
  if (period <= 0) {
    period += 12;
  }

  return period;
}

/**
 * Calculate fiscal year from date
 */
export function calculateFiscalYear(date: number, fiscalYearStart: number = 1): number {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12

  // If month is before fiscal year start, it belongs to previous fiscal year
  if (month < fiscalYearStart) {
    return year - 1;
  }

  return year;
}

/**
 * Validate entry balance
 */
export function isEntryBalanced(entry: { debitAmount: number; creditAmount: number }): boolean {
  return Math.abs(entry.debitAmount - entry.creditAmount) < 0.01; // Allow for rounding errors
}
