// convex/schema/yourobc/quotes/types.ts
// Type extractions from validators for quotes module

import { Infer } from 'convex/values';
import { quotesValidators, quotesFields } from './validators';
import { baseValidators, baseFields } from '@/schema/base.validators';

// Status and classification types
export type QuoteStatus = Infer<typeof quotesValidators.status>;
export type QuotePriority = Infer<typeof quotesValidators.priority>;
export type QuoteShipmentType = Infer<typeof quotesValidators.shipmentType>;

// Service type
export type QuoteServiceType = Infer<typeof baseValidators.serviceType>;

// Field types
export type QuoteDimensions = Infer<typeof quotesFields.dimensions>;
export type QuoteFlightDetails = Infer<typeof quotesFields.flightDetails>;
export type QuotePartnerQuote = Infer<typeof quotesFields.partnerQuote>;
export type QuoteAirlineRules = Infer<typeof quotesFields.airlineRules>;

// Base field types
export type QuoteCurrencyAmount = Infer<typeof baseFields.currencyAmount>;
export type QuoteAddress = Infer<typeof baseFields.address>;

// Validator field types
export type QuoteDimensionUnit = Infer<typeof quotesValidators.dimensionUnit>;
export type QuoteWeightUnit = Infer<typeof quotesValidators.weightUnit>;
export type QuoteCurrency = Infer<typeof quotesValidators.currency>;
