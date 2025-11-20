// src/features/yourobc/accounting/hooks/useAccounting.ts

import { useCallback } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { accountingService } from '../services/AccountingService'
import { ACCOUNTING_CONFIG, checkFeature } from '../config/accounting.config'
import { parseConvexError } from '@/utils/errorHandling'
import type {
  IncomingInvoiceTrackingId,
  StatementOfAccountsId,
  CreateIncomingInvoiceTrackingData,
  GenerateStatementData,
} from '../types'

export function useAccounting() {
  const authUser = useAuthenticatedUser()
  const toast = useToast()
  const authUserId = authUser?.id ?? ''

  // Dashboard queries
  const { data: metrics, isPending: isMetricsLoading } =
    accountingService.useAccountingMetrics(authUserId)

  const { data: receivablesOverview, isPending: isReceivablesLoading } =
    accountingService.useReceivablesOverview(authUserId)

  const { data: payablesOverview, isPending: isPayablesLoading } =
    accountingService.usePayablesOverview(authUserId)

  const { data: cashFlowForecast, isPending: isCashFlowLoading } =
    accountingService.useCashFlowForecast(authUserId, 30)

  // Mutations
  const createExpectedInvoiceMutation = accountingService.useCreateExpectedInvoice()
  const approveInvoiceMutation = accountingService.useApproveInvoice()
  const rejectInvoiceMutation = accountingService.useRejectInvoice()
  const markPaidMutation = accountingService.useMarkInvoicePaid()
  const sendReminderMutation = accountingService.useSendInvoiceReminder()
  const generateStatementMutation = accountingService.useGenerateStatement()

  // Business operations with error handling
  const createExpectedInvoice = useCallback(
    async (data: CreateIncomingInvoiceTrackingData) => {
      if (!checkFeature('incomingInvoices.tracking')) {
        toast.error('Invoice tracking is disabled')
        return
      }

      try {
        const result = await accountingService.createExpectedInvoice(
          createExpectedInvoiceMutation,
          authUserId,
          data
        )
        toast.success('Expected invoice created successfully')
        return result
      } catch (error) {
        const { message } = parseConvexError(error)
        toast.error(message)
        throw error
      }
    },
    [authUserId, createExpectedInvoiceMutation, toast]
  )

  const approveInvoice = useCallback(
    async (trackingId: IncomingInvoiceTrackingId, approvalNotes?: string) => {
      if (!checkFeature('incomingInvoices.approval')) {
        toast.error('Invoice approval is disabled')
        return
      }

      try {
        const result = await accountingService.approveInvoice(
          approveInvoiceMutation,
          authUserId,
          trackingId,
          approvalNotes
        )
        toast.success('Invoice approved successfully')
        return result
      } catch (error) {
        const { message } = parseConvexError(error)
        toast.error(message)
        throw error
      }
    },
    [authUserId, approveInvoiceMutation, toast]
  )

  const rejectInvoice = useCallback(
    async (trackingId: IncomingInvoiceTrackingId, rejectionReason: string) => {
      if (!checkFeature('incomingInvoices.approval')) {
        toast.error('Invoice approval is disabled')
        return
      }

      try {
        await rejectInvoiceMutation.mutateAsync({
          authUserId,
          trackingId,
          rejectionReason,
        })
        toast.success('Invoice rejected')
      } catch (error) {
        const { message } = parseConvexError(error)
        toast.error(message)
        throw error
      }
    },
    [authUserId, rejectInvoiceMutation, toast]
  )

  const markInvoicePaid = useCallback(
    async (
      trackingId: IncomingInvoiceTrackingId,
      paidDate?: number,
      paymentReference?: string
    ) => {
      try {
        await markPaidMutation.mutateAsync({
          authUserId,
          trackingId,
          paidDate,
          paymentReference,
        })
        toast.success('Invoice marked as paid')
      } catch (error) {
        const { message } = parseConvexError(error)
        toast.error(message)
        throw error
      }
    },
    [authUserId, markPaidMutation, toast]
  )

  const sendInvoiceReminder = useCallback(
    async (trackingId: IncomingInvoiceTrackingId, notes?: string) => {
      try {
        await sendReminderMutation.mutateAsync({
          authUserId,
          trackingId,
          notes,
        })
        toast.success('Reminder sent successfully')
      } catch (error) {
        const { message } = parseConvexError(error)
        toast.error(message)
        throw error
      }
    },
    [authUserId, sendReminderMutation, toast]
  )

  const generateStatement = useCallback(
    async (data: GenerateStatementData) => {
      if (!checkFeature('statements.enabled')) {
        toast.error('Statements are disabled')
        return
      }

      try {
        const result = await accountingService.generateStatement(
          generateStatementMutation,
          authUserId,
          data
        )
        toast.success('Statement generated successfully')
        return result
      } catch (error) {
        const { message } = parseConvexError(error)
        toast.error(message)
        throw error
      }
    },
    [authUserId, generateStatementMutation, toast]
  )

  return {
    // Data
    metrics,
    receivablesOverview,
    payablesOverview,
    cashFlowForecast,

    // Loading states
    isMetricsLoading,
    isReceivablesLoading,
    isPayablesLoading,
    isCashFlowLoading,
    isLoading:
      isMetricsLoading || isReceivablesLoading || isPayablesLoading || isCashFlowLoading,

    // Actions
    createExpectedInvoice,
    approveInvoice,
    rejectInvoice,
    markInvoicePaid,
    sendInvoiceReminder,
    generateStatement,

    // Mutation states
    isCreatingExpectedInvoice: createExpectedInvoiceMutation.isPending,
    isApprovingInvoice: approveInvoiceMutation.isPending,
    isRejectingInvoice: rejectInvoiceMutation.isPending,
    isMarkingPaid: markPaidMutation.isPending,
    isSendingReminder: sendReminderMutation.isPending,
    isGeneratingStatement: generateStatementMutation.isPending,

    // Config
    config: ACCOUNTING_CONFIG,
    isFeatureEnabled: checkFeature,

    // Utilities
    formatCurrency: accountingService.formatCurrency,
    formatDate: accountingService.formatDate,
    calculateDaysOverdue: accountingService.calculateDaysOverdue,
    isInvoiceOverdue: accountingService.isInvoiceOverdue,
  }
}

