// src/features/yourobc/employees/pages/KPIManagementPage.tsx

import { FC, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/generated/api'
import { Card, Button, Badge, Loading, Progress } from '@/components/ui'
import { TrendingUp, Award, Target, Users, BarChart3 } from 'lucide-react'

export const KPIManagementPage: FC = () => {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [rankBy, setRankBy] = useState<'orders' | 'revenue' | 'conversion' | 'commissions'>('revenue')

  // Queries
  const allKPIs = useQuery(api.lib.yourobc.employees.kpis.queries.getAllEmployeeKPIs, {
    year: selectedYear,
    month: selectedMonth,
  })

  const rankings = useQuery(api.lib.yourobc.employees.kpis.queries.getRankings, {
    year: selectedYear,
    month: selectedMonth,
    rankBy,
    limit: 10,
  })

  const statistics = useQuery(api.lib.yourobc.employees.kpis.queries.getKPIStatistics, {
    year: selectedYear,
    month: selectedMonth,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

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

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-blue-50 text-blue-800 border-blue-200'
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">KPI Management</h1>
            <p className="text-gray-600">Track employee performance metrics and rankings</p>
          </div>
        </div>

        {/* Month Selector */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
              ← Previous
            </Button>

            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-lg">
                {getMonthName(selectedMonth)} {selectedYear}
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
              Next →
            </Button>
          </div>
        </Card>

        {/* Overall Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-700 font-medium">Total Quotes</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900">{statistics.totalQuotes}</div>
              <div className="text-xs text-blue-600 mt-1">
                Avg: {statistics.avgQuotesPerEmployee.toFixed(1)} per employee
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700 font-medium">Total Orders</span>
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-900">{statistics.totalOrders}</div>
              <div className="text-xs text-green-600 mt-1">
                Avg: {statistics.avgOrdersPerEmployee.toFixed(1)} per employee
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-700 font-medium">Total Revenue</span>
              </div>
              <div className="text-3xl font-bold text-purple-900">
                {formatCurrency(statistics.totalRevenue)}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                Avg: {formatCurrency(statistics.avgRevenuePerEmployee)}
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-orange-700 font-medium">Avg Conversion</span>
                <Target className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-900">
                {statistics.avgConversionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-orange-600 mt-1">Team average</div>
            </Card>
          </div>
        )}

        {/* Ranking Controls */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Rank By:</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant={rankBy === 'revenue' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRankBy('revenue')}
              >
                Revenue
              </Button>
              <Button
                variant={rankBy === 'orders' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRankBy('orders')}
              >
                Orders
              </Button>
              <Button
                variant={rankBy === 'conversion' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRankBy('conversion')}
              >
                Conversion
              </Button>
              <Button
                variant={rankBy === 'commissions' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRankBy('commissions')}
              >
                Commissions
              </Button>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-semibold text-gray-900">Top Performers</h3>
          </div>

          {rankings === undefined ? (
            <div className="flex justify-center p-8">
              <Loading size="lg" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">No KPI data available</div>
              <p className="text-sm text-gray-400">
                KPIs will be calculated automatically from quotes and orders.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankings.map((kpi: NonNullable<typeof rankings>[number]) => (
                <Card
                  key={kpi._id}
                  className={`p-4 border-2 ${getRankColor(kpi.rank || 0)}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="text-3xl font-bold w-16 text-center">
                      {getRankBadge(kpi.rank || 0)}
                    </div>

                    {/* Employee Info */}
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-900 mb-1">
                        {kpi.userProfile?.name || 'Unknown Employee'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {kpi.employee?.department || 'No Department'}
                        {' • '}
                        {kpi.employee?.position || 'No Position'}
                      </div>
                    </div>

                    {/* KPI Metrics */}
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {kpi.quotesCreated}
                        </div>
                        <div className="text-xs text-gray-600">Quotes</div>
                      </div>

                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {kpi.ordersProcessed}
                        </div>
                        <div className="text-xs text-gray-600">Orders</div>
                      </div>

                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(kpi.ordersValue)}
                        </div>
                        <div className="text-xs text-gray-600">Revenue</div>
                      </div>

                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {kpi.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Conversion</div>
                      </div>
                    </div>

                    {/* Target Achievement (if available) */}
                    {kpi.targetAchievement && kpi.targetAchievement.revenueAchievement !== undefined && (
                      <div className="w-32">
                        <div className="text-xs text-gray-600 mb-1">Target</div>
                        <Progress value={Math.min(kpi.targetAchievement.revenueAchievement, 100)} />
                        <div className="text-xs text-gray-600 mt-1 text-center">
                          {kpi.targetAchievement.revenueAchievement.toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* All Employees Overview */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">All Employees</h3>
          </div>

          {allKPIs === undefined ? (
            <div className="flex justify-center p-8">
              <Loading size="lg" />
            </div>
          ) : allKPIs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">No employee KPI data</div>
              <p className="text-sm text-gray-400">
                Employee performance data will appear here once quotes and orders are created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotes
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commissions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allKPIs.map((kpi: NonNullable<typeof allKPIs>[number]) => (
                    <tr key={kpi._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {kpi.userProfile?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {kpi.employee?.department || 'No Department'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {kpi.quotesCreated}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(kpi.quotesValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {kpi.ordersProcessed}
                        </div>
                        <div className="text-xs text-gray-500">
                          {kpi.ordersCompleted} completed
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(kpi.ordersValue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg: {formatCurrency(kpi.averageOrderValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant={kpi.conversionRate >= 30 ? 'success' : kpi.conversionRate >= 20 ? 'primary' : 'warning'}>
                          {kpi.conversionRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(kpi.commissionsEarned)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Paid: {formatCurrency(kpi.commissionsPaid)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
