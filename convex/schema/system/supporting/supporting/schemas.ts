// convex/schema/boilerplate/supporting/supporting/schemas.ts
// Schema exports for supporting module

import {
  wikiEntriesTable,
  commentsTable,
  remindersTable,
  documentsTable,
  scheduledEventsTable,
  availabilityPreferencesTable,
} from './supporting';

export const boilerplateSupportingSupportingSchemas = {
  wikiEntries: wikiEntriesTable,
  comments: commentsTable,
  reminders: remindersTable,
  documents: documentsTable,
  scheduledEvents: scheduledEventsTable,
  availabilityPreferences: availabilityPreferencesTable,
};
