// convex/lib/system/supporting/wiki_entries/types.ts
// Type definitions for system wiki entries module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  WikiEntryType,
  WikiEntryStatus,
} from '@/schema/system/supporting/wikiEntries/types';

export type SystemWikiEntry = Doc<'wikiEntries'>;
export type SystemWikiEntryId = Id<'wikiEntries'>;

export interface CreateSystemWikiEntryData {
  title: string;
  slug: string;
  content: string;
  type: WikiEntryType;
  status?: WikiEntryStatus;
  tags?: string[];
}

export interface UpdateSystemWikiEntryData {
  title?: string;
  slug?: string;
  content?: string;
  status?: WikiEntryStatus;
  tags?: string[];
}

export interface SystemWikiEntryFilters {
  type?: WikiEntryType;
  status?: WikiEntryStatus;
  tag?: string;
}

export interface SystemWikiEntryListResponse {
  items: SystemWikiEntry[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}
