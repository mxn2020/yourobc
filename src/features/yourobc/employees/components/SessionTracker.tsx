// src/features/yourobc/employees/components/SessionTracker.tsx

import { FC, useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, Button, Badge, Loading } from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import { Clock, Play, Pause, Coffee, LogOut } from 'lucide-react'

interface SessionTrackerProps {
  employeeId: Id<'yourobcEmployees'>
}

export const SessionTracker: FC<SessionTrackerProps> = ({ employeeId }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const toast = useToast()

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const activeSession = useQuery(api.lib.yourobc.employees.sessions.queries.getActiveSession, {
    employeeId,
  })

  const startSession = useMutation(api.lib.yourobc.employees.sessions.mutations.startSession)
  const endSession = useMutation(api.lib.yourobc.employees.sessions.mutations.endSession)
  const startBreak = useMutation(api.lib.yourobc.employees.sessions.mutations.startBreak)
  const endBreak = useMutation(api.lib.yourobc.employees.sessions.mutations.endBreak)
  const updateActivity = useMutation(api.lib.yourobc.employees.sessions.mutations.updateActivity)

  // Heartbeat to update activity every 5 minutes when session is active
  useEffect(() => {
    if (!activeSession) return

    const interval = setInterval(async () => {
      try {
        await updateActivity({ employeeId })
      } catch (error) {
        console.error('Failed to update activity:', error)
      }
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [activeSession, updateActivity, employeeId])

  const handleStartSession = async () => {
    try {
      await startSession({ employeeId })
      toast.success('Session started successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to start session')
    }
  }

  const handleEndSession = async () => {
    if (!activeSession) return
    try {
      await endSession({ employeeId })
      toast.success('Session ended successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to end session')
    }
  }

  const handleStartBreak = async (type: 'lunch' | 'coffee' | 'personal' | 'meeting') => {
    if (!activeSession) return
    try {
      await startBreak({ employeeId, type })
      toast.success('Break started')
    } catch (error: any) {
      toast.error(error.message || 'Failed to start break')
    }
  }

  const handleEndBreak = async () => {
    if (!activeSession) return
    try {
      await endBreak({ employeeId })
      toast.success('Break ended')
    } catch (error: any) {
      toast.error(error.message || 'Failed to end break')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const calculateCurrentDuration = () => {
    if (!activeSession) return 0
    const startTime = activeSession.loginTime
    const now = Date.now()
    return Math.floor((now - startTime) / (60 * 1000)) // Convert to minutes
  }

  const getCurrentBreak = () => {
    if (!activeSession?.breaks) return null
    return activeSession.breaks.find((b: NonNullable<typeof activeSession>['breaks'][number]) => !b.endTime)
  }

  const currentBreak = getCurrentBreak()
  const currentDuration = calculateCurrentDuration()

  if (activeSession === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Work Session
        </h3>
        <div className="text-sm text-gray-500">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      {!activeSession ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No active session</div>
          <Button
            variant="primary"
            onClick={handleStartSession}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            Start Work Session
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Session Status */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div className="text-sm text-green-700 font-medium mb-1">
                {currentBreak ? 'On Break' : 'Working'}
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatDuration(currentDuration)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Started: {new Date(activeSession.loginTime).toLocaleTimeString()}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {currentBreak ? (
                <Badge variant="warning" className="text-sm">
                  {currentBreak.type.toUpperCase()} BREAK
                </Badge>
              ) : (
                <Badge variant="success" className="text-sm">
                  ACTIVE
                </Badge>
              )}

              {activeSession.inactivityStartTime && (
                <Badge variant="danger" className="text-sm">
                  INACTIVE
                </Badge>
              )}
            </div>
          </div>

          {/* Break Controls */}
          {!currentBreak ? (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">
                Take a Break
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartBreak('lunch')}
                  className="gap-2"
                >
                  🍽️ Lunch
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartBreak('coffee')}
                  className="gap-2"
                >
                  <Coffee className="w-4 h-4" />
                  Coffee
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartBreak('personal')}
                  className="gap-2"
                >
                  👤 Personal
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartBreak('meeting')}
                  className="gap-2"
                >
                  📅 Meeting
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Button
                variant="warning"
                onClick={handleEndBreak}
                className="w-full gap-2"
              >
                <Pause className="w-4 h-4" />
                End {currentBreak.type} Break
              </Button>
            </div>
          )}

          {/* Today's Breaks */}
          {activeSession.breaks && activeSession.breaks.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Today's Breaks ({activeSession.breaks.length})
              </div>
              <div className="space-y-1">
                {activeSession.breaks.map((breakItem: NonNullable<typeof activeSession>['breaks'][number], index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                  >
                    <span className="text-gray-600 capitalize">
                      {breakItem.type}
                    </span>
                    <span className="text-gray-500">
                      {breakItem.duration
                        ? formatDuration(breakItem.duration)
                        : 'In progress...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* End Session */}
          <Button
            variant="danger"
            onClick={handleEndSession}
            className="w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            End Work Session
          </Button>
        </div>
      )}
    </Card>
  )
}
