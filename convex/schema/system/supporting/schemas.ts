// convex/schema/system/supporting/schemas.ts
// Schema exports for supporting module

import { exchangeRatesTable } from './exchangeRates';
import { inquirySourcesTable } from './inquirySources';
import { wikiEntriesTable } from './wikiEntries';
import { commentsTable } from './comments';
import { followupRemindersTable } from './followupReminders';
import { documentsTable } from './documents';
import { notificationsTable } from './notifications';
import { countersTable } from './counters';

export const systemSupportingSchemas = {
  exchangeRates: exchangeRatesTable,
  inquirySources: inquirySourcesTable,
  wikiEntries: wikiEntriesTable,
  comments: commentsTable,
  followupReminders: followupRemindersTable,
  documents: documentsTable,
  notifications: notificationsTable,
  counters: countersTable,
};
