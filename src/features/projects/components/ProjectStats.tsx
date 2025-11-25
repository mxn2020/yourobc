// features/projects/components/ProjectStats.tsx
import { FC } from 'react'
import { Card, Badge, Loading } from '@/components/ui'
import { useTranslation } from '@/features/boilerplate/i18n'
import { ProjectStats as ProjectStatsType } from '@/convex/lib/projects'

interface ProjectStatsProps {
  stats: ProjectStatsType | undefined
  isLoading: boolean
}

export const ProjectStats: FC<ProjectStatsProps> = ({ stats, isLoading }) => {
  const { t } = useTranslation('projects')

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="md" message="stats.loading" namespace="projects" showMessage />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // Calculate completion rate
  const completionRate = stats.totalProjects > 0
    ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
    : 0

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: 4 Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
                <div className="text-sm text-gray-600">{t('stats.totalProjects')}</div>
              </div>
              <div className="text-3xl">📊</div>
            </div>
            <div className="mt-2">
              <Badge variant="primary" size="sm">
                {stats.activeProjects} {t('stats.active')}
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.activeProjects}</div>
                <div className="text-sm text-gray-600">{t('stats.activeProjects')}</div>
              </div>
              <div className="text-3xl">🟢</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {stats.onHoldProjects} {t('stats.onHold')}, {stats.archivedProjects} {t('stats.archived')}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completedProjects}</div>
                <div className="text-sm text-gray-600">{t('stats.completedProjects')}</div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="mt-2">
              <Badge variant="success" size="sm">
                {completionRate}% {t('stats.completion')}
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</div>
                <div className="text-sm text-gray-600">{t('stats.averageProgress')}</div>
              </div>
              <div className="text-3xl">📈</div>
            </div>
            <div className="mt-2">
              {stats.overdueProjects && stats.overdueProjects > 0 && (
                <Badge variant="danger" size="sm">
                  {stats.overdueProjects} {t('stats.overdue')}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: 3 List Metrics + Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* List Metric 1: By Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('stats.byStatus')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('status.active')}</span>
                <Badge variant="success" size="sm">
                  {stats.projectsByStatus.active}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('status.completed')}</span>
                <Badge variant="primary" size="sm">
                  {stats.projectsByStatus.completed}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('status.onHold')}</span>
                <Badge variant="warning" size="sm">
                  {stats.projectsByStatus['on_hold']}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('status.archived')}</span>
                <Badge variant="secondary" size="sm">
                  {stats.projectsByStatus.archived}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* List Metric 2: By Priority */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('stats.byPriority')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('priority.urgent')}</span>
                <Badge variant="danger" size="sm">
                  {stats.projectsByPriority.urgent}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('priority.high')}</span>
                <Badge variant="warning" size="sm">
                  {stats.projectsByPriority.high}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('priority.medium')}</span>
                <Badge variant="info" size="sm">
                  {stats.projectsByPriority.medium}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('priority.low')}</span>
                <Badge variant="secondary" size="sm">
                  {stats.projectsByPriority.low}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* List Metric 3: By Category */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('stats.byCategory')}</h3>
            <div className="space-y-2">
              {Object.entries(stats.projectsByCategory || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 4)
                .map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 truncate">{category}</span>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </div>
                ))}
              {Object.keys(stats.projectsByCategory || {}).length === 0 && (
                <div className="text-sm text-gray-400 text-center py-4">
                  {t('stats.noCategoriesYet')}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">{t('stats.projectHealth')}</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-blue-700 mb-1">{t('stats.completionRate')}</div>
                <div className="text-lg font-bold text-blue-900">
                  {completionRate}%
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">{t('stats.averageProgress')}</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.averageProgress}%
                </div>
              </div>
              {stats.overdueProjects !== undefined && stats.overdueProjects > 0 && (
                <div>
                  <div className="text-xs text-blue-700 mb-1">{t('stats.overdueProjects')}</div>
                  <div className="text-sm font-semibold text-red-700">
                    {stats.overdueProjects} {t('stats.needAttention')}
                  </div>
                </div>
              )}
              {stats.atRiskProjects !== undefined && stats.atRiskProjects > 0 && (
                <div>
                  <div className="text-xs text-blue-700 mb-1">{t('stats.atRisk')}</div>
                  <div className="text-sm font-semibold text-orange-700">
                    {stats.atRiskProjects} {t('stats.dueSoon')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
