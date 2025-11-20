import { Badge } from '@/components/ui'
import type { MetricData, WidgetConfig } from '../../types/dashboard.types'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline'

interface MetricWidgetProps {
  data?: MetricData
  config: WidgetConfig
}

export function MetricWidget({ data, config }: MetricWidgetProps) {
  if (!data) {
    return (
      <div className="text-center text-gray-500">
        No data available
      </div>
    )
  }

  const formatValue = (value: number) => {
    switch (config.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value)
      
      case 'percentage':
        return `${value}%`
      
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(value)
    }
  }

  const getTrendIcon = () => {
    if (!data.trend) return null

    switch (data.trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-600" />
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-600" />
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (data.trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'stable':
      default:
        return 'text-gray-600'
    }
  }

  const progressPercentage = data.target ? (data.value / data.target) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Main Value */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">
          {formatValue(data.value)}
        </div>
        <div className="text-sm text-gray-600 mt-1">{data.label}</div>
      </div>

      {/* Change Indicator */}
      {data.change !== undefined && (
        <div className="flex items-center justify-center gap-1">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {data.change > 0 ? '+' : ''}{formatValue(data.change)}
          </span>
        </div>
      )}

      {/* Progress to Target */}
      {data.target && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Target</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercentage >= 100 ? 'bg-green-500' : 
                progressPercentage >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 text-center">
            Target: {formatValue(data.target)}
          </div>
        </div>
      )}

      {/* Status Badge */}
      {data.trend && (
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className={
              data.trend === 'up' ? 'border-green-200 text-green-800 bg-green-50' :
              data.trend === 'down' ? 'border-red-200 text-red-800 bg-red-50' :
              'border-gray-200 text-gray-800 bg-gray-50'
            }
          >
            {data.trend === 'up' ? 'Trending Up' :
             data.trend === 'down' ? 'Trending Down' :
             'Stable'}
          </Badge>
        </div>
      )}
    </div>
  )
}