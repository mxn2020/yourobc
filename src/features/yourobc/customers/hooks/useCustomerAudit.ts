import { useCallback } from 'react'
import { auditLogsService } from '@/features/system/audit-logs/services/AuditLogsService'
import type { CustomerId } from '../types'

/**
 * Customer audit logging hook
 * Logs all customer-related actions for compliance and tracking
 */
export function useCustomerAudit() {
  const createAuditMutation = auditLogsService.useCreateAuditLog()

  const logCustomerCreated = useCallback(
    async (
      customerId: CustomerId,
      customerName: string,
      customerData: Record<string, any>
    ) => {
      try {
        await createAuditMutation.mutateAsync({
          action: 'customer.created',
          entityType: 'yourobc_customer',
          entityId: customerId,
          entityTitle: customerName,
          description: `Created customer: ${customerName}`,
          metadata: {
            operation: 'create',
            newValues: {
              companyName: customerData.companyName,
              status: customerData.status,
              currency: customerData.defaultCurrency,
              margin: customerData.margin,
            },
          },
        })
      } catch (error) {
        console.warn('Failed to log customer creation:', error)
      }
    },
    [createAuditMutation]
  )

  const logCustomerUpdated = useCallback(
    async (
      customerId: CustomerId,
      customerName: string,
      oldData: Record<string, any>,
      newData: Record<string, any>
    ) => {
      try {
        await createAuditMutation.mutateAsync({
          action: 'customer.updated',
          entityType: 'yourobc_customer',
          entityId: customerId,
          entityTitle: customerName,
          description: `Updated customer: ${customerName}`,
          metadata: {
            operation: 'update',
            oldValues: oldData,
            newValues: newData,
          },
        })
      } catch (error) {
        console.warn('Failed to log customer update:', error)
      }
    },
    [createAuditMutation]
  )

  const logCustomerDeleted = useCallback(
    async (
      customerId: CustomerId,
      customerName: string,
      customerData: Record<string, any>,
      hardDelete: boolean
    ) => {
      try {
        await createAuditMutation.mutateAsync({
          action: hardDelete ? 'customer.hard_deleted' : 'customer.deleted',
          entityType: 'yourobc_customer',
          entityId: customerId,
          entityTitle: customerName,
          description: `${hardDelete ? 'Permanently deleted' : 'Deleted'} customer: ${customerName}`,
          metadata: {
            operation: 'delete',
            hardDelete,
            oldValues: customerData,
          },
        })
      } catch (error) {
        console.warn('Failed to log customer deletion:', error)
      }
    },
    [createAuditMutation]
  )

  const logCustomerViewed = useCallback(
    async (customerId: CustomerId, customerName: string) => {
      try {
        await createAuditMutation.mutateAsync({
          action: 'customer.viewed',
          entityType: 'yourobc_customer',
          entityId: customerId,
          entityTitle: customerName,
          description: `Viewed customer: ${customerName}`,
          metadata: {
            operation: 'view',
          },
        })
      } catch (error) {
        console.warn('Failed to log customer view:', error)
      }
    },
    [createAuditMutation]
  )

  const logCustomerTagAdded = useCallback(
    async (customerId: CustomerId, customerName: string, tag: string) => {
      try {
        await createAuditMutation.mutateAsync({
          action: 'customer.tag_added',
          entityType: 'yourobc_customer',
          entityId: customerId,
          entityTitle: customerName,
          description: `Added tag "${tag}" to customer: ${customerName}`,
          metadata: {
            operation: 'tag_add',
            tag,
          },
        })
      } catch (error) {
        console.warn('Failed to log tag addition:', error)
      }
    },
    [createAuditMutation]
  )

  const logCustomerTagRemoved = useCallback(
    async (customerId: CustomerId, customerName: string, tag: string) => {
      try {
        await createAuditMutation.mutateAsync({
          action: 'customer.tag_removed',
          entityType: 'yourobc_customer',
          entityId: customerId,
          entityTitle: customerName,
          description: `Removed tag "${tag}" from customer: ${customerName}`,
          metadata: {
            operation: 'tag_remove',
            tag,
          },
        })
      } catch (error) {
        console.warn('Failed to log tag removal:', error)
      }
    },
    [createAuditMutation]
  )

  return {
    logCustomerCreated,
    logCustomerUpdated,
    logCustomerDeleted,
    logCustomerViewed,
    logCustomerTagAdded,
    logCustomerTagRemoved,
    isLogging: createAuditMutation.isPending,
  }
}
