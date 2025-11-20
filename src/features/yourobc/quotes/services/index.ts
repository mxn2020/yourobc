// src/features/yourobc/quotes/services/index.ts

export { flightStatsService } from './FlightStatsService'
export type {
  FlightSearchParams,
  FlightInfo,
  FlightSearchResult,
} from './FlightStatsService'

export { quoteTemplateService } from './QuoteTemplateService'
export type {
  QuoteTemplateData,
  PartnerInquiryTemplateData,
  TemplateFormat,
} from './QuoteTemplateService'

export {
  suggestCouriers,
  getTopCourierSuggestions,
  formatCourierSuggestion,
  groupCouriersByLocation,
  getCourierSuggestionsSummary,
} from './CourierSuggestionService'
export type {
  CourierSuggestion,
  CourierSuggestionParams,
} from './CourierSuggestionService'

export { airlineRulesService } from './AirlineRulesService'
export type {
  AirlineRule,
  CourierCalculationResult,
} from './AirlineRulesService'
