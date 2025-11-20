// src/features/yourobc/supporting/exchange-rates/index.ts

// Components
export { ExchangeRateForm } from './components/ExchangeRateForm'
export { ExchangeRateCard } from './components/ExchangeRateCard'
export { ExchangeRateList } from './components/ExchangeRateList'
export { CurrencyConverter } from './components/CurrencyConverter'
export { CurrencyDisplay, CurrencyAmountDisplay } from './components/CurrencyDisplay'
export { ExchangeRateIndicator } from './components/ExchangeRateIndicator'

// Pages
export { ExchangeRatesPage } from './pages/ExchangeRatesPage'

// Hooks
export { useExchangeRates, useCurrencyConverter, useCurrencyPairRate } from './hooks/useExchangeRates'

// Services
export { exchangeRatesService } from './services/ExchangeRatesService'

// Types
export type {
  ExchangeRate,
  ExchangeRateId,
  Currency,
  CreateExchangeRateData,
  ExchangeRateFormData,
  ConversionResult,
  CurrencyAmount,
} from './types'

export {
  CURRENCIES,
  CURRENCY_SYMBOLS,
  CURRENCY_LABELS,
  EXCHANGE_RATE_SOURCES,
  EXCHANGE_RATE_CONSTANTS,
} from './types'
