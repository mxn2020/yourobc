// src/features/yourobc/shipments/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'
import { Address, Dimensions, Routing, CurrencyAmount, StatusUpdateData, SLA } from '@/convex/lib/yourobc'
import type { ScheduledTime } from '@/convex/schema/yourobc/base'
import type { AssignedTo, CustomsInfo, ShipmentDocumentStatus } from '@/convex/lib/yourobc/shipments'

// Base types from Convex schema
export type Shipment = Doc<'yourobcShipments'>
export type ShipmentId = Id<'yourobcShipments'>
export type ShipmentStatusHistory = Doc<'yourobcShipmentStatusHistory'>
export type ShipmentStatusHistoryId = Id<'yourobcShipmentStatusHistory'>

// Re-export types from convex for consistency
export type {
  CreateShipmentData,
  UpdateShipmentData,
  SLA,
  NextTask,
  Routing,
  StatusUpdateData,
  AssignedTo,
  CustomsInfo,
  ShipmentDocumentStatus,
} from '@/convex/lib/yourobc/shipments/types'

// Re-export with alias for backwards compatibility
export type { ShipmentDocumentStatus as DocumentStatus } from '@/convex/lib/yourobc/shipments/types'

export type {
  Address,
  Dimensions,
  CurrencyAmount,
  FlightDetails,
} from '@/convex/lib/yourobc/shared'

// Extended shipment type with additional computed fields
export interface ShipmentWithDetails extends Shipment {
  customer: {
    _id: Id<'yourobcCustomers'>
    companyName: string
    shortName?: string
    primaryContact?: any
    billingAddress?: any
  }
  courier?: {
    _id: Id<'yourobcCouriers'>
    courierNumber: string
    firstName: string
    lastName: string
    phone?: string
    skills?: any
  } | null
  partner?: {
    _id: Id<'yourobcPartners'>
    companyName: string
    shortName?: string
    primaryContact?: any
  } | null
  quote?: {
    _id: Id<'yourobcQuotes'>
    quoteNumber: string
    totalPrice?: any
  } | null
  statusHistory?: ShipmentStatusHistory[]
  isOverdue?: boolean
  isActive?: boolean
}

// UI-specific types
export interface ShipmentFormData {
  shipmentNumber?: string
  awbNumber?: string
  customerReference?: string
  quoteId?: Id<'yourobcQuotes'>
  customerId: Id<'yourobcCustomers'>
  serviceType: 'OBC' | 'NFO'
  priority?: 'standard' | 'urgent' | 'critical'
  origin: Address
  destination: Address
  dimensions: Dimensions
  description: string
  specialInstructions?: string
  deadline: number
  assignedCourierId?: Id<'yourobcCouriers'>
  courierInstructions?: string
  partnerId?: Id<'yourobcPartners'>
  partnerReference?: string
  routing?: Routing
  agreedPrice: CurrencyAmount
  actualCosts?: CurrencyAmount
}

export interface StatusUpdateFormData {
  status: Shipment['currentStatus']
  location?: string
  notes?: string
  metadata?: StatusUpdateData['metadata']
}

export interface ShipmentListItem extends Omit<ShipmentWithDetails, 'deliveryTime'> {
  displayName?: string
  formattedOrigin?: string
  formattedDestination?: string
  formattedPrice?: string
  statusColor?: string
  priorityColor?: string
  slaColor?: string
  overdueHours?: number
  estimatedDelivery?: number
  // Enhanced dashboard fields (from Phase 1)
  assignedTo?: AssignedTo
  pickupTime?: ScheduledTime
  deliveryTime?: ScheduledTime
  customsInfo?: CustomsInfo
  documentStatus?: ShipmentDocumentStatus
}

export interface ShipmentDetailsProps {
  shipment: ShipmentWithDetails
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onStatusUpdate?: (data: StatusUpdateFormData) => void
  onAssignCourier?: (courierId: Id<'yourobcCouriers'>) => void
}

export interface ShipmentCardProps {
  shipment: ShipmentListItem
  onClick?: (shipment: ShipmentListItem) => void
  showCustomer?: boolean
  showCourier?: boolean
  compact?: boolean
  showActions?: boolean
}

// Business logic types
export interface ShipmentCreationParams {
  shipmentData: ShipmentFormData
  autoGenerateNumber?: boolean
  autoAssignCourier?: boolean
}

export interface ShipmentUpdateParams {
  shipmentId: ShipmentId
  updates: Partial<ShipmentFormData>
  updateReason?: string
}

