// src/features/yourobc/supporting/inquiry-sources/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type InquirySource = Doc<'inquirySources'>
export type InquirySourceId = Id<'inquirySources'>

export interface CreateInquirySourceData {
  name: string
  code?: string
  type: InquirySource['type']
  description?: string
}

export interface UpdateInquirySourceData {
  name?: string
  code?: string
  type?: InquirySource['type']
  description?: string
  isActive?: boolean
}

export interface InquirySourceFormData {
  name: string
  code?: string
  type: InquirySource['type']
  description?: string
}

export interface InquirySourceFilters {
  type?: InquirySource['type'][]
  isActive?: boolean
}

// Constants
export const INQUIRY_SOURCE_TYPE_LABELS: Record<InquirySource['type'], string> = {
  website: 'Website',
  referral: 'Referral',
  partner: 'Partner',
  advertising: 'Advertising',
  direct: 'Direct',
}

export const INQUIRY_SOURCE_TYPE_COLORS: Record<InquirySource['type'], string> = {
  website: 'bg-blue-100 text-blue-800',
  referral: 'bg-green-100 text-green-800',
  partner: 'bg-purple-100 text-purple-800',
  advertising: 'bg-orange-100 text-orange-800',
  direct: 'bg-gray-100 text-gray-800',
}

export const INQUIRY_SOURCE_TYPES: InquirySource['type'][] = [
  'website',
  'referral',
  'partner',
  'advertising',
  'direct',
]

export const INQUIRY_SOURCE_TYPE_ICONS: Record<InquirySource['type'], string> = {
  website: '🌐',
  referral: '👥',
  partner: '🤝',
  advertising: '📢',
  direct: '📞',
}

export const INQUIRY_SOURCE_CONSTANTS = {
  MAX_NAME_LENGTH: 100,
  MAX_CODE_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 500,
}
