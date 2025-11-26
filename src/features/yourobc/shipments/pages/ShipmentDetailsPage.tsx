// src/features/yourobc/shipments/pages/ShipmentDetailsPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useShipment, useShipments } from '../hooks/useShipments'
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { DeleteConfirmationModal } from '@/components/ui/Modals'
import { CommentsSection } from '@/features/yourobc/supporting/comments'
import { RemindersSection } from '@/features/yourobc/supporting/followup-reminders'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki'
import { CurrencyConverter } from '@/features/yourobc/supporting/exchange-rates'
import { StatusUpdateForm } from '../components/StatusUpdateForm'
import { TrackingMessageGenerator } from '@/features/yourobc/trackingMessages/components/TrackingMessageGenerator'
import { CompletionPopup } from '../components/CompletionPopup'
import { CommunicationChannels } from '../components/CommunicationChannels'
import {
  SHIPMENT_STATUS_LABELS,
  PRIORITY_LABELS,
  SERVICE_TYPE_LABELS,
  SLA_STATUS_LABELS,
} from '../types'
import type { ShipmentId, StatusUpdateFormData } from '../types'
import { useQuote } from '@/features/yourobc/quotes/hooks/useQuotes'
import type { QuoteId } from '@/features/yourobc/quotes/types'

interface ShipmentDetailsPageProps {
  shipmentId: ShipmentId
}

