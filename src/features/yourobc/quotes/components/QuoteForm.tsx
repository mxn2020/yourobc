// src/features/yourobc/quotes/components/QuoteForm.tsx

import { FC, useEffect } from 'react'
import { useToast } from '@/features/system/notifications'
import { useQuoteForm } from '../hooks/useQuotes'
import { useCustomer } from '../../customers/hooks/useCustomers'
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
} from '@/components/ui'
import { CustomerSearch } from '../../customers/components/CustomerSearch'
import { CourierSearch } from '../../couriers/components/CourierSearch'
import { 
  QUOTE_CONSTANTS, 
  SERVICE_TYPE_LABELS, 
  PRIORITY_LABELS, 
  COMMON_COUNTRIES,
  DIMENSION_UNITS,
  WEIGHT_UNITS,
  CURRENCY_SYMBOLS,
} from '../types'
import type { QuoteFormData, Quote } from '../types'

interface QuoteFormProps {
  initialData?: Partial<Quote> | null
  onSubmit: (data: QuoteFormData) => void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
  showAllFields?: boolean
}

export const QuoteForm: FC<QuoteFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Quote',
  isLoading = false,
  showAllFields = true,
}) => {
  const toast = useToast()

  const {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    calculatePricing,
    setFormData
  } = useQuoteForm(
    initialData
      ? {
          customerReference: initialData.customerReference,
          serviceType: initialData.serviceType || 'OBC',
          priority: initialData.priority || 'standard',
          customerId: initialData.customerId || undefined,
          inquirySourceId: initialData.inquirySourceId,
          origin: initialData.origin || { city: '', country: '', countryCode: '' },
          destination: initialData.destination || { city: '', country: '', countryCode: '' },
          dimensions: initialData.dimensions || {
            length: 0, width: 0, height: 0, weight: 0, unit: 'cm', weightUnit: 'kg'
          },
          description: initialData.description || '',
          specialInstructions: initialData.specialInstructions,
          deadline: initialData.deadline || Date.now() + (7 * 24 * 60 * 60 * 1000),
          assignedCourierId: initialData.assignedCourierId,
          baseCost: initialData.baseCost,
          markup: initialData.markup || QUOTE_CONSTANTS.DEFAULT_VALUES.MARKUP,
          totalPrice: initialData.totalPrice,
          validUntil: initialData.validUntil || Date.now() + (14 * 24 * 60 * 60 * 1000),
          quoteText: initialData.quoteText,
          notes: initialData.notes,
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

  // Auto-calculate total price when base cost or markup changes
  useEffect(() => {
    const pricing = calculatePricing()
    if (pricing && formData.baseCost) {
      handleNestedUpdate('totalPrice', {
        amount: pricing.totalPrice,
        currency: formData.baseCost.currency || 'EUR',
      })
    }
  }, [formData.baseCost?.amount, formData.markup])

  const formatDateForInput = (timestamp: number) => {
    return new Date(timestamp).toISOString().slice(0, 16)
  }

  const parseDateFromInput = (dateString: string) => {
    return new Date(dateString).getTime()
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
            Select the customer for this quote.
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Customer Reference"
              value={formData.customerReference || ''}
              onChange={(e) => updateField('customerReference', e.target.value)}
              placeholder="Customer's reference number"
              maxLength={QUOTE_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH}
            />

            <div>
              <Label>Service Type</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => updateField('serviceType', value)}
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
                value={formData.priority}
                onValueChange={(value) => updateField('priority', value)}
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
          </div>
        </div>
      </Card>

      {/* Route Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Origin */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">📍 Origin</h4>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  value={formData.origin.street || ''}
                  onChange={(e) => handleNestedUpdate('origin.street', e.target.value)}
                  placeholder="Street address (optional)"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={formData.origin.city}
                    onChange={(e) => handleNestedUpdate('origin.city', e.target.value)}
                    error={errors['origin.city']}
                    placeholder="City name"
                    required
                  />
                  
                  <Input
                    label="Postal Code"
                    value={formData.origin.postalCode || ''}
                    onChange={(e) => handleNestedUpdate('origin.postalCode', e.target.value)}
                    placeholder="Postal code"
                  />
                </div>

                <div>
                  <Label required>Country</Label>
                  <Select
                    value={formData.origin.countryCode}
                    onValueChange={(value) => {
                      const country = COMMON_COUNTRIES.find(c => c.code === value)
                      handleNestedUpdate('origin.countryCode', value)
                      handleNestedUpdate('origin.country', country?.name || value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors['origin.country'] && (
                    <p className="text-red-600 text-sm mt-1">{errors['origin.country']}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Destination */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">🎯 Destination</h4>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  value={formData.destination.street || ''}
                  onChange={(e) => handleNestedUpdate('destination.street', e.target.value)}
                  placeholder="Street address (optional)"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={formData.destination.city}
                    onChange={(e) => handleNestedUpdate('destination.city', e.target.value)}
                    error={errors['destination.city']}
                    placeholder="City name"
                    required
                  />
                  
                  <Input
                    label="Postal Code"
                    value={formData.destination.postalCode || ''}
                    onChange={(e) => handleNestedUpdate('destination.postalCode', e.target.value)}
                    placeholder="Postal code"
                  />
                </div>

                <div>
                  <Label required>Country</Label>
                  <Select
                    value={formData.destination.countryCode}
                    onValueChange={(value) => {
                      const country = COMMON_COUNTRIES.find(c => c.code === value)
                      handleNestedUpdate('destination.countryCode', value)
                      handleNestedUpdate('destination.country', country?.name || value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors['destination.country'] && (
                    <p className="text-red-600 text-sm mt-1">{errors['destination.country']}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Shipment Details */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h3>

          <div className="space-y-6">
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              error={errors.description}
              placeholder="Describe the items to be shipped..."
              maxLength={QUOTE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH}
              required
            />

            <Textarea
              label="Special Instructions"
              value={formData.specialInstructions || ''}
              onChange={(e) => updateField('specialInstructions', e.target.value)}
              placeholder="Any special handling instructions..."
              maxLength={QUOTE_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH}
            />

            {/* Dimensions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">📦 Dimensions & Weight</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Input
                  label="Length"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.dimensions.length}
                  onChange={(e) => handleNestedUpdate('dimensions.length', parseFloat(e.target.value))}
                  error={errors['dimensions.length']}
                  required
                />
                
                <Input
                  label="Width"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.dimensions.width}
                  onChange={(e) => handleNestedUpdate('dimensions.width', parseFloat(e.target.value))}
                  error={errors['dimensions.width']}
                  required
                />
                
                <Input
                  label="Height"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.dimensions.height}
                  onChange={(e) => handleNestedUpdate('dimensions.height', parseFloat(e.target.value))}
                  error={errors['dimensions.height']}
                  required
                />
                
                <Input
                  label="Weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.dimensions.weight}
                  onChange={(e) => handleNestedUpdate('dimensions.weight', parseFloat(e.target.value))}
                  error={errors['dimensions.weight']}
                  required
                />

                <div>
                  <Label>Units</Label>
                  <div className="space-y-2">
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
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing */}
      {showAllFields && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Base Cost</Label>
                <div className="flex">
                  <Select
                    value={formData.baseCost?.currency || 'EUR'}
                    onValueChange={(value) => 
                      handleNestedUpdate('baseCost.currency', value)
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.baseCost?.amount || ''}
                    onChange={(e) => 
                      handleNestedUpdate('baseCost.amount', parseFloat(e.target.value))
                    }
                    placeholder="0.00"
                    className="flex-1 ml-2"
                  />
                </div>
              </div>

              <Input
                label="Markup (%)"
                type="number"
                min="0"
                max="100"
                value={formData.markup || ''}
                onChange={(e) => updateField('markup', parseFloat(e.target.value))}
                placeholder="20"
              />

              <div>
                <Label>Total Price</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {formData.totalPrice 
                      ? `${CURRENCY_SYMBOLS[formData.totalPrice.currency]}${formData.totalPrice.amount.toLocaleString()}`
                      : 'Calculate pricing'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Calculation Display */}
            {calculatePricing() && (
              <Card className="bg-blue-50 border-blue-200 mt-4">
                <div className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Pricing Breakdown</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Base Cost:</span>
                      <span>{CURRENCY_SYMBOLS[formData.baseCost?.currency || 'EUR']}{calculatePricing()!.baseCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Markup ({calculatePricing()!.markup}%):</span>
                      <span>{CURRENCY_SYMBOLS[formData.baseCost?.currency || 'EUR']}{calculatePricing()!.markupAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-blue-300 pt-1">
                      <span>Total Price:</span>
                      <span>{CURRENCY_SYMBOLS[formData.baseCost?.currency || 'EUR']}{calculatePricing()!.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Profit Margin: {calculatePricing()!.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </Card>
      )}

      {/* Timeline & Assignment */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ Timeline & Assignment</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Delivery Deadline"
              type="datetime-local"
              value={formatDateForInput(formData.deadline)}
              onChange={(e) => updateField('deadline', parseDateFromInput(e.target.value))}
              error={errors.deadline}
              required
            />

            <Input
              label="Quote Valid Until"
              type="datetime-local"
              value={formatDateForInput(formData.validUntil)}
              onChange={(e) => updateField('validUntil', parseDateFromInput(e.target.value))}
              error={errors.validUntil}
              required
            />

            <div className="md:col-span-2">
              <Label>Assigned Courier (Optional)</Label>
              <CourierSearch
                onSelect={(courier) => updateField('assignedCourierId', courier._id)}
                placeholder="Search and assign a courier..."
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      {showAllFields && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Additional Information</h3>

            <div className="space-y-6">
              <Textarea
                label="Quote Text"
                value={formData.quoteText || ''}
                onChange={(e) => updateField('quoteText', e.target.value)}
                placeholder="Custom quote text for the customer..."
                maxLength={QUOTE_CONSTANTS.LIMITS.MAX_QUOTE_TEXT_LENGTH}
                rows={6}
              />

              <Textarea
                label="Internal Notes"
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Internal notes (not visible to customer)..."
                maxLength={QUOTE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH}
              />
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

