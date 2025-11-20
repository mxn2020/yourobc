// src/features/yourobc/invoices/pages/InvoicesPage.tsx

import { FC, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { InvoiceCard } from '../components/InvoiceCard'
import { InvoicesPageHeader } from '../components/InvoicesPageHeader'
import { InvoicesFilters } from '../components/InvoicesFilters'
import { InvoiceQuickFilterBadges } from '../components/InvoiceQuickFilterBadges'
import { InvoicesTable } from '../components/InvoicesTable'
import { InvoicesHelpSection } from '../components/InvoicesHelpSection'
import { InvoiceStats } from '../components/InvoiceStats'
import { useInvoices } from '../hooks/useInvoices'
import { Card, Loading, ErrorState, PermissionDenied } from '@/components/ui'
import type { InvoiceListItem } from '../types'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki/components/WikiSidebar'

export const InvoicesPage: FC = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const {
    invoices,
    stats,
    isLoading,
    isStatsLoading,
    error,
    isPermissionError,
    refetch,
    canCreateInvoices,
  } = useInvoices({
    limit: 50,
  })

  const handleInvoiceClick = (invoice: InvoiceListItem) => {
    navigate({
      to: '/yourobc/invoices/$invoiceId',
      params: { invoiceId: invoice._id },
    })
  }

  const filteredInvoices = invoices.filter((invoice) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.description.toLowerCase().includes(searchLower) ||
        invoice.externalInvoiceNumber?.toLowerCase().includes(searchLower) ||
        invoice.customer?.companyName?.toLowerCase().includes(searchLower) ||
        invoice.partner?.companyName?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter && invoice.status !== statusFilter) return false

    // Type filter
    if (typeFilter && invoice.type !== typeFilter) return false

    return true
  })

  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  // Handle permission errors
  if (isPermissionError && error) {
    return (
      <PermissionDenied
        permission={error.permission}
        module="Invoices"
        message={error.message}
        showDetails={true}
      />
    )
  }

  // Handle other errors
  if (error) {
    return <ErrorState error={error} onRetry={refetch} showDetails={true} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <InvoicesPageHeader
          stats={stats}
          isStatsLoading={isStatsLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          canCreate={canCreateInvoices}
        />

        {/* Stats Overview */}
        {!isStatsLoading && stats ? (
          <div className="mb-8">
            <InvoiceStats />
          </div>
        ) : isStatsLoading ? (
          <div className="flex justify-center py-8 mb-8">
            <Loading size="lg" />
          </div>
        ) : null}

        {/* Filters */}
        <InvoicesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          onClearFilters={() => {
            setSearchTerm('')
            setStatusFilter('')
            setTypeFilter('')
          }}
          showClearButton={!!(searchTerm || statusFilter || typeFilter)}
        />

        {/* Quick Filter Pills */}
        <InvoiceQuickFilterBadges
          stats={stats}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredInvoices.length} of {invoices.length} invoices
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                for "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Invoices Display */}
        {filteredInvoices.length === 0 ? (
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-2">
                {searchTerm || statusFilter || typeFilter
                  ? 'No invoices found matching your criteria'
                  : 'No invoices yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter || typeFilter
                  ? 'Try adjusting your search or filters'
                  : canCreateInvoices
                  ? 'Create your first invoice to get started!'
                  : 'Invoices will appear here once created.'}
              </p>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice._id}
                invoice={invoice}
                onClick={handleInvoiceClick}
                showCustomer={true}
                showPartner={true}
                compact={false}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <InvoicesTable
            invoices={filteredInvoices}
            onRowClick={handleInvoiceClick}
          />
        )}

        {/* Help Section */}
        <InvoicesHelpSection />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Invoices" title="Invoice Wiki Helper" />
      </div>
    </div>
  )
}
