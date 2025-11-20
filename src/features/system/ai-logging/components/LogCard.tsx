// src/features/boilerplate/ai-logging/components/LogCard.tsx
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { Activity, Eye, Database, CloudSnow, Minus, AlertCircle } from 'lucide-react'
import { getProviderColor } from '@/features/boilerplate/ai-core/utils'
import type { AIUsageLog } from '@/features/boilerplate/ai-core/types'

interface LogCardProps {
  log: AIUsageLog
  onClick?: (log: AIUsageLog) => void
  onViewDetails?: (log: AIUsageLog) => void
  compact?: boolean
}

export function LogCard({
  log,
  onClick,
  onViewDetails,
  compact = false,
}: LogCardProps) {
  const formatTokens = (tokens?: number) => {
    if (!tokens) return '0'
    if (tokens < 1000) return tokens.toString()
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`
    return `${(tokens / 1000000).toFixed(1)}M`
  }

  const metadata = log.metadata

  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={() => onClick?.(log)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Activity className="h-5 w-5 text-gray-400" />
            {log.success ? (
              <Badge variant="success" className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Success</span>
              </Badge>
            ) : (
              <Badge variant="error" className="flex items-center space-x-1">
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
        </div>

        {/* Model & Provider */}
        <div className="mb-3">
          <div className="font-medium text-sm truncate mb-1" title={log.modelId}>
            {log.modelId.split('/')[1] || log.modelId}
          </div>
          <div className="flex items-center gap-2">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          {/* Tokens */}
          <div>
            <div className="text-gray-500 text-xs mb-1">Tokens</div>
            <div className="font-medium">{formatTokens(log.usage.totalTokens)}</div>
            {!compact && (
              <div className="text-gray-500 text-xs">
                In: {formatTokens(log.usage.inputTokens)} | Out: {formatTokens(log.usage.outputTokens)}
              </div>
            )}
          </div>

          {/* Cost */}
          <div>
            <div className="text-gray-500 text-xs mb-1">Cost</div>
            <div className="font-medium text-green-600">
              ${log.cost.toFixed(4)}
            </div>
          </div>

          {/* Latency */}
          <div>
            <div className="text-gray-500 text-xs mb-1">Latency</div>
            <div className={`font-medium ${
              log.latencyMs < 1000 ? 'text-green-600' :
              log.latencyMs < 5000 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {log.latencyMs}ms
            </div>
          </div>

          {/* Cache */}
          <div>
            <div className="text-gray-500 text-xs mb-1">Cache</div>
            <div>
              {metadata?.cache?.applicationCache?.hit ? (
                <Badge variant="success" size="sm" className="flex items-center space-x-1 w-fit">
                  <Database className="h-3 w-3" />
                  <span>App</span>
                </Badge>
              ) : metadata?.cache?.providerCache?.hit ? (
                <Badge variant="info" size="sm" className="flex items-center space-x-1 w-fit">
                  <CloudSnow className="h-3 w-3" />
                  <span>{metadata.cache.providerCache.provider === 'anthropic' ? 'ANT' : 'OAI'}</span>
                </Badge>
              ) : (
                <Badge variant="outline" size="sm" className="flex items-center space-x-1 text-gray-400 w-fit">
                  <Minus className="h-3 w-3" />
                  <span>None</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Timestamp */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
          <div>
            <span className="font-medium">
              {new Date(log.createdAt).toLocaleDateString()}
            </span>
            {' at '}
            <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
