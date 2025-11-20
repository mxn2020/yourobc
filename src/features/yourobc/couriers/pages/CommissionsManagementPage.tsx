// src/features/yourobc/couriers/pages/CommissionsManagementPage.tsx

import { FC, useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { couriersService } from '../services/CouriersService'
import { CommissionList } from '../components/CommissionList'
import {
  Card,
  Button,
  Badge,
  Loading,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { COMMISSION_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../types'
import type { CommissionId, CourierId, CommissionListItem } from '../types'

export const CommissionsManagementPage: FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { auth } = useAuth()

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid'>('all')
  const [selectedCourierId, setSelectedCourierId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all')

  // Calculate date range
  const calculatedDateRange = useMemo(() => {
    if (dateRange === 'all') return undefined

    const now = Date.now()
    const start = new Date()

    switch (dateRange) {
      case 'month':
        start.setMonth(start.getMonth() - 1)
        break
      case 'quarter':
        start.setMonth(start.getMonth() - 3)
        break
      case 'year':
        start.setFullYear(start.getFullYear() - 1)
        break
    }

    return {
      start: start.getTime(),
      end: now,
    }
  }, [dateRange])

  // Build filters based on active tab and selections
  const filters = useMemo(() => {
    const baseFilters: any = {
      limit: 100,
      offset: 0,
    }

    if (selectedCourierId) {
      baseFilters.courierId = selectedCourierId as CourierId
    }

    if (activeTab !== 'all') {
      baseFilters.status = [activeTab]
    }

    if (calculatedDateRange) {
      baseFilters.dateRange = calculatedDateRange
    }

    return baseFilters
  }, [selectedCourierId, activeTab, calculatedDateRange])

  // Fetch commissions with filters
  const {
    data: commissionsData,
    isPending: isLoading,
    error,
    refetch,
  } = couriersService.useCommissions(auth?.id!, filters)

  const markPaidMutation = couriersService.useMarkCommissionPaid()

  // Filter commissions by search term
  const filteredCommissions = useMemo(() => {
    if (!commissionsData?.commissions) return []

    let filtered = commissionsData.commissions

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((commission) => {
        const courierName = commission.courier
          ? `${commission.courier.firstName} ${commission.courier.lastName}`.toLowerCase()
          : ''
        const courierNumber = commission.courier?.courierNumber?.toLowerCase() || ''
        const shipmentNumber = commission.shipment?.shipmentNumber?.toLowerCase() || ''

        return (
          courierName.includes(searchLower) ||
          courierNumber.includes(searchLower) ||
          shipmentNumber.includes(searchLower)
        )
      })
    }

    return filtered
  }, [commissionsData, searchTerm])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const commissions = filteredCommissions

    return {
      total: commissions.length,
      totalAmount: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
      pendingCount: commissions.filter((c) => c.status === 'pending').length,
      pendingAmount: commissions
        .filter((c) => c.status === 'pending')
        .reduce((sum, c) => sum + c.commissionAmount, 0),
      paidCount: commissions.filter((c) => c.status === 'paid').length,
      paidAmount: commissions
        .filter((c) => c.status === 'paid')
        .reduce((sum, c) => sum + c.commissionAmount, 0),
    }
  }, [filteredCommissions])

  const handleMarkPaid = async (commissionId: CommissionId) => {
    try {
      await markPaidMutation.mutateAsync({
        authUserId: auth?.id!,
        commissionId,
        paymentMethod: 'bank_transfer',
      })
      toast.success('Commission marked as paid successfully')
      refetch()
    } catch (error: any) {
      console.error('Mark paid error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const clearAllFilters = () => {
    setSelectedCourierId('')
    setSearchTerm('')
    setDateRange('all')
    setActiveTab('all')
  }

  if (isLoading && !commissionsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-screen-2xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">Error loading commissions</div>
              <p className="text-gray-500 mb-4">{error.message}</p>
              <Button onClick={() => refetch()} variant="primary" size="sm">
                Try again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commission Management</h1>
            <p className="text-gray-600 mt-2">Track and manage courier commission payments</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/yourobc/couriers">
              <Button variant="secondary">👥 View Couriers</Button>
            </Link>
            <Button variant="primary" onClick={() => navigate({ to: '/yourobc/couriers/commissions/new' })}>
              + New Commission
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Commissions</div>
                <div className="text-2xl">💰</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(summaryStats.totalAmount)}
              </div>
              <div className="text-sm text-gray-500 mt-1">{summaryStats.total} payments</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl">⏳</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summaryStats.pendingAmount)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {summaryStats.pendingCount} payment{summaryStats.pendingCount !== 1 ? 's' : ''}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Paid</div>
                <div className="text-2xl">✅</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summaryStats.paidAmount)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {summaryStats.paidCount} payment{summaryStats.paidCount !== 1 ? 's' : ''}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Average</div>
                <div className="text-2xl">📊</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {summaryStats.total > 0
                  ? formatCurrency(summaryStats.totalAmount / summaryStats.total)
                  : formatCurrency(0)}
              </div>
              <div className="text-sm text-gray-500 mt-1">per commission</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by courier, shipment..."
              />

              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                {(searchTerm || dateRange !== 'all' || selectedCourierId) && (
                  <Button variant="ghost" onClick={clearAllFilters} className="w-full">
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-end">
                <Button variant="secondary" size="sm" onClick={() => refetch()}>
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="all">
                All ({summaryStats.total})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({summaryStats.pendingCount})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Paid ({summaryStats.paidCount})
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Results Summary */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-600">
                  Showing {filteredCommissions.length} of {commissionsData?.total || 0} commissions
                  {searchTerm && (
                    <span className="ml-2 text-blue-600 font-medium">for "{searchTerm}"</span>
                  )}
                </div>

                {filteredCommissions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">
                      Total: {formatCurrency(summaryStats.totalAmount)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Commissions List */}
              <TabsContent value="all">
                <CommissionList
                  commissions={filteredCommissions}
                  isLoading={isLoading}
                  onMarkPaid={handleMarkPaid}
                  showCourier={true}
                  showShipment={true}
                  compact={false}
                />
              </TabsContent>

              <TabsContent value="pending">
                <CommissionList
                  commissions={filteredCommissions.filter((c) => c.status === 'pending')}
                  isLoading={isLoading}
                  onMarkPaid={handleMarkPaid}
                  showCourier={true}
                  showShipment={true}
                  compact={false}
                />
              </TabsContent>

              <TabsContent value="paid">
                <CommissionList
                  commissions={filteredCommissions.filter((c) => c.status === 'paid')}
                  isLoading={isLoading}
                  onMarkPaid={handleMarkPaid}
                  showCourier={true}
                  showShipment={true}
                  compact={false}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              💡 Commission Management Tips
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Payment Processing:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Review pending commissions regularly</li>
                  <li>• Process payments in batches for efficiency</li>
                  <li>• Always include payment references</li>
                  <li>• Verify bank details before processing</li>
                  <li>• Document payment method used</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Best Practices:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Set clear commission rates per courier</li>
                  <li>• Process payments on a regular schedule</li>
                  <li>• Maintain accurate payment records</li>
                  <li>• Review commission reports monthly</li>
                  <li>• Address payment issues promptly</li>
                </ul>
              </div>
            </div>

            <Alert variant="default" className="mt-4 bg-blue-100 border-blue-300">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 text-lg">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <strong>Payment Schedule:</strong> Commissions are typically processed at the
                    end of each month. Ensure all shipment data is accurate before payment
                    processing. Contact finance team for urgent payment requests.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </Card>

        {/* Quick Actions (Floating) */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <button
            onClick={() => navigate({ to: '/yourobc/couriers/commissions/new' })}
            className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
            title="Create New Commission"
          >
            ➕
          </button>

          <button
            onClick={() => refetch()}
            className="w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
            title="Refresh Data"
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  )
}