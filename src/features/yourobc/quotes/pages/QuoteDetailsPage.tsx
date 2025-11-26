// src/features/yourobc/quotes/pages/QuoteDetailsPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuote, useQuotes } from '../hooks/useQuotes'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Loading,
  Alert,
  AlertDescription,
  Modal,
  ModalBody,
  ModalFooter,
} from '@/components/ui'
import { DeleteConfirmationModal } from '@/components/ui/Modals'
import { CommentsSection } from '@/features/yourobc/supporting/comments'
import { RemindersSection } from '@/features/yourobc/supporting/followup-reminders'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki'
import { InquirySourceDisplay } from '@/features/yourobc/supporting/inquiry-sources'
import { CurrencyConverter } from '@/features/yourobc/supporting/exchange-rates'
import { DocumentsSection } from '@/features/yourobc/supporting/documents'
import { QUOTE_STATUS_COLORS, PRIORITY_COLORS, SERVICE_TYPE_LABELS, CURRENCY_SYMBOLS } from '../types'
import type { QuoteId, CourierId } from '../types'
import type { ShipmentId } from '@/features/yourobc/shipments/types'
import {
  OBCFlightLookup,
  OBCCourierSuggestions,
  NFOPartnerInquiry,
  NFOPartnerQuoteComparison,
  QuoteTemplateDisplay
} from '../components'
import type { FlightInfo } from '../services'
import { useAvailableCouriers } from '@/features/yourobc/couriers/hooks/useCouriers'
import { useAvailablePartners } from '@/features/yourobc/partners/hooks/usePartners'
import { useShipment } from '@/features/yourobc/shipments/hooks/useShipments'

interface QuoteDetailsPageProps {
  quoteId: QuoteId
}

