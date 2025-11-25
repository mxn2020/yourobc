import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { wikiEntriesValidators } from './validators';
import { wikiEntriesTable } from './tables';

export type WikiEntry = Doc<'wikiEntries'>;
export type WikiEntryId = Id<'wikiEntries'>;
export type WikiEntrySchema = Infer<typeof wikiEntriesTable.validator>;
export type WikiEntryType = Infer<typeof wikiEntriesValidators.entryType>;
export type WikiEntryStatus = Infer<typeof wikiEntriesValidators.entryStatus>;
