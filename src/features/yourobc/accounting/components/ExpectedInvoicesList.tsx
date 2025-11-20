// src/features/yourobc/accounting/components/ExpectedInvoicesList.tsx

import { FC, useState } from 'react'
import { Badge, Button } from '@/components/ui'
import type { Id } from '@/convex/_generated/dataModel'

interface ExpectedInvoice {
  _id: Id<'yourobcIncomingInvoiceTracking'>
  status: 'expected' | 'received' | 'approved' | 'paid' | 'missing' | 'disputed' | 'cancelled'
  expectedDate: number
  expectedAmount?: {
    amount: number
    currency: 'EUR' | 'USD'
  }
  remindersSent: number
  lastReminderDate?: number
  daysMissing: number
  isOverdue: boolean
  severity?: 'low' | 'medium' | 'high' | 'critical'
  shipment?: {
    _id: Id<'yourobcShipments'>
    shipmentNumber: string
    origin?: string
    destination?: string
  } | null
  partner?: {
    _id: Id<'yourobcPartners'>
    companyName: string
    email?: string
  } | null
  customer?: {
    _id: Id<'yourobcCustomers'>
    companyName: string
  } | null
}

interface ExpectedInvoicesListProps {
  invoices?: ExpectedInvoice[]
  onSendReminder?: (trackingId: Id<'yourobcIncomingInvoiceTracking'>) => void
  onMarkReceived?: (trackingId: Id<'yourobcIncomingInvoiceTracking'>) => void
  onDispute?: (trackingId: Id<'yourobcIncomingInvoiceTracking'>) => void
  showActions?: boolean
  compact?: boolean
}

export const ExpectedInvoicesList: FC<ExpectedInvoicesListProps> = ({
  invoices,
  onSendReminder,
  onMarkReceived,
  onDispute,
  showActions = true,
  compact = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'missing' | 'expected' | 'disputed'>('all')

  if (!invoices) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="animate-pulse">Loading expected invoices...</div>
      </div>
    )
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'all') return true
    if (filter === 'missing') return inv.status === 'missing' || inv.isOverdue
    if (filter === 'expected') return inv.status === 'expected' && !inv.isOverdue
    if (filter === 'disputed') return inv.status === 'disputed'
    return true
  })

  const missingCount = invoices.filter((i) => i.status === 'missing' || i.isOverdue).length
  const expectedCount = invoices.filter((i) => i.status === 'expected' && !i.isOverdue).length
  const disputedCount = invoices.filter((i) => i.status === 'disputed').length

  const getStatusBadge = (invoice: ExpectedInvoice) => {
    if (invoice.status === 'disputed') {
      return (
        <Badge variant="danger" size="sm">
          ⚠️ Disputed
        </Badge>
      )
    }
    if (invoice.isOverdue) {
      const severity = invoice.severity || 'low'
      return (
        <Badge
          variant={severity === 'critical' ? 'danger' : severity === 'high' ? 'warning' : 'secondary'}
          size="sm"
        >
          🔴 {invoice.daysMissing}d overdue
        </Badge>
      )
    }
    if (invoice.status === 'expected') {
      return (
        <Badge variant="primary" size="sm">
          ⏰ Expected
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" size="sm">
        {invoice.status}
      </Badge>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatCurrency = (amount?: { amount: number; currency: string }) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: amount.currency,
    }).format(amount.amount)
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {filteredInvoices.map((invoice) => (
          <div
            key={invoice._id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 flex-1">
              {getStatusBadge(invoice)}
              <div>
                <div className="text-sm font-medium">{invoice.shipment?.shipmentNumber || 'N/A'}</div>
                <div className="text-xs text-gray-500">{invoice.partner?.companyName}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700">{formatCurrency(invoice.expectedAmount)}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          All ({invoices.length})
        </button>
        <button
          onClick={() => setFilter('missing')}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
            filter === 'missing'
              ? 'bg-red-100 text-red-900 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Missing ({missingCount})
        </button>
        <button
          onClick={() => setFilter('expected')}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
            filter === 'expected'
              ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Expected ({expectedCount})
        </button>
        <button
          onClick={() => setFilter('disputed')}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
            filter === 'disputed'
              ? 'bg-yellow-100 text-yellow-900 border-b-2 border-yellow-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Disputed ({disputedCount})
        </button>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {filter !== 'all' ? filter : ''} invoices found
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusBadge(invoice)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {invoice.shipment?.shipmentNumber || 'Unknown Shipment'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {invoice.shipment?.origin} → {invoice.shipment?.destination}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(invoice.expectedAmount)}
                  </div>
                  <div className="text-xs text-gray-500">Expected</div>
                </div>
              </div>

              {/* Partner & Customer Info */}
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <div className="text-gray-600">Partner:</div>
                  <div className="font-medium text-gray-900">{invoice.partner?.companyName || 'N/A'}</div>
                  {invoice.partner?.email && (
                    <div className="text-xs text-gray-500">{invoice.partner.email}</div>
                  )}
                </div>
                <div>
                  <div className="text-gray-600">Customer:</div>
                  <div className="font-medium text-gray-900">{invoice.customer?.companyName || 'N/A'}</div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <div className="text-gray-600">Expected Date:</div>
                  <div
                    className={`font-medium ${invoice.isOverdue ? 'text-red-600' : 'text-gray-900'}`}
                  >
                    {formatDate(invoice.expectedDate)}
                  </div>
                </div>
                {invoice.remindersSent > 0 && (
                  <div>
                    <div className="text-gray-600">Reminders Sent:</div>
                    <div className="font-medium text-gray-900">
                      {invoice.remindersSent}
                      {invoice.lastReminderDate && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Last: {formatDate(invoice.lastReminderDate)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {showActions && (invoice.status === 'expected' || invoice.status === 'missing') && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  {onSendReminder && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSendReminder(invoice._id)}
                    >
                      📧 Send Reminder
                    </Button>
                  )}
                  {onMarkReceived && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => onMarkReceived(invoice._id)}
                    >
                      ✅ Mark Received
                    </Button>
                  )}
                  {onDispute && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDispute(invoice._id)}
                    >
                      ⚠️ Dispute
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
