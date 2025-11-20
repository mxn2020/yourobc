// src/features/boilerplate/audit-logs/components/AuditLogList.tsx
import { DataList } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Activity, User } from 'lucide-react'
import type { AuditEntityType, AuditLogEntry } from '../types/audit-logs.types'

interface AuditLogListProps {
  logs: AuditLogEntry[]
  loading?: boolean
  onRowClick?: (log: AuditLogEntry) => void
  showUser?: boolean
  showEntity?: boolean
  compact?: boolean
  virtualize?: boolean
  virtualHeight?: number | string
}

export function AuditLogList({
  logs,
  loading = false,
  onRowClick,
  showUser = true,
  showEntity = true,
  compact = false,
  virtualize = true,
  virtualHeight = 600,
}: AuditLogListProps) {
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

  return (
    <DataList
      data={logs}
      loading={loading}
      emptyMessage="No audit logs found"
      onItemClick={onRowClick}
      virtualize={virtualize}
      virtualHeight={virtualHeight}
      estimateSize={compact ? 80 : 120}
      renderItem={(log) => (
        <div className="p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <Badge variant={getActionBadgeVariant(log.action)}>
                  {log.action.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-right">
              <div className="font-medium">
                {new Date(log.createdAt).toLocaleDateString()}
              </div>
              <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Description */}
          <div className={`text-sm text-gray-900 mb-2 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
            {log.description}
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-4 text-xs">
            {showUser && (
              <div className="flex items-center text-gray-600">
                <User className="h-3 w-3 mr-1" />
                <span className="font-medium">{log.userName}</span>
              </div>
            )}
            {showEntity && (
              <div className="flex items-center gap-2">
                <Badge variant={getEntityBadgeVariant(log.entityType)} className="text-xs">
                  {log.entityType}
                </Badge>
                {log.entityTitle && (
                  <span className="text-gray-500 truncate max-w-[200px]">
                    {log.entityTitle}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    />
  )
}
