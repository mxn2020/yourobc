// convex/lib/yourobc/customers/margins/index.ts

// Export mutations
export {
  createMarginRule,
  updateMarginRule,
  reviewMarginRule,
  deactivateMarginRule,
  duplicateMarginRule,
} from './mutations'

// Export queries
export {
  getCustomerMargins,
  getCustomerMarginsHistory,
  calculateMarginPreview,
  getMarginsNeedingReview,
  getMarginStatistics,
  getCustomersWithMargins,
  getApplicableMargin,
  getMarginPerformance,
} from './queries'

// Export utilities
export {
  applyDualMarginLogic,
  findServiceMargin,
  findRouteMargin,
  findVolumeTier,
  calculateCustomerMargin,
  validateMarginRule,
  calculateCostFromMargin,
  calculateRevenueForTargetMargin,
  suggestMargin,
} from './utils'
