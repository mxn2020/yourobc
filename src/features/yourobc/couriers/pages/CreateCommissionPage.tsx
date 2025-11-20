// src/features/yourobc/couriers/pages/CreateCommissionPage.tsx

import { FC, useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { CommissionForm } from '../components/CommissionForm'
import { CourierSearch } from '../components/CourierSearch'
import { useCouriers, useCourierCommissions } from '../hooks/useCouriers'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import {
  Card,
  Alert,
  AlertDescription,
  Loading,
  Badge,
  Button,
} from '@/components/ui'
import type { CommissionFormData, CourierListItem, CourierId } from '../types'

interface CreateCommissionPageProps {
  preselectedCourierId?: CourierId
  preselectedShipmentId?: string
}

export const CreateCommissionPage: FC<CreateCommissionPageProps> = ({
  preselectedCourierId,
  preselectedShipmentId,
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const [selectedCourier, setSelectedCourier] = useState<CourierListItem | null>(null)
  const [showCourierSearch, setShowCourierSearch] = useState(!preselectedCourierId)

  const {
    commissions,
    isLoading: isLoadingCommissions,
    createCommission,
    isCreating,
  } = useCourierCommissions(selectedCourier?._id)

  // Load preselected courier if provided
  const { couriers } = useCouriers({
    filters: preselectedCourierId ? { search: preselectedCourierId } : undefined,
    limit: 1,
  })

  useEffect(() => {
    if (preselectedCourierId && couriers.length > 0 && !selectedCourier) {
      setSelectedCourier(couriers[0])
      setShowCourierSearch(false)
    }
  }, [preselectedCourierId, couriers, selectedCourier])

  const handleCourierSelect = (courier: CourierListItem) => {
    setSelectedCourier(courier)
    setShowCourierSearch(false)
  }

  const handleChangeCourier = () => {
    setSelectedCourier(null)
    setShowCourierSearch(true)
  }

  const handleSubmit = async (formData: CommissionFormData) => {
    if (!selectedCourier) {
      toast.error('Please select a courier first')
      return
    }

    try {
      const commissionData: CommissionFormData = {
        ...formData,
        courierId: selectedCourier._id,
      }

      await createCommission(commissionData)
      toast.success('Commission created successfully!')
      
      // Navigate to the courier's commission page
      navigate({
        to: '/yourobc/couriers/$courierId',
        params: { courierId: selectedCourier._id },
        hash: 'commissions',
      })
    } catch (error: any) {
      console.error('Commission creation error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('Form validation failed on server side')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to create commissions')
      } else if (code === 'DUPLICATE_COMMISSION') {
        toast.error('A commission already exists for this shipment')
      }
    }
  }

  const handleCancel = () => {
    if (selectedCourier) {
      navigate({
        to: '/yourobc/couriers/$courierId',
        params: { courierId: selectedCourier._id },
      })
    } else {
      navigate({ to: '/yourobc/couriers/commissions' })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  // Calculate courier commission stats
  const courierStats = commissions
    ? {
        total: commissions.length,
        pending: commissions.filter((c) => c.status === 'pending').length,
        pendingAmount: commissions
          .filter((c) => c.status === 'pending')
          .reduce((sum, c) => sum + c.commissionAmount, 0),
        totalAmount: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
      }
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/yourobc/couriers/commissions"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Commission Management
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Commission</h1>
          <p className="text-gray-600 mt-2">
            Create a commission payment for a courier based on a completed shipment
          </p>
        </div>

        {/* Courier Selection */}
        {showCourierSearch ? (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 1: Select Courier
              </h3>
              <CourierSearch
                onSelect={handleCourierSelect}
                placeholder="Search for courier by name, ID, email, or phone..."
                limit={10}
              />
              <p className="text-sm text-gray-500 mt-3">
                Type at least 2 characters to search for a courier
              </p>
            </div>
          </Card>
        ) : selectedCourier ? (
          <Card>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Selected Courier</h3>
                    <Badge
                      variant={
                        selectedCourier.status === 'available'
                          ? 'success'
                          : selectedCourier.status === 'busy'
                          ? 'warning'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {selectedCourier.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xl font-medium text-gray-900">
                      {selectedCourier.firstName} {selectedCourier.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {selectedCourier.courierNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      📧 {selectedCourier.email || 'No email'} • 📞 {selectedCourier.phone}
                    </div>
                  </div>

                  {/* Courier Commission Stats */}
                  {isLoadingCommissions ? (
                    <div className="mt-4">
                      <Loading size="sm" />
                    </div>
                  ) : courierStats ? (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Total Commissions</div>
                        <div className="text-lg font-bold text-gray-900">
                          {courierStats.total}
                        </div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-gray-600">Pending</div>
                        <div className="text-lg font-bold text-orange-600">
                          {courierStats.pending}
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">Total Earned</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(courierStats.totalAmount)}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <Button variant="ghost" onClick={handleChangeCourier} size="sm">
                  Change
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Commission Form */}
        {selectedCourier && (
          <>
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Step 2: Commission Details
                </h3>

                <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
                  <AlertDescription>
                    <div className="text-sm text-blue-800">
                      <strong>Note:</strong> You'll need the shipment ID to create this commission.
                      This ensures the commission is properly linked to the completed shipment.
                    </div>
                  </AlertDescription>
                </Alert>

                <CommissionForm
                  initialData={{
                    courierId: selectedCourier._id,
                    shipmentId: preselectedShipmentId || '',
                    type: 'percentage',
                    rate: 15,
                    baseAmount: 0,
                  }}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  submitLabel="Create Commission"
                  isLoading={isCreating}
                />
              </div>
            </Card>

            {/* Important Notes */}
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Verify the shipment number before creating the commission</li>
                      <li>Ensure the base amount matches the agreed shipment revenue</li>
                      <li>Double-check the commission rate for this courier</li>
                      <li>Only one commission can be created per shipment</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Help Section */}
        <Card className="bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Commission Creation Guide
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Commission Types:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Percentage:</strong> Commission calculated as % of base amount (e.g.,
                    15% of €1000 = €150)
                  </li>
                  <li>
                    <strong>Fixed Amount:</strong> Commission is a fixed amount regardless of
                    shipment value
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Base Amount:</h4>
                <ul className="space-y-1">
                  <li>• Should match the shipment revenue or agreed amount</li>
                  <li>• Include any applicable fees or surcharges</li>
                  <li>• Verify amount with finance before submitting</li>
                  <li>• Use the same currency as the shipment</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Common Commission Rates:</h4>
                <ul className="space-y-1">
                  <li>• Standard OBC: 10-15%</li>
                  <li>• NFO Service: 8-12%</li>
                  <li>• Urgent/Critical: 15-20%</li>
                  <li>• International: 12-18%</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Before Creating:</h4>
                <ul className="space-y-1">
                  <li>✓ Shipment has been completed and delivered</li>
                  <li>✓ Customer has been invoiced</li>
                  <li>✓ Courier's work has been verified</li>
                  <li>✓ No existing commission for this shipment</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}