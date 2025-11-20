// src/features/yourobc/statistics/pages/CustomerReportPage.tsx

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
  UserCircle,
  Calendar,
  Package,
} from 'lucide-react'
import { KPICard } from '../components/KPICard'
import { useCustomerReport } from '../hooks/useStatistics'
import { formatCurrency, formatDate } from '../utils/formatters'
import type { CustomerId } from '@/features/yourobc/customers/types'

// Helper function to convert ISO date string to timestamp
const dateStringToTimestamp = (dateString: string): number => {
  return new Date(dateString).getTime()
}

export const CustomerReportPage: FC = () => {
  const currentDate = new Date()
  const [selectedCustomerId, setSelectedCustomerId] = useState<CustomerId | ''>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [useFilter, setUseFilter] = useState<boolean>(false)

  const { data: report, isLoading, canViewCustomerReports } = useCustomerReport(
    selectedCustomerId as CustomerId,
    useFilter && startDate ? dateStringToTimestamp(startDate) : undefined,
    useFilter && endDate ? dateStringToTimestamp(endDate) : undefined
  )

  const handleExport = (format: 'pdf' | 'excel') => {
    const period = useFilter ? ` (${startDate} to ${endDate})` : ' (All time)'
    console.log(`Exporting ${format} for Customer Report - ${selectedCustomerId}${period}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGenerateReport = () => {
    console.log('Generating report for:', selectedCustomerId, startDate, endDate)
  }

  const toggleDateFilter = () => {
    setUseFilter(!useFilter)
    if (!useFilter) {
      // Set default date range to current month
      setStartDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0])
      setEndDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0])
    }
  }

  if (!canViewCustomerReports) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 max-w-md text-center">
          <p className="text-lg">You don't have permission to view customer reports.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/yourobc/statistics/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Customer Report</h1>
            <p className="text-muted-foreground mt-1">
              Detailed customer analysis including purchase history and lifetime value
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                <UserCircle className="h-4 w-4 inline mr-1" />
                Customer
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value as CustomerId | '')}
              >
                <option value="">Select a customer...</option>
                <option value="cust-001">Acme Corporation</option>
                <option value="cust-002">TechStart Industries</option>
                <option value="cust-003">Global Solutions Ltd</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useFilter}
                  onChange={toggleDateFilter}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">Filter by date range</span>
              </label>
            </div>
          </div>
          {useFilter && (
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
          )}
          <Button onClick={handleGenerateReport} disabled={!selectedCustomerId}>
            Generate Report
          </Button>
        </div>
      </Card>

      {!selectedCustomerId ? (
        <Card className="p-8 text-center">
          <UserCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please select a customer to view their report</p>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading customer report data...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(report.totalRevenue || 0)}
              subtitle={useFilter ? 'Filtered period' : 'All time'}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
            />
            <KPICard
              title="Total Orders"
              value={report.totalOrders?.toString() || '0'}
              subtitle={`${report.completedOrders || 0} completed`}
              icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
            />
            <KPICard
              title="Average Order Value"
              value={formatCurrency(report.averageOrderValue || 0)}
              subtitle="Per order"
              icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            />
            <KPICard
              title="Lifetime Value"
              value={formatCurrency(report.lifetimeValue || 0)}
              subtitle="Total customer value"
              icon={<DollarSign className="h-5 w-5 text-purple-600" />}
            />
          </div>

          {/* Purchase History */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Purchase History</h2>
            <div className="space-y-3">
              {report.purchaseHistory && report.purchaseHistory.length > 0 ? (
                report.purchaseHistory.map((purchase: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Order #{purchase.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(purchase.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(purchase.amount)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        purchase.status === 'completed' ? 'bg-green-100 text-green-700' :
                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No purchase history available</p>
              )}
            </div>
          </Card>

          {/* Order Frequency Analysis */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Frequency Analysis</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">First Order</p>
                <p className="text-lg font-semibold mt-1">
                  {report.orderFrequency?.firstOrder
                    ? formatDate(report.orderFrequency.firstOrder)
                    : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Last Order</p>
                <p className="text-lg font-semibold mt-1">
                  {report.orderFrequency?.lastOrder
                    ? formatDate(report.orderFrequency.lastOrder)
                    : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Average Time Between Orders</p>
                <p className="text-lg font-semibold mt-1">
                  {report.orderFrequency?.averageDaysBetween || 0} days
                </p>
              </div>
            </div>
          </Card>

          {/* Revenue by Period */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue by Period</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
                <p className="text-2xl font-semibold">
                  {formatCurrency(report.revenueByPeriod?.currentMonth || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Last Month</p>
                </div>
                <p className="text-2xl font-semibold">
                  {formatCurrency(report.revenueByPeriod?.lastMonth || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">This Year</p>
                </div>
                <p className="text-2xl font-semibold">
                  {formatCurrency(report.revenueByPeriod?.currentYear || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Last Year</p>
                </div>
                <p className="text-2xl font-semibold">
                  {formatCurrency(report.revenueByPeriod?.lastYear || 0)}
                </p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No data available for this customer in the selected period</p>
        </Card>
      )}
    </div>
  )
}
