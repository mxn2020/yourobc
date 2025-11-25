// Schema exports for supporting/exchangeRates
import { exchangeRatesTable } from './exchangeRates';

export const supportingExchangeRatesSchemas = {
  exchangeRates: exchangeRatesTable,
} as const;
