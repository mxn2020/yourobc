/**
 * Performance Dashboard Component
 *
 * Displays SSR cache hit rates, query performance, and error metrics
 */

import { FC } from 'react'
import { Card, Badge, Button, Loading } from '@/components/ui'
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics'

interface PerformanceDashboardProps {
  timeRange?: number
  autoRefresh?: boolean
}

export const PerformanceDashboard: FC<PerformanceDashboardProps> = ({
  timeRange = 24 * 60 * 60 * 1000,
  autoRefresh = true,
}) => {
  const { metrics, isLoading, error, refresh, clearMetrics, exportMetrics } =
    usePerformanceMetrics({
      timeRange,
      autoRefresh,
    })

  if (isLoading && !metrics) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="lg" message="Loading performance metrics..." />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">Error loading metrics: {error.message}</div>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  const downloadMetrics = () => {
    const data = exportMetrics()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Monitoring</h1>
          <p className="text-gray-600 mt-1">
            SSR Cache, Query Performance, and Error Tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            Refresh
          </Button>
          <Button variant="outline" onClick={downloadMetrics}>
            Export
          </Button>
          <Button variant="outline" onClick={clearMetrics}>
            Clear
          </Button>
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Overall Performance Score</div>
              <div className="text-4xl font-bold text-gray-900">{metrics.score}</div>
            </div>
            <div className="text-5xl">
              {metrics.score >= 90 ? '🟢' : metrics.score >= 70 ? '🟡' : '🔴'}
            </div>
          </div>
          <div className="mt-4">
            <Badge
              variant={
                metrics.score >= 90 ? 'success' : metrics.score >= 70 ? 'warning' : 'danger'
              }
            >
              {metrics.score >= 90 ? 'Excellent' : metrics.score >= 70 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* SSR Cache Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">SSR Cache Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-6">
              <div className="text-sm text-gray-600 mb-1">Cache Hit Rate</div>
              <div className="text-3xl font-bold text-gray-900">
                {metrics.cache.hitRate.toFixed(1)}%
              </div>
              <div className="mt-2">
                <Badge
                  variant={
                    metrics.cache.hitRate >= 80
                      ? 'success'
                      : metrics.cache.hitRate >= 50
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                >
                  {metrics.cache.hitRate >= 80
                    ? 'Excellent'
                    : metrics.cache.hitRate >= 50
                    ? 'Good'
                    : 'Poor'}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm text-gray-600 mb-1">Total Requests</div>
              <div className="text-3xl font-bold text-gray-900">
                {metrics.cache.totalRequests.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {metrics.cache.hits} hits / {metrics.cache.misses} misses
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm text-gray-600 mb-1">Avg Hit Time</div>
              <div className="text-3xl font-bold text-gray-900">
                {metrics.cache.avgHitTime.toFixed(0)}
                <span className="text-lg text-gray-600">ms</span>
              </div>
              <div className="mt-2">
                <Badge
                  variant={metrics.cache.avgHitTime < 50 ? 'success' : 'warning'}
                  size="sm"
                >
                  {metrics.cache.avgHitTime < 50 ? 'Fast' : 'Acceptable'}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm text-gray-600 mb-1">Avg Miss Time</div>
              <div className="text-3xl font-bold text-gray-900">
                {metrics.cache.avgMissTime.toFixed(0)}
                <span className="text-lg text-gray-600">ms</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Time saved: {(metrics.cache.avgMissTime - metrics.cache.avgHitTime).toFixed(0)}ms
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Top Queries */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Queries by Executions</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Query</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Executions</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Avg Duration</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Errors</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Cached</th>
                </tr>
              </thead>
              <tbody>
                {metrics.queries.slice(0, 10).map((query, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-sm font-mono text-gray-900 truncate max-w-xs">
                      {query.queryKey}
                    </td>
                    <td className="p-4 text-sm text-gray-900">{query.executions}</td>
                    <td className="p-4 text-sm text-gray-900">
                      {query.avgDuration.toFixed(0)}ms
                      <span className="text-xs text-gray-500 ml-2">
                        ({query.minDuration.toFixed(0)}-{query.maxDuration.toFixed(0)}ms)
                      </span>
                    </td>
                    <td className="p-4">
                      {query.errors > 0 ? (
                        <Badge variant="danger" size="sm">
                          {query.errors}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="p-4">
                      {query.cached ? (
                        <Badge variant="success" size="sm">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          No
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {metrics.queries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No query data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Errors */}
      {metrics.errors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Errors</h2>
          <Card>
            <div className="divide-y divide-gray-200">
              {metrics.errors.slice(0, 5).map((error, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="danger" size="sm">
                          {error.type}
                        </Badge>
                        <span className="text-sm font-semibold text-gray-900">
                          {error.message}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        First seen: {new Date(error.firstSeen).toLocaleString()} | Last seen:{' '}
                        {new Date(error.lastSeen).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-red-600">{error.count}</div>
                      <div className="text-xs text-gray-500">occurrences</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
