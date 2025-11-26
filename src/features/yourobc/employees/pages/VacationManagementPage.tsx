// src/features/yourobc/employees/pages/VacationManagementPage.tsx

import { FC, useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { useVacationRequests, useEmployeeVacations } from '../hooks/useEmployees'
import { VacationList } from '../components/VacationList'
import { EmployeeSearch } from '../components/EmployeeSearch'
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
import { VACATION_STATUS_LABELS, VACATION_TYPE_LABELS } from '../types'
import type { VacationDayId, EmployeeId, EmployeeListItem } from '../types'

export const VacationManagementPage: FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { auth } = useAuth()

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('pending')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all')
  const [vacationType, setVacationType] = useState<string>('')

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
    const currentYear = new Date().getFullYear()
    const baseFilters: any = {
      year: currentYear,
      limit: 100,
      offset: 0,
    }

    if (selectedEmployeeId) {
      baseFilters.employeeId = selectedEmployeeId as EmployeeId
    }

    if (activeTab !== 'all') {
      baseFilters.status = [activeTab]
    }

    return baseFilters
  }, [selectedEmployeeId, activeTab])

  // Fetch vacation requests with filters
  const {
    requests,
    total,
    hasMore,
    isLoading,
    error,
    refetch,
  } = useVacationRequests(filters)

  const { approveVacation, isApproving } = useEmployeeVacations()

  // Filter requests by search term and vacation type
  const filteredRequests = useMemo(() => {
    if (!requests) return []

    let filtered = requests

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((request) => {
        const employeeName = request.employee?.name?.toLowerCase() || ''
        const employeeNumber = request.employee?.employeeNumber?.toLowerCase() || ''
        const reason = request.reason?.toLowerCase() || ''

        return (
          employeeName.includes(searchLower) ||
          employeeNumber.includes(searchLower) ||
          reason.includes(searchLower)
        )
      })
    }

    if (vacationType) {
      filtered = filtered.filter((request) => request.type === vacationType)
    }

    return filtered
  }, [requests, searchTerm, vacationType])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const allRequests = filteredRequests

    return {
      total: allRequests.length,
      totalDays: allRequests.reduce((sum, r) => sum + r.days, 0),
      pendingCount: allRequests.filter((r) => r.status === 'pending').length,
      pendingDays: allRequests
        .filter((r) => r.status === 'pending')
        .reduce((sum, r) => sum + r.days, 0),
      approvedCount: allRequests.filter((r) => r.status === 'approved').length,
      approvedDays: allRequests
        .filter((r) => r.status === 'approved')
        .reduce((sum, r) => sum + r.days, 0),
    }
  }, [filteredRequests])

  const handleApprovalAction = async (
    vacationDayId: VacationDayId,
    entryIndex: number,
    approved: boolean,
    reason?: string
  ) => {
    try {
      await approveVacation(vacationDayId, entryIndex, approved, reason)
      toast.success(`Vacation request ${approved ? 'approved' : 'denied'} successfully`)
      refetch()
    } catch (error: any) {
      console.error('Vacation approval error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleEmployeeSelect = (employee: EmployeeListItem) => {
    setSelectedEmployeeId(employee._id)
  }

  const clearEmployeeFilter = () => {
    setSelectedEmployeeId('')
  }

  const clearAllFilters = () => {
    setSelectedEmployeeId('')
    setSearchTerm('')
    setDateRange('all')
    setVacationType('')
    setActiveTab('pending')
  }

  if (isLoading && !requests) {
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
              <div className="text-red-500 text-lg mb-4">Error loading vacation requests</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Vacation Management</h1>
            <p className="text-gray-600 mt-2">Review and manage employee vacation requests</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/{-$locale}/yourobc/employees">
              <Button variant="secondary">👥 View Employees</Button>
            </Link>
            <Button variant="primary" onClick={() => navigate({ to: '/yourobc/employees/vacations/new' })}>
              + New Request
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Requests</div>
                <div className="text-2xl">📝</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.total}</div>
              <div className="text-sm text-gray-500 mt-1">{summaryStats.totalDays} days</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl">⏳</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">{summaryStats.pendingCount}</div>
              <div className="text-sm text-gray-500 mt-1">
                {summaryStats.pendingDays} days pending
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Approved</div>
                <div className="text-2xl">✅</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{summaryStats.approvedCount}</div>
              <div className="text-sm text-gray-500 mt-1">
                {summaryStats.approvedDays} days approved
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Approval Rate</div>
                <div className="text-2xl">📊</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {summaryStats.total > 0
                  ? Math.round((summaryStats.approvedCount / summaryStats.total) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-500 mt-1">of all requests</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <EmployeeSearch
                  onSelect={handleEmployeeSelect}
                  placeholder="Search employee..."
                  limit={5}
                />
                {selectedEmployeeId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearEmployeeFilter}
                    className="mt-1 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by employee, reason..."
              />

              <Select value={vacationType} onValueChange={setVacationType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {Object.entries(VACATION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

              <div className="flex items-end">
                {(searchTerm || vacationType || selectedEmployeeId || dateRange !== 'all') && (
                  <Button variant="ghost" onClick={clearAllFilters} className="w-full">
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="pending">
                Pending ({summaryStats.pendingCount})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({summaryStats.approvedCount})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({summaryStats.total})
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Results Summary */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-600">
                  Showing {filteredRequests.length} of {total || 0} vacation requests
                  {searchTerm && (
                    <span className="ml-2 text-blue-600 font-medium">for "{searchTerm}"</span>
                  )}
                </div>

                {filteredRequests.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">
                      {summaryStats.totalDays} total days
                    </Badge>
                  </div>
                )}
              </div>

              {/* Vacation Requests List */}
              <TabsContent value="pending">
                <VacationList
                  vacations={filteredRequests.filter((r) => r.status === 'pending').map((r, index) => ({
                    ...r,
                    vacationDayId: r.vacationDayId,
                    entryIndex: r.entryIndex,
                  }))}
                  isLoading={isLoading}
                  onApprove={handleApprovalAction}
                  showEmployee={true}
                  showActions={true}
                  compact={false}
                  canApprove={true}
                />
              </TabsContent>

              <TabsContent value="approved">
                <VacationList
                  vacations={filteredRequests.filter((r) => r.status === 'approved').map((r, index) => ({
                    ...r,
                    vacationDayId: r.vacationDayId,
                    entryIndex: r.entryIndex,
                  }))}
                  isLoading={isLoading}
                  onApprove={handleApprovalAction}
                  showEmployee={true}
                  showActions={false}
                  compact={false}
                  canApprove={false}
                />
              </TabsContent>

              <TabsContent value="all">
                <VacationList
                  vacations={filteredRequests.map((r, index) => ({
                    ...r,
                    vacationDayId: r.vacationDayId,
                    entryIndex: r.entryIndex,
                  }))}
                  isLoading={isLoading}
                  onApprove={handleApprovalAction}
                  showEmployee={true}
                  showActions={true}
                  compact={false}
                  canApprove={true}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              💡 Vacation Management Guidelines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Approval Process:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Review requests promptly to maintain team morale</li>
                  <li>• Consider business needs and coverage when approving</li>
                  <li>• Provide clear reasons when denying requests</li>
                  <li>• Ensure fair distribution of vacation time</li>
                  <li>• Plan for adequate coverage during peak vacation times</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Best Practices:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Encourage advance notice for better planning</li>
                  <li>• Monitor vacation balances to prevent expiration</li>
                  <li>• Consider team calendars to avoid conflicts</li>
                  <li>• Document approval reasons for consistency</li>
                  <li>• Regular review of vacation policies and usage</li>
                </ul>
              </div>
            </div>

            <Alert variant="default" className="mt-4 bg-blue-100 border-blue-300">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 text-lg">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <strong>Approval Guidelines:</strong> Most vacation requests should be processed 
                    within 48 hours. Emergency or last-minute requests may require additional consideration. 
                    Always maintain open communication with employees about vacation planning and availability.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </Card>

        {/* Quick Actions (Floating) */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <button
            onClick={() => navigate({ to: '/yourobc/employees/vacations/new' })}
            className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
            title="Create New Vacation Request"
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