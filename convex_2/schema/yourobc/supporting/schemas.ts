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
  exchangeRates: exchangeRatesTable,
  inquirySources: inquirySourcesTable,
  wikiEntries: wikiEntriesTable,
  comments: commentsTable,
  yourobcFollowupReminders: followupRemindersTable,
  yourobcDocuments: documentsTable,
  yourobcNotifications: notificationsTable,
  yourobcCounters: countersTable,
};
