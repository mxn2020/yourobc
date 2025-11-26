// src/features/yourobc/statistics/pages/EmployeeReportPage.tsx

import { FC, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  FileText,
  ShoppingCart,
  Target,
  User,
} from 'lucide-react'
import { KPICard } from '../components/KPICard'
import { useEmployeeReport } from '../hooks/useStatistics'
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters'
import type { Id } from '@/convex/_generated/dataModel'

// Helper function to convert ISO date string to timestamp
const dateStringToTimestamp = (dateString: string): number => {
  return new Date(dateString).getTime()
}

export const EmployeeReportPage: FC = () => {
  const currentDate = new Date()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<Id<'yourobcEmployees'> | ''>('')
  const [startDate, setStartDate] = useState<string>(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0]
  )

  const { data: report, isLoading, canViewEmployeeReport } = useEmployeeReport(
    selectedEmployeeId as Id<'yourobcEmployees'>,
    dateStringToTimestamp(startDate),
    dateStringToTimestamp(endDate)
  )

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting ${format} for Employee Report - ${selectedEmployeeId} (${startDate} to ${endDate})`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGenerateReport = () => {
    // Trigger report generation - the useEmployeeReport hook will automatically fetch
    // when the dependencies change, so this is just a visual trigger
    console.log('Generating report for:', selectedEmployeeId, startDate, endDate)
  }

  if (!canViewEmployeeReport) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 max-w-md text-center">
          <p className="text-lg">You don't have permission to view employee reports.</p>
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
            <h1 className="text-3xl font-bold">Employee Report</h1>
            <p className="text-muted-foreground mt-1">
              Individual employee performance metrics and KPI achievement
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
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Employee
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value as Id<'yourobcEmployees'> | '')}
              >
                <option value="">Select an employee...</option>
                <option value="emp-001">John Doe</option>
                <option value="emp-002">Jane Smith</option>
                <option value="emp-003">Mike Johnson</option>
              </select>
            </div>
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
          <Button onClick={handleGenerateReport} disabled={!selectedEmployeeId}>
            Generate Report
          </Button>
        </div>
      </Card>

      {!selectedEmployeeId ? (
        <Card className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please select an employee to view their report</p>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading employee report data...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Sales"
              value={formatCurrency(report.sales?.total || 0)}
              subtitle={`${report.sales?.orderCount || 0} orders`}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
            />
            <KPICard
              title="Margin"
              value={formatCurrency(report.margin?.amount || 0)}
              subtitle={formatPercentage(report.margin?.percentage || 0)}
              icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            />
            <KPICard
              title="Quote Conversion"
              value={formatPercentage(report.quoteConversion?.rate || 0)}
              subtitle={`${report.quoteConversion?.converted || 0} / ${report.quoteConversion?.total || 0} quotes`}
              icon={<FileText className="h-5 w-5 text-blue-600" />}
            />
            <KPICard
              title="Orders"
              value={report.orders?.count?.toString() || '0'}
              subtitle={`Avg: ${formatCurrency(report.orders?.averageValue || 0)}`}
              icon={<ShoppingCart className="h-5 w-5 text-purple-600" />}
            />
          </div>

          {/* Sales Metrics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sales Metrics</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(report.salesMetrics?.revenue || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Average Deal Size</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(report.salesMetrics?.averageDealSize || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatPercentage(report.salesMetrics?.winRate || 0)}
                </p>
              </div>
            </div>
          </Card>

          {/* KPI Achievement vs Targets */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">KPI Achievement vs Targets</h2>
            <div className="space-y-4">
              {report.kpiTargets && report.kpiTargets.length > 0 ? (
                report.kpiTargets.map((kpi: any, index: number) => {
                  const achievementPercentage = kpi.target > 0
                    ? (kpi.actual / kpi.target) * 100
                    : 0
                  const isAchieved = achievementPercentage >= 100

                  return (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className={`h-5 w-5 ${isAchieved ? 'text-green-600' : 'text-orange-600'}`} />
                          <p className="font-medium">{kpi.name}</p>
                        </div>
                        <span className={`font-semibold ${isAchieved ? 'text-green-600' : 'text-orange-600'}`}>
                          {formatPercentage(achievementPercentage)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Actual: {formatCurrency(kpi.actual)}</span>
                        <span>Target: {formatCurrency(kpi.target)}</span>
                      </div>
                      <div className="mt-2 w-full bg-muted-foreground/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${isAchieved ? 'bg-green-600' : 'bg-orange-600'}`}
                          style={{ width: `${Math.min(achievementPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground text-center py-8">No KPI targets available</p>
              )}
            </div>
          </Card>

          {/* Quote Performance Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quote Performance Breakdown</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-semibold mt-1">
                  {report.quotePerformance?.total || 0}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Converted</p>
                <p className="text-2xl font-semibold mt-1 text-green-600">
                  {report.quotePerformance?.converted || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.quotePerformance?.convertedRate || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold mt-1 text-yellow-600">
                  {report.quotePerformance?.pending || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.quotePerformance?.pendingRate || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Lost</p>
                <p className="text-2xl font-semibold mt-1 text-red-600">
                  {report.quotePerformance?.lost || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.quotePerformance?.lostRate || 0)}
                </p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No data available for this employee in the selected period</p>
        </Card>
      )}
    </div>
  )
}
