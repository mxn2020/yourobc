// src/features/yourobc/supporting/wiki/services/WikiService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { WikiEntry, WikiEntryId, CreateWikiEntryData, WikiCategory } from '../types'
import { WIKI_CONSTANTS } from '../types'

export class WikiService {
  // Query hooks
  useWikiEntries(
    authUserId: string | undefined,
    filters?: {
      category?: string
      type?: string[]
      status?: string[]
      isPublic?: boolean
    },
    options?: {
      limit?: number
      offset?: number
      enabled?: boolean
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.wiki.queries.getWikiEntries, {
        authUserId: authUserId || '',
        filters,
        options,
      }),
      staleTime: 30000,
      enabled: !!authUserId && (options?.enabled !== false),
    })
  }

  useWikiEntry(authUserId: string | undefined, entryId: WikiEntryId | undefined) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.wiki.queries.getWikiEntry, {
        authUserId: authUserId || '',
        entryId: entryId!,
      }),
      staleTime: 30000,
      enabled: !!authUserId && !!entryId,
    })
  }

  useSearchWiki(authUserId: string | undefined, searchTerm: string, limit?: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.wiki.queries.searchWikiEntries, {
        authUserId: authUserId || '',
        searchTerm,
        limit,
      }),
      staleTime: 10000,
      enabled: !!authUserId && searchTerm.length >= 2,
    })
  }

  useWikiCategories(authUserId: string | undefined) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.wiki.queries.getWikiCategories, {
        authUserId: authUserId || '',
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  // Mutation hooks
  useCreateWikiEntry() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.wiki.mutations.createWikiEntry),
    })
  }

  useUpdateWikiEntry() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.wiki.mutations.updateWikiEntry),
    })
  }

  usePublishWikiEntry() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.wiki.mutations.publishWikiEntry),
    })
  }

  useIncrementViews() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.wiki.mutations.incrementWikiEntryViews),
    })
  }

  // Utility functions
  validateWikiEntryData(data: Partial<CreateWikiEntryData>): string[] {
    const errors: string[] = []

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        errors.push('Title is required')
      } else if (data.title.length > WIKI_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
        errors.push(`Title must be less than ${WIKI_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`)
      }
    }

    if (data.content !== undefined) {
      if (!data.content.trim()) {
        errors.push('Content is required')
      } else if (data.content.length > WIKI_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
        errors.push(`Content must be less than ${WIKI_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`)
      }
    }

    if (data.category !== undefined && !data.category.trim()) {
      errors.push('Category is required')
    }

    if (data.tags && data.tags.length > WIKI_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Maximum ${WIKI_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`)
    }

    return errors
  }

  getTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    if (weeks < 4) return `${weeks}w ago`
    if (months < 12) return `${months}mo ago`
    return `${years}y ago`
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  groupEntriesByCategory(entries: WikiEntry[]): WikiCategory[] {
    const categoryMap = new Map<string, WikiEntry[]>()

    entries.forEach((entry) => {
      const existing = categoryMap.get(entry.category) || []
      existing.push(entry)
      categoryMap.set(entry.category, existing)
    })

    return Array.from(categoryMap.entries()).map(([name, entries]) => ({
      name,
      count: entries.length,
      entries: entries as any,
    }))
  }

  filterByType(entries: WikiEntry[], type: WikiEntry['type']): WikiEntry[] {
    return entries.filter((entry) => entry.type === type)
  }

  filterByCategory(entries: WikiEntry[], category: string): WikiEntry[] {
    return entries.filter((entry) => entry.category === category)
  }

  searchEntries(entries: WikiEntry[], searchTerm: string): WikiEntry[] {
    const term = searchTerm.toLowerCase()
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(term) ||
        entry.content.toLowerCase().includes(term) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(term))
    )
  }
}

export const wikiService = new WikiService()