export const QuoteDetailsPage: FC<QuoteDetailsPageProps> = ({ quoteId }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [convertModalOpen, setConvertModalOpen] = useState(false)
  const [flightInfo, setFlightInfo] = useState<FlightInfo | undefined>(undefined)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const { quote, quoteInsights, isLoading, error } = useQuote(quoteId)
  const {
    canEditQuotes,
    canDeleteQuotes,
    canSendQuotes,
    deleteQuote,
    updateQuote,
    sendQuote,
    updateQuoteStatus,
    convertToShipment,
    isDeleting,
    isSending,
    isUpdatingStatus,
    isConverting
  } = useQuotes()

  // Fetch shipment if quote has been converted
  const { shipment: convertedShipment } = useShipment(
    quote?.convertedToShipmentId as ShipmentId | undefined
  )

  // Fetch couriers for OBC quotes
  const { couriers: availableCouriers } = useAvailableCouriers(
    quote?.serviceType === 'OBC' ? 'OBC' : undefined,
    undefined,
    50
  )

  // Fetch partners for NFO quotes
  const { partners: availablePartners } = useAvailablePartners(
    quote?.serviceType === 'NFO' ? 'NFO' : 'OBC',
    quote?.origin.countryCode,
    undefined,
    undefined,
    undefined,
    50
  )

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!quote) return

    try {
      await deleteQuote(quoteId)
      toast.success(`Quote ${quote.quoteNumber} has been deleted successfully`)
      setDeleteModalOpen(false)
      navigate({ to: '/yourobc/quotes' })
    } catch (error: any) {
      console.error('Delete quote error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleSendQuote = async () => {
    if (!quote || !quote.customer?.primaryContact.email) {
      toast.error('Customer email is required to send quote')
      return
    }

    const quoteText = quote.quoteText || 'No quote text available.'

    try {
      await sendQuote(quoteId, quoteText, {
        to: [quote.customer.primaryContact.email],
        subject: `Quote ${quote.quoteNumber} - ${quote.description}`,
      })
      toast.success('Quote sent successfully!')
    } catch (error: any) {
      console.error('Send quote error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleStatusUpdate = async (status: 'accepted' | 'rejected') => {
    try {
      await updateQuoteStatus(quoteId, status)
      toast.success(`Quote marked as ${status}`)
    } catch (error: any) {
      console.error('Status update error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleConvertClick = () => {
    setConvertModalOpen(true)
  }

  const confirmConvert = async () => {
    if (!quote) return

    try {
      const shipmentId = await convertToShipment({ quoteId })
      toast.success('Quote converted to shipment successfully!')
      setConvertModalOpen(false)
      navigate({
        to: '/yourobc/shipments/$shipmentId',
        params: { shipmentId: shipmentId as ShipmentId }
      })
    } catch (error: any) {
      console.error('Convert quote error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleFlightSelection = async (flight: FlightInfo) => {
    try {
      setFlightInfo(flight)

      // Save flight info to quote record
      await updateQuote(quoteId, {
        flightDetails: {
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          departureTime: flight.departure.scheduled.getTime(),
          arrivalTime: flight.arrival.scheduled.getTime(),
        }
      })

      toast.success('Flight information saved to quote')
    } catch (error: any) {
      console.error('Save flight info error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleCourierSelection = async (courierId: CourierId) => {
    try {
      await updateQuote(quoteId, {
        assignedCourierId: courierId as CourierId
      })

      toast.success('Courier assigned to quote')
    } catch (error: any) {
      console.error('Courier assignment error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handlePartnerInquirySent = (partnerIds: string[]) => {
    // Track inquiry sent - could be extended to save to quote notes or a separate field
    toast.success(`Inquiry sent to ${partnerIds.length} partner(s)`)
  }

  const handleSavePartnerQuotes = async (partnerQuotes: any[], selectedPartnerIds: string[]) => {
    try {
      // Save partner quotes to quote record
      await updateQuote(quoteId, {
        partnerQuotes: partnerQuotes,
        selectedPartnerQuote: selectedPartnerIds[0] as any
      })

      toast.success('Partner quotes saved to quote')
    } catch (error: any) {
      console.error('Save partner quotes error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  const formatCurrency = (amount: number, currency: 'EUR' | 'USD' = 'EUR') => {
    return `${CURRENCY_SYMBOLS[currency]}${amount.toLocaleString()}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'sent': return 'primary'
      case 'rejected': return 'danger'
      case 'expired': return 'warning'
      default: return 'secondary'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger'
      case 'urgent': return 'warning'
      default: return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">
                {error ? 'Error loading quote' : 'Quote not found'}
              </div>
              <p className="text-gray-500 mb-4">
                {error?.message || 'The quote you are looking for does not exist or has been deleted.'}
              </p>
              <Link to="/{-$locale}/yourobc/quotes" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Quotes
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/{-$locale}/yourobc/quotes" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Quotes
          </Link>

          <div className="flex items-center gap-3">
            {quote.status === 'draft' && canSendQuotes && (
              <Button
                variant="primary"
                onClick={handleSendQuote}
                disabled={isSending}
              >
                {isSending ? 'Sending...' : '📧 Send Quote'}
              </Button>
            )}

            {quote.status === 'accepted' && !quote.convertedToShipmentId && (
              <Button
                variant="primary"
                onClick={handleConvertClick}
                disabled={isConverting}
              >
                📦 Convert to Shipment
              </Button>
            )}

            {canEditQuotes && quote.status !== 'accepted' && (
              <Button
                variant="secondary"
                onClick={() => navigate({ to: `/yourobc/quotes/${quoteId}/edit` })}
              >
                ✏️ Edit
              </Button>
            )}

            {canDeleteQuotes && (
              <Button variant="danger" onClick={handleDeleteClick} disabled={isDeleting}>
                🗑️ Delete
              </Button>
            )}
          </div>
        </div>

        {/* Conversion Indicator */}
        {quote.convertedToShipmentId && convertedShipment && (
          <Alert variant="success">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span>
                    This quote has been converted to shipment{' '}
                    <strong>{convertedShipment.shipmentNumber}</strong>
                  </span>
                </div>
                <Link
                  to="/yourobc/shipments/$shipmentId"
                  params={{ shipmentId: quote.convertedToShipmentId }}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  View Shipment →
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Quote Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {quote.quoteNumber}
                  </h1>

                  <Badge variant={getStatusVariant(quote.status)}>
                    {quote.status.toUpperCase()}
                  </Badge>

                  {quote.priority !== 'standard' && (
                    <Badge variant={getPriorityVariant(quote.priority)}>
                      {quote.priority.toUpperCase()}
                    </Badge>
                  )}
                </div>

                <div className="text-gray-600 mb-4">
                  {SERVICE_TYPE_LABELS[quote.serviceType]} Service
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <span className="ml-2 font-medium">
                      {quote.customer?.companyName || 'Unknown Customer'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Route:</span>
                    <span className="ml-2 font-medium">
                      {quote.origin.city}, {quote.origin.country} → {quote.destination.city}, {quote.destination.country}
                    </span>
                  </div>

                  {quote.inquirySourceId && (
                    <div>
                      <InquirySourceDisplay sourceId={quote.inquirySourceId} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {quote.totalPrice && (
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(quote.totalPrice.amount, quote.totalPrice.currency)}
                  </div>
                )}

                {quoteInsights?.isExpiring && (
                  <Badge variant="warning">⏰ Expiring Soon</Badge>
                )}

                {quoteInsights?.isOverdue && (
                  <Badge variant="danger">🔴 Overdue</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(quote.deadline).split(',')[0]}
                </div>
                <div className="text-sm text-gray-600">Delivery Deadline</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(quote.validUntil).split(',')[0]}
                </div>
                <div className="text-sm text-gray-600">Quote Valid Until</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {quote.dimensions ? `${quote.dimensions.length}×${quote.dimensions.width}×${quote.dimensions.height} ${quote.dimensions.unit}` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Dimensions</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {quote.dimensions ? `${quote.dimensions.weight} ${quote.dimensions.weightUnit}` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Weight</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Actions */}
        {quote.status === 'sent' && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Quote Response</h3>
                  <p className="text-blue-700 text-sm">Update the quote status based on customer response</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusUpdate('accepted')}
                    disabled={isUpdatingStatus}
                  >
                    ✅ Accept
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isUpdatingStatus}
                  >
                    ❌ Reject
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="overview">👁️ Overview</TabsTrigger>
              <TabsTrigger value="pricing">💰 Pricing</TabsTrigger>

              {/* OBC-specific tabs */}
              {quote.serviceType === 'OBC' && (
                <>
                  <TabsTrigger value="flight">✈️ Flight Info</TabsTrigger>
                  <TabsTrigger value="courier">🚚 Courier</TabsTrigger>
                </>
              )}

              {/* NFO-specific tabs */}
              {quote.serviceType === 'NFO' && (
                <>
                  <TabsTrigger value="partner-inquiry">📧 Partner Inquiry</TabsTrigger>
                  <TabsTrigger value="partner-quotes">💰 Partner Quotes</TabsTrigger>
                </>
              )}

              <TabsTrigger value="template">📄 Quote Template</TabsTrigger>
              <TabsTrigger value="documents">📎 Documents</TabsTrigger>
              <TabsTrigger value="history">📈 History</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Shipment Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-700">{quote.description}</p>
                        </div>

                        {quote.specialInstructions && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                            <p className="text-gray-700">{quote.specialInstructions}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">📍 Origin</h4>
                            <div className="text-sm text-gray-700">
                              {quote.origin.street && <div>{quote.origin.street}</div>}
                              <div>{quote.origin.city}</div>
                              {quote.origin.postalCode && <div>{quote.origin.postalCode}</div>}
                              <div>{quote.origin.country}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">🎯 Destination</h4>
                            <div className="text-sm text-gray-700">
                              {quote.destination.street && <div>{quote.destination.street}</div>}
                              <div>{quote.destination.city}</div>
                              {quote.destination.postalCode && <div>{quote.destination.postalCode}</div>}
                              <div>{quote.destination.country}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    {quote.customer && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-gray-500">Company:</span>
                            <span className="ml-2 font-medium">{quote.customer.companyName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Contact:</span>
                            <span className="ml-2">{quote.customer.primaryContact.name}</span>
                          </div>
                          {quote.customer.primaryContact.email && (
                            <div>
                              <span className="text-gray-500">Email:</span>
                              <a href={`mailto:${quote.customer.primaryContact.email}`} className="ml-2 text-blue-600 hover:text-blue-800">
                                {quote.customer.primaryContact.email}
                              </a>
                            </div>
                          )}
                          {quote.customer.primaryContact.phone && (
                            <div>
                              <span className="text-gray-500">Phone:</span>
                              <a href={`tel:${quote.customer.primaryContact.phone}`} className="ml-2 text-blue-600 hover:text-blue-800">
                                {quote.customer.primaryContact.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Assigned Courier */}
                    {quote.assignedCourier && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Courier</h3>
                        <div className="flex items-center gap-3">
                          <Badge variant="primary">
                            🚚 {quote.assignedCourier.firstName} {quote.assignedCourier.lastName}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            ID: {quote.assignedCourier.courierNumber}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="bg-gray-50">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                          {quote.status === 'draft' && canSendQuotes && (
                            <Button
                              variant="primary"
                              className="w-full"
                              onClick={handleSendQuote}
                              disabled={isSending}
                            >
                              📧 Send to Customer
                            </Button>
                          )}

                          {quote.status === 'accepted' && (
                            <Button
                              variant="primary"
                              className="w-full"
                              onClick={handleConvertClick}
                              disabled={isConverting}
                            >
                              📦 Convert to Shipment
                            </Button>
                          )}

                          <Button variant="secondary" className="w-full">
                            📄 Generate PDF
                          </Button>

                          <Button variant="ghost" className="w-full">
                            📧 Send Follow-up
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Quote Insights */}
                    {quoteInsights && (
                      <Alert variant="default">
                        <AlertDescription>
                          <h3 className="font-semibold text-blue-900 mb-3">Quote Insights</h3>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>Quote Age: {quoteInsights.quoteAge} days</div>
                            <div>Days Until Expiry: {quoteInsights.daysUntilExpiry}</div>
                            <div>Conversion Probability: {quoteInsights.conversionProbability}</div>

                            {quoteInsights.needsFollowUp && (
                              <div className="text-orange-800 font-medium mt-2">
                                💡 Consider following up with the customer
                              </div>
                            )}

                            {quoteInsights.isExpiring && (
                              <div className="text-red-800 font-medium mt-2">
                                ⚠️ Quote is expiring soon - extend validity if needed
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Pricing Breakdown</h3>

                  {quote.baseCost && quote.totalPrice && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-50">
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Cost Structure</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Base Cost:</span>
                              <span>{formatCurrency(quote.baseCost.amount, quote.baseCost.currency)}</span>
                            </div>
                            {quote.markup && (
                              <div className="flex justify-between">
                                <span>Markup ({quote.markup}%):</span>
                                <span>{formatCurrency(quote.totalPrice.amount - quote.baseCost.amount, quote.totalPrice.currency)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-medium border-t pt-2">
                              <span>Total Price:</span>
                              <span className="text-green-600">{formatCurrency(quote.totalPrice.amount, quote.totalPrice.currency)}</span>
                            </div>
                            {quote.markup && (
                              <div className="text-xs text-gray-600 mt-1">
                                Profit Margin: {Math.round(((quote.totalPrice.amount - quote.baseCost.amount) / quote.totalPrice.amount) * 100)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>

                      <Card className="bg-blue-50">
                        <div className="p-4">
                          <h4 className="font-semibold text-blue-900 mb-3">Pricing Analysis</h4>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>Currency: {quote.totalPrice.currency}</div>
                            <div>Service Type: {SERVICE_TYPE_LABELS[quote.serviceType]}</div>
                            <div>Priority: {quote.priority}</div>
                            {quote.baseCost.exchangeRate && (
                              <div>Exchange Rate: {quote.baseCost.exchangeRate}</div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Currency Converter */}
                  {quote.totalPrice && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Currency Converter</h4>
                      <CurrencyConverter
                        initialAmount={quote.totalPrice.amount}
                        initialFromCurrency={quote.totalPrice.currency}
                        initialToCurrency={quote.totalPrice.currency === 'EUR' ? 'USD' : 'EUR'}
                        showLiveRate={true}
                      />
                    </div>
                  )}

                  {quote.quoteText && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Quote Text</h4>
                      <Card className="bg-gray-50">
                        <div className="p-4">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">{quote.quoteText}</pre>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <DocumentsSection
                  entityType="yourobc_quote"
                  entityId={quoteId}
                  title="Quote Documents & Files"
                  showConfidential={true}
                />
              </TabsContent>

              <TabsContent value="history">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote History</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="text-sm font-medium text-gray-900">Quote Created</div>
                      <div className="text-sm text-gray-600">{formatDate(quote.createdAt)}</div>
                    </div>

                    {quote.sentAt && (
                      <div className="border-l-4 border-green-500 pl-4">
                        <div className="text-sm font-medium text-gray-900">Quote Sent</div>
                        <div className="text-sm text-gray-600">{formatDate(quote.sentAt)}</div>
                      </div>
                    )}

                    <div className="border-l-4 border-gray-300 pl-4">
                      <div className="text-sm font-medium text-gray-900">Last Updated</div>
                      <div className="text-sm text-gray-600">{formatDate(quote.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* OBC Flight Info Tab */}
              {quote.serviceType === 'OBC' && (
                <TabsContent value="flight">
                  <OBCFlightLookup
                    originCity={quote.origin.city}
                    destinationCity={quote.destination.city}
                    onSelectFlight={handleFlightSelection}
                  />
                </TabsContent>
              )}

              {/* OBC Courier Tab */}
              {quote.serviceType === 'OBC' && (
                <TabsContent value="courier">
                  <OBCCourierSuggestions
                    originCity={quote.origin.city}
                    originCountry={quote.origin.country}
                    originCountryCode={quote.origin.countryCode}
                    weight={quote.dimensions?.weight || 0}
                    deadline={quote.deadline}
                    allCouriers={availableCouriers || []}
                    onSelectCourier={handleCourierSelection}
                    selectedCourierId={quote.assignedCourier?._id}
                  />
                </TabsContent>
              )}

              {/* NFO Partner Inquiry Tab */}
              {quote.serviceType === 'NFO' && (
                <TabsContent value="partner-inquiry">
                  <NFOPartnerInquiry
                    quote={quote}
                    suggestedPartners={availablePartners || []}
                    onInquirySent={handlePartnerInquirySent}
                  />
                </TabsContent>
              )}

              {/* NFO Partner Quotes Tab */}
              {quote.serviceType === 'NFO' && (
                <TabsContent value="partner-quotes">
                  <NFOPartnerQuoteComparison
                    quote={quote}
                    existingPartnerQuotes={(quote as any).partnerQuotes || []}
                    availablePartners={availablePartners || []}
                    onSavePartnerQuotes={handleSavePartnerQuotes}
                    onSelectForCustomer={(selectedQuotes) => {
                      // Use selected quotes to update quote pricing
                      if (selectedQuotes.length > 0) {
                        const lowestPrice = Math.min(...selectedQuotes.map(q => q.quotedPrice.amount))
                        toast.info(`Lowest partner quote: ${formatCurrency(lowestPrice)}`)
                      }
                    }}
                  />
                </TabsContent>
              )}

              {/* Quote Template Tab */}
              <TabsContent value="template">
                <QuoteTemplateDisplay
                  quote={quote}
                  customer={quote.customer as any}
                  flightInfo={flightInfo}
                  courierName={quote.assignedCourier ? `${quote.assignedCourier.firstName} ${quote.assignedCourier.lastName}` : undefined}
                  onClose={() => setActiveTab('overview')}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Comments Section */}
        <CommentsSection
          entityType="yourobc_quote"
          entityId={quoteId}
          title="Quote Discussion & Notes"
          showInternalComments={true}
        />

        {/* Reminders Section */}
        <RemindersSection
          entityType="yourobc_quote"
          entityId={quoteId}
          title="Quote Reminders"
          status="pending"
        />

        {/* Internal Notes */}
        {quote.notes && (
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">📝 Internal Notes</h3>
              <p className="text-yellow-800 text-sm">{quote.notes}</p>
            </div>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="Delete Quote?"
          entityName={quote?.quoteNumber}
          description="This will permanently delete the quote and all associated data. This action cannot be undone."
        />

        {/* Convert to Shipment Confirmation Modal */}
        <Modal
          isOpen={convertModalOpen}
          onClose={() => setConvertModalOpen(false)}
          title="Convert Quote to Shipment"
          size="md"
        >
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-700">
                You are about to convert this quote into a shipment. This action will:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
                <li>Create a new shipment with status "Booked"</li>
                <li>Transfer all quote details to the shipment</li>
                <li>Link the quote to the shipment</li>
                <li>Mark the quote as converted (cannot be unconverted)</li>
              </ul>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2 mt-4">
                <h4 className="font-semibold text-gray-900">Quote Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Quote Number:</div>
                  <div className="font-medium">{quote?.quoteNumber}</div>

                  <div className="text-gray-500">Customer:</div>
                  <div className="font-medium">{quote?.customer?.companyName}</div>

                  <div className="text-gray-500">Service:</div>
                  <div className="font-medium">{quote && SERVICE_TYPE_LABELS[quote.serviceType]}</div>

                  <div className="text-gray-500">Total Price:</div>
                  <div className="font-medium text-green-600">
                    {quote?.totalPrice && formatCurrency(quote.totalPrice.amount, quote.totalPrice.currency)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 italic mt-4">
                This action cannot be undone. Are you sure you want to proceed?
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setConvertModalOpen(false)}
              disabled={isConverting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmConvert}
              disabled={isConverting}
            >
              {isConverting ? 'Converting...' : 'Confirm Conversion'}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Wiki Sidebar */}
        <WikiSidebar category="Quotes" title="Quote Wiki Helper" />
      </div>
    </div>
  )
}