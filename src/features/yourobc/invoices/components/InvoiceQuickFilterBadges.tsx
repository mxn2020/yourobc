// src/features/yourobc/invoices/components/InvoiceQuickFilterBadges.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'

interface InvoiceStats {
  totalInvoices: number
  totalOutgoingAmount: number
  totalIncomingAmount: number
  paidInvoices: number
  overdueInvoices: number
  draftInvoices: number
  avgPaymentTime: number
  outstandingAmount: number
  invoicesByStatus: Record<string, number>
  invoicesByType: Record<string, number>
  monthlyRevenue: number
  monthlyExpenses: number
}

interface InvoiceQuickFilterBadgesProps {
  stats: InvoiceStats | undefined
  statusFilter: string
  typeFilter: string
  onStatusFilterChange: (status: string) => void
  onTypeFilterChange: (type: string) => void
}

export const InvoiceQuickFilterBadges: FC<InvoiceQuickFilterBadgesProps> = ({
  stats,
  statusFilter,
  typeFilter,
  onStatusFilterChange,
  onTypeFilterChange,
}) => {
  if (!stats) return null

  const handleStatusClick = (status: string) => {
    onStatusFilterChange(statusFilter === status ? '' : status)
  }

  const handleTypeClick = (type: string) => {
    onTypeFilterChange(typeFilter === type ? '' : type)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* Status Filters */}
      <Badge
        variant={statusFilter === 'draft' ? 'secondary' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('draft')}
      >
        📝 Draft ({stats.draftInvoices})
      </Badge>

      <Badge
        variant={statusFilter === 'sent' ? 'primary' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('sent')}
      >
        📤 Sent ({stats.invoicesByStatus?.sent || 0})
      </Badge>

      <Badge
        variant={statusFilter === 'paid' ? 'success' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('paid')}
      >
        ✅ Paid ({stats.paidInvoices})
      </Badge>

      <Badge
        variant={statusFilter === 'overdue' ? 'danger' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('overdue')}
      >
        ⚠️ Overdue ({stats.overdueInvoices})
      </Badge>

      {/* Type Filters */}
      <Badge
        variant={typeFilter === 'outgoing' ? 'info' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleTypeClick('outgoing')}
      >
        💸 Outgoing ({stats.invoicesByType?.outgoing || 0})
      </Badge>

      <Badge
        variant={typeFilter === 'incoming' ? 'warning' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleTypeClick('incoming')}
      >
        📥 Incoming ({stats.invoicesByType?.incoming || 0})
      </Badge>
    </div>
  )
}
