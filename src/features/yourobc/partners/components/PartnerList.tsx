// src/features/yourobc/partners/components/PartnerList.tsx

import { FC, useState, useMemo } from 'react'
import { PartnerCard } from './PartnerCard'
import { usePartners } from '../hooks/usePartners'
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
import { PARTNER_CONSTANTS, SERVICE_TYPE_LABELS } from '../types'
import type { PartnerSearchFilters, PartnerListItem } from '../types'

interface PartnerListProps {
  filters?: PartnerSearchFilters
  showFilters?: boolean
  onPartnerClick?: (partner: PartnerListItem) => void
  limit?: number
  compact?: boolean
  viewMode?: 'grid' | 'table'
}

export const PartnerList: FC<PartnerListProps> = ({
  filters: initialFilters,
  showFilters = true,
  onPartnerClick,
  limit = 20,
  compact = false,
  viewMode = 'grid',
}) => {
  const [filters, setFilters] = useState<PartnerSearchFilters>(initialFilters || {})
  const [searchTerm, setSearchTerm] = useState('')

  const {
    partners,
    total,
    hasMore,
    isLoading,
    error,
    refetch,
    canCreatePartners,
  } = usePartners({
    limit,
    filters: {
      ...filters,
      search: searchTerm,
    },
  })

  const filteredPartners = useMemo(() => {
    let filtered = partners

    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (partner) =>
          partner.companyName?.toLowerCase().includes(searchLower) ||
          partner.shortName?.toLowerCase().includes(searchLower) ||
          partner.partnerCode?.toLowerCase().includes(searchLower) ||
          partner.primaryContact.name?.toLowerCase().includes(searchLower) ||
          partner.primaryContact.email?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [partners, searchTerm])

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilters((prev) => ({ ...prev, status: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        status: [status as 'active' | 'inactive'],
      }))
    }
  }

  const handleServiceTypeFilter = (serviceType: string) => {
    if (!serviceType) {
      setFilters((prev) => ({ ...prev, serviceType: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        serviceType: [serviceType as 'OBC' | 'NFO' | 'both'],
      }))
    }
  }

  const clearAllFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  if (isLoading && partners.length === 0) {
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
          <div className="text-red-500 mb-2">Error loading partners</div>
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
                placeholder="Search partners by name, code, contact..."
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
                    <SelectItem value={PARTNER_CONSTANTS.STATUS.ACTIVE}>
                      Active
                    </SelectItem>
                    <SelectItem value={PARTNER_CONSTANTS.STATUS.INACTIVE}>
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.serviceType?.[0] || ''}
                  onValueChange={handleServiceTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Service Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Service Types</SelectItem>
                    <SelectItem value="OBC">{SERVICE_TYPE_LABELS.OBC}</SelectItem>
                    <SelectItem value="NFO">{SERVICE_TYPE_LABELS.NFO}</SelectItem>
                    <SelectItem value="both">{SERVICE_TYPE_LABELS.both}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    filters.status?.[0] === PARTNER_CONSTANTS.STATUS.ACTIVE
                      ? 'success'
                      : 'secondary'
                  }
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter(PARTNER_CONSTANTS.STATUS.ACTIVE)}
                >
                  ✅ Active Only
                </Badge>

                <Badge
                  variant={
                    filters.serviceType?.[0] === 'OBC'
                      ? 'primary'
                      : 'secondary'
                  }
                  className="cursor-pointer"
                  onClick={() => handleServiceTypeFilter('OBC')}
                >
                  🚚 OBC Partners
                </Badge>

                <Badge
                  variant={
                    filters.serviceType?.[0] === 'NFO'
                      ? 'primary'
                      : 'secondary'
                  }
                  className="cursor-pointer"
                  onClick={() => handleServiceTypeFilter('NFO')}
                >
                  ✈️ NFO Partners
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
          Showing {filteredPartners.length} of {total} partners
          {searchTerm && (
            <span className="ml-2 text-blue-600 font-medium">
              for "{searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* Partners Display */}
      {filteredPartners.length === 0 ? (
        <Card>
          <div className="text-center py-12 p-6">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm || Object.keys(filters).length > 0
                ? 'No partners found matching your criteria'
                : 'No partners yet'}
            </div>
            <p className="text-gray-400 mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : canCreatePartners
                ? 'Create your first partner to get started!'
                : 'Partners will appear here once created.'}
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
          {filteredPartners.map((partner) => (
            <PartnerCard
              key={partner._id}
              partner={partner}
              onClick={onPartnerClick}
              compact={compact}
              showCoverage={true}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && filteredPartners.length > 0 && (
        <div className="text-center">
          <Button onClick={() => refetch()} variant="primary">
            Load More Partners
          </Button>
        </div>
      )}
    </div>
  )
}