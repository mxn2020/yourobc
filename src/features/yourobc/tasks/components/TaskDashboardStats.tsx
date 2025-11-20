// src/features/yourobc/tasks/components/TaskDashboardStats.tsx

import { FC } from 'react'
import { Card, Badge, Loading } from '@/components/ui'
import { useTaskDashboard } from '../hooks/useTaskDashboard'

interface TaskDashboardStatsProps {
  isLoading?: boolean
  stats?: {
    tasks: {
      total: number
      pending: number
      inProgress: number
      overdue: number
      completed: number
    }
    quotes: {
      total: number
      draft: number
      sent: number
      accepted: number
      rejected: number
      expired: number
      conversionRate: number
    }
    shipments: {
      total: number
      active: number
      inTransit: number
      delivered: number
      overdue: number
    }
  }
}

export const TaskDashboardStats: FC<TaskDashboardStatsProps> = ({ isLoading, stats }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="md" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: 3 Main Entity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Card */}
        <Card className="border-blue-200 bg-blue-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-blue-900">{stats.tasks.total}</div>
                <div className="text-sm text-blue-700 font-semibold">Total Tasks</div>
              </div>
              <div className="text-3xl">✓</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700">Pending</span>
                <Badge variant="warning" size="sm">
                  {stats.tasks.pending}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700">In Progress</span>
                <Badge variant="primary" size="sm">
                  {stats.tasks.inProgress}
                </Badge>
              </div>
              {stats.tasks.overdue > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-700">Overdue</span>
                  <Badge variant="danger" size="sm">
                    {stats.tasks.overdue}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Quotes Card */}
        <Card className="border-green-200 bg-green-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-green-900">{stats.quotes.total}</div>
                <div className="text-sm text-green-700 font-semibold">Total Quotes</div>
              </div>
              <div className="text-3xl">📋</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Draft</span>
                <Badge variant="secondary" size="sm">
                  {stats.quotes.draft}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Sent</span>
                <Badge variant="primary" size="sm">
                  {stats.quotes.sent}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Accepted</span>
                <Badge variant="success" size="sm">
                  {stats.quotes.accepted}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Shipments Card */}
        <Card className="border-purple-200 bg-purple-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-purple-900">{stats.shipments.total}</div>
                <div className="text-sm text-purple-700 font-semibold">Total Shipments</div>
              </div>
              <div className="text-3xl">📦</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-purple-700">Active</span>
                <Badge variant="primary" size="sm">
                  {stats.shipments.active}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-purple-700">In Transit</span>
                <Badge variant="warning" size="sm">
                  {stats.shipments.inTransit}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-purple-700">Delivered</span>
                <Badge variant="success" size="sm">
                  {stats.shipments.delivered}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Task Completion Rate */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 mb-1">Task Completion</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.tasks.total > 0
                    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
                    : 0}%
                </div>
              </div>
              <div className="text-2xl">📊</div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.tasks.completed} of {stats.tasks.total} completed
            </div>
          </div>
        </Card>

        {/* Quote Conversion */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 mb-1">Quote Conversion</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.quotes.conversionRate}%
                </div>
              </div>
              <div className="text-2xl">💼</div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.quotes.accepted} quotes accepted
            </div>
          </div>
        </Card>

        {/* Active Shipments */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 mb-1">Active Shipments</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.shipments.active}
                </div>
              </div>
              <div className="text-2xl">🚚</div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.shipments.inTransit} currently in transit
            </div>
          </div>
        </Card>

        {/* Attention Needed */}
        <Card className={`${
          stats.tasks.overdue + stats.shipments.overdue > 0
            ? 'bg-red-50 border-red-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs mb-1 ${
                  stats.tasks.overdue + stats.shipments.overdue > 0
                    ? 'text-red-700'
                    : 'text-gray-600'
                }`}>
                  Needs Attention
                </div>
                <div className={`text-2xl font-bold ${
                  stats.tasks.overdue + stats.shipments.overdue > 0
                    ? 'text-red-900'
                    : 'text-gray-900'
                }`}>
                  {stats.tasks.overdue + stats.shipments.overdue}
                </div>
              </div>
              <div className="text-2xl">
                {stats.tasks.overdue + stats.shipments.overdue > 0 ? '⚠️' : '✅'}
              </div>
            </div>
            <div className={`mt-2 text-xs ${
              stats.tasks.overdue + stats.shipments.overdue > 0
                ? 'text-red-600'
                : 'text-gray-500'
            }`}>
              {stats.tasks.overdue} tasks, {stats.shipments.overdue} shipments
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
