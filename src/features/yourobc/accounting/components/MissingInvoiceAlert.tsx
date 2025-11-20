// src/features/yourobc/accounting/components/MissingInvoiceAlert.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import type { Id } from '@/convex/_generated/dataModel'

interface MissingInvoice {
  _id: Id<'yourobcIncomingInvoiceTracking'>
  shipment?: {
    _id: Id<'yourobcShipments'>
    shipmentNumber: string
  } | null
  partner?: {
    _id: Id<'yourobcPartners'>
    companyName: string
  } | null
  daysMissing: number
  severity?: 'low' | 'medium' | 'high' | 'critical'
  expectedDate: number
}

interface MissingInvoiceAlertProps {
  missingInvoices?: MissingInvoice[]
  onViewAll?: () => void
  onViewInvoice?: (trackingId: Id<'yourobcIncomingInvoiceTracking'>) => void
  compact?: boolean
  dismissable?: boolean
  onDismiss?: () => void
}

export const MissingInvoiceAlert: FC<MissingInvoiceAlertProps> = ({
  missingInvoices,
  onViewAll,
  onViewInvoice,
  compact = false,
  dismissable = false,
  onDismiss,
}) => {
  if (!missingInvoices || missingInvoices.length === 0) {
    return null
  }

  const criticalCount = missingInvoices.filter((i) => i.severity === 'critical').length
  const highCount = missingInvoices.filter((i) => i.severity === 'high').length
  const totalCount = missingInvoices.length

  const criticalInvoices = missingInvoices.filter((i) => i.severity === 'critical').slice(0, 3)
  const highInvoices = missingInvoices.filter((i) => i.severity === 'high').slice(0, 3)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-lg border ${
          criticalCount > 0
            ? 'bg-red-50 border-red-300'
            : highCount > 0
              ? 'bg-yellow-50 border-yellow-300'
              : 'bg-blue-50 border-blue-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <div>
            <div className="font-semibold text-gray-900">
              {totalCount} Missing Invoice{totalCount !== 1 ? 's' : ''}
            </div>
            <div className="text-sm text-gray-600">
              {criticalCount > 0 && <span className="text-red-600">{criticalCount} critical</span>}
              {criticalCount > 0 && highCount > 0 && <span>, </span>}
              {highCount > 0 && <span className="text-yellow-600">{highCount} high priority</span>}
            </div>
          </div>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All →
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border ${
        criticalCount > 0
          ? 'bg-red-50 border-red-300'
          : highCount > 0
            ? 'bg-yellow-50 border-yellow-300'
            : 'bg-blue-50 border-blue-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Missing Invoices Alert</h3>
            <p className="text-sm text-gray-600">
              {totalCount} invoice{totalCount !== 1 ? 's' : ''} overdue from partners
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded"
            >
              View All
            </button>
          )}
          {dismissable && onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Critical Section */}
      {criticalInvoices.length > 0 && (
        <div className="p-4 border-b border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="danger" size="sm">
              Critical ({criticalCount})
            </Badge>
            <span className="text-sm text-gray-600">30+ days overdue</span>
          </div>
          <div className="space-y-2">
            {criticalInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between p-2 bg-white rounded border border-red-200 hover:border-red-300 cursor-pointer"
                onClick={() => onViewInvoice && onViewInvoice(invoice._id)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.shipment?.shipmentNumber || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-600">{invoice.partner?.companyName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-600">
                    {invoice.daysMissing} days
                  </div>
                  <div className="text-xs text-gray-500">
                    Due: {formatDate(invoice.expectedDate)}
                  </div>
                </div>
              </div>
            ))}
            {criticalCount > 3 && (
              <div className="text-center text-sm text-gray-600">
                +{criticalCount - 3} more critical
              </div>
            )}
          </div>
        </div>
      )}

      {/* High Priority Section */}
      {highInvoices.length > 0 && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="warning" size="sm">
              High Priority ({highCount})
            </Badge>
            <span className="text-sm text-gray-600">14-30 days overdue</span>
          </div>
          <div className="space-y-2">
            {highInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200 hover:border-yellow-300 cursor-pointer"
                onClick={() => onViewInvoice && onViewInvoice(invoice._id)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.shipment?.shipmentNumber || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-600">{invoice.partner?.companyName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-yellow-600">
                    {invoice.daysMissing} days
                  </div>
                  <div className="text-xs text-gray-500">
                    Due: {formatDate(invoice.expectedDate)}
                  </div>
                </div>
              </div>
            ))}
            {highCount > 3 && (
              <div className="text-center text-sm text-gray-600">+{highCount - 3} more</div>
            )}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg text-sm text-gray-600">
        <span className="font-medium">Recommendation:</span> Review and send reminders to partners
        for overdue invoices.
      </div>
    </div>
  )
}

/**
 * Compact widget version for dashboard
 */
export const MissingInvoiceWidget: FC<Omit<MissingInvoiceAlertProps, 'compact'>> = (props) => {
  return <MissingInvoiceAlert {...props} compact={true} />
}
