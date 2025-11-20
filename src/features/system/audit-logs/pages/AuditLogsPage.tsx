// src/features/audit-logs/pages/AuditLogsPage.tsx
import { useState } from 'react'
import {
  Download,
  Filter,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, Label, Modal, ModalBody, ModalFooter, ModalHeader, ViewSwitcher, type ViewMode } from '@/components/ui'
import { AdminGuard } from '@/features/system/admin/components/AdminGuard'
import { AdminLayout } from '@/features/system/admin/components/AdminLayout'
import { AuditLogTableComponent } from '../components/AuditLogTable'
import { AuditLogList } from '../components/AuditLogList'
import { AuditLogGrid } from '../components/AuditLogGrid'
import { AuditLogFiltersComponent } from '../components/AuditLogFilters'
import { AuditLogStatsComponent } from '../components/AuditLogStats'
import { useAuditLogManagement } from '../hooks/useAdminAuditLogs'
import type { AuditLogEntry } from '../types/audit-logs.types'
import { useToast } from '@/features/system/notifications'

export function AuditLogsPage() {
  const toast = useToast();
  const {
    logs,
    total,
    auditStats,
    isLoading,
    isUpdating,
    error,
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    selectedLogs,
    toggleLogSelection,
    selectAllLogs,
    clearSelection,
    showExportModal,
    setShowExportModal,
    showCleanupModal,
    setShowCleanupModal,
    handleExport,
    handleCleanup,
    hasSelection,
    selectionCount,
  } = useAuditLogManagement()

  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const handleLogClick = (log: AuditLogEntry) => {
    setSelectedLog(log)
  }

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
  }

  const handleExportCSV = async () => {
    const result = handleExport('csv', hasSelection)
    if (result.success) {
      toast.success(`Exported ${hasSelection ? selectionCount : logs.length} logs`)
    } else {
      toast.error(result.error || 'Export failed')
    }
  }

  const handleExportJSON = async () => {
    const result = handleExport('json', hasSelection)
    if (result.success) {
      toast.success(`Exported ${hasSelection ? selectionCount : logs.length} logs`)
    } else {
      toast.error(result.error || 'Export failed')
    }
  }

  const handleCleanupLogs = async () => {
    const result = await handleCleanup()
    if (result?.success) {
      toast.success(`Cleaned up ${result.deletedCount} old audit logs`)
    } else {
      toast.error(result?.error || 'Cleanup failed')
    }
  }

  if (error) {
    return (
      <AdminGuard requiredPermission="audit.view">
        <AdminLayout title="Audit Logs" subtitle="System activity tracking and monitoring">
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Audit Logs</h2>
                <p className="text-gray-600">{error.message || 'Failed to load audit logs'}</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </AdminLayout>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard requiredPermission="audit.view">
      <AdminLayout 
        title="Audit Logs" 
        subtitle="System activity tracking and monitoring"
        actions={
          <div className="flex space-x-3">
            <ViewSwitcher view={viewMode} onViewChange={setViewMode} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2"
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCleanupModal(true)}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Cleanup</span>
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2"
              disabled={isUpdating}
            >
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        }
      >
        {/* Statistics */}
        {auditStats && (
          <div className="mb-8">
            <AuditLogStatsComponent stats={auditStats!} loading={isLoading} />
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <AuditLogFiltersComponent
              filters={filters}
              onFiltersChange={updateFilters}
              onReset={resetFilters}
              loading={isLoading}
            />
          </div>
        )}

        {/* Selection Summary */}
        {hasSelection && (
          <div className="mb-4">
            <Card>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {selectionCount} log{selectionCount !== 1 ? 's' : ''} selected
                    </span>
                    <Badge variant="primary">{selectionCount}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                      Export Selected as CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportJSON}>
                      Export Selected as JSON
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audit Logs Views */}
        {viewMode === 'table' && (
          <AuditLogTableComponent
            logs={logs}
            loading={isLoading}
            onRowClick={handleLogClick}
            onViewDetails={handleViewDetails}
            showUser={true}
            showEntity={true}
            showMetadata={false}
            selectable={true}
            selectedLogs={selectedLogs}
            onToggleSelection={toggleLogSelection}
            onSelectAll={selectAllLogs}
            onClearSelection={clearSelection}
          />
        )}

        {viewMode === 'list' && (
          <AuditLogList
            logs={logs}
            loading={isLoading}
            onRowClick={handleLogClick}
            showUser={true}
            showEntity={true}
            virtualize={logs.length > 50}
            virtualHeight="calc(100vh - 400px)"
          />
        )}

        {viewMode === 'grid' && (
          <AuditLogGrid
            logs={logs}
            loading={isLoading}
            onRowClick={handleLogClick}
            onViewDetails={handleViewDetails}
            showUser={true}
            showEntity={true}
            columns={3}
          />
        )}

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {currentPage + 1} • Showing {logs.length} of {total.toLocaleString()} logs
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousPage}
                      disabled={!hasPreviousPage || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={!hasNextPage || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Log Detail Modal */}
        {selectedLog && (
          <LogDetailModal
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            logCount={hasSelection ? selectionCount : logs.length}
            hasSelection={hasSelection}
          />
        )}

        {/* Cleanup Modal */}
        {showCleanupModal && (
          <CleanupModal
            onClose={() => setShowCleanupModal(false)}
            onConfirm={handleCleanupLogs}
            isLoading={isUpdating}
          />
        )}
      </AdminLayout>
    </AdminGuard>
  )
}

