// src/features/yourobc/supporting/inquiry-sources/hooks/useInquirySources.ts

import { useCallback, useMemo } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { inquirySourcesService } from '../services/InquirySourcesService'
import type {
  CreateInquirySourceData,
  UpdateInquirySourceData,
  InquirySourceId,
  InquirySourceFilters,
} from '../types'

/**
 * Main hook for inquiry source management
 */
export function useInquirySources(filters?: InquirySourceFilters) {
  const authUser = useAuthenticatedUser()

  const {
    data: sources,
    isPending,
    error,
    refetch,
  } = inquirySourcesService.useInquirySources(authUser?.id!, filters)

  const createMutation = inquirySourcesService.useCreateInquirySource()
  const updateMutation = inquirySourcesService.useUpdateInquirySource()

  const createInquirySource = useCallback(async (data: CreateInquirySourceData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = inquirySourcesService.validateInquirySourceData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    return await inquirySourcesService.createInquirySource(createMutation, authUser.id, data)
  }, [authUser, createMutation])

  const updateInquirySource = useCallback(async (
    sourceId: InquirySourceId,
    data: UpdateInquirySourceData
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = inquirySourcesService.validateInquirySourceData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    return await inquirySourcesService.updateInquirySource(updateMutation, authUser.id, sourceId, data)
  }, [authUser, updateMutation])

  const canManageInquirySources = useMemo(() => {
    if (!authUser) return false
    // All authenticated users can view, but only admins can manage
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const activeSources = useMemo(() => {
    if (!sources) return []
    return sources.filter(source => source.isActive)
  }, [sources])

  const inactiveSources = useMemo(() => {
    if (!sources) return []
    return sources.filter(source => !source.isActive)
  }, [sources])

  const sourcesByType = useMemo(() => {
    if (!sources) return {}
    return sources.reduce((acc, source) => {
      if (!acc[source.type]) {
        acc[source.type] = []
      }
      acc[source.type].push(source)
      return acc
    }, {} as Record<string, typeof sources>)
  }, [sources])

  return {
    sources: sources || [],
    activeSources,
    inactiveSources,
    sourcesByType,
    isLoading: isPending,
    error,
    refetch,
    createInquirySource,
    updateInquirySource,
    canManageInquirySources,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}

/**
 * Hook for getting only active inquiry sources (for selectors)
 */
export function useActiveInquirySources() {
  const authUser = useAuthenticatedUser()

  const {
    data: sources,
    isPending,
    error,
  } = inquirySourcesService.useActiveInquirySources(authUser?.id!)

  return {
    sources: sources || [],
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for inquiry source selector component
 */
export function useInquirySourceSelector(selectedId?: InquirySourceId) {
  const { sources, isLoading } = useActiveInquirySources()

  const selectedSource = useMemo(() => {
    if (!selectedId || !sources) return null
    return sources.find(source => source._id === selectedId) || null
  }, [selectedId, sources])

  const sortedSources = useMemo(() => {
    if (!sources) return []
    // Sort by type first, then by name
    return [...sources].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type)
      }
      return a.name.localeCompare(b.name)
    })
  }, [sources])

  return {
    sources: sortedSources,
    selectedSource,
    isLoading,
  }
}
