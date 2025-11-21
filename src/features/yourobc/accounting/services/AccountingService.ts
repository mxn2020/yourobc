// src/features/yourobc/accounting/services/AccountingService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type {
  InvoiceId,
  IncomingInvoiceTrackingId,
  StatementOfAccountsId,
  CreateOutgoingInvoiceData,
  CreateIncomingInvoiceTrackingData,
  UpdateIncomingInvoiceTrackingData,
  GenerateStatementData,
  InvoiceListOptions,
  IncomingInvoiceListOptions,
  Currency,
} from '../types'

export class AccountingService {
  // ==================== Queries ====================

  // Dashboard
  useAccountingMetrics(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.dashboard.queries.getDashboardMetrics, {
        authUserId,
      }),
      staleTime: 60000, // 1 minute
      enabled: !!authUserId,
    })
  }

  useReceivablesOverview(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.dashboard.queries.getReceivablesOverview, {
        authUserId,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  usePayablesOverview(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.dashboard.queries.getPayablesOverview, {
        authUserId,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useCashFlowForecast(authUserId: string, days: number = 30) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.dashboard.queries.getCashFlowForecast, {
        authUserId,
        days,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  // Incoming Invoices
  useExpectedInvoices(
    authUserId: string,
    options?: IncomingInvoiceListOptions
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.expected_invoices.queries.getExpectedInvoices, {
        authUserId,
        ...options,
      }),
      staleTime: 30000, // 30 seconds
      enabled: !!authUserId,
    })
  }

  useMissingInvoices(authUserId: string, minDaysOverdue?: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.expected_invoices.queries.getMissingInvoices, {
        authUserId,
        minDaysOverdue,
      }),
      staleTime: 30000,
      enabled: !!authUserId,
    })
  }

  usePendingApprovals(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.approval.queries.getPendingApprovals, {
        authUserId,
      }),
      staleTime: 30000,
      enabled: !!authUserId,
    })
  }

  useApprovedInvoices(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.approval.queries.getApprovedInvoices, {
        authUserId,
      }),
      staleTime: 30000,
      enabled: !!authUserId,
    })
  }

  // Statements
  useCustomerStatements(authUserId: string, customerId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.statements.queries.getCustomerStatements, {
        authUserId,
        customerId: customerId as any,
      }),
      staleTime: 60000,
      enabled: !!authUserId && !!customerId,
    })
  }

  useStatement(authUserId: string, statementId: StatementOfAccountsId) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.statements.queries.getStatement, {
        authUserId,
        statementId,
      }),
      staleTime: Infinity, // Statements don't change once generated
      enabled: !!authUserId && !!statementId,
    })
  }

  useAgingReport(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.accounting.statements.queries.getAgingReport, {
        authUserId,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  // ==================== Mutations ====================

  // Incoming Invoices
  useCreateExpectedInvoice() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.expected_invoices.mutations.createExpectedInvoice
    )
    return useMutation({ mutationFn })
  }

  useMarkInvoiceReceived() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.expected_invoices.mutations.markInvoiceReceived
    )
    return useMutation({ mutationFn })
  }

  useSendInvoiceReminder() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.expected_invoices.mutations.sendInvoiceReminder
    )
    return useMutation({ mutationFn })
  }

  useDisputeInvoice() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.expected_invoices.mutations.disputeInvoice
    )
    return useMutation({ mutationFn })
  }

  // Approval
  useApproveInvoice() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.approval.mutations.approveInvoice
    )
    return useMutation({ mutationFn })
  }

  useRejectInvoice() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.approval.mutations.rejectInvoice
    )
    return useMutation({ mutationFn })
  }

  useMarkInvoicePaid() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.approval.mutations.markInvoicePaid
    )
    return useMutation({ mutationFn })
  }

  useBatchApproveInvoices() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.approval.mutations.batchApproveInvoices
    )
    return useMutation({ mutationFn })
  }

  // Outgoing Invoices
  useCreateOutgoingInvoice() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.outgoing_invoices.mutations.createOutgoingInvoice
    )
    return useMutation({ mutationFn })
  }

  useGetExchangeRate() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.outgoing_invoices.mutations.getCurrentExchangeRate
    )
    return useMutation({ mutationFn })
  }

  useConvertCurrency() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.outgoing_invoices.mutations.convertCurrency
    )
    return useMutation({ mutationFn })
  }

  // Statements
  useGenerateStatement() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.statements.mutations.generateStatement
    )
    return useMutation({ mutationFn })
  }

  useMarkStatementExported() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.statements.mutations.markStatementExported
    )
    return useMutation({ mutationFn })
  }

  useDeleteStatement() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.statements.mutations.deleteStatement
    )
    return useMutation({ mutationFn })
  }

  useSendStatement() {
    const mutationFn = useConvexMutation(
      api.lib.yourobc.accounting.statements.mutations.sendStatement
    )
    return useMutation({ mutationFn })
  }

  // ==================== Business Operations ====================

  async createExpectedInvoice(
    mutation: ReturnType<typeof this.useCreateExpectedInvoice>,
    authUserId: string,
    data: CreateIncomingInvoiceTrackingData
  ) {
    return await mutation.mutateAsync({
      authUserId,
      ...data,
    })
  }

  async approveInvoice(
    mutation: ReturnType<typeof this.useApproveInvoice>,
    authUserId: string,
    trackingId: IncomingInvoiceTrackingId,
    approvalNotes?: string
  ) {
    return await mutation.mutateAsync({
      authUserId,
      trackingId,
      approvalNotes,
    })
  }

  async generateStatement(
    mutation: ReturnType<typeof this.useGenerateStatement>,
    authUserId: string,
    data: GenerateStatementData
  ) {
    return await mutation.mutateAsync({
      authUserId,
      ...data,
    })
  }

  // ==================== Utility Functions ====================

  formatCurrency(amount: number, currency: Currency = 'EUR'): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  formatDate(timestamp: number, format: 'short' | 'long' = 'short'): string {
    const date = new Date(timestamp)
    if (format === 'short') {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    }
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  calculateDaysOverdue(dueDate: number): number {
    const now = Date.now()
    return Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)))
  }

  isInvoiceOverdue(dueDate: number): boolean {
    return dueDate < Date.now()
  }

  getInvoiceSeverity(daysOverdue: number): 'low' | 'medium' | 'high' | 'critical' {
    if (daysOverdue === 0) return 'low'
    if (daysOverdue <= 7) return 'low'
    if (daysOverdue <= 14) return 'medium'
    if (daysOverdue <= 30) return 'high'
    return 'critical'
  }

  validateInvoiceData(data: Partial<CreateOutgoingInvoiceData>): string[] {
    const errors: string[] = []

    if (!data.customerId) {
      errors.push('Customer is required')
    }

    if (!data.description?.trim()) {
      errors.push('Description is required')
    }

    if (!data.lineItems || data.lineItems.length === 0) {
      errors.push('At least one line item is required')
    }

    if (data.lineItems) {
      data.lineItems.forEach((item, index) => {
        if (!item.description?.trim()) {
          errors.push(`Line item ${index + 1}: Description is required`)
        }
        if (item.quantity <= 0) {
          errors.push(`Line item ${index + 1}: Quantity must be positive`)
        }
        if (item.unitPrice.amount < 0) {
          errors.push(`Line item ${index + 1}: Unit price cannot be negative`)
        }
      })
    }

    if (data.paymentTerms !== undefined && data.paymentTerms < 0) {
      errors.push('Payment terms cannot be negative')
    }

    if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
      errors.push('Tax rate must be between 0 and 100')
    }

    return errors
  }
}

export const accountingService = new AccountingService()
