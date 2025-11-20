// src/features/yourobc/statistics/pages/MonthlyReportPage.tsx

import { FC, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { KPICard } from '../components/KPICard'
import { useMonthlyReport } from '../hooks/useStatistics'
import { formatCurrency, formatPercentage, formatMonthName } from '../utils/formatters'

export const MonthlyReportPage: FC = () => {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)

  const { data: report, isLoading, canViewReports } = useMonthlyReport(selectedYear, selectedMonth)

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

  const handleExport = (format: 'pdf' | 'excel') => {
    // Placeholder for export functionality
    console.log(`Exporting ${format} for ${formatMonthName(selectedMonth)} ${selectedYear}`)
  }

  const handlePrint = () => {
    window.print()
  }

  if (!canViewReports) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 max-w-md text-center">
          <p className="text-lg">You don't have permission to view reports.</p>
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
            <h1 className="text-3xl font-bold">Monthly Report</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive monthly breakdown of revenue, costs, and profit
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

      {/* Month Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-xl font-semibold">
              {formatMonthName(selectedMonth)} {selectedYear}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={selectedYear === currentDate.getFullYear() && selectedMonth >= currentDate.getMonth() + 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading report data...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(report.revenue?.total || 0)}
              subtitle={`${report.revenue?.invoiceCount || 0} invoices`}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
            />
            <KPICard
              title="Gross Profit"
              value={formatCurrency(report.grossProfit?.amount || 0)}
              subtitle={formatPercentage(report.grossProfit?.percentage || 0)}
              icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            />
            <KPICard
              title="Operating Costs"
              value={formatCurrency(report.operatingCosts?.total || 0)}
              subtitle="All expenses"
              icon={<Briefcase className="h-5 w-5 text-orange-600" />}
            />
            <KPICard
              title="Net Profit"
              value={formatCurrency(report.netProfit?.amount || 0)}
              subtitle={formatPercentage(report.netProfit?.percentage || 0)}
              icon={<DollarSign className="h-5 w-5 text-purple-600" />}
            />
          </div>

          {/* Top Customers */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top Customers</h2>
            <div className="space-y-4">
              {report.topCustomers && report.topCustomers.length > 0 ? (
                report.topCustomers.map((customer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.invoiceCount} {customer.invoiceCount === 1 ? 'invoice' : 'invoices'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(customer.revenue)}</p>
                      <p className="text-sm text-muted-foreground">
                        Margin: {formatPercentage(customer.marginPercentage)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No customer data available</p>
              )}
            </div>
          </Card>

          {/* Employee Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Employee Performance</h2>
            <div className="space-y-4">
              {report.employeePerformance && report.employeePerformance.length > 0 ? (
                report.employeePerformance.map((employee: any, index: number) => (
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

          {/* Operating Costs Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Operating Costs Breakdown</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Employee Costs</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(report.operatingCosts?.employeeCosts || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Office Costs</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(report.operatingCosts?.officeCosts || 0)}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Other Expenses</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(report.operatingCosts?.miscExpenses || 0)}
                </p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No data available for this month</p>
        </Card>
      )}
    </div>
  )
}
