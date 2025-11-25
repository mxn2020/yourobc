// src/features/projects/components/ProjectQuickFilterBadges.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import { useTranslation } from '@/features/boilerplate/i18n'

interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  archivedProjects?: number
  onHoldProjects?: number
  overdueProjects?: number
  atRiskProjects?: number
  projectsByPriority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
}

interface ProjectQuickFilterBadgesProps {
  stats: ProjectStats | undefined | null
  statusFilter: string
  priorityFilter: string
  onStatusFilterChange: (status: string) => void
  onPriorityFilterChange: (priority: string) => void
}

export const ProjectQuickFilterBadges: FC<ProjectQuickFilterBadgesProps> = ({
  stats,
  statusFilter,
  priorityFilter,
  onStatusFilterChange,
  onPriorityFilterChange,
}) => {
  const { t } = useTranslation('projects')
  if (!stats) return null

  const statusBadges = [
    { label: t('status.active'), value: 'active', count: stats.activeProjects, variant: 'success' as const },
    { label: t('status.completed'), value: 'completed', count: stats.completedProjects, variant: 'primary' as const },
    { label: t('status.onHold'), value: 'on_hold', count: stats.onHoldProjects || 0, variant: 'warning' as const },
    { label: t('status.archived'), value: 'archived', count: stats.archivedProjects || 0, variant: 'secondary' as const },
  ]

  const priorityBadges = [
    { label: t('priority.urgent'), value: 'urgent', count: stats.projectsByPriority.urgent, variant: 'danger' as const },
    { label: t('priority.high'), value: 'high', count: stats.projectsByPriority.high, variant: 'warning' as const },
    { label: t('priority.medium'), value: 'medium', count: stats.projectsByPriority.medium, variant: 'info' as const },
    { label: t('priority.low'), value: 'low', count: stats.projectsByPriority.low, variant: 'secondary' as const },
  ]

  const specialBadges = [
    { label: t('quickFilters.overdue'), value: 'overdue', count: stats.overdueProjects || 0, variant: 'danger' as const, isStatus: true },
    { label: t('quickFilters.atRisk'), value: 'at-risk', count: stats.atRiskProjects || 0, variant: 'warning' as const, isStatus: true },
  ]

  return (
    <div className="mb-6 space-y-3">
      {/* Status Quick Filters */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-2">{t('quickFilters.byStatus')}</div>
        <div className="flex flex-wrap gap-2">
          {statusBadges.map((badge) => (
            <button
              key={badge.value}
              onClick={() => onStatusFilterChange(statusFilter === badge.value ? '' : badge.value)}
              className={`transition-all ${
                statusFilter === badge.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <Badge variant={badge.variant} size="sm" className="cursor-pointer hover:opacity-80">
                {badge.label} ({badge.count})
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Priority Quick Filters */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-2">{t('quickFilters.byPriority')}</div>
        <div className="flex flex-wrap gap-2">
          {priorityBadges.map((badge) => (
            <button
              key={badge.value}
              onClick={() => onPriorityFilterChange(priorityFilter === badge.value ? '' : badge.value)}
              className={`transition-all ${
                priorityFilter === badge.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <Badge variant={badge.variant} size="sm" className="cursor-pointer hover:opacity-80">
                {badge.label} ({badge.count})
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Special Filters */}
      {((stats.overdueProjects && stats.overdueProjects > 0) || (stats.atRiskProjects && stats.atRiskProjects > 0)) && (
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">{t('quickFilters.special')}</div>
          <div className="flex flex-wrap gap-2">
            {specialBadges
              .filter((badge) => badge.count > 0)
              .map((badge) => (
                <button
                  key={badge.value}
                  onClick={() => onStatusFilterChange(statusFilter === badge.value ? '' : badge.value)}
                  className={`transition-all ${
                    statusFilter === badge.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                >
                  <Badge variant={badge.variant} size="sm" className="cursor-pointer hover:opacity-80">
                    ⚠️ {badge.label} ({badge.count})
                  </Badge>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
