// convex/schema/system/supporting/schemas.ts
// Schema exports for supporting modules
// Each module is now a sibling folder following the template structure

import { supportingCommentsSchemas } from './comments/schemas';
import { supportingDocumentsSchemas } from './documents/schemas';
import { supportingExchangeRatesSchemas } from './exchangeRates/schemas';
import { supportingFollowupRemindersSchemas } from './followupReminders/schemas';
import { supportingInquirySourcesSchemas } from './inquirySources/schemas';
import { supportingNotificationsSchemas } from './notifications/schemas';
import { supportingCountersSchemas } from './counters/schemas';
import { supportingWikiEntriesSchemas } from './wikiEntries/schemas';

export const systemSupportingSchemas = {
  ...supportingCommentsSchemas,
  ...supportingDocumentsSchemas,
  ...supportingExchangeRatesSchemas,
  ...supportingFollowupRemindersSchemas,
  ...supportingInquirySourcesSchemas,
  ...supportingNotificationsSchemas,
  ...supportingCountersSchemas,
  ...supportingWikiEntriesSchemas,
};
