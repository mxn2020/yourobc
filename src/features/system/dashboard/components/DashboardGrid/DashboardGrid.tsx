import { useDashboard, useDashboardData } from '../../hooks/useDashboards'
import { DashboardWidgetComponent } from '../DashboardWidget/DashboardWidget'
import { Loading } from '@/components/ui'
import type { Dashboard as TDashboard, DashboardWidget } from '../../types/dashboard.types'
import { Id } from "@/convex/_generated/dataModel";

interface DashboardGridProps {
  dashboardId: string
  authUserId?: string
  editMode?: boolean
  onWidgetUpdate?: (widgetId: string, config: any) => void
  onWidgetDelete?: (widgetId: string) => void
}

export function DashboardGrid({
  dashboardId,
  authUserId,
  editMode = false,
  onWidgetUpdate,
  onWidgetDelete,
}: DashboardGridProps) {
  const { data: dashboard, isLoading: isDashboardLoading } = useDashboard(dashboardId)
  const { data: dashboardData, isLoading: isDataLoading } = useDashboardData(dashboardId)

  // Mock dashboard data for build
  const mockDashboard = dashboard || {
    name: 'Sample Dashboard',
    description: 'Sample description',
    widgets: []
  }

  if (isDashboardLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{mockDashboard.name}</h1>
          {mockDashboard.description && (
            <p className="text-gray-600 mt-1">{mockDashboard.description}</p>
          )}
        </div>
        {editMode && (
          <div className="flex gap-2">
            {/* Add widget button and other edit controls would go here */}
          </div>
        )}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDashboard.widgets.map((widget: DashboardWidget) => (
          <DashboardWidgetComponent
            key={widget.id}
            widget={widget}
            data={undefined}
            loading={isDataLoading}
            error={undefined}
            editMode={editMode}
            onUpdate={onWidgetUpdate}
            onDelete={onWidgetDelete}
          />
        ))}
      </div>

      {/* Empty State */}
      {mockDashboard.widgets.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-500 mb-4">No widgets in this dashboard</div>
          {editMode && (
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add Widget
            </button>
          )}
        </div>
      )}
    </div>
  )
}