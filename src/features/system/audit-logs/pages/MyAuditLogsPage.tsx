// src/features/boilerplate/audit-logs/pages/MyAuditLogsPage.tsx
import { useState } from 'react'
import {
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  Activity
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, Label, ViewSwitcher, type ViewMode } from '@/components/ui'
import { AuditLogTableComponent } from '../components/AuditLogTable'
import { AuditLogList } from '../components/AuditLogList'
import { AuditLogGrid } from '../components/AuditLogGrid'
import { AuditLogFiltersComponent } from '../components/AuditLogFilters'
import { AuditLogStatsComponent } from '../components/AuditLogStats'
import { useMyAuditLogs } from '../hooks/useAuditLogs'
import type { AuditLogEntry } from '../types/audit-logs.types'
import { useToast } from '@/features/boilerplate/notifications'

/**
 * My Audit Logs Page - For regular users to view their own activity
 */
export function MyAuditLogsPage() {
  const toast = useToast()

  const {
    logs,
    total,
    myStats,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    exportMyLogs,
  } = useMyAuditLogs()

  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const handleLogClick = (log: AuditLogEntry) => {
    setSelectedLog(log)
  }

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
  }

  const handleExportCSV = () => {
    const result = exportMyLogs({
      format: 'csv',
      filters,
      includeMetadata: true,
      includeUserDetails: false,
    })
    if (result.success) {
      toast.success(`Exported ${logs.length} logs`)
    } else {
      toast.error(result.error || 'Export failed')
    }
  }

  const handleExportJSON = () => {
    const result = exportMyLogs({
      format: 'json',
      filters,
      includeMetadata: true,
      includeUserDetails: false,
    })
    if (result.success) {
      toast.success(`Exported ${logs.length} logs`)
    } else {
      toast.error(result.error || 'Export failed')
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Audit Logs</h2>
              <p className="text-gray-600">{error.message || 'Failed to load your audit logs'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-8 w-8" />
          My Activity Log
        </h1>
        <p className="text-gray-600 mt-2">
          View and track your account activity and actions
        </p>
      </div>

      {/* Stats Section */}
      {myStats && (
        <div className="mb-6">
          <AuditLogStatsComponent stats={myStats} loading={isLoading} />
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Activity</h2>
              <p className="text-sm text-gray-600 mt-1">
                {total} {total === 1 ? 'log entry' : 'log entries'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ViewSwitcher view={viewMode} onViewChange={setViewMode} />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={logs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                disabled={logs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <AuditLogFiltersComponent
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={resetFilters}
              />
            </div>
          )}

          {/* Content based on view mode */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading your activity...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Activity Found</h3>
              <p className="text-gray-600">
                {Object.keys(filters).length > 0
                  ? 'No activity matches your current filters'
                  : 'You have no activity logged yet'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'table' && (
                <AuditLogTableComponent
                  logs={logs}
                  onRowClick={handleLogClick}
                  onViewDetails={handleViewDetails}
                  showUser={false}
                />
              )}
              {viewMode === 'list' && (
                <AuditLogList
                  logs={logs}
                  onRowClick={handleLogClick}
                  showUser={false}
                />
              )}
              {viewMode === 'grid' && (
                <AuditLogGrid
                  logs={logs}
                  onRowClick={handleLogClick}
                  showUser={false}
                />
              )}

              {/* Pagination */}
              {(hasNextPage || hasPreviousPage) && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage + 1}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousPage}
                      disabled={!hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={!hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Activity Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Action</Label>
                  <p className="mt-1">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <p className="mt-1">{selectedLog.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Entity</Label>
                  <p className="mt-1">
                    {selectedLog.entityType}
                    {selectedLog.entityId && ` (${selectedLog.entityId})`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Timestamp</Label>
                  <p className="mt-1">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
                {selectedLog.metadata && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Additional Information</Label>
                    <pre className="mt-1 p-3 bg-gray-50 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
