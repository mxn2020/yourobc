// convex/schema/yourobc/supporting/schemas.ts
// Schema exports for supporting module

import { exchangeRatesTable } from './exchangeRates';
import { inquirySourcesTable } from './inquirySources';
import { wikiEntriesTable } from './wikiEntries';
import { commentsTable } from './comments';
import { followupRemindersTable } from './followupReminders';
import { documentsTable } from './documents';
import { notificationsTable } from './notifications';
import { countersTable } from './counters';

export const yourobcSupportingSchemas = {
  yourobcExchangeRates: exchangeRatesTable,
  yourobcInquirySources: inquirySourcesTable,
  yourobcWikiEntries: wikiEntriesTable,
  yourobcComments: commentsTable,
  yourobcFollowupReminders: followupRemindersTable,
  yourobcDocuments: documentsTable,
  yourobcNotifications: notificationsTable,
  yourobcCounters: countersTable,
};
