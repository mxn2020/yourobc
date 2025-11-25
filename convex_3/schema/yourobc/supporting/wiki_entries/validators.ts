// convex/schema/yourobc/supporting/wiki_entries/validators.ts
// Grouped validators for wiki entries module

import { v } from 'convex/values';
import { wikiEntryTypeValidator, wikiStatusValidator } from '@/schema/base';

/**
 * Simple union validators for wiki entries
 * Used for status fields, enums, and simple type constraints
 */
export const wikiEntriesValidators = {
  wikiEntryType: wikiEntryTypeValidator,
  wikiStatus: wikiStatusValidator,
} as const;
