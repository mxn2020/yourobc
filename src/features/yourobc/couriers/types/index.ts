// src/features/yourobc/couriers/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'
import { Courier, CourierId, Commission, CommissionId, ShipmentId } from '@/convex/lib/yourobc'


// Re-export ID types for convenience
export type { Courier, CourierId, Commission, CommissionId, ShipmentId }

// Re-export types from convex for consistency
export type {
  CreateCourierData,
  UpdateCourierData,
} from '@/convex/lib/yourobc/couriers/types'

// Work Status type (matches what queries return)
export interface CourierWorkStatus {
  isWorking: boolean
  lastLogin?: number
  lastLogout?: number
  todayHours: number
}

// Extended courier type with additional computed fields
export interface CourierWithDetails extends Courier {
  userProfile?: {
    name?: string
    email: string
    avatar?: string
    role?: string
    isActive?: boolean
  } | null
  workStatus?: CourierWorkStatus
}

// UI-specific types
export interface CourierFormData {
  firstName: string
  middleName?: string
  lastName: string
  email?: string
  phone: string
  status?: Courier['status']
  isActive?: boolean
  isOnline?: boolean
  skills: {
    languages: string[]
    maxCarryWeight?: number
    availableServices: ('OBC' | 'NFO')[]
    certifications?: string[]
  }
  currentLocation?: {
    country: string
    countryCode: string
    city?: string
  }
  timezone?: string
}

export interface CommissionFormData {
  courierId: CourierId
  shipmentId: string
  type: 'percentage' | 'fixed'
  rate: number
  baseAmount: number
  currency?: 'EUR' | 'USD'
}

export interface CreateCommissionData {
  courierId: Id<'yourobcCouriers'>
  shipmentId: ShipmentId
  type: 'percentage' | 'fixed'
  rate: number
  baseAmount: number
  commissionAmount: number
  currency?: 'EUR' | 'USD'
}

export interface CourierListItem extends CourierWithDetails {
  displayName?: string
  formattedLocation?: string
  rating?: { rating: string; score: number }
  isHighPerformer?: boolean
  hasRecentActivity?: boolean
}

export interface CommissionListItem {
  _id: CommissionId
  courierId: CourierId
  shipmentId: ShipmentId
  type: Commission['type']
  rate: number
  baseAmount: number
  commissionAmount: number
  currency?: Commission['currency']
  status: Commission['status']
  paidDate?: number
  paymentReference?: string
  paymentMethod?: Commission['paymentMethod']
  createdAt: number
  courier?: {
    courierNumber: string
    firstName: string
    lastName: string
  } | null
  shipment?: {
    shipmentNumber: string
  } | null
}

export interface CourierDetailsProps {
  courier: CourierWithDetails
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export interface CourierCardProps {
  courier: CourierListItem
  onClick?: (courier: CourierListItem) => void
  showWorkStatus?: boolean
  compact?: boolean
  showActions?: boolean
}

// Business logic types
export interface CourierCreationParams {
  courierData: CourierFormData
  autoGenerateNumber?: boolean
  assignToCurrentUser?: boolean
}

export interface CourierUpdateParams {
  courierId: CourierId
  updates: Partial<CourierFormData>
  updateReason?: string
}

export interface CourierPerformanceMetrics {
  totalShipments: number
  completedShipments: number
  onTimeDeliveries: number
  averageRating: number
  totalCommissions: number
  pendingCommissions: number
}

export interface CourierInsights {
  rating: { rating: 'excellent' | 'good' | 'average' | 'poor'; score: number }
  courierAge: number
  daysSinceLastActivity: number | null
  needsAttention: boolean
  isNewCourier: boolean
  isTopPerformer: boolean
}

// Stats type from query
export interface CourierStats {
  totalCouriers: number
  activeCouriers: number
  onlineCouriers: number
  availableCouriers?: number
  busyCouriers?: number
  totalShipments?: number
  onTimeDeliveryRate?: number
  totalCommissions?: number
  pendingCommissions?: number
  couriersByStatus: {
    available: number
    busy: number
    offline: number
  }
  couriersByLocation: Record<string, number>
  avgShipmentsPerCourier: number
}

// Commission summary from query
export interface CommissionSummary {
  totalCommissions: number
  totalPending: number
  totalPaid: number
  totalEarnings: number
  pendingCount?: number
  paidCount?: number
  pendingCommissions?: number
  paidCommissions?: number
}

// Filter and search types
export interface CourierSearchFilters {
  status?: ('available' | 'busy' | 'offline' | 'vacation')[]
  isActive?: boolean
  isOnline?: boolean
  serviceType?: ('OBC' | 'NFO')[]
  languages?: string[]
  country?: string[]
  searchTerm?: string
}

export interface CourierSortOptions {
  sortBy: 'courierNumber' | 'firstName' | 'createdAt' | 'status'
  sortOrder: 'asc' | 'desc'
}

// Dashboard types
export interface CourierDashboardMetrics {
  totalCouriers: number
  activeCouriers: number
  availableCouriers: number
  busyCouriers: number
  offlineCouriers: number
  totalShipments: number
  totalCommissions: number
  pendingCommissions: number
  onTimeDeliveryRate: number
  recentActivity: Array<{
    courierId: CourierId
    courierName: string
    activity: string
    timestamp: number
  }>
}

// Export constants from convex
export const COURIER_CONSTANTS = {
  STATUS: {
    AVAILABLE: 'available' as const,
    BUSY: 'busy' as const,
    OFFLINE: 'offline' as const,
  },
  TYPE: {
    COURIER: 'courier' as const,
  },
  DEFAULT_VALUES: {
    TIMEZONE: 'Europe/Berlin',
    STATUS: 'available' as const,
  },
  LIMITS: {
    MAX_NAME_LENGTH: 100,
    MAX_EMAIL_LENGTH: 200,
    MAX_PHONE_LENGTH: 50,
    MAX_LANGUAGES: 10,
    MAX_CERTIFICATIONS: 20,
    MAX_CARRY_WEIGHT: 50,
  },
  PERMISSIONS: {
    VIEW: 'couriers.view',
    CREATE: 'couriers.create',
    EDIT: 'couriers.edit',
    DELETE: 'couriers.delete',
    ASSIGN: 'couriers.assign',
    VIEW_COMMISSIONS: 'couriers.view_commissions',
    MANAGE_COMMISSIONS: 'couriers.manage_commissions',
  },
} as const

export const COURIER_STATUS_COLORS = {
  [COURIER_CONSTANTS.STATUS.AVAILABLE]: '#10b981',
  [COURIER_CONSTANTS.STATUS.BUSY]: '#f59e0b',
  [COURIER_CONSTANTS.STATUS.OFFLINE]: '#6b7280',
} as const

export const COURIER_STATUS_LABELS = {
  [COURIER_CONSTANTS.STATUS.AVAILABLE]: 'Available',
  [COURIER_CONSTANTS.STATUS.BUSY]: 'Busy',
  [COURIER_CONSTANTS.STATUS.OFFLINE]: 'Offline',
} as const

export const COMMISSION_TYPE_LABELS = {
  percentage: 'Percentage',
  fixed: 'Fixed Amount',
} as const

export const COMMISSION_STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
} as const

export const PAYMENT_METHOD_LABELS = {
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  paypal: 'PayPal',
  other: 'Other',
} as const

// Common languages for selection
export const COMMON_LANGUAGES = [
  'English',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Dutch',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Arabic',
  'Turkish',
] as const

// Currency symbols
export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
} as const