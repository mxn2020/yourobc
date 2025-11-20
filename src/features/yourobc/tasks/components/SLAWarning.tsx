// src/features/yourobc/tasks/components/SLAWarning.tsx

import { FC, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { TASKS_CONFIG } from '../config/tasks.config'

interface Task {
  _id: string
  title: string
  dueDate?: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface SLAWarningProps {
  task: Task
  compact?: boolean
}

export const SLAWarning: FC<SLAWarningProps> = ({ task, compact = false }) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (!task.dueDate || !TASKS_CONFIG.dashboard.showSlaWarnings) return

    const updateTimer = () => {
      const now = Date.now()
      const remaining = task.dueDate! - now
      setTimeRemaining(remaining)

      // Show warning if within configured time
      const warningThreshold = TASKS_CONFIG.sla.slaWarningMinutes * 60 * 1000
      setShowWarning(remaining <= warningThreshold && remaining > 0)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [task.dueDate])

  if (!task.dueDate) return null

  const isOverdue = timeRemaining !== null && timeRemaining < 0
  const isDueSoon = showWarning && !isOverdue

  const formatTime = (ms: number): string => {
    const absMs = Math.abs(ms)
    const minutes = Math.floor(absMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  if (compact) {
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="animate-pulse">
          Overdue {formatTime(timeRemaining!)}
        </Badge>
      )
    }
    if (isDueSoon) {
      return (
        <Badge variant="warning" className="animate-pulse">
          Due in {formatTime(timeRemaining!)}
        </Badge>
      )
    }
    return (
      <span className="text-xs text-muted-foreground">
        Due in {formatTime(timeRemaining!)}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {isOverdue && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded animate-pulse">
          <span className="text-destructive font-bold">OVERDUE</span>
          <span className="text-destructive/80">{formatTime(timeRemaining!)}</span>
        </div>
      )}
      {isDueSoon && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded animate-pulse">
          <span className="text-yellow-600 font-bold">DUE SOON</span>
          <span className="text-yellow-800">in {formatTime(timeRemaining!)}</span>
        </div>
      )}
      {!isOverdue && !isDueSoon && timeRemaining !== null && (
        <span className="text-sm text-muted-foreground">
          Due in {formatTime(timeRemaining)}
        </span>
      )}
    </div>
  )
}
