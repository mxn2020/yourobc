// src/features/yourobc/supporting/wiki/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type WikiEntry = Doc<'wikiEntries'>
export type WikiEntryId = Id<'wikiEntries'>

export type { CreateWikiEntryData } from '@/convex/lib/yourobc/supporting/wiki/types'

export interface WikiEntryFormData {
  title: string
  content: string
  category: string
  type: WikiEntry['type']
  tags: string[]
  isPublic: boolean
}

export interface WikiEntryListItem extends WikiEntry {
  timeAgo: string
  canEdit: boolean
  canDelete: boolean
  canPublish: boolean
}

export interface WikiCategory {
  name: string
  count: number
  entries?: WikiEntryListItem[]
}

export const WIKI_CONSTANTS = {
  TYPE: {
    SOP: 'sop',
    AIRLINE_RULES: 'airline_rules',
    PARTNER_INFO: 'partner_info',
    PROCEDURE: 'procedure',
  },
  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_CONTENT_LENGTH: 50000,
    MAX_TAGS: 20,
  },
} as const

export const WIKI_TYPE_LABELS: Record<WikiEntry['type'], string> = {
  sop: 'Standard Operating Procedure',
  airline_rules: 'Airline Rules',
  partner_info: 'Partner Information',
  procedure: 'Procedure',
}

export const WIKI_STATUS_LABELS: Record<WikiEntry['status'], string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export const WIKI_TYPE_ICONS: Record<WikiEntry['type'], string> = {
  sop: '📋',
  airline_rules: '✈️',
  partner_info: '🤝',
  procedure: '⚙️',
}

export const WIKI_STATUS_COLORS: Record<WikiEntry['status'], string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  published: 'bg-green-100 text-green-700 border-green-300',
  archived: 'bg-orange-100 text-orange-700 border-orange-300',
}
