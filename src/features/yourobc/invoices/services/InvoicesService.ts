// src/features/yourobc/invoices/services/InvoicesService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateInvoiceData,
  UpdateInvoiceData,
  ProcessPaymentData,
  CreateCollectionAttemptData,
  LineItem,
} from '../types'
import { CurrencyAmount, CustomerId, PartnerId, ShipmentId } from '@/convex/lib/yourobc'

export class InvoicesService {
  // Query hooks for invoice data fetching
  useInvoices(
    authUserId: string,
    options?: {
      limit?: number
      offset?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      filters?: {
        type?: string[]
        status?: string[]
        customerId?: CustomerId
        partnerId?: PartnerId
        shipmentId?: ShipmentId
        isOverdue?: boolean
        dateRange?: {
          start: number
          end: number
          field?: string
        }
        amountRange?: {
          min: number
          max: number
          currency: string
        }
        search?: string
      }
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.invoices.queries.getInvoices, {
        authUserId,
        options,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useInvoice(authUserId: string, invoiceId: Id<'yourobcInvoices'>) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.invoices.queries.getInvoice, {
        invoiceId,
        authUserId,
      }),
      staleTime: 300000,
      enabled: !!authUserId && !!invoiceId,
    })
  }

  useInvoiceStats(
    authUserId: string,
    dateRange?: { start: number; end: number }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.invoices.queries.getInvoiceStats, {
        authUserId,
        dateRange,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useOverdueInvoices(
    authUserId: string,
    limit = 20,
    severityFilter?: 'warning' | 'critical' | 'severe'
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.invoices.queries.getOverdueInvoices, {
        authUserId,
        limit,
        severityFilter,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useInvoiceAging(
    authUserId: string,
    type?: 'incoming' | 'outgoing'
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.invoices.queries.getInvoiceAging, {
        authUserId,
        type,
      }),
      staleTime: 300000,
      enabled: !!authUserId,
    })
  }

  useSearchInvoices(
    authUserId: string,
    searchTerm: string,
    limit = 20,
    includeFinancialData = false
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.invoices.queries.searchInvoices, {
        authUserId,
        searchTerm,
        limit,
        includeFinancialData,
      }),
      staleTime: 30000,
      enabled: !!authUserId && searchTerm.length >= 2,
    })
  }

  useInvoicesByEntity(
    authUserId: string,
    entityType: 'yourobc_customer' | 'yourobc_partner' | 'yourobc_shipment',
    entityId: string,
    limit = 20,
    includeFinancialData = false
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.invoices.queries.getInvoicesByEntity, {
        authUserId,
        entityType,
        entityId,
        limit,
        includeFinancialData,
      }),
      staleTime: 300000,
      enabled: !!authUserId && !!entityId,
    })
  }

  useMonthlyInvoiceStats(
    authUserId: string,
    year?: number
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.invoices.queries.getMonthlyInvoiceStats, {
        authUserId,
        year,
      }),
      staleTime: 300000,
      enabled: !!authUserId,
    })
  }

  // Mutation hooks for invoice modifications
  useCreateInvoice() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.invoices.mutations.createInvoice),
    })
  }

  useUpdateInvoice() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.invoices.mutations.updateInvoice),
    })
  }

  useUpdateInvoiceStatus() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.invoices.mutations.updateInvoiceStatus),
    })
  }

  useProcessPayment() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.invoices.mutations.processPayment),
    })
  }

  useAddCollectionAttempt() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.invoices.mutations.addCollectionAttempt),
    })
  }

  useDeleteInvoice() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.invoices.mutations.deleteInvoice),
    })
  }

  // Business operations using mutations
  async createInvoice(
    mutation: ReturnType<typeof this.useCreateInvoice>,
    authUserId: string,
    data: CreateInvoiceData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create invoice: ${error.message}`)
    }
  }

  async updateInvoice(
    mutation: ReturnType<typeof this.useUpdateInvoice>,
    authUserId: string,
    invoiceId: Id<'yourobcInvoices'>,
    data: UpdateInvoiceData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, invoiceId, data })
    } catch (error: any) {
      throw new Error(`Failed to update invoice: ${error.message}`)
    }
  }

  async updateInvoiceStatus(
    mutation: ReturnType<typeof this.useUpdateInvoiceStatus>,
    authUserId: string,
    invoiceId: Id<'yourobcInvoices'>,
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
    reason?: string
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, invoiceId, status, reason })
    } catch (error: any) {
      throw new Error(`Failed to update invoice status: ${error.message}`)
    }
  }

  async processPayment(
    mutation: ReturnType<typeof this.useProcessPayment>,
    authUserId: string,
    invoiceId: Id<'yourobcInvoices'>,
    data: ProcessPaymentData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, invoiceId, data })
    } catch (error: any) {
      throw new Error(`Failed to process payment: ${error.message}`)
    }
  }

  async addCollectionAttempt(
    mutation: ReturnType<typeof this.useAddCollectionAttempt>,
    authUserId: string,
    invoiceId: Id<'yourobcInvoices'>,
    data: CreateCollectionAttemptData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, invoiceId, data })
    } catch (error: any) {
      throw new Error(`Failed to add collection attempt: ${error.message}`)
    }
  }

  async deleteInvoice(
    mutation: ReturnType<typeof this.useDeleteInvoice>,
    authUserId: string,
    invoiceId: Id<'yourobcInvoices'>
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, invoiceId })
    } catch (error: any) {
      throw new Error(`Failed to delete invoice: ${error.message}`)
    }
  }

  // Utility functions for data processing and validation
  formatCurrencyAmount(amount: CurrencyAmount): string {
    const formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: amount.currency,
    })
    return formatter.format(amount.amount)
  }

  formatInvoiceNumber(invoice: {
    invoiceNumber?: string
    _id?: string
  }): string {
    return invoice.invoiceNumber || `Invoice ${invoice._id}`
  }

  calculateDueDate(issueDate: number, paymentTerms: number): number {
    return issueDate + (paymentTerms * 24 * 60 * 60 * 1000)
  }

  calculateTaxAmount(subtotal: CurrencyAmount, taxRate: number): CurrencyAmount {
    return {
      amount: Math.round((subtotal.amount * taxRate / 100) * 100) / 100,
      currency: subtotal.currency,
      exchangeRate: subtotal.exchangeRate,
    }
  }

  calculateTotalAmount(subtotal: CurrencyAmount, taxAmount?: CurrencyAmount): CurrencyAmount {
    return {
      amount: Math.round((subtotal.amount + (taxAmount?.amount || 0)) * 100) / 100,
      currency: subtotal.currency,
      exchangeRate: subtotal.exchangeRate,
    }
  }

  calculateLineItemTotal(unitPrice: CurrencyAmount, quantity: number): CurrencyAmount {
    return {
      amount: Math.round((unitPrice.amount * quantity) * 100) / 100,
      currency: unitPrice.currency,
      exchangeRate: unitPrice.exchangeRate,
    }
  }

  getOverdueStatus(invoice: {
    dueDate: number
    status: string
  }): {
    isOverdue: boolean
    daysOverdue: number
    severity: 'warning' | 'critical' | 'severe' | null
  } {
    const now = Date.now()
    const daysUntilDue = Math.ceil((invoice.dueDate - now) / (1000 * 60 * 60 * 24))
    const daysOverdue = -daysUntilDue

    let severity: 'warning' | 'critical' | 'severe' | null = null
    
    if (daysUntilDue <= 3 && daysUntilDue > 0) {
      severity = 'warning'
    } else if (daysOverdue >= 0 && daysOverdue < 30) {
      severity = 'critical'
    } else if (daysOverdue >= 30) {
      severity = 'severe'
    }

    return {
      isOverdue: daysOverdue > 0,
      daysOverdue: Math.max(0, daysOverdue),
      severity,
    }
  }

  validateInvoiceData(data: Partial<CreateInvoiceData | UpdateInvoiceData>): string[] {
    const errors: string[] = []

    // Basic validation
    if (data.description !== undefined && !data.description.trim()) {
      errors.push('Description is required')
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }

    if (data.notes && data.notes.length > 1000) {
      errors.push('Notes must be less than 1000 characters')
    }

    if (data.issueDate !== undefined && data.issueDate > Date.now()) {
      errors.push('Issue date cannot be in the future')
    }

    if (data.dueDate && data.issueDate && data.dueDate <= data.issueDate) {
      errors.push('Due date must be after issue date')
    }

    if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
      errors.push('Tax rate must be between 0 and 100 percent')
    }

    // Amount validation
    if (data.subtotal) {
      const subtotalErrors = this.validateCurrencyAmount(data.subtotal, 'Subtotal')
      errors.push(...subtotalErrors)
    }

    if (data.totalAmount) {
      const totalErrors = this.validateCurrencyAmount(data.totalAmount, 'Total amount')
      errors.push(...totalErrors)
    }

    // Line items validation
    if (data.lineItems) {
      const lineItemErrors = this.validateLineItems(data.lineItems)
      errors.push(...lineItemErrors)
    }

    return errors
  }

  validateCurrencyAmount(amount: CurrencyAmount, fieldName: string): string[] {
    const errors: string[] = []

    if (amount.amount < 0.01) {
      errors.push(`${fieldName} must be at least 0.01`)
    }

    if (amount.amount > 999999999) {
      errors.push(`${fieldName} cannot exceed 999,999,999`)
    }

    if (!['EUR', 'USD'].includes(amount.currency)) {
      errors.push(`${fieldName} currency must be EUR or USD`)
    }

    return errors
  }

  validateLineItems(lineItems: LineItem[]): string[] {
    const errors: string[] = []

    if (lineItems.length === 0) {
      errors.push('At least one line item is required')
    }

    if (lineItems.length > 50) {
      errors.push('Maximum 50 line items allowed')
    }

    lineItems.forEach((item, index) => {
      if (!item.description.trim()) {
        errors.push(`Line item ${index + 1}: Description is required`)
      }

      if (item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be greater than 0`)
      }

      const expectedTotal = item.unitPrice.amount * item.quantity
      if (Math.abs(item.totalPrice.amount - expectedTotal) > 0.01) {
        errors.push(`Line item ${index + 1}: Total price does not match unit price × quantity`)
      }

      if (item.unitPrice.currency !== item.totalPrice.currency) {
        errors.push(`Line item ${index + 1}: Unit price and total price must use the same currency`)
      }
    })

    return errors
  }

  validatePaymentData(data: ProcessPaymentData): string[] {
    const errors: string[] = []

    if (data.paymentDate > Date.now()) {
      errors.push('Payment date cannot be in the future')
    }

    const amountErrors = this.validateCurrencyAmount(data.paidAmount, 'Payment amount')
    errors.push(...amountErrors)

    if (data.paymentReference && data.paymentReference.length > 50) {
      errors.push('Payment reference must be less than 50 characters')
    }

    return errors
  }

  generateInvoiceNumber(type: 'incoming' | 'outgoing', sequence: number, year?: number): string {
    const prefix = type === 'incoming' ? 'RE' : 'INV'
    const currentYear = year || new Date().getFullYear()
    return `${prefix}${currentYear}${sequence.toString().padStart(4, '0')}`
  }

  getNextCollectionAction(attempts: Array<{ method: string; date: number }>): string {
    if (attempts.length === 0) return 'Send email reminder'
    
    const lastAttempt = attempts[attempts.length - 1]
    const daysSinceLastAttempt = Math.floor((Date.now() - lastAttempt.date) / (1000 * 60 * 60 * 24))
    
    if (lastAttempt.method === 'email' && daysSinceLastAttempt >= 7) {
      return 'Make phone call'
    } else if (lastAttempt.method === 'phone' && daysSinceLastAttempt >= 14) {
      return 'Send formal letter'
    } else if (lastAttempt.method === 'letter' && daysSinceLastAttempt >= 14) {
      return 'Send legal notice'
    } else if (lastAttempt.method === 'legal_notice' && daysSinceLastAttempt >= 14) {
      return 'Transfer to debt collection'
    }
    
    return 'Wait before next action'
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isToday(timestamp: number): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(timestamp)
    date.setHours(0, 0, 0, 0)
    return today.getTime() === date.getTime()
  }
}

export const invoicesService = new InvoicesService()