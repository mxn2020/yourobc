// src/features/yourobc/supporting/exchange-rates/components/ExchangeRateForm.tsx

import React, { useState, useEffect } from 'react'
import { Save, X, ArrowRight } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import type { ExchangeRateFormData, Currency } from '../types'
import { CURRENCIES, CURRENCY_LABELS, EXCHANGE_RATE_SOURCES, EXCHANGE_RATE_CONSTANTS } from '../types'

export interface ExchangeRateFormProps {
  onSubmit: (data: ExchangeRateFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<ExchangeRateFormData>
  submitLabel?: string
  className?: string
}

export function ExchangeRateForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Create Rate',
  className = '',
}: ExchangeRateFormProps) {
  const [formData, setFormData] = useState<ExchangeRateFormData>({
    fromCurrency: initialData?.fromCurrency || 'USD',
    toCurrency: initialData?.toCurrency || 'EUR',
    rate: initialData?.rate || 0,
    source: initialData?.source || EXCHANGE_RATE_SOURCES.MANUAL,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        fromCurrency: initialData.fromCurrency || 'USD',
        toCurrency: initialData.toCurrency || 'EUR',
        rate: initialData.rate || 0,
        source: initialData.source || EXCHANGE_RATE_SOURCES.MANUAL,
      })
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.rate <= 0) {
      newErrors.rate = 'Rate must be greater than 0'
    } else if (formData.rate < EXCHANGE_RATE_CONSTANTS.MIN_RATE) {
      newErrors.rate = `Rate must be at least ${EXCHANGE_RATE_CONSTANTS.MIN_RATE}`
    } else if (formData.rate > EXCHANGE_RATE_CONSTANTS.MAX_RATE) {
      newErrors.rate = `Rate must be less than ${EXCHANGE_RATE_CONSTANTS.MAX_RATE}`
    }

    if (formData.fromCurrency === formData.toCurrency) {
      newErrors.currencies = 'From and to currencies must be different'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)

      // Reset form after successful submission
      if (!initialData) {
        setFormData({
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          rate: 0,
          source: EXCHANGE_RATE_SOURCES.MANUAL,
        })
      }
    } catch (err: any) {
      console.error('Form submission error:', err)
      setErrors({ submit: err.message || 'Failed to submit form' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      rate: 0,
      source: EXCHANGE_RATE_SOURCES.MANUAL,
    })
    setErrors({})
    onCancel?.()
  }

  const updateField = (field: keyof ExchangeRateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field] || errors.currencies) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        delete newErrors.currencies
        return newErrors
      })
    }
  }

  const swapCurrencies = () => {
    setFormData(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
      rate: prev.rate > 0 ? 1 / prev.rate : 0,
    }))
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Currency Pair Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency Pair <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <select
            value={formData.fromCurrency}
            onChange={(e) => updateField('fromCurrency', e.target.value as Currency)}
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency} - {CURRENCY_LABELS[currency]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={swapCurrencies}
            disabled={isSubmitting}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Swap currencies"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <select
            value={formData.toCurrency}
            onChange={(e) => updateField('toCurrency', e.target.value as Currency)}
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency} - {CURRENCY_LABELS[currency]}
              </option>
            ))}
          </select>
        </div>
        {errors.currencies && (
          <p className="text-sm text-red-600 mt-1">{errors.currencies}</p>
        )}
      </div>

      {/* Exchange Rate Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Exchange Rate <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          value={formData.rate || ''}
          onChange={(e) => updateField('rate', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          step="0.000001"
          min={EXCHANGE_RATE_CONSTANTS.MIN_RATE}
          max={EXCHANGE_RATE_CONSTANTS.MAX_RATE}
          disabled={isSubmitting}
          className={errors.rate ? 'border-red-500' : ''}
        />
        <p className="text-xs text-gray-500 mt-1">
          1 {formData.fromCurrency} = {formData.rate > 0 ? formData.rate.toFixed(6) : '0.000000'} {formData.toCurrency}
        </p>
        {errors.rate && (
          <p className="text-sm text-red-600 mt-1">{errors.rate}</p>
        )}
      </div>

      {/* Source Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source (optional)
        </label>
        <select
          value={formData.source}
          onChange={(e) => updateField('source', e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(EXCHANGE_RATE_SOURCES).map(([key, label]) => (
            <option key={key} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {errors.submit}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            variant="secondary"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || formData.rate <= 0}
          variant="primary"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
