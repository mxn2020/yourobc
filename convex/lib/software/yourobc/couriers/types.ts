// convex/lib/software/yourobc/convex/lib/software/yourobc/couriers/types.ts
// TypeScript type definitions for couriers module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  CourierStatus,
  CourierServiceType,
  CourierDeliverySpeed,
  CourierPricingModel,
  CourierApiType,
} from '@/schema/software/yourobc/couriers/types';

// Entity types
export type Courier = Doc<'yourobcCouriers'>;
export type CourierId = Id<'yourobcCouriers'>;

// Contact interface (matching schema)
export interface ContactData {
  name: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  role?: string;
  position?: string;
  department?: string;
  mobile?: string;
  preferredContactMethod?: 'email' | 'phone' | 'mobile';
  notes?: string;
}

// Address interface (matching schema)
export interface AddressData {
  street?: string;
  city: string;
  postalCode?: string;
  country: string;
  countryCode: string;
}

// Service coverage interface
export interface ServiceCoverageData {
  countries: string[];
  regions?: string[];
  cities?: string[];
  airports?: string[];
}

// Dimensions interface
export interface DimensionsData {
  length: number;
  width: number;
  height: number;
}

// Cost structure interface
export interface CostStructureData {
  baseFee?: number;
  perKgRate?: number;
  perKmRate?: number;
  fuelSurcharge?: number;
  handlingFee?: number;
  notes?: string;
}

// Delivery times interface
export interface DeliveryTimesData {
  standardDomestic?: string;
  standardInternational?: string;
  expressDomestic?: string;
  expressInternational?: string;
  notes?: string;
}

// API integration interface
export interface ApiIntegrationData {
  enabled: boolean;
  apiType: CourierApiType;
  baseUrl?: string;
  apiVersion?: string;
  hasTracking?: boolean;
  hasRateQuotes?: boolean;
  hasLabelGeneration?: boolean;
  notes?: string;
}

// API credentials interface
export interface ApiCredentialsData {
  apiKey?: string;
  apiSecret?: string;
  accountNumber?: string;
  username?: string;
  password?: string;
  additionalFields?: Record<string, unknown>;
}

// Performance metrics interface
export interface PerformanceMetricsData {
  reliabilityScore?: number;
  onTimeDeliveryRate?: number;
  averageTransitDays?: number;
  lastUpdated?: number;
}

// Data interfaces
export interface CreateCourierData {
  name: string;
  shortName?: string;
  website?: string;
  email?: string;
  phone?: string;
  primaryContact: ContactData;
  additionalContacts?: ContactData[];
  headquartersAddress?: AddressData;
  serviceCoverage: ServiceCoverageData;
  serviceTypes: CourierServiceType[];
  deliverySpeeds: CourierDeliverySpeed[];
  maxWeightKg?: number;
  maxDimensionsCm?: DimensionsData;
  handlesHazmat?: boolean;
  handlesRefrigerated?: boolean;
  handlesFragile?: boolean;
  pricingModel: CourierPricingModel;
  defaultCurrency: 'EUR' | 'USD';
  costStructure?: CostStructureData;
  deliveryTimes?: DeliveryTimesData;
  apiIntegration?: ApiIntegrationData;
  apiCredentials?: ApiCredentialsData;
  metrics?: PerformanceMetricsData;
  status?: CourierStatus;
  isPreferred?: boolean;
  isActive?: boolean;
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateCourierData {
  name?: string;
  shortName?: string;
  website?: string;
  email?: string;
  phone?: string;
  primaryContact?: ContactData;
  additionalContacts?: ContactData[];
  headquartersAddress?: AddressData;
  serviceCoverage?: ServiceCoverageData;
  serviceTypes?: CourierServiceType[];
  deliverySpeeds?: CourierDeliverySpeed[];
  maxWeightKg?: number;
  maxDimensionsCm?: DimensionsData;
  handlesHazmat?: boolean;
  handlesRefrigerated?: boolean;
  handlesFragile?: boolean;
  pricingModel?: CourierPricingModel;
  defaultCurrency?: 'EUR' | 'USD';
  costStructure?: CostStructureData;
  deliveryTimes?: DeliveryTimesData;
  apiIntegration?: ApiIntegrationData;
  apiCredentials?: ApiCredentialsData;
  metrics?: PerformanceMetricsData;
  status?: CourierStatus;
  isPreferred?: boolean;
  isActive?: boolean;
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
}

// Response types
export interface CourierListResponse {
  items: Courier[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface CourierFilters {
  status?: CourierStatus[];
  serviceTypes?: CourierServiceType[];
  deliverySpeeds?: CourierDeliverySpeed[];
  pricingModel?: CourierPricingModel[];
  search?: string;
  country?: string;
  isPreferred?: boolean;
  isActive?: boolean;
  hasApiIntegration?: boolean;
}

// Stats response type
export interface CourierStatsResponse {
  total: number;
  byStatus: {
    active: number;
    inactive: number;
    archived: number;
  };
  byServiceType: Record<string, number>;
  byPricingModel: Record<string, number>;
  withApiIntegration: number;
  preferredCouriers: number;
  activeCouriers: number;
  averageReliabilityScore: number;
  averageOnTimeRate: number;
}
