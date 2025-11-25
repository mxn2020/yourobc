// src/features/projects/components/ProjectsPageHeader.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Button, Badge } from '@/components/ui'
import { useTranslation } from '@/features/boilerplate/i18n'
import { getCurrentLocale } from '@/features/boilerplate/i18n/utils/path'

interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  archivedProjects?: number
  onHoldProjects?: number
  overdueProjects?: number
  atRiskProjects?: number
  averageProgress?: number
  projectsByStatus: {
    active: number
    completed: number
    archived: number
    on_hold: number
  }
  projectsByPriority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
  projectsByCategory: Record<string, number>
}

interface ProjectsPageHeaderProps {
  stats: ProjectStats | undefined | null
  isStatsLoading: boolean
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  canCreate: boolean
}

export const ProjectsPageHeader: FC<ProjectsPageHeaderProps> = ({
  stats,
  isStatsLoading,
  viewMode,
  onViewModeChange,
  canCreate,
}) => {
  const { t } = useTranslation('projects')
  const locale = getCurrentLocale()

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('page.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('page.subtitle')}
        </p>
        {!isStatsLoading && stats && (
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{stats.totalProjects} {t('stats.total')}</span>
            <span>•</span>
            <Badge variant="success" size="sm">{stats.activeProjects} {t('stats.active')}</Badge>
            <span>•</span>
            <Badge variant="primary" size="sm">{stats.completedProjects} {t('stats.completed')}</Badge>
            {stats.overdueProjects && stats.overdueProjects > 0 && (
              <>
                <span>•</span>
                <Badge variant="danger" size="sm">{stats.overdueProjects} {t('stats.overdue')}</Badge>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗂️ {t('page.viewModes.cards')}
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 {t('page.viewModes.table')}
          </button>
        </div>

        {/* Create Button */}
        {canCreate && (
          <Link to="/{-$locale}/projects/new" params={{ locale }}>
            <Button variant="primary">
              + {t('page.createNew')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
