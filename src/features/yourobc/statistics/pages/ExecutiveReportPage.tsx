// src/features/yourobc/statistics/pages/ExecutiveReportPage.tsx

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
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { KPICard } from '../components/KPICard'
import { useExecutiveReport } from '../hooks/useStatistics'
import { formatCurrency, formatPercentage, formatMonthName } from '../utils/formatters'

export const ExecutiveReportPage: FC = () => {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual')

  const { data: report, isLoading, canViewExecutiveReport } = useExecutiveReport(selectedYear, selectedMonth)

  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1)
  }

  const handleNextYear = () => {
    setSelectedYear(selectedYear + 1)
  }

  const handlePreviousMonth = () => {
    if (!selectedMonth) return
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (!selectedMonth) return
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const toggleViewMode = () => {
    if (viewMode === 'annual') {
      setViewMode('monthly')
      setSelectedMonth(currentDate.getMonth() + 1)
    } else {
      setViewMode('annual')
      setSelectedMonth(undefined)
    }
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    const period = selectedMonth
      ? `${formatMonthName(selectedMonth)} ${selectedYear}`
      : `${selectedYear}`
    console.log(`Exporting ${format} for Executive Report - ${period}`)
  }

  const handlePrint = () => {
    window.print()
  }

  if (!canViewExecutiveReport) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 max-w-md text-center">
          <p className="text-lg">You don't have permission to view executive reports.</p>
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
            <h1 className="text-3xl font-bold">Executive Report</h1>
            <p className="text-muted-foreground mt-1">
              High-level overview of company performance and key metrics
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

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'annual' ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleViewMode}
            >
              Annual View
            </Button>
            <Button
              variant={viewMode === 'monthly' ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleViewMode}
            >
              Monthly View
            </Button>
          </div>

          {viewMode === 'annual' ? (
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handlePreviousYear}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-xl font-semibold min-w-[100px] text-center">
                {selectedYear}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextYear}
                disabled={selectedYear >= currentDate.getFullYear()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-xl font-semibold min-w-[200px] text-center">
                {selectedMonth ? formatMonthName(selectedMonth) : ''} {selectedYear}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={
                  selectedYear === currentDate.getFullYear() &&
                  selectedMonth !== undefined &&
                  selectedMonth >= currentDate.getMonth() + 1
                }
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading executive report data...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(report.totalRevenue || 0)}
              subtitle={`${viewMode === 'annual' ? 'Annual' : 'Monthly'} revenue`}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
            />
            <KPICard
              title="YoY Growth"
              value={formatPercentage(report.yoyGrowth || 0)}
              subtitle="vs last year"
              icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            />
            <KPICard
              title="Top Performer"
              value={report.topPerformer?.name || 'N/A'}
              subtitle={report.topPerformer ? formatCurrency(report.topPerformer.revenue) : ''}
              icon={<Award className="h-5 w-5 text-yellow-600" />}
            />
            <KPICard
              title="Employee Count"
              value={report.employeeCount?.toString() || '0'}
              subtitle="Active employees"
              icon={<Users className="h-5 w-5 text-blue-600" />}
            />
          </div>

          {/* Revenue Trend Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <p className="text-muted-foreground">Chart placeholder - Revenue trend visualization</p>
            </div>
          </Card>

          {/* Top 5 Employees by Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top 5 Employees by Performance</h2>
            <div className="space-y-4">
              {report.topEmployees && report.topEmployees.length > 0 ? (
                report.topEmployees.map((employee: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                        {index + 1}
                      </div>
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
                        Margin: {formatCurrency(employee.margin)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No employee data available</p>
              )}
            </div>
          </Card>

          {/* Cost Breakdown Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cost Breakdown Summary</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Costs</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(report.costs?.total || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Employee Costs</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(report.costs?.employee || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.costs?.employeePercentage || 0)} of total
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Operating Costs</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(report.costs?.operating || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.costs?.operatingPercentage || 0)} of total
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Other Expenses</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(report.costs?.other || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(report.costs?.otherPercentage || 0)} of total
                </p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No data available for this period</p>
        </Card>
      )}
    </div>
  )
}
