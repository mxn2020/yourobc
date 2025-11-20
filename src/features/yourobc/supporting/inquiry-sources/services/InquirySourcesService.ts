// src/features/yourobc/supporting/inquiry-sources/services/InquirySourcesService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateInquirySourceData,
  UpdateInquirySourceData,
  InquirySourceFormData,
  InquirySourceFilters,
} from '../types'

export class InquirySourcesService {
  // Query hooks for inquiry source data fetching
  useInquirySources(
    authUserId: string,
    filters?: InquirySourceFilters
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.inquiry_sources.queries.getInquirySources, {
        authUserId,
        filters,
      }),
      staleTime: 60000, // 60 seconds
      enabled: !!authUserId,
    })
  }

  useActiveInquirySources(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.inquiry_sources.queries.getActiveInquirySources, {
        authUserId,
      }),
      staleTime: 300000, // 5 minutes (active sources change infrequently)
      enabled: !!authUserId,
    })
  }

  // Mutation hooks for inquiry source modifications
  useCreateInquirySource() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.inquiry_sources.mutations.createInquirySource),
    })
  }

  useUpdateInquirySource() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.inquiry_sources.mutations.updateInquirySource),
    })
  }

  // Business operations using mutations
  async createInquirySource(
    mutation: ReturnType<typeof this.useCreateInquirySource>,
    authUserId: string,
    data: CreateInquirySourceData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create inquiry source: ${error.message}`)
    }
  }

  async updateInquirySource(
    mutation: ReturnType<typeof this.useUpdateInquirySource>,
    authUserId: string,
    sourceId: Id<'yourobcInquirySources'>,
    data: UpdateInquirySourceData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, sourceId, data })
    } catch (error: any) {
      throw new Error(`Failed to update inquiry source: ${error.message}`)
    }
  }

  // Utility functions for data processing
  validateInquirySourceData(data: Partial<InquirySourceFormData>): string[] {
    const errors: string[] = []

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Name is required')
      }

      if (data.name.length > 100) {
        errors.push('Name must be less than 100 characters')
      }
    }

    if (data.code && data.code.length > 20) {
      errors.push('Code must be less than 20 characters')
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }

    return errors
  }

  formatSourceCode(name: string): string {
    return name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 20)
  }

  getSourceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      website: 'Website',
      referral: 'Referral',
      partner: 'Partner',
      advertising: 'Advertising',
      direct: 'Direct',
    }
    return labels[type] || type
  }

  getSourceTypeColor(type: string): string {
    const colors: Record<string, string> = {
      website: 'blue',
      referral: 'green',
      partner: 'purple',
      advertising: 'orange',
      direct: 'gray',
    }
    return colors[type] || 'gray'
  }
}

export const inquirySourcesService = new InquirySourcesService()
