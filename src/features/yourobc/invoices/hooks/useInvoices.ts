// src/features/yourobc/invoices/hooks/useInvoices.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { invoicesService } from '../services/InvoicesService'
import { parseConvexError, type ParsedError } from '@/utils/errorHandling'
import { INVOICE_CONSTANTS } from '../types'
import type {
  CreateInvoiceData,
  UpdateInvoiceData,
  InvoiceFormData,
  PaymentFormData,
  CollectionAttemptFormData,
  InvoiceId,
  InvoiceListItem,
  InvoiceSearchFilters,
} from '../types'
import type { CustomerId, PartnerId, ShipmentId } from '@/convex/lib/yourobc'

/**
 * Main hook for invoice management
 */
export function useInvoices(options?: {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: InvoiceSearchFilters
  autoRefresh?: boolean
}) {
  const authUser = useAuthenticatedUser()

  const {
    data: invoicesQuery,
    isPending,
    error,
    refetch,
  } = invoicesService.useInvoices(authUser?.id!, options)

  const {
    data: stats,
    isPending: isStatsLoading,
  } = invoicesService.useInvoiceStats(authUser?.id!)

  const createMutation = invoicesService.useCreateInvoice()
  const updateMutation = invoicesService.useUpdateInvoice()
  const updateStatusMutation = invoicesService.useUpdateInvoiceStatus()
  const processPaymentMutation = invoicesService.useProcessPayment()
  const deleteMutation = invoicesService.useDeleteInvoice()

  // Parse error for better user experience
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null
  }, [error])

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED'

  const createInvoice = useCallback(async (invoiceData: InvoiceFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = invoicesService.validateInvoiceData(invoiceData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateInvoiceData = {
      type: invoiceData.type,
      shipmentId: invoiceData.shipmentId as ShipmentId,
      customerId: invoiceData.customerId as CustomerId,
      partnerId: invoiceData.partnerId as PartnerId,
      invoiceNumber: invoiceData.invoiceNumber,
      externalInvoiceNumber: invoiceData.externalInvoiceNumber,
      issueDate: invoiceData.issueDate,
      dueDate: invoiceData.dueDate,
      description: invoiceData.description.trim(),
      lineItems: invoiceData.lineItems,
      subtotal: invoiceData.subtotal,
      taxAmount: invoiceData.taxAmount,
      taxRate: invoiceData.taxRate,
      totalAmount: invoiceData.totalAmount,
      paymentTerms: invoiceData.paymentTerms,
      billingAddress: invoiceData.billingAddress,
      purchaseOrderNumber: invoiceData.purchaseOrderNumber?.trim(),
      notes: invoiceData.notes?.trim(),
    }

    return await invoicesService.createInvoice(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updateInvoice = useCallback(async (
    invoiceId: InvoiceId,
    updates: Partial<InvoiceFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = invoicesService.validateInvoiceData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const updateData: UpdateInvoiceData = {}
    if (updates.invoiceNumber !== undefined) updateData.invoiceNumber = updates.invoiceNumber
    if (updates.externalInvoiceNumber !== undefined) updateData.externalInvoiceNumber = updates.externalInvoiceNumber
    if (updates.issueDate !== undefined) updateData.issueDate = updates.issueDate
    if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate
    if (updates.description !== undefined) updateData.description = updates.description.trim()
    if (updates.lineItems !== undefined) updateData.lineItems = updates.lineItems
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal
    if (updates.taxAmount !== undefined) updateData.taxAmount = updates.taxAmount
    if (updates.taxRate !== undefined) updateData.taxRate = updates.taxRate
    if (updates.totalAmount !== undefined) updateData.totalAmount = updates.totalAmount
    if (updates.paymentTerms !== undefined) updateData.paymentTerms = updates.paymentTerms
    if (updates.billingAddress !== undefined) updateData.billingAddress = updates.billingAddress
    if (updates.purchaseOrderNumber !== undefined) updateData.purchaseOrderNumber = updates.purchaseOrderNumber?.trim()
    if (updates.notes !== undefined) updateData.notes = updates.notes?.trim()

    return await invoicesService.updateInvoice(updateMutation, authUser.id, invoiceId, updateData)
  }, [authUser, updateMutation])

  const updateInvoiceStatus = useCallback(async (
    invoiceId: InvoiceId,
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
    reason?: string
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await invoicesService.updateInvoiceStatus(updateStatusMutation, authUser.id, invoiceId, status, reason)
  }, [authUser, updateStatusMutation])

  const processPayment = useCallback(async (
    invoiceId: InvoiceId,
    paymentData: PaymentFormData
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = invoicesService.validatePaymentData(paymentData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    return await invoicesService.processPayment(processPaymentMutation, authUser.id, invoiceId, paymentData)
  }, [authUser, processPaymentMutation])

  const deleteInvoice = useCallback(async (invoiceId: InvoiceId) => {
    if (!authUser) throw new Error('Authentication required')
    return await invoicesService.deleteInvoice(deleteMutation, authUser.id, invoiceId)
  }, [authUser, deleteMutation])

  const canCreateInvoices = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canEditInvoices = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canDeleteInvoices = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canProcessPayments = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const enrichedInvoices = useMemo(() => {
    const invoices = invoicesQuery?.invoices || []
    return invoices.map((invoice): InvoiceListItem => ({
      ...invoice,
      formattedTotal: invoicesService.formatCurrencyAmount(invoice.totalAmount),
      formattedDueDate: new Date(invoice.dueDate).toLocaleDateString(),
      daysToDue: Math.ceil((invoice.dueDate - Date.now()) / (1000 * 60 * 60 * 24)),
      agingCategory: getAgingCategory(invoice.dueDate, invoice.status),
    }))
  }, [invoicesQuery])

  return {
    invoices: enrichedInvoices,
    total: invoicesQuery?.total || 0,
    hasMore: invoicesQuery?.hasMore || false,
    stats,
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    processPayment,
    deleteInvoice,
    refetch,
    canCreateInvoices,
    canEditInvoices,
    canDeleteInvoices,
    canProcessPayments,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isProcessingPayment: processPaymentMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single invoice
 */
export function useInvoice(invoiceId?: InvoiceId) {
  if (!invoiceId) {
    return {
      invoice: null,
      invoiceInsights: null,
      isLoading: false,
      error: null,
      refetch: () => {},
      addCollectionAttempt: async () => {},
      isAddingAttempt: false,
    }
  }
  
  const authUser = useAuthenticatedUser()

  const {
    data: invoice,
    isPending,
    error,
    refetch,
  } = invoicesService.useInvoice(authUser?.id!, invoiceId)

  const addCollectionAttemptMutation = invoicesService.useAddCollectionAttempt()

  const addCollectionAttempt = useCallback(async (
    attemptData: CollectionAttemptFormData
  ) => {
    if (!authUser) throw new Error('Authentication required')

    return await invoicesService.addCollectionAttempt(
      addCollectionAttemptMutation,
      authUser.id,
      invoiceId,
      attemptData
    )
  }, [authUser, addCollectionAttemptMutation, invoiceId])

  const invoiceInsights = useMemo(() => {
    if (!invoice) return null

    const overdueStatus = invoicesService.getOverdueStatus(invoice)
    const daysSinceIssue = Math.floor((Date.now() - invoice.issueDate) / (1000 * 60 * 60 * 24))
    const nextAction = invoicesService.getNextCollectionAction(invoice.collectionAttempts || [])

    return {
      overdueStatus,
      daysSinceIssue,
      nextAction,
      needsAttention: overdueStatus.isOverdue || overdueStatus.severity === 'warning',
      isNewInvoice: daysSinceIssue <= 7,
      hasCollectionAttempts: (invoice.collectionAttempts || []).length > 0,
    }
  }, [invoice])

  return {
    invoice,
    invoiceInsights,
    isLoading: isPending,
    error,
    refetch,
    addCollectionAttempt,
    isAddingAttempt: addCollectionAttemptMutation.isPending,
  }
}

/**
 * Hook for overdue invoices
 */
export function useOverdueInvoices(
  limit = 20,
  severityFilter?: 'warning' | 'critical' | 'severe'
) {
  const authUser = useAuthenticatedUser()

  const {
    data: overdueData,
    isPending,
    error,
    refetch,
  } = invoicesService.useOverdueInvoices(authUser?.id!, limit, severityFilter)

  return {
    invoices: overdueData?.invoices || [],
    total: overdueData?.total || 0,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for invoice search
 */
export function useInvoiceSearch(searchTerm: string) {
  const authUser = useAuthenticatedUser()

  const {
    data: searchResults,
    isPending,
    error,
  } = invoicesService.useSearchInvoices(authUser?.id!, searchTerm)

  return {
    results: searchResults || [],
    isLoading: isPending,
    error,
    hasResults: (searchResults?.length || 0) > 0,
  }
}

/**
 * Hook for invoice aging analysis
 */
export function useInvoiceAging(type?: 'incoming' | 'outgoing') {
  const authUser = useAuthenticatedUser()

  const {
    data: aging,
    isPending,
    error,
  } = invoicesService.useInvoiceAging(authUser?.id!, type)

  return {
    aging,
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for monthly invoice statistics
 */
export function useMonthlyInvoiceStats(year?: number) {
  const authUser = useAuthenticatedUser()

  const {
    data: monthlyStats,
    isPending,
    error,
  } = invoicesService.useMonthlyInvoiceStats(authUser?.id!, year)

  return {
    monthlyStats,
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for invoice form management
 */
export function useInvoiceForm(initialData?: Partial<InvoiceFormData>) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    type: 'outgoing',
    issueDate: Date.now(),
    description: '',
    lineItems: [],
    subtotal: { amount: 0, currency: 'EUR' },
    totalAmount: { amount: 0, currency: 'EUR' },
    paymentTerms: INVOICE_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
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

  const addLineItem = useCallback(() => {
    const newItem = {
      description: '',
      quantity: 1,
      unitPrice: { amount: 0, currency: formData.subtotal.currency },
      totalPrice: { amount: 0, currency: formData.subtotal.currency },
    }
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }))
    setIsDirty(true)
  }, [formData.subtotal.currency])

  const updateLineItem = useCallback((index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newLineItems = [...prev.lineItems]
      const item = { ...newLineItems[index] }

      if (field === 'unitPrice' || field === 'quantity') {
        item[field] = value
        // Auto-calculate total price
        item.totalPrice = invoicesService.calculateLineItemTotal(
          item.unitPrice,
          item.quantity
        )
      } else {
        Object.assign(item, { [field]: value })
      }

      newLineItems[index] = item

      // Recalculate subtotal and total
      const subtotal = newLineItems.reduce((sum, item) => sum + item.totalPrice.amount, 0)
      const taxAmount = prev.taxRate
        ? invoicesService.calculateTaxAmount({ amount: subtotal, currency: prev.subtotal.currency }, prev.taxRate)
        : undefined
      const totalAmount = invoicesService.calculateTotalAmount(
        { amount: subtotal, currency: prev.subtotal.currency },
        taxAmount
      )

      return {
        ...prev,
        lineItems: newLineItems,
        subtotal: { amount: subtotal, currency: prev.subtotal.currency },
        taxAmount,
        totalAmount,
      }
    })
    setIsDirty(true)
  }, [])

  const removeLineItem = useCallback((index: number) => {
    setFormData((prev) => {
      const newLineItems = prev.lineItems.filter((_, i) => i !== index)

      // Recalculate totals
      const subtotal = newLineItems.reduce((sum, item) => sum + item.totalPrice.amount, 0)
      const taxAmount = prev.taxRate
        ? invoicesService.calculateTaxAmount({ amount: subtotal, currency: prev.subtotal.currency }, prev.taxRate)
        : undefined
      const totalAmount = invoicesService.calculateTotalAmount(
        { amount: subtotal, currency: prev.subtotal.currency },
        taxAmount
      )

      return {
        ...prev,
        lineItems: newLineItems,
        subtotal: { amount: subtotal, currency: prev.subtotal.currency },
        taxAmount,
        totalAmount,
      }
    })
    setIsDirty(true)
  }, [])

  const validateForm = useCallback(() => {
    const validationErrors = invoicesService.validateInvoiceData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('Description')) errorMap.description = error
      else if (error.includes('Due date')) errorMap.dueDate = error
      else if (error.includes('Line item')) errorMap.lineItems = error
      else if (error.includes('Subtotal')) errorMap.subtotal = error
      else if (error.includes('Total')) errorMap.totalAmount = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: InvoiceFormData = {
      type: 'outgoing',
      issueDate: Date.now(),
      description: '',
      lineItems: [],
      subtotal: { amount: 0, currency: 'EUR' },
      totalAmount: { amount: 0, currency: 'EUR' },
      paymentTerms: INVOICE_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
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
    addLineItem,
    updateLineItem,
    removeLineItem,
    validateForm,
    resetForm,
    setFormData,
  }
}

// Helper function to determine aging category
function getAgingCategory(dueDate: number, status: string): 'current' | 'overdue_1_30' | 'overdue_31_60' | 'overdue_61_90' | 'overdue_90_plus' {
  if (status === 'paid' || status === 'cancelled') return 'current'

  const now = Date.now()
  const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24))

  if (daysOverdue <= 0) return 'current'
  if (daysOverdue <= 30) return 'overdue_1_30'
  if (daysOverdue <= 60) return 'overdue_31_60'
  if (daysOverdue <= 90) return 'overdue_61_90'
  return 'overdue_90_plus'
}