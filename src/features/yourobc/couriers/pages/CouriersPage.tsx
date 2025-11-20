// src/features/yourobc/couriers/pages/CouriersPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { CourierCard } from '../components/CourierCard'
import { CourierStats } from '../components/CourierStats'
import { CouriersPageHeader } from '../components/CouriersPageHeader'
import { CouriersFilters } from '../components/CouriersFilters'
import { CouriersTable } from '../components/CouriersTable'
import { CourierQuickFilterBadges } from '../components/CourierQuickFilterBadges'
import { CouriersHelpSection } from '../components/CouriersHelpSection'
import { useCouriers } from '../hooks/useCouriers'
import { Card, Loading, PermissionDenied, ErrorState } from '@/components/ui'
import type { CourierListItem } from '../types'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki/components/WikiSidebar'

export const CouriersPage: FC = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')

  const {
    couriers,
    stats,
    isLoading,
    isStatsLoading,
    error,
    isPermissionError,
    refetch,
    canCreateCouriers,
  } = useCouriers({
    limit: 50,
  })

  const handleCourierClick = (courier: CourierListItem) => {
    navigate({
      to: '/yourobc/couriers/$courierId',
      params: { courierId: courier._id },
    })
  }

  const filteredCouriers = couriers.filter((courier) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        courier.firstName.toLowerCase().includes(searchLower) ||
        courier.lastName.toLowerCase().includes(searchLower) ||
        courier.courierNumber.toLowerCase().includes(searchLower) ||
        courier.email?.toLowerCase().includes(searchLower) ||
        courier.phone.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter && courier.status !== statusFilter) return false

    // Service type filter
    if (serviceTypeFilter) {
      const availableServices = courier.skills?.availableServices || []
      if (serviceTypeFilter === 'both') {
        if (availableServices.length < 2) return false
      } else {
        if (!availableServices.includes(serviceTypeFilter as 'OBC' | 'NFO')) return false
      }
    }

    return true
  })

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setServiceTypeFilter('')
  }

  if (isLoading && couriers.length === 0) {
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
        module="Couriers"
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
        <CouriersPageHeader
          stats={stats}
          isStatsLoading={isStatsLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          canCreate={canCreateCouriers}
        />

        {/* Stats Overview */}
        {!isStatsLoading ? (
          <CourierStats />
        ) : (
          <div className="flex justify-center py-8 mb-8">
            <Loading size="lg" />
          </div>
        )}

        {/* Filters */}
        <CouriersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          serviceTypeFilter={serviceTypeFilter}
          onServiceTypeChange={setServiceTypeFilter}
          onClearFilters={handleClearFilters}
          showClearButton={Boolean(searchTerm || statusFilter || serviceTypeFilter)}
        />

        {/* Quick Filter Badges */}
        <CourierQuickFilterBadges
          stats={stats}
          statusFilter={statusFilter}
          serviceTypeFilter={serviceTypeFilter}
          onStatusFilterChange={setStatusFilter}
          onServiceTypeFilterChange={setServiceTypeFilter}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredCouriers.length} of {couriers.length} couriers
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                for "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Couriers Display - Grid or Table */}
        {filteredCouriers.length === 0 ? (
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-2">
                {searchTerm || statusFilter || serviceTypeFilter
                  ? 'No couriers found matching your criteria'
                  : 'No couriers yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter || serviceTypeFilter
                  ? 'Try adjusting your search or filters'
                  : canCreateCouriers
                  ? 'Create your first courier to get started!'
                  : 'Couriers will appear here once created.'}
              </p>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCouriers.map((courier) => (
              <CourierCard
                key={courier._id}
                courier={courier}
                onClick={handleCourierClick}
                showWorkStatus={true}
                compact={false}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <CouriersTable
            couriers={filteredCouriers}
            onRowClick={handleCourierClick}
          />
        )}

        {/* Quick Actions (Fixed Position) */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          {canCreateCouriers && (
            <Link to="/yourobc/couriers/new">
              <button
                className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
                title="Add New Courier"
              >
                ➕
              </button>
            </Link>
          )}
        </div>

        {/* Help Section */}
        <CouriersHelpSection />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Couriers" title="Courier Wiki Helper" />
      </div>
    </div>
  )
}