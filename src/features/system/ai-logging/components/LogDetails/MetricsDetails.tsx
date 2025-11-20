// src/features/ai-logging/components/LogDetails/MetricsDetails.tsx
import { Badge, Card, CardContent, CardHeader } from '@/components/ui';
import { Clock, DollarSign, Zap, Activity, Database, CloudSnow } from 'lucide-react';
import { formatLogMetrics } from '../../utils/log-formatters';
import type { AIUsageLog } from '@/features/system/ai-core/types';

interface MetricsDetailsProps {
  log: AIUsageLog;
}

export function MetricsDetails({ log }: MetricsDetailsProps) {
  const metrics = formatLogMetrics(log);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Cost */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{metrics.cost}</div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </div>

          {/* Latency */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{metrics.latency}</div>
            <div className="text-sm text-gray-600">Latency</div>
          </div>

          {/* Tokens */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-full mb-3">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{metrics.totalTokens}</div>
            <div className="text-sm text-gray-600">Total Tokens</div>
          </div>

          {/* Throughput */}
          {metrics.tokensPerSecond && (
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full mb-3">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{metrics.tokensPerSecond}</div>
              <div className="text-sm text-gray-600">Throughput</div>
            </div>
          )}
        </div>

        {/* Cache Information */}
        {(log.metadata.cache || log.metadata.cacheHit) && (
          <div className="mt-8 border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Cache Information
            </h4>
            <div className="space-y-4">
              {/* Application Cache */}
              {log.metadata.cache?.applicationCache && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 text-green-600 mr-2" />
                      <h5 className="font-medium text-green-800">Application Cache</h5>
                    </div>
                    <Badge variant="success">Hit</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {log.metadata.cache.applicationCache.key && (
                      <div>
                        <span className="font-medium text-green-700">Cache Key:</span>
                        <span className="ml-2 text-green-900 font-mono text-xs">
                          {log.metadata.cache.applicationCache.key}
                        </span>
                      </div>
                    )}
                    {log.metadata.cache.applicationCache.ttl && (
                      <div>
                        <span className="font-medium text-green-700">TTL:</span>
                        <span className="ml-2 text-green-900">
                          {Math.floor(log.metadata.cache.applicationCache.ttl / 1000 / 60)} minutes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Provider Cache */}
              {log.metadata.cache?.providerCache && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <CloudSnow className="h-5 w-5 text-blue-600 mr-2" />
                      <h5 className="font-medium text-blue-800">Provider Cache</h5>
                    </div>
                    <Badge variant="info">
                      {log.metadata.cache.providerCache.provider} • {log.metadata.cache.providerCache.cacheType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Provider:</span>
                      <span className="ml-2 text-blue-900 capitalize">
                        {log.metadata.cache.providerCache.provider}
                      </span>
                    </div>
                    {log.metadata.cache.providerCache.cachedTokens && (
                      <div>
                        <span className="font-medium text-blue-700">Cached Tokens:</span>
                        <span className="ml-2 text-blue-900">
                          {log.metadata.cache.providerCache.cachedTokens.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-blue-700">Cache Type:</span>
                      <span className="ml-2 text-blue-900 capitalize">
                        {log.metadata.cache.providerCache.cacheType || 'unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Legacy Cache Hit */}
              {(log.metadata.cacheHit || log.metadata.cache?.cacheHit) && !log.metadata.cache?.applicationCache && !log.metadata.cache?.providerCache && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-gray-600 mr-2" />
                    <h5 className="font-medium text-gray-800">Cache Hit</h5>
                    <Badge variant="secondary" className="ml-2">Detected</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    This request was served from cache, but detailed cache information is not available.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        <div className="mt-8 border-t pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Session Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Request ID:</span>
              <span className="ml-2 text-gray-900 font-mono text-xs">{log.metadata.requestId}</span>
            </div>
            {log.metadata.sessionId && (
              <div>
                <span className="font-medium text-gray-600">Session ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs">{log.metadata.sessionId}</span>
              </div>
            )}
            {log.metadata.feature && (
              <div>
                <span className="font-medium text-gray-600">Feature:</span>
                <span className="ml-2 text-gray-900">{log.metadata.feature}</span>
              </div>
            )}
            {log.metadata.userAgent && (
              <div className="col-span-2">
                <span className="font-medium text-gray-600">User Agent:</span>
                <span className="ml-2 text-gray-900 text-xs">{log.metadata.userAgent}</span>
              </div>
            )}
          </div>
        </div>

        {/* Provider Metadata */}
        {log.providerMetadata && Object.keys(log.providerMetadata).length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Provider Metadata</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <pre className="text-xs text-gray-800 overflow-x-auto">
                {JSON.stringify(log.providerMetadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Gateway Metadata */}
        {log.gatewayMetadata && (
          <div className="mt-6 border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Gateway Metadata</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <pre className="text-xs text-gray-800 overflow-x-auto">
                {JSON.stringify(log.gatewayMetadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}