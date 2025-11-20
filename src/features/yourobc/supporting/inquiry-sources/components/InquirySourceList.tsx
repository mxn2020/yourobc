// src/features/yourobc/supporting/inquiry-sources/components/InquirySourceList.tsx

import React from 'react'
import { InquirySourceCard } from './InquirySourceCard'
import { Loading } from '@/components/ui'
import type { InquirySource, InquirySourceFormData, InquirySourceId } from '../types'

export interface InquirySourceListProps {
  sources: InquirySource[]
  isLoading?: boolean
  error?: Error | null
  onUpdate: (sourceId: InquirySourceId, data: Partial<InquirySourceFormData> & { isActive?: boolean }) => Promise<void>
  canEdit?: boolean
  emptyMessage?: string
  className?: string
}

export function InquirySourceList({
  sources,
  isLoading = false,
  error = null,
  onUpdate,
  canEdit = false,
  emptyMessage = 'No inquiry sources found',
  className = '',
}: InquirySourceListProps) {
  if (isLoading) {
    return (
      <div className={`flex justify-center py-12 ${className}`}>
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-red-600">Error loading inquiry sources: {error.message}</p>
      </div>
    )
  }

  if (sources.length === 0) {
    return (
      <div className={`text-center py-12 text-gray-500 ${className}`}>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {sources.map((source) => (
        <InquirySourceCard
          key={source._id}
          source={source}
          onUpdate={onUpdate}
          canEdit={canEdit}
        />
      ))}
    </div>
  )
}
