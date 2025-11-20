// src/features/yourobc/quotes/hooks/useQuotes.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { quotesService } from '../services/QuotesService'
import { QUOTE_CONSTANTS } from '../types'
import { parseConvexError, type ParsedError } from '@/utils/errorHandling'
import type {
  CreateQuoteData,
  UpdateQuoteData,
  QuoteFormData,
  QuoteId,
  QuoteListItem,
  QuoteInsights,
  QuotePerformanceMetrics,
  QuotePricingCalculation,
  QuoteConversionParams,
  InquirySourceId,
  CustomerId,
  CourierId,
} from '../types'
import { QuoteListOptions } from '@/convex/lib/yourobc'

/**
 * Main hook for quote management
 */
export function useQuotes(options?: QuoteListOptions & { autoRefresh?: boolean }) {
  const authUser = useAuthenticatedUser()

  const {
    data: quotesQuery,
    isPending,
    error,
    refetch,
  } = quotesService.useQuotes(authUser?.id!, options)

  const {
    data: stats,
    isPending: isStatsLoading,
  } = quotesService.useQuoteStats(authUser?.id!)

  const createMutation = quotesService.useCreateQuote()
  const updateMutation = quotesService.useUpdateQuote()
  const updateStatusMutation = quotesService.useUpdateQuoteStatus()
  const sendMutation = quotesService.useSendQuote()
  const convertMutation = quotesService.useConvertQuote()
  const deleteMutation = quotesService.useDeleteQuote()

  // Parse error for better user experience
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null
  }, [error])

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED'

  const createQuote = useCallback(async (quoteData: QuoteFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = quotesService.validateQuoteData(quoteData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateQuoteData = {
      customerReference: quoteData.customerReference?.trim(),
      serviceType: quoteData.serviceType,
      priority: quoteData.priority,
      customerId: quoteData.customerId as CustomerId,
      inquirySourceId: quoteData.inquirySourceId as InquirySourceId | undefined,
      origin: quoteData.origin,
      destination: quoteData.destination,
      dimensions: quoteData.dimensions,
      description: quoteData.description.trim(),
      specialInstructions: quoteData.specialInstructions?.trim(),
      deadline: quoteData.deadline,
      assignedCourierId: quoteData.assignedCourierId as CourierId,
      baseCost: quoteData.baseCost,
      markup: quoteData.markup,
      totalPrice: quoteData.totalPrice,
      validUntil: quoteData.validUntil,
      quoteText: quoteData.quoteText?.trim(),
      notes: quoteData.notes?.trim(),
    }

    return await quotesService.createQuote(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updateQuote = useCallback(async (
    quoteId: QuoteId,
    updates: Partial<QuoteFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = quotesService.validateQuoteData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const updateData: UpdateQuoteData = {}
    if (updates.customerReference !== undefined) updateData.customerReference = updates.customerReference?.trim()
    if (updates.serviceType !== undefined) updateData.serviceType = updates.serviceType
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.origin !== undefined) updateData.origin = updates.origin
    if (updates.destination !== undefined) updateData.destination = updates.destination
    if (updates.dimensions !== undefined) updateData.dimensions = updates.dimensions
    if (updates.description !== undefined) updateData.description = updates.description.trim()
    if (updates.specialInstructions !== undefined) updateData.specialInstructions = updates.specialInstructions?.trim()
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline
    if (updates.assignedCourierId !== undefined) updateData.assignedCourierId = updates.assignedCourierId as CourierId
    if (updates.baseCost !== undefined) updateData.baseCost = updates.baseCost
    if (updates.markup !== undefined) updateData.markup = updates.markup
    if (updates.totalPrice !== undefined) updateData.totalPrice = updates.totalPrice
    if (updates.validUntil !== undefined) updateData.validUntil = updates.validUntil
    if (updates.quoteText !== undefined) updateData.quoteText = updates.quoteText?.trim()
    if (updates.notes !== undefined) updateData.notes = updates.notes?.trim()
    // OBC-specific fields
    if (updates.flightDetails !== undefined) updateData.flightDetails = updates.flightDetails
    // NFO-specific fields
    if (updates.partnerQuotes !== undefined) updateData.partnerQuotes = updates.partnerQuotes
    if (updates.selectedPartnerQuote !== undefined) updateData.selectedPartnerQuote = updates.selectedPartnerQuote

    return await quotesService.updateQuote(updateMutation, authUser.id, quoteId, updateData)
  }, [authUser, updateMutation])

  const updateQuoteStatus = useCallback(async (
    quoteId: QuoteId,
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
    notes?: string
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await quotesService.updateQuoteStatus(updateStatusMutation, authUser.id, quoteId, status, notes)
  }, [authUser, updateStatusMutation])

  const sendQuote = useCallback(async (
    quoteId: QuoteId,
    quoteText: string,
    emailData?: {
      to: string[]
      cc?: string[]
      subject?: string
      message?: string
    }
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await quotesService.sendQuote(sendMutation, authUser.id, quoteId, quoteText, emailData)
  }, [authUser, sendMutation])

  const convertToShipment = useCallback(async (params: QuoteConversionParams) => {
    if (!authUser) throw new Error('Authentication required')
    return await quotesService.convertToShipment(convertMutation, authUser.id, params.quoteId)
  }, [authUser, convertMutation])

  const deleteQuote = useCallback(async (quoteId: QuoteId) => {
    if (!authUser) throw new Error('Authentication required')
    return await quotesService.deleteQuote(deleteMutation, authUser.id, quoteId)
  }, [authUser, deleteMutation])

  const canCreateQuotes = useMemo(() => {
    if (!authUser) return false
    return ['admin', 'superadmin', 'sales'].includes(authUser.role)
  }, [authUser])

  const canEditQuotes = useMemo(() => {
    if (!authUser) return false
    return ['admin', 'superadmin', 'sales'].includes(authUser.role)
  }, [authUser])

  const canDeleteQuotes = useMemo(() => {
    if (!authUser) return false
    return ['admin', 'superadmin'].includes(authUser.role)
  }, [authUser])

  const canSendQuotes = useMemo(() => {
    if (!authUser) return false
    return ['admin', 'superadmin', 'sales'].includes(authUser.role)
  }, [authUser])

  const canViewPricing = useMemo(() => {
    if (!authUser) return false
    return ['admin', 'superadmin', 'sales', 'finance'].includes(authUser.role)
  }, [authUser])

  const canEditPricing = useMemo(() => {
    if (!authUser) return false
    return ['admin', 'superadmin', 'sales'].includes(authUser.role)
  }, [authUser])

  const enrichedQuotes = useMemo(() => {
    const quotes = quotesQuery?.quotes || []
    return quotes.map((quote): QuoteListItem => ({
      ...quote,
      displayName: quotesService.formatQuoteNumber(quote),
      formattedOrigin: quotesService.formatAddress(quote.origin),
      formattedDestination: quotesService.formatAddress(quote.destination),
      urgencyLevel: quote.priority === 'critical' ? 'critical' : 
                   quote.priority === 'urgent' ? 'high' : 'medium',
      profitMargin: quote.totalPrice && quote.baseCost 
        ? Math.round(((quote.totalPrice.amount - quote.baseCost.amount) / quote.totalPrice.amount) * 100)
        : 0,
      daysToDeadline: Math.ceil((quote.deadline - Date.now()) / (24 * 60 * 60 * 1000)),
      isExpiring: quotesService.calculateQuoteInsights(quote).isExpiring,
      isOverdue: quotesService.calculateQuoteInsights(quote).isOverdue,
    }))
  }, [quotesQuery])

  // Calculate stats with proper defaults
  const enrichedStats = useMemo(() => {
    if (!stats) return null
    
    return {
      ...stats,
      conversionRate: stats.totalQuotes > 0 
        ? Math.round((stats.acceptedQuotes / stats.totalQuotes) * 100)
        : 0,
    }
  }, [stats])

  return {
    quotes: enrichedQuotes,
    total: quotesQuery?.total || 0,
    hasMore: quotesQuery?.hasMore || false,
    stats: enrichedStats,
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    createQuote,
    updateQuote,
    updateQuoteStatus,
    sendQuote,
    convertToShipment,
    deleteQuote,
    refetch,
    canCreateQuotes,
    canEditQuotes,
    canDeleteQuotes,
    canSendQuotes,
    canViewPricing,
    canEditPricing,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isSending: sendMutation.isPending,
    isConverting: convertMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single quote
 */
export function useQuote(quoteId?: QuoteId) {
  if (!quoteId) {
    return {
      quote: null,
      quoteInsights: null,
      quoteMetrics: null,
      isLoading: false,
      error: null,
      refetch: () => {},
    }
  }

  const authUser = useAuthenticatedUser()

  const {
    data: quote,
    isPending,
    error,
    refetch,
  } = quotesService.useQuote(authUser?.id!, quoteId)

  const quoteInsights = useMemo((): QuoteInsights | null => {
    if (!quote) return null
    return quotesService.calculateQuoteInsights(quote)
  }, [quote])

  // Mock quote metrics (would come from actual queries)
  const quoteMetrics = useMemo((): QuotePerformanceMetrics | null => {
    if (!quote) return null

    return {
      totalQuotes: 1,
      acceptedQuotes: quote.status === 'accepted' ? 1 : 0,
      rejectedQuotes: quote.status === 'rejected' ? 1 : 0,
      pendingQuotes: ['draft', 'sent'].includes(quote.status) ? 1 : 0,
      conversionRate: quote.status === 'accepted' ? 100 : 0,
      averageValue: quote.totalPrice?.amount || 0,
      totalValue: quote.totalPrice?.amount || 0,
    }
  }, [quote])

  return {
    quote,
    quoteInsights,
    quoteMetrics,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for quote search
 */
export function useQuoteSearch(searchTerm: string) {
  const authUser = useAuthenticatedUser()

  const {
    data: searchResults,
    isPending,
    error,
  } = quotesService.useSearchQuotes(authUser?.id!, searchTerm)

  return {
    results: searchResults || [],
    isLoading: isPending,
    error,
    hasResults: (searchResults?.length || 0) > 0,
  }
}

/**
 * Hook for expiring quotes
 */
export function useExpiringQuotes(limit = 50) {
  const authUser = useAuthenticatedUser()

  const {
    data: expiringQuotes,
    isPending,
    error,
  } = quotesService.useExpiringQuotes(authUser?.id!, limit)

  return {
    quotes: expiringQuotes || [],
    isLoading: isPending,
    error,
    hasQuotes: (expiringQuotes?.length || 0) > 0,
  }
}

/**
 * Hook for quote form management
 */
export function useQuoteForm(initialData?: Partial<QuoteFormData>) {
  const [formData, setFormData] = useState<QuoteFormData>({
    serviceType: 'OBC',
    priority: 'standard',
    origin: { city: '', country: '', countryCode: '' },
    destination: { city: '', country: '', countryCode: '' },
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      unit: 'cm',
      weightUnit: 'kg',
    },
    description: '',
    deadline: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
    validUntil: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days from now
    markup: QUOTE_CONSTANTS.DEFAULT_VALUES.MARKUP,
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const validationErrors = quotesService.validateQuoteData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('Customer')) errorMap.customerId = error
      else if (error.includes('Description')) errorMap.description = error
      else if (error.includes('Origin city')) errorMap['origin.city'] = error
      else if (error.includes('Origin country')) errorMap['origin.country'] = error
      else if (error.includes('Destination city')) errorMap['destination.city'] = error
      else if (error.includes('Destination country')) errorMap['destination.country'] = error
      else if (error.includes('Length')) errorMap['dimensions.length'] = error
      else if (error.includes('Width')) errorMap['dimensions.width'] = error
      else if (error.includes('Height')) errorMap['dimensions.height'] = error
      else if (error.includes('Weight')) errorMap['dimensions.weight'] = error
      else if (error.includes('Deadline')) errorMap.deadline = error
      else if (error.includes('Valid until')) errorMap.validUntil = error
      else if (error.includes('Base cost')) errorMap['baseCost.amount'] = error
      else if (error.includes('Total price')) errorMap['totalPrice.amount'] = error
      else if (error.includes('Markup')) errorMap.markup = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const calculatePricing = useCallback((): QuotePricingCalculation | null => {
    if (!formData.baseCost?.amount || !formData.markup) return null
    
    return quotesService.calculateQuotePricing(
      formData.baseCost.amount,
      formData.markup,
      formData.baseCost.currency
    )
  }, [formData.baseCost, formData.markup])

  const resetForm = useCallback(() => {
    const defaultFormData: QuoteFormData = {
      serviceType: 'OBC',
      priority: 'standard',
      origin: { city: '', country: '', countryCode: '' },
      destination: { city: '', country: '', countryCode: '' },
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        unit: 'cm',
        weightUnit: 'kg',
      },
      description: '',
      deadline: Date.now() + (7 * 24 * 60 * 60 * 1000),
      validUntil: Date.now() + (14 * 24 * 60 * 60 * 1000),
      markup: QUOTE_CONSTANTS.DEFAULT_VALUES.MARKUP,
    }
    setFormData(initialData ? { ...defaultFormData, ...initialData } : defaultFormData)
    setErrors({})
    setIsDirty(false)
  }, [initialData])

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    calculatePricing,
    resetForm,
    setFormData,
  }
}