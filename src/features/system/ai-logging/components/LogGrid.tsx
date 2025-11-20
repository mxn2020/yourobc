// src/features/system/ai-logging/components/LogGrid.tsx
import { Card, CardContent } from '@/components/ui'
import { Activity } from 'lucide-react'
import { LogCard } from './LogCard'
import type { AIUsageLog } from '@/features/system/ai-core/types'

interface LogGridProps {
  logs: AIUsageLog[]
  loading?: boolean
  onRowClick?: (log: AIUsageLog) => void
  onViewDetails?: (log: AIUsageLog) => void
  compact?: boolean
  columns?: 1 | 2 | 3 | 4
}

export function LogGrid({
  logs,
  loading = false,
  onRowClick,
  onViewDetails,
  compact = false,
  columns = 3,
}: LogGridProps) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading AI logs...</span>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI logs found</h3>
            <p className="text-gray-500">No AI usage logs match the current filters.</p>
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
        <LogCard
          key={log.publicId}
          log={log}
          onClick={onRowClick}
          onViewDetails={onViewDetails}
          compact={compact}
        />
      ))}
    </div>
  )
}
