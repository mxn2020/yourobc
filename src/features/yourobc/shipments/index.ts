// src/features/yourobc/shipments/index.ts

// === Types ===
export type {
  Shipment,
  ShipmentId,
  ShipmentStatusHistory,
  ShipmentStatusHistoryId,
  ShipmentFormData,
  StatusUpdateFormData,
  ShipmentListItem,
  ShipmentDetailsProps,
  ShipmentCardProps,
  ShipmentCreationParams,
  ShipmentUpdateParams,
  ShipmentMetrics,
  ShipmentInsights,
  ShipmentSearchFilters,
  ShipmentSortOptions,
  ShipmentDashboardMetrics,
  ShipmentWithDetails,
  ShipmentStats as ShipmentStatsType,
  CreateShipmentData,
  UpdateShipmentData,
  Address,
  Dimensions,
  CurrencyAmount,
  SLA,
  NextTask,
  FlightDetails,
  Routing,
  StatusUpdateData,
} from './types'

export {
  SHIPMENT_CONSTANTS,
  SHIPMENT_STATUS_COLORS,
  SHIPMENT_STATUS_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  SLA_STATUS_COLORS,
  SLA_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
  COMMON_AIRLINES,
  DIMENSION_UNITS,
  WEIGHT_UNITS,
  CURRENCY_SYMBOLS,
} from './types'

// === Services ===
export { ShipmentsService, shipmentsService, shipmentsService as shipmentService } from './services/ShipmentsService'

// === Hooks ===
export {
  useShipments,
  useShipment,
  useShipmentSearch,
  useOverdueShipments,
  useShipmentForm,
} from './hooks/useShipments'

// === Components ===
export { ShipmentCard } from './components/ShipmentCard'
export { ShipmentList } from './components/ShipmentList'
export { ShipmentForm } from './components/ShipmentForm'
export { ShipmentStats } from './components/ShipmentStats'
export { ShipmentSearch } from './components/ShipmentSearch'
export { StatusUpdateForm } from './components/StatusUpdateForm'

// === Pages ===
export { ShipmentsPage } from './pages/ShipmentsPage'
export { ShipmentDetailsPage } from './pages/ShipmentDetailsPage'
export { CreateShipmentPage } from './pages/CreateShipmentPage'
