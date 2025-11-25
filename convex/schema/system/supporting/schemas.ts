// convex/schema/system/supporting/schemas.ts
// Aggregated schema exports for all supporting modules

import { systemSupportingCommentsSchemas } from './comments/schemas';
import { systemSupportingCountersSchemas } from './counters/schemas';
import { systemSupportingDocumentsSchemas } from './documents/schemas';
import { systemSupportingExchangeRatesSchemas } from './exchange_rates/schemas';
import { systemSupportingFollowupRemindersSchemas } from './followup_reminders/schemas';
import { systemSupportingInquirySourcesSchemas } from './inquiry_sources/schemas';
import { systemSupportingNotificationsSchemas } from './notifications/schemas';
import { systemSupportingWikiEntriesSchemas } from './wikiEntries/schemas';

export const systemSupportingSchemas = {
  ...systemSupportingCommentsSchemas,
  ...systemSupportingCountersSchemas,
  ...systemSupportingDocumentsSchemas,
  ...systemSupportingExchangeRatesSchemas,
  ...systemSupportingFollowupRemindersSchemas,
  ...systemSupportingInquirySourcesSchemas,
  ...systemSupportingNotificationsSchemas,
  ...systemSupportingWikiEntriesSchemas,
};
