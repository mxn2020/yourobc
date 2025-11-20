// src/features/admin/pages/AdminAuditLogsPage.tsx
import React, { useState } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, Input, SimpleSelect, Table } from '@/components/ui'
import { Search, Filter, Download, Calendar, Activity, AlertTriangle } from 'lucide-react'
import { AdminLayout } from '../components/AdminLayout'
import { AdminGuard } from '../components/AdminGuard'
import { useAnalyticsAudit } from '../hooks/useAnalyticsAudit'
import { useAdminPermissions } from '../hooks/useAdmin'
import type { AuditLogEntry, AuditLogFilters, AdminAction } from '../types/admin.types'
import { TableColumn } from '@/types'
import { EntityType } from '@/convex/types'
import type { BadgeVariant } from '@/components/ui'
import { useTranslation } from '@/features/system/i18n'

// Helper function for type-safe property access
function getAuditLogProperty(log: AuditLogEntry, key: string): string | number | AdminAction | EntityType | Record<string, string | number | boolean> | undefined {
  return (log as unknown as Record<string, string | number | AdminAction | EntityType | Record<string, string | number | boolean> | undefined>)[key];
}

export function AdminAuditLogsPage() {
  const { t } = useTranslation('admin')
  const { adminProfile } = useAdminPermissions()

  if (!adminProfile) {
    return (
      <AdminLayout title={t('auditLogs.title')} subtitle={t('auditLogs.subtitle')}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('settings.states.loadingProfile')}</p>
        </div>
      </AdminLayout>
    )
  }

  const {
    auditLogs,
    auditTotal,
    auditStats,
    auditSummary,
    auditLogsByDate,
    auditLogsByUser,
    isLoadingAudit,
    auditError,
    auditFilters,
    updateAuditFilters,
    resetAuditFilters,
    currentAuditPage,
    nextAuditPage,
    previousAuditPage,
    hasNextAuditPage,
    hasPreviousAuditPage,
    exportAuditLogs,
    downloadExport,
    getActionIcon,
  } = useAnalyticsAudit()

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | undefined) => {
    updateAuditFilters({ [key]: value })
  }

  const handleExportLogs = (format: 'csv' | 'json') => {
    const data = exportAuditLogs(format)
    const filename = `audit-logs-${new Date().toISOString().split('T')[0]}`
    downloadExport(data, filename, format)
  }

  const getActionColor = (action: string): BadgeVariant => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'success'
      case 'update':
        return 'info'
      case 'delete':
        return 'danger'
      case 'login':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getEntityTypeColor = (entityType: EntityType): BadgeVariant => {
    switch (entityType) {
      case 'system_project':
        return 'primary'
      case 'system_user':
        return 'info'
      case 'system_setting':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const columns: TableColumn<AuditLogEntry>[] = [
    {
      key: 'createdAt',
      title: t('auditLogs.table.columns.timestamp'),
      sortable: true,
      width: '180px',
      render: (value) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-gray-500">{new Date(value).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      key: 'userName',
      title: t('auditLogs.table.columns.user'),
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'action',
      title: t('auditLogs.table.columns.action'),
      render: (value: AdminAction) => (
        <div className="flex items-center space-x-2">
          <span>{getActionIcon(value)}</span>
          <Badge variant={getActionColor(value)}>
            {value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
      ),
    },
    {
      key: 'entityType',
      title: t('auditLogs.table.columns.entityType'),
      render: (value: EntityType) => (
        <Badge variant={getEntityTypeColor(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'description',
      title: t('auditLogs.table.columns.description'),
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {record.entityTitle && (
            <div className="text-sm text-gray-500">{record.entityTitle}</div>
          )}
        </div>
      ),
    },
    {
      key: 'metadata',
      title: t('auditLogs.table.columns.details'),
      render: (value) => {
        if (!value) return '-'
        
        const hasChanges = value.oldValues || value.newValues
        const hasLocation = value.ipAddress || value.userAgent
        const hasSource = value.source
        
        return (
          <div className="text-xs text-gray-500">
            {hasChanges && <div>• {t('auditLogs.table.details.dataChanged')}</div>}
            {hasLocation && <div>• {t('auditLogs.table.details.locationData')}</div>}
            {hasSource && <div>• {value.source}</div>}
          </div>
        )
      },
    },
  ]

  if (auditError) {
    return (
      <AdminGuard requiredPermission="audit.view">
        <AdminLayout title={t('auditLogs.title')} subtitle={t('auditLogs.subtitle')}>
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">{t('auditLogs.errors.loadingLogs')}</h2>
                <p className="text-gray-600">{auditError.message || t('auditLogs.errors.failedToLoad')}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  {t('auditLogs.errors.retry')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </AdminLayout>
      </AdminGuard>
    )
  }

  // Default stats if not loaded
  const stats = auditStats || {
    totalLogs: 0,
    logsToday: 0,
    logsThisWeek: 0,
    logsThisMonth: 0,
    actionCounts: {} as Record<AdminAction, number>,
    entityTypeCounts: {} as Record<string, number>,
    recentActivity: []
  }

  const actionOptions = [
    { value: '', label: t('auditLogs.filters.allActions') },
    ...Object.entries(stats.actionCounts || {}).map(([action, count]) => ({
      value: action,
      label: `${action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} (${count})`
    }))
  ]

  const entityTypeOptions = [
    { value: '', label: t('auditLogs.filters.allEntityTypes') },
    ...Object.entries(stats.entityTypeCounts || {}).map(([type, count]) => ({
      value: type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} (${count})`
    }))
  ]

  return (
    <AdminGuard requiredPermission="audit.view">
      <AdminLayout
        title={t('auditLogs.title')}
        subtitle={t('auditLogs.subtitle')}
        actions={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportLogs('csv')}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{t('auditLogs.actions.exportCsv')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportLogs('json')}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{t('auditLogs.actions.exportJson')}</span>
            </Button>
          </div>
        }
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalLogs.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{t('auditLogs.stats.totalEvents')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.logsToday}</div>
              <div className="text-sm text-gray-500">{t('auditLogs.stats.today')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.logsThisWeek}</div>
              <div className="text-sm text-gray-500">{t('auditLogs.stats.thisWeek')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.logsThisMonth}</div>
              <div className="text-sm text-gray-500">{t('auditLogs.stats.thisMonth')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter size={16} />
              <h3 className="text-lg font-semibold">{t('auditLogs.filters.title')}</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder={t('auditLogs.filters.searchPlaceholder')}
                value={auditFilters.query || ''}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                icon={<Search size={16} />}
              />
              <SimpleSelect
                value={auditFilters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
                options={actionOptions}
              />
              <SimpleSelect
                value={auditFilters.entityType || ''}
                onChange={(e) => handleFilterChange('entityType', e.target.value || undefined)}
                options={entityTypeOptions}
              />
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={resetAuditFilters}
                  className="text-sm"
                >
                  {t('auditLogs.filters.resetFilters')}
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">
                {t('auditLogs.filters.showing', { count: auditLogs.length, total: auditTotal })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardContent className="p-0">
            {isLoadingAudit ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">{t('auditLogs.states.loading')}</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('auditLogs.states.noLogs')}</p>
                {auditFilters.query && (
                  <Button
                    variant="outline"
                    onClick={resetAuditFilters}
                    className="mt-2"
                  >
                    {t('auditLogs.states.clearFilters')}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            style={{ width: column.width }}
                          >
                            {column.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLogs.map((log, index) => (
                        <tr key={log.id || index} className="hover:bg-gray-50">
                          {columns.map((column) => (
                            <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                              {column.render
                                ? column.render(getAuditLogProperty(log, column.key), log)
                                : getAuditLogProperty(log, column.key)?.toString() || '-'
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {t('auditLogs.pagination.page', { page: currentAuditPage + 1 })} • {t('auditLogs.pagination.showing', { count: auditLogs.length, total: auditTotal })}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousAuditPage}
                        disabled={!hasPreviousAuditPage}
                      >
                        {t('auditLogs.pagination.previous')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextAuditPage}
                        disabled={!hasNextAuditPage}
                      >
                        {t('auditLogs.pagination.next')}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>{t('auditLogs.summary.topActions')}</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.actionCounts || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([action, count]) => (
                    <div key={action} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span>{getActionIcon(action as AdminAction)}</span>
                        <Badge variant={getActionColor(action)}>
                          {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{t('auditLogs.summary.events', { count: count as number })}</span>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{t('auditLogs.summary.entityTypes')}</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.entityTypeCounts || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([entityType, count]) => (
                    <div key={entityType} className="flex justify-between items-center">
                      <Badge variant={getEntityTypeColor(entityType as EntityType)}>
                        {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                      </Badge>
                      <span className="text-sm font-medium">{t('auditLogs.summary.events', { count: count as number })}</span>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}