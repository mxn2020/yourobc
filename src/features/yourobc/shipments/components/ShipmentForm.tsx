// src/features/yourobc/shipments/components/ShipmentForm.tsx

import { FC, useState } from 'react'
import { useToast } from '@/features/system/notifications'
import { useShipmentForm } from '../hooks/useShipments'
import { useCustomer } from '../../customers/hooks/useCustomers'
import { CustomerSearch } from '../../customers/components/CustomerSearch'
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
} from '@/components/ui'
import { 
  SHIPMENT_CONSTANTS, 
  SERVICE_TYPE_LABELS, 
  PRIORITY_LABELS,
  DIMENSION_UNITS,
  WEIGHT_UNITS,
  COMMON_AIRLINES,
} from '../types'
import type { ShipmentFormData, Shipment } from '../types'

interface ShipmentFormProps {
  initialData?: Partial<Shipment>
  onSubmit: (data: ShipmentFormData) => void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
  showAllFields?: boolean
}

const COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'GB', name: 'United Kingdom' },
]

export const ShipmentForm: FC<ShipmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Shipment',
  isLoading = false,
  showAllFields = true,
}) => {
  const toast = useToast()

  const { formData, errors, isDirty, updateField, validateForm, setFormData } = useShipmentForm(
    initialData
      ? {
          shipmentNumber: initialData.shipmentNumber,
          awbNumber: initialData.awbNumber,
          customerReference: initialData.customerReference,
          customerId: initialData.customerId,
          serviceType: initialData.serviceType || 'OBC',
          priority: initialData.priority || 'standard',
          origin: initialData.origin,
          destination: initialData.destination,
          dimensions: initialData.dimensions,
          description: initialData.description || '',
          specialInstructions: initialData.specialInstructions,
          deadline: initialData.sla?.deadline || Date.now() + (24 * 60 * 60 * 1000),
          assignedCourierId: initialData.assignedCourierId,
          courierInstructions: initialData.courierInstructions,
          partnerId: initialData.partnerId,
          partnerReference: initialData.partnerReference,
          routing: initialData.routing,
          agreedPrice: initialData.agreedPrice || { amount: 0, currency: 'EUR' },
          actualCosts: initialData.actualCosts,
        }
      : undefined
  )

  // Fetch selected customer details (always call hook, just pass undefined if no customer)
  const { customer: selectedCustomer } = useCustomer(formData.customerId || undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    onSubmit(formData)
  }

  const handleNestedUpdate = (path: string, value: any) => {
    const pathParts = path.split('.')
    setFormData((prev) => {
      const newData = { ...prev }
      let current = newData as any

      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {}
        }
        current = current[pathParts[i]]
      }

      current[pathParts[pathParts.length - 1]] = value
      return newData
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Selection */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Selection
            <span className="text-red-500 ml-1">*</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Select the customer for this shipment.
          </p>

          <CustomerSearch
            onSelect={(customer) => updateField('customerId', customer?._id)}
            selectedCustomer={selectedCustomer}
            placeholder="Search and select customer..."
          />
          {errors.customerId && (
            <p className="text-red-600 text-sm mt-1">{errors.customerId}</p>
          )}
        </div>
      </Card>

      {/* Basic Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Shipment Number"
              value={formData.shipmentNumber || ''}
              onChange={(e) => updateField('shipmentNumber', e.target.value)}
              error={errors.shipmentNumber}
              placeholder="Auto-generated if empty"
              maxLength={SHIPMENT_CONSTANTS.LIMITS.MAX_SHIPMENT_NUMBER_LENGTH}
            />

            <Input
              label="AWB Number"
              value={formData.awbNumber || ''}
              onChange={(e) => updateField('awbNumber', e.target.value)}
              error={errors.awbNumber}
              placeholder="Air Waybill number"
              maxLength={SHIPMENT_CONSTANTS.LIMITS.MAX_AWB_NUMBER_LENGTH}
            />

            <Input
              label="Customer Reference"
              value={formData.customerReference || ''}
              onChange={(e) => updateField('customerReference', e.target.value)}
              error={errors.customerReference}
              placeholder="Customer's reference number"
              maxLength={SHIPMENT_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH}
            />

            <div>
              <Label required>Service Type</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => updateField('serviceType', value as 'OBC' | 'NFO')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OBC">{SERVICE_TYPE_LABELS.OBC}</SelectItem>
                  <SelectItem value="NFO">{SERVICE_TYPE_LABELS.NFO}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority || 'standard'}
                onValueChange={(value) => updateField('priority', value as 'standard' | 'urgent' | 'critical')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{PRIORITY_LABELS.standard}</SelectItem>
                  <SelectItem value="urgent">{PRIORITY_LABELS.urgent}</SelectItem>
                  <SelectItem value="critical">{PRIORITY_LABELS.critical}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label required>Deadline</Label>
              <DateTimePicker
                value={new Date(formData.deadline)}
                onChange={(date) => updateField('deadline', date?.getTime())}
                min={new Date()}
              />
              {errors.deadline && (
                <p className="text-red-600 text-sm mt-1">{errors.deadline}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Description & Instructions</h3>

          <div className="space-y-6">
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              error={errors.description}
              placeholder="Describe the shipment contents and requirements"
              maxLength={SHIPMENT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH}
              rows={3}
              required
            />

            <Textarea
              label="Special Instructions"
              value={formData.specialInstructions || ''}
              onChange={(e) => updateField('specialInstructions', e.target.value)}
              placeholder="Any special handling or delivery instructions"
              maxLength={SHIPMENT_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH}
              rows={2}
            />

            <Textarea
              label="Courier Instructions"
              value={formData.courierInstructions || ''}
              onChange={(e) => updateField('courierInstructions', e.target.value)}
              placeholder="Specific instructions for the assigned courier"
              maxLength={SHIPMENT_CONSTANTS.LIMITS.MAX_COURIER_INSTRUCTIONS_LENGTH}
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Origin & Destination */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Origin & Destination</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Origin */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">📍 Origin</h4>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  value={formData.origin.street || ''}
                  onChange={(e) => handleNestedUpdate('origin.street', e.target.value)}
                  placeholder="Street address (optional)"
                />

                <Input
                  label="City"
                  value={formData.origin.city}
                  onChange={(e) => handleNestedUpdate('origin.city', e.target.value)}
                  placeholder="City name"
                  required
                />

                <Input
                  label="Postal Code"
                  value={formData.origin.postalCode || ''}
                  onChange={(e) => handleNestedUpdate('origin.postalCode', e.target.value)}
                  placeholder="Postal/ZIP code"
                />

                <div>
                  <Label required>Country</Label>
                  <Select
                    value={formData.origin.countryCode}
                    onValueChange={(value) => {
                      const country = COUNTRIES.find((c) => c.code === value)
                      handleNestedUpdate('origin.countryCode', value)
                      handleNestedUpdate('origin.country', country?.name || value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">🎯 Destination</h4>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  value={formData.destination.street || ''}
                  onChange={(e) => handleNestedUpdate('destination.street', e.target.value)}
                  placeholder="Street address (optional)"
                />

                <Input
                  label="City"
                  value={formData.destination.city}
                  onChange={(e) => handleNestedUpdate('destination.city', e.target.value)}
                  placeholder="City name"
                  required
                />

                <Input
                  label="Postal Code"
                  value={formData.destination.postalCode || ''}
                  onChange={(e) => handleNestedUpdate('destination.postalCode', e.target.value)}
                  placeholder="Postal/ZIP code"
                />

                <div>
                  <Label required>Country</Label>
                  <Select
                    value={formData.destination.countryCode}
                    onValueChange={(value) => {
                      const country = COUNTRIES.find((c) => c.code === value)
                      handleNestedUpdate('destination.countryCode', value)
                      handleNestedUpdate('destination.country', country?.name || value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Dimensions & Weight */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dimensions & Weight</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Input
              label="Length"
              type="number"
              min="0.1"
              max="10000"
              step="0.1"
              value={formData.dimensions.length}
              onChange={(e) => handleNestedUpdate('dimensions.length', parseFloat(e.target.value))}
              placeholder="Length"
              required
            />

            <Input
              label="Width"
              type="number"
              min="0.1"
              max="10000"
              step="0.1"
              value={formData.dimensions.width}
              onChange={(e) => handleNestedUpdate('dimensions.width', parseFloat(e.target.value))}
              placeholder="Width"
              required
            />

            <Input
              label="Height"
              type="number"
              min="0.1"
              max="10000"
              step="0.1"
              value={formData.dimensions.height}
              onChange={(e) => handleNestedUpdate('dimensions.height', parseFloat(e.target.value))}
              placeholder="Height"
              required
            />

            <Input
              label="Weight"
              type="number"
              min="0.1"
              max="1000"
              step="0.1"
              value={formData.dimensions.weight}
              onChange={(e) => handleNestedUpdate('dimensions.weight', parseFloat(e.target.value))}
              placeholder="Weight"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dimension Unit</Label>
              <Select
                value={formData.dimensions.unit}
                onValueChange={(value) => handleNestedUpdate('dimensions.unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSION_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Weight Unit</Label>
              <Select
                value={formData.dimensions.weightUnit}
                onValueChange={(value) => handleNestedUpdate('dimensions.weightUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEIGHT_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Agreed Price</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.agreedPrice.amount}
                  onChange={(e) => handleNestedUpdate('agreedPrice.amount', parseFloat(e.target.value))}
                  placeholder="0.00"
                  required
                />

                <div>
                  <Label>Currency</Label>
                  <Select
                    value={formData.agreedPrice.currency}
                    onValueChange={(value) => handleNestedUpdate('agreedPrice.currency', value)}
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
            </div>

            {showAllFields && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Actual Costs (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.actualCosts?.amount || ''}
                    onChange={(e) =>
                      handleNestedUpdate('actualCosts.amount', parseFloat(e.target.value))
                    }
                    placeholder="0.00"
                  />

                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={formData.actualCosts?.currency || 'EUR'}
                      onValueChange={(value) => handleNestedUpdate('actualCosts.currency', value)}
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
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Flight Details (Optional) */}
      {showAllFields && formData.serviceType === 'NFO' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Details (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Outbound Flight</h4>
                <div className="space-y-4">
                  <Input
                    label="Flight Number"
                    value={formData.routing?.outboundFlight?.flightNumber || ''}
                    onChange={(e) =>
                      handleNestedUpdate('routing.outboundFlight.flightNumber', e.target.value)
                    }
                    placeholder="e.g., LH441"
                    maxLength={SHIPMENT_CONSTANTS.LIMITS.MAX_FLIGHT_NUMBER_LENGTH}
                  />

                  <div>
                    <Label>Airline</Label>
                    <Select
                      value={formData.routing?.outboundFlight?.airline || ''}
                      onValueChange={(value) =>
                        handleNestedUpdate('routing.outboundFlight.airline', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select airline" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_AIRLINES.map((airline) => (
                          <SelectItem key={airline} value={airline}>
                            {airline}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Departure Time</Label>
                    <DateTimePicker
                      value={
                        formData.routing?.outboundFlight?.departureTime
                          ? new Date(formData.routing.outboundFlight.departureTime)
                          : undefined
                      }
                      onChange={(date) =>
                        handleNestedUpdate('routing.outboundFlight.departureTime', date?.getTime())
                      }
                      placeholder="Select departure time"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Return Flight (if applicable)</h4>
                <div className="space-y-4">
                  <Input
                    label="Flight Number"
                    value={formData.routing?.returnFlight?.flightNumber || ''}
                    onChange={(e) =>
                      handleNestedUpdate('routing.returnFlight.flightNumber', e.target.value)
                    }
                    placeholder="e.g., LH442"
                    maxLength={SHIPMENT_CONSTANTS.LIMITS.MAX_FLIGHT_NUMBER_LENGTH}
                  />

                  <div>
                    <Label>Airline</Label>
                    <Select
                      value={formData.routing?.returnFlight?.airline || ''}
                      onValueChange={(value) =>
                        handleNestedUpdate('routing.returnFlight.airline', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select airline" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_AIRLINES.map((airline) => (
                          <SelectItem key={airline} value={airline}>
                            {airline}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Arrival Time</Label>
                    <DateTimePicker
                      value={
                        formData.routing?.returnFlight?.arrivalTime
                          ? new Date(formData.routing.returnFlight.arrivalTime)
                          : undefined
                      }
                      onChange={(date) =>
                        handleNestedUpdate('routing.returnFlight.arrivalTime', date?.getTime())
                      }
                      placeholder="Select arrival time"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading || !isDirty}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}