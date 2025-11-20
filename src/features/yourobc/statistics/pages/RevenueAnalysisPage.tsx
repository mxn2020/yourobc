// src/features/yourobc/statistics/pages/RevenueAnalysisPage.tsx

import { FC, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  Building2,
} from 'lucide-react'
import { KPICard } from '../components/KPICard'
import {
  useMonthlyRevenue,
  useYearOverYearComparison,
  useRealProfit,
  useTopCustomersByRevenue,
} from '../hooks/useStatistics'
import { formatCurrency, formatPercentage, getMonthAbbr } from '../utils/formatters'

export const RevenueAnalysisPage: FC = () => {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [sortBy, setSortBy] = useState<'revenue' | 'margin' | 'count'>('revenue')

  // Calculate current month period
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
  const { data: yoyComparison, isLoading: yoyComparisonLoading } = useYearOverYearComparison(selectedYear)
  const { data: realProfit, isLoading: realProfitLoading } = useRealProfit(startOfMonth, endOfMonth)
  const { data: topCustomers, isLoading: topCustomersLoading } = useTopCustomersByRevenue(startOfMonth, endOfMonth, {
    limit: 10,
    sortBy,
  })

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Invoice-based revenue with margin calculations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Year Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(monthlyRevenue?.yearTotal.revenue || 0)}
          subtitle={`${monthlyRevenue?.yearTotal.invoiceCount || 0} invoices`}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          trend={
            yoyComparison
              ? {
                  value: yoyComparison.growth.revenue,
                  label: 'vs last year',
                }
              : undefined
          }
        />

        <KPICard
          title="Gross Margin"
          value={formatCurrency(monthlyRevenue?.yearTotal.margin || 0)}
          subtitle={formatPercentage(monthlyRevenue?.yearTotal.marginPercentage || 0)}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          trend={
            yoyComparison
              ? {
                  value: yoyComparison.growth.margin,
                  label: 'vs last year',
                }
              : undefined
          }
        />

        <KPICard
          title="Average Margin"
          value={formatCurrency(monthlyRevenue?.yearTotal.averageMargin || 0)}
          subtitle="Per invoice"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        />

        <KPICard
          title="Total Costs"
          value={formatCurrency(monthlyRevenue?.yearTotal.cost || 0)}
          subtitle="Purchase + Commission"
          icon={<TrendingDown className="h-5 w-5 text-orange-600" />}
        />
      </div>

      {/* Monthly Revenue Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Month</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Cost</th>
                <th className="text-right py-3 px-4">Commission</th>
                <th className="text-right py-3 px-4">Margin</th>
                <th className="text-right py-3 px-4">Margin %</th>
                <th className="text-right py-3 px-4">Invoices</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRevenue?.monthlyData.map((month, index) => {
                const marginPercentage = month.revenue > 0 ? (month.margin / month.revenue) * 100 : 0
                return (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{getMonthAbbr(index + 1)}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(month.revenue)}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      {formatCurrency(month.cost)}
                    </td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      {formatCurrency(month.commission)}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-green-600">
                      {formatCurrency(month.margin)}
                    </td>
                    <td className="text-right py-3 px-4">{formatPercentage(marginPercentage)}</td>
                    <td className="text-right py-3 px-4">{month.invoiceCount}</td>
                  </tr>
                )
              })}
              {monthlyRevenue && (
                <tr className="font-bold bg-muted/30">
                  <td className="py-3 px-4">Total</td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(monthlyRevenue.yearTotal.revenue)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(monthlyRevenue.yearTotal.cost)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(monthlyRevenue.yearTotal.commission)}
                  </td>
                  <td className="text-right py-3 px-4 text-green-600">
                    {formatCurrency(monthlyRevenue.yearTotal.margin)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatPercentage(monthlyRevenue.yearTotal.marginPercentage)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {monthlyRevenue.yearTotal.invoiceCount}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Real Profit Calculation */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Real Profit Analysis (Current Month)</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Revenue Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Revenue</span>
                  <span className="font-semibold">{formatCurrency(realProfit?.revenue || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">- Purchase Costs</span>
                  <span className="text-red-600">
                    {formatCurrency(realProfit?.directCosts.purchaseCosts || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">- Commissions</span>
                  <span className="text-red-600">
                    {formatCurrency(realProfit?.directCosts.commissions || 0)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Gross Profit</span>
                  <span className="text-green-600">
                    {formatCurrency(realProfit?.grossProfit || 0)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  {formatPercentage(realProfit?.grossProfitPercentage || 0)} margin
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Operating Costs
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Employee Costs</span>
                  <span>{formatCurrency(realProfit?.operatingCosts.employeeCosts || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Office Costs</span>
                  <span>{formatCurrency(realProfit?.operatingCosts.officeCosts || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Misc Expenses</span>
                  <span>{formatCurrency(realProfit?.operatingCosts.miscExpenses || 0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Operating Costs</span>
                  <span className="text-red-600">
                    {formatCurrency(realProfit?.operatingCosts.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Net Profit</span>
                <span
                  className={
                    (realProfit?.realProfit || 0) > 0 ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {formatCurrency(realProfit?.realProfit || 0)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground text-right mt-1">
                {formatPercentage(realProfit?.realProfitPercentage || 0)} net margin
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Customers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Top Customers (Current Month)</h2>
          </div>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">By Revenue</SelectItem>
              <SelectItem value="margin">By Margin</SelectItem>
              <SelectItem value="count">By Count</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Margin</th>
                <th className="text-right py-3 px-4">Margin %</th>
                <th className="text-right py-3 px-4">Invoices</th>
                <th className="text-right py-3 px-4">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers?.topCustomers.map((customer, index) => (
                <tr key={customer.customerId} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{customer.customerName}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(customer.revenue)}</td>
                  <td className="text-right py-3 px-4 text-green-600">
                    {formatCurrency(customer.margin)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatPercentage(customer.marginPercentage)}
                  </td>
                  <td className="text-right py-3 px-4">{customer.invoiceCount}</td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(customer.averageOrderValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Year-over-Year Comparison */}
      {yoyComparison && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Year-over-Year Comparison</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {yoyComparison.growth.revenue > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={
                    yoyComparison.growth.revenue > 0 ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {formatPercentage(Math.abs(yoyComparison.growth.revenue))}
                </span>
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Margin Growth</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {yoyComparison.growth.margin > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={yoyComparison.growth.margin > 0 ? 'text-green-600' : 'text-red-600'}
                >
                  {formatPercentage(Math.abs(yoyComparison.growth.margin))}
                </span>
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Invoice Count Growth</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {yoyComparison.growth.invoiceCount > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={
                    yoyComparison.growth.invoiceCount > 0 ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {formatPercentage(Math.abs(yoyComparison.growth.invoiceCount))}
                </span>
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">{selectedYear}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium">
                    {formatCurrency(yoyComparison.currentYear.revenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin</span>
                  <span className="font-medium">
                    {formatCurrency(yoyComparison.currentYear.margin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoices</span>
                  <span className="font-medium">{yoyComparison.currentYear.invoiceCount}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{selectedYear - 1}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium">
                    {formatCurrency(yoyComparison.previousYear.revenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin</span>
                  <span className="font-medium">
                    {formatCurrency(yoyComparison.previousYear.margin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoices</span>
                  <span className="font-medium">{yoyComparison.previousYear.invoiceCount}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