// Log Detail Modal Component
interface LogDetailModalProps {
  log: AuditLogEntry
  onClose: () => void
}

function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  const formatJson = (obj: unknown) => {
    if (!obj) return 'N/A'
    return JSON.stringify(obj, null, 2)
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <ModalHeader title="Audit Log Details" onClose={onClose}>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(log.createdAt).toLocaleString()}
        </p>
      </ModalHeader>

      <ModalBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Log ID</Label>
                    <p className="text-sm text-gray-900 font-mono">{log._id}</p>
                  </div>
                  <div>
                    <Label>User</Label>
                    <p className="text-sm text-gray-900">{log.userName}</p>
                    <p className="text-xs text-gray-500 font-mono">{log.userId}</p>
                  </div>
                  <div>
                    <Label>Action</Label>
                    <Badge variant="primary">{log.action}</Badge>
                  </div>
                  <div>
                    <Label>Entity</Label>
                    <p className="text-sm text-gray-900">
                      <Badge variant="secondary" className="mr-2">{log.entityType}</Badge>
                      {log.entityTitle && <span>{log.entityTitle}</span>}
                    </p>
                    {log.entityId && (
                      <p className="text-xs text-gray-500 font-mono">{log.entityId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {log.description}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              {log.metadata && (() => {
                const metadata = log.metadata as Record<string, unknown> | undefined
                if (!metadata) return null

                return (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Metadata</h3>
                    <div className="space-y-3">
                      {(() => {
                        const ipAddress = 'ipAddress' in metadata && metadata.ipAddress ? String(metadata.ipAddress) : null
                        const userAgent = 'userAgent' in metadata && metadata.userAgent ? String(metadata.userAgent) : null
                        const sessionId = 'sessionId' in metadata && metadata.sessionId ? String(metadata.sessionId) : null
                        const source = 'source' in metadata && metadata.source ? String(metadata.source) : null

                        return (
                          <>
                            {ipAddress && (
                              <div>
                                <Label>IP Address</Label>
                                <p className="text-sm text-gray-900 font-mono">{ipAddress}</p>
                              </div>
                            )}
                            {userAgent && (
                              <div>
                                <Label>User Agent</Label>
                                <p className="text-sm text-gray-900 break-all">{userAgent}</p>
                              </div>
                            )}
                            {sessionId && (
                              <div>
                                <Label>Session ID</Label>
                                <p className="text-sm text-gray-900 font-mono">{sessionId}</p>
                              </div>
                            )}
                            {source && (
                              <div>
                                <Label>Source</Label>
                                <p className="text-sm text-gray-900">{source}</p>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>

                    {/* Raw Metadata */}
                    <div className="mt-4">
                      <Label className="mb-2">Raw Metadata</Label>
                      <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md overflow-x-auto">
                        {formatJson(metadata)}
                      </pre>
                    </div>
                  </div>
                )
              })()}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Timing</h3>
                <div className="space-y-2">
                  <div>
                    <Label>Created At</Label>
                    <p className="text-sm text-gray-900">{new Date(log.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{new Date(log.createdAt).toISOString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

// Export Modal Component
interface ExportModalProps {
  onClose: () => void
  onExportCSV: () => void
  onExportJSON: () => void
  logCount: number
  hasSelection: boolean
}

function ExportModal({ onClose, onExportCSV, onExportJSON, logCount, hasSelection }: ExportModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <ModalHeader title="Export Audit Logs" onClose={onClose}>
        <p className="text-sm text-gray-500 mt-1">
          Export {logCount.toLocaleString()} log{logCount !== 1 ? 's' : ''}
          {hasSelection ? ' (selected)' : ''}
        </p>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose your preferred export format:
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onExportCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
              <span className="ml-auto text-xs text-gray-500">Spreadsheet format</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onExportJSON}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
              <span className="ml-auto text-xs text-gray-500">Developer format</span>
            </Button>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}

// Cleanup Modal Component
interface CleanupModalProps {
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

function CleanupModal({ onClose, onConfirm, isLoading }: CleanupModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <ModalHeader title="Cleanup Old Audit Logs" onClose={onClose} />

      <ModalBody>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm text-gray-900 font-medium mb-2">
              This will permanently delete old audit logs
            </p>
            <p className="text-sm text-gray-600">
              Logs older than the configured retention period will be removed.
              This action cannot be undone.
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Cleaning up...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Cleanup Logs
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  )
}