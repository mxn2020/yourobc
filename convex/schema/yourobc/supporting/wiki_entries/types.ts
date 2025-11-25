// convex/schema/yourobc/supporting/wiki_entries/types.ts
// Type definitions for wiki entries module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { wikiEntriesValidators } from './validators';
import { wikiEntriesTable } from './tables';

// ============================================
// Document Types
// ============================================

export type WikiEntry = Doc<'yourobcWikiEntries'>;
export type WikiEntryId = Id<'yourobcWikiEntries'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type WikiEntrySchema = Infer<typeof wikiEntriesTable.validator>;

// ============================================
// Validator Types
// ============================================

export type WikiEntryType = Infer<typeof wikiEntriesValidators.wikiEntryType>;
export type WikiStatus = Infer<typeof wikiEntriesValidators.wikiStatus>;
