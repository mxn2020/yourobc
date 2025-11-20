// src/features/yourobc/supporting/exchange-rates/components/ExchangeRateCard.tsx

import React from 'react'
import { ArrowRight, Calendar, Check } from 'lucide-react'
import { Card, Badge } from '@/components/ui'
import type { ExchangeRate } from '../types'
import { CURRENCY_SYMBOLS, CURRENCY_LABELS } from '../types'

export interface ExchangeRateCardProps {
  rate: ExchangeRate
  className?: string
}

export function ExchangeRateCard({
  rate,
  className = '',
}: ExchangeRateCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRate = (value: number) => {
    return value.toFixed(6)
  }

  return (
    <Card className={`p-5 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span>{CURRENCY_SYMBOLS[rate.fromCurrency]} {rate.fromCurrency}</span>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <span>{CURRENCY_SYMBOLS[rate.toCurrency]} {rate.toCurrency}</span>
          </div>
        </div>
        {rate.isActive && (
          <Badge variant="success">
            <Check className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )}
      </div>

      {/* Rate Display */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-blue-600">
          {formatRate(rate.rate)}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          1 {rate.fromCurrency} = {formatRate(rate.rate)} {rate.toCurrency}
        </p>
        <p className="text-sm text-gray-600">
          1 {rate.toCurrency} = {formatRate(1 / rate.rate)} {rate.fromCurrency}
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-2 text-sm">
        {rate.source && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Source:</span>
            <span>{rate.source}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(rate.date)}</span>
        </div>
        {rate.createdAt !== rate.date && (
          <div className="text-xs text-gray-500">
            Created: {formatDate(rate.createdAt)}
          </div>
        )}
      </div>
    </Card>
  )
}
