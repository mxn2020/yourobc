// convex/lib/yourobc/shared/types.ts
// convex/yourobc/shared/types.ts

import type { Doc, Id } from '../../../_generated/dataModel';

export interface Address {
  street?: string;
  city: string;
  postalCode?: string;
  country: string;
  countryCode: string;
}

export interface CurrencyAmount {
  amount: number;
  currency: 'EUR' | 'USD';
  exchangeRate?: number;
}

export interface Contact {
  name: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: 'cm' | 'inch';
  weightUnit: 'kg' | 'lb';
}

// Time entry interface for employees and couriers
export interface TimeEntry {
  type: 'login' | 'logout';
  timestamp: number;
  location?: string;
  notes?: string;
}

// Base partner quote request interface
export interface BasePartnerQuoteRequest {
  origin: Address;
  destination: Address;
  serviceType: 'OBC' | 'NFO';
  description: string;
  deadline: number;
  dimensions?: Dimensions;
  specialInstructions?: string;
  customerReference?: string;
}

export interface FlightDetails {
  flightNumber?: string;
  airline?: string;
  departureTime?: number;
  arrivalTime?: number;
}

export interface Routing {
  outboundFlight?: FlightDetails;
  returnFlight?: FlightDetails;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validation error
 */
export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

