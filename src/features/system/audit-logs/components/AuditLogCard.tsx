// src/features/system/audit-logs/components/AuditLogCard.tsx
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { Activity, User, Eye, MoreHorizontal } from 'lucide-react'
import type { AuditEntityType, AuditLogEntry } from '../types/audit-logs.types'

interface AuditLogCardProps {
  log: AuditLogEntry
  onClick?: (log: AuditLogEntry) => void
  onViewDetails?: (log: AuditLogEntry) => void
  showUser?: boolean
  showEntity?: boolean
  showMetadata?: boolean
  compact?: boolean
}

export function AuditLogCard({
  log,
  onClick,
  onViewDetails,
  showUser = true,
  showEntity = true,
  showMetadata = false,
  compact = false,
}: AuditLogCardProps) {
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
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={() => onClick?.(log)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-400" />
            <Badge variant={getActionBadgeVariant(log.action)}>
              {log.action.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
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
            <Button variant="ghost" size="sm" title="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm text-gray-900 mb-3 ${compact ? 'line-clamp-2' : ''}`}>
          {log.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2">
          {showUser && (
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <span className="font-medium text-gray-900">{log.userName}</span>
                <span className="text-gray-500 ml-2 text-xs">{log.userId}</span>
              </div>
            </div>
          )}

          {showEntity && (
            <div className="flex items-start gap-2">
              <Badge variant={getEntityBadgeVariant(log.entityType)} className="mt-0.5">
                {log.entityType}
              </Badge>
              <div className="text-xs">
                {log.entityTitle && (
                  <div className="text-gray-600">{log.entityTitle}</div>
                )}
                {log.entityId && (
                  <div className="text-gray-400 font-mono">{log.entityId}</div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div>
              <span className="font-medium">
                {new Date(log.createdAt).toLocaleDateString()}
              </span>
              {' at '}
              <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {showMetadata && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              {(() => {
                const metadata = log.metadata as Record<string, unknown> | undefined
                if (!metadata) return null

                const renderMetadataValue = (value: unknown): string => {
                  if (value === null || value === undefined) return ''
                  if (typeof value === 'string') return value
                  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
                  if (Array.isArray(value)) return value.join(', ')
                  if (typeof value === 'object') return JSON.stringify(value)
                  return String(value)
                }

                const ipAddress = 'ipAddress' in metadata ? renderMetadataValue(metadata.ipAddress) : ''
                const sessionId = 'sessionId' in metadata ? renderMetadataValue(metadata.sessionId) : ''
                const source = 'source' in metadata ? renderMetadataValue(metadata.source) : ''

                return (
                  <div className="space-y-1">
                    {ipAddress && (
                      <div>IP: {ipAddress}</div>
                    )}
                    {sessionId && (
                      <div>Session: {sessionId.substring(0, 8)}...</div>
                    )}
                    {source && (
                      <div>Source: {source}</div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
