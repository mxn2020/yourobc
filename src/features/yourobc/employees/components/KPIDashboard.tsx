// src/features/yourobc/employees/components/KPIDashboard.tsx

import { FC, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, Badge, Button, Loading, Progress } from '@/components/ui'
import { TrendingUp, Target, Award, DollarSign, BarChart3 } from 'lucide-react'

interface KPIDashboardProps {
  employeeId: Id<'yourobcEmployees'>
}

export const KPIDashboard: FC<KPIDashboardProps> = ({ employeeId }) => {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)

  const kpis = useQuery(api.lib.yourobc.employees.kpis.queries.getEmployeeKPIs, {
    employeeId,
    year: selectedYear,
    month: selectedMonth,
  })

  const conversionMetrics = useQuery(api.lib.yourobc.employees.kpis.queries.getConversionMetrics, {
    employeeId,
    year: selectedYear,
    month: selectedMonth,
  })

  const getMonthName = (month: number) => {
    return new Date(selectedYear, month - 1).toLocaleString('default', { month: 'long' })
  }

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getAchievementColor = (percentage: number | undefined) => {
    if (!percentage) return 'text-gray-500'
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAchievementBadge = (percentage: number | undefined) => {
    if (!percentage) return null
    if (percentage >= 100) return <Badge variant="success">✓ Target Met</Badge>
    if (percentage >= 75) return <Badge variant="primary">↗ On Track</Badge>
    if (percentage >= 50) return <Badge variant="warning">⚠ Below Target</Badge>
    return <Badge variant="danger">↓ Needs Attention</Badge>
  }

  if (kpis === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loading size="lg" />
      </div>
    )
  }

  if (!kpis) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 mb-2">No KPI data available</div>
        <p className="text-sm text-gray-400">
          KPIs will be calculated automatically based on quotes and orders.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
            ← Previous
          </Button>

          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-lg">
              {getMonthName(selectedMonth)} {selectedYear} Performance
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            Next →
          </Button>
        </div>
      </Card>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Quotes Created */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Quotes Created</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900 mb-1">
            {kpis.quotesCreated}
          </div>
          {kpis.targets?.quotesTarget && (
            <div className="text-xs text-blue-600">
              Target: {kpis.targets.quotesTarget} ({kpis.targetAchievement?.quotesAchievement?.toFixed(0)}%)
            </div>
          )}
        </Card>

        {/* Orders Processed */}
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">Orders Processed</span>
            <Award className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900 mb-1">
            {kpis.ordersProcessed}
          </div>
          <div className="text-xs text-green-600">
            {kpis.ordersCompleted} completed
          </div>
        </Card>

        {/* Revenue */}
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700 font-medium">Revenue</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900 mb-1">
            {formatCurrency(kpis.ordersValue)}
          </div>
          {kpis.targets?.revenueTarget && (
            <div className="text-xs text-purple-600">
              Target: {formatCurrency(kpis.targets.revenueTarget)}
            </div>
          )}
        </Card>

        {/* Conversion Rate */}
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-700 font-medium">Conversion Rate</span>
            <Target className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-900 mb-1">
            {kpis.conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-orange-600">
            {kpis.quotesConverted} / {kpis.quotesCreated} converted
          </div>
        </Card>
      </div>

      {/* Target Achievement */}
      {kpis.targetAchievement && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Target Achievement
            </h4>
            {kpis.rank && (
              <Badge variant="primary">
                #{kpis.rank} Ranking
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {/* Quotes Achievement */}
            {kpis.targetAchievement.quotesAchievement !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Quotes Target</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getAchievementColor(kpis.targetAchievement.quotesAchievement)}`}>
                      {kpis.targetAchievement.quotesAchievement.toFixed(0)}%
                    </span>
                    {getAchievementBadge(kpis.targetAchievement.quotesAchievement)}
                  </div>
                </div>
                <Progress value={Math.min(kpis.targetAchievement.quotesAchievement, 100)} />
              </div>
            )}

            {/* Orders Achievement */}
            {kpis.targetAchievement.ordersAchievement !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Orders Target</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getAchievementColor(kpis.targetAchievement.ordersAchievement)}`}>
                      {kpis.targetAchievement.ordersAchievement.toFixed(0)}%
                    </span>
                    {getAchievementBadge(kpis.targetAchievement.ordersAchievement)}
                  </div>
                </div>
                <Progress value={Math.min(kpis.targetAchievement.ordersAchievement, 100)} />
              </div>
            )}

            {/* Revenue Achievement */}
            {kpis.targetAchievement.revenueAchievement !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Revenue Target</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getAchievementColor(kpis.targetAchievement.revenueAchievement)}`}>
                      {kpis.targetAchievement.revenueAchievement.toFixed(0)}%
                    </span>
                    {getAchievementBadge(kpis.targetAchievement.revenueAchievement)}
                  </div>
                </div>
                <Progress value={Math.min(kpis.targetAchievement.revenueAchievement, 100)} />
              </div>
            )}

            {/* Conversion Achievement */}
            {kpis.targetAchievement.conversionAchievement !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Conversion Target</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getAchievementColor(kpis.targetAchievement.conversionAchievement)}`}>
                      {kpis.targetAchievement.conversionAchievement.toFixed(0)}%
                    </span>
                    {getAchievementBadge(kpis.targetAchievement.conversionAchievement)}
                  </div>
                </div>
                <Progress value={Math.min(kpis.targetAchievement.conversionAchievement, 100)} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Average Quote Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(kpis.averageQuoteValue)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Average Order Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(kpis.averageOrderValue)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Commissions Earned</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(kpis.commissionsEarned)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Paid: {formatCurrency(kpis.commissionsPaid)}
          </div>
        </Card>
      </div>

      {/* Conversion Metrics */}
      {conversionMetrics && (
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Conversion Analysis</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {conversionMetrics.totalQuotes}
              </div>
              <div className="text-xs text-gray-600">Total Quotes</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {conversionMetrics.totalConverted}
              </div>
              <div className="text-xs text-gray-600">Converted</div>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {conversionMetrics.overallConversionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Conversion Rate</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {formatCurrency(conversionMetrics.totalConvertedValue)}
              </div>
              <div className="text-xs text-gray-600">Converted Value</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
