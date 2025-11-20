// src/features/yourobc/statistics/pages/EmployeeKPIsPage.tsx

import { FC, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Award,
  TrendingUp,
  Users,
  Target,
  Download,
  FileText,
  Trophy,
  BarChart3,
} from 'lucide-react'
import { KPICard } from '../components/KPICard'
import {
  useAllEmployeeKPIs,
  useEmployeeRanking,
  useQuotePerformanceAnalysis,
} from '../hooks/useStatistics'
import { formatCurrency, formatPercentage, getPercentageColor } from '../utils/formatters'

export const EmployeeKPIsPage: FC = () => {
  const currentDate = new Date()
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [rankBy, setRankBy] = useState<'revenue' | 'margin' | 'orders' | 'conversionRate'>(
    'margin'
  )

  // Calculate period dates
  const getPeriodDates = () => {
    const now = new Date()
    let startDate: number
    let endDate: number

    if (selectedPeriod === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime()
    } else if (selectedPeriod === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), quarter * 3, 1).getTime()
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59).getTime()
    } else {
      startDate = new Date(now.getFullYear(), 0, 1).getTime()
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59).getTime()
    }

    return { startDate, endDate }
  }

  const { startDate, endDate } = getPeriodDates()

  // Queries
  const { data: allKPIs, isLoading: allKPIsLoading } = useAllEmployeeKPIs(startDate, endDate)
  const { data: ranking, isLoading: rankingLoading } = useEmployeeRanking(startDate, endDate, rankBy)
  const { data: quotePerformance, isLoading: quotePerformanceLoading } = useQuotePerformanceAnalysis(startDate, endDate)

  const getPeriodLabel = () => {
    if (selectedPeriod === 'month') return 'This Month'
    if (selectedPeriod === 'quarter') return 'This Quarter'
    return 'This Year'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee KPIs</h1>
          <p className="text-muted-foreground mt-1">
            Performance metrics, rankings, and targets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedPeriod}
            onValueChange={(v: any) => setSelectedPeriod(v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(allKPIs?.summary.totalRevenue || 0)}
          subtitle={`${allKPIs?.summary.totalOrders || 0} orders`}
          icon={<Award className="h-5 w-5 text-primary" />}
        />

        <KPICard
          title="Total Margin"
          value={formatCurrency(allKPIs?.summary.totalMargin || 0)}
          subtitle="All employees"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        />

        <KPICard
          title="Average Conversion"
          value={formatPercentage(allKPIs?.summary.averageConversionRate || 0)}
          subtitle={`${allKPIs?.summary.totalQuotes || 0} quotes total`}
          icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
        />

        <KPICard
          title="Active Employees"
          value={allKPIs?.summary.totalEmployees || 0}
          subtitle={getPeriodLabel()}
          icon={<Users className="h-5 w-5 text-purple-600" />}
        />
      </div>

      {/* Quote Performance Analysis */}
      {quotePerformance && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Quote Performance</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Quotes</p>
              <p className="text-2xl font-bold">{quotePerformance.totalQuotes}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Sent</p>
              <p className="text-2xl font-bold">{quotePerformance.byStatus.sent}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Accepted</p>
              <p className="text-2xl font-bold text-green-600">
                {quotePerformance.byStatus.accepted}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-primary">
                {formatPercentage(quotePerformance.conversionMetrics.conversionRate)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Avg Value (Accepted)</p>
              <p className="text-2xl font-bold">
                {formatCurrency(quotePerformance.averageValues.accepted)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Draft</span>
              <span>{quotePerformance.byStatus.draft}</span>
            </div>
            <Progress
              value={
                (quotePerformance.byStatus.draft / quotePerformance.totalQuotes) * 100
              }
              className="h-2"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sent</span>
              <span>{quotePerformance.byStatus.sent}</span>
            </div>
            <Progress
              value={(quotePerformance.byStatus.sent / quotePerformance.totalQuotes) * 100}
              className="h-2"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rejected</span>
              <span>{quotePerformance.byStatus.rejected}</span>
            </div>
            <Progress
              value={
                (quotePerformance.byStatus.rejected / quotePerformance.totalQuotes) * 100
              }
              className="h-2 [&>div]:bg-red-600"
            />
          </div>
        </Card>
      )}

      {/* Employee Ranking */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Employee Ranking</h2>
          </div>
          <Select value={rankBy} onValueChange={(v: any) => setRankBy(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="margin">By Margin</SelectItem>
              <SelectItem value="revenue">By Revenue</SelectItem>
              <SelectItem value="orders">By Order Count</SelectItem>
              <SelectItem value="conversionRate">By Conversion Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">Employee</th>
                <th className="text-right py-3 px-4">Quotes</th>
                <th className="text-right py-3 px-4">Orders</th>
                <th className="text-right py-3 px-4">Conversion</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Margin</th>
                <th className="text-right py-3 px-4">Avg Margin</th>
              </tr>
            </thead>
            <tbody>
              {ranking?.ranking.map((employee) => (
                <tr key={employee.employeeId} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                        employee.rank === 1
                          ? 'bg-yellow-100 text-yellow-700'
                          : employee.rank === 2
                          ? 'bg-gray-100 text-gray-700'
                          : employee.rank === 3
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {employee.rank}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{employee.employeeName}</td>
                  <td className="text-right py-3 px-4">{employee.quoteCount}</td>
                  <td className="text-right py-3 px-4">{employee.orderCount}</td>
                  <td className="text-right py-3 px-4">
                    <span
                      className={
                        employee.conversionRate >= 50
                          ? 'text-green-600'
                          : employee.conversionRate >= 30
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }
                    >
                      {formatPercentage(employee.conversionRate)}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(employee.totalOrderValue)}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-green-600">
                    {formatCurrency(employee.totalMargin)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(employee.averageMarginPerOrder)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Individual Employee Cards with Target Comparison */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allKPIs?.employees.slice(0, 6).map((employee) => (
          <Card key={employee.employeeId} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{employee.employeeName}</h3>
                <p className="text-sm text-muted-foreground">
                  {employee.quoteCount} quotes · {employee.orderCount} orders
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium">
                    {formatCurrency(employee.totalOrderValue)}
                  </span>
                </div>
                {employee.targetComparison?.revenue && (
                  <>
                    <Progress
                      value={employee.targetComparison.revenue.achievement}
                      className="h-2 mb-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(employee.targetComparison.revenue.achievement)} of target
                    </p>
                  </>
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Margin</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(employee.totalMargin)}
                  </span>
                </div>
                {employee.targetComparison?.margin && (
                  <>
                    <Progress
                      value={employee.targetComparison.margin.achievement}
                      className="h-2 mb-1 [&>div]:bg-green-600"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(employee.targetComparison.margin.achievement)} of target
                    </p>
                  </>
                )}
              </div>

              <div className="pt-3 border-t">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Conversion</p>
                    <p className="font-semibold">{formatPercentage(employee.conversionRate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Quote</p>
                    <p className="font-semibold">
                      {formatCurrency(employee.averageQuoteValue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Set Targets Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">KPI Targets</h3>
              <p className="text-sm text-muted-foreground">
                Set monthly, quarterly, or yearly targets for employees
              </p>
            </div>
          </div>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Manage Targets
          </Button>
        </div>
      </Card>
    </div>
  )
}
