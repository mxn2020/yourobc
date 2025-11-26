// src/features/yourobc/statistics/pages/OrderAnalysisReportPage.tsx

import { FC, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Download,
  Printer,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Users,
  Package,
} from 'lucide-react'
import { KPICard } from '../components/KPICard'
import { useOrderAnalysisReport } from '../hooks/useStatistics'
import { formatCurrency, formatPercentage } from '../utils/formatters'

// Helper function to convert ISO date string to timestamp
const dateStringToTimestamp = (dateString: string): number => {
  return new Date(dateString).getTime()
}

export const OrderAnalysisReportPage: FC = () => {
  const currentDate = new Date()
  const [startDate, setStartDate] = useState<string>(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0]
  )

  const { data: report, isLoading, canViewOrderAnalysis } = useOrderAnalysisReport(
    dateStringToTimestamp(startDate),
    dateStringToTimestamp(endDate)
  )

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting ${format} for Order Analysis Report (${startDate} to ${endDate})`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGenerateReport = () => {
    console.log('Generating order analysis report for:', startDate, endDate)
  }

  const handleQuickRange = (range: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear') => {
    const now = new Date()
    let start: Date
    let end: Date

    switch (range) {
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), quarter * 3, 1)
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
        break
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31)
        break
      default:
        return
    }

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  if (!canViewOrderAnalysis) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 max-w-md text-center">
          <p className="text-lg">You don't have permission to view order analysis reports.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/{-$locale}/yourobc/statistics/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order Analysis Report</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive analysis of order volumes, trends, and performance metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Quick ranges:</span>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange('thisMonth')}>
              This Month
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange('lastMonth')}>
              Last Month
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange('thisQuarter')}>
              This Quarter
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange('thisYear')}>
              This Year
            </Button>
          </div>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading order analysis data...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Orders"
              value={report.totalOrders?.toString() || '0'}
              subtitle={`${report.completedOrders || 0} completed`}
              icon={<ShoppingCart className="h-5 w-5 text-primary" />}
            />
            <KPICard
              title="Average Order Value"
              value={formatCurrency(report.averageOrderValue || 0)}
              subtitle="Per order"
              icon={<DollarSign className="h-5 w-5 text-green-600" />}
            />
            <KPICard
              title="Total Revenue"
              value={formatCurrency(report.totalRevenue || 0)}
              subtitle="From all orders"
              icon={<DollarSign className="h-5 w-5 text-blue-600" />}
            />
            <KPICard
              title="Conversion Rate"
              value={formatPercentage(report.conversionRate || 0)}
              subtitle="Quote to order"
              icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            />
          </div>

          {/* Order Volume Trend */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Volume Trend</h2>
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Chart placeholder - Order volume over time</p>
              </div>
            </div>
          </Card>

          {/* Order Status Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Status Distribution</h2>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold mt-1 text-green-600">
                  {report.orderStatus?.completed || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.orderStatus?.completedPercentage || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-semibold mt-1 text-blue-600">
                  {report.orderStatus?.processing || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.orderStatus?.processingPercentage || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold mt-1 text-yellow-600">
                  {report.orderStatus?.pending || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.orderStatus?.pendingPercentage || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-semibold mt-1 text-red-600">
                  {report.orderStatus?.cancelled || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.orderStatus?.cancelledPercentage || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Refunded</p>
                <p className="text-2xl font-semibold mt-1 text-orange-600">
                  {report.orderStatus?.refunded || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.orderStatus?.refundedPercentage || 0)}
                </p>
              </div>
            </div>
          </Card>

          {/* Top Products/Services */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top Products/Services</h2>
            <div className="space-y-3">
              {report.topProducts && report.topProducts.length > 0 ? (
                report.topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                        {index + 1}
                      </div>
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.orderCount} orders
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No product data available</p>
              )}
            </div>
          </Card>

          {/* Orders by Employee */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Orders by Employee</h2>
            <div className="space-y-3">
              {report.ordersByEmployee && report.ordersByEmployee.length > 0 ? (
                report.ordersByEmployee.map((employee: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.orderCount} {employee.orderCount === 1 ? 'order' : 'orders'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(employee.revenue)}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: {formatCurrency(employee.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No employee data available</p>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No data available for the selected period</p>
        </Card>
      )}
    </div>
  )
}
