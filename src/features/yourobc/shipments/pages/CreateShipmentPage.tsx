// src/features/yourobc/shipments/pages/CreateShipmentPage.tsx

import { FC } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ShipmentForm } from '../components/ShipmentForm'
import { useShipments, useShipment } from '../hooks/useShipments'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { Card, Alert, AlertDescription, Loading } from '@/components/ui'
import type { ShipmentFormData, ShipmentId } from '../types'

interface CreateShipmentPageProps {
  shipmentId?: ShipmentId
  mode?: 'create' | 'edit'
  prefilledCustomerId?: string
  prefilledQuoteId?: string
}

export const CreateShipmentPage: FC<CreateShipmentPageProps> = ({
  shipmentId,
  mode = 'create',
  prefilledCustomerId,
  prefilledQuoteId,
}) => {
  const navigate = useNavigate()
  const toast = useToast()

  const { shipment, isLoading: isLoadingShipment } = useShipment(shipmentId)

  const { createShipment, updateShipment, isCreating, isUpdating } = useShipments()

  const handleSubmit = async (formData: ShipmentFormData) => {
    try {
      if (mode === 'edit' && shipmentId) {
        await updateShipment(shipmentId, formData)
        toast.success(`Shipment ${formData.shipmentNumber || shipmentId} updated successfully!`)
        navigate({ to: '/yourobc/shipments/$shipmentId', params: { shipmentId } })
      } else {
        const newShipmentId = await createShipment(formData)
        toast.success(`Shipment created successfully!`)
        navigate({ to: '/yourobc/shipments/$shipmentId', params: { shipmentId: newShipmentId } })
      }
    } catch (error: any) {
      console.error('Shipment operation error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('Form validation failed on server side')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to create/update shipments')
      } else if (code === 'DUPLICATE_SHIPMENT') {
        toast.error('A shipment with this number already exists')
      }
    }
  }

  const handleCancel = () => {
    if (mode === 'edit' && shipmentId) {
      navigate({ to: '/yourobc/shipments/$shipmentId', params: { shipmentId } })
    } else {
      navigate({ to: '/yourobc/shipments' })
    }
  }

  if (mode === 'edit' && (isLoadingShipment || !shipment)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {isLoadingShipment ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <Card>
              <div className="text-center py-12 p-6">
                <div className="text-red-500 text-lg mb-4">Shipment Not Found</div>
                <p className="text-gray-500 mb-4">
                  The shipment you are trying to edit does not exist or has been deleted.
                </p>
                <Link
                  to="/yourobc/shipments"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Shipments
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const pageTitle = mode === 'edit'
    ? `Edit Shipment ${shipment?.shipmentNumber}`
    : 'Create New Shipment'
  const breadcrumbText = mode === 'edit'
    ? `${shipment?.shipmentNumber} Details`
    : 'Shipments'
  const breadcrumbPath = mode === 'edit'
    ? `/yourobc/shipments/${shipmentId}`
    : '/yourobc/shipments'

  // Prepare initial data for prefilling
  const initialData = mode === 'edit' && shipment ? shipment : undefined

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            to={breadcrumbPath}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to {breadcrumbText}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-2">
            {mode === 'edit'
              ? 'Update shipment information and routing details'
              : 'Create a new shipment for customer delivery'}
          </p>
        </div>

        {/* Important Notes */}
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription>
            <div className="flex items-start gap-2">
              <div className="text-blue-600 text-lg">ℹ️</div>
              <div className="text-sm text-blue-800">
                <strong>Before creating a shipment:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Ensure customer information is complete and accurate</li>
                  <li>Verify origin and destination addresses</li>
                  <li>Confirm dimensions and weight specifications</li>
                  <li>Set realistic deadline based on service type</li>
                  <li>Include special handling instructions if required</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <div className="p-6">
            <ShipmentForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel={mode === 'edit' ? 'Update Shipment' : 'Create Shipment'}
              isLoading={isCreating || isUpdating}
              showAllFields={true}
            />
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Shipment Setup Best Practices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Service Type Selection:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>OBC (On Board Courier):</strong> Hand-carried by courier, faster but more expensive
                  </li>
                  <li>
                    <strong>NFO (Next Flight Out):</strong> Cargo service, cost-effective for larger items
                  </li>
                  <li>Choose based on urgency, size, and budget constraints</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Priority Levels:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Standard:</strong> Normal processing and delivery timeline
                  </li>
                  <li>
                    <strong>Urgent:</strong> Expedited processing, closer monitoring
                  </li>
                  <li>
                    <strong>Critical:</strong> Highest priority, immediate attention required
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Dimensions & Weight:</h4>
                <ul className="space-y-1">
                  <li>• Measure all dimensions accurately (L×W×H)</li>
                  <li>• Include packaging in weight calculations</li>
                  <li>• Consider dimensional weight for pricing</li>
                  <li>• Note any fragile or special handling requirements</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Deadlines & SLA:</h4>
                <ul className="space-y-1">
                  <li>• Set realistic deadlines based on route complexity</li>
                  <li>• Factor in customs clearance time</li>
                  <li>• Consider time zone differences</li>
                  <li>• Account for potential delays (weather, strikes)</li>
                </ul>
              </div>
            </div>

            <Alert variant="warning" className="mt-4">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> Once a shipment is created and moves beyond "quoted" status,
                    some fields become read-only to maintain data integrity. Review all information
                    carefully before saving.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    </div>
  )
}