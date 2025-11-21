// src/features/yourobc/employees/components/WorkHoursSummary.tsx

import { FC, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, Button, Badge, Loading } from '@/components/ui'
import { Calendar, TrendingUp, Clock } from 'lucide-react'

interface WorkHoursSummaryProps {
  employeeId: Id<'yourobcEmployees'>
}

export const WorkHoursSummary: FC<WorkHoursSummaryProps> = ({ employeeId }) => {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)

  const monthlyHours = useQuery(api.lib.yourobc.employees.sessions.queries.getMonthlyWorkHours, {
    employeeId,
    year: selectedYear,
    month: selectedMonth,
  })

  const sessionStats = useQuery(api.lib.yourobc.employees.sessions.queries.getSessionStats, {
    employeeId,
    year: selectedYear,
    month: selectedMonth,
  })

  const formatHours = (hours: number) => {
    return hours.toFixed(1) + 'h'
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

  const handleCurrentMonth = () => {
    setSelectedYear(currentDate.getFullYear())
    setSelectedMonth(currentDate.getMonth() + 1)
  }

  if (monthlyHours === undefined || sessionStats === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loading size="lg" />
      </div>
    )
  }

  const hoursPercentage = monthlyHours.expectedHours > 0
    ? (monthlyHours.netHours / monthlyHours.expectedHours) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
            ← Previous
          </Button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-lg">
              {getMonthName(selectedMonth)} {selectedYear}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCurrentMonth}>
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
              Next →
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Total Hours</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatHours(monthlyHours.totalHours)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {monthlyHours.totalMinutes} minutes
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">Net Hours</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatHours(monthlyHours.netHours)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Excluding breaks
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-700 font-medium">Regular Hours</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {formatHours(monthlyHours.regularHours)}
          </div>
          {monthlyHours.overtimeHours > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              +{formatHours(monthlyHours.overtimeHours)} overtime
            </div>
          )}
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700 font-medium">Days Worked</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {monthlyHours.daysWorked}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {monthlyHours.sessionCount} sessions
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Monthly Progress
          </span>
          <span className="text-sm text-gray-600">
            {formatHours(monthlyHours.netHours)} / {formatHours(monthlyHours.expectedHours)}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              hoursPercentage >= 100
                ? 'bg-green-500'
                : hoursPercentage >= 80
                ? 'bg-blue-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(hoursPercentage, 100)}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <span>0%</span>
          <span className="font-medium">{hoursPercentage.toFixed(0)}%</span>
          <span>100%</span>
        </div>

        {hoursPercentage >= 100 && (
          <div className="mt-3 text-center">
            <Badge variant="success">✓ Monthly target achieved!</Badge>
          </div>
        )}
      </Card>

      {/* Session Statistics */}
      {sessionStats && (
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Session Statistics</h4>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {sessionStats.totalSessions}
              </div>
              <div className="text-xs text-gray-600">Total Sessions</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {formatHours(sessionStats.averageSessionDuration / 60)}
              </div>
              <div className="text-xs text-gray-600">Avg. Session</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {formatHours(sessionStats.longestSession / 60)}
              </div>
              <div className="text-xs text-gray-600">Longest Session</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {formatHours(monthlyHours.breakMinutes / 60)}
              </div>
              <div className="text-xs text-gray-600">Total Breaks</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {(monthlyHours.netHours / monthlyHours.daysWorked || 0).toFixed(1)}h
              </div>
              <div className="text-xs text-gray-600">Avg. Daily Hours</div>
            </div>

            {monthlyHours.overtimeHours > 0 && (
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {formatHours(monthlyHours.overtimeHours)}
                </div>
                <div className="text-xs text-gray-600">Overtime</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Days Breakdown */}
      {sessionStats?.sessionsByDay && Object.keys(sessionStats.sessionsByDay).length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Sessions by Day</h4>

          <div className="grid grid-cols-7 gap-2">
            {(Object.entries(sessionStats.sessionsByDay) as [string, number][]).map(([day, count]) => (
              <div
                key={day}
                className="text-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="text-xs text-gray-500 mb-1">{day}</div>
                <div className="text-sm font-semibold text-gray-900">{count}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
