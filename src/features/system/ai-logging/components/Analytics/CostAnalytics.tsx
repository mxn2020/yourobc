// src/features/ai-logging/components/Analytics/CostAnalytics.tsx
import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber } from '@/features/system/ai-core/utils';
import { getProviderColor } from '@/features/system/ai-core/utils';
import type { AIUsageStats } from '@/features/system/ai-core/types';

interface CostAnalyticsProps {
  stats: AIUsageStats | undefined;
  isLoading?: boolean;
}

export function CostAnalytics({ stats, isLoading }: CostAnalyticsProps) {
  const costBreakdown = useMemo(() => {
    if (!stats?.providerBreakdown) return [];
    return stats.providerBreakdown.map(provider => ({
      ...provider,
      percentage: (stats?.totalCost || 0) > 0 ? (provider.cost / (stats?.totalCost || 1)) * 100 : 0
    })).sort((a, b) => b.cost - a.cost);
  }, [stats?.providerBreakdown, stats?.totalCost]);

  const costTrends = useMemo(() => {
    if (!stats?.requestsByDay || stats.requestsByDay.length < 7) {
      return {
        current: 0,
        previous: 0,
        trend: 0,
        direction: 'stable' as const
      };
    }
    
    const recent7Days = stats.requestsByDay.slice(-7);
    const previous7Days = stats.requestsByDay.slice(-14, -7);
    
    const recentAvg = recent7Days.reduce((sum, day) => sum + day.cost, 0) / 7;
    const previousAvg = previous7Days.reduce((sum, day) => sum + day.cost, 0) / 7;
    
    const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
    
    return {
      current: recentAvg,
      previous: previousAvg,
      trend,
      direction: trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable'
    } as const;
  }, [stats?.requestsByDay]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${(stats?.totalCost || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Spend</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${(stats?.avgCostPerToken || 0).toFixed(6)}
            </div>
            <div className="text-sm text-gray-600">Avg Cost per Token</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="text-2xl font-bold text-purple-600">
                ${costTrends.current ? costTrends.current.toFixed(2) : '0.00'}
              </div>
              {costTrends.direction === 'up' && <TrendingUp className="h-5 w-5 text-red-500" />}
              {costTrends.direction === 'down' && <TrendingDown className="h-5 w-5 text-green-500" />}
              {costTrends.direction === 'stable' && <Minus className="h-5 w-5 text-gray-400" />}
            </div>
            <div className="text-sm text-gray-600">Daily Average</div>
            {costTrends.trend !== 0 && (
              <div className={`text-xs mt-1 ${
                costTrends.direction === 'up' ? 'text-red-600' : 
                costTrends.direction === 'down' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {costTrends.trend > 0 ? '+' : ''}{costTrends.trend.toFixed(1)}% vs last week
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cost by Provider */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cost by Provider</h3>
        </CardHeader>
        <CardContent>
          {costBreakdown.length > 0 ? (
            <div className="space-y-4">
              {costBreakdown.map((provider) => (
                <div key={provider.provider} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getProviderColor(provider.provider) }}
                    />
                    <div>
                      <div className="font-medium capitalize">{provider.provider}</div>
                      <div className="text-sm text-gray-600">
                        {formatNumber(provider.requests)} requests • {provider.modelsUsed.length} models
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ${provider.cost.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {provider.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No cost data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Over Time */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cost Trends</h3>
        </CardHeader>
        <CardContent>
          {(stats?.requestsByDay?.length || 0) > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Peak Daily Cost:</span>
                  <span className="ml-2 font-medium">
                    ${Math.max(...(stats?.requestsByDay?.map(d => d.cost) || [0])).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Lowest Daily Cost:</span>
                  <span className="ml-2 font-medium">
                    ${Math.min(...(stats?.requestsByDay?.map(d => d.cost) || [0])).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cost trend visualization */}
              <div className="space-y-2">
                {(stats?.requestsByDay || []).slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center space-x-3">
                    <div className="w-20 text-xs text-gray-600 text-right">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div 
                        className="bg-green-500 h-4 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((day.cost / Math.max(...(stats?.requestsByDay?.map(d => d.cost) || [1]))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <div className="w-16 text-xs text-gray-600 text-right">
                      ${day.cost.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No cost trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Efficiency */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cost Efficiency</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Most Efficient Models</h4>
              <div className="space-y-2">
                {(stats?.topModels || [])
                  .sort((a, b) => a.avgCostPerToken - b.avgCostPerToken)
                  .slice(0, 3)
                  .map((model) => (
                    <div key={model.modelId} className="flex justify-between text-sm">
                      <span className="text-gray-700">{model.modelId.split('/')[1] || model.modelId}</span>
                      <span className="font-medium">${model.avgCostPerToken.toFixed(6)}/token</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Cost per Request Type</h4>
              <div className="space-y-2">
                {(stats?.featureBreakdown || [])
                  .sort((a, b) => b.cost - a.cost)
                  .slice(0, 3)
                  .map((feature) => (
                    <div key={feature.feature} className="flex justify-between text-sm">
                      <span className="text-gray-700 capitalize">{feature.feature.replace('_', ' ')}</span>
                      <span className="font-medium">${(feature.cost / feature.requests).toFixed(4)}/req</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}