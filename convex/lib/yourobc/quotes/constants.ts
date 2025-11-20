// convex/lib/yourobc/quotes/constants.ts
// convex/yourobc/quotes/constants.ts

export const QUOTE_CONSTANTS = {
  STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
  },
  SERVICE_TYPE: {
    OBC: 'OBC',
    NFO: 'NFO',
  },
  PRIORITY: {
    STANDARD: 'standard',
    URGENT: 'urgent',
    CRITICAL: 'critical',
  },
  CURRENCY: {
    EUR: 'EUR',
    USD: 'USD',
  },
  WEIGHT_UNITS: {
    KG: 'kg',
    LB: 'lb',
  },
  DIMENSION_UNITS: {
    CM: 'cm',
    INCH: 'inch',
  },
  DEFAULT_VALUES: {
    CURRENCY: 'EUR',
    PRIORITY: 'standard',
    WEIGHT_UNIT: 'kg',
    DIMENSION_UNIT: 'cm',
    VALIDITY_DAYS: 14,
    MARKUP_PERCENTAGE: 15,
  },
  LIMITS: {
    MAX_QUOTE_NUMBER_LENGTH: 20,
    MAX_CUSTOMER_REFERENCE_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 2000,
    MAX_QUOTE_TEXT_LENGTH: 5000,
    MAX_NOTES_LENGTH: 2000,
    MAX_REJECTION_REASON_LENGTH: 500,
    MIN_DIMENSIONS: 0.1,
    MAX_DIMENSIONS: 10000,
    MIN_WEIGHT: 0.1,
    MAX_WEIGHT: 10000,
    MIN_PRICE: 0,
    MAX_PRICE: 1000000,
    MIN_MARKUP: 0,
    MAX_MARKUP: 200,
    MAX_PARTNER_QUOTES: 20,
  },
  PERMISSIONS: {
    VIEW: 'quotes.view',
    CREATE: 'quotes.create',
    EDIT: 'quotes.edit',
    DELETE: 'quotes.delete',
    SEND: 'quotes.send',
    CONVERT: 'quotes.convert',
    VIEW_COSTS: 'quotes.view_costs',
    EDIT_COSTS: 'quotes.edit_costs',
    APPROVE: 'quotes.approve',
  },
} as const;

export const QUOTE_STATUS_COLORS = {
  [QUOTE_CONSTANTS.STATUS.DRAFT]: '#6b7280',
  [QUOTE_CONSTANTS.STATUS.SENT]: '#3b82f6',
  [QUOTE_CONSTANTS.STATUS.PENDING]: '#8b5cf6',
  [QUOTE_CONSTANTS.STATUS.ACCEPTED]: '#10b981',
  [QUOTE_CONSTANTS.STATUS.REJECTED]: '#ef4444',
  [QUOTE_CONSTANTS.STATUS.EXPIRED]: '#f59e0b',
} as const;

export const PRIORITY_COLORS = {
  [QUOTE_CONSTANTS.PRIORITY.STANDARD]: '#10b981',
  [QUOTE_CONSTANTS.PRIORITY.URGENT]: '#f59e0b',
  [QUOTE_CONSTANTS.PRIORITY.CRITICAL]: '#ef4444',
} as const;

export const SERVICE_TYPE_LABELS = {
  [QUOTE_CONSTANTS.SERVICE_TYPE.OBC]: 'On Board Courier',
  [QUOTE_CONSTANTS.SERVICE_TYPE.NFO]: 'Next Flight Out',
} as const;

export const PRIORITY_LABELS = {
  [QUOTE_CONSTANTS.PRIORITY.STANDARD]: 'Standard',
  [QUOTE_CONSTANTS.PRIORITY.URGENT]: 'Urgent',
  [QUOTE_CONSTANTS.PRIORITY.CRITICAL]: 'Critical',
} as const;

export const COMMON_AIRLINES = [
  'Lufthansa',
  'Emirates',
  'British Airways',
  'KLM',
  'Air France',
  'Turkish Airlines',
  'Qatar Airways',
  'Singapore Airlines',
  'American Airlines',
  'Delta Air Lines',
  'United Airlines',
  'Swiss International',
] as const;

export const COMMON_AIRPORTS = [
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
  { code: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany' },
  { code: 'DUS', name: 'Düsseldorf', city: 'Düsseldorf', country: 'Germany' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom' },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'ZUR', name: 'Zurich', city: 'Zurich', country: 'Switzerland' },
  { code: 'VIE', name: 'Vienna', city: 'Vienna', country: 'Austria' },
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'United States' },
  { code: 'LAX', name: 'Los Angeles', city: 'Los Angeles', country: 'United States' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { code: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore' },
] as const;

export const QUOTE_WORKFLOW_STAGES = {
  DRAFT_CREATION: {
    REQUIRED_FIELDS: ['customerId', 'serviceType', 'origin', 'destination', 'dimensions', 'deadline'],
    NEXT_STAGE: 'partner_quoting',
  },
  PARTNER_QUOTING: {
    REQUIRED_FIELDS: ['partnerQuotes'],
    MIN_PARTNER_QUOTES: 1,
    NEXT_STAGE: 'pricing_calculation',
  },
  PRICING_CALCULATION: {
    REQUIRED_FIELDS: ['baseCost', 'markup', 'totalPrice'],
    NEXT_STAGE: 'ready_to_send',
  },
  READY_TO_SEND: {
    REQUIRED_FIELDS: ['quoteText'],
    TARGET_STATUS: 'sent',
    NEXT_STAGE: 'awaiting_response',
  },
  AWAITING_RESPONSE: {
    POSSIBLE_OUTCOMES: ['accepted', 'rejected', 'expired'],
    CONVERSION_READY: 'accepted',
  },
} as const;