// src/features/yourobc/supporting/exchange-rates/hooks/useExchangeRates.ts

import { useCallback, useMemo } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { exchangeRatesService } from '../services/ExchangeRatesService'
import type {
  CreateExchangeRateData,
  Currency,
} from '../types'

/**
 * Main hook for exchange rate management
 */
export function useExchangeRates(limit?: number) {
  const authUser = useAuthenticatedUser()

  const {
    data: rates,
    isPending,
    error,
    refetch,
  } = exchangeRatesService.useExchangeRates(authUser?.id!, limit)

  const createMutation = exchangeRatesService.useCreateExchangeRate()

  const createExchangeRate = useCallback(async (data: CreateExchangeRateData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = exchangeRatesService.validateExchangeRateData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    return await exchangeRatesService.createExchangeRate(createMutation, authUser.id, data)
  }, [authUser, createMutation])

  const canManageRates = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  // Group rates by currency pair
  const ratesByCurrencyPair = useMemo(() => {
    if (!rates) return {}
    return rates.reduce((acc, rate) => {
      const key = `${rate.fromCurrency}-${rate.toCurrency}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(rate)
      return acc
    }, {} as Record<string, typeof rates>)
  }, [rates])

  return {
    rates: rates || [],
    ratesByCurrencyPair,
    isLoading: isPending,
    error,
    refetch,
    createExchangeRate,
    canManageRates,
    isCreating: createMutation.isPending,
  }
}

/**
 * Hook for currency conversion
 */
export function useCurrencyConverter(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
) {
  const authUser = useAuthenticatedUser()

  const {
    data: conversion,
    isPending,
    error,
  } = exchangeRatesService.useConvertCurrency(
    authUser?.id!,
    amount,
    fromCurrency,
    toCurrency
  )

  return {
    conversion,
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for getting current rate for a currency pair
 */
export function useCurrencyPairRate(fromCurrency: Currency, toCurrency: Currency) {
  const authUser = useAuthenticatedUser()

  const {
    data: rateData,
    isPending,
    error,
  } = exchangeRatesService.useCurrentRate(authUser?.id!, fromCurrency, toCurrency)

  return {
    rate: rateData?.rate,
    rateData,
    isLoading: isPending,
    error,
  }
}
