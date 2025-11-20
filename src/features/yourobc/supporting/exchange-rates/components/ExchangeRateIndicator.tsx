// src/features/yourobc/supporting/exchange-rates/components/ExchangeRateIndicator.tsx

import React, { useState } from 'react'
import { TrendingUp, X } from 'lucide-react'
import { Badge, Loading } from '@/components/ui'
import { CurrencyConverter } from './CurrencyConverter'
import { useCurrencyPairRate } from '../hooks/useExchangeRates'
import type { Currency } from '../types'

export interface ExchangeRateIndicatorProps {
  fromCurrency?: Currency
  toCurrency?: Currency
  inline?: boolean
  showConverter?: boolean
  className?: string
}

export function ExchangeRateIndicator({
  fromCurrency = 'USD',
  toCurrency = 'EUR',
  inline = true,
  showConverter = true,
  className = '',
}: ExchangeRateIndicatorProps) {
  const [isConverterOpen, setIsConverterOpen] = useState(false)
  const { rate, rateData, isLoading } = useCurrencyPairRate(fromCurrency, toCurrency)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (inline) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => showConverter && setIsConverterOpen(!isConverterOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            showConverter ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'
          }`}
          title={showConverter ? 'Click to open converter' : undefined}
        >
          <TrendingUp className="w-4 h-4 text-blue-600" />
          {isLoading ? (
            <Loading size="sm" />
          ) : rate ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {fromCurrency}/{toCurrency}
              </span>
              <Badge variant="secondary" className="text-xs">
                {rate.toFixed(4)}
              </Badge>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Rate unavailable</span>
          )}
        </button>

        {/* Converter Popover */}
        {isConverterOpen && showConverter && (
          <div className="absolute top-full right-0 mt-2 z-50 shadow-xl">
            <div className="relative">
              <button
                onClick={() => setIsConverterOpen(false)}
                className="absolute top-2 right-2 z-10 p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
              <CurrencyConverter
                initialFromCurrency={fromCurrency}
                initialToCurrency={toCurrency}
                showLiveRate={true}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`p-4 bg-white border rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {fromCurrency} → {toCurrency}
            </div>
            {rateData?.date && (
              <div className="text-xs text-gray-500">
                {formatDate(rateData.date)}
              </div>
            )}
          </div>
        </div>
        {isLoading ? (
          <Loading size="sm" />
        ) : rate ? (
          <div className="text-lg font-bold text-blue-600">
            {rate.toFixed(6)}
          </div>
        ) : (
          <span className="text-sm text-gray-400">N/A</span>
        )}
      </div>
      {rateData?.source && (
        <div className="mt-2 text-xs text-gray-500">
          Source: {rateData.source}
        </div>
      )}
    </div>
  )
}
