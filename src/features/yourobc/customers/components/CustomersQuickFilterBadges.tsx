// src/features/yourobc/customers/components/CustomersQuickFilterBadges.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import type { CustomerStats } from '../types'

interface CustomersQuickFilterBadgesProps {
  stats: CustomerStats | undefined
  statusFilter: string
  onStatusFilterChange: (status: string) => void
}

export const CustomersQuickFilterBadges: FC<CustomersQuickFilterBadgesProps> = ({
  stats,
  statusFilter,
  onStatusFilterChange,
}) => {
  if (!stats) return null

  const handleBadgeClick = (status: string) => {
    onStatusFilterChange(statusFilter === status ? '' : status)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        variant={statusFilter === 'active' ? 'success' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleBadgeClick('active')}
      >
        ✅ Active ({stats.activeCustomers})
      </Badge>

      <Badge
        variant={statusFilter === 'inactive' ? 'warning' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleBadgeClick('inactive')}
      >
        ⏸️ Inactive ({stats.inactiveCustomers})
      </Badge>

      <Badge
        variant={statusFilter === 'blacklisted' ? 'danger' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleBadgeClick('blacklisted')}
      >
        🚫 Blacklisted ({stats.blacklistedCustomers})
      </Badge>
    </div>
  )
}
