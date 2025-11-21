// src/features/yourobc/employees/components/OnlineStatusWidget.tsx
/**
 * Online Status Widget
 *
 * Displays list of currently online employees.
 * As per YOUROBC.md: Show "Who is online" feature for team awareness.
 */

import { FC, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/generated/api'
import { Card, Badge } from '@/components/ui'
import { CompoundAvatar } from '@/components/ui/Avatar'
import { useAuthenticatedUser } from '@/features/system/auth'
import { EMPLOYEES_CONFIG } from '../config'

interface OnlineStatusWidgetProps {
  maxDisplay?: number
  showDepartment?: boolean
}

export const OnlineStatusWidget: FC<OnlineStatusWidgetProps> = ({
  maxDisplay = 5,
  showDepartment = true,
}) => {
  const authUser = useAuthenticatedUser()

  const onlineEmployees = useQuery(
    api.lib.yourobc.employees.onlineStatus.queries.getOnlineEmployees,
    authUser ? { authUserId: authUser.id } : 'skip'
  )

  const updateActivity = useMutation(
    api.lib.yourobc.employees.onlineStatus.mutations.updateActivity
  )

  // Update activity every 5 minutes to maintain online status
  useEffect(() => {
    if (!authUser) return

    const interval = setInterval(() => {
      updateActivity({ authUserId: authUser.id }).catch((error) => {
        console.error('Failed to update activity:', error)
      })
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [authUser, updateActivity])

  // Don't show if feature is disabled
  if (!EMPLOYEES_CONFIG.core.employeeProfiles) return null

  // Don't show if no data or empty
  if (!onlineEmployees || onlineEmployees.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">🟢 Online Now</h3>
          <Badge variant="secondary" size="sm">
            0
          </Badge>
        </div>
        <div className="text-sm text-gray-500 text-center py-4">
          No employees currently online
        </div>
      </Card>
    )
  }

  // Get employees to display (limited by maxDisplay)
  const displayEmployees = onlineEmployees.slice(0, maxDisplay)
  const remainingCount = onlineEmployees.length - maxDisplay

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">🟢 Online Now</h3>
        <Badge variant="success" size="sm">
          {onlineEmployees.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {displayEmployees.map((employee) => (
          <div
            key={employee._id}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors"
          >
            {/* Online indicator */}
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />

            {/* Avatar */}
            <CompoundAvatar
              src={employee.userProfile?.avatar}
              alt={employee.displayName}
              name={employee.displayName}
              size="sm"
            />

            {/* Employee info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {employee.displayName}
              </div>
              {showDepartment && employee.department && (
                <div className="text-xs text-gray-500 truncate">
                  {employee.department}
                </div>
              )}
            </div>

            {/* Last activity indicator (optional) */}
            {employee.lastActivity && (
              <div className="text-xs text-gray-400 flex-shrink-0">
                {formatLastActivity(employee.lastActivity)}
              </div>
            )}
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            +{remainingCount} more online
          </div>
        )}
      </div>
    </Card>
  )
}

/**
 * Format last activity timestamp into a human-readable string
 */
function formatLastActivity(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * Compact version of the widget for dashboard use
 */
export const OnlineStatusCompact: FC = () => {
  const authUser = useAuthenticatedUser()

  const onlineCount = useQuery(
    api.lib.yourobc.employees.onlineStatus.queries.getOnlineCountByDepartment,
    authUser ? { authUserId: authUser.id } : 'skip'
  )

  if (!EMPLOYEES_CONFIG.core.employeeProfiles) return null
  if (!onlineCount) return null

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {onlineCount.total}
          </div>
          <div className="text-sm text-gray-500">Online Now</div>
        </div>
      </div>
    </Card>
  )
}
