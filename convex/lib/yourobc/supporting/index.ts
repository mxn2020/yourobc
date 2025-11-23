// convex/lib/yourobc/supporting/index.ts
/**
 * Supporting Module Library Barrel Exports
 *
 * Central export point for all supporting library functions.
 * Includes per-module exports (exchangeRates, inquirySources, wikiEntries)
 * and centralized exports for remaining modules (comments, counters, documents, etc.)
 *
 * @module convex/lib/yourobc/supporting
 */

// ============================================================================
// Per-Module Exports (Refactored)
// ============================================================================

// Exchange Rates Module
export * from './exchange_rates/constants';
export type * from './exchange_rates/types';
export * from './exchange_rates/utils';
export * from './exchange_rates/permissions';
export * from './exchange_rates/queries';
export * from './exchange_rates/mutations';

// Inquiry Sources Module
export * from './inquiry_sources/constants';
export type * from './inquiry_sources/types';
export * from './inquiry_sources/utils';
export * from './inquiry_sources/permissions';
export * from './inquiry_sources/queries';
export * from './inquiry_sources/mutations';

// Wiki Entries Module
export * from './wiki_entries/constants';
export type * from './wiki_entries/types';
export * from './wiki_entries/utils';
export * from './wiki_entries/permissions';
export * from './wiki_entries/queries';
export * from './wiki_entries/mutations';

// Comments Module
export * from './comments/constants';
export type * from './comments/types';
export * from './comments/utils';
export * from './comments/permissions';
export * from './comments/queries';
export * from './comments/mutations';

// Counters Module
export * from './counters/constants';
export type * from './counters/types';
export * from './counters/utils';
export * from './counters/permissions';
export * from './counters/queries';
export * from './counters/mutations';

// Documents Module
export * from './documents/constants';
export type * from './documents/types';
export * from './documents/utils';
export * from './documents/permissions';
export * from './documents/queries';
export * from './documents/mutations';

// Followup Reminders Module
export * from './followup_reminders/constants';
export type * from './followup_reminders/types';
export * from './followup_reminders/utils';
export * from './followup_reminders/permissions';
export * from './followup_reminders/queries';
export * from './followup_reminders/mutations';

// Notifications Module
export * from './notifications/constants';
export type * from './notifications/types';
export * from './notifications/utils';
export * from './notifications/permissions';
export * from './notifications/queries';
export * from './notifications/mutations';
