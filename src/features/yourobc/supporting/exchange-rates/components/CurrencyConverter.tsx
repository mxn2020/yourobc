// src/features/yourobc/supporting/exchange-rates/components/CurrencyConverter.tsx

import React, { useState, useEffect } from 'react'
import { ArrowRight, RefreshCw, TrendingUp } from 'lucide-react'
import { Card, Badge, Loading } from '@/components/ui'
import { useCurrencyConverter, useCurrencyPairRate } from '../hooks/useExchangeRates'
import { isExchangeRatesEnabled } from '../../config'
import type { Currency, ConversionResult } from '../types'
import { CURRENCIES, CURRENCY_LABELS, CURRENCY_SYMBOLS } from '../types'

export interface CurrencyConverterProps {
  initialAmount?: number
  initialFromCurrency?: Currency
  initialToCurrency?: Currency
  onConvert?: (result: ConversionResult) => void
  showLiveRate?: boolean
  compact?: boolean
  className?: string
}

export function CurrencyConverter({
  initialAmount = 0,
  initialFromCurrency = 'USD',
  initialToCurrency = 'EUR',
  onConvert,
  showLiveRate = true,
  compact = false,
  className = '',
}: CurrencyConverterProps) {
  // Check if exchange rates feature is enabled
  if (!isExchangeRatesEnabled()) {
    return null
  }

  const [amount, setAmount] = useState(initialAmount)
  const [fromCurrency, setFromCurrency] = useState<Currency>(initialFromCurrency)
  const [toCurrency, setToCurrency] = useState<Currency>(initialToCurrency)

  const { conversion, isLoading } = useCurrencyConverter(amount, fromCurrency, toCurrency)
  const { rate, rateData, isLoading: isRateLoading } = useCurrencyPairRate(fromCurrency, toCurrency)

  useEffect(() => {
    if (conversion && onConvert) {
      onConvert(conversion)
    }
  }, [conversion, onConvert])

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-gray-900 font-medium">
          {CURRENCY_SYMBOLS[fromCurrency]}{amount.toFixed(2)}
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        {isLoading ? (
          <Loading size="sm" />
        ) : conversion ? (
          <span className="text-blue-600 font-medium">
            {CURRENCY_SYMBOLS[toCurrency]}{conversion.convertedAmount.toFixed(2)}
          </span>
        ) : (
          <span className="text-gray-400">--</span>
        )}
        {showLiveRate && rate && (
          <Badge variant="secondary" className="text-xs">
            @ {rate.toFixed(6)}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Currency Converter</h3>
        </div>
        {showLiveRate && rate && (
          <Badge variant="secondary">
            Rate: {rate.toFixed(6)}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as Currency)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={swapCurrencies}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Swap currencies"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loading size="sm" />
                </div>
              ) : conversion ? (
                <div className="text-lg font-semibold text-gray-900">
                  {conversion.convertedAmount.toFixed(2)}
                </div>
              ) : (
                <div className="text-gray-400">--</div>
              )}
            </div>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as Currency)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rate Info */}
        {rateData && !isRateLoading && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                1 {fromCurrency} = {rate?.toFixed(6)} {toCurrency}
              </span>
              {rateData.source && (
                <span className="text-gray-500 text-xs">
                  {rateData.source}
                </span>
              )}
            </div>
            {rateData.date && (
              <div className="text-xs text-gray-500 mt-1">
                Updated: {formatDate(rateData.date)}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
