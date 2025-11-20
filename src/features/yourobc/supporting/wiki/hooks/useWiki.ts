// src/features/yourobc/supporting/wiki/hooks/useWiki.ts

import { useCallback, useMemo } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { wikiService } from '../services/WikiService'
import type { WikiEntryId, CreateWikiEntryData, WikiEntryListItem } from '../types'

export function useWikiEntries(
  category?: string,
  options?: {
    type?: string[]
    status?: string[]
    limit?: number
    enabled?: boolean
  }
) {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error, refetch } = wikiService.useWikiEntries(
    authUser?.id,
    {
      category,
      type: options?.type,
      status: options?.status || ['published'],
    },
    {
      limit: options?.limit,
      enabled: options?.enabled,
    }
  )

  const createMutation = wikiService.useCreateWikiEntry()
  const updateMutation = wikiService.useUpdateWikiEntry()
  const publishMutation = wikiService.usePublishWikiEntry()
  const incrementViewsMutation = wikiService.useIncrementViews()

  const canCreateWiki = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canEditWikiEntry = useCallback(
    (entry: WikiEntryListItem) => {
      if (!authUser) return false
      if (authUser.role === 'admin' || authUser.role === 'superadmin') return true
      return entry.createdBy === authUser.id
    },
    [authUser]
  )

  const canPublishWikiEntry = useCallback(
    (entry: WikiEntryListItem) => {
      if (!authUser) return false
      return authUser.role === 'admin' || authUser.role === 'superadmin'
    },
    [authUser]
  )

  const createWikiEntry = useCallback(
    async (entryData: CreateWikiEntryData) => {
      if (!authUser) {
        throw new Error('Authentication required to create wiki entries')
      }

      if (!canCreateWiki) {
        throw new Error('Only admins and superadmins can create wiki entries')
      }

      const errors = wikiService.validateWikiEntryData(entryData)
      if (errors.length > 0) {
        throw new Error(errors.join(', '))
      }

      return await createMutation.mutateAsync({
        authUserId: authUser.id,
        data: entryData,
      })
    },
    [authUser, canCreateWiki, createMutation]
  )

  const updateWikiEntry = useCallback(
    async (entryId: WikiEntryId, entryData: Partial<CreateWikiEntryData>) => {
      if (!authUser) {
        throw new Error('Authentication required to update wiki entries')
      }

      const errors = wikiService.validateWikiEntryData(entryData)
      if (errors.length > 0) {
        throw new Error(errors.join(', '))
      }

      return await updateMutation.mutateAsync({
        authUserId: authUser.id,
        entryId,
        data: entryData,
      })
    },
    [authUser, updateMutation]
  )

  const publishWikiEntry = useCallback(
    async (entryId: WikiEntryId) => {
      if (!authUser) {
        throw new Error('Authentication required to publish wiki entries')
      }

      return await publishMutation.mutateAsync({
        authUserId: authUser.id,
        entryId,
      })
    },
    [authUser, publishMutation]
  )

  const incrementViews = useCallback(
    async (entryId: WikiEntryId) => {
      if (!authUser) return

      return await incrementViewsMutation.mutateAsync({
        authUserId: authUser.id,
        entryId,
      })
    },
    [authUser, incrementViewsMutation]
  )

  const wikiEntries = useMemo(() => {
    if (!data?.entries) return []
    return data.entries
  }, [data])

  const enrichedEntries: WikiEntryListItem[] = useMemo(() => {
    return wikiEntries.map((entry) => ({
      ...entry,
      timeAgo: wikiService.getTimeAgo(entry.createdAt),
      canEdit: canEditWikiEntry(entry as WikiEntryListItem),
      canDelete: canEditWikiEntry(entry as WikiEntryListItem),
      canPublish: canPublishWikiEntry(entry as WikiEntryListItem),
    }))
  }, [wikiEntries, canEditWikiEntry, canPublishWikiEntry])

  return {
    entries: enrichedEntries,
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading: isPending,
    error,
    refetch,
    createWikiEntry,
    updateWikiEntry,
    publishWikiEntry,
    incrementViews,
    canCreateWiki,
  }
}

