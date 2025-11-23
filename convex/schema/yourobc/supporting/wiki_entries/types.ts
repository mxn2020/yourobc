// convex/schema/yourobc/supporting/wiki_entries/types.ts
// Type extractions from validators for wiki entries module

import { Infer } from 'convex/values';
import { wikiEntriesValidators } from './validators';

export type WikiEntryType = Infer<typeof wikiEntriesValidators.wikiEntryType>;
export type WikiStatus = Infer<typeof wikiEntriesValidators.wikiStatus>;
