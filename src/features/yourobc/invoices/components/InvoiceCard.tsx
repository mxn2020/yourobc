// src/features/yourobc/invoices/components/InvoiceCard.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '@/components/ui'
import { 
  INVOICE_STATUS_LABELS, 
  INVOICE_TYPE_LABELS,
  CURRENCY_SYMBOLS,
} from '../types'
import type { InvoiceCardProps } from '../types'

export const InvoiceCard: FC<InvoiceCardProps> = ({
  invoice,
  onClick,
  showCustomer = true,
  showPartner = true,
  compact = false,
  showActions = true,
}) => {
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString()
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'sent': return 'primary'
      case 'paid': return 'success'
      case 'overdue': return 'danger'
      case 'cancelled': return 'secondary'
      default: return 'secondary'
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'incoming': return 'info'
      case 'outgoing': return 'primary'
      default: return 'secondary'
    }
  }

  const getOverdueVariant = (severity: string | null) => {
    switch (severity) {
      case 'warning': return 'warning'
      case 'critical': return 'danger'
      case 'severe': return 'danger'
      default: return 'secondary'
    }
  }

  const entityInfo = invoice.customer || invoice.partner
  const entityType = invoice.customer ? 'Customer' : invoice.partner ? 'Partner' : 'Unknown'

  return (
    <Card
      hover={!!onClick}
      onClick={onClick ? () => onClick(invoice) : undefined}
      className="h-full"
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className={`font-semibold text-gray-900 truncate ${
                compact ? 'text-base' : 'text-lg'
              }`}>
                {invoice.invoiceNumber}
              </h3>

              <Badge variant={getTypeVariant(invoice.type)} size="sm">
                {INVOICE_TYPE_LABELS[invoice.type]}
              </Badge>

              {invoice.externalInvoiceNumber && (
                <Badge variant="secondary" size="sm">
                  Ext: {invoice.externalInvoiceNumber}
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-1 truncate">
              {invoice.description}
            </div>

            {entityInfo && (showCustomer || showPartner) && (
              <div className="text-sm text-gray-600">
                {entityType}: {entityInfo.companyName || entityInfo.shortName}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(invoice.status)} size="sm">
              {INVOICE_STATUS_LABELS[invoice.status]}
            </Badge>

            {invoice.overdueStatus?.isOverdue && (
              <Badge variant={getOverdueVariant(invoice.overdueStatus.severity)} size="sm">
                {invoice.overdueStatus.daysOverdue}d overdue
              </Badge>
            )}

            {invoice.overdueStatus?.severity === 'warning' && !invoice.overdueStatus.isOverdue && (
              <Badge variant="warning" size="sm">
                Due soon
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Amount Information */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(invoice.totalAmount.amount, invoice.totalAmount.currency)}
          </div>
          
          {invoice.taxAmount && (
            <div className="text-sm text-gray-500">
              Subtotal: {formatCurrency(invoice.subtotal.amount, invoice.subtotal.currency)}
              {invoice.taxRate && ` + ${invoice.taxRate}% tax`}
            </div>
          )}
        </div>

        {/* Date Information */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-500">Issue Date</div>
            <div className="font-medium">{formatDate(invoice.issueDate)}</div>
          </div>
          
          <div>
            <div className="text-gray-500">Due Date</div>
            <div className={`font-medium ${
              invoice.overdueStatus?.isOverdue ? 'text-red-600' : 
              invoice.overdueStatus?.severity === 'warning' ? 'text-orange-600' : 
              'text-gray-900'
            }`}>
              {formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {invoice.status === 'paid' && invoice.paymentDate && (
          <div className="p-3 bg-green-50 rounded-lg mb-4">
            <div className="text-xs font-medium text-green-900 mb-1">
              ✅ Paid {formatDate(invoice.paymentDate)}
            </div>
            {invoice.paidAmount && (
              <div className="text-xs text-green-700">
                Amount: {formatCurrency(invoice.paidAmount.amount, invoice.paidAmount.currency)}
              </div>
            )}
            {invoice.paymentMethod && (
              <div className="text-xs text-green-700">
                Method: {invoice.paymentMethod.replace('_', ' ')}
              </div>
            )}
          </div>
        )}

        {/* Collection Attempts */}
        {invoice.collectionAttempts && invoice.collectionAttempts.length > 0 && (
          <div className="p-3 bg-orange-50 rounded-lg mb-4">
            <div className="text-xs font-medium text-orange-900 mb-1">
              📞 {invoice.collectionAttempts.length} collection attempt{invoice.collectionAttempts.length !== 1 ? 's' : ''}
            </div>
            <div className="text-xs text-orange-700">
              Last: {invoice.collectionAttempts[invoice.collectionAttempts.length - 1].method} - 
              {formatDate(invoice.collectionAttempts[invoice.collectionAttempts.length - 1].date)}
            </div>
          </div>
        )}

        {/* Shipment Information */}
        {invoice.shipment && (
          <div className="text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Shipment: {invoice.shipment.shipmentNumber}</span>
            </div>
          </div>
        )}

        {/* Reference Information */}
        {invoice.purchaseOrderNumber && (
          <div className="text-xs text-gray-500 mt-2">
            PO: {invoice.purchaseOrderNumber}
          </div>
        )}

        {/* Recent Activity */}
        <div className="text-xs text-gray-500 mt-4">
          <div className="flex justify-between">
            <span>Created: {formatDate(invoice.createdAt)}</span>
            <span>Updated: {formatDate(invoice.updatedAt)}</span>
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {invoice.status === 'draft' && (
                <Button size="sm" variant="primary">
                  📧 Send
                </Button>
              )}

              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <Button size="sm" variant="success">
                  💰 Mark Paid
                </Button>
              )}

              <Link
                to="/yourobc/invoices/$invoiceId"
                params={{ invoiceId: invoice._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${
                invoice.type === 'outgoing' ? 'bg-blue-300' : 'bg-purple-300'
              }`}></span>
              <span>{invoice.totalAmount.currency}</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}