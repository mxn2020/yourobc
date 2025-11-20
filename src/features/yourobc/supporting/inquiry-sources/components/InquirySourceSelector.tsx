// src/features/yourobc/supporting/inquiry-sources/components/InquirySourceSelector.tsx

import React from 'react'
import { ChevronDown } from 'lucide-react'
import { useInquirySourceSelector } from '../hooks/useInquirySources'
import { isInquirySourcesEnabled } from '../../config'
import type { InquirySourceId } from '../types'
import { INQUIRY_SOURCE_TYPE_LABELS, INQUIRY_SOURCE_TYPE_ICONS } from '../types'

export interface InquirySourceSelectorProps {
  value?: InquirySourceId
  onChange: (sourceId: InquirySourceId | undefined) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
}

export function InquirySourceSelector({
  value,
  onChange,
  placeholder = 'Select inquiry source',
  disabled = false,
  required = false,
  error,
  className = '',
}: InquirySourceSelectorProps) {
  // Check if inquiry sources feature is enabled
  if (!isInquirySourcesEnabled()) {
    return null
  }

  const { sources, selectedSource, isLoading } = useInquirySourceSelector(value)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    onChange(selectedId ? (selectedId as InquirySourceId) : undefined)
  }

  return (
    <div className={className}>
      <div className="relative">
        <select
          value={value || ''}
          onChange={handleChange}
          disabled={disabled || isLoading}
          required={required}
          className={`w-full px-3 py-2 pr-10 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled || isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        >
          <option value="">
            {isLoading ? 'Loading sources...' : placeholder}
          </option>
          {sources.map((source) => (
            <option key={source._id} value={source._id}>
              {INQUIRY_SOURCE_TYPE_ICONS[source.type]} {source.name} ({INQUIRY_SOURCE_TYPE_LABELS[source.type]})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {selectedSource && !error && (
        <p className="text-xs text-gray-500 mt-1">
          {selectedSource.name || `${INQUIRY_SOURCE_TYPE_LABELS[selectedSource.type]} inquiry source`}
        </p>
      )}
    </div>
  )
}

export interface InquirySourceDisplayProps {
  sourceId?: InquirySourceId
  label?: string
  className?: string
}

export function InquirySourceDisplay({
  sourceId,
  label = 'Inquiry Source',
  className = '',
}: InquirySourceDisplayProps) {
  // Check if inquiry sources feature is enabled
  if (!isInquirySourcesEnabled()) {
    return null
  }

  const { selectedSource, isLoading } = useInquirySourceSelector(sourceId)

  if (isLoading) {
    return (
      <div className={className}>
        <span className="text-sm text-gray-500">{label}:</span>
        <span className="text-sm text-gray-400 ml-2">Loading...</span>
      </div>
    )
  }

  if (!selectedSource) {
    return (
      <div className={className}>
        <span className="text-sm text-gray-500">{label}:</span>
        <span className="text-sm text-gray-400 ml-2">Not specified</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="text-sm text-gray-900 ml-2">
        {INQUIRY_SOURCE_TYPE_ICONS[selectedSource.type]} {selectedSource.name}
        <span className="text-gray-500 ml-1">({INQUIRY_SOURCE_TYPE_LABELS[selectedSource.type]})</span>
      </span>
    </div>
  )
}
