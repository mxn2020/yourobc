// src/features/yourobc/statistics/pages/StatisticsDashboardPage.tsx

import { FC, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Award,
  Target,
  FileText,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { KPICard } from '../components/KPICard'
import {
  useMonthlyRevenue,
  useRealProfit,
  useEmployeeRanking,
  useTopCustomersByRevenue,
  useOperatingCostsSummary,
} from '../hooks/useStatistics'
import { formatCurrency, formatPercentage, getMonthAbbr } from '../utils/formatters'

export const StatisticsDashboardPage: FC = () => {
  const currentDate = new Date()
  const [selectedYear] = useState(currentDate.getFullYear())
  const currentMonth = currentDate.getMonth() + 1

  // Calculate period for this month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime()
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59
  ).getTime()

  // Queries
  const { data: monthlyRevenue, isLoading: monthlyRevenueLoading } = useMonthlyRevenue(selectedYear)
  const { data: realProfit, isLoading: realProfitLoading } = useRealProfit(startOfMonth, endOfMonth)
  const { data: employeeRanking, isLoading: employeeRankingLoading } = useEmployeeRanking(startOfMonth, endOfMonth, 'margin')
  const { data: topCustomers, isLoading: topCustomersLoading } = useTopCustomersByRevenue(startOfMonth, endOfMonth, {
    limit: 5,
    sortBy: 'revenue',
  })
  const { data: operatingCosts, isLoading: operatingCostsLoading } = useOperatingCostsSummary(startOfMonth, endOfMonth)

  // Get current and previous month data
  const currentMonthData = monthlyRevenue?.monthlyData[currentMonth - 1]
  const previousMonthData =
    currentMonth > 1 ? monthlyRevenue?.monthlyData[currentMonth - 2] : null

  const revenueGrowth = previousMonthData
    ? ((currentMonthData?.revenue || 0) - previousMonthData.revenue) / previousMonthData.revenue * 100
    : 0

  const marginGrowth = previousMonthData
    ? ((currentMonthData?.margin || 0) - previousMonthData.margin) / previousMonthData.margin * 100
    : 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistics & KPIs</h1>
          <p className="text-muted-foreground mt-1">
            Revenue analysis, employee performance, and business insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Revenue (This Month)"
          value={formatCurrency(currentMonthData?.revenue || 0)}
          subtitle={`${currentMonthData?.invoiceCount || 0} invoices`}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          trend={{
            value: revenueGrowth,
            label: 'vs last month',
          }}
        />

        <KPICard
          title="Gross Margin"
          value={formatCurrency(currentMonthData?.margin || 0)}
          subtitle={formatPercentage(
            currentMonthData?.revenue
              ? (currentMonthData.margin / currentMonthData.revenue) * 100
              : 0
          )}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          trend={{
            value: marginGrowth,
            label: 'vs last month',
          }}
        />

        <KPICard
          title="Operating Costs"
          value={formatCurrency(operatingCosts?.totalOperatingCosts || 0)}
          subtitle="Employees + Office + Misc"
          icon={<ShoppingCart className="h-5 w-5 text-orange-600" />}
        />

        <KPICard
          title="Net Profit"
          value={formatCurrency(realProfit?.realProfit || 0)}
          subtitle={formatPercentage(realProfit?.realProfitPercentage || 0)}
          icon={<Award className="h-5 w-5 text-blue-600" />}
        />
      </div>

      {/* Revenue Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Revenue Trend ({selectedYear})</h2>
          <Link to="/{-$locale}/statistics/revenue">
            <Button variant="outline" size="sm">
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {monthlyRevenue?.monthlyData.map((month, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium">{getMonthAbbr(index + 1)}</div>
              <div className="flex-1">
                <div className="h-8 bg-muted rounded-md overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${
                        monthlyRevenue.yearTotal.revenue > 0
                          ? (month.revenue / monthlyRevenue.yearTotal.revenue) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-32 text-right text-sm font-medium">
                {formatCurrency(month.revenue)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Employees */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Employees</h2>
            <Link to="/{-$locale}/yourobc/statistics/employee-kpis">
              <Button variant="outline" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {employeeRanking?.ranking.slice(0, 5).map((employee, index) => (
              <div key={employee.employeeId} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{employee.employeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.orderCount} orders · {formatPercentage(employee.conversionRate)} conversion
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(employee.totalMargin)}</p>
                  <p className="text-sm text-muted-foreground">margin</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Customers</h2>
            <Link to="/{-$locale}/yourobc/statistics/top-customers">
              <Button variant="outline" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {topCustomers?.topCustomers.map((customer, index) => (
              <div key={customer.customerId} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{customer.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.invoiceCount} invoices · {formatCurrency(customer.averageOrderValue)} avg
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(customer.revenue)}</p>
                  <p className="text-sm text-muted-foreground">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/{-$locale}/yourobc/statistics/revenue">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Revenue Analysis</h3>
                <p className="text-sm text-muted-foreground">Invoice-based revenue & margins</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/{-$locale}/yourobc/statistics/employee-kpis">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Employee KPIs</h3>
                <p className="text-sm text-muted-foreground">Performance & targets</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/{-$locale}/yourobc/statistics/operating-costs">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Operating Costs</h3>
                <p className="text-sm text-muted-foreground">Manage expenses & costs</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Reports Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Reports</h2>
          </div>
          <Link to="/{-$locale}/yourobc/statistics/reports">
            <Button variant="outline" size="sm">
              View All Reports
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/{-$locale}/yourobc/statistics/reports/monthly">
              <FileText className="h-4 w-4 mr-2" />
              Monthly Report
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/{-$locale}/yourobc/statistics/reports/executive">
              <Award className="h-4 w-4 mr-2" />
              Executive Report
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/{-$locale}/yourobc/statistics/reports">
              <FileText className="h-4 w-4 mr-2" />
              All Reports
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
