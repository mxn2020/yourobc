// src/features/yourobc/customers/components/CustomerSearch.tsx

import { FC, useState } from 'react'
import { Input, Card, Badge, Loading, Button } from '@/components/ui'
import { useCustomerSearch } from '../hooks/useCustomers'
import type { CustomerListItem } from '../types'

interface CustomerSearchProps {
  onSelect?: (customer: CustomerListItem | null) => void
  placeholder?: string
  limit?: number
  selectedCustomer?: CustomerListItem | null
  showSelectedCustomer?: boolean
}

export const CustomerSearch: FC<CustomerSearchProps> = ({
  onSelect,
  placeholder = 'Search customers...',
  limit = 10,
  selectedCustomer = null,
  showSelectedCustomer = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { results, isLoading, hasResults } = useCustomerSearch(searchTerm)

  const handleSelect = (customer: CustomerListItem) => {
    onSelect?.(customer)
    setSearchTerm('')
    setShowResults(false)
  }

  const handleRemove = () => {
    onSelect?.(null)
  }

  return (
    <div className="space-y-2">
      {/* Show selected customer if available */}
      {showSelectedCustomer && selectedCustomer && (
        <Card className="bg-green-50 border-green-200">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  ✓ {selectedCustomer.companyName}
                </div>
                {selectedCustomer.shortName && selectedCustomer.shortName !== selectedCustomer.companyName && (
                  <div className="text-sm text-gray-600">{selectedCustomer.shortName}</div>
                )}
                <div className="text-sm text-gray-600">
                  {selectedCustomer.primaryContact.name}
                  {selectedCustomer.primaryContact.email && (
                    <span className="ml-2">• {selectedCustomer.primaryContact.email}</span>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                ✕ Remove
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Show search input when no customer is selected or showSelectedCustomer is false */}
      {(!showSelectedCustomer || !selectedCustomer) && (
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder={placeholder}
          />

          {showResults && searchTerm.length >= 2 && (
            <Card className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loading size="sm" />
                </div>
              ) : hasResults ? (
                <div className="divide-y">
                  {results.slice(0, limit).map((customer) => (
                    <div
                      key={customer._id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelect(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {customer.companyName}
                          </div>
                          {customer.shortName && customer.shortName !== customer.companyName && (
                            <div className="text-sm text-gray-500">{customer.shortName}</div>
                          )}
                          <div className="text-sm text-gray-500">
                            {customer.primaryContact.name}
                            {customer.primaryContact.email && (
                              <span className="ml-2">• {customer.primaryContact.email}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              customer.status === 'active'
                                ? 'success'
                                : customer.status === 'inactive'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {customer.status}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {customer.defaultCurrency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">No customers found</div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}