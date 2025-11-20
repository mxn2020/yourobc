// convex/schema/software/yourobc/couriers/index.ts
// Barrel exports for couriers module

// Export table schemas
export { couriersTable, commissionsTable } from './schemas';

// Export validators
export {
  courierStatusValidator,
  commissionTypeValidator,
  commissionSimpleStatusValidator,
  currencyValidator,
  paymentMethodValidator,
  timeEntryTypeValidator,
  quoteServiceTypeValidator,
  timeEntrySchema,
  skillsSchema,
  costProfileSchema,
  serviceCoverageSchema,
  currentLocationSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from './validators';

// Export types
export type {
  CourierStatus,
  CommissionType,
  CommissionSimpleStatus,
  Currency,
  PaymentMethod,
  TimeEntryType,
  QuoteServiceType,
} from './validators';

export type {
  Courier,
  CourierId,
  TimeEntry,
  Skills,
  CostProfile,
  ServiceCoverage,
  CurrentLocation,
  Commission,
  CommissionId,
  CommissionStatus,
  CreateCourierInput,
  UpdateCourierInput,
  CreateCommissionInput,
  UpdateCommissionInput,
  CourierListItem,
  CommissionListItem,
} from './types';