// Specific hooks for different sections
export function useIncomingInvoices(options?: any) {
  const authUser = useAuthenticatedUser()
  const authUserId = authUser?.id ?? ''

  const { data: expectedInvoices, isPending: isLoadingExpected } =
    accountingService.useExpectedInvoices(authUserId, options)

  const { data: missingInvoices, isPending: isLoadingMissing } =
    accountingService.useMissingInvoices(authUserId)

  const { data: pendingApprovals, isPending: isLoadingPending } =
    accountingService.usePendingApprovals(authUserId)

  const { data: approvedInvoices, isPending: isLoadingApproved } =
    accountingService.useApprovedInvoices(authUserId)

  return {
    expectedInvoices,
    missingInvoices,
    pendingApprovals,
    approvedInvoices,
    isLoading: isLoadingExpected || isLoadingMissing || isLoadingPending || isLoadingApproved,
    isLoadingExpected,
    isLoadingMissing,
    isLoadingPending,
    isLoadingApproved,
  }
}

export function useStatements(customerId?: string) {
  const authUser = useAuthenticatedUser()
  const authUserId = authUser?.id ?? ''

  const { data: customerStatements, isPending: isLoadingStatements } =
    accountingService.useCustomerStatements(authUserId, customerId ?? '')

  const { data: agingReport, isPending: isLoadingAging } =
    accountingService.useAgingReport(authUserId)

  return {
    customerStatements,
    agingReport,
    isLoading: isLoadingStatements || isLoadingAging,
    isLoadingStatements,
    isLoadingAging,
  }
}
