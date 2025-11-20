// src/features/yourobc/supporting/exchange-rates/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type ExchangeRate = Doc<'yourobcExchangeRates'>
export type ExchangeRateId = Id<'yourobcExchangeRates'>

export type Currency = 'EUR' | 'USD'

export interface CreateExchangeRateData {
  fromCurrency: Currency
  toCurrency: Currency
  rate: number
  source?: string
}

export interface ExchangeRateFormData {
  fromCurrency: Currency
  toCurrency: Currency
  rate: number
  source?: string
}

export interface ConversionResult {
  originalAmount: number
  convertedAmount: number
  fromCurrency: Currency
  toCurrency: Currency
  rate: number
  source?: string
}

export interface CurrencyAmount {
  amount: number
  currency: Currency
  exchangeRate?: number
}

// Constants
export const CURRENCIES: Currency[] = ['EUR', 'USD']

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  EUR: 'Euro',
  USD: 'US Dollar',
}

export const EXCHANGE_RATE_SOURCES = {
  ECB: 'European Central Bank',
  MANUAL: 'Manual Entry',
  API: 'API Service',
} as const

export const EXCHANGE_RATE_CONSTANTS = {
  MIN_RATE: 0.01,
  MAX_RATE: 1000,
  DECIMAL_PLACES: 6,
}
