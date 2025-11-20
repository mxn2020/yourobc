import type { ChartDataPoint, WidgetConfig } from '../../types/dashboard.types'

interface ChartWidgetProps {
  data?: ChartDataPoint[]
  config: WidgetConfig
}

export function ChartWidget({ data, config }: ChartWidgetProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 h-32 flex items-center justify-center">
        No chart data available
      </div>
    )
  }

  // For now, we'll render a simple placeholder
  // In a real implementation, you'd integrate with a charting library like Chart.js or Recharts
  const maxValue = Math.max(...data.map(d => d.y))
  
  return (
    <div className="space-y-4">
      {/* Chart Type Indicator */}
      <div className="text-sm text-gray-600 text-center">
        {config.chartType || 'line'} chart
      </div>

      {/* Simple Bar Chart Placeholder */}
      <div className="flex items-end justify-between gap-1 h-32">
        {data.slice(0, 10).map((point, index) => (
          <div
            key={index}
            className="bg-blue-500 rounded-t min-w-[8px] flex-1 flex flex-col justify-end"
            style={{ height: `${(point.y / maxValue) * 100}%` }}
            title={`${point.label || point.x}: ${point.y}`}
          >
            <div className="text-xs text-white text-center p-1 truncate">
              {point.y}
            </div>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500">
        {data.slice(0, 10).map((point, index) => (
          <div key={index} className="flex-1 text-center truncate">
            {point.label || point.x}
          </div>
        ))}
      </div>

      {/* Chart Summary */}
      <div className="text-xs text-gray-600 text-center">
        {data.length} data points • Max: {maxValue}
      </div>
    </div>
  )
}