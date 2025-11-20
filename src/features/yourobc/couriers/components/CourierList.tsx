// src/features/yourobc/couriers/components/CourierList.tsx

import { FC, useState, useMemo } from 'react'
import { CourierCard } from './CourierCard'
import { useCouriers } from '../hooks/useCouriers'
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
import { COURIER_CONSTANTS } from '../types'
import type { CourierSearchFilters, CourierListItem } from '../types'

interface CourierListProps {
  filters?: CourierSearchFilters
  showFilters?: boolean
  onCourierClick?: (courier: CourierListItem) => void
  limit?: number
  compact?: boolean
  viewMode?: 'grid' | 'table'
}

export const CourierList: FC<CourierListProps> = ({
  filters: initialFilters,
  showFilters = true,
  onCourierClick,
  limit = 20,
  compact = false,
  viewMode = 'grid',
}) => {
  const [filters, setFilters] = useState<CourierSearchFilters>(initialFilters || {})
  const [searchTerm, setSearchTerm] = useState('')

  const {
    couriers,
    total,
    hasMore,
    isLoading,
    error,
    refetch,
    canCreateCouriers,
  } = useCouriers({
    limit,
    filters: {
      ...filters,
      search: searchTerm,
    },
  })

  const filteredCouriers = useMemo(() => {
    let filtered = couriers

    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (courier) =>
          courier.firstName?.toLowerCase().includes(searchLower) ||
          courier.lastName?.toLowerCase().includes(searchLower) ||
          courier.courierNumber?.toLowerCase().includes(searchLower) ||
          courier.email?.toLowerCase().includes(searchLower) ||
          courier.phone?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [couriers, searchTerm])

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilters((prev) => ({ ...prev, status: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        status: [status as 'available' | 'busy' | 'offline'],
      }))
    }
  }

  const clearAllFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  if (isLoading && couriers.length === 0) {
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
          <div className="text-red-500 mb-2">Error loading couriers</div>
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
                placeholder="Search couriers by name, ID, email, or phone..."
              />

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  value={filters.status?.[0] || ''}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value={COURIER_CONSTANTS.STATUS.AVAILABLE}>
                      Available
                    </SelectItem>
                    <SelectItem value={COURIER_CONSTANTS.STATUS.BUSY}>Busy</SelectItem>
                    <SelectItem value={COURIER_CONSTANTS.STATUS.OFFLINE}>
                      Offline
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    filters.status?.[0] === COURIER_CONSTANTS.STATUS.AVAILABLE
                      ? 'success'
                      : 'secondary'
                  }
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter(COURIER_CONSTANTS.STATUS.AVAILABLE)}
                >
                  ✅ Available Only
                </Badge>

                <Badge
                  variant={filters.isOnline ? 'primary' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, isOnline: !prev.isOnline }))
                  }
                >
                  🟢 Online Only
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
          Showing {filteredCouriers.length} of {total} couriers
          {searchTerm && (
            <span className="ml-2 text-blue-600 font-medium">
              for "{searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* Couriers Display */}
      {filteredCouriers.length === 0 ? (
        <Card>
          <div className="text-center py-12 p-6">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm || Object.keys(filters).length > 0
                ? 'No couriers found matching your criteria'
                : 'No couriers yet'}
            </div>
            <p className="text-gray-400 mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : canCreateCouriers
                ? 'Create your first courier to get started!'
                : 'Couriers will appear here once created.'}
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
          {filteredCouriers.map((courier) => (
            <CourierCard
              key={courier._id}
              courier={courier}
              onClick={onCourierClick}
              compact={compact}
              showWorkStatus={true}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && filteredCouriers.length > 0 && (
        <div className="text-center">
          <Button onClick={() => refetch()} variant="primary">
            Load More Couriers
          </Button>
        </div>
      )}
    </div>
  )
}