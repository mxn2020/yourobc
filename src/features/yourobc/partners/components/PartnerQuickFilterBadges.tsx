// src/features/yourobc/partners/components/PartnerQuickFilterBadges.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'

interface PartnerStats {
  totalPartners: number
  activePartners: number
  partnersByServiceType: Record<string, number>
  partnersByCountry: Record<string, number>
  avgQuotesPerPartner: number
}

interface PartnerQuickFilterBadgesProps {
  stats: PartnerStats | undefined
  statusFilter: string
  serviceTypeFilter: string
  onStatusFilterChange: (status: string) => void
  onServiceTypeFilterChange: (serviceType: string) => void
}

export const PartnerQuickFilterBadges: FC<PartnerQuickFilterBadgesProps> = ({
  stats,
  statusFilter,
  serviceTypeFilter,
  onStatusFilterChange,
  onServiceTypeFilterChange,
}) => {
  if (!stats) return null

  const handleStatusClick = (status: string) => {
    onStatusFilterChange(statusFilter === status ? '' : status)
  }

  const handleServiceTypeClick = (serviceType: string) => {
    onServiceTypeFilterChange(serviceTypeFilter === serviceType ? '' : serviceType)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* Status Filters */}
      <Badge
        variant={statusFilter === 'active' ? 'success' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('active')}
      >
        ✅ Active ({stats.activePartners})
      </Badge>

      <Badge
        variant={statusFilter === 'inactive' ? 'warning' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('inactive')}
      >
        ⏸️ Inactive ({stats.totalPartners - stats.activePartners})
      </Badge>

      {/* Service Type Filters */}
      {stats.partnersByServiceType.OBC && (
        <Badge
          variant={serviceTypeFilter === 'OBC' ? 'primary' : 'secondary'}
          className="cursor-pointer"
          onClick={() => handleServiceTypeClick('OBC')}
        >
          🚶‍♂️ OBC ({stats.partnersByServiceType.OBC})
        </Badge>
      )}

      {stats.partnersByServiceType.NFO && (
        <Badge
          variant={serviceTypeFilter === 'NFO' ? 'info' : 'secondary'}
          className="cursor-pointer"
          onClick={() => handleServiceTypeClick('NFO')}
        >
          ✈️ NFO ({stats.partnersByServiceType.NFO})
        </Badge>
      )}
    </div>
  )
}
