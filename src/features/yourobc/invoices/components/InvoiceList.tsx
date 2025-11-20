// src/features/yourobc/invoices/components/InvoiceList.tsx

import { FC, useState, useMemo } from 'react'
import { InvoiceCard } from './InvoiceCard'
import { useInvoices } from '../hooks/useInvoices'
import {
  Card,
  Input,
  Button,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Loading,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { 
  INVOICE_CONSTANTS,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  CURRENCY_SYMBOLS,
} from '../types'
import type { InvoiceSearchFilters, InvoiceListItem } from '../types'

interface InvoiceListProps {
  filters?: InvoiceSearchFilters
  showFilters?: boolean
  onInvoiceClick?: (invoice: InvoiceListItem) => void
  limit?: number
  compact?: boolean
  viewMode?: 'grid' | 'table'
}

export const InvoiceList: FC<InvoiceListProps> = ({
  filters: initialFilters,
  showFilters = true,
  onInvoiceClick,
  limit = 20,
  compact = false,
  viewMode = 'grid',
}) => {
  const [filters, setFilters] = useState<InvoiceSearchFilters>(initialFilters || {})
  const [searchTerm, setSearchTerm] = useState('')

  const {
    invoices,
    total,
    hasMore,
    isLoading,
    error,
    refetch,
    canCreateInvoices,
  } = useInvoices({
    limit,
    filters: {
      ...filters,
      search: searchTerm,
    },
  })

  const filteredInvoices = useMemo(() => {
    let filtered = invoices

    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.description.toLowerCase().includes(searchLower) ||
          invoice.externalInvoiceNumber?.toLowerCase().includes(searchLower) ||
          invoice.purchaseOrderNumber?.toLowerCase().includes(searchLower) ||
          invoice.customer?.companyName?.toLowerCase().includes(searchLower) ||
          invoice.partner?.companyName?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [invoices, searchTerm])

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilters((prev) => ({ ...prev, status: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        status: [status as any],
      }))
    }
  }

  const handleTypeFilter = (type: string) => {
    if (!type) {
      setFilters((prev) => ({ ...prev, type: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        type: [type as 'incoming' | 'outgoing'],
      }))
    }
  }

  const clearAllFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
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

  if (isLoading && invoices.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 p-6">
          <div className="text-red-500 mb-2">Error loading invoices</div>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="primary" size="sm">
            Try again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <div className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search invoices by number, description, customer, or PO..."
              />

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filters.status?.[0] || ''}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {Object.entries(INVOICE_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type?.[0] || ''}
                  onValueChange={handleTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="outgoing">{INVOICE_TYPE_LABELS.outgoing}</SelectItem>
                    <SelectItem value="incoming">{INVOICE_TYPE_LABELS.incoming}</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.isOverdue?.toString() || ''}
                  onValueChange={(value) => {
                    if (value === '') {
                      setFilters((prev) => ({ ...prev, isOverdue: undefined }))
                    } else {
                      setFilters((prev) => ({ ...prev, isOverdue: value === 'true' }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Payment Status</SelectItem>
                    <SelectItem value="false">Current</SelectItem>
                    <SelectItem value="true">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  {Object.keys(filters).length > 0 && (
                    <Button variant="ghost" onClick={clearAllFilters} className="w-full">
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={filters.status?.[0] === 'draft' ? 'primary' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter('draft')}
                >
                  📝 Drafts
                </Badge>

                <Badge
                  variant={filters.status?.[0] === 'sent' ? 'primary' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter('sent')}
                >
                  📧 Sent
                </Badge>

                <Badge
                  variant={filters.isOverdue ? 'danger' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, isOverdue: !prev.isOverdue }))}
                >
                  ⚠️ Overdue
                </Badge>

                <Badge
                  variant={filters.status?.[0] === 'paid' ? 'success' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter('paid')}
                >
                  ✅ Paid
                </Badge>

                <Badge
                  variant="info"
                  className="cursor-pointer"
                  onClick={clearAllFilters}
                >
                  🔄 Clear All
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredInvoices.length} of {total} invoices
          {searchTerm && (
            <span className="ml-2 text-blue-600 font-medium">
              for "{searchTerm}"
            </span>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {}}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗂️ Cards
          </button>
          <button
            onClick={() => {}}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Table
          </button>
        </div>
      </div>

      {/* Invoices Display */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <div className="text-center py-12 p-6">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm || Object.keys(filters).length > 0
                ? 'No invoices found matching your criteria'
                : 'No invoices yet'}
            </div>
            <p className="text-gray-400 mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : canCreateInvoices
                ? 'Create your first invoice to get started!'
                : 'Invoices will appear here once created.'}
            </p>
            {(searchTerm || Object.keys(filters).length > 0) && (
              <Button onClick={clearAllFilters} variant="primary" size="sm">
                Clear all filters
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer/Partner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow 
                  key={invoice._id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onInvoiceClick?.(invoice)}
                >
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                    {invoice.externalInvoiceNumber && (
                      <div className="text-xs text-gray-500">
                        Ext: {invoice.externalInvoiceNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={invoice.type === 'outgoing' ? 'primary' : 'info'} size="sm">
                      {INVOICE_TYPE_LABELS[invoice.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invoice.customer?.companyName || invoice.partner?.companyName || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.totalAmount.amount, invoice.totalAmount.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(invoice.status)} size="sm">
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </Badge>
                    {invoice.overdueStatus?.isOverdue && (
                      <div className="text-xs text-red-600 mt-1">
                        {invoice.overdueStatus.daysOverdue}d overdue
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(invoice.issueDate)}
                  </TableCell>
                  <TableCell className={`text-sm ${
                    invoice.overdueStatus?.isOverdue ? 'text-red-600 font-medium' : 
                    invoice.overdueStatus?.severity === 'warning' ? 'text-orange-600' : 
                    'text-gray-600'
                  }`}>
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {invoice.status === 'draft' && (
                        <Button size="sm" variant="primary">Send</Button>
                      )}
                      {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <Button size="sm" variant="success">Pay</Button>
                      )}
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${
            compact
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              onClick={onInvoiceClick}
              compact={compact}
              showCustomer={true}
              showPartner={true}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && filteredInvoices.length > 0 && (
        <div className="text-center">
          <Button onClick={() => refetch()} variant="primary">
            Load More Invoices
          </Button>
        </div>
      )}
    </div>
  )
}