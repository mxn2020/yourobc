// src/features/yourobc/invoices/components/InvoicesPageHeader.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Button, Badge } from '@/components/ui'

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

interface InvoicesPageHeaderProps {
  stats: InvoiceStats | undefined
  isStatsLoading: boolean
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  canCreate: boolean
}

export const InvoicesPageHeader: FC<InvoicesPageHeaderProps> = ({
  stats,
  isStatsLoading,
  viewMode,
  onViewModeChange,
  canCreate,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-2">
          Manage your incoming and outgoing invoices
        </p>
        {!isStatsLoading && stats && (
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{stats.totalInvoices} total</span>
            <span>•</span>
            <Badge variant="warning" size="sm">{stats.overdueInvoices} overdue</Badge>
            <span>•</span>
            <Badge variant="success" size="sm">{stats.paidInvoices} paid</Badge>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗂️ Cards
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Table
          </button>
        </div>

        {/* Create Button */}
        {canCreate && (
          <Link to="/{-$locale}/yourobc/invoices/new">
            <Button variant="primary">
              + New Invoice
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
