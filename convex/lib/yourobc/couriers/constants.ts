// convex/lib/yourobc/couriers/constants.ts
// Business constants, permissions, and limits for couriers module

export const COURIERS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'couriers:view',
    CREATE: 'couriers:create',
    EDIT: 'couriers:edit',
    DELETE: 'couriers:delete',
    BULK_EDIT: 'couriers:bulk_edit',
    MANAGE_API: 'couriers:manage_api',
  },

  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
  },

  SERVICE_TYPE: {
    OBC: 'OBC',
    NFO: 'NFO',
    EXPRESS: 'express',
    STANDARD: 'standard',
    FREIGHT: 'freight',
    INTERNATIONAL: 'international',
    DOMESTIC: 'domestic',
  },

  DELIVERY_SPEED: {
    SAME_DAY: 'same_day',
    NEXT_DAY: 'next_day',
    TWO_THREE_DAYS: '2_3_days',
    THREE_FIVE_DAYS: '3_5_days',
    FIVE_SEVEN_DAYS: '5_7_days',
    SEVEN_FOURTEEN_DAYS: '7_14_days',
  },

  PRICING_MODEL: {
    WEIGHT_BASED: 'weight_based',
    ZONE_BASED: 'zone_based',
    FLAT_RATE: 'flat_rate',
    VOLUMETRIC: 'volumetric',
    CUSTOM: 'custom',
  },

  API_TYPE: {
    REST: 'rest',
    SOAP: 'soap',
    GRAPHQL: 'graphql',
    XML: 'xml',
    NONE: 'none',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MIN_NAME_LENGTH: 2,
    MAX_SHORT_NAME_LENGTH: 50,
    MAX_WEBSITE_LENGTH: 500,
    MAX_EMAIL_LENGTH: 255,
    MAX_PHONE_LENGTH: 50,
    MAX_NOTES_LENGTH: 5000,
    MAX_INTERNAL_NOTES_LENGTH: 5000,
    MAX_ADDITIONAL_CONTACTS: 10,
    MAX_TAGS: 10,
    MAX_SERVICE_TYPES: 20,
    MAX_DELIVERY_SPEEDS: 10,
    MAX_COVERAGE_COUNTRIES: 250,
    MAX_COVERAGE_REGIONS: 100,
    MAX_COVERAGE_CITIES: 500,
    MAX_COVERAGE_AIRPORTS: 200,
    MIN_RELIABILITY_SCORE: 0,
    MAX_RELIABILITY_SCORE: 100,
    MIN_DELIVERY_RATE: 0,
    MAX_DELIVERY_RATE: 100,
    MAX_API_URL_LENGTH: 500,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_.,&()']+$/,
    WEBSITE_PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^[\d\s\-+()\.]+ $/,
    API_URL_PATTERN: /^https?:\/\/.+$/,
  },
} as const;
