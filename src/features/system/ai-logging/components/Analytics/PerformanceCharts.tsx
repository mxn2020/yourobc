// src/features/ai-logging/components/Analytics/PerformanceCharts.tsx
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge, Card, CardContent, CardHeader } from '@/components/ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { UsageChartData, PerformanceMetric } from '../../types/analytics.types';

interface PerformanceChartsProps {
  chartData: UsageChartData[];
  metrics: PerformanceMetric[];
  isLoading?: boolean;
}

export function PerformanceCharts({ chartData, metrics, isLoading }: PerformanceChartsProps) {
  const latencyData = useMemo(() => 
    chartData.map(item => ({
      date: item.date,
      avgLatency: item.avgLatency,
      successRate: item.successRate
    })), [chartData]
  );

  const throughputData = useMemo(() =>
    chartData.map(item => ({
      date: item.date,
      requests: item.requests,
      tokens: Math.round(item.tokens / 1000) // Convert to K tokens
    })), [chartData]
  );

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof metric.value === 'number' 
                      ? metric.value.toLocaleString() 
                      : metric.value
                    }
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {metric.unit}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{metric.name}</div>
                  {metric.change > 0 && (
                    <div className={`text-xs flex items-center mt-1 ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                      <span className="ml-1">{metric.change.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Latency and Success Rate Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Latency & Success Rate Trends</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="latency" orientation="left" />
              <YAxis yAxisId="rate" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'avgLatency' ? `${value}ms` : `${value}%`,
                  name === 'avgLatency' ? 'Avg Latency' : 'Success Rate'
                ]}
              />
              <Line 
                yAxisId="latency"
                type="monotone" 
                dataKey="avgLatency" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                yAxisId="rate"
                type="monotone" 
                dataKey="successRate" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Throughput Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Request & Token Throughput</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={throughputData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="requests" orientation="left" />
              <YAxis yAxisId="tokens" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'requests' ? `${value} requests` : `${value}K tokens`,
                  name === 'requests' ? 'Requests' : 'Tokens'
                ]}
              />
              <Bar 
                yAxisId="requests"
                dataKey="requests" 
                fill="#8B5CF6" 
                name="requests"
              />
              <Bar 
                yAxisId="tokens"
                dataKey="tokens" 
                fill="#F59E0B" 
                name="tokens"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Performance Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(chartData.reduce((sum, item) => sum + item.avgLatency, 0) / chartData.length)}ms
              </div>
              <div className="text-sm text-blue-700">Avg Latency</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(chartData.reduce((sum, item) => sum + item.successRate, 0) / chartData.length)}%
              </div>
              <div className="text-sm text-green-700">Avg Success Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {chartData.reduce((sum, item) => sum + item.requests, 0).toLocaleString()}
              </div>
              <div className="text-sm text-purple-700">Total Requests</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(chartData.reduce((sum, item) => sum + item.tokens, 0) / 1000).toLocaleString()}K
              </div>
              <div className="text-sm text-orange-700">Total Tokens</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}