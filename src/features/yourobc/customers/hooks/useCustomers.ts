// src/features/yourobc/customers/hooks/useCustomers.ts

import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { useAuthenticatedUser } from '@/features/system/auth'
import { customersService } from '../services/CustomersService'
import { useCustomerAudit } from './useCustomerAudit'
import { useCustomerPermissions } from './useCustomerPermissions'
import { CUSTOMER_CONSTANTS } from '../types'
import { api } from '@/convex/_generated/api'
import type {
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFormData,
  CustomerId,
  CustomerListItem,
  CustomerInsights,
  CustomerPerformanceMetrics,
  CustomerSearchFilters,
  CustomerSortOptions,
} from '../types'

/**
 * Main hook for customer management
 */
export function useCustomers(options?: {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: CustomerSearchFilters
  autoRefresh?: boolean
}) {
  // Performance tracking (dev mode only)
  const instanceId = useRef(Math.random().toString(36).substr(2, 9))
  const startTimeRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (import.meta.env.DEV) {
      startTimeRef.current = performance.now()
    }
  }, [])

  const authUser = useAuthenticatedUser()
  const queryClient = useQueryClient()
  const audit = useCustomerAudit()
  const permissions = useCustomerPermissions()

  // Switch to useSuspenseQuery for better SSR
  const { data: customersQuery, refetch } = useSuspenseQuery(
    customersService.getCustomersQueryOptions(options)
  )

  const { data: stats } = useSuspenseQuery(
    customersService.getCustomerStatsQueryOptions()
  )

  // Log performance after data loads (dev mode only)
  useEffect(() => {
    if (import.meta.env.DEV && !startTimeRef.current) return

    if (customersQuery && startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current
      const source = duration < 10 ? 'from SSR cache' : 'from WebSocket'
      console.log(
        `useCustomers[${instanceId.current}]: ${duration.toFixed(2)}ms - Loaded ${
          customersQuery.customers?.length || 0
        } customers ${source}`
      )
      startTimeRef.current = undefined // Clear to prevent duplicate logs
    }
  }, [customersQuery])

  // Mutations with audit logging integration
  const createMutation = useConvexMutation(
    api.lib.yourobc.customers.mutations.createCustomer
  )

  const updateMutation = useConvexMutation(
    api.lib.yourobc.customers.mutations.updateCustomer
  )

  const deleteMutation = useConvexMutation(
    api.lib.yourobc.customers.mutations.deleteCustomer
  )

  const createCustomer = useCallback(async (customerData: CustomerFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = customersService.validateCustomerData(customerData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateCustomerData = {
      companyName: customerData.companyName.trim(),
      shortName: customerData.shortName?.trim(),
      primaryContact: {
        name: customerData.primaryContact.name.trim(),
        email: customerData.primaryContact.email?.trim(),
        phone: customerData.primaryContact.phone?.trim(),
        isPrimary: true,
      },
      additionalContacts: customerData.additionalContacts?.map(contact => ({
        name: contact.name.trim(),
        email: contact.email?.trim(),
        phone: contact.phone?.trim(),
        isPrimary: false,
      })),
      billingAddress: customerData.billingAddress,
      shippingAddress: customerData.shippingAddress,
      defaultCurrency: customerData.defaultCurrency || CUSTOMER_CONSTANTS.DEFAULT_VALUES.CURRENCY,
      paymentTerms: customerData.paymentTerms ?? CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
      paymentMethod: customerData.paymentMethod || CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_METHOD,
      margin: customerData.margin ?? CUSTOMER_CONSTANTS.DEFAULT_VALUES.MARGIN,
      inquirySourceId: customerData.inquirySourceId,
      tags: customerData.tags || [],
      notes: customerData.notes?.trim(),
      internalNotes: customerData.internalNotes?.trim(),
      website: customerData.website?.trim(),
    }

    const result = await createMutation.mutateAsync({ data: createData })

    // Invalidate queries
    queryClient.invalidateQueries({
      queryKey: [api.lib.yourobc.customers.queries.getCustomers],
    })

    // Log audit
    audit.logCustomerCreated(result._id, createData.companyName, createData)

    return result
  }, [authUser, createMutation, queryClient, audit])

  const updateCustomer = useCallback(async (
    customerId: CustomerId,
    updates: Partial<CustomerFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = customersService.validateCustomerData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const current = customersQuery?.customers?.find(c => c._id === customerId)
    if (!current) throw new Error('Customer not found')

    const updateData: UpdateCustomerData = {}
    if (updates.companyName !== undefined) updateData.companyName = updates.companyName.trim()
    if (updates.shortName !== undefined) updateData.shortName = updates.shortName?.trim()
    if (updates.primaryContact !== undefined) {
      updateData.primaryContact = {
        name: updates.primaryContact.name.trim(),
        email: updates.primaryContact.email?.trim(),
        phone: updates.primaryContact.phone?.trim(),
        isPrimary: true,
      }
    }
    if (updates.additionalContacts !== undefined) {
      updateData.additionalContacts = updates.additionalContacts.map(contact => ({
        name: contact.name.trim(),
        email: contact.email?.trim(),
        phone: contact.phone?.trim(),
        isPrimary: false,
      }))
    }
    if (updates.billingAddress !== undefined) updateData.billingAddress = updates.billingAddress
    if (updates.shippingAddress !== undefined) updateData.shippingAddress = updates.shippingAddress
    if (updates.defaultCurrency !== undefined) updateData.defaultCurrency = updates.defaultCurrency
    if (updates.paymentTerms !== undefined) updateData.paymentTerms = updates.paymentTerms
    if (updates.paymentMethod !== undefined) updateData.paymentMethod = updates.paymentMethod
    if (updates.margin !== undefined) updateData.margin = updates.margin
    if (updates.inquirySourceId !== undefined) updateData.inquirySourceId = updates.inquirySourceId
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.notes !== undefined) updateData.notes = updates.notes?.trim()
    if (updates.internalNotes !== undefined) updateData.internalNotes = updates.internalNotes?.trim()
    if (updates.website !== undefined) updateData.website = updates.website?.trim()

    const result = await updateMutation.mutateAsync({ customerId, data: updateData })

    // Invalidate queries
    queryClient.invalidateQueries({
      queryKey: [api.lib.yourobc.customers.queries.getCustomers],
    })

    // Log audit
    audit.logCustomerUpdated(customerId, current.companyName, current, updateData)

    return result
  }, [authUser, updateMutation, queryClient, audit, customersQuery])

  const deleteCustomer = useCallback(async (customerId: CustomerId) => {
    if (!authUser) throw new Error('Authentication required')

    const customer = customersQuery?.customers?.find(c => c._id === customerId)
    if (!customer) throw new Error('Customer not found')

    const result = await deleteMutation.mutateAsync({ customerId })

    // Invalidate queries
    queryClient.invalidateQueries({
      queryKey: [api.lib.yourobc.customers.queries.getCustomers],
    })

    // Log audit
    audit.logCustomerDeleted(customerId, customer.companyName, customer, false)

    return result
  }, [authUser, deleteMutation, queryClient, audit, customersQuery])

  const enrichedCustomers = useMemo(() => {
    const customers = customersQuery?.customers || []
    return customers.map((customer): CustomerListItem => ({
      ...customer,
      displayName: customersService.formatCustomerName(customer),
      formattedBillingAddress: customersService.formatAddress(customer.billingAddress),
      formattedShippingAddress: customer.shippingAddress
        ? customersService.formatAddress(customer.shippingAddress)
        : undefined,
      hasRecentActivity: customersService.isCustomerActive(customer),
      lastContactDate: customer.stats.lastQuoteDate || customer.stats.lastShipmentDate,
      totalValue: customer.stats.totalRevenue,
    }))
  }, [customersQuery])

  return {
    customers: enrichedCustomers,
    total: customersQuery?.total || 0,
    hasMore: customersQuery?.hasMore || false,
    stats,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch,
    ...permissions,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single customer
 */
export function useCustomer(customerId?: CustomerId) {
  const authUser = useAuthenticatedUser()
  const audit = useCustomerAudit()

  // Use suspenseQuery - will suspend if no customerId
  const { data: customer, refetch } = useSuspenseQuery({
    ...customersService.getCustomerQueryOptions(customerId!),
    enabled: !!customerId,
  })

  const { data: activity } = useSuspenseQuery({
    ...customersService.getCustomerActivityQueryOptions(customerId!),
    enabled: !!customerId,
  })

  // Log view on mount (for analytics/compliance)
  useEffect(() => {
    if (customer && customerId) {
      audit.logCustomerViewed(customerId, customer.companyName)
    }
  }, [customer, customerId, audit])

  const customerInsights = useMemo((): CustomerInsights | null => {
    if (!customer) return null

    const score = customersService.calculateCustomerScore(customer)
    const riskLevel = customersService.getCustomerRiskLevel(customer)

    const daysSinceCreated = Math.floor(
      (Date.now() - (customer.createdAt || Date.now())) / (24 * 60 * 60 * 1000)
    )

    const daysSinceLastOrder = customer.stats.lastQuoteDate
      ? Math.floor((Date.now() - customer.stats.lastQuoteDate) / (24 * 60 * 60 * 1000))
      : null

    return {
      score,
      riskLevel,
      customerAge: daysSinceCreated,
      daysSinceLastOrder,
      needsAttention: daysSinceLastOrder !== null && daysSinceLastOrder > 90,
      isNewCustomer: daysSinceCreated <= 30,
      isTopCustomer: score >= 80,
      potentialValue: customer.stats.totalRevenue * 1.2,
    }
  }, [customer])

  const customerMetrics = useMemo((): CustomerPerformanceMetrics | null => {
    if (!customer) return null

    const acceptanceRate = customer.stats.totalQuotes > 0
      ? customer.stats.acceptedQuotes / customer.stats.totalQuotes
      : 0

    return {
      totalQuotes: customer.stats.totalQuotes,
      acceptedQuotes: customer.stats.acceptedQuotes,
      rejectedQuotes: customer.stats.totalQuotes - customer.stats.acceptedQuotes,
      totalRevenue: customer.stats.totalRevenue,
      totalShipments: 0,
      averageOrderValue: customer.stats.acceptedQuotes > 0
        ? customer.stats.totalRevenue / customer.stats.acceptedQuotes
        : 0,
      lastOrderDate: customer.stats.lastQuoteDate,
      customerLifetime: Date.now() - (customer.createdAt || Date.now()),
    }
  }, [customer])

  return {
    customer,
    activity,
    customerInsights,
    customerMetrics,
    refetch,
  }
}

/**
 * Hook for customer search
 */
export function useCustomerSearch(searchTerm: string) {
  const { data: searchResults } = useSuspenseQuery(
    customersService.getSearchCustomersQueryOptions(searchTerm)
  )

  return {
    results: searchResults || [],
    hasResults: (searchResults?.length || 0) > 0,
  }
}

/**
 * Hook for top customers
 */
export function useTopCustomers(
  limit = 10,
  sortBy: 'revenue' | 'yourobcQuotes' | 'score' = 'revenue'
) {
  const { data: topCustomers } = useSuspenseQuery(
    customersService.getTopCustomersQueryOptions(limit, sortBy)
  )

  return {
    topCustomers: topCustomers || [],
  }
}

/**
 * Hook for customer tags management
 */
export function useCustomerTags(customerId?: CustomerId, customerName?: string) {
  const authUser = useAuthenticatedUser()
  const audit = useCustomerAudit()
  const queryClient = useQueryClient()

  const { data: allTags } = useSuspenseQuery(
    customersService.getCustomerTagsQueryOptions()
  )

  const addTagMutation = useConvexMutation(
    api.lib.yourobc.customers.mutations.addCustomerTag
  )

  const removeTagMutation = useConvexMutation(
    api.lib.yourobc.customers.mutations.removeCustomerTag
  )

  const addTag = useCallback(async (tag: string) => {
    if (!authUser || !customerId) throw new Error('Authentication and customer ID required')

    const result = await addTagMutation.mutateAsync({ customerId, tag })

    // Invalidate queries
    queryClient.invalidateQueries({
      queryKey: [api.lib.yourobc.customers.queries.getCustomers],
    })

    // Log audit
    if (customerName) {
      audit.logCustomerTagAdded(customerId, customerName, tag)
    }

    return result
  }, [authUser, customerId, customerName, addTagMutation, queryClient, audit])

  const removeTag = useCallback(async (tag: string) => {
    if (!authUser || !customerId) throw new Error('Authentication and customer ID required')

    const result = await removeTagMutation.mutateAsync({ customerId, tag })

    // Invalidate queries
    queryClient.invalidateQueries({
      queryKey: [api.lib.yourobc.customers.queries.getCustomers],
    })

    // Log audit
    if (customerName) {
      audit.logCustomerTagRemoved(customerId, customerName, tag)
    }

    return result
  }, [authUser, customerId, customerName, removeTagMutation, queryClient, audit])

  return {
    allTags: allTags || [],
    addTag,
    removeTag,
    isAddingTag: addTagMutation.isPending,
    isRemovingTag: removeTagMutation.isPending,
  }
}

/**
 * Hook for customer form management
 */
export function useCustomerForm(initialData?: Partial<CustomerFormData>) {
  const [formData, setFormData] = useState<CustomerFormData>({
    companyName: '',
    primaryContact: {
      name: '',
      isPrimary: true,
    },
    billingAddress: {
      city: '',
      country: '',
      countryCode: '',
    },
    defaultCurrency: CUSTOMER_CONSTANTS.DEFAULT_VALUES.CURRENCY,
    paymentTerms: CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
    paymentMethod: CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_METHOD,
    margin: CUSTOMER_CONSTANTS.DEFAULT_VALUES.MARGIN,
    tags: [],
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
    const validationErrors = customersService.validateCustomerData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('Company name')) errorMap.companyName = error
      else if (error.includes('Primary contact name')) errorMap['primaryContact.name'] = error
      else if (error.includes('Primary contact email')) errorMap['primaryContact.email'] = error
      else if (error.includes('Primary contact phone')) errorMap['primaryContact.phone'] = error
      else if (error.includes('Billing address city')) errorMap['billingAddress.city'] = error
      else if (error.includes('Billing address country')) errorMap['billingAddress.country'] = error
      else if (error.includes('Website')) errorMap.website = error
      else if (error.includes('Payment terms')) errorMap.paymentTerms = error
      else if (error.includes('Margin')) errorMap.margin = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: CustomerFormData = {
      companyName: '',
      primaryContact: { name: '', isPrimary: true },
      billingAddress: { city: '', country: '', countryCode: '' },
      defaultCurrency: CUSTOMER_CONSTANTS.DEFAULT_VALUES.CURRENCY,
      paymentTerms: CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
      paymentMethod: CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_METHOD,
      margin: CUSTOMER_CONSTANTS.DEFAULT_VALUES.MARGIN,
      tags: [],
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
    resetForm,
    setFormData,
  }
}