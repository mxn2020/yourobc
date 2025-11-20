// src/features/yourobc/supporting/inquiry-sources/index.ts

// Components
export { InquirySourceForm } from './components/InquirySourceForm'
export { InquirySourceCard } from './components/InquirySourceCard'
export { InquirySourceList } from './components/InquirySourceList'
export { InquirySourceSelector, InquirySourceDisplay } from './components/InquirySourceSelector'

// Pages
export { InquirySourcesPage } from './pages/InquirySourcesPage'

// Hooks
export { useInquirySources, useActiveInquirySources, useInquirySourceSelector } from './hooks/useInquirySources'

// Services
export { inquirySourcesService } from './services/InquirySourcesService'

// Types
export type {
  InquirySource,
  InquirySourceId,
  CreateInquirySourceData,
  UpdateInquirySourceData,
  InquirySourceFormData,
  InquirySourceFilters,
} from './types'

export {
  INQUIRY_SOURCE_TYPE_LABELS,
  INQUIRY_SOURCE_TYPE_COLORS,
  INQUIRY_SOURCE_TYPES,
  INQUIRY_SOURCE_TYPE_ICONS,
  INQUIRY_SOURCE_CONSTANTS,
} from './types'
