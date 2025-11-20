/**
 * Enhanced Quote Form with Configuration Support
 *
 * This component demonstrates how to use the quotes configuration
 * to conditionally enable/disable features based on quotesConfig.
 */

import { FC, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, Button, Badge } from '@/components/ui'
import { QUOTES_CONFIG } from '../config'
import { OBCFlightLookup } from './OBCFlightLookup'
import { OBCCourierSuggestions } from './OBCCourierSuggestions'
import { NFOPartnerInquiry } from './NFOPartnerInquiry'
import { NFOPartnerQuoteComparison } from './NFOPartnerQuoteComparison'
import { QuoteTemplateDisplay } from './QuoteTemplateDisplay'
import type { Quote } from '../types'
import type { PartnerQuote } from '@/convex/lib/yourobc/quotes/types'
import type { Id } from '@/convex/_generated/dataModel'
import type { FlightInfo } from '../services/FlightStatsService'

interface QuoteFormEnhancedProps {
  quote: Quote | null
  onUpdate?: (field: string, value: any) => void
}

export const QuoteFormEnhanced: FC<QuoteFormEnhancedProps> = ({ quote, onUpdate }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD'>('EUR')

  // Feature flags from configuration
  const showFlightLookup = quote?.serviceType === 'OBC' &&
    QUOTES_CONFIG.advanced.flightLookup
  const showCourierSuggestions = quote?.serviceType === 'OBC' &&
    QUOTES_CONFIG.advanced.courierSuggestions
  const showAirlineRules = quote?.serviceType === 'OBC' &&
    QUOTES_CONFIG.advanced.airlineRules
  const showPartnerInquiry = quote?.serviceType === 'NFO' &&
    QUOTES_CONFIG.advanced.partnerInquiry
  const showPartnerComparison = quote?.serviceType === 'NFO' &&
    QUOTES_CONFIG.advanced.partnerQuoteComparison
  const showTemplates = QUOTES_CONFIG.templates.enabled &&
    QUOTES_CONFIG.templates.defaultTemplate
  const showCurrencySelection = QUOTES_CONFIG.pricing.enabled &&
    QUOTES_CONFIG.pricing.multiCurrency
  const enableAutomaticConversion = QUOTES_CONFIG.pricing.enabled &&
    QUOTES_CONFIG.pricing.automaticConversion

  // Available tabs based on service type and configuration
  const availableTabs = []

  if (quote?.serviceType === 'OBC') {
    availableTabs.push({ id: 'basic', label: 'Basic Info' })
    if (showFlightLookup) availableTabs.push({ id: 'flight', label: 'Flight Lookup' })
    if (showCourierSuggestions) availableTabs.push({ id: 'courier', label: 'Courier Suggestions' })
  }

  if (quote?.serviceType === 'NFO') {
    availableTabs.push({ id: 'basic', label: 'Basic Info' })
    if (showPartnerInquiry) availableTabs.push({ id: 'inquiry', label: 'Partner Inquiry' })
    if (showPartnerComparison) availableTabs.push({ id: 'comparison', label: 'Partner Quotes' })
  }

  if (showTemplates) {
    availableTabs.push({ id: 'template', label: 'Templates' })
  }

  // Currency selector
  const renderCurrencySelector = () => {
    if (!showCurrencySelection) return null

    return (
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium">Currency:</label>
        <div className="flex gap-2">
          {(['EUR', 'USD'] as const).map((currency) => (
            <Button
              key={currency}
              variant={selectedCurrency === currency ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCurrency(currency)
                if (enableAutomaticConversion && onUpdate) {
                  // Trigger currency conversion
                  onUpdate('currency', currency)
                }
              }}
            >
              {currency}
            </Button>
          ))}
        </div>
        {enableAutomaticConversion && (
          <Badge variant="secondary" className="ml-2">
            Auto-conversion enabled
          </Badge>
        )}
      </div>
    )
  }

  if (!quote) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Select a quote to view details</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {renderCurrencySelector()}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full">
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Service Type</label>
                <p className="text-base">{quote.serviceType}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Quote Number</label>
                <p className="text-base">{quote.quoteNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Badge>{quote.status}</Badge>
              </div>
              {quote.totalPrice && (
                <div>
                  <label className="text-sm font-medium">Total Price</label>
                  <p className="text-base">
                    {quote.totalPrice.amount} {quote.totalPrice.currency}
                    {quote.totalPrice.exchangeRate && quote.totalPrice.exchangeRate !== 1 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (Rate: {quote.totalPrice.exchangeRate})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {showFlightLookup && (
          <TabsContent value="flight">
            <OBCFlightLookup
              originCity={quote.origin.city}
              destinationCity={quote.destination.city}
              onSelectFlight={(flight: FlightInfo) => {
                if (onUpdate) {
                  onUpdate('flightDetails', {
                    flightNumber: flight.flightNumber,
                    airline: flight.airline,
                    departureTime: flight.departure.scheduled.getTime(),
                    arrivalTime: flight.arrival.scheduled.getTime(),
                  })
                }
              }}
            />
          </TabsContent>
        )}

        {showCourierSuggestions && (
          <TabsContent value="courier">
            <OBCCourierSuggestions
              originCity={quote.origin.city}
              originCountry={quote.origin.country}
              originCountryCode={quote.origin.countryCode}
              weight={quote.dimensions.weight}
              deadline={quote.deadline}
              allCouriers={[]}
              onSelectCourier={(courierId: Id<'yourobcCouriers'>) => {
                if (onUpdate) {
                  onUpdate('assignedCourierId', courierId)
                }
              }}
              selectedCourierId={quote.assignedCourierId}
            />
          </TabsContent>
        )}

        {showPartnerInquiry && (
          <TabsContent value="inquiry">
            <NFOPartnerInquiry
              quote={quote}
              suggestedPartners={[]}
              onInquirySent={(partnerIds: string[]) => {
                if (onUpdate) {
                  onUpdate('partnerInquiriesSent', partnerIds)
                }
              }}
            />
          </TabsContent>
        )}

        {showPartnerComparison && (
          <TabsContent value="comparison">
            <NFOPartnerQuoteComparison
              quote={quote}
              existingPartnerQuotes={quote.partnerQuotes || []}
              availablePartners={[]}
              onSavePartnerQuotes={(partnerQuotes: PartnerQuote[], selectedPartnerIds: string[]) => {
                if (onUpdate) {
                  onUpdate('partnerQuotes', partnerQuotes)
                  onUpdate('selectedPartnerIds', selectedPartnerIds)
                }
              }}
            />
          </TabsContent>
        )}

        {showTemplates && quote.customerId && (
          <TabsContent value="template">
            <QuoteTemplateDisplay
              quote={quote}
              customer={{
                _id: quote.customerId,
                _creationTime: Date.now(),
                createdAt: Date.now(),
                createdBy: '',
                tags: [],
                companyName: '',
                primaryContact: { name: '', isPrimary: true },
                additionalContacts: [],
                billingAddress: { city: '', country: '', countryCode: '' },
                defaultCurrency: 'EUR',
                paymentTerms: 30,
                paymentMethod: 'bank_transfer',
                margin: 0,
                status: 'active',
                stats: {
                  totalQuotes: 0,
                  acceptedQuotes: 0,
                  totalRevenue: 0,
                },
              }}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Feature Status Panel (for debugging/admin) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 mt-4 bg-muted/50">
          <h4 className="text-sm font-semibold mb-2">Active Features:</h4>
          <div className="flex flex-wrap gap-2">
            {showFlightLookup && <Badge variant="secondary">Flight Lookup</Badge>}
            {showCourierSuggestions && <Badge variant="secondary">Courier Suggestions</Badge>}
            {showAirlineRules && <Badge variant="secondary">Airline Rules</Badge>}
            {showPartnerInquiry && <Badge variant="secondary">Partner Inquiry</Badge>}
            {showPartnerComparison && <Badge variant="secondary">Partner Comparison</Badge>}
            {showTemplates && <Badge variant="secondary">Templates</Badge>}
            {showCurrencySelection && <Badge variant="secondary">Currency Selection</Badge>}
            {enableAutomaticConversion && <Badge variant="secondary">Auto-Conversion</Badge>}
          </div>
        </Card>
      )}
    </div>
  )
}

/**
 * Usage Example:
 *
 * import { QuoteFormEnhanced } from './components/QuoteFormEnhanced'
 * import { quotesConfig } from './config/quotesConfig'
 *
 * function QuotePage() {
 *   const { quote } = useQuote(quoteId)
 *
 *   return (
 *     <QuoteFormEnhanced
 *       quote={quote}
 *       onUpdate={(field, value) => {
 *         // Handle updates
 *       }}
 *     />
 *   )
 * }
 *
 * To disable features, simply change the configuration:
 *
 * // In quotes.config.ts
 * export const DEFAULT_QUOTES_CONFIG: QuotesConfig = {
 *   ...
 *   obc: {
 *     enabled: true,
 *     flightLookup: false,  // Disables flight lookup tab
 *     courierSuggestions: false,  // Disables courier suggestions tab
 *   }
 * }
 */
