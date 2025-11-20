// src/features/yourobc/supporting/exchange-rates/components/CurrencyDisplay.tsx

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Badge, Loading } from '@/components/ui'
import { useCurrencyConverter } from '../hooks/useExchangeRates'
import type { Currency, CurrencyAmount } from '../types'
import { CURRENCY_SYMBOLS } from '../types'

export interface CurrencyDisplayProps {
  amount: number
  currency: Currency
  showConverted?: boolean
  targetCurrency?: Currency
  exchangeRate?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CurrencyDisplay({
  amount,
  currency,
  showConverted = false,
  targetCurrency,
  exchangeRate,
  className = '',
  size = 'md',
}: CurrencyDisplayProps) {
  const shouldFetchConversion = showConverted && targetCurrency && currency !== targetCurrency && !exchangeRate

  const { conversion, isLoading } = useCurrencyConverter(
    shouldFetchConversion ? amount : 0,
    currency,
    targetCurrency || currency
  )

  const formatAmount = (value: number, curr: Currency) => {
    return `${CURRENCY_SYMBOLS[curr]}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  }

  const convertedAmount = exchangeRate
    ? amount * exchangeRate
    : conversion?.convertedAmount

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses[size]} ${className}`}>
      <span className="text-gray-900 font-medium">
        {formatAmount(amount, currency)}
      </span>

      {showConverted && targetCurrency && currency !== targetCurrency && (
        <>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          {isLoading && shouldFetchConversion ? (
            <Loading size="sm" />
          ) : convertedAmount ? (
            <span className="text-blue-600 font-medium">
              {formatAmount(convertedAmount, targetCurrency)}
            </span>
          ) : null}
        </>
      )}
    </div>
  )
}

export interface CurrencyAmountDisplayProps {
  currencyAmount: CurrencyAmount
  showConverted?: boolean
  targetCurrency?: Currency
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CurrencyAmountDisplay({
  currencyAmount,
  showConverted = false,
  targetCurrency,
  className = '',
  size = 'md',
}: CurrencyAmountDisplayProps) {
  return (
    <CurrencyDisplay
      amount={currencyAmount.amount}
      currency={currencyAmount.currency}
      showConverted={showConverted}
      targetCurrency={targetCurrency}
      exchangeRate={currencyAmount.exchangeRate}
      className={className}
      size={size}
    />
  )
}
