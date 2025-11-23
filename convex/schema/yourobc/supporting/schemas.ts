// convex/schema/yourobc/supporting/schemas.ts
// Schema exports for supporting module
// All 8 modules refactored with per-module organization

import { supportingExchangeRatesSchemas } from './exchange_rates/schemas';
import { supportingInquirySourcesSchemas } from './inquiry_sources/schemas';
import { supportingWikiEntriesSchemas } from './wiki_entries/schemas';
import { supportingCommentsSchemas } from './comments/schemas';
import { supportingCountersSchemas } from './counters/schemas';
import { supportingDocumentsSchemas } from './documents/schemas';
import { supportingFollowupRemindersSchemas } from './followup_reminders/schemas';
import { supportingNotificationsSchemas } from './notifications/schemas';

export const yourobcSupportingSchemas = {
  // Phase 1 (Priority modules - refactored)
  ...supportingExchangeRatesSchemas,
  ...supportingInquirySourcesSchemas,
  ...supportingWikiEntriesSchemas,

  // Phase 2 (Remaining modules - refactored)
  ...supportingCommentsSchemas,
  ...supportingCountersSchemas,
  ...supportingDocumentsSchemas,
  ...supportingFollowupRemindersSchemas,
  ...supportingNotificationsSchemas,
};
