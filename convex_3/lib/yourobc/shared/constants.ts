// convex/lib/yourobc/shared/constants.ts
// convex/yourobc/shared/constants.ts

// Common priority constants used across all YourOBC modules
export const PRIORITY_COLORS = {
  standard: '#6b7280',
  urgent: '#f59e0b',
  critical: '#ef4444',
} as const;

export const PRIORITY_LABELS = {
  standard: 'Standard',
  urgent: 'Urgent',
  critical: 'Critical',
} as const;

// Common service types
export const SERVICE_TYPE = {
  OBC: 'OBC', // On Board Courier
  NFO: 'NFO', // Next Flight Out
} as const;

export const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPE.OBC]: 'On Board Courier',
  [SERVICE_TYPE.NFO]: 'Next Flight Out',
} as const;

// Common priority values
export const PRIORITY = {
  STANDARD: 'standard',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

// Common currencies
export const CURRENCY = {
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
} as const;

// Common weight and dimension units
export const WEIGHT_UNITS = {
  KG: 'kg',
  LB: 'lb',
} as const;

export const DIMENSION_UNITS = {
  CM: 'cm',
  INCH: 'inch',
} as const;

// Common airports used across modules
export const COMMON_AIRPORTS = [
  'FRA', 'LHR', 'CDG', 'AMS', 'DXB', 'DOH', 'SIN', 'HKG', 'NRT', 'ICN',
  'JFK', 'LAX', 'ORD', 'ATL', 'MIA', 'SFO', 'BOS', 'IAH', 'DFW', 'SEA'
] as const;

// Common airlines
export const COMMON_AIRLINES = [
  'Lufthansa', 'British Airways', 'Air France', 'KLM', 'Emirates', 'Qatar Airways',
  'Singapore Airlines', 'Cathay Pacific', 'United Airlines', 'American Airlines',
  'Delta Air Lines', 'Turkish Airlines', 'Swiss International', 'Austrian Airlines'
] as const;

export const DEFAULT_TIMEZONES = [
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Mexico_City',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Asia/Singapore',
  'Australia/Sydney',
] as const;

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
] as const;

