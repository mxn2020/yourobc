// src/features/yourobc/couriers/index.ts

// === Types ===
export type {
  Courier,
  CourierId,
  Commission,
  CommissionId,
  CourierFormData,
  CommissionFormData,
  CourierListItem,
  CommissionListItem,
  CourierDetailsProps,
  CourierCardProps,
  CourierCreationParams,
  CourierUpdateParams,
  CourierPerformanceMetrics,
  CourierSearchFilters,
  CourierSortOptions,
  CourierDashboardMetrics,
  CourierWithDetails,
  CourierWorkStatus,
  CourierInsights,
  CommissionSummary,
  CreateCourierData,
  UpdateCourierData,
  CreateCommissionData,
} from './types'

export {
  COURIER_CONSTANTS,
  COURIER_STATUS_COLORS,
  COURIER_STATUS_LABELS,
  COMMISSION_TYPE_LABELS,
  COMMISSION_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  COMMON_LANGUAGES,
  CURRENCY_SYMBOLS,
} from './types'

// === Services ===
export { CouriersService, couriersService } from './services/CouriersService'

// === Hooks ===
export {
  useCouriers,
  useCourier,
  useAvailableCouriers,
  useCourierSearch,
  useCourierCommissions,
  useCourierForm,
} from './hooks/useCouriers'

// === Components ===
export { CourierCard } from './components/CourierCard'
export { CourierList } from './components/CourierList'
export { CourierForm } from './components/CourierForm'
export { CourierStats } from './components/CourierStats'
export { CourierSearch } from './components/CourierSearch'
export { CommissionList } from './components/CommissionList'
export { CommissionForm } from './components/CommissionForm'

// === Pages ===
export { CouriersPage } from './pages/CouriersPage'
export { CourierDetailsPage } from './pages/CourierDetailsPage'
export { CreateCourierPage } from './pages/CreateCourierPage'
export { CommissionsManagementPage } from './pages/CommissionsManagementPage'
export { CreateCommissionPage } from './pages/CreateCommissionPage'