// src/features/dashboard/components/DashboardWidget/DashboardWidget.tsx
import { Card } from '@/components/ui'
import { Button } from '@/components/ui'
import { Loading } from '@/components/ui'
import { MetricWidget } from '../MetricWidget/MetricWidget'
import { ChartWidget } from '../ChartWidget/ChartWidget'
import type { DashboardWidget as TDashboardWidget, MetricData, ChartDataPoint } from '../../types/dashboard.types'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface DashboardWidgetComponentProps {
  widget: TDashboardWidget
  data?: MetricData | ChartDataPoint[] | any[]
  loading?: boolean
  error?: string
  editMode?: boolean
  onUpdate?: (widgetId: string, config: any) => void
  onDelete?: (widgetId: string) => void
}

export function DashboardWidgetComponent({
  widget,
  data,
  loading = false,
  error,
  editMode = false,
  onUpdate,
  onDelete,
}: DashboardWidgetComponentProps) {
  const handleEdit = () => {
    onUpdate?.(widget.id, widget.config)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      onDelete?.(widget.id)
    }
  }

  const renderWidgetContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <Loading />
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="text-red-600 text-center">
            <div>Error loading data</div>
            <div className="text-sm text-gray-500 mt-1">{error}</div>
          </div>
        </div>
      )
    }

    switch (widget.type) {
      case 'metric':
      case 'kpi':
        return <MetricWidget data={data as MetricData} config={widget.config} />

      case 'chart':
        return <ChartWidget data={data as ChartDataPoint[]} config={widget.config} />

      case 'table':
        return (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <tbody>
                {(Array.isArray(data) ? data : []).map((row, i) => (
                  <tr key={i} className="border-b">
                    {Object.entries(row).map(([key, value], j) => (
                      <td key={j} className="py-2 px-3">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'text':
        return (
          <div className="prose max-w-none">
            <p>{widget.config.text}</p>
          </div>
        )

      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={widget.config.imageUrl}
              alt={widget.title}
              className="max-w-full h-auto"
            />
          </div>
        )

      case 'iframe':
        return (
          <iframe
            src={widget.config.iframeUrl}
            className="w-full h-64 border-0"
            title={widget.title}
          />
        )

      default:
        return <div>Unknown widget type: {widget.type}</div>
    }
  }

  return (
    <Card className="p-4 relative group">
      {/* Edit Controls */}
      {editMode && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0 hover:bg-gray-200"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Widget Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg">{widget.title}</h3>
      </div>

      {/* Widget Content */}
      <div className="min-h-[120px]">
        {renderWidgetContent()}
      </div>

      {/* Last Updated */}
      {widget.refreshInterval && (
        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          Auto-refresh: {widget.refreshInterval / 1000}s
        </div>
      )}
    </Card>
  )
}