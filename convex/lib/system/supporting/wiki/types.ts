// convex/lib/boilerplate/supporting/wiki/types.ts

/**
 * Wiki Module Types
 * Type definitions for wiki entry operations and data structures
 */
import type { Doc, Id } from '@/generated/dataModel'

export type WikiEntry = Doc<'wikiEntries'>
export type WikiEntryId = Id<'wikiEntries'>

/**
 * Data required to create a wiki entry
 */
export interface CreateWikiEntryData {
  title: string
  content: string
  summary?: string
  category: string
  type: WikiEntry['type']
  tags?: string[]
  visibility?: WikiEntry['visibility']
}

/**
 * Data required to update a wiki entry
 */
export interface UpdateWikiEntryData {
  title?: string
  content?: string
  summary?: string
  category?: string
  type?: WikiEntry['type']
  tags?: string[]
  visibility?: WikiEntry['visibility']
  status?: WikiEntry['status']
}

/**
 * Wiki entry filter options for queries
 */
export interface WikiEntryFilters {
  type?: string
  category?: string
  status?: string
  visibility?: WikiEntry['visibility']
  searchQuery?: string
  tags?: string[]
}

/**
 * Wiki entry search result
 */
export interface WikiSearchResult extends WikiEntry {
  relevance?: number
}
