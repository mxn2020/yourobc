// convex/lib/yourobc/supporting/wiki_entries/types.ts
// TypeScript type definitions for wiki entries module

import type { Doc, Id } from '@/generated/dataModel';
import type { WikiEntryType, WikiStatus } from '@/schema/yourobc/supporting/wiki_entries/types';

// Entity types
export type WikiEntry = Doc<'yourobcWikiEntries'>;
export type WikiEntryId = Id<'yourobcWikiEntries'>;

// Create operation
export interface CreateWikiEntryData {
  title: string;
  slug: string;
  content: string;
  type: WikiEntryType;
  isPublic?: boolean;
  status?: WikiStatus;
  category?: string;
  tags?: string[];
}

// Update operation
export interface UpdateWikiEntryData {
  title?: string;
  slug?: string;
  content?: string;
  type?: WikiEntryType;
  isPublic?: boolean;
  category?: string;
  tags?: string[];
}

// Publish operation
export interface PublishWikiEntryData {
  status: WikiStatus;
  isPublic?: boolean;
}

// List response
export interface WikiEntryListResponse {
  items: WikiEntry[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter options
export interface WikiEntryFilters {
  type?: WikiEntryType[];
  status?: WikiStatus[];
  isPublic?: boolean;
  category?: string;
  search?: string;
}
