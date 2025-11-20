// src/features/system/ai-logging/components/LogList.tsx
import { DataList, Badge } from '@/components/ui'
import { Activity, Database, CloudSnow, Minus, AlertCircle } from 'lucide-react'
import { getProviderColor } from '@/features/system/ai-core/utils'
import type { AIUsageLog } from '@/features/system/ai-core/types'

interface LogListProps {
  logs: AIUsageLog[]
  loading?: boolean
  onRowClick?: (log: AIUsageLog) => void
  compact?: boolean
  virtualize?: boolean
  virtualHeight?: number | string
}

export function LogList({
  logs,
  loading = false,
  onRowClick,
  compact = false,
  virtualize = true,
  virtualHeight = 600,
}: LogListProps) {
  const formatTokens = (tokens?: number) => {
    if (!tokens) return '0'
    if (tokens < 1000) return tokens.toString()
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`
    return `${(tokens / 1000000).toFixed(1)}M`
  }

  return (
    <DataList
      data={logs}
      loading={loading}
      emptyMessage="No AI logs found"
      onItemClick={onRowClick}
      virtualize={virtualize}
      virtualHeight={virtualHeight}
      estimateSize={compact ? 80 : 120}
      renderItem={(log) => {
        const metadata = log.metadata

        return (
          <div className="p-4">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Activity className="h-4 w-4 text-gray-400" />
                {log.success ? (
                  <Badge variant="success" size="sm" className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Success</span>
                  </Badge>
                ) : (
                  <Badge variant="error" size="sm" className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Failed</span>
                  </Badge>
                )}
                {log.warnings && log.warnings.length > 0 && (
                  <Badge variant="warning" size="sm">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {log.warnings.length}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500 text-right">
                <div className="font-medium">
                  {new Date(log.createdAt).toLocaleDateString()}
                </div>
                <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Model & Provider */}
            <div className="mb-2">
              <div className="font-medium text-sm truncate mb-1" title={log.modelId}>
                {log.modelId.split('/')[1] || log.modelId}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  size="sm"
                  className="text-white border-0"
                  style={{ backgroundColor: getProviderColor(log.provider) }}
                >
                  {log.provider}
                </Badge>
                <Badge variant="secondary" size="sm" className="capitalize">
                  {log.requestType.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Tokens:</span>
                <span className="font-medium">{formatTokens(log.usage.totalTokens)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Cost:</span>
                <span className="font-medium text-green-600">${log.cost.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Latency:</span>
                <span className={`font-medium ${
                  log.latencyMs < 1000 ? 'text-green-600' :
                  log.latencyMs < 5000 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {log.latencyMs}ms
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Cache:</span>
                {metadata?.cache?.applicationCache?.hit ? (
                  <Badge variant="success" size="sm" className="flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>App</span>
                  </Badge>
                ) : metadata?.cache?.providerCache?.hit ? (
                  <Badge variant="info" size="sm" className="flex items-center space-x-1">
                    <CloudSnow className="h-3 w-3" />
                    <span>{metadata.cache.providerCache.provider === 'anthropic' ? 'ANT' : 'OAI'}</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" size="sm" className="flex items-center space-x-1 text-gray-400">
                    <Minus className="h-3 w-3" />
                    <span>None</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}
