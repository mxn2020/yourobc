// src/features/yourobc/employees/components/CommissionSummary.tsx

import { FC, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, Badge, Button, Loading } from '@/components/ui'
import { DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react'

interface CommissionSummaryProps {
  employeeId: Id<'yourobcEmployees'>
}

export const CommissionSummary: FC<CommissionSummaryProps> = ({ employeeId }) => {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)

  const monthlySummary = useQuery(
    api.lib.yourobc.employees.commissions.queries.getMonthlyCommissionSummary,
    {
      employeeId,
      year: selectedYear,
      month: selectedMonth,
    }
  )

  const recentCommissions = useQuery(
    api.lib.yourobc.employees.commissions.queries.getEmployeeCommissions,
    {
      employeeId,
      startDate: new Date(selectedYear, selectedMonth - 1, 1).getTime(),
      endDate: new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999).getTime(),
    }
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'approved':
        return 'primary'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
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

  if (monthlySummary === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
            ← Previous
          </Button>

          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-lg">
              {getMonthName(selectedMonth)} {selectedYear} Commissions
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            Next →
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">Total Earned</span>
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(monthlySummary.totalAmount)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {monthlySummary.totalCommissions} commission{monthlySummary.totalCommissions !== 1 ? 's' : ''}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-yellow-700 font-medium">Pending</span>
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {formatCurrency(monthlySummary.pendingAmount)}
          </div>
          <div className="text-xs text-yellow-600 mt-1">
            Awaiting approval
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Approved</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(monthlySummary.approvedAmount)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Ready for payment
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700 font-medium">Paid</span>
            <CheckCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(monthlySummary.paidAmount)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Already paid out
          </div>
        </Card>
      </div>

      {/* Average Commission */}
      {monthlySummary.totalCommissions > 0 && (
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">Average Commission</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(monthlySummary.averageCommission)}
            </span>
          </div>
        </Card>
      )}

      {/* Recent Commissions */}
      {recentCommissions && recentCommissions.length > 0 ? (
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Recent Commissions</h4>

          <div className="space-y-3">
            {recentCommissions.slice(0, 10).map((commission: NonNullable<typeof recentCommissions>[number]) => (
              <div
                key={commission._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(commission.commissionAmount)}
                    </span>
                    <Badge variant={getStatusVariant(commission.status)} size="sm">
                      {getStatusIcon(commission.status)}
                      <span className="ml-1">{commission.status}</span>
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600">
                    {commission.type === 'margin_percentage' && 'Margin-based'}
                    {commission.type === 'revenue_percentage' && 'Revenue-based'}
                    {commission.type === 'fixed_amount' && 'Fixed amount'}
                    {commission.type === 'tiered' && 'Tiered rate'}
                    {' • '}
                    {commission.commissionRate}%
                    {commission.margin !== undefined && (
                      <span className="ml-2 text-gray-500">
                        Margin: {formatCurrency(commission.margin)} ({commission.marginPercentage?.toFixed(1)}%)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(commission.createdAt).toLocaleDateString()}
                    {commission.invoicePaymentStatus && (
                      <span className="ml-2">
                        • Invoice: {commission.invoicePaymentStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentCommissions.length > 10 && (
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm">
                View All Commissions
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-2">No commissions this month</div>
          <p className="text-sm text-gray-400">
            Commissions will appear here as orders are completed.
          </p>
        </Card>
      )}
    </div>
  )
}
