// src/features/yourobc/trackingMessages/services/TrackingMessagesService.ts

import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateTrackingMessageData,
  UpdateTrackingMessageData,
  TrackingMessageId,
  TrackingMessageFormData,
} from '../types'

export class TrackingMessagesService {
  // ========================================
  // QUERY HOOKS
  // ========================================

  useTrackingMessages(authUserId: string, activeOnly?: boolean) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tracking_messages.queries.getAllTrackingMessages, {
        authUserId,
        activeOnly,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useTrackingMessagesByService(
    authUserId: string,
    serviceType: 'OBC' | 'NFO',
    activeOnly?: boolean
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tracking_messages.queries.getTrackingMessagesByService, {
        authUserId,
        serviceType,
        activeOnly,
      }),
      staleTime: 300000,
      enabled: !!authUserId,
    })
  }

  useTrackingMessageForServiceAndStatus(
    authUserId: string,
    serviceType: 'OBC' | 'NFO',
    status: 'quoted' | 'booked' | 'pickup' | 'in_transit' | 'delivered' | 'customs' | 'document' | 'invoiced' | 'cancelled',
    language?: 'en' | 'de'
  ) {
    return useQuery({
      ...convexQuery(
        api.lib.yourobc.tracking_messages.queries.getTrackingMessageForServiceAndStatus,
        {
          authUserId,
          serviceType,
          status,
          language,
        }
      ),
      staleTime: 300000,
      enabled: !!authUserId && !!serviceType && !!status,
    })
  }

  useTrackingMessage(authUserId: string, messageId: TrackingMessageId) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tracking_messages.queries.getTrackingMessage, {
        authUserId,
        messageId: messageId,
      }),
      staleTime: 300000,
      enabled: !!authUserId && !!messageId,
    })
  }

  useTrackingMessageStats(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tracking_messages.queries.getTrackingMessageStats, {
        authUserId,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  // ========================================
  // MUTATION HOOKS
  // ========================================

  useCreateTrackingMessage() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tracking_messages.mutations.createTrackingMessage),
    })
  }

  useUpdateTrackingMessage() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tracking_messages.mutations.updateTrackingMessage)
    })
  }

  useDeleteTrackingMessage() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tracking_messages.mutations.deleteTrackingMessage)
    })
  }

  useToggleTrackingMessageActive() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tracking_messages.mutations.toggleTrackingMessageActive)
    })
  }

  useInitializeDefaultTemplates() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tracking_messages.mutations.initializeDefaultTemplates)
    })
  }

  // ========================================
  // MUTATION ACTIONS
  // ========================================

  async createTrackingMessage(
    mutation: ReturnType<typeof this.useCreateTrackingMessage>,
    authUserId: string,
    data: CreateTrackingMessageData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, ...data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to create tracking message: ${message}`)
    }
  }

  async updateTrackingMessage(
    mutation: ReturnType<typeof this.useUpdateTrackingMessage>,
    authUserId: string,
    messageId: TrackingMessageId,
    data: UpdateTrackingMessageData
  ) {
    return await mutation.mutateAsync({ authUserId, messageId, ...data })
  }

  async deleteTrackingMessage(
    mutation: ReturnType<typeof this.useDeleteTrackingMessage>,
    authUserId: string,
    messageId: TrackingMessageId
  ) {
    return await mutation.mutateAsync({ authUserId, messageId })
  }

  async toggleTrackingMessageActive(
    mutation: ReturnType<typeof this.useToggleTrackingMessageActive>,
    authUserId: string,
    messageId: TrackingMessageId
  ) {
    return await mutation.mutateAsync({authUserId,  messageId })
  }

  async initializeDefaultTemplates(
    mutation: ReturnType<typeof this.useInitializeDefaultTemplates>,
    authUserId: string
  ) {
    return await mutation.mutateAsync({ authUserId })
  }

  // ========================================
  // VALIDATION
  // ========================================

  validateTrackingMessageData(data: Partial<TrackingMessageFormData>): string[] {
    const errors: string[] = []

    if (data.template !== undefined && data.template.trim().length === 0) {
      errors.push('Template cannot be empty')
    }

    if (data.template !== undefined && data.template.trim().length < 10) {
      errors.push('Template must be at least 10 characters')
    }

    if (data.status !== undefined && data.status.trim().length === 0) {
      errors.push('Status is required')
    }

    if (data.serviceType !== undefined && !['OBC', 'NFO'].includes(data.serviceType)) {
      errors.push('Service type must be OBC or NFO')
    }

    if (data.language !== undefined && !['en', 'de'].includes(data.language)) {
      errors.push('Language must be en or de')
    }

    return errors
  }
}

// Export singleton instance
export const trackingMessagesService = new TrackingMessagesService()
