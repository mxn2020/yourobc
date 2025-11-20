// src/features/yourobc/statistics/pages/TopCustomersPage.tsx

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
import { Users, Download, Trophy } from 'lucide-react'
import { useTopCustomersByRevenue } from '../hooks/useStatistics'
import { formatCurrency, formatPercentage } from '../utils/formatters'

export const TopCustomersPage: FC = () => {
  const currentDate = new Date()
  const [sortBy, setSortBy] = useState<'revenue' | 'margin' | 'count'>('revenue')
  const [limit, setLimit] = useState(25)

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

  // Query
  const { data: topCustomers, isLoading: topCustomersLoading } = useTopCustomersByRevenue(startOfMonth, endOfMonth, {
    limit,
    sortBy,
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Top Customers</h1>
          <p className="text-muted-foreground mt-1">
            Customer rankings by revenue, margin, and invoice count
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={limit.toString()} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="25">Top 25</SelectItem>
              <SelectItem value="50">Top 50</SelectItem>
              <SelectItem value="100">Top 100</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Sort by Revenue</SelectItem>
              <SelectItem value="margin">Sort by Margin</SelectItem>
              <SelectItem value="count">Sort by Invoice Count</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Customer Rankings Table */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Customer Rankings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Cost</th>
                <th className="text-right py-3 px-4">Margin</th>
                <th className="text-right py-3 px-4">Margin %</th>
                <th className="text-right py-3 px-4">Invoices</th>
                <th className="text-right py-3 px-4">Avg Order Value</th>
                <th className="text-right py-3 px-4">Avg Margin</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers?.topCustomers.map((customer, index) => (
                <tr key={customer.customerId} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-100 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{customer.customerName}</td>
                  <td className="text-right py-3 px-4 font-semibold">
                    {formatCurrency(customer.revenue)}
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">
                    {formatCurrency(customer.cost)}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-green-600">
                    {formatCurrency(customer.margin)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatPercentage(customer.marginPercentage)}
                  </td>
                  <td className="text-right py-3 px-4">{customer.invoiceCount}</td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(customer.averageOrderValue)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(customer.averageMargin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
