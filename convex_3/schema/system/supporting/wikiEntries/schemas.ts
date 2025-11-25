// Schema exports for supporting/wikiEntries
import { wikiEntriesTable } from './wikiEntries';

export const supportingWikiEntriesSchemas = {
  wikiEntries: wikiEntriesTable,
} as const;
