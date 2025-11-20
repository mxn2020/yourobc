// src/features/yourobc/partners/pages/PartnersPage.tsx

import { FC, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PartnerCard } from '../components/PartnerCard'
import { PartnersPageHeader } from '../components/PartnersPageHeader'
import { PartnersFilters } from '../components/PartnersFilters'
import { PartnerQuickFilterBadges } from '../components/PartnerQuickFilterBadges'
import { PartnersTable } from '../components/PartnersTable'
import { PartnersHelpSection } from '../components/PartnersHelpSection'
import { PartnerStats } from '../components/PartnerStats'
import { usePartners } from '../hooks/usePartners'
import { Card, Loading, PermissionDenied, ErrorState } from '@/components/ui'
import type { PartnerListItem } from '../types'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki/components/WikiSidebar'

export const PartnersPage: FC = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')

  const {
    partners,
    stats,
    isLoading,
    isStatsLoading,
    error,
    isPermissionError,
    refetch,
    canCreatePartners,
  } = usePartners({
    limit: 50,
  })

  const handlePartnerClick = (partner: PartnerListItem) => {
    navigate({
      to: '/yourobc/partners/$partnerId',
      params: { partnerId: partner._id },
    })
  }

  const filteredPartners = partners.filter((partner) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        partner.companyName.toLowerCase().includes(searchLower) ||
        partner.shortName?.toLowerCase().includes(searchLower) ||
        partner.partnerCode?.toLowerCase().includes(searchLower) ||
        partner.primaryContact.name?.toLowerCase().includes(searchLower) ||
        partner.primaryContact.email?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter && partner.status !== statusFilter) return false

    // Service type filter
    if (serviceTypeFilter && partner.serviceType !== serviceTypeFilter) return false

    return true
  })

  if (isLoading && partners.length === 0) {
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
        module="Partners"
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
        <PartnersPageHeader
          stats={stats}
          isStatsLoading={isStatsLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          canCreate={canCreatePartners}
        />

        {/* Stats Overview */}
        {!isStatsLoading && stats ? (
          <div className="mb-8">
            <PartnerStats />
          </div>
        ) : isStatsLoading ? (
          <div className="flex justify-center py-8 mb-8">
            <Loading size="lg" />
          </div>
        ) : null}

        {/* Filters */}
        <PartnersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          serviceTypeFilter={serviceTypeFilter}
          onServiceTypeChange={setServiceTypeFilter}
          onClearFilters={() => {
            setSearchTerm('')
            setStatusFilter('')
            setServiceTypeFilter('')
          }}
          showClearButton={!!(searchTerm || statusFilter || serviceTypeFilter)}
        />

        {/* Quick Filter Pills */}
        <PartnerQuickFilterBadges
          stats={stats}
          statusFilter={statusFilter}
          serviceTypeFilter={serviceTypeFilter}
          onStatusFilterChange={setStatusFilter}
          onServiceTypeFilterChange={setServiceTypeFilter}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredPartners.length} of {partners.length} partners
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
                {searchTerm || statusFilter || serviceTypeFilter
                  ? 'No partners found matching your criteria'
                  : 'No partners yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter || serviceTypeFilter
                  ? 'Try adjusting your search or filters'
                  : canCreatePartners
                  ? 'Create your first partner to get started!'
                  : 'Partners will appear here once created.'}
              </p>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredPartners.map((partner) => (
              <PartnerCard
                key={partner._id}
                partner={partner}
                onClick={handlePartnerClick}
                showCoverage={true}
                compact={false}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <PartnersTable
            partners={filteredPartners}
            onRowClick={handlePartnerClick}
          />
        )}

        {/* Help Section */}
        <PartnersHelpSection />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Partners" title="Partner Wiki Helper" />
      </div>
    </div>
  )
}
