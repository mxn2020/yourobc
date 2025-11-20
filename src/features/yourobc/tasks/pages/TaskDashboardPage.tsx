// src/features/yourobc/tasks/pages/TaskDashboardPage.tsx

import { FC, useState } from 'react'
import { useTaskDashboard } from '../hooks/useTaskDashboard'
import { TaskDashboardStats } from '../components/TaskDashboardStats'
import { CombinedDashboardView } from '../components/CombinedDashboardView'
import { DetailedDashboardView } from '../components/DetailedDashboardView'
import { Button, Alert, AlertDescription, Loading } from '@/components/ui'
import { ErrorState } from '@/components/ui/ErrorState'
import { PermissionDenied } from '@/components/ui/PermissionDenied'
import { useAuthenticatedUser } from '@/features/system/auth'

type ViewMode = 'combined' | 'detailed'

export const TaskDashboardPage: FC = () => {
  const authUser = useAuthenticatedUser()
  const [viewMode, setViewMode] = useState<ViewMode>('combined')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const {
    tasks,
    quotes,
    shipments,
    stats,
    isLoading,
    hasErrors,
    errors,
    refetch,
  } = useTaskDashboard({
    limit: 100,
    autoRefresh,
  })

  // Permission check
  if (!authUser) {
    return <PermissionDenied message="Please sign in to access this page" />
  }

  const hasViewPermission = ['admin', 'superadmin', 'manager', 'operations', 'sales'].includes(authUser.role)

  if (!hasViewPermission) {
    return <PermissionDenied message="You don't have permission to access the Task Dashboard" />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of tasks, quotes, and shipments across your operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? <Loading size="sm" /> : '🔄 Refresh'}
          </Button>
          <Button
            variant={autoRefresh ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '✓ Auto-refresh' : 'Auto-refresh'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="font-semibold mb-2">
              Failed to load some data:
            </div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((err, idx) => (
                <li key={idx}>
                  {err.type}: {err.error?.message || 'Unknown error'}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <TaskDashboardStats isLoading={isLoading} stats={stats} />

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">View Mode:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode('combined')}
              className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-lg transition-colors ${
                viewMode === 'combined'
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Combined View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-300 rounded-r-lg transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Detailed View
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {viewMode === 'combined' ? (
            <span>Showing shipments on top, tasks and quotes in columns below</span>
          ) : (
            <span>Showing detailed tables with tabs for each entity type</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      {isLoading && !tasks.length && !quotes.length && !shipments.length ? (
        <div className="flex justify-center items-center py-20">
          <Loading size="lg" />
        </div>
      ) : (
        <>
          {viewMode === 'combined' ? (
            <CombinedDashboardView
              tasks={tasks}
              quotes={quotes}
              shipments={shipments}
              isLoading={isLoading}
            />
          ) : (
            <DetailedDashboardView
              tasks={tasks}
              quotes={quotes}
              shipments={shipments}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && tasks.length === 0 && quotes.length === 0 && shipments.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 mb-6">
            There are no tasks, quotes, or shipments to display at this time.
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  )
}