export function useWikiEntry(entryId: WikiEntryId | undefined) {
  const authUser = useAuthenticatedUser()

  const { data: entry, isPending, error, refetch } = wikiService.useWikiEntry(authUser?.id, entryId)

  const updateMutation = wikiService.useUpdateWikiEntry()
  const publishMutation = wikiService.usePublishWikiEntry()
  const incrementViewsMutation = wikiService.useIncrementViews()

  const canEdit = useMemo(() => {
    if (!authUser || !entry) return false
    if (authUser.role === 'admin' || authUser.role === 'superadmin') return true
    return entry.createdBy === authUser.id
  }, [authUser, entry])

  const canPublish = useMemo(() => {
    if (!authUser || !entry) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser, entry])

  const updateWikiEntry = useCallback(
    async (entryData: Partial<CreateWikiEntryData>) => {
      if (!authUser || !entryId) {
        throw new Error('Authentication required to update wiki entries')
      }

      const errors = wikiService.validateWikiEntryData(entryData)
      if (errors.length > 0) {
        throw new Error(errors.join(', '))
      }

      return await updateMutation.mutateAsync({
        authUserId: authUser.id,
        entryId,
        data: entryData,
      })
    },
    [authUser, entryId, updateMutation]
  )

  const publishWikiEntry = useCallback(async () => {
    if (!authUser || !entryId) {
      throw new Error('Authentication required to publish wiki entries')
    }

    return await publishMutation.mutateAsync({
      authUserId: authUser.id,
      entryId,
    })
  }, [authUser, entryId, publishMutation])

  const incrementViews = useCallback(async () => {
    if (!authUser || !entryId) return

    return await incrementViewsMutation.mutateAsync({
      authUserId: authUser.id,
      entryId,
    })
  }, [authUser, entryId, incrementViewsMutation])

  return {
    entry,
    isLoading: isPending,
    error,
    refetch,
    updateWikiEntry,
    publishWikiEntry,
    incrementViews,
    canEdit,
    canPublish,
  }
}

export function useSearchWiki(searchTerm: string) {
  const authUser = useAuthenticatedUser()

  const { data: results, isPending, error } = wikiService.useSearchWiki(authUser?.id, searchTerm, 10)

  const canEditWikiEntry = useCallback(
    (entry: WikiEntryListItem) => {
      if (!authUser) return false
      if (authUser.role === 'admin' || authUser.role === 'superadmin') return true
      return entry.createdBy === authUser.id
    },
    [authUser]
  )

  const canPublishWikiEntry = useCallback(
    (entry: WikiEntryListItem) => {
      if (!authUser) return false
      return authUser.role === 'admin' || authUser.role === 'superadmin'
    },
    [authUser]
  )

  const enrichedResults: WikiEntryListItem[] = useMemo(() => {
    const searchEntries = results || []
    return searchEntries.map((entry) => ({
      ...entry,
      timeAgo: wikiService.getTimeAgo(entry.createdAt),
      canEdit: canEditWikiEntry(entry as WikiEntryListItem),
      canDelete: canEditWikiEntry(entry as WikiEntryListItem),
      canPublish: canPublishWikiEntry(entry as WikiEntryListItem),
    }))
  }, [results, canEditWikiEntry, canPublishWikiEntry])

  return {
    results: enrichedResults,
    isLoading: isPending,
    error,
  }
}

export function useWikiCategories() {
  const authUser = useAuthenticatedUser()

  const { data: categories, isPending, error, refetch } = wikiService.useWikiCategories(authUser?.id)

  return {
    categories: categories || [],
    isLoading: isPending,
    error,
    refetch,
  }
}
