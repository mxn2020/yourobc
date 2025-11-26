// src/features/yourobc/employees/pages/EmployeeDetailsPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEmployee, useEmployees, useEmployeeVacations } from '../hooks/useEmployees'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Loading,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { DeleteConfirmationModal } from '@/components/ui/Modals'
import { CommentsSection } from '@/features/yourobc/supporting/comments'
import { RemindersSection } from '@/features/yourobc/supporting/followup-reminders'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki'
import { VacationList } from '../components/VacationList'
import { SessionTracker } from '../components/SessionTracker'
import { WorkHoursSummary } from '../components/WorkHoursSummary'
import { KPIDashboard } from '../components/KPIDashboard'
import { CommissionSummary } from '../components/CommissionSummary'
import { VacationBalance } from '../components/VacationBalance'
import type { EmployeeId, VacationDayId } from '../types'

interface EmployeeDetailsPageProps {
  employeeId: EmployeeId
}

export const EmployeeDetailsPage: FC<EmployeeDetailsPageProps> = ({ employeeId }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const { employee, employeeMetrics, employeeInsights, isLoading, error } = useEmployee(employeeId)
  const { canEditEmployees, canDeleteEmployees, deleteEmployee, isDeleting } = useEmployees()
  const {
    vacations,
    isLoading: isVacationsLoading,
    approveVacation,
    isApproving,
  } = useEmployeeVacations(employeeId)

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!employee) return

    try {
      await deleteEmployee(employeeId)
      toast.success(`${employee.userProfile?.name || 'Employee'} has been deleted successfully`)
      setDeleteModalOpen(false)
      navigate({ to: '/yourobc/employees' })
    } catch (error: any) {
      console.error('Delete employee error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleVacationApproval = async (
    vacationDayId: VacationDayId,
    entryIndex: number,
    approved: boolean,
    reason?: string
  ) => {
    try {
      await approveVacation(vacationDayId, entryIndex, approved, reason)
      toast.success(`Vacation request ${approved ? 'approved' : 'denied'} successfully`)
    } catch (error: any) {
      console.error('Vacation approval error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'busy':
        return 'warning'
      case 'offline':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getDepartmentColor = (department?: string) => {
    const colors: Record<string, string> = {
      'Operations': 'bg-blue-50 text-blue-700 border-blue-200',
      'Sales': 'bg-green-50 text-green-700 border-green-200',
      'Customer Service': 'bg-purple-50 text-purple-700 border-purple-200',
      'Finance': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'IT': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'HR': 'bg-pink-50 text-pink-700 border-pink-200',
      'Management': 'bg-red-50 text-red-700 border-red-200',
      'Administration': 'bg-gray-50 text-gray-700 border-gray-200',
    }
    return colors[department || ''] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">
                {error ? 'Error loading employee' : 'Employee not found'}
              </div>
              <p className="text-gray-500 mb-4">
                {error?.message || 'The employee you are looking for does not exist or has been deleted.'}
              </p>
              <Link to="/{-$locale}/yourobc/employees" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Employees
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/{-$locale}/yourobc/employees" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Employees
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/{-$locale}/yourobc/employees/vacations/new" search={{ employeeId }}>
              <Button variant="primary">🏖️ Request Vacation</Button>
            </Link>

            {canEditEmployees && (
              <Button
                variant="secondary"
                onClick={() => navigate({ to: `/yourobc/employees/${employeeId}/edit` })}
              >
                ✏️ Edit
              </Button>
            )}

            {canDeleteEmployees && (
              <Button variant="danger" onClick={handleDeleteClick} disabled={isDeleting}>
                🗑️ Delete
              </Button>
            )}
          </div>
        </div>

        {/* Employee Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {employee.userProfile?.name || 'Unknown Employee'}
                  </h1>

                  {employeeInsights?.isManager && (
                    <Badge variant="primary">👑 Manager</Badge>
                  )}

                  {employeeInsights?.isNewEmployee && (
                    <Badge variant="success">✨ New Employee</Badge>
                  )}
                </div>

                <div className="text-gray-600 mb-4">
                  Employee ID: {employee.employeeNumber}
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <span className="text-gray-500">Office:</span>
                    <span className="ml-2 font-medium">
                      {employee.office.location}, {employee.office.country}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Department:</span>
                    <span className={`ml-2 px-2 py-1 rounded-lg text-sm font-medium border ${getDepartmentColor(employee.department)}`}>
                      {employee.department || 'No Department'}
                    </span>
                  </div>

                  {employee.userProfile?.email && (
                    <a href={`mailto:${employee.userProfile.email}`} className="text-blue-600 hover:text-blue-800">
                      📧 {employee.userProfile.email}
                    </a>
                  )}

                  {employee.workPhone && (
                    <a href={`tel:${employee.workPhone}`} className="text-blue-600 hover:text-blue-800">
                      📞 {employee.workPhone}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {employee.status && (
                  <Badge variant={getStatusVariant(employee.status)}>
                    {employee.status.toUpperCase()}
                  </Badge>
                )}

                {employee.isOnline && <Badge variant="success">🟢 Online</Badge>}

                {!employee.isActive && <Badge variant="danger">⚠️ Inactive</Badge>}

                {employeeInsights?.needsAttention && (
                  <Badge variant="warning">⚠️ Needs Attention</Badge>
                )}

                {employee.vacationStatus?.onVacation && (
                  <Badge variant="warning">🏖️ On Vacation</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Key Metrics */}
            {employeeMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {employeeMetrics.reportsManaged}
                  </div>
                  <div className="text-sm text-gray-600">Direct Reports</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {employeeMetrics.averageHoursPerDay.toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-600">Avg. Hours/Day</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {employeeMetrics.punctualityScore}%
                  </div>
                  <div className="text-sm text-gray-600">Punctuality</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {employeeMetrics.vacationDaysRemaining}
                  </div>
                  <div className="text-sm text-gray-600">Vacation Days Left</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {employeeMetrics.vacationDaysUsed} used this year
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="overview">👁️ Overview</TabsTrigger>
              <TabsTrigger value="sessions">⏱️ Sessions</TabsTrigger>
              <TabsTrigger value="kpis">📊 KPIs</TabsTrigger>
              <TabsTrigger value='yourobcCommissions'>💰 Commissions</TabsTrigger>
              <TabsTrigger value="vacations">🏖️ Vacations</TabsTrigger>
              <TabsTrigger value="team">👥 Team</TabsTrigger>
              <TabsTrigger value="history">📈 History</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Employee Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Full Name:</span>{' '}
                              {employee.userProfile?.name || 'Unknown'}
                            </div>
                            <div>
                              <span className="text-gray-500">Employee ID:</span> {employee.employeeNumber}
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span> {employee.userProfile?.email}
                            </div>
                            <div>
                              <span className="text-gray-500">Timezone:</span> {employee.timezone}
                            </div>
                            {employee.hireDate && (
                              <div>
                                <span className="text-gray-500">Hire Date:</span>{' '}
                                {new Date(employee.hireDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Employment Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Department:</span>{' '}
                              {employee.department || 'Not assigned'}
                            </div>
                            <div>
                              <span className="text-gray-500">Position:</span>{' '}
                              {employee.position || 'Not specified'}
                            </div>
                            <div>
                              <span className="text-gray-500">Office:</span>{' '}
                              {employee.office.location}, {employee.office.country}
                            </div>
                            {employee.workPhone && (
                              <div>
                                <span className="text-gray-500">Work Phone:</span> {employee.workPhone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Manager */}
                      {employee.manager && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Reports To</h4>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">{employee.manager.name}</div>
                            <div className="text-sm text-gray-600">
                              {employee.manager.position} • {employee.manager.department}
                            </div>
                            <div className="text-sm text-gray-500">ID: {employee.manager.employeeNumber}</div>
                          </div>
                        </div>
                      )}

                      {/* Emergency Contact */}
                      {employee.emergencyContact && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">{employee.emergencyContact.name}</div>
                            <div className="text-sm text-gray-600">{employee.emergencyContact.relationship}</div>
                            <div className="text-sm text-gray-500">{employee.emergencyContact.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Work Status */}
                    {employee.workingHours && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Status</h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">
                              {employee.workingHours.todayHours.toFixed(1)}h
                            </div>
                            <div className="text-xs text-gray-600">Today's Hours</div>
                          </div>

                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">
                              {employee.workingHours.isWorking ? '🟢' : '⭕'}
                            </div>
                            <div className="text-xs text-gray-600">
                              {employee.workingHours.isWorking ? 'Working' : 'Not Working'}
                            </div>
                          </div>

                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">
                              {employee.workingHours.lastLogin 
                                ? formatDate(employee.workingHours.lastLogin).split(',')[0]
                                : 'Never'}
                            </div>
                            <div className="text-xs text-gray-600">Last Login</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="bg-gray-50">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                          <Link to="/{-$locale}/yourobc/employees/vacations/new" search={{ employeeId }} className="block w-full">
                            <Button variant="primary" className="w-full">
                              🏖️ Request Vacation
                            </Button>
                          </Link>

                          <Button variant="secondary" className="w-full">
                            📧 Send Message
                          </Button>

                          <Button variant="ghost" className="w-full">
                            📊 View Report
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Employee Insights */}
                    {employeeInsights && (
                      <Alert variant="default">
                        <AlertDescription>
                          <h3 className="font-semibold text-blue-900 mb-3">Employee Insights</h3>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>Employee Age: {employeeInsights.employeeAge} days</div>
                            {employeeInsights.daysSinceLastActivity !== null && (
                              <div>
                                Last Activity: {employeeInsights.daysSinceLastActivity} days ago
                              </div>
                            )}

                            {employeeInsights.needsAttention && (
                              <div className="text-orange-800 font-medium mt-2">
                                ⚠️ Employee needs attention - no activity for{' '}
                                {employeeInsights.daysSinceLastActivity} days
                              </div>
                            )}

                            {employeeInsights.hasUpcomingVacation && (
                              <div className="text-blue-800 font-medium mt-2">
                                🏖️ Has upcoming vacation planned
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sessions">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Work Sessions & Hours</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <SessionTracker employeeId={employeeId} />
                    </div>
                    <div className="lg:col-span-2">
                      <WorkHoursSummary employeeId={employeeId} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="kpis">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                  <KPIDashboard employeeId={employeeId} />
                </div>
              </TabsContent>

              <TabsContent value='yourobcCommissions'>
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Sales Commissions</h3>
                  <CommissionSummary employeeId={employeeId} />
                </div>
              </TabsContent>

              <TabsContent value="team">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Team Management</h3>

                  {/* Direct Reports */}
                  {employee.directReports && employee.directReports.length > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">
                        Direct Reports ({employee.directReports.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {employee.directReports.map((report) => (
                          <Card key={report._id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {report.userProfile?.name || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {report.position} • {report.department}
                                </div>
                                <div className="text-sm text-gray-500">ID: {report.employeeNumber}</div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge
                                  variant={getStatusVariant(report.status)}
                                  size="sm"
                                >
                                  {report.status}
                                </Badge>
                                {!report.isActive && (
                                  <Badge variant="danger" size="sm">Inactive</Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-2">No Direct Reports</div>
                      <p className="text-gray-400 text-sm">
                        This employee doesn't manage any team members.
                      </p>
                    </div>
                  )}

                  {/* Organization Chart Link */}
                  <div className="text-center">
                    <Button variant="secondary">
                      📊 View Organization Chart
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vacations">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Vacation Management</h3>

                  <VacationBalance employeeId={employeeId} />

                  {/* Vacation Request History */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Vacation Request History</h4>
                      <Link to="/{-$locale}/yourobc/employees/vacations/new" search={{ employeeId }}>
                        <Button variant="primary" size="sm">
                          + New Request
                        </Button>
                      </Link>
                    </div>

                    <VacationList
                      vacations={vacations?.entries || []}
                      isLoading={isVacationsLoading}
                      onApprove={handleVacationApproval}
                      showEmployee={false}
                      showActions={true}
                      compact={false}
                      canApprove={canEditEmployees}
                    />
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>

                  {/* Timeline of key events */}
                  <div className="space-y-4">
                    {/* Employment Events */}
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full -ml-[1.6rem]"></div>
                        <h4 className="font-semibold text-gray-900">Employment Started</h4>
                      </div>
                      <div className="text-sm text-gray-600">
                        {employee.hireDate
                          ? new Date(employee.hireDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Hire date not specified'}
                      </div>
                      {employeeInsights && (
                        <div className="text-sm text-gray-500 mt-1">
                          {employeeInsights.employeeAge} days with the company
                        </div>
                      )}
                    </div>

                    {/* Current Status */}
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full -ml-[1.6rem]"></div>
                        <h4 className="font-semibold text-gray-900">Current Status</h4>
                      </div>
                      <div className="text-sm text-gray-600">
                        Status: <Badge variant={getStatusVariant(employee.status)} size="sm">{employee.status}</Badge>
                        {employee.isActive ? (
                          <span className="ml-2 text-green-600">Active Employee</span>
                        ) : (
                          <span className="ml-2 text-red-600">Inactive</span>
                        )}
                      </div>
                      {employee.workingHours?.lastLogin && (
                        <div className="text-sm text-gray-500 mt-1">
                          Last login: {formatDate(employee.workingHours.lastLogin)}
                        </div>
                      )}
                    </div>

                    {/* Vacation Status */}
                    {employee.vacationStatus?.onVacation && employee.vacationStatus.currentVacation && (
                      <div className="border-l-4 border-orange-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-orange-500 rounded-full -ml-[1.6rem]"></div>
                          <h4 className="font-semibold text-gray-900">Currently On Vacation</h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          {employee.vacationStatus.currentVacation.startDate && employee.vacationStatus.currentVacation.endDate && (
                            <>
                              From {new Date(employee.vacationStatus.currentVacation.startDate).toLocaleDateString()}
                              {' '}to {new Date(employee.vacationStatus.currentVacation.endDate).toLocaleDateString()}
                            </>
                          )}
                        </div>
                        {employee.vacationStatus.currentVacation.type && (
                          <div className="text-sm text-gray-500 mt-1">
                            Type: <span className="capitalize">{employee.vacationStatus.currentVacation.type}</span>
                          </div>
                        )}
                        {employee.vacationStatus.currentVacation.daysRemaining !== undefined && (
                          <div className="text-sm text-gray-500 mt-1">
                            {employee.vacationStatus.currentVacation.daysRemaining} days remaining
                          </div>
                        )}
                        {employee.vacationStatus.currentVacation.reason && (
                          <div className="text-sm text-gray-500 mt-1 italic">
                            {employee.vacationStatus.currentVacation.reason}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Performance Metrics Summary */}
                    {employeeMetrics && (
                      <div className="border-l-4 border-purple-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-purple-500 rounded-full -ml-[1.6rem]"></div>
                          <h4 className="font-semibold text-gray-900">Performance Summary</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">Avg Hours/Day</div>
                            <div className="font-semibold">{employeeMetrics.averageHoursPerDay.toFixed(1)}h</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">Punctuality</div>
                            <div className="font-semibold">{employeeMetrics.punctualityScore}%</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">Direct Reports</div>
                            <div className="font-semibold">{employeeMetrics.reportsManaged}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">Vacation Days Used</div>
                            <div className="font-semibold">
                              {employeeMetrics.vacationDaysUsed} / {employeeMetrics.vacationDaysUsed + employeeMetrics.vacationDaysRemaining}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Work Activity */}
                    {employee.workingHours && (
                      <div className="border-l-4 border-indigo-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full -ml-[1.6rem]"></div>
                          <h4 className="font-semibold text-gray-900">Recent Activity</h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          {employee.workingHours.isWorking ? (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              Currently working - {employee.workingHours.todayHours.toFixed(1)} hours today
                            </div>
                          ) : (
                            <div>Not currently working</div>
                          )}
                        </div>
                        {employeeInsights !== null && employeeInsights?.daysSinceLastActivity !== null && (
                          <div className="text-sm text-gray-500 mt-1">
                            Last activity: {employeeInsights.daysSinceLastActivity} days ago
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upcoming Events */}
                    {employeeInsights?.hasUpcomingVacation && (
                      <div className="border-l-4 border-yellow-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full -ml-[1.6rem]"></div>
                          <h4 className="font-semibold text-gray-900">Upcoming Events</h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          Vacation scheduled in the near future
                        </div>
                      </div>
                    )}

                    {/* Alerts */}
                    {employeeInsights?.needsAttention && (
                      <div className="border-l-4 border-red-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full -ml-[1.6rem]"></div>
                          <h4 className="font-semibold text-gray-900">⚠️ Needs Attention</h4>
                        </div>
                        <div className="text-sm text-red-600">
                          No activity for {employeeInsights.daysSinceLastActivity} days.
                          Consider reaching out to check on the employee.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <Card className="bg-blue-50 border-blue-200 mt-6">
                    <div className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">📊 Historical Data</h4>
                      <div className="text-sm text-blue-800">
                        For detailed session history, see the <strong>Sessions</strong> tab.
                        <br />
                        For vacation history, see the <strong>Vacations</strong> tab.
                        <br />
                        For performance trends, see the <strong>KPIs</strong> tab.
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>

        {/* Comments Section */}
        <CommentsSection
          entityType="yourobc_employee"
          entityId={employeeId}
          title="Employee Notes & HR Comments"
          showInternalComments={true}
        />
        </Card>

        {/* Reminders Section */}
        <RemindersSection
          entityType="yourobc_employee"
          entityId={employeeId}
          title="Employee Reminders"
          status="pending"
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="Delete Employee?"
          entityName={employee?.userProfile?.name || 'Employee'}
          description="This will permanently delete the employee record and all associated data including vacation requests and time entries. This action cannot be undone."
        />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Employees" title="Employee Wiki Helper" />
      </div>
    </div>
  )
}