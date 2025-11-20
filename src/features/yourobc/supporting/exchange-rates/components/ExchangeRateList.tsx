// src/features/yourobc/supporting/exchange-rates/components/ExchangeRateList.tsx

import React from 'react'
import { ExchangeRateCard } from './ExchangeRateCard'
import { Loading } from '@/components/ui'
import type { ExchangeRate } from '../types'

export interface ExchangeRateListProps {
  rates: ExchangeRate[]
  isLoading?: boolean
  error?: Error | null
  emptyMessage?: string
  className?: string
}

export function ExchangeRateList({
  rates,
  isLoading = false,
  error = null,
  emptyMessage = 'No exchange rates found',
  className = '',
}: ExchangeRateListProps) {
  if (isLoading) {
    return (
      <div className={`flex justify-center py-12 ${className}`}>
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-red-600">Error loading exchange rates: {error.message}</p>
      </div>
    )
  }

  if (rates.length === 0) {
    return (
      <div className={`text-center py-12 text-gray-500 ${className}`}>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {rates.map((rate) => (
        <ExchangeRateCard
          key={rate._id}
          rate={rate}
        />
      ))}
    </div>
  )
}
