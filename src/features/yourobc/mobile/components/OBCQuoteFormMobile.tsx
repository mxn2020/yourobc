// src/features/yourobc/mobile/components/OBCQuoteFormMobile.tsx

import { FC, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { CustomerId, QuoteId } from '@/features/yourobc/quotes/types'
import { Button } from '@/components/ui'
import { useClipboard } from '../hooks/useClipboard'
import { formatMobileCurrency } from '../utils/mobileFormatters'
import { useToast } from '@/features/system/notifications'

interface OBCQuoteFormMobileProps {
  authUserId: string
  onSuccess?: (quoteId: QuoteId) => void
  onCancel?: () => void
}

export const OBCQuoteFormMobile: FC<OBCQuoteFormMobileProps> = ({
  authUserId,
  onSuccess,
  onCancel,
}) => {
  const toast = useToast()
  const { copy } = useClipboard()

  // Form state
  const [formData, setFormData] = useState({
    customerId: '' as CustomerId | '',
    origin: '',
    destination: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    deadline: '',
    currency: 'EUR' as 'EUR' | 'USD',
    notes: '',
  })

  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Fetch customers for dropdown
  const customersData = useQuery(api.lib.yourobc.customers.queries.getCustomers, {
    authUserId,
  })

  const customers = customersData?.customers

  // Create quote mutation
  const createQuote = useMutation(api.lib.yourobc.quotes.mutations.createQuote)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCalculatePrice = () => {
    setIsCalculating(true)
    // Simulate price calculation
    setTimeout(() => {
      const basePrice = parseFloat(formData.weight) * 2.5
      const marginMultiplier = 1.3
      const finalPrice = basePrice * marginMultiplier

      setCalculatedPrice(finalPrice)
      setIsCalculating(false)
    }, 500)
  }

  const handleCreateQuote = async () => {
    // Validation
    if (!formData.customerId) {
      toast.error('Please select a customer')
      return
    }

    if (!formData.origin || !formData.destination) {
      toast.error('Please enter origin and destination')
      return
    }

    if (!formData.weight) {
      toast.error('Please enter weight')
      return
    }

    setIsCreating(true)

    try {
      // Parse origin and destination strings into Address objects
      const parseLocation = (location: string) => {
        const parts = location.split(',').map(s => s.trim())
        return {
          city: parts[0] || location,
          country: parts[1] || '',
          countryCode: parts[1]?.substring(0, 2).toUpperCase() || 'DE',
        }
      }

      const quoteId = await createQuote({
        authUserId,
        data: {
          customerId: formData.customerId as CustomerId,
          priority: 'standard' as const,
          description: `Quote from ${formData.origin} to ${formData.destination}`,
          dimensions: {
            weight: parseFloat(formData.weight),
            weightUnit: 'kg' as const,
            length: formData.length ? parseFloat(formData.length) : 0,
            width: formData.width ? parseFloat(formData.width) : 0,
            height: formData.height ? parseFloat(formData.height) : 0,
            unit: 'cm' as const,
          },
          deadline: formData.deadline ? new Date(formData.deadline).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
          origin: parseLocation(formData.origin),
          destination: parseLocation(formData.destination),
          serviceType: 'OBC' as const,
          totalPrice: calculatedPrice ? {
            currency: formData.currency,
            amount: calculatedPrice,
          } : undefined,
          validUntil: formData.deadline ? new Date(formData.deadline).getTime() : undefined,
          notes: formData.notes,
        },
      })

      toast.success('Quote created successfully!')
      onSuccess?.(quoteId)
    } catch (error) {
      toast.error('Failed to create quote')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyQuote = async () => {
    const quoteText = `
OBC Quote #${Date.now()}

From: ${formData.origin}
To: ${formData.destination}
Weight: ${formData.weight}kg
Price: ${formatMobileCurrency(calculatedPrice || 0, formData.currency, false)}

${formData.notes ? `Notes: ${formData.notes}` : ''}
    `.trim()

    await copy(quoteText, {
      successMessage: 'Quote copied! Ready to send.',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">New OBC Quote</h1>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <select
            value={formData.customerId}
            onChange={(e) => handleInputChange('customerId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select customer...</option>
            {customers?.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* Route Section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-3">Route</div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Origin *</label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                placeholder="Frankfurt (FRA)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Destination *</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="New York (JFK)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              />
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-3">Shipment Details</div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Weight (kg) *</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="50"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Length (cm)</label>
                <input
                  type="number"
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Width (cm)</label>
                <input
                  type="number"
                  value={formData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              />
            </div>
          </div>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <div className="grid grid-cols-2 gap-2">
            {['EUR', 'USD'].map((curr) => (
              <button
                key={curr}
                onClick={() => handleInputChange('currency', curr)}
                className={`
                  py-3 px-4 rounded-lg border-2 font-medium transition-all
                  ${
                    formData.currency === curr
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }
                `}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            placeholder="Additional notes..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-none"
          />
        </div>

        {/* Calculate Price */}
        <Button
          onClick={handleCalculatePrice}
          disabled={!formData.weight || isCalculating}
          variant="secondary"
          className="w-full py-4 text-base font-medium"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Price'}
        </Button>

        {/* Calculated Price Display */}
        {calculatedPrice !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">Calculated Price</div>
            <div className="text-3xl font-bold text-blue-900">
              {formatMobileCurrency(calculatedPrice, formData.currency, false)}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleCreateQuote}
            disabled={!calculatedPrice || isCreating}
            variant="primary"
            className="w-full py-4 text-base font-medium"
          >
            {isCreating ? 'Creating...' : 'Create Quote'}
          </Button>

          {calculatedPrice !== null && (
            <Button
              onClick={handleCopyQuote}
              variant="secondary"
              className="w-full py-4 text-base font-medium"
            >
              📋 Copy Quote Text
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
