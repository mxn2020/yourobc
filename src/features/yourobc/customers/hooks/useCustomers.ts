// src/features/yourobc/customers/hooks/useCustomers.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { customersService } from '../services/CustomersService'
import { CUSTOMER_CONSTANTS } from '../types'
import { parseConvexError, type ParsedError } from '@/utils/errorHandling'
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
  const authUser = useAuthenticatedUser()

  const {
    data: customersQuery,
    isPending,
    error,
    refetch,
  } = customersService.useCustomers(authUser?.id!, options)

  const {
    data: stats,
    isPending: isStatsLoading,
  } = customersService.useCustomerStats(authUser?.id!)

  const createMutation = customersService.useCreateCustomer()
  const updateMutation = customersService.useUpdateCustomer()
  const deleteMutation = customersService.useDeleteCustomer()

  // Parse error for better user experience
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null
  }, [error])

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED'

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

    return await customersService.createCustomer(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updateCustomer = useCallback(async (
    customerId: CustomerId,
    updates: Partial<CustomerFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = customersService.validateCustomerData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

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

    return await customersService.updateCustomer(updateMutation, authUser.id, customerId, updateData)
  }, [authUser, updateMutation])

  const deleteCustomer = useCallback(async (customerId: CustomerId) => {
    if (!authUser) throw new Error('Authentication required')
    return await customersService.deleteCustomer(deleteMutation, authUser.id, customerId)
  }, [authUser, deleteMutation])

  const canCreateCustomers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canEditCustomers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canDeleteCustomers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

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
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch,
    canCreateCustomers,
    canEditCustomers,
    canDeleteCustomers,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single customer
 */
export function useCustomer(customerId?: CustomerId) {
  // Always call ALL hooks at the top level (Rules of Hooks)
  const authUser = useAuthenticatedUser()

  // Call service hooks unconditionally - the enabled flag will prevent actual API calls
  const {
    data: customer,
    isPending,
    error,
    refetch,
  } = customersService.useCustomer(authUser?.id!, customerId)

  const {
    data: activity,
    isPending: isActivityLoading,
  } = customersService.useCustomerActivity(authUser?.id!, customerId)

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
      potentialValue: customer.stats.totalRevenue * 1.2, // Mock calculation
    }
  }, [customer])

  // Mock customer metrics (would come from actual data queries)
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
      totalShipments: 0, // Would come from shipments query
      averageOrderValue: customer.stats.acceptedQuotes > 0
        ? customer.stats.totalRevenue / customer.stats.acceptedQuotes
        : 0,
      lastOrderDate: customer.stats.lastQuoteDate,
      customerLifetime: Date.now() - (customer.createdAt || Date.now()),
    }
  }, [customer])

  // Early return AFTER all hooks are called
  if (!customerId || !authUser) {
    return {
      customer: null,
      activity: null,
      customerInsights: null,
      customerMetrics: null,
      isLoading: false,
      isActivityLoading: false,
      error: null,
      refetch: () => {},
    }
  }

  return {
    customer,
    activity,
    customerInsights,
    customerMetrics,
    isLoading: isPending,
    isActivityLoading,
    error,
    refetch,
  }
}

/**
 * Hook for customer search
 */
export function useCustomerSearch(searchTerm: string) {
  const authUser = useAuthenticatedUser()

  const {
    data: searchResults,
    isPending,
    error,
  } = customersService.useSearchCustomers(authUser?.id!, searchTerm)

  return {
    results: searchResults || [],
    isLoading: isPending,
    error,
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
  const authUser = useAuthenticatedUser()

  const {
    data: topCustomers,
    isPending,
    error,
  } = customersService.useTopCustomers(authUser?.id!, limit, sortBy)

  return {
    topCustomers: topCustomers || [],
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for customer tags management
 */
export function useCustomerTags(customerId?: CustomerId) {
  const authUser = useAuthenticatedUser()

  const {
    data: allTags,
    isPending: isLoadingTags,
  } = customersService.useCustomerTags(authUser?.id!)

  const addTagMutation = customersService.useAddCustomerTag()
  const removeTagMutation = customersService.useRemoveCustomerTag()

  const addTag = useCallback(async (tag: string) => {
    if (!authUser || !customerId) throw new Error('Authentication and customer ID required')
    return await customersService.addTag(addTagMutation, authUser.id, customerId, tag)
  }, [authUser, customerId, addTagMutation])

  const removeTag = useCallback(async (tag: string) => {
    if (!authUser || !customerId) throw new Error('Authentication and customer ID required')
    return await customersService.removeTag(removeTagMutation, authUser.id, customerId, tag)
  }, [authUser, customerId, removeTagMutation])

  return {
    allTags: allTags || [],
    isLoadingTags,
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