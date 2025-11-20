// src/features/yourobc/shipments/components/StatusUpdateForm.tsx

import { FC, useState } from 'react'
import {
  Input,
  Textarea,
  Button,
  Card,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DateTimePicker,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { SHIPMENT_STATUS_LABELS, COMMON_AIRLINES } from '../types'
import type { StatusUpdateFormData, Shipment } from '../types'

interface StatusUpdateFormProps {
  shipment: Shipment
  onSubmit: (data: StatusUpdateFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export const StatusUpdateForm: FC<StatusUpdateFormProps> = ({
  shipment,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<StatusUpdateFormData>({
    status: shipment.currentStatus,
    location: '',
    notes: '',
    metadata: {},
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get allowed next statuses based on current status
  const getAllowedStatuses = (currentStatus: string): string[] => {
    const statusFlow = {
      quoted: ['booked', 'cancelled'],
      booked: ['pickup', 'cancelled'],
      pickup: ['in_transit', 'cancelled'],
      in_transit: ['delivered', 'cancelled'],
      delivered: ['document'],
      document: ['invoiced'],
      invoiced: [],
      cancelled: [],
    }

    return statusFlow[currentStatus as keyof typeof statusFlow] || []
  }

  const allowedStatuses = getAllowedStatuses(shipment.currentStatus)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.status) {
      newErrors.status = 'Status is required'
    }

    if (formData.status !== shipment.currentStatus && !allowedStatuses.includes(formData.status)) {
      newErrors.status = `Cannot change from ${shipment.currentStatus} to ${formData.status}`
    }

    // Validate specific status requirements
    if (formData.status === 'cancelled' && !formData.metadata?.cancellationReason) {
      newErrors.cancellationReason = 'Cancellation reason is required'
    }

    if (formData.status === 'delivered' && !formData.metadata?.podReceived) {
      newErrors.podReceived = 'Proof of delivery confirmation is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const updateMetadata = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const getStatusDescription = (status: string) => {
    const descriptions = {
      quoted: 'Initial quote provided to customer',
      booked: 'Customer accepted quote, shipment is confirmed',
      pickup: 'Courier collecting shipment from origin',
      in_transit: 'Shipment is en route to destination',
      customs: 'Shipment undergoing customs clearance',
      delivered: 'Shipment delivered to destination',
      document: 'Documentation and proof of delivery processing',
      invoiced: 'Final invoice sent to customer',
      cancelled: 'Shipment cancelled',
    }
    return descriptions[status as keyof typeof descriptions] || ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Shipment Status</h3>

          {/* Current Status Info */}
          <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription>
              <div className="text-sm text-blue-800">
                <strong>Current Status:</strong> {SHIPMENT_STATUS_LABELS[shipment.currentStatus]}
                <br />
                <span className="text-blue-600">{getStatusDescription(shipment.currentStatus)}</span>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* New Status */}
            <div>
              <Label required>New Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateField('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.length > 0 ? (
                    allowedStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {SHIPMENT_STATUS_LABELS[status as keyof typeof SHIPMENT_STATUS_LABELS]}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={shipment.currentStatus} disabled>
                      No status changes available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-600 text-sm mt-1">{errors.status}</p>
              )}
              {formData.status !== shipment.currentStatus && (
                <p className="text-sm text-gray-500 mt-1">
                  {getStatusDescription(formData.status)}
                </p>
              )}
            </div>

            {/* Location */}
            <Input
              label="Current Location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Current location of shipment (optional)"
              helpText="e.g., 'Frankfurt Airport', 'Customer facility', 'In transit to NYC'"
            />

            {/* General Notes */}
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional notes about this status update..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Status-specific fields */}
      {formData.status === 'in_transit' && (
        <Card>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Transit Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Flight Number"
                value={formData.metadata?.flightNumber || ''}
                onChange={(e) => updateMetadata('flightNumber', e.target.value)}
                placeholder="e.g., LH441"
              />

              <div>
                <Label>Estimated Arrival</Label>
                <DateTimePicker
                  value={
                    formData.metadata?.estimatedArrival
                      ? new Date(formData.metadata.estimatedArrival)
                      : undefined
                  }
                  onChange={(date) => updateMetadata('estimatedArrival', date?.getTime())}
                  placeholder="Select estimated arrival time"
                  min={new Date()}
                />
              </div>
            </div>

            {formData.metadata?.estimatedArrival && formData.metadata.estimatedArrival > shipment.sla.deadline && (
              <Alert variant="warning" className="mt-4">
                <AlertDescription>
                  ⚠️ Estimated arrival is after the deadline. Consider updating the customer.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}

      {formData.status === 'delivered' && (
        <Card>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Delivery Confirmation</h4>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="podReceived"
                  checked={formData.metadata?.podReceived || false}
                  onChange={(e) => updateMetadata('podReceived', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="podReceived" className="ml-2 text-sm font-medium text-gray-700">
                  Proof of delivery received
                </label>
              </div>
              {errors.podReceived && (
                <p className="text-red-600 text-sm">{errors.podReceived}</p>
              )}

              <Input
                label="Customer Signature"
                value={formData.metadata?.customerSignature || ''}
                onChange={(e) => updateMetadata('customerSignature', e.target.value)}
                placeholder="Name of person who signed for delivery"
              />
            </div>
          </div>
        </Card>
      )}

      {formData.status === 'cancelled' && (
        <Card>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Cancellation Details</h4>
            
            <Textarea
              label="Cancellation Reason"
              value={formData.metadata?.cancellationReason || ''}
              onChange={(e) => updateMetadata('cancellationReason', e.target.value)}
              placeholder="Explain why the shipment was cancelled..."
              rows={3}
              required
            />
            {errors.cancellationReason && (
              <p className="text-red-600 text-sm mt-1">{errors.cancellationReason}</p>
            )}
          </div>
        </Card>
      )}

      {formData.status === 'pickup' && (
        <Card>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Pickup Details</h4>
            
            <div className="space-y-4">
              <Input
                label="Courier Assignment"
                value={formData.metadata?.courierNumber || ''}
                onChange={(e) => updateMetadata('courierNumber', e.target.value)}
                placeholder="Courier ID or name"
              />

              <Textarea
                label="Pickup Notes"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any special notes about the pickup..."
                rows={2}
              />
            </div>
          </div>
        </Card>
      )}

      {(formData.status === 'document' || formData.status === 'invoiced') && (
        <Card>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Final Costs</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Actual Cost Amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.metadata?.actualCosts?.amount || ''}
                onChange={(e) => updateMetadata('actualCosts', {
                  ...formData.metadata?.actualCosts,
                  amount: parseFloat(e.target.value),
                  currency: formData.metadata?.actualCosts?.currency || 'EUR',
                })}
                placeholder="Final cost amount"
              />

              <div>
                <Label>Currency</Label>
                <Select
                  value={formData.metadata?.actualCosts?.currency || 'EUR'}
                  onValueChange={(value) => updateMetadata('actualCosts', {
                    ...formData.metadata?.actualCosts,
                    currency: value,
                    amount: formData.metadata?.actualCosts?.amount || 0,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Textarea
              label="Cost Notes"
              value={formData.metadata?.costNotes || ''}
              onChange={(e) => updateMetadata('costNotes', e.target.value)}
              placeholder="Explanation of final costs or variances..."
              rows={2}
              className="mt-4"
            />
          </div>
        </Card>
      )}

      {/* Deadline Extension */}
      {['pickup', 'in_transit'].includes(formData.status) && (
        <Card>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Deadline Management (Optional)</h4>
            
            <div className="space-y-4">
              <div>
                <Label>New Deadline</Label>
                <DateTimePicker
                  value={
                    formData.metadata?.newDeadline
                      ? new Date(formData.metadata.newDeadline)
                      : new Date(shipment.sla.deadline)
                  }
                  onChange={(date) => updateMetadata('newDeadline', date?.getTime())}
                  min={new Date()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current deadline: {new Date(shipment.sla.deadline).toLocaleString()}
                </p>
              </div>

              {formData.metadata?.newDeadline && formData.metadata.newDeadline !== shipment.sla.deadline && (
                <Textarea
                  label="Reason for Deadline Change"
                  value={formData.metadata?.reason || ''}
                  onChange={(e) => updateMetadata('reason', e.target.value)}
                  placeholder="Explain why the deadline needs to be changed..."
                  rows={2}
                />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Status'}
        </Button>
      </div>

      {/* Status Flow Helper */}
      <Card className="bg-gray-50">
        <div className="p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Status Flow</h5>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`px-2 py-1 rounded ${shipment.currentStatus === 'quoted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
              Quoted
            </span>
            <span className="text-gray-400">→</span>
            <span className={`px-2 py-1 rounded ${shipment.currentStatus === 'booked' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
              Booked
            </span>
            <span className="text-gray-400">→</span>
            <span className={`px-2 py-1 rounded ${shipment.currentStatus === 'pickup' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
              Pickup
            </span>
            <span className="text-gray-400">→</span>
            <span className={`px-2 py-1 rounded ${shipment.currentStatus === 'in_transit' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
              In Transit
            </span>
            <span className="text-gray-400">→</span>
            <span className={`px-2 py-1 rounded ${shipment.currentStatus === 'delivered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
              Delivered
            </span>
            <span className="text-gray-400">→</span>
            <span className={`px-2 py-1 rounded ${shipment.currentStatus === 'document' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
              Document
            </span>
            <span className="text-gray-400">→</span>
            <span className={`px-2 py-1 rounded ${shipment.currentStatus === 'invoiced' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
              Invoiced
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            You can also cancel at any stage before delivery
          </p>
        </div>
      </Card>
    </form>
  )
}