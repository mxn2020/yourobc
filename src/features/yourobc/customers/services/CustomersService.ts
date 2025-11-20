// src/features/yourobc/customers/services/CustomersService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFormData,
  CustomerSearchFilters,
} from '../types'
import { CustomerId } from '@/convex/lib/yourobc'

export class CustomersService {
  // Query hooks for customer data fetching
  useCustomers(
    authUserId: string,
    options?: {
      limit?: number
      offset?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      filters?: CustomerSearchFilters
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.customers.queries.getCustomers, {
        authUserId,
        options,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useCustomer(authUserId: string, customerId?: CustomerId) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.customers.queries.getCustomer, {
        customerId,
        authUserId,
      }),
      staleTime: 300000,
      enabled: !!authUserId && !!customerId,
    })
  }

  useCustomerStats(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.customers.queries.getCustomerStats, {
        authUserId,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useSearchCustomers(
    authUserId: string,
    searchTerm: string,
    limit = 20,
    includeInactive = false
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.customers.queries.searchCustomers, {
        authUserId,
        searchTerm,
        limit,
        includeInactive,
      }),
      staleTime: 30000,
      enabled: !!authUserId && searchTerm.length >= 2,
    })
  }

  useCustomerActivity(
    authUserId: string,
    customerId?: CustomerId,
    limit = 50
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.customers.queries.getCustomerActivity, {
        authUserId,
        customerId,
        limit
      }),
      staleTime: 60000,
      enabled: !!authUserId && !!customerId,
    })
  }

  useTopCustomers(
    authUserId: string,
    limit = 10,
    sortBy: 'revenue' | 'yourobcQuotes' | 'score' = 'revenue'
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.customers.queries.getTopCustomers, {
        authUserId,
        limit,
        sortBy,
      }),
      staleTime: 300000,
      enabled: !!authUserId,
    })
  }

  useCustomerTags(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.customers.queries.getCustomerTags, {
        authUserId,
      }),
      staleTime: 300000,
      enabled: !!authUserId,
    })
  }

  // Mutation hooks for customer modifications
  useCreateCustomer() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.customers.mutations.createCustomer),
    })
  }

  useUpdateCustomer() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.customers.mutations.updateCustomer),
    })
  }

  useDeleteCustomer() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.customers.mutations.deleteCustomer),
    })
  }

  useUpdateCustomerStats() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.customers.mutations.updateCustomerStats),
    })
  }

  useAddCustomerTag() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.customers.mutations.addCustomerTag),
    })
  }

  useRemoveCustomerTag() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.customers.mutations.removeCustomerTag),
    })
  }

  // Business operations using mutations
  async createCustomer(
    mutation: ReturnType<typeof this.useCreateCustomer>,
    authUserId: string,
    data: CreateCustomerData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create customer: ${error.message}`)
    }
  }

  async updateCustomer(
    mutation: ReturnType<typeof this.useUpdateCustomer>,
    authUserId: string,
    customerId: CustomerId,
    data: UpdateCustomerData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, customerId, data })
    } catch (error: any) {
      throw new Error(`Failed to update customer: ${error.message}`)
    }
  }

  async deleteCustomer(
    mutation: ReturnType<typeof this.useDeleteCustomer>,
    authUserId: string,
    customerId: CustomerId
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, customerId })
    } catch (error: any) {
      throw new Error(`Failed to delete customer: ${error.message}`)
    }
  }

  async addTag(
    mutation: ReturnType<typeof this.useAddCustomerTag>,
    authUserId: string,
    customerId: CustomerId,
    tag: string
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, customerId, tag })
    } catch (error: any) {
      throw new Error(`Failed to add tag: ${error.message}`)
    }
  }

  async removeTag(
    mutation: ReturnType<typeof this.useRemoveCustomerTag>,
    authUserId: string,
    customerId: CustomerId,
    tag: string
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, customerId, tag })
    } catch (error: any) {
      throw new Error(`Failed to remove tag: ${error.message}`)
    }
  }

  // Utility functions for data processing
  formatCustomerName(customer: {
    companyName: string
    shortName?: string
  }): string {
    return customer.shortName || customer.companyName
  }

  formatAddress(address: {
    street?: string
    city: string
    postalCode?: string
    country: string
    countryCode: string
  }): string {
    const parts = [
      address.street,
      address.city,
      address.postalCode,
      address.country,
    ].filter(Boolean)
    return parts.join(', ')
  }

  calculateCustomerScore(customer: {
    stats: {
      totalQuotes: number
      acceptedQuotes: number
      totalRevenue: number
      lastQuoteDate?: number
      lastShipmentDate?: number
    }
    status: string
  }): number {
    let score = 0

    // Revenue contribution (40% of score)
    if (customer.stats.totalRevenue > 100000) score += 40
    else if (customer.stats.totalRevenue > 50000) score += 30
    else if (customer.stats.totalRevenue > 10000) score += 20
    else if (customer.stats.totalRevenue > 1000) score += 10

    // Quote acceptance rate (30% of score)
    if (customer.stats.totalQuotes > 0) {
      const acceptanceRate = customer.stats.acceptedQuotes / customer.stats.totalQuotes
      score += Math.round(acceptanceRate * 30)
    }

    // Activity recency (20% of score)
    const now = Date.now()
    const oneMonth = 30 * 24 * 60 * 60 * 1000
    const threeMonths = 90 * 24 * 60 * 60 * 1000

    if (customer.stats.lastQuoteDate && (now - customer.stats.lastQuoteDate) < oneMonth) {
      score += 20
    } else if (customer.stats.lastQuoteDate && (now - customer.stats.lastQuoteDate) < threeMonths) {
      score += 10
    }

    // Account status (10% of score)
    if (customer.status === 'active') score += 10
    else if (customer.status === 'inactive') score += 5

    return Math.min(score, 100)
  }

  getCustomerRiskLevel(customer: {
    stats: {
      totalRevenue: number
      totalQuotes: number
      acceptedQuotes: number
    }
    status: string
    paymentTerms: number
  }): 'low' | 'medium' | 'high' {
    if (customer.status === 'blacklisted') return 'high'

    const score = this.calculateCustomerScore({
      stats: customer.stats,
      status: customer.status,
    })

    // Additional risk factors
    let riskFactors = 0

    // Long payment terms
    if (customer.paymentTerms > 60) riskFactors++

    // Low acceptance rate
    if (customer.stats.totalQuotes > 5) {
      const acceptanceRate = customer.stats.acceptedQuotes / customer.stats.totalQuotes
      if (acceptanceRate < 0.3) riskFactors++
    }

    // Low revenue despite many quotes
    if (customer.stats.totalQuotes > 10 && customer.stats.totalRevenue < 5000) {
      riskFactors++
    }

    if (score >= 70 && riskFactors === 0) return 'low'
    if (score >= 40 && riskFactors <= 1) return 'medium'
    return 'high'
  }

  isCustomerActive(customer: {
    status: string
    stats: {
      lastQuoteDate?: number
      lastShipmentDate?: number
    }
  }, daysThreshold = 90): boolean {
    if (customer.status !== 'active') return false

    const now = Date.now()
    const threshold = daysThreshold * 24 * 60 * 60 * 1000

    if (customer.stats.lastQuoteDate && (now - customer.stats.lastQuoteDate) < threshold) {
      return true
    }

    if (customer.stats.lastShipmentDate && (now - customer.stats.lastShipmentDate) < threshold) {
      return true
    }

    return false
  }

  validateCustomerData(data: Partial<CustomerFormData>): string[] {
    const errors: string[] = []

    // Company name validation
    if (data.companyName !== undefined && !data.companyName?.trim()) {
      errors.push('Company name is required')
    }

    if (data.companyName && data.companyName.length > 200) {
      errors.push('Company name must be less than 200 characters')
    }

    if (data.shortName && data.shortName.length > 50) {
      errors.push('Short name must be less than 50 characters')
    }

    // Contact validation
    if (data.primaryContact) {
      if (!data.primaryContact.name?.trim()) {
        errors.push('Primary contact name is required')
      }

      if (data.primaryContact.email && !this.isValidEmail(data.primaryContact.email)) {
        errors.push('Primary contact email format is invalid')
      }

      if (data.primaryContact.phone && !this.isValidPhone(data.primaryContact.phone)) {
        errors.push('Primary contact phone format is invalid')
      }
    }

    // Additional contacts validation
    if (data.additionalContacts) {
      if (data.additionalContacts.length > 10) {
        errors.push('Maximum 10 additional contacts allowed')
      }

      data.additionalContacts.forEach((contact, index) => {
        if (!contact.name?.trim()) {
          errors.push(`Contact ${index + 1}: Name is required`)
        }

        if (contact.email && !this.isValidEmail(contact.email)) {
          errors.push(`Contact ${index + 1}: Invalid email format`)
        }

        if (contact.phone && !this.isValidPhone(contact.phone)) {
          errors.push(`Contact ${index + 1}: Invalid phone format`)
        }
      })
    }

    // Address validation
    if (data.billingAddress) {
      if (!data.billingAddress.city?.trim()) {
        errors.push('Billing address city is required')
      }

      if (!data.billingAddress.country?.trim()) {
        errors.push('Billing address country is required')
      }

      if (!data.billingAddress.countryCode?.trim()) {
        errors.push('Billing address country code is required')
      }
    }

    if (data.shippingAddress) {
      if (!data.shippingAddress.city?.trim()) {
        errors.push('Shipping address city is required')
      }

      if (!data.shippingAddress.country?.trim()) {
        errors.push('Shipping address country is required')
      }

      if (!data.shippingAddress.countryCode?.trim()) {
        errors.push('Shipping address country code is required')
      }
    }

    // Payment terms validation
    if (data.paymentTerms !== undefined) {
      if (data.paymentTerms < 0 || data.paymentTerms > 365) {
        errors.push('Payment terms must be between 0 and 365 days')
      }
    }

    // Margin validation
    if (data.margin !== undefined) {
      if (data.margin < -100 || data.margin > 1000) {
        errors.push('Margin must be between -100 and 1000 percent')
      }
    }

    // Tags validation
    if (data.tags && data.tags.length > 20) {
      errors.push('Maximum 20 tags allowed')
    }

    // Website validation
    if (data.website && !this.isValidUrl(data.website)) {
      errors.push('Website URL format is invalid')
    }

    // Notes validation
    if (data.notes && data.notes.length > 5000) {
      errors.push('Notes must be less than 5000 characters')
    }

    if (data.internalNotes && data.internalNotes.length > 5000) {
      errors.push('Internal notes must be less than 5000 characters')
    }

    return errors
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  getPaymentTermsLabel(days: number): string {
    if (days === 0) return 'Due on Receipt'
    if (days === -1) return 'Cash in Advance'
    return `Net ${days}`
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }
}

export const customersService = new CustomersService()