// src/features/boilerplate/supporting/wiki/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type WikiEntry = Doc<'wikiEntries'>
export type WikiEntryId = Id<'wikiEntries'>


export interface CreateWikiEntryData {
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string[];
  status?: WikiEntry['status'];
  visibility?: WikiEntry['visibility'];
  parentEntryId?: Id<'wikiEntries'>;
  relatedEntries?: Array<Id<'wikiEntries'>>;
  metadata?: Record<string, unknown>;
}

export interface UpdateWikiEntryData {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  status?: WikiEntry['status'];
  visibility?: WikiEntry['visibility'];
  parentEntryId?: Id<'wikiEntries'>;
  relatedEntries?: Array<Id<'wikiEntries'>>;
  metadata?: Record<string, unknown>;
}

export interface WikiEntryFilters {
  category?: string;
  tags?: string[];
  status?: WikiEntry['status'];
  visibility?: WikiEntry['visibility'];
  createdBy?: Id<"userProfiles">;
  searchQuery?: string;
}

export interface WikiCategory {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentCategory?: string;
  entryCount: number;
}