export interface ShipmentMetrics {
  totalShipments: number
  activeShipments: number
  completedShipments: number
  avgDeliveryTime: number
  onTimeDeliveryRate: number
  totalRevenue: number
  avgRevenue: number
}

export interface ShipmentInsights {
  slaStatus: SLA['status']
  remainingHours: number | null
  isOverdue: boolean
  isUrgent: boolean
  needsAttention: boolean
  estimatedDelivery: number | null
  completionProgress: number
}

// Stats type from query
export interface ShipmentStats {
  totalShipments: number
  activeShipments: number
  completedShipments: number
  shipmentsByStatus: Record<string, number>
  shipmentsByServiceType: Record<string, number>
  shipmentsByPriority: Record<string, number>
  slaPerformance: {
    onTime: number
    warning: number
    overdue: number
  }
  avgDeliveryTime: number
  totalRevenue: number
  avgRevenue: number
}

// Filter and search types
export interface ShipmentSearchFilters {
  status?: Shipment['currentStatus'][]
  serviceType?: ('OBC' | 'NFO')[]
  priority?: ('standard' | 'urgent' | 'critical')[]
  slaStatus?: ('on_time' | 'warning' | 'overdue')[]
  customerId?: Id<'yourobcCustomers'>[]
  assignedCourierId?: Id<'yourobcCouriers'>[]
  partnerId?: Id<'yourobcPartners'>[]
  originCountry?: string[]
  destinationCountry?: string[]
  dateRange?: {
    start: number
    end: number
    field: 'createdAt' | 'deadline' | 'completedAt'
  }
  search?: string
}

export interface ShipmentSortOptions {
  sortBy: 'shipmentNumber' | 'status' | 'deadline' | 'priority' | 'createdAt' | 'completedAt'
  sortOrder: 'asc' | 'desc'
}

// Dashboard types
export interface ShipmentDashboardMetrics {
  totalShipments: number
  activeShipments: number
  completedShipments: number
  overdueShipments: number
  todayShipments: number
  weekShipments: number
  totalRevenue: number
  avgDeliveryTime: number
  onTimeRate: number
  recentActivity: Array<{
    shipmentId: ShipmentId
    shipmentNumber: string
    activity: string
    timestamp: number
  }>
}

// Export constants from convex
export const SHIPMENT_CONSTANTS = {
  STATUS: {
    QUOTED: 'quoted' as const,
    BOOKED: 'booked' as const,
    PICKUP: 'pickup' as const,
    IN_TRANSIT: 'in_transit' as const,
    CUSTOMS: 'customs' as const,
    DELIVERED: 'delivered' as const,
    DOCUMENT: 'document' as const,
    INVOICED: 'invoiced' as const,
    CANCELLED: 'cancelled' as const,
  },
  SERVICE_TYPE: {
    OBC: 'OBC' as const,
    NFO: 'NFO' as const,
  },
  PRIORITY: {
    STANDARD: 'standard' as const,
    URGENT: 'urgent' as const,
    CRITICAL: 'critical' as const,
  },
  SLA_STATUS: {
    ON_TIME: 'on_time' as const,
    WARNING: 'warning' as const,
    OVERDUE: 'overdue' as const,
  },
  CURRENCY: {
    EUR: 'EUR' as const,
    USD: 'USD' as const,
  },
  DEFAULT_VALUES: {
    PRIORITY: 'standard' as const,
    CURRENCY: 'EUR' as const,
    SLA_WARNING_HOURS: 24,
    PAYMENT_TERMS: 30,
  },
  LIMITS: {
    MAX_SHIPMENT_NUMBER_LENGTH: 20,
    MAX_AWB_NUMBER_LENGTH: 20,
    MAX_CUSTOMER_REFERENCE_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 1000,
    MAX_COURIER_INSTRUCTIONS_LENGTH: 1000,
    MAX_PARTNER_REFERENCE_LENGTH: 50,
    MAX_NOTES_LENGTH: 2000,
    MAX_DIMENSIONS_VALUE: 10000,
    MIN_DIMENSIONS_VALUE: 0.1,
    MAX_WEIGHT: 1000,
    MIN_WEIGHT: 0.1,
    MAX_FLIGHT_NUMBER_LENGTH: 10,
    MAX_AIRLINE_LENGTH: 50,
  },
  PERMISSIONS: {
    VIEW: 'shipments.view',
    CREATE: 'shipments.create',
    EDIT: 'shipments.edit',
    DELETE: 'shipments.delete',
    ASSIGN_COURIER: 'shipments.assign_courier',
    UPDATE_STATUS: 'shipments.update_status',
    VIEW_COSTS: 'shipments.view_costs',
    EDIT_COSTS: 'shipments.edit_costs',
    VIEW_HISTORY: 'shipments.view_history',
    CANCEL: 'shipments.cancel',
  },
} as const

export const SHIPMENT_STATUS_COLORS = {
  [SHIPMENT_CONSTANTS.STATUS.QUOTED]: '#6b7280',
  [SHIPMENT_CONSTANTS.STATUS.BOOKED]: '#3b82f6',
  [SHIPMENT_CONSTANTS.STATUS.PICKUP]: '#f59e0b',
  [SHIPMENT_CONSTANTS.STATUS.IN_TRANSIT]: '#8b5cf6',
  [SHIPMENT_CONSTANTS.STATUS.CUSTOMS]: '#ec4899',
  [SHIPMENT_CONSTANTS.STATUS.DELIVERED]: '#10b981',
  [SHIPMENT_CONSTANTS.STATUS.DOCUMENT]: '#06b6d4',
  [SHIPMENT_CONSTANTS.STATUS.INVOICED]: '#22c55e',
  [SHIPMENT_CONSTANTS.STATUS.CANCELLED]: '#ef4444',
} as const

export const SHIPMENT_STATUS_LABELS = {
  [SHIPMENT_CONSTANTS.STATUS.QUOTED]: 'Quoted',
  [SHIPMENT_CONSTANTS.STATUS.BOOKED]: 'Booked',
  [SHIPMENT_CONSTANTS.STATUS.PICKUP]: 'Pickup',
  [SHIPMENT_CONSTANTS.STATUS.IN_TRANSIT]: 'In Transit',
  [SHIPMENT_CONSTANTS.STATUS.CUSTOMS]: 'Customs',
  [SHIPMENT_CONSTANTS.STATUS.DELIVERED]: 'Delivered',
  [SHIPMENT_CONSTANTS.STATUS.DOCUMENT]: 'Documentation',
  [SHIPMENT_CONSTANTS.STATUS.INVOICED]: 'Invoiced',
  [SHIPMENT_CONSTANTS.STATUS.CANCELLED]: 'Cancelled',
} as const

export const PRIORITY_COLORS = {
  [SHIPMENT_CONSTANTS.PRIORITY.STANDARD]: '#6b7280',
  [SHIPMENT_CONSTANTS.PRIORITY.URGENT]: '#f59e0b',
  [SHIPMENT_CONSTANTS.PRIORITY.CRITICAL]: '#ef4444',
} as const

export const PRIORITY_LABELS = {
  [SHIPMENT_CONSTANTS.PRIORITY.STANDARD]: 'Standard',
  [SHIPMENT_CONSTANTS.PRIORITY.URGENT]: 'Urgent',
  [SHIPMENT_CONSTANTS.PRIORITY.CRITICAL]: 'Critical',
} as const

export const SLA_STATUS_COLORS = {
  [SHIPMENT_CONSTANTS.SLA_STATUS.ON_TIME]: '#10b981',
  [SHIPMENT_CONSTANTS.SLA_STATUS.WARNING]: '#f59e0b',
  [SHIPMENT_CONSTANTS.SLA_STATUS.OVERDUE]: '#ef4444',
} as const

export const SLA_STATUS_LABELS = {
  [SHIPMENT_CONSTANTS.SLA_STATUS.ON_TIME]: 'On Time',
  [SHIPMENT_CONSTANTS.SLA_STATUS.WARNING]: 'Warning',
  [SHIPMENT_CONSTANTS.SLA_STATUS.OVERDUE]: 'Overdue',
} as const

export const SERVICE_TYPE_LABELS = {
  [SHIPMENT_CONSTANTS.SERVICE_TYPE.OBC]: 'On Board Courier',
  [SHIPMENT_CONSTANTS.SERVICE_TYPE.NFO]: 'Next Flight Out',
} as const

// Common airlines and airports
export const COMMON_AIRLINES = [
  'Lufthansa',
  'British Airways',
  'Air France',
  'KLM',
  'Emirates',
  'Qatar Airways',
  'Turkish Airlines',
  'American Airlines',
  'Delta Air Lines',
  'United Airlines',
] as const

export const DIMENSION_UNITS = [
  { value: 'cm', label: 'Centimeters' },
  { value: 'inch', label: 'Inches' },
] as const

export const WEIGHT_UNITS = [
  { value: 'kg', label: 'Kilograms' },
  { value: 'lb', label: 'Pounds' },
] as const

// Currency symbols
export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
} as const