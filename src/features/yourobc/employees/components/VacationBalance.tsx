// src/features/yourobc/employees/components/VacationBalance.tsx

import { FC } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, Badge, Button, Loading, Progress } from '@/components/ui'
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface VacationBalanceProps {
  employeeId: Id<'yourobcEmployees'>
}

export const VacationBalance: FC<VacationBalanceProps> = ({ employeeId }) => {
  const currentYear = new Date().getFullYear()

  const balance = useQuery(api.lib.yourobc.employees.vacations.queries.getVacationBalance, {
    employeeId,
    year: currentYear,
  })

  const upcomingVacations = useQuery(
    api.lib.yourobc.employees.vacations.queries.getUpcomingVacations,
    {
      employeeId,
    }
  )

  const statistics = useQuery(api.lib.yourobc.employees.vacations.queries.getVacationStatistics, {
    employeeId,
    year: currentYear,
  })

  if (balance === undefined || statistics === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loading size="lg" />
      </div>
    )
  }

  if (!balance) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 mb-4">No vacation balance for {currentYear}</div>
        <p className="text-sm text-gray-400 mb-4">
          Vacation balance will be created automatically based on hire date.
        </p>
      </Card>
    )
  }

  const usagePercentage = balance.available > 0 ? (balance.used / balance.available) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Available</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{balance.available}</div>
          <div className="text-xs text-blue-600 mt-1">days total</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-700 font-medium">Used</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-900">{balance.used}</div>
          <div className="text-xs text-orange-600 mt-1">days taken</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-yellow-700 font-medium">Pending</span>
            <AlertCircle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-900">{balance.pending}</div>
          <div className="text-xs text-yellow-600 mt-1">awaiting approval</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">Remaining</span>
          </div>
          <div className="text-3xl font-bold text-green-900">{balance.remaining}</div>
          <div className="text-xs text-green-600 mt-1">available to book</div>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Annual Usage</span>
          <span className="text-sm text-gray-600">
            {balance.used} / {balance.available} days ({usagePercentage.toFixed(0)}%)
          </span>
        </div>

        <Progress value={usagePercentage} className="mb-2" />

        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <div>
            Annual Entitlement: {balance.annualEntitlement} days
            {balance.carryoverDays > 0 && (
              <span className="ml-2 text-blue-600">+ {balance.carryoverDays} carryover</span>
            )}
          </div>
          {balance.calculationDate && (
            <div>
              Last updated: {new Date(balance.calculationDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </Card>

      {/* Request Button */}
      <Card className="p-4 bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-blue-900 mb-1">
              Plan Your Next Vacation
            </div>
            <div className="text-sm text-blue-700">
              {balance.remaining} days available to request
            </div>
          </div>
          <Link to="/{-$locale}/yourobc/employees/vacations/new" search={{ employeeId }}>
            <Button variant="primary">
              + Request Vacation
            </Button>
          </Link>
        </div>
      </Card>

      {/* Upcoming Vacations */}
      {upcomingVacations && upcomingVacations.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Upcoming Vacations</h4>

          <div className="space-y-3">
            {upcomingVacations.slice(0, 5).map((vacation: NonNullable<typeof upcomingVacations>[number]) => (
              <div
                key={vacation.entryId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    {new Date(vacation.startDate).toLocaleDateString()} -{' '}
                    {new Date(vacation.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {vacation.days} day{vacation.days !== 1 ? 's' : ''} •{' '}
                    <span className="capitalize">{vacation.type}</span>
                  </div>
                </div>
                <Badge variant="success">Approved</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Statistics */}
      {statistics && (
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Vacation Statistics ({currentYear})</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {statistics.totalRequests}
              </div>
              <div className="text-xs text-gray-600">Total Requests</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {statistics.approvedRequests}
              </div>
              <div className="text-xs text-gray-600">Approved</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {statistics.pendingRequests}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {statistics.rejectedRequests}
              </div>
              <div className="text-xs text-gray-600">Rejected</div>
            </div>
          </div>

          {/* Days by Type */}
          {Object.keys(statistics.daysByType).length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Days by Type
              </div>
              <div className="space-y-2">
                {(Object.entries(statistics.daysByType) as [string, number][]).map(([type, days]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{type}</span>
                    <span className="font-medium text-gray-900">{days} days</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
