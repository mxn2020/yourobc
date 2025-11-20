import type { Id } from '@/convex/_generated/dataModel'
import type { BaseEntity, BaseFilters } from '../../../../lib/feature-base'

export interface Dashboard extends BaseEntity {
  _id: Id<'dashboards'>
  name: string
  description?: string
  layout: DashboardLayout
  widgets: DashboardWidget[]
  isDefault: boolean
  isPublic: boolean
  userId: Id<'userProfiles'>
  tags?: string[]
}

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  config: WidgetConfig
  position: { x: number; y: number; w: number; h: number }
  dataSource?: string
  refreshInterval?: number
  filters?: Record<string, any>
}

export type WidgetType = 'metric' | 'chart' | 'table' | 'kpi' | 'text' | 'image' | 'iframe'
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter'
export type DashboardLayout = 'grid' | 'freeform'

export interface WidgetConfig {
  chartType?: ChartType
  metrics?: string[]
  dimensions?: string[]
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  format?: 'number' | 'currency' | 'percentage' | 'date'
  text?: string
  imageUrl?: string
  iframeUrl?: string
}

export interface MetricData {
  label: string
  value: number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  target?: number
}

export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
}

export interface DashboardData {
  widgets: Record<string, {
    data: MetricData | ChartDataPoint[] | any[]
    loading: boolean
    error?: string
  }>
}

export interface DashboardFilters extends BaseFilters {
  userId?: Id<'userProfiles'>
  isPublic?: boolean
  isDefault?: boolean
  tags?: string[]
}

export interface CreateDashboardData {
  name: string
  description?: string
  layout?: DashboardLayout
  widgets?: DashboardWidget[]
  isDefault?: boolean
  isPublic?: boolean
  tags?: string[]
}

export interface UpdateDashboardData extends Partial<CreateDashboardData> {}

export const WIDGET_TYPES: WidgetType[] = ['metric', 'chart', 'table', 'kpi', 'text', 'image', 'iframe']
export const CHART_TYPES: ChartType[] = ['line', 'bar', 'pie', 'doughnut', 'area', 'scatter']

export const WIDGET_TYPE_LABELS: Record<WidgetType, string> = {
  metric: 'Metric Card',
  chart: 'Chart',
  table: 'Data Table',
  kpi: 'KPI Widget',
  text: 'Text Widget',
  image: 'Image',
  iframe: 'Embed',
}

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  line: 'Line Chart',
  bar: 'Bar Chart',
  pie: 'Pie Chart',
  doughnut: 'Doughnut Chart',
  area: 'Area Chart',
  scatter: 'Scatter Plot',
}