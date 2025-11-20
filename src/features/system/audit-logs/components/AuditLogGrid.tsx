// src/features/boilerplate/audit-logs/components/AuditLogGrid.tsx

import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui'
import { AuditLogCard } from './AuditLogCard'
import type { AuditLogEntry } from '../types/audit-logs.types'

interface AuditLogGridProps {
  logs: AuditLogEntry[]
  loading?: boolean
  onRowClick?: (log: AuditLogEntry) => void
  onViewDetails?: (log: AuditLogEntry) => void
  showUser?: boolean
  showEntity?: boolean
  showMetadata?: boolean
  compact?: boolean
  columns?: 1 | 2 | 3 | 4
}

export function AuditLogGrid({
  logs,
  loading = false,
  onRowClick,
  onViewDetails,
  showUser = true,
  showEntity = true,
  showMetadata = false,
  compact = false,
  columns = 3,
}: AuditLogGridProps) {
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

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns]

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {logs.map((log) => (
        <AuditLogCard
          key={log._id}
          log={log}
          onClick={onRowClick}
          onViewDetails={onViewDetails}
          showUser={showUser}
          showEntity={showEntity}
          showMetadata={showMetadata}
          compact={compact}
        />
      ))}
    </div>
  )
}
