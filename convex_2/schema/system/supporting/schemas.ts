// convex/schema/system/supporting/supporting/schemas.ts
// Schema exports for supporting module

import {
  wikiEntriesTable,
  commentsTable,
  remindersTable,
  documentsTable,
  scheduledEventsTable,
  availabilityPreferencesTable,
} from './supporting';

export const systemSupportingSupportingSchemas = {
  wikiEntries: wikiEntriesTable,
  comments: commentsTable,
  reminders: remindersTable,
  documents: documentsTable,
  scheduledEvents: scheduledEventsTable,
  availabilityPreferences: availabilityPreferencesTable,
};
