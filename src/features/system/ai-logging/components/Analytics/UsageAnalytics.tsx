// src/features/ai-logging/components/Analytics/UsageAnalytics.tsx
import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber } from '@/features/system/ai-core/utils';
import type { AIUsageStats } from '@/features/system/ai-core/types';

interface UsageAnalyticsProps {
  stats: AIUsageStats | undefined;
  isLoading?: boolean;
}

export function UsageAnalytics({ stats, isLoading }: UsageAnalyticsProps) {
  const chartData = useMemo(() => {
    if (!stats?.requestsByDay?.length) return [];
    
    return stats.requestsByDay.slice(-30).map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [stats?.requestsByDay]);

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600';
    if (trend < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(stats?.totalRequests || 0, { compact: true })}
            </div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${(stats?.totalCost || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(stats?.totalTokens || 0, { compact: true })}
            </div>
            <div className="text-sm text-gray-600">Total Tokens</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {(stats?.successRate || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Usage Over Time</h3>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Avg Daily Requests:</span>
                  <span className="ml-2 font-medium">
                    {Math.round((stats?.totalRequests || 0) / Math.max(chartData.length, 1))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Daily Cost:</span>
                  <span className="ml-2 font-medium">
                    ${((stats?.totalCost || 0) / Math.max(chartData.length, 1)).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Latency:</span>
                  <span className="ml-2 font-medium">
                    {(stats?.avgLatency || 0).toFixed(0)}ms
                  </span>
                </div>
              </div>
              
              {/* Simple bar chart representation */}
              <div className="space-y-2">
                {chartData.slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center space-x-3">
                    <div className="w-20 text-xs text-gray-600 text-right">{day.date}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div 
                        className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((day.requests / Math.max(...chartData.map(d => d.requests))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <div className="w-12 text-xs text-gray-600 text-right">{day.requests}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No usage data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Models */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Top Models</h3>
        </CardHeader>
        <CardContent>
          {stats?.topModels && stats.topModels.length > 0 ? (
            <div className="space-y-3">
              {stats.topModels.slice(0, 5).map((model, index) => (
                <div key={model.modelId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{model.modelId.split('/')[1] || model.modelId}</div>
                      <div className="text-sm text-gray-600">
                        {formatNumber(model.requests)} requests • ${model.cost.toFixed(4)} avg cost
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {model.successRate.toFixed(1)}% success
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No model data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}