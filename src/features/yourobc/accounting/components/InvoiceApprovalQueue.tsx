// src/features/yourobc/accounting/components/InvoiceApprovalQueue.tsx

import { FC, useState } from 'react'
import { Badge, Button } from '@/components/ui'
import type { Id } from '@/convex/_generated/dataModel'

interface InvoiceForApproval {
  _id: Id<'yourobcIncomingInvoiceTracking'>
  status: 'received' | 'approved' | 'disputed'
  expectedDate: number
  receivedDate?: number
  approvedDate?: number
  approvedBy?: string
  actualAmount?: {
    amount: number
    currency: 'EUR' | 'USD'
  }
  approvalNotes?: string
  ageInDays: number
  priority?: 'normal' | 'medium' | 'high'
  daysSinceApproval?: number
  shipment?: {
    _id: Id<'yourobcShipments'>
    shipmentNumber: string
    origin?: string
    destination?: string
  } | null
  partner?: {
    _id: Id<'yourobcPartners'>
    companyName: string
  } | null
  customer?: {
    _id: Id<'yourobcCustomers'>
    companyName: string
  } | null
  invoice?: {
    _id: Id<'yourobcInvoices'>
    invoiceNumber: string
    totalAmount: {
      amount: number
      currency: string
    }
    externalInvoiceNumber?: string
  } | null
  approver?: {
    userId: string
    name: string
  } | null
}

interface InvoiceApprovalQueueProps {
  invoices?: InvoiceForApproval[]
  view?: 'pending' | 'approved'
  onApprove?: (trackingId: Id<'yourobcIncomingInvoiceTracking'>, notes?: string) => void
  onReject?: (trackingId: Id<'yourobcIncomingInvoiceTracking'>, reason: string) => void
  onMarkPaid?: (trackingId: Id<'yourobcIncomingInvoiceTracking'>, paymentRef?: string) => void
  onViewDetails?: (trackingId: Id<'yourobcIncomingInvoiceTracking'>) => void
  showActions?: boolean
}

export const InvoiceApprovalQueue: FC<InvoiceApprovalQueueProps> = ({
  invoices,
  view = 'pending',
  onApprove,
  onReject,
  onMarkPaid,
  onViewDetails,
  showActions = true,
}) => {
  const [selectedInvoices, setSelectedInvoices] = useState<Set<Id<'yourobcIncomingInvoiceTracking'>>>(
    new Set()
  )
  const [expandedInvoice, setExpandedInvoice] = useState<Id<'yourobcIncomingInvoiceTracking'> | null>(
    null
  )

  if (!invoices) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="animate-pulse">Loading invoices...</div>
      </div>
    )
  }

  const toggleSelection = (trackingId: Id<'yourobcIncomingInvoiceTracking'>) => {
    const newSelected = new Set(selectedInvoices)
    if (newSelected.has(trackingId)) {
      newSelected.delete(trackingId)
    } else {
      newSelected.add(trackingId)
    }
    setSelectedInvoices(newSelected)
  }

  const selectAll = () => {
    if (selectedInvoices.size === invoices.length) {
      setSelectedInvoices(new Set())
    } else {
      setSelectedInvoices(new Set(invoices.map((inv) => inv._id)))
    }
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

  const getPriorityBadge = (invoice: InvoiceForApproval) => {
    if (!invoice.priority) return null

    const variants = {
      normal: 'secondary' as const,
      medium: 'warning' as const,
      high: 'danger' as const,
    }

    const labels = {
      normal: 'Normal',
      medium: `${invoice.ageInDays}d waiting`,
      high: `⚠️ ${invoice.ageInDays}d overdue`,
    }

    return (
      <Badge variant={variants[invoice.priority]} size="sm">
        {labels[invoice.priority]}
      </Badge>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">✅</div>
        <div className="text-lg font-semibold">No {view === 'pending' ? 'pending' : 'approved'} invoices</div>
        <div className="text-sm mt-2">
          {view === 'pending' ? 'All invoices have been approved!' : 'No approved invoices awaiting payment'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Bulk Actions */}
      {view === 'pending' && showActions && invoices.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedInvoices.size === invoices.length}
              onChange={selectAll}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedInvoices.size > 0
                ? `${selectedInvoices.size} selected`
                : 'Select all'}
            </span>
          </div>
          {selectedInvoices.size > 0 && onApprove && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="success"
                onClick={() => {
                  // Batch approve
                  selectedInvoices.forEach((id) => onApprove(id))
                  setSelectedInvoices(new Set())
                }}
              >
                ✅ Approve Selected ({selectedInvoices.size})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Invoice List */}
      <div className="space-y-3">
        {invoices.map((invoice) => {
          const isExpanded = expandedInvoice === invoice._id

          return (
            <div
              key={invoice._id}
              className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Main Row */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  {view === 'pending' && showActions && (
                    <input
                      type="checkbox"
                      checked={selectedInvoices.has(invoice._id)}
                      onChange={() => toggleSelection(invoice._id)}
                      className="w-4 h-4 mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {invoice.invoice?.invoiceNumber ||
                            invoice.invoice?.externalInvoiceNumber ||
                            'No Invoice #'}
                        </h3>
                        {getPriorityBadge(invoice)}
                        {invoice.status === 'approved' && (
                          <Badge variant="success" size="sm">
                            ✅ Approved
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(invoice.actualAmount || invoice.invoice?.totalAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-gray-600">Shipment:</div>
                        <div className="font-medium text-gray-900">
                          {invoice.shipment?.shipmentNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invoice.shipment?.origin} → {invoice.shipment?.destination}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Partner:</div>
                        <div className="font-medium text-gray-900">
                          {invoice.partner?.companyName || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      {invoice.receivedDate && (
                        <div>
                          Received: {formatDate(invoice.receivedDate)} ({invoice.ageInDays}d ago)
                        </div>
                      )}
                      {invoice.approvedDate && invoice.approver && (
                        <div>
                          Approved: {formatDate(invoice.approvedDate)} by {invoice.approver.name}
                        </div>
                      )}
                    </div>

                    {/* Approval Notes */}
                    {invoice.approvalNotes && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                        <div className="font-medium text-green-900">Approval Notes:</div>
                        <div className="text-green-800">{invoice.approvalNotes}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                    {view === 'pending' && (
                      <>
                        {onApprove && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => onApprove(invoice._id)}
                          >
                            ✅ Approve
                          </Button>
                        )}
                        {onReject && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              const reason = prompt('Rejection reason:')
                              if (reason) onReject(invoice._id, reason)
                            }}
                          >
                            ❌ Reject
                          </Button>
                        )}
                      </>
                    )}

                    {view === 'approved' && onMarkPaid && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          const ref = prompt('Payment reference (optional):')
                          onMarkPaid(invoice._id, ref || undefined)
                        }}
                      >
                        💰 Mark as Paid
                      </Button>
                    )}

                    {onViewDetails && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onViewDetails(invoice._id)}
                      >
                        📄 View Details
                      </Button>
                    )}

                    <button
                      onClick={() =>
                        setExpandedInvoice(isExpanded ? null : invoice._id)
                      }
                      className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                    >
                      {isExpanded ? '▲ Less' : '▼ More'}
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 font-medium mb-1">Customer:</div>
                      <div className="text-gray-900">{invoice.customer?.companyName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium mb-1">Expected Date:</div>
                      <div className="text-gray-900">{formatDate(invoice.expectedDate)}</div>
                    </div>
                    {invoice.invoice && (
                      <div>
                        <div className="text-gray-600 font-medium mb-1">Invoice ID:</div>
                        <div className="text-gray-900 font-mono text-xs">
                          {invoice.invoice._id}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
