// src/features/yourobc/customers/index.ts

// === Types ===
export type {
  Customer,
  CustomerId,
  InquirySource,
  InquirySourceId,
  CustomerFormData,
  CustomerListItem,
  CustomerDetailsProps,
  CustomerCardProps,
  CustomerCreationParams,
  CustomerUpdateParams,
  CustomerPerformanceMetrics,
  CustomerSearchFilters,
  CustomerSortOptions,
  CustomerDashboardMetrics,
  CustomerWithDetails,
  CustomerInsights,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerStatsType,
} from './types'

export type {
  Address,
  Contact,
} from '@/convex/lib/yourobc/shared'

export {
  CUSTOMER_CONSTANTS,
  CUSTOMER_STATUS_COLORS,
  CUSTOMER_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  COMMON_CURRENCIES,
  CURRENCY_LABELS,
  COMMON_PAYMENT_TERMS,
  COMMON_COUNTRIES,
  CURRENCY_SYMBOLS,
} from './types'

// === Services ===
export { CustomersService, customersService } from './services/CustomersService'

// === Hooks ===
export {
  useCustomers,
  useCustomer,
  useCustomerSearch,
  useTopCustomers,
  useCustomerTags,
  useCustomerForm,
} from './hooks/useCustomers'

// === Components ===
export { CustomerCard } from './components/CustomerCard'
export { CustomerList } from './components/CustomerList'
export { CustomerForm } from './components/CustomerForm'
export { CustomerStats } from './components/CustomerStats'
export { CustomerSearch } from './components/CustomerSearch'

// === Pages ===
export { CustomersPage } from './pages/CustomersPage'
export { CustomerDetailsPage } from './pages/CustomerDetailsPage'
export { CreateCustomerPage } from './pages/CreateCustomerPage'