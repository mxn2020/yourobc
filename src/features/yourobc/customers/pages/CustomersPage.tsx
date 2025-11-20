// src/features/yourobc/customers/pages/CustomersPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { CustomerCard } from '../components/CustomerCard'
import { CustomerStats } from '../components/CustomerStats'
import { CustomersPageHeader } from '../components/CustomersPageHeader'
import { CustomersFilters } from '../components/CustomersFilters'
import { CustomersTable } from '../components/CustomersTable'
import { CustomersQuickFilterBadges } from '../components/CustomersQuickFilterBadges'
import { CustomersHelpSection } from '../components/CustomersHelpSection'
import { useCustomers } from '../hooks/useCustomers'
import { Card, Loading, PermissionDenied, ErrorState } from '@/components/ui'
import type { CustomerListItem } from '../types'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki/components/WikiSidebar'

export const CustomersPage: FC = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const {
    customers,
    stats,
    isLoading,
    isStatsLoading,
    error,
    isPermissionError,
    refetch,
    canCreateCustomers,
  } = useCustomers({
    limit: 50,
  })

  const handleCustomerClick = (customer: CustomerListItem) => {
    navigate({
      to: '/yourobc/customers/$customerId',
      params: { customerId: customer._id },
    })
  }

  const filteredCustomers = customers.filter((customer) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        customer.companyName.toLowerCase().includes(searchLower) ||
        customer.shortName?.toLowerCase().includes(searchLower) ||
        customer.primaryContact.name.toLowerCase().includes(searchLower) ||
        customer.primaryContact.email?.toLowerCase().includes(searchLower) ||
        customer.primaryContact.phone?.toLowerCase().includes(searchLower) ||
        customer.website?.toLowerCase().includes(searchLower) ||
        customer.tags?.some(tag => tag.toLowerCase().includes(searchLower))

      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter && customer.status !== statusFilter) return false

    return true
  })

  if (isLoading && customers.length === 0) {
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
        module="Customers"
        message={error.message}
        showDetails={true}
      />
    )
  }

  // Handle other errors
  if (error) {
    return <ErrorState error={error} onRetry={refetch} showDetails={true} />
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <CustomersPageHeader
          stats={stats}
          isStatsLoading={isStatsLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          canCreate={canCreateCustomers}
        />

        {/* Stats Overview */}
        {!isStatsLoading ? (
          <CustomerStats />
        ) : (
          <div className="flex justify-center py-8 mb-8">
            <Loading size="lg" />
          </div>
        )}

        {/* Filters */}
        <CustomersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onClearFilters={handleClearFilters}
          showClearButton={Boolean(searchTerm || statusFilter)}
        />

        {/* Quick Filter Badges */}
        <CustomersQuickFilterBadges
          stats={stats}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredCustomers.length} of {customers.length} customers
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                for "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Customers Display - Grid or Table */}
        {filteredCustomers.length === 0 ? (
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-2">
                {searchTerm || statusFilter
                  ? 'No customers found matching your criteria'
                  : 'No customers yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter
                  ? 'Try adjusting your search or filters'
                  : canCreateCustomers
                  ? 'Create your first customer to get started!'
                  : 'Customers will appear here once created.'}
              </p>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer._id}
                customer={customer}
                onClick={handleCustomerClick}
                showContactInfo={true}
                compact={false}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <CustomersTable
            customers={filteredCustomers}
            onRowClick={handleCustomerClick}
          />
        )}

        {/* Quick Actions (Fixed Position) */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          {canCreateCustomers && (
            <Link to="/yourobc/customers/new">
              <button
                className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
                title="Add New Customer"
              >
                ➕
              </button>
            </Link>
          )}
        </div>

        {/* Help Section */}
        <CustomersHelpSection />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Customers" title="Customer Wiki Helper" />
      </div>
    </div>
  )
}