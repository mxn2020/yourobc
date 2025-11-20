// src/features/yourobc/accounting/components/StatementExport.tsx

import { FC, useState } from 'react'
import { Button } from '@/components/ui'
import type { Id } from '@/convex/_generated/dataModel'

interface StatementExportProps {
  statementId: Id<'yourobcStatementOfAccounts'>
  customerName: string
  onExport: (statementId: Id<'yourobcStatementOfAccounts'>, format: 'pdf' | 'excel') => Promise<void>
  onMarkExported?: (statementId: Id<'yourobcStatementOfAccounts'>, format: 'pdf' | 'excel') => void
}

export const StatementExport: FC<StatementExportProps> = ({
  statementId,
  customerName,
  onExport,
  onMarkExported,
}) => {
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format)
    setError(null)

    try {
      await onExport(statementId, format)

      // Mark as exported
      if (onMarkExported) {
        onMarkExported(statementId, format)
      }

      // Success feedback
      alert(`Statement exported as ${format.toUpperCase()} successfully!`)
    } catch (err) {
      setError((err as Error).message || 'Export failed')
      console.error('Export error:', err)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null}
        >
          {exporting === 'pdf' ? '⏳ Exporting...' : '📄 Export PDF'}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleExport('excel')}
          disabled={exporting !== null}
        >
          {exporting === 'excel' ? '⏳ Exporting...' : '📊 Export Excel'}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ❌ {error}
        </div>
      )}

      <div className="text-xs text-gray-500">
        <div className="font-medium mb-1">Export Options:</div>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>PDF:</strong> Professional formatted statement for printing/email</li>
          <li><strong>Excel:</strong> Editable spreadsheet with transaction details</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Aging Report Export Component
 * For exporting aging reports to Excel/PDF
 */
interface AgingReportExportProps {
  agingData: {
    customers: Array<{
      customer: {
        _id: Id<'yourobcCustomers'>
        companyName: string
      }
      total: number
      aging: {
        current: number
        days31to60: number
        days61to90: number
        days90plus: number
      }
      invoiceCount: number
      oldestInvoiceDays: number
    }>
    totals: {
      current: number
      days31to60: number
      days61to90: number
      days90plus: number
      total: number
    }
    currency: 'EUR' | 'USD'
  }
  onExport: (format: 'pdf' | 'excel') => Promise<void>
}

export const AgingReportExport: FC<AgingReportExportProps> = ({ agingData, onExport }) => {
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format)

    try {
      await onExport(format)
      alert(`Aging report exported as ${format.toUpperCase()} successfully!`)
    } catch (err) {
      console.error('Export error:', err)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Aging Report Summary</h3>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-600">Current (0-30d)</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(agingData.totals.current, agingData.currency)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">31-60 days</div>
          <div className="text-lg font-semibold text-yellow-600">
            {formatCurrency(agingData.totals.days31to60, agingData.currency)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">61-90 days</div>
          <div className="text-lg font-semibold text-orange-600">
            {formatCurrency(agingData.totals.days61to90, agingData.currency)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">90+ days</div>
          <div className="text-lg font-semibold text-red-600">
            {formatCurrency(agingData.totals.days90plus, agingData.currency)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(agingData.totals.total, agingData.currency)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null}
        >
          {exporting === 'pdf' ? '⏳ Exporting...' : '📄 Export PDF'}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleExport('excel')}
          disabled={exporting !== null}
        >
          {exporting === 'excel' ? '⏳ Exporting...' : '📊 Export Excel'}
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Total customers with outstanding balances: {agingData.customers.length}
      </div>
    </div>
  )
}
