// src/features/yourobc/trackingMessages/hooks/useTrackingMessages.ts

import { useCallback, useMemo } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { trackingMessagesService } from '../services/TrackingMessagesService'
import type {
  CreateTrackingMessageData,
  UpdateTrackingMessageData,
  TrackingMessageId,
  TrackingMessageFormData,
} from '../types'

/**
 * Main hook for tracking message management
 */
export function useTrackingMessages(activeOnly?: boolean) {
  const authUser = useAuthenticatedUser()

  const {
    data: messages,
    isPending,
    error,
    refetch,
  } = trackingMessagesService.useTrackingMessages(authUser?.id!, activeOnly)

  const {
    data: stats,
    isPending: isStatsLoading,
  } = trackingMessagesService.useTrackingMessageStats(authUser?.id!)

  const createMutation = trackingMessagesService.useCreateTrackingMessage()
  const updateMutation = trackingMessagesService.useUpdateTrackingMessage()
  const deleteMutation = trackingMessagesService.useDeleteTrackingMessage()
  const toggleActiveMutation = trackingMessagesService.useToggleTrackingMessageActive()
  const initializeDefaultsMutation = trackingMessagesService.useInitializeDefaultTemplates()

  const createTrackingMessage = useCallback(async (data: TrackingMessageFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = trackingMessagesService.validateTrackingMessageData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateTrackingMessageData = {
      name: data.name,
      serviceType: data.serviceType,
      status: data.status,
      language: data.language,
      subject: data.subject,
      template: data.template.trim(),
      category: data.category,
      variables: data.variables,
      isActive: data.isActive,
    }

    return await trackingMessagesService.createTrackingMessage(createMutation,
      authUser.id,
      createData
    )
  }, [authUser, createMutation])

  const updateTrackingMessage = useCallback(async (
    messageId: TrackingMessageId,
    updates: Partial<TrackingMessageFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = trackingMessagesService.validateTrackingMessageData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const updateData: UpdateTrackingMessageData = {}
    if (updates.subject !== undefined) updateData.subject = updates.subject
    if (updates.template !== undefined) updateData.template = updates.template.trim()
    if (updates.language !== undefined) updateData.language = updates.language
    if (updates.category !== undefined) updateData.category = updates.category

    return await trackingMessagesService.updateTrackingMessage(
      updateMutation,
      authUser.id,
      messageId,
      updateData
    )
  }, [authUser, updateMutation])

  const deleteTrackingMessage = useCallback(async (messageId: TrackingMessageId) => {
    if (!authUser) throw new Error('Authentication required')
    return await trackingMessagesService.deleteTrackingMessage(
      deleteMutation,
      authUser.id,
      messageId
    )
  }, [authUser, deleteMutation])

  const toggleTrackingMessageActive = useCallback(async (messageId: TrackingMessageId) => {
    if (!authUser) throw new Error('Authentication required')

    return await trackingMessagesService.toggleTrackingMessageActive(
      toggleActiveMutation,
      authUser.id,
      messageId
    )
  }, [authUser, toggleActiveMutation])

  const initializeDefaults = useCallback(async () => {
    if (!authUser) throw new Error('Authentication required')
    return await trackingMessagesService.initializeDefaultTemplates(
      initializeDefaultsMutation,
      authUser.id
    )
  }, [authUser, initializeDefaultsMutation])

  const canManageMessages = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const activeMessages = useMemo(() => {
    if (!messages) return []
    return messages.filter(msg => msg.isActive)
  }, [messages])

  const messagesByService = useMemo(() => {
    if (!messages) return { OBC: [], NFO: [] }
    return {
      OBC: messages.filter(msg => msg.serviceType === 'OBC'),
      NFO: messages.filter(msg => msg.serviceType === 'NFO'),
    }
  }, [messages])

  return {
    messages: messages || [],
    activeMessages,
    messagesByService,
    stats,
    isLoading: isPending,
    isStatsLoading,
    error,
    refetch,
    createTrackingMessage,
    updateTrackingMessage,
    deleteTrackingMessage,
    toggleTrackingMessageActive,
    initializeDefaults,
    canManageMessages,
  }
}

/**
 * Hook for tracking messages by service type
 */
export function useTrackingMessagesByService(
  serviceType: 'OBC' | 'NFO',
  activeOnly?: boolean
) {
  const authUser = useAuthenticatedUser()

  const {
    data: messages,
    isPending,
    error,
  } = trackingMessagesService.useTrackingMessagesByService(
    authUser?.id!,
    serviceType,
    activeOnly
  )

  return {
    messages: messages || [],
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for getting specific tracking message by service and status
 */
export function useTrackingMessageForServiceAndStatus(
  serviceType: 'OBC' | 'NFO',
  status: 'quoted' | 'booked' | 'pickup' | 'in_transit' | 'delivered' | 'customs' | 'document' | 'invoiced' | 'cancelled',
  language?: 'en' | 'de'
) {
  const authUser = useAuthenticatedUser()

  const {
    data: message,
    isPending,
    error,
  } = trackingMessagesService.useTrackingMessageForServiceAndStatus(
    authUser?.id!,
    serviceType,
    status,
    language
  )

  return {
    message,
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for managing a single tracking message
 */
export function useTrackingMessage(messageId: TrackingMessageId) {
  const authUser = useAuthenticatedUser()

  const {
    data: message,
    isPending,
    error,
    refetch,
  } = trackingMessagesService.useTrackingMessage(authUser?.id!, messageId)

  const canEdit = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  return {
    message,
    isLoading: isPending,
    error,
    refetch,
    canEdit,
  }
}
