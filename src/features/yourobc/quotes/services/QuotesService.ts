// src/features/yourobc/quotes/services/QuotesService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateQuoteData,
  UpdateQuoteData,
  QuoteFormData,
  QuotePricingCalculation,
  CustomerId,
} from '../types'
import { QuoteListOptions } from '@/convex/lib/yourobc'

export class QuotesService {
  // Query hooks for quote data fetching
  useQuotes(authUserId: string, options?: QuoteListOptions) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.quotes.queries.getQuotes, {
        authUserId,
        options,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useQuote(authUserId: string, quoteId: Id<'yourobcQuotes'>) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.quotes.queries.getQuote, {
        quoteId,
        authUserId,
      }),
      staleTime: 300000,
      enabled: !!authUserId && !!quoteId,
    })
  }

  useQuotesByCustomer(
    authUserId: string,
    customerId: CustomerId,
    limit = 20,
    includeExpired = false
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.quotes.queries.getQuotesByCustomer, {
        authUserId,
        customerId,
        limit,
        includeExpired,
      }),
      staleTime: 300000,
      enabled: !!authUserId && !!customerId,
    })
  }

  useQuoteStats(authUserId: string, dateRange?: { start: number; end: number }) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.quotes.queries.getQuoteStats, {
        authUserId,
        dateRange,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useSearchQuotes(
    authUserId: string,
    searchTerm: string,
    limit = 20,
    includeExpired = false
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.quotes.queries.searchQuotes, {
        authUserId,
        searchTerm,
        limit,
        includeExpired,
      }),
      staleTime: 30000,
      enabled: !!authUserId && searchTerm.length >= 2,
    })
  }

  useExpiringQuotes(authUserId: string, limit = 50) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.quotes.queries.getExpiringQuotes, {
        authUserId,
        limit,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  // Mutation hooks for quote modifications
  useCreateQuote() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.quotes.mutations.createQuote),
    })
  }

  useUpdateQuote() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.quotes.mutations.updateQuote),
    })
  }

  useUpdateQuoteStatus() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.quotes.mutations.updateQuoteStatus),
    })
  }

  useSendQuote() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.quotes.mutations.sendQuote),
    })
  }

  useConvertQuote() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.quotes.mutations.convertQuoteToShipment),
    })
  }

  useDeleteQuote() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.quotes.mutations.deleteQuote),
    })
  }

  // Business operations using mutations
  async createQuote(
    mutation: ReturnType<typeof this.useCreateQuote>,
    authUserId: string,
    data: CreateQuoteData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create quote: ${error.message}`)
    }
  }

  async updateQuote(
    mutation: ReturnType<typeof this.useUpdateQuote>,
    authUserId: string,
    quoteId: Id<'yourobcQuotes'>,
    data: UpdateQuoteData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, quoteId, data })
    } catch (error: any) {
      throw new Error(`Failed to update quote: ${error.message}`)
    }
  }

  async updateQuoteStatus(
    mutation: ReturnType<typeof this.useUpdateQuoteStatus>,
    authUserId: string,
    quoteId: Id<'yourobcQuotes'>,
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
    notes?: string
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, quoteId, status, notes })
    } catch (error: any) {
      throw new Error(`Failed to update quote status: ${error.message}`)
    }
  }

  async sendQuote(
    mutation: ReturnType<typeof this.useSendQuote>,
    authUserId: string,
    quoteId: Id<'yourobcQuotes'>,
    quoteText: string,
    emailData?: {
      to: string[]
      cc?: string[]
      subject?: string
      message?: string
    }
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, quoteId, quoteText, emailData })
    } catch (error: any) {
      throw new Error(`Failed to send quote: ${error.message}`)
    }
  }

  async convertToShipment(
    mutation: ReturnType<typeof this.useConvertQuote>,
    authUserId: string,
    quoteId: Id<'yourobcQuotes'>,
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, quoteId })
    } catch (error: any) {
      throw new Error(`Failed to convert quote to shipment: ${error.message}`)
    }
  }

  async deleteQuote(
    mutation: ReturnType<typeof this.useDeleteQuote>,
    authUserId: string,
    quoteId: Id<'yourobcQuotes'>
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, quoteId })
    } catch (error: any) {
      throw new Error(`Failed to delete quote: ${error.message}`)
    }
  }

  // Utility functions for data processing
  formatQuoteNumber(quote: { quoteNumber: string }): string {
    return quote.quoteNumber
  }

  formatQuoteValue(amount: number, currency: 'EUR' | 'USD' = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  formatAddress(address: {
    street?: string
    city: string
    postalCode?: string
    country: string
    countryCode: string
  }): string {
    const parts = [address.street, address.city, address.country].filter(Boolean)
    return parts.join(', ')
  }

  formatDimensions(dimensions: {
    length: number
    width: number
    height: number
    weight: number
    unit: 'cm' | 'inch'
    weightUnit: 'kg' | 'lb'
  }): string {
    const { length, width, height, weight, unit, weightUnit } = dimensions
    return `${length}×${width}×${height} ${unit}, ${weight} ${weightUnit}`
  }

  calculateQuotePricing(
    baseCost: number,
    markup: number,
    currency: 'EUR' | 'USD' = 'EUR'
  ): QuotePricingCalculation {
    const markupAmount = Math.round((baseCost * markup / 100) * 100) / 100
    const totalPrice = Math.round((baseCost + markupAmount) * 100) / 100
    const profitMargin = baseCost > 0 ? Math.round((markupAmount / totalPrice) * 100 * 100) / 100 : 0

    return {
      baseCost,
      markup,
      markupAmount,
      totalPrice,
      currency,
      profitMargin,
    }
  }

  calculateQuoteInsights(quote: {
    createdAt: number
    validUntil: number
    deadline: number
    status: string
    totalPrice?: { amount: number }
  }) {
    const now = Date.now()
    const quoteAge = Math.floor((now - quote.createdAt) / (24 * 60 * 60 * 1000))
    const daysUntilExpiry = Math.ceil((quote.validUntil - now) / (24 * 60 * 60 * 1000))
    const isExpiring = daysUntilExpiry <= 3 && daysUntilExpiry > 0
    const isOverdue = now > quote.validUntil
    
    // Mock competitive pricing analysis (would be replaced with real data)
    const hasCompetitivePrice = quote.totalPrice ? quote.totalPrice.amount < 5000 : false
    
    const needsFollowUp = quote.status === 'sent' && quoteAge > 3
    
    let conversionProbability: 'high' | 'medium' | 'low' = 'medium'
    if (quote.status === 'sent' && !isExpiring && quoteAge <= 2) {
      conversionProbability = 'high'
    } else if (isExpiring || quoteAge > 7) {
      conversionProbability = 'low'
    }

    return {
      quoteAge,
      daysUntilExpiry,
      isExpiring,
      isOverdue,
      hasCompetitivePrice,
      needsFollowUp,
      conversionProbability,
    }
  }

  validateQuoteData(data: Partial<CreateQuoteData | UpdateQuoteData>): string[] {
    const errors: string[] = []

    // Customer validation
    if ("customerId" in data && data.customerId === undefined) {
      errors.push('Customer is required')
    }

    // Description validation
    if (data.description !== undefined && !data.description?.trim()) {
      errors.push('Description is required')
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }

    // Address validation
    if (data.origin) {
      if (!data.origin.city?.trim()) {
        errors.push('Origin city is required')
      }
      if (!data.origin.country?.trim()) {
        errors.push('Origin country is required')
      }
      if (!data.origin.countryCode?.trim()) {
        errors.push('Origin country code is required')
      }
    }

    if (data.destination) {
      if (!data.destination.city?.trim()) {
        errors.push('Destination city is required')
      }
      if (!data.destination.country?.trim()) {
        errors.push('Destination country is required')
      }
      if (!data.destination.countryCode?.trim()) {
        errors.push('Destination country code is required')
      }
    }

    // Dimensions validation
    if (data.dimensions) {
      const { length, width, height, weight } = data.dimensions
      
      if (length !== undefined && (length < 0.1 || length > 10000)) {
        errors.push('Length must be between 0.1 and 10000')
      }
      if (width !== undefined && (width < 0.1 || width > 10000)) {
        errors.push('Width must be between 0.1 and 10000')
      }
      if (height !== undefined && (height < 0.1 || height > 10000)) {
        errors.push('Height must be between 0.1 and 10000')
      }
      if (weight !== undefined && (weight < 0.1 || weight > 1000)) {
        errors.push('Weight must be between 0.1 and 1000')
      }
    }

    // Date validation
    if (data.deadline && data.deadline <= Date.now()) {
      errors.push('Deadline must be in the future')
    }

    if (data.validUntil && data.validUntil <= Date.now()) {
      errors.push('Valid until date must be in the future')
    }

    // Pricing validation
    if (data.baseCost) {
      if (data.baseCost.amount < 0) {
        errors.push('Base cost cannot be negative')
      }
      if (data.baseCost.exchangeRate !== undefined && data.baseCost.exchangeRate <= 0) {
        errors.push('Exchange rate must be positive')
      }
    }

    if (data.totalPrice) {
      if (data.totalPrice.amount < 0) {
        errors.push('Total price cannot be negative')
      }
    }

    if (data.markup !== undefined && (data.markup < 0 || data.markup > 100)) {
      errors.push('Markup must be between 0 and 100 percent')
    }

    // Length validations
    if (data.customerReference && data.customerReference.length > 50) {
      errors.push('Customer reference must be less than 50 characters')
    }

    if (data.specialInstructions && data.specialInstructions.length > 1000) {
      errors.push('Special instructions must be less than 1000 characters')
    }

    if (data.quoteText && data.quoteText.length > 2000) {
      errors.push('Quote text must be less than 2000 characters')
    }

    if (data.notes && data.notes.length > 2000) {
      errors.push('Notes must be less than 2000 characters')
    }

    return errors
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  convertDimensions(
    dimensions: {
      length: number
      width: number
      height: number
      weight: number
      unit: 'cm' | 'inch'
      weightUnit: 'kg' | 'lb'
    },
    targetUnit: 'cm' | 'inch',
    targetWeightUnit: 'kg' | 'lb'
  ) {
    let { length, width, height, weight, unit, weightUnit } = dimensions

    // Convert dimensions
    if (unit !== targetUnit) {
      const factor = unit === 'cm' ? 0.393701 : 2.54 // cm to inch or inch to cm
      length = parseFloat((length * factor).toFixed(2))
      width = parseFloat((width * factor).toFixed(2))
      height = parseFloat((height * factor).toFixed(2))
    }

    // Convert weight
    if (weightUnit !== targetWeightUnit) {
      const factor = weightUnit === 'kg' ? 2.20462 : 0.453592 // kg to lb or lb to kg
      weight = parseFloat((weight * factor).toFixed(2))
    }

    return {
      length,
      width,
      height,
      weight,
      unit: targetUnit,
      weightUnit: targetWeightUnit,
    }
  }

  generateQuoteText(quote: {
    serviceType: 'OBC' | 'NFO'
    origin: { city: string; country: string }
    destination: { city: string; country: string }
    description: string
    totalPrice?: { amount: number; currency: string }
    deadline: number
    validUntil: number
  }): string {
    const serviceLabel = quote.serviceType === 'OBC' ? 'On Board Courier' : 'Next Flight Out'
    const formattedPrice = quote.totalPrice 
      ? this.formatQuoteValue(quote.totalPrice.amount, quote.totalPrice.currency as 'EUR' | 'USD')
      : 'Price on request'
    
    const deadlineDate = new Date(quote.deadline).toLocaleDateString()
    const validDate = new Date(quote.validUntil).toLocaleDateString()

    return `Dear Valued Customer,

Thank you for your inquiry regarding ${serviceLabel} service from ${quote.origin.city}, ${quote.origin.country} to ${quote.destination.city}, ${quote.destination.country}.

Service Details:
- Item: ${quote.description}
- Service Type: ${serviceLabel}
- Route: ${quote.origin.city} → ${quote.destination.city}
- Delivery Deadline: ${deadlineDate}

Quote Details:
- Total Price: ${formattedPrice}
- Quote Valid Until: ${validDate}

This quote includes all necessary arrangements for secure and timely delivery of your shipment. Our experienced couriers ensure professional handling throughout the entire transport process.

Please let us know if you have any questions or if you would like to proceed with this shipment.

Best regards,
Your Logistics Team`
  }
}

export const quotesService = new QuotesService()