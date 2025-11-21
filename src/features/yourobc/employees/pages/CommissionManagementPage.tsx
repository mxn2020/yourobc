// src/features/yourobc/employees/pages/CommissionManagementPage.tsx

import { FC, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/generated/api'
import { Card, Button, Badge, Loading, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import { useAuthenticatedUser } from '@/features/system/auth'
import { parseConvexError } from '@/utils/errorHandling'
import { DollarSign, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

export const CommissionManagementPage: FC = () => {
  const authUser = useAuthenticatedUser()
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [activeTab, setActiveTab] = useState('pending')
  const toast = useToast()

  // Queries
  const pendingCommissions = useQuery(api.lib.yourobc.employees.commissions.queries.getPendingCommissions, {})
  const approvedCommissions = useQuery(api.lib.yourobc.employees.commissions.queries.getApprovedCommissions, {})
  const allCommissions = useQuery(api.lib.yourobc.employees.commissions.queries.getAllCommissions, {
    startDate: new Date(selectedYear, selectedMonth - 1, 1).getTime(),
    endDate: new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999).getTime(),
  })
  const statistics = useQuery(api.lib.yourobc.employees.commissions.queries.getCommissionStatistics, {
    year: selectedYear,
    month: selectedMonth,
  })

  // Mutations
  const approveCommission = useMutation(api.lib.yourobc.employees.commissions.mutations.approveCommission)
  const payCommission = useMutation(api.lib.yourobc.employees.commissions.mutations.payCommission)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
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

  const handleApprove = async (commissionId: Id<'yourobcEmployeeCommissions'>) => {
    if (!authUser) {
      toast.error('You must be logged in to approve commissions')
      return
    }
    try {
      await approveCommission({ authUserId: authUser.id, commissionId })
      toast.success('Commission approved successfully')
    } catch (error: any) {
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handlePay = async (commissionId: Id<'yourobcEmployeeCommissions'>) => {
    if (!authUser) {
      toast.error('You must be logged in to mark commissions as paid')
      return
    }
    try {
      await payCommission({
        authUserId: authUser.id,
        commissionId,
        paymentMethod: 'bank_transfer',
      })
      toast.success('Commission marked as paid')
    } catch (error: any) {
      const { message } = parseConvexError(error)
      toast.error(message)
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Management</h1>
            <p className="text-gray-600">Manage employee sales commissions and payments</p>
          </div>
        </div>

        {/* Month Selector */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
              ← Previous
            </Button>

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-lg">
                {getMonthName(selectedMonth)} {selectedYear}
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
              Next →
            </Button>
          </div>
        </Card>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700 font-medium">Total Amount</span>
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(statistics.totalAmount)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {statistics.totalCommissions} commissions
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-yellow-700 font-medium">Pending</span>
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {formatCurrency(statistics.totalPending)}
              </div>
              <div className="text-xs text-yellow-600 mt-1">Awaiting approval</div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-700 font-medium">Approved</span>
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(statistics.totalApproved)}
              </div>
              <div className="text-xs text-blue-600 mt-1">Ready for payment</div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-700 font-medium">Paid</span>
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(statistics.totalPaid)}
              </div>
              <div className="text-xs text-purple-600 mt-1">Already paid out</div>
            </Card>
          </div>
        )}

        {/* Top Earners */}
        {statistics && statistics.topEarners && statistics.topEarners.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Top Earners This Month</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {statistics.topEarners.slice(0, 6).map((earner: NonNullable<typeof statistics>['topEarners'][number], index: number) => (
                <div key={earner.employeeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="text-sm text-gray-600">Employee</div>
                  </div>
                  <div className="font-semibold text-gray-900">{formatCurrency(earner.amount)}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Commissions Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="pending">
                ⏳ Pending
                {pendingCommissions && pendingCommissions.length > 0 && (
                  <Badge variant="warning" size="sm" className="ml-2">
                    {pendingCommissions.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">
                ✓ Approved
                {approvedCommissions && approvedCommissions.length > 0 && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {approvedCommissions.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">📋 All Commissions</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="pending">
                {pendingCommissions === undefined ? (
                  <div className="flex justify-center p-8">
                    <Loading size="lg" />
                  </div>
                ) : pendingCommissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-2">No pending commissions</div>
                    <p className="text-sm text-gray-400">
                      All commissions have been reviewed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingCommissions.map((commission: NonNullable<typeof pendingCommissions>[number]) => (
                      <Card key={commission._id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-xl text-gray-900">
                                {formatCurrency(commission.commissionAmount)}
                              </span>
                              <Badge variant={getStatusVariant(commission.status)}>
                                {commission.status}
                              </Badge>
                            </div>

                            <div className="text-sm text-gray-600 mb-1">
                              <strong>{commission.userProfile?.name || 'Unknown Employee'}</strong>
                              {' • '}
                              {commission.type === 'margin_percentage' && 'Margin-based'}
                              {commission.type === 'revenue_percentage' && 'Revenue-based'}
                              {commission.type === 'fixed_amount' && 'Fixed amount'}
                              {commission.type === 'tiered' && 'Tiered rate'}
                              {' • '}
                              {commission.commissionRate}%
                            </div>

                            {commission.margin !== undefined && (
                              <div className="text-xs text-gray-500">
                                Margin: {formatCurrency(commission.margin)} (
                                {commission.marginPercentage?.toFixed(1)}%)
                              </div>
                            )}

                            <div className="text-xs text-gray-500 mt-1">
                              Created: {new Date(commission.createdAt).toLocaleDateString()}
                              {commission.invoicePaymentStatus && (
                                <span className="ml-2">
                                  • Invoice: {commission.invoicePaymentStatus}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(commission._id)}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved">
                {approvedCommissions === undefined ? (
                  <div className="flex justify-center p-8">
                    <Loading size="lg" />
                  </div>
                ) : approvedCommissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-2">No approved commissions</div>
                    <p className="text-sm text-gray-400">
                      Approved commissions ready for payment will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedCommissions.map((commission: NonNullable<typeof approvedCommissions>[number]) => (
                      <Card key={commission._id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-xl text-gray-900">
                                {formatCurrency(commission.commissionAmount)}
                              </span>
                              <Badge variant={getStatusVariant(commission.status)}>
                                {commission.status}
                              </Badge>
                            </div>

                            <div className="text-sm text-gray-600">
                              <strong>{commission.userProfile?.name || 'Unknown Employee'}</strong>
                              {' • '}
                              Approved: {new Date(commission.approvedDate!).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handlePay(commission._id)}
                            >
                              Mark as Paid
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all">
                {allCommissions === undefined ? (
                  <div className="flex justify-center p-8">
                    <Loading size="lg" />
                  </div>
                ) : allCommissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-2">No commissions this month</div>
                    <p className="text-sm text-gray-400">
                      Commissions will appear here as they are created.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allCommissions.map((commission: NonNullable<typeof allCommissions>[number]) => (
                      <Card key={commission._id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-lg text-gray-900">
                                {formatCurrency(commission.commissionAmount)}
                              </span>
                              <Badge variant={getStatusVariant(commission.status)}>
                                {commission.status}
                              </Badge>
                            </div>

                            <div className="text-sm text-gray-600">
                              <strong>{commission.userProfile?.name || 'Unknown Employee'}</strong>
                              {' • '}
                              {new Date(commission.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
