// convex/schema/yourobc/supporting/exchange_rates/types.ts
// Type extractions from validators for exchange rates module

import { Infer } from 'convex/values';
import { exchangeRatesValidators } from './validators';

export type ExchangeRateCurrency = Infer<typeof exchangeRatesValidators.currency>;
