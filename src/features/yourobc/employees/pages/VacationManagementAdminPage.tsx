// src/features/yourobc/employees/pages/VacationManagementAdminPage.tsx

import { FC, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import {
  Card,
  Button,
  Badge,
  Loading,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

export const VacationManagementAdminPage: FC = () => {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [activeTab, setActiveTab] = useState('pending')
  const toast = useToast()

  // Queries
  const pendingRequests = useQuery(api.lib.yourobc.employees.vacations.queries.getPendingRequests, {})
  const teamSummary = useQuery(api.lib.yourobc.employees.vacations.queries.getTeamVacationSummary, {
    year: selectedYear,
  })
  const onVacationToday = useQuery(api.lib.yourobc.employees.vacations.queries.getEmployeesOnVacationToday, {})

  // Get upcoming vacations for calendar view (next 30 days)
  const today = new Date()
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const vacationCalendar = useQuery(api.lib.yourobc.employees.vacations.queries.getVacationCalendar, {
    startDate: today.getTime(),
    endDate: in30Days.getTime(),
  })

  // Mutations
  const approveVacation = useMutation(api.lib.yourobc.employees.vacations.mutations.approveVacation)
  const rejectVacation = useMutation(api.lib.yourobc.employees.vacations.mutations.rejectVacation)

  const handleApprove = async (employeeId: Id<'yourobcEmployees'>, year: number, entryId: string) => {
    try {
      await approveVacation({ employeeId, year, entryId })
      toast.success('Vacation request approved')
    } catch (error: any) {
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleReject = async (employeeId: Id<'yourobcEmployees'>, year: number, entryId: string) => {
    try {
      await rejectVacation({
        employeeId,
        year,
        entryId,
        reason: 'Rejected by manager',
      })
      toast.success('Vacation request rejected')
    } catch (error: any) {
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const getVacationTypeColor = (type: string) => {
    switch (type) {
      case 'annual':
        return 'bg-blue-100 text-blue-700'
      case 'sick':
        return 'bg-red-100 text-red-700'
      case 'personal':
        return 'bg-purple-100 text-purple-700'
      case 'unpaid':
        return 'bg-gray-100 text-gray-700'
      case 'parental':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vacation Management</h1>
            <p className="text-gray-600">Manage employee vacation requests and track team availability</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setSelectedYear(selectedYear - 1)}>
              ← {selectedYear - 1}
            </Button>
            <span className="text-lg font-semibold px-4">{selectedYear}</span>
            <Button variant="ghost" onClick={() => setSelectedYear(selectedYear + 1)}>
              {selectedYear + 1} →
            </Button>
          </div>
        </div>

        {/* On Vacation Today Alert */}
        {onVacationToday && onVacationToday.length > 0 && (
          <Alert variant="default">
            <AlertDescription>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                <strong>{onVacationToday.length} employee{onVacationToday.length !== 1 ? 's' : ''} on vacation today</strong>
              </div>
              <div className="flex flex-wrap gap-2">
                {onVacationToday.map((vacation: NonNullable<typeof onVacationToday>[number]) => (
                  <Badge key={vacation.entryId} variant="warning">
                    {vacation.userProfile?.name || 'Unknown'}
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Team Summary Statistics */}
        {teamSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-700 font-medium">Total Employees</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900">{teamSummary.totalEmployees}</div>
              <div className="text-xs text-blue-600 mt-1">Active team members</div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700 font-medium">Total Entitlement</span>
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-900">{teamSummary.totalEntitlement}</div>
              <div className="text-xs text-green-600 mt-1">days available</div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-orange-700 font-medium">Days Used</span>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-900">{teamSummary.totalUsed}</div>
              <div className="text-xs text-orange-600 mt-1">
                {teamSummary.averageUsage.toFixed(0)}% average usage
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-700 font-medium">Pending</span>
                <AlertCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-900">{teamSummary.totalPending}</div>
              <div className="text-xs text-purple-600 mt-1">awaiting approval</div>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="pending">
                ⏳ Pending Requests
                {pendingRequests && pendingRequests.length > 0 && (
                  <Badge variant="warning" size="sm" className="ml-2">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="calendar">📅 Upcoming Vacations</TabsTrigger>
              <TabsTrigger value="team">👥 Team Overview</TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Pending Requests Tab */}
              <TabsContent value="pending">
                {pendingRequests === undefined ? (
                  <div className="flex justify-center p-8">
                    <Loading size="lg" />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-2">No pending vacation requests</div>
                    <p className="text-sm text-gray-400">
                      All vacation requests have been reviewed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request: NonNullable<typeof pendingRequests>[number]) => (
                      <Card key={request.entryId} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-lg text-gray-900">
                                {request.userProfile?.name || 'Unknown Employee'}
                              </span>
                              <Badge variant="warning">Pending</Badge>
                              <span className={`text-xs px-2 py-1 rounded capitalize ${getVacationTypeColor(request.type)}`}>
                                {request.type}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                              <strong>{request.days} day{request.days !== 1 ? 's' : ''}</strong>
                              {' • '}
                              {new Date(request.startDate).toLocaleDateString()} -{' '}
                              {new Date(request.endDate).toLocaleDateString()}
                            </div>

                            {request.reason && (
                              <div className="text-sm text-gray-500 mb-2">
                                Reason: {request.reason}
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              Requested: {new Date(request.requestedDate).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(request.employeeId, request.year, request.entryId)}
                            >
                              ✓ Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(request.employeeId, request.year, request.entryId)}
                            >
                              ✗ Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Next 30 Days</h3>

                  {vacationCalendar === undefined ? (
                    <div className="flex justify-center p-8">
                      <Loading size="lg" />
                    </div>
                  ) : vacationCalendar.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 mb-2">No upcoming vacations</div>
                      <p className="text-sm text-gray-400">
                        No approved vacation requests in the next 30 days.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vacationCalendar.map((vacation: NonNullable<typeof vacationCalendar>[number]) => (
                        <Card key={vacation.entryId} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-medium text-gray-900">
                                  {vacation.userProfile?.name || 'Unknown'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded capitalize ${getVacationTypeColor(vacation.type)}`}>
                                  {vacation.type}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600">
                                {new Date(vacation.startDate).toLocaleDateString()} -{' '}
                                {new Date(vacation.endDate).toLocaleDateString()}
                                {' • '}
                                <strong>{vacation.days} day{vacation.days !== 1 ? 's' : ''}</strong>
                              </div>
                            </div>

                            <Badge variant="success">Approved</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Team Overview Tab */}
              <TabsContent value="team">
                {teamSummary === undefined ? (
                  <div className="flex justify-center p-8">
                    <Loading size="lg" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Employee Vacation Usage ({selectedYear})</h3>

                    <div className="space-y-3">
                      {teamSummary?.employeeStats.map((stat: NonNullable<typeof teamSummary>['employeeStats'][number]) => (
                        <Card key={stat.employeeId} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">
                                {stat.userProfile?.name || 'Unknown Employee'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {stat.used} / {stat.available} days used
                                {stat.pending > 0 && (
                                  <span className="ml-2 text-yellow-600">
                                    ({stat.pending} pending)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {stat.usagePercentage.toFixed(0)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {stat.remaining} remaining
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                stat.usagePercentage >= 80
                                  ? 'bg-orange-500'
                                  : stat.usagePercentage >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(stat.usagePercentage, 100)}%` }}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
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
