// src/features/audit-logs/components/AuditLogTable.tsx
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { Checkbox } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import {
  Activity,
  User,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import type { AuditEntityType, AuditLogEntry } from '../types/audit-logs.types'

interface AuditLogTableComponentProps {
  logs: AuditLogEntry[]
  loading?: boolean
  onRowClick?: (log: AuditLogEntry) => void
  onViewDetails?: (log: AuditLogEntry) => void
  showUser?: boolean
  showEntity?: boolean
  showMetadata?: boolean
  compact?: boolean
  selectable?: boolean
  selectedLogs?: Set<string>
  onToggleSelection?: (logId: string) => void
  onSelectAll?: () => void
  onClearSelection?: () => void
}

export function AuditLogTableComponent({
  logs,
  loading = false,
  onRowClick,
  onViewDetails,
  showUser = true,
  showEntity = true,
  showMetadata = false,
  compact = false,
  selectable = false,
  selectedLogs = new Set(),
  onToggleSelection,
  onSelectAll,
  onClearSelection,
}: AuditLogTableComponentProps) {

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('created') || action.includes('activated')) return 'success'
    if (action.includes('deleted') || action.includes('banned')) return 'danger'
    if (action.includes('updated') || action.includes('role')) return 'primary'
    if (action.includes('security') || action.includes('failed')) return 'warning'
    return 'secondary'
  }

  const getEntityBadgeVariant = (entityType: string) => {
    switch (entityType as AuditEntityType) {
      case 'system_user':
      case 'system_user_profile':
        return 'info'
      case 'system_project':
        return 'primary'
      case 'system_setting':
        return 'warning'
      case 'system':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading audit logs...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-500">No audit logs match the current filters.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Selection Header */}
        {selectable && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedLogs.size === logs.length && logs.length > 0}
                  onChange={() => selectedLogs.size === logs.length ? onClearSelection?.() : onSelectAll?.()}
                />
                <span className="text-sm text-gray-600">
                  {selectedLogs.size > 0 ? `${selectedLogs.size} selected` : 'Select all'}
                </span>
              </div>
              {selectedLogs.size > 0 && (
                <Button variant="ghost" size="sm" onClick={onClearSelection}>
                  Clear selection
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12"><span /></TableHead>
                )}
                <TableHead>
                  Timestamp
                </TableHead>
                {showUser && (
                  <TableHead>
                    User
                  </TableHead>
                )}
                <TableHead>
                  Action
                </TableHead>
                {showEntity && (
                  <TableHead>
                    Entity
                  </TableHead>
                )}
                <TableHead>
                  Description
                </TableHead>
                {showMetadata && (
                  <TableHead>
                    Metadata
                  </TableHead>
                )}
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow
                  key={log._id}
                  className={`${onRowClick ? 'cursor-pointer' : ''} ${
                    selectedLogs.has(log._id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onRowClick?.(log)}
                >
                  {selectable && (
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedLogs.has(log._id)}
                          onChange={() => {
                            onToggleSelection?.(log._id)
                          }}
                        />
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  {showUser && (
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{log.userName}</div>
                          <div className="text-gray-500 text-xs">{log.userId}</div>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  {showEntity && (
                    <TableCell>
                      <div className="text-sm">
                        <Badge variant={getEntityBadgeVariant(log.entityType)} className="mb-1">
                          {log.entityType}
                        </Badge>
                        {log.entityTitle && (
                          <div className="text-xs text-gray-500 mt-1">{log.entityTitle}</div>
                        )}
                        {log.entityId && (
                          <div className="text-xs text-gray-400 font-mono">{log.entityId}</div>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="text-sm text-gray-900 max-w-md">
                      {compact ? (
                        <span className="line-clamp-2">{log.description}</span>
                      ) : (
                        log.description
                      )}
                    </div>
                  </TableCell>
                  {showMetadata && (
                    <TableCell>
                      <div className="text-xs text-gray-500">
                        {(() => {
                          const metadata = log.metadata as Record<string, unknown> | undefined
                          if (!metadata) return null

                          return (
                            <>
                              {'ipAddress' in metadata && metadata.ipAddress && (
                                <div>IP: {String(metadata.ipAddress)}</div>
                              )}
                              {'sessionId' in metadata && metadata.sessionId && (
                                <div>Session: {String(metadata.sessionId).substring(0, 8)}...</div>
                              )}
                              {'source' in metadata && metadata.source && (
                                <div>Source: {String(metadata.source)}</div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {onViewDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewDetails(log)
                          }}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

