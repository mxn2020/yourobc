// src/features/yourobc/trackingMessages/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'
import { ShipmentStatus } from '@/convex/schema/yourobc/shipments'

// Re-export types from Convex
export type TrackingMessage = Doc<'yourobcTrackingMessages'>
export type TrackingMessageId = Id<'yourobcTrackingMessages'>

export type {
  ServiceType,
  Language,
  CreateTrackingMessageData,
  UpdateTrackingMessageData,
  TrackingMessageVariables,
  GenerateMessageParams,
  TrackingMessageFilters,
} from '@/convex/lib/yourobc/tracking_messages/types'

// UI-specific types
export interface GeneratedMessage {
  subject: string
  body: string
  template: TrackingMessage
  variables: Record<string, string>
}

export interface TrackingMessageFormData {
  name: string
  serviceType: 'OBC' | 'NFO'
  status: ShipmentStatus
  language: 'en' | 'de'
  subject?: string
  template: string
  category?: 'booking' | 'pickup' | 'in_transit' | 'delivery' | 'customs' | 'general'
  variables: string[]
  isActive: boolean
}

export const MESSAGE_CATEGORY_LABELS = {
  booking: 'Booking',
  pickup: 'Pickup',
  in_transit: 'In Transit',
  delivery: 'Delivery',
  customs: 'Customs',
  general: 'General',
} as const

export const LANGUAGE_LABELS = {
  en: 'English',
  de: 'Deutsch',
} as const
