// convex/lib/yourobc/supporting/exchange_rates/constants.ts
// convex/yourobc/supporting/exchangeRates/constants.ts
export const EXCHANGE_RATE_CONSTANTS = {
  CURRENCY: {
    EUR: 'EUR',
    USD: 'USD',
  },
  SOURCE: {
    ECB: 'European Central Bank',
    MANUAL: 'Manual Entry',
  },
  LIMITS: {
    MIN_RATE: 0.01,
    MAX_RATE: 1000,
  },
  PERMISSIONS: {
    VIEW: 'exchange_rates.view',
    CREATE: 'exchange_rates.create',
    EDIT: 'exchange_rates.edit',
    DELETE: 'exchange_rates.delete',
  },
} as const;

