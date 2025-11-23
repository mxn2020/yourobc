// convex/schema/yourobc/supporting/wiki_entries/validators.ts
// Grouped validators for wiki entries module

import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

/**
 * Simple union validators for wiki entries
 * Used for status fields, enums, and simple type constraints
 */
export const wikiEntriesValidators = {
  wikiEntryType: baseValidators.wikiEntryType,
  wikiStatus: baseValidators.wikiStatus,
} as const;
