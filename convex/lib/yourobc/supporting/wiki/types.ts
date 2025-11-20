// convex/lib/yourobc/supporting/wiki/types.ts
// convex/yourobc/supporting/wiki/types.ts
import type { Doc, Id } from '../../../../_generated/dataModel';

export type WikiEntry = Doc<'yourobcWikiEntries'>;
export type WikiEntryId = Id<'yourobcWikiEntries'>;

export interface CreateWikiEntryData {
  title: string;
  content: string;
  category: string;
  type: WikiEntry['type'];
  tags?: string[];
  isPublic?: boolean;
}

