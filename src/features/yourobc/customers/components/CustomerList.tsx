// src/features/yourobc/customers/components/CustomerList.tsx

import { FC, useState, useMemo } from 'react'
import { CustomerCard } from './CustomerCard'
import { useCustomers } from '../hooks/useCustomers'
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
} from '@/components/ui'
import { CUSTOMER_CONSTANTS, COMMON_COUNTRIES, COMMON_CURRENCIES } from '../types'
import type { CustomerSearchFilters, CustomerListItem } from '../types'

interface CustomerListProps {
  filters?: CustomerSearchFilters
  showFilters?: boolean
  onCustomerClick?: (customer: CustomerListItem) => void
  limit?: number
  compact?: boolean
  viewMode?: 'grid' | 'table'
}

export const CustomerList: FC<CustomerListProps> = ({
  filters: initialFilters,
  showFilters = true,
  onCustomerClick,
  limit = 20,
  compact = false,
  viewMode = 'grid',
}) => {
  const [filters, setFilters] = useState<CustomerSearchFilters>(initialFilters || {})
  const [searchTerm, setSearchTerm] = useState('')

  const {
    customers,
    total,
    hasMore,
    isLoading,
    error,
    refetch,
    canCreateCustomers,
  } = useCustomers({
    limit,
    filters: {
      ...filters,
      search: searchTerm,
    },
  })

  const filteredCustomers = useMemo(() => {
    let filtered = customers

    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (customer) =>
          customer.companyName?.toLowerCase().includes(searchLower) ||
          customer.shortName?.toLowerCase().includes(searchLower) ||
          customer.primaryContact.name?.toLowerCase().includes(searchLower) ||
          customer.primaryContact.email?.toLowerCase().includes(searchLower) ||
          customer.primaryContact.phone?.toLowerCase().includes(searchLower) ||
          customer.website?.toLowerCase().includes(searchLower) ||
          customer.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }, [customers, searchTerm])

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilters((prev) => ({ ...prev, status: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        status: [status as 'active' | 'inactive' | 'blacklisted'],
      }))
    }
  }

  const handleCountryFilter = (countryCode: string) => {
    if (!countryCode) {
      setFilters((prev) => ({ ...prev, countries: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        countries: [countryCode],
      }))
    }
  }

  const handleCurrencyFilter = (currency: string) => {
    if (!currency) {
      setFilters((prev) => ({ ...prev, currencies: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        currencies: [currency as 'EUR' | 'USD'],
      }))
    }
  }

  const clearAllFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  if (isLoading && customers.length === 0) {
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
          <div className="text-red-500 mb-2">Error loading customers</div>
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
                placeholder="Search customers by company name, contact, email, phone, or tags..."
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
                    <SelectItem value={CUSTOMER_CONSTANTS.STATUS.ACTIVE}>
                      Active
                    </SelectItem>
                    <SelectItem value={CUSTOMER_CONSTANTS.STATUS.INACTIVE}>
                      Inactive
                    </SelectItem>
                    <SelectItem value={CUSTOMER_CONSTANTS.STATUS.BLACKLISTED}>
                      Blacklisted
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.countries?.[0] || ''}
                  onValueChange={handleCountryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Countries</SelectItem>
                    {COMMON_COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.currencies?.[0] || ''}
                  onValueChange={handleCurrencyFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Currencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Currencies</SelectItem>
                    {COMMON_CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.hasRecentActivity || false}
                      onChange={(e) =>
                        setFilters((prev) => ({ 
                          ...prev, 
                          hasRecentActivity: e.target.checked || undefined 
                        }))
                      }
                      className="mr-2"
                    />
                    Recent Activity Only
                  </label>
                </div>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    filters.status?.[0] === CUSTOMER_CONSTANTS.STATUS.ACTIVE
                      ? 'success'
                      : 'secondary'
                  }
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter(CUSTOMER_CONSTANTS.STATUS.ACTIVE)}
                >
                  ✅ Active Only
                </Badge>

                <Badge
                  variant={filters.hasRecentActivity ? 'primary' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({ 
                      ...prev, 
                      hasRecentActivity: !prev.hasRecentActivity || undefined 
                    }))
                  }
                >
                  🟢 Recent Activity
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
          Showing {filteredCustomers.length} of {total} customers
          {searchTerm && (
            <span className="ml-2 text-blue-600 font-medium">
              for "{searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* Customers Display */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <div className="text-center py-12 p-6">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm || Object.keys(filters).length > 0
                ? 'No customers found matching your criteria'
                : 'No customers yet'}
            </div>
            <p className="text-gray-400 mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : canCreateCustomers
                ? 'Create your first customer to get started!'
                : 'Customers will appear here once created.'}
            </p>
            {(searchTerm || Object.keys(filters).length > 0) && (
              <Button onClick={clearAllFilters} variant="primary" size="sm">
                Clear all filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${
            compact
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer._id}
              customer={customer}
              onClick={onCustomerClick}
              compact={compact}
              showContactInfo={true}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && filteredCustomers.length > 0 && (
        <div className="text-center">
          <Button onClick={() => refetch()} variant="primary">
            Load More Customers
          </Button>
        </div>
      )}
    </div>
  )
}