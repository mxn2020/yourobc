// src/features/yourobc/supporting/exchange-rates/services/ExchangeRatesService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateExchangeRateData,
  ExchangeRateFormData,
  Currency,
} from '../types'

export class ExchangeRatesService {
  // Query hooks for exchange rate data fetching
  useExchangeRates(authUserId: string, limit?: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.exchange_rates.queries.getExchangeRates, {
        authUserId,
        limit,
      }),
      staleTime: 300000, // 5 minutes (rates don't change frequently)
      enabled: !!authUserId,
    })
  }

  useCurrentRate(authUserId: string, fromCurrency: Currency, toCurrency: Currency) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.exchange_rates.queries.getCurrentRate, {
        authUserId,
        fromCurrency,
        toCurrency,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && fromCurrency !== toCurrency,
    })
  }

  useConvertCurrency(
    authUserId: string,
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.exchange_rates.queries.convertCurrencyAmount, {
        authUserId,
        amount,
        fromCurrency,
        toCurrency,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && amount > 0,
    })
  }

  // Mutation hooks for exchange rate modifications
  useCreateExchangeRate() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.exchange_rates.mutations.createExchangeRate),
    })
  }

  // Business operations using mutations
  async createExchangeRate(
    mutation: ReturnType<typeof this.useCreateExchangeRate>,
    authUserId: string,
    data: CreateExchangeRateData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create exchange rate: ${error.message}`)
    }
  }

  // Utility functions for data processing
  validateExchangeRateData(data: Partial<ExchangeRateFormData>): string[] {
    const errors: string[] = []

    if (data.rate !== undefined) {
      if (data.rate <= 0) {
        errors.push('Rate must be greater than 0')
      }

      if (data.rate < 0.01) {
        errors.push('Rate must be at least 0.01')
      }

      if (data.rate > 1000) {
        errors.push('Rate must be less than 1000')
      }
    }

    if (data.fromCurrency && data.toCurrency && data.fromCurrency === data.toCurrency) {
      errors.push('From and to currencies must be different')
    }

    return errors
  }

  formatRate(rate: number): string {
    return rate.toFixed(6)
  }

  formatCurrency(amount: number, currency: Currency): string {
    const symbols: Record<Currency, string> = {
      EUR: '€',
      USD: '$',
    }
    return `${symbols[currency]}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  calculateConversion(amount: number, rate: number): number {
    return Number((amount * rate).toFixed(2))
  }

  formatDateFromTimestamp(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp))
  }
}

export const exchangeRatesService = new ExchangeRatesService()
