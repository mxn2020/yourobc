// src/features/yourobc/mobile/components/MobileStatusUpdate.tsx

import { FC, useState, useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { ShipmentId, Shipment } from '@/features/yourobc/shipments/types'
import { Button, Badge } from '@/components/ui'
import { useClipboard, useShare } from '../hooks/useClipboard'
import { formatMobileStatus } from '../utils/mobileFormatters'
import { TrackingMessageGenerator } from '../../trackingMessages/components/TrackingMessageGenerator'
import { useToast } from '@/features/system/notifications'

type ShipmentStatus = Shipment['currentStatus']

interface MobileStatusUpdateProps {
  shipmentId: ShipmentId
  onClose: () => void
  onSuccess?: () => void
}

export const MobileStatusUpdate: FC<MobileStatusUpdateProps> = ({
  shipmentId,
  onClose,
  onSuccess,
}) => {
  const toast = useToast()
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showTracking, setShowTracking] = useState(false)

  const { copy, copied } = useClipboard()
  const { share, canShare } = useShare()

  // Fetch shipment details
  const shipment = useQuery(api.lib.yourobc.shipments.queries.getShipment, {
    authUserId: 'system', // TODO: Get from auth context
    shipmentId,
  })

  // Update status mutation
  const updateStatus = useMutation(api.lib.yourobc.shipments.mutations.updateShipmentStatus)

  // Common status transitions
  const statusOptions: Array<{ value: ShipmentStatus; label: string; icon: string; color: 'success' | 'primary' | 'warning' }> = [
    { value: 'quoted', label: 'Quoted', icon: '💰', color: 'primary' as const },
    { value: 'booked', label: 'Booked', icon: '📅', color: 'primary' as const },
    { value: 'pickup', label: 'Picked Up', icon: '📦', color: 'warning' as const },
    { value: 'in_transit', label: 'In Transit', icon: '✈️', color: 'primary' as const },
    { value: 'customs', label: 'Customs', icon: '🛃', color: 'warning' as const },
    { value: 'document', label: 'POD Attached', icon: '📄', color: 'success' as const },
    { value: 'delivered', label: 'Delivered', icon: '✅', color: 'success' as const },
    { value: 'invoiced', label: 'Invoiced', icon: '💵', color: 'success' as const },
  ]

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return

    setIsUpdating(true)
    try {
      await updateStatus({
        authUserId: 'system', // TODO: Get from auth context
        shipmentId,
        status: selectedStatus,
        notes: `Status updated via mobile`,
      })

      toast.success('Status updated successfully!')
      setShowTracking(true)
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCopyTracking = async (text: string) => {
    await copy(text, {
      successMessage: 'Tracking text copied! Ready to send.',
    })
  }

  const handleShareTracking = async (text: string) => {
    await share(
      {
        title: 'Shipment Update',
        text: text,
      },
      true
    )
  }

  if (!shipment) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      {/* Modal */}
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Update Status</h2>
            <div className="text-sm text-gray-600">#{shipment.shipmentNumber}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!showTracking ? (
            <>
              {/* Current Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Current Status</div>
                <Badge variant="secondary" size="sm">
                  {formatMobileStatus(shipment.currentStatus)}
                </Badge>
              </div>

              {/* Status Options */}
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-900 mb-3">Select New Status</div>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((option) => {
                    const isSelected = selectedStatus === option.value
                    const isCurrent = shipment.currentStatus === option.value

                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedStatus(option.value)}
                        disabled={isCurrent}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all
                          ${
                            isCurrent
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{option.icon}</span>
                          <span className="font-medium text-gray-900">{option.label}</span>
                        </div>
                        {isCurrent && (
                          <div className="text-xs text-gray-500">Current status</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Update Button */}
              <Button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || isUpdating}
                variant="primary"
                className="w-full py-4 text-base font-medium"
              >
                {isUpdating ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Status Updated Successfully!
                </div>
                <div className="text-sm text-green-600">
                  Now you can copy the tracking text to send to your customer.
                </div>
              </div>

              {/* Tracking Text Generator */}
              <div className="mb-6">
                <TrackingMessageGenerator
                  shipmentId={shipmentId}
                  serviceType={shipment.serviceType}
                  status={selectedStatus || shipment.currentStatus}
                  language="en"
                  shipmentData={{
                    shipmentNumber: shipment.shipmentNumber,
                    customerName: shipment.customer?.companyName || 'Customer',
                    origin: `${shipment.origin.city}, ${shipment.origin.country}`,
                    destination: `${shipment.destination.city}, ${shipment.destination.country}`,
                    awbNumber: shipment.awbNumber,
                    hawbNumber: shipment.awbNumber,
                    mawbNumber: shipment.awbNumber,
                    courierName: shipment.courier ? `${shipment.courier.firstName} ${shipment.courier.lastName}` : undefined,
                    partnerName: shipment.partner?.companyName,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {canShare && (
                  <Button
                    onClick={() => handleShareTracking('Tracking text here')}
                    variant="primary"
                    className="w-full py-4 text-base font-medium"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share via WhatsApp/Email
                  </Button>
                )}

                <Button
                  onClick={onClose}
                  variant="secondary"
                  className="w-full py-4 text-base font-medium"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Bottom Safe Area */}
        <div className="h-8" />
      </div>
    </div>
  )
}