export const ShipmentDetailsPage: FC<ShipmentDetailsPageProps> = ({ shipmentId }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const {
    shipment,
    statusHistory,
    shipmentInsights,
    shipmentMetrics,
    isLoading,
    isLoadingHistory,
    error,
    refetch
  } = useShipment(shipmentId)

  const {
    canEditShipments,
    canDeleteShipments,
    canUpdateStatus,
    updateShipmentStatus,
    deleteShipment,
    isUpdatingStatus,
    isDeleting
  } = useShipments()

  // Fetch quote if shipment was created from a quote
  const { quote: originQuote } = useQuote(
    shipment?.quoteId as QuoteId | undefined
  )

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!shipment) return

    try {
      await deleteShipment(shipmentId)
      toast.success(`Shipment ${shipment.shipmentNumber} has been deleted successfully`)
      setDeleteModalOpen(false)
      navigate({ to: '/yourobc/shipments' })
    } catch (error: any) {
      console.error('Delete shipment error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleStatusUpdate = async (statusData: StatusUpdateFormData) => {
    try {
      await updateShipmentStatus(shipmentId, statusData)
      toast.success('Shipment status updated successfully')
      setShowStatusUpdate(false)
    } catch (error: any) {
      console.error('Status update error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'quoted': return 'secondary'
      case 'booked': return 'primary'
      case 'pickup': return 'warning'
      case 'in_transit': return 'info'
      case 'delivered': return 'success'
      case 'document': return 'info'
      case 'invoiced': return 'success'
      case 'cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'standard': return 'secondary'
      case 'urgent': return 'warning'
      case 'critical': return 'danger'
      default: return 'secondary'
    }
  }

  const getSLAVariant = (slaStatus: string) => {
    switch (slaStatus) {
      case 'on_time': return 'success'
      case 'warning': return 'warning'
      case 'overdue': return 'danger'
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

  if (error || !shipment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">
                {error ? 'Error loading shipment' : 'Shipment not found'}
              </div>
              <p className="text-gray-500 mb-4">
                {error?.message || 'The shipment you are looking for does not exist or has been deleted.'}
              </p>
              <Link to="/{-$locale}/yourobc/shipments" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Shipments
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
          <Link to="/{-$locale}/yourobc/shipments" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Shipments
          </Link>

          <div className="flex items-center gap-3">
            {canUpdateStatus &&
              shipment?.currentStatus === 'delivered' && (
                <Button
                  variant="primary"
                  onClick={() => setShowCompletionPopup(true)}
                >
                  ✓ Auftrag abschließen
                </Button>
              )}

            {canUpdateStatus && (
              <Button
                variant="primary"
                onClick={() => setShowStatusUpdate(true)}
                disabled={isUpdatingStatus}
              >
                📋 Update Status
              </Button>
            )}

            {canEditShipments && (
              <Button
                variant="secondary"
                onClick={() => navigate({ to: `/yourobc/shipments/${shipmentId}/edit` })}
              >
                ✏️ Edit
              </Button>
            )}

            {canDeleteShipments && (
              <Button variant="danger" onClick={handleDeleteClick} disabled={isDeleting}>
                🗑️ Delete
              </Button>
            )}
          </div>
        </div>

        {/* Quote Reference Indicator */}
        {shipment.quoteId && originQuote && (
          <Alert variant="default">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <span>
                    Created from quote{' '}
                    <strong>{originQuote.quoteNumber}</strong>
                    {originQuote.createdAt && (
                      <span className="text-gray-500 ml-2">
                        ({new Date(originQuote.createdAt).toLocaleDateString()})
                      </span>
                    )}
                  </span>
                </div>
                <Link
                  to="/yourobc/quotes/$quoteId"
                  params={{ quoteId: shipment.quoteId }}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  View Quote →
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Shipment Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {shipment.serviceType === 'OBC' ? '🚶‍♂️' : '✈️'} {shipment.shipmentNumber}
                  </h1>

                  <Badge variant={getStatusVariant(shipment.currentStatus)}>
                    {SHIPMENT_STATUS_LABELS[shipment.currentStatus]}
                  </Badge>

                  {shipment.priority !== 'standard' && (
                    <Badge variant={getPriorityVariant(shipment.priority)}>
                      {PRIORITY_LABELS[shipment.priority]}
                    </Badge>
                  )}
                </div>

                <div className="text-gray-600 mb-4">
                  {SERVICE_TYPE_LABELS[shipment.serviceType]}
                  {shipment.awbNumber && ` • AWB: ${shipment.awbNumber}`}
                  {shipment.customerReference && ` • Ref: ${shipment.customerReference}`}
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <span className="text-gray-500">Route:</span>
                    <span className="ml-2 font-medium">
                      📍 {shipment.origin.city}, {shipment.origin.country} → 
                      🎯 {shipment.destination.city}, {shipment.destination.country}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant={getSLAVariant(shipment.sla.status)}>
                  {SLA_STATUS_LABELS[shipment.sla.status]}
                </Badge>

                {shipment.isOverdue && shipmentInsights?.remainingHours && (
                  <Badge variant="danger">
                    {Math.abs(shipmentInsights.remainingHours)}h overdue
                  </Badge>
                )}

                {shipmentInsights?.needsAttention && (
                  <Badge variant="warning">⚠️ Needs Attention</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(shipment.agreedPrice.amount, shipment.agreedPrice.currency)}
                </div>
                <div className="text-sm text-gray-600">Agreed Price</div>
                {shipment.actualCosts && (
                  <div className="text-xs text-gray-500 mt-1">
                    Actual: {formatCurrency(shipment.actualCosts.amount, shipment.actualCosts.currency)}
                  </div>
                )}
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatDate(shipment.sla.deadline).split(',')[0]}
                </div>
                <div className="text-sm text-gray-600">Deadline</div>
                {shipmentInsights?.remainingHours !== null && shipmentInsights?.remainingHours !== undefined && (
                  <div className="text-xs text-gray-500 mt-1">
                    {shipmentInsights.remainingHours > 0 
                      ? `${shipmentInsights.remainingHours}h remaining`
                      : `${Math.abs(shipmentInsights.remainingHours)}h overdue`}
                  </div>
                )}
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {shipment.dimensions.weight} {shipment.dimensions.weightUnit}
                </div>
                <div className="text-sm text-gray-600">Weight</div>
                <div className="text-xs text-gray-500 mt-1">
                  {shipment.dimensions.length}×{shipment.dimensions.width}×{shipment.dimensions.height} {shipment.dimensions.unit}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(shipmentInsights?.completionProgress || 0)}%
                </div>
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(shipment.createdAt).split(',')[0]}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Update Form */}
        {showStatusUpdate && (
          <Card>
            <div className="p-6">
              <StatusUpdateForm
                shipment={shipment}
                onSubmit={handleStatusUpdate}
                onCancel={() => setShowStatusUpdate(false)}
                isLoading={isUpdatingStatus}
              />
            </div>
          </Card>
        )}

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="overview">👁️ Overview</TabsTrigger>
              <TabsTrigger value="details">📋 Details</TabsTrigger>
              <TabsTrigger value="tracking">📍 Tracking</TabsTrigger>
              <TabsTrigger value="documents">📄 Documents</TabsTrigger>
              <TabsTrigger value="history">📈 History</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Shipment Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                      <p className="text-gray-700">{shipment.description}</p>
                      {shipment.specialInstructions && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-2">Special Instructions</h4>
                          <p className="text-yellow-800 text-sm">{shipment.specialInstructions}</p>
                        </div>
                      )}
                    </div>

                    {/* Entities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                        <Link
                          to="/yourobc/customers/$customerId"
                          params={{ customerId: shipment.customer._id }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          🏢 {shipment.customer.companyName}
                        </Link>
                        {shipment.customer.shortName && (
                          <div className="text-sm text-gray-500">{shipment.customer.shortName}</div>
                        )}
                      </div>

                      {/* Courier */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Assigned Courier</h4>
                        {shipment.courier ? (
                          <Link
                            to="/yourobc/couriers/$courierId"
                            params={{ courierId: shipment.courier._id }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            👤 {shipment.courier.firstName} {shipment.courier.lastName}
                          </Link>
                        ) : (
                          <div className="text-gray-500">Not assigned</div>
                        )}
                      </div>

                      {/* Partner */}
                      {shipment.partner && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Partner</h4>
                          <Link
                            to="/yourobc/partners/$partnerId"
                            params={{ partnerId: shipment.partner._id }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            🤝 {shipment.partner.companyName}
                          </Link>
                          {shipment.partnerReference && (
                            <div className="text-sm text-gray-500">Ref: {shipment.partnerReference}</div>
                          )}
                        </div>
                      )}

                      {/* Quote */}
                      {shipment.quote && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Original Quote</h4>
                          <Link
                            to="/yourobc/quotes/$quoteId"
                            params={{ quoteId: shipment.quote._id }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            📋 {shipment.quote.quoteNumber}
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Next Task */}
                    {shipment.nextTask && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Next Task</h4>
                        <p className="text-blue-800">{shipment.nextTask.description}</p>
                        {shipment.nextTask.dueDate && (
                          <p className="text-sm text-blue-600 mt-1">
                            Due: {formatDate(shipment.nextTask.dueDate)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Communication Channels */}
                    {(shipment as any).communication && (
                      <div className="mt-6">
                        <CommunicationChannels communication={(shipment as any).communication} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="bg-gray-50">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                          {canUpdateStatus && (
                            <Button 
                              variant="primary" 
                              className="w-full"
                              onClick={() => setShowStatusUpdate(true)}
                            >
                              📋 Update Status
                            </Button>
                          )}

                          <Button variant="secondary" className="w-full">
                            📧 Contact Customer
                          </Button>

                          <Button variant="ghost" className="w-full">
                            📊 View Analytics
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Insights */}
                    {shipmentInsights && (
                      <Alert variant={shipmentInsights.isOverdue ? 'warning' : 'default'}>
                        <AlertDescription>
                          <h3 className="font-semibold text-blue-900 mb-3">Shipment Insights</h3>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>SLA Status: {SLA_STATUS_LABELS[shipmentInsights.slaStatus]}</div>
                            {shipmentInsights.remainingHours !== null && (
                              <div>
                                {shipmentInsights.remainingHours > 0 
                                  ? `Time remaining: ${shipmentInsights.remainingHours}h`
                                  : `Overdue by: ${Math.abs(shipmentInsights.remainingHours)}h`}
                              </div>
                            )}
                            <div>Progress: {shipmentInsights.completionProgress.toFixed(1)}%</div>

                            {shipmentInsights.needsAttention && (
                              <div className="text-orange-800 font-medium mt-2">
                                ⚠️ This shipment requires immediate attention
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-8">
                  {/* Currency Converter */}
                  {shipment.agreedPrice && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Converter</h3>
                      <CurrencyConverter
                        initialAmount={shipment.agreedPrice.amount}
                        initialFromCurrency={shipment.agreedPrice.currency}
                        initialToCurrency={shipment.agreedPrice.currency === 'EUR' ? 'USD' : 'EUR'}
                        showLiveRate={true}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Addresses */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Addresses</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">📍 Origin</h4>
                        <div className="text-sm text-gray-600">
                          {shipment.origin.street && <div>{shipment.origin.street}</div>}
                          <div>{shipment.origin.city}</div>
                          {shipment.origin.postalCode && <div>{shipment.origin.postalCode}</div>}
                          <div>{shipment.origin.country}</div>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">🎯 Destination</h4>
                        <div className="text-sm text-gray-600">
                          {shipment.destination.street && <div>{shipment.destination.street}</div>}
                          <div>{shipment.destination.city}</div>
                          {shipment.destination.postalCode && <div>{shipment.destination.postalCode}</div>}
                          <div>{shipment.destination.country}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Details */}
                  {shipment.routing && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Details</h3>
                      
                      <div className="space-y-4">
                        {shipment.routing.outboundFlight && (
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">✈️ Outbound Flight</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              {shipment.routing.outboundFlight.flightNumber && (
                                <div>Flight: {shipment.routing.outboundFlight.flightNumber}</div>
                              )}
                              {shipment.routing.outboundFlight.airline && (
                                <div>Airline: {shipment.routing.outboundFlight.airline}</div>
                              )}
                              {shipment.routing.outboundFlight.departureTime && (
                                <div>Departure: {formatDate(shipment.routing.outboundFlight.departureTime)}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {shipment.routing.returnFlight && (
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">🔄 Return Flight</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              {shipment.routing.returnFlight.flightNumber && (
                                <div>Flight: {shipment.routing.returnFlight.flightNumber}</div>
                              )}
                              {shipment.routing.returnFlight.airline && (
                                <div>Airline: {shipment.routing.returnFlight.airline}</div>
                              )}
                              {shipment.routing.returnFlight.arrivalTime && (
                                <div>Arrival: {formatDate(shipment.routing.returnFlight.arrivalTime)}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tracking">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h3>
                    <p className="text-gray-600 mb-6">Generate tracking update messages for customers.</p>
                  </div>

                  <TrackingMessageGenerator
                    shipmentId={shipment._id}
                    serviceType={shipment.serviceType}
                    status={shipment.currentStatus}
                    language="en"
                    shipmentData={{
                      shipmentNumber: shipment.shipmentNumber,
                      customerName: shipment.customer.companyName,
                      customerCompany: shipment.customer.companyName,
                      origin: `${shipment.origin.city}, ${shipment.origin.country}`,
                      destination: `${shipment.destination.city}, ${shipment.destination.country}`,
                      awbNumber: shipment.awbNumber,
                      hawbNumber: undefined, // HAWB/MAWB are tracked in documentStatus, not as separate numbers
                      mawbNumber: undefined,
                      courierName: shipment.courier ? `${shipment.courier.firstName} ${shipment.courier.lastName}` : undefined,
                      courierPhone: shipment.courier?.phone,
                      partnerName: shipment.partner?.companyName,
                      partnerContact: undefined, // Partner contact is nested in primaryContact
                      pickupTime: shipment.pickupTime,
                      deliveryTime: shipment.deliveryTime,
                      estimatedArrival: undefined, // Use deliveryTime instead
                      flightNumber: shipment.routing?.outboundFlight?.flightNumber,
                      notes: shipment.specialInstructions,
                    }}
                  />

                  {/* Language Toggle for German */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">German Version</h4>
                    <TrackingMessageGenerator
                      shipmentId={shipment._id}
                      serviceType={shipment.serviceType}
                      status={shipment.currentStatus}
                      language="de"
                      shipmentData={{
                        shipmentNumber: shipment.shipmentNumber,
                        customerName: shipment.customer.companyName,
                        customerCompany: shipment.customer.companyName,
                        origin: `${shipment.origin.city}, ${shipment.origin.country}`,
                        destination: `${shipment.destination.city}, ${shipment.destination.country}`,
                        awbNumber: shipment.awbNumber,
                        hawbNumber: undefined, // HAWB/MAWB are tracked in documentStatus, not as separate numbers
                        mawbNumber: undefined,
                        courierName: shipment.courier ? `${shipment.courier.firstName} ${shipment.courier.lastName}` : undefined,
                        courierPhone: shipment.courier?.phone,
                        partnerName: shipment.partner?.companyName,
                        partnerContact: undefined, // Partner contact is nested in primaryContact
                        pickupTime: shipment.pickupTime,
                        deliveryTime: shipment.deliveryTime,
                        estimatedArrival: undefined, // Use deliveryTime instead
                        flightNumber: shipment.routing?.outboundFlight?.flightNumber,
                        notes: shipment.specialInstructions,
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Shipment Documents</h3>
                    {(shipment as any).documentStatus?.lastUpdated && (
                      <div className="text-sm text-gray-500">
                        Last updated: {formatDate((shipment as any).documentStatus.lastUpdated)}
                      </div>
                    )}
                  </div>

                  {(shipment as any).documentStatus ? (
                    <div className="space-y-6">
                      {/* Document Status Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* AWB - Always shown */}
                        <Card className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">AWB</h4>
                              <Badge
                                variant={
                                  (shipment as any).documentStatus.awb === 'complete' ? 'success' :
                                  (shipment as any).documentStatus.awb === 'pending' ? 'warning' :
                                  'danger'
                                }
                                size="sm"
                              >
                                {(shipment as any).documentStatus.awb === 'complete' ? '✓ Complete' :
                                 (shipment as any).documentStatus.awb === 'pending' ? '⏳ Pending' :
                                 '❌ Missing'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">Air Waybill</p>
                            {shipment.awbNumber && (
                              <div className="text-xs font-mono text-gray-700 bg-gray-50 p-2 rounded">
                                {shipment.awbNumber}
                              </div>
                            )}
                          </div>
                        </Card>

                        {/* HAWB - NFO only */}
                        {shipment.serviceType === 'NFO' && (shipment as any).documentStatus.hawb && (
                          <Card className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">HAWB</h4>
                                <Badge
                                  variant={
                                    (shipment as any).documentStatus.hawb === 'complete' ? 'success' :
                                    (shipment as any).documentStatus.hawb === 'pending' ? 'warning' :
                                    'danger'
                                  }
                                  size="sm"
                                >
                                  {(shipment as any).documentStatus.hawb === 'complete' ? '✓ Complete' :
                                   (shipment as any).documentStatus.hawb === 'pending' ? '⏳ Pending' :
                                   '❌ Missing'}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">House Air Waybill</p>
                            </div>
                          </Card>
                        )}

                        {/* MAWB - NFO only */}
                        {shipment.serviceType === 'NFO' && (shipment as any).documentStatus.mawb && (
                          <Card className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">MAWB</h4>
                                <Badge
                                  variant={
                                    (shipment as any).documentStatus.mawb === 'complete' ? 'success' :
                                    (shipment as any).documentStatus.mawb === 'pending' ? 'warning' :
                                    'danger'
                                  }
                                  size="sm"
                                >
                                  {(shipment as any).documentStatus.mawb === 'complete' ? '✓ Complete' :
                                   (shipment as any).documentStatus.mawb === 'pending' ? '⏳ Pending' :
                                   '❌ Missing'}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">Master Air Waybill</p>
                            </div>
                          </Card>
                        )}

                        {/* POD - Always shown */}
                        <Card className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">POD</h4>
                              <Badge
                                variant={
                                  (shipment as any).documentStatus.pod === 'complete' ? 'success' :
                                  (shipment as any).documentStatus.pod === 'pending' ? 'warning' :
                                  'danger'
                                }
                                size="sm"
                              >
                                {(shipment as any).documentStatus.pod === 'complete' ? '✓ Complete' :
                                 (shipment as any).documentStatus.pod === 'pending' ? '⏳ Pending' :
                                 '❌ Missing'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">Proof of Delivery</p>
                          </div>
                        </Card>
                      </div>

                      {/* Document Progress Summary */}
                      <Card className="p-6 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-4">Document Completion Status</h4>

                        <div className="space-y-3">
                          {/* Calculate completion percentage */}
                          {(() => {
                            const docStatus = (shipment as any).documentStatus
                            const docs = [
                              docStatus.awb,
                              ...(shipment.serviceType === 'NFO' ? [docStatus.hawb, docStatus.mawb].filter(Boolean) : []),
                              docStatus.pod
                            ]
                            const totalDocs = docs.length
                            const completeDocs = docs.filter((status: string) => status === 'complete').length
                            const pendingDocs = docs.filter((status: string) => status === 'pending').length
                            const missingDocs = docs.filter((status: string) => status === 'missing').length
                            const percentage = Math.round((completeDocs / totalDocs) * 100)

                            return (
                              <>
                                <div className="relative pt-1">
                                  <div className="flex mb-2 items-center justify-between">
                                    <div>
                                      <span className="text-xs font-semibold inline-block text-blue-600">
                                        {percentage}% Complete
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-semibold inline-block text-gray-600">
                                        {completeDocs} of {totalDocs} documents
                                      </span>
                                    </div>
                                  </div>
                                  <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
                                    <div
                                      style={{ width: `${percentage}%` }}
                                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                                    />
                                  </div>
                                </div>

                                {/* Status breakdown */}
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="text-2xl font-bold text-green-600">{completeDocs}</div>
                                    <div className="text-xs text-gray-600 mt-1">Complete</div>
                                  </div>
                                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="text-2xl font-bold text-yellow-600">{pendingDocs}</div>
                                    <div className="text-xs text-gray-600 mt-1">Pending</div>
                                  </div>
                                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="text-2xl font-bold text-red-600">{missingDocs}</div>
                                    <div className="text-xs text-gray-600 mt-1">Missing</div>
                                  </div>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </Card>

                      {/* Document Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Document Details</h4>

                        <div className="grid grid-cols-1 gap-4">
                          {/* AWB Details */}
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">Air Waybill (AWB)</h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  Primary shipping document that serves as a contract of carriage between the shipper and carrier.
                                </p>
                                {shipment.awbNumber && (
                                  <div className="mt-2">
                                    <span className="text-sm text-gray-500">Number: </span>
                                    <span className="text-sm font-mono text-gray-900">{shipment.awbNumber}</span>
                                  </div>
                                )}
                              </div>
                              <Badge
                                variant={
                                  (shipment as any).documentStatus.awb === 'complete' ? 'success' :
                                  (shipment as any).documentStatus.awb === 'pending' ? 'warning' :
                                  'danger'
                                }
                              >
                                {(shipment as any).documentStatus.awb}
                              </Badge>
                            </div>
                          </div>

                          {/* HAWB Details - NFO only */}
                          {shipment.serviceType === 'NFO' && (shipment as any).documentStatus.hawb && (
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900">House Air Waybill (HAWB)</h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Document issued by a freight forwarder to their client for NFO shipments.
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    (shipment as any).documentStatus.hawb === 'complete' ? 'success' :
                                    (shipment as any).documentStatus.hawb === 'pending' ? 'warning' :
                                    'danger'
                                  }
                                >
                                  {(shipment as any).documentStatus.hawb}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* MAWB Details - NFO only */}
                          {shipment.serviceType === 'NFO' && (shipment as any).documentStatus.mawb && (
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900">Master Air Waybill (MAWB)</h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Document issued by the main carrier covering the entire shipment from origin to destination.
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    (shipment as any).documentStatus.mawb === 'complete' ? 'success' :
                                    (shipment as any).documentStatus.mawb === 'pending' ? 'warning' :
                                    'danger'
                                  }
                                >
                                  {(shipment as any).documentStatus.mawb}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* POD Details */}
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">Proof of Delivery (POD)</h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  Document signed by the recipient confirming successful delivery of the shipment.
                                </p>
                                {shipment.deliveryTime && (shipment as any).documentStatus.pod === 'complete' && (
                                  <div className="mt-2">
                                    <span className="text-sm text-gray-500">Delivered: </span>
                                    <span className="text-sm text-gray-900">
                                      {formatDate(typeof shipment.deliveryTime === 'number' ? shipment.deliveryTime : (shipment.deliveryTime as any).scheduled)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Badge
                                variant={
                                  (shipment as any).documentStatus.pod === 'complete' ? 'success' :
                                  (shipment as any).documentStatus.pod === 'pending' ? 'warning' :
                                  'danger'
                                }
                              >
                                {(shipment as any).documentStatus.pod}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Reminder */}
                      {(() => {
                        const docStatus = (shipment as any).documentStatus
                        const hasMissing = [
                          docStatus.awb,
                          ...(shipment.serviceType === 'NFO' ? [docStatus.hawb, docStatus.mawb].filter(Boolean) : []),
                          docStatus.pod
                        ].some((status: string) => status === 'missing')

                        if (hasMissing) {
                          return (
                            <Alert variant="warning">
                              <AlertDescription>
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">⚠️</span>
                                  <div>
                                    <p className="font-medium">Missing Documents</p>
                                    <p className="text-sm mt-1">
                                      Some required documents are still missing. Please ensure all documents are collected and uploaded
                                      before marking the shipment as complete.
                                    </p>
                                  </div>
                                </div>
                              </AlertDescription>
                            </Alert>
                          )
                        }
                        return null
                      })()}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        <div className="text-center py-8">
                          <div className="text-gray-500 mb-2">📄</div>
                          <p className="text-gray-600">
                            No document tracking information available for this shipment.
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Document status will be tracked automatically when the shipment is created or updated.
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Status History</h3>
                  </div>

                  {isLoadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Loading size="md" />
                    </div>
                  ) : statusHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Updated By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statusHistory.map((history) => (
                          <TableRow key={history._id}>
                            <TableCell>
                              <Badge variant={getStatusVariant(history.status)} size="sm">
                                {SHIPMENT_STATUS_LABELS[history.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(history.timestamp)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {history.location || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {history.notes || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {(history as any).updatedByUser?.name || 'Unknown'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No status history available
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

        {/* Comments Section */}
        <CommentsSection
          entityType="yourobc_shipment"
          entityId={shipmentId}
          title="Shipment Notes & Updates"
          showInternalComments={true}
        />
        </Card>

        {/* Reminders Section */}
        <RemindersSection
          entityType="yourobc_shipment"
          entityId={shipmentId}
          title="Shipment Reminders"
          status="pending"
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="Delete Shipment?"
          entityName={shipment?.shipmentNumber}
          description="This will permanently delete the shipment record and all associated data including status history. This action cannot be undone."
        />

        {/* Completion Popup */}
        {shipment && (
          <CompletionPopup
            shipment={shipment}
            open={showCompletionPopup}
            onOpenChange={setShowCompletionPopup}
            onSuccess={() => {
              if (refetch) refetch()
            }}
          />
        )}

        {/* Wiki Sidebar */}
        <WikiSidebar category="Shipments" title="Shipment Wiki Helper" />
      </div>
    </div>
  )
}