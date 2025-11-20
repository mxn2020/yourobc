// src/features/admin/pages/AdminDashboardPage.tsx
import React from 'react'
import {
  Users,
  Plus,
  Shield,
  CheckCircle,
  Brain,
  DollarSign,
  Trophy,
  TrendingUp,
  Activity,
  Settings,
  Mail,
  UserCheck,
  BarChart3,
  AlertTriangle
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { AdminStatsCard } from '../components/AdminStatsCard'
import { AdminLayout } from '../components/AdminLayout'
import { AdminGuard } from '../components/AdminGuard'
import { useAdminDashboard } from '../hooks/useAdmin'
import { useTranslation } from '@/features/system/i18n'

export function AdminDashboardPage() {
  const { t } = useTranslation('admin')
  const {
    stats,
    rawStats,
    settingsStats,
    auditStats,
    isLoading,
    error
  } = useAdminDashboard()

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  if (error) {
    return (
      <AdminGuard>
        <AdminLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">{t('dashboard.errors.loadingDashboard')}</h2>
                <p className="text-gray-600">{error.message || t('dashboard.errors.failedToLoad')}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  {t('dashboard.errors.retry')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </AdminLayout>
      </AdminGuard>
    )
  }

  if (!stats && !rawStats) {
    return (
      <AdminGuard>
        <AdminLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('dashboard.errors.noDataAvailable')}</p>
              </div>
            </CardContent>
          </Card>
        </AdminLayout>
      </AdminGuard>
    )
  }

  // Use formatted stats if available, otherwise use raw stats
  const displayStats = stats || rawStats

  return (
    <AdminGuard>
      <AdminLayout
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>{t('layout.actions.viewActivity')}</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>{t('layout.actions.settings')}</span>
            </Button>
          </div>
        }
      >
        {/* Primary Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatsCard
            title={t('dashboard.stats.totalUsers')}
            value={displayStats?.totalUsers?.toString() || '0'}
            icon={Users}
            color="blue"
            change={{
              value: 5,
              type: 'increase',
              period: t('dashboard.periods.thisWeek')
            }}
          />

          <AdminStatsCard
            title={t('dashboard.stats.activeUsers')}
            value={displayStats?.activeUsers?.toString() || '0'}
            icon={UserCheck}
            color="green"
            change={{
              value: stats?.activeUserPercentage || 0,
              type: 'increase',
              period: t('dashboard.periods.ofTotal')
            }}
          />

          <AdminStatsCard
            title={t('dashboard.stats.adminUsers')}
            value={displayStats?.adminUsers?.toString() || '0'}
            icon={Shield}
            color="purple"
          />

          <AdminStatsCard
            title={t('dashboard.stats.verifiedUsers')}
            value={displayStats?.verifiedUsers?.toString() || '0'}
            icon={CheckCircle}
            color="yellow"
            change={{
              value: stats?.verifiedUserPercentage || 0,
              type: 'increase',
              period: t('dashboard.periods.ofTotal')
            }}
          />
        </div>

        {/* AI & Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatsCard
            title={t('dashboard.stats.aiRequests')}
            value={displayStats?.totalAIRequests?.toString() || '0'}
            icon={Brain}
            color="blue"
          />

          <AdminStatsCard
            title={t('dashboard.stats.totalAICost')}
            value={displayStats?.totalAICost ? `$${displayStats.totalAICost}` : '$0.00'}
            icon={DollarSign}
            color="red"
          />

          <AdminStatsCard
            title={t('dashboard.stats.totalKarma')}
            value={displayStats?.totalKarma?.toString() || '0'}
            icon={Trophy}
            color="yellow"
          />

          <AdminStatsCard
            title={t('dashboard.stats.avgRequestsPerUser')}
            value={displayStats?.avgAIRequestsPerUser?.toString() || '0'}
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatsCard
            title={t('dashboard.stats.completeProfiles')}
            value={displayStats?.completeProfiles?.toString() || '0'}
            icon={CheckCircle}
            color="green"
            change={{
              value: stats?.completeProfilePercentage || 0,
              type: 'increase',
              period: t('dashboard.periods.ofTotal')
            }}
          />

          <AdminStatsCard
            title={t('dashboard.stats.bannedUsers')}
            value={displayStats?.bannedUsers?.toString() || '0'}
            icon={Shield}
            color="red"
            change={{
              value: stats?.bannedUserPercentage || 0,
              type: 'decrease',
              period: t('dashboard.periods.ofTotal')
            }}
          />

          <AdminStatsCard
            title={t('dashboard.stats.avgKarmaPerUser')}
            value={displayStats?.avgKarmaPerUser?.toString() || '0'}
            icon={Trophy}
            color="purple"
          />

          <AdminStatsCard
            title={t('dashboard.stats.systemHealth')}
            value="Healthy"
            icon={Activity}
            color="green"
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{t('dashboard.quickActions.title')}</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Users className="h-8 w-8 mb-2" />
                  <span>{t('dashboard.quickActions.manageUsers')}</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Settings className="h-8 w-8 mb-2" />
                  <span>{t('dashboard.quickActions.systemSettings')}</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Activity className="h-8 w-8 mb-2" />
                  <span>{t('dashboard.quickActions.viewLogs')}</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <BarChart3 className="h-8 w-8 mb-2" />
                  <span>{t('dashboard.quickActions.analytics')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>{t('dashboard.recentActivity.title')}</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">{t('dashboard.recentActivity.newUserRegistered')}</span>
                  <span className="text-gray-400 ml-auto">{t('dashboard.recentActivity.timeAgo.minutes', { count: 2 })}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{t('dashboard.recentActivity.userRoleUpdated')}</span>
                  <span className="text-gray-400 ml-auto">{t('dashboard.recentActivity.timeAgo.minutes', { count: 5 })}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">{t('dashboard.recentActivity.systemSettingsChanged')}</span>
                  <span className="text-gray-400 ml-auto">{t('dashboard.recentActivity.timeAgo.hours', { count: 1 })}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">{t('dashboard.recentActivity.databaseBackupCompleted')}</span>
                  <span className="text-gray-400 ml-auto">{t('dashboard.recentActivity.timeAgo.hours', { count: 3 })}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" className="w-full">
                  {t('dashboard.recentActivity.viewAll')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health & Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>{t('dashboard.systemHealth.title')}</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{t('dashboard.systemHealth.database')}</h4>
                  <p className="text-sm text-green-600">{t('dashboard.systemHealth.status.healthy')}</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{t('dashboard.systemHealth.apiServices')}</h4>
                  <p className="text-sm text-green-600">{t('dashboard.systemHealth.status.operational')}</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{t('dashboard.systemHealth.storage')}</h4>
                  <p className="text-sm text-green-600">{t('dashboard.systemHealth.status.available', { percent: 85 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>{t('dashboard.keyMetrics.title')}</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('dashboard.keyMetrics.userActivationRate')}</span>
                  <span className="text-sm font-semibold text-green-600">
                    {stats?.activeUserPercentage || 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('dashboard.keyMetrics.profileCompletionRate')}</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {stats?.completeProfilePercentage || 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('dashboard.keyMetrics.emailVerificationRate')}</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {stats?.verifiedUserPercentage || 0}%
                  </span>
                </div>

                {stats?.bannedUserPercentage !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{t('dashboard.keyMetrics.bannedUsers')}</span>
                    <span className="text-sm font-semibold text-red-600">
                      {stats.bannedUserPercentage}%
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" className="w-full">
                  {t('dashboard.keyMetrics.viewDetailed')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}