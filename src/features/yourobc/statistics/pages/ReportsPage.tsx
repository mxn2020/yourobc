// src/features/yourobc/statistics/pages/ReportsPage.tsx

import { FC, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  FileText,
  Download,
  Calendar,
  Users,
  Building2,
  ShoppingCart,
  Award,
  TrendingUp,
} from 'lucide-react'

export const ReportsPage: FC = () => {
  const [selectedYear] = useState(new Date().getFullYear())
  const [selectedMonth] = useState(new Date().getMonth() + 1)

  const reports = [
    {
      id: 'monthly',
      title: 'Monthly Report',
      description: 'Comprehensive monthly breakdown of revenue, costs, and profit',
      icon: <Calendar className="h-8 w-8 text-primary" />,
      link: '/yourobc/statistics/reports/monthly',
      color: 'bg-blue-100',
    },
    {
      id: 'executive',
      title: 'Executive Report',
      description: 'High-level overview with key metrics and top performers',
      icon: <Award className="h-8 w-8 text-purple-600" />,
      link: '/yourobc/statistics/reports/executive',
      color: 'bg-purple-100',
    },
    {
      id: 'employee',
      title: 'Employee Report',
      description: 'Individual employee performance analysis',
      icon: <Users className="h-8 w-8 text-green-600" />,
      link: '/yourobc/statistics/reports/employee',
      color: 'bg-green-100',
    },
    {
      id: 'customer',
      title: 'Customer Report',
      description: 'Customer-specific revenue and transaction history',
      icon: <Building2 className="h-8 w-8 text-orange-600" />,
      link: '/yourobc/statistics/reports/customer',
      color: 'bg-orange-100',
    },
    {
      id: 'order',
      title: 'Order Analysis Report',
      description: 'Order breakdown by status, employee, and metrics',
      icon: <ShoppingCart className="h-8 w-8 text-red-600" />,
      link: '/yourobc/statistics/reports/order',
      color: 'bg-red-100',
    },
    {
      id: 'revenue',
      title: 'Revenue Trends',
      description: 'Year-over-year revenue comparison and analysis',
      icon: <TrendingUp className="h-8 w-8 text-teal-600" />,
      link: '/yourobc/statistics/revenue',
      color: 'bg-teal-100',
    },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and export comprehensive business reports
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Quick Report Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Link to={report.link as any}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`h-16 w-16 rounded-lg ${report.color} flex items-center justify-center`}>
                    {report.icon}
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {/* Recent Reports Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Reports</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Monthly Report - {selectedMonth}/{selectedYear}</p>
                <p className="text-sm text-muted-foreground">Generated today</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Executive Report - {selectedYear}</p>
                <p className="text-sm text-muted-foreground">Generated yesterday</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Export Options</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="justify-start h-auto py-4">
            <div className="text-left">
              <p className="font-semibold">PDF Export</p>
              <p className="text-sm text-muted-foreground">Print-ready format</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4">
            <div className="text-left">
              <p className="font-semibold">Excel Export</p>
              <p className="text-sm text-muted-foreground">Spreadsheet format</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4">
            <div className="text-left">
              <p className="font-semibold">CSV Export</p>
              <p className="text-sm text-muted-foreground">Data format</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  )
}
