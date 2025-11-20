// src/features/audit-logs/components/AuditLogStats.tsx
import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import {
  Activity,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import type { MyAuditLogStats, AdminAuditLogStats } from '../types/audit-logs.types'

interface AuditLogStatsComponentProps {
  stats: MyAuditLogStats | AdminAuditLogStats
  loading?: boolean
}

// Type guard to check if stats include admin-only fields
function isAdminStats(stats: MyAuditLogStats | AdminAuditLogStats): stats is AdminAuditLogStats {
  return 'uniqueUsers' in stats
}

export function AuditLogStatsComponent({ stats, loading = false }: AuditLogStatsComponentProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Logs',
      value: stats.totalLogs.toLocaleString(),
      icon: Activity,
      color: 'blue',
      description: 'All time audit logs'
    },
    {
      title: 'Last 24h',
      value: stats.logsLast24h.toLocaleString(),
      icon: Clock,
      color: 'green',
      description: 'Recent activity'
    },
    {
      title: 'This Week',
      value: stats.logsLastWeek.toLocaleString(),
      icon: Calendar,
      color: 'purple',
      description: 'Week activity'
    },
    // Only show "Unique Users" for admin stats (system-wide)
    ...(isAdminStats(stats) ? [{
      title: 'Unique Users',
      value: stats.uniqueUsers.toLocaleString(),
      icon: Users,
      color: 'orange',
      description: 'Active users'
    }] : [])
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 bg-blue-50'
      case 'green':
        return 'text-green-600 bg-green-50'
      case 'purple':
        return 'text-purple-600 bg-purple-50'
      case 'orange':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Top Actions and Entity Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Top Actions</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.topActions)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([action, count]) => (
                  <div key={action} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {action.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              }
              {Object.keys(stats.topActions).length === 0 && (
                <p className="text-gray-500 text-sm">No actions recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Entity Types */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Top Entity Types</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.topEntityTypes)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([entityType, count]) => (
                  <div key={entityType} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              }
              {Object.keys(stats.topEntityTypes).length === 0 && (
                <p className="text-gray-500 text-sm">No entity types recorded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}