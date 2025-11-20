// src/features/yourobc/shipments/components/SLAIndicator.tsx

import { FC, useState, useEffect } from 'react'
import { Circle, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface SLAIndicatorProps {
  deadline: number
  compact?: boolean
  showCountdown?: boolean
}

const calculateTimeRemaining = (deadline: number) => {
  const now = Date.now()
  const diff = deadline - now

  if (diff < 0) {
    // Overdue
    const absDiff = Math.abs(diff)
    const hours = Math.floor(absDiff / (1000 * 60 * 60))
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60))
    return {
      status: 'overdue' as const,
      hours,
      minutes,
      totalMinutes: Math.floor(absDiff / (1000 * 60)),
      isOverdue: true,
      isWarning: false,
    }
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const totalMinutes = Math.floor(diff / (1000 * 60))

  const isWarning = totalMinutes < 15
  const status = isWarning ? ('warning' as const) : ('on_time' as const)

  return {
    status,
    hours,
    minutes,
    totalMinutes,
    isOverdue: false,
    isWarning,
  }
}

export const SLAIndicator: FC<SLAIndicatorProps> = ({
  deadline,
  compact = false,
  showCountdown = true,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(deadline))

  useEffect(() => {
    // Update every second for real-time countdown
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline))
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  const getStatusIcon = () => {
    switch (timeRemaining.status) {
      case 'on_time':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (timeRemaining.status) {
      case 'on_time':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'overdue':
        return 'bg-red-500'
    }
  }

  const getStatusBadgeVariant = (): 'primary' | 'secondary' | 'destructive' | 'outline' => {
    switch (timeRemaining.status) {
      case 'on_time':
        return 'primary'
      case 'warning':
        return 'secondary'
      case 'overdue':
        return 'destructive'
    }
  }

  const formatCountdown = () => {
    const { hours, minutes, isOverdue } = timeRemaining

    if (hours > 0) {
      return `${isOverdue ? '+' : ''}${hours}h ${minutes}m`
    }
    return `${isOverdue ? '+' : ''}${minutes}m`
  }

  const formatDeadline = () => {
    const date = new Date(deadline)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1" title={`SLA Deadline: ${formatDeadline()}`}>
        <Circle className={cn('h-2 w-2', getStatusColor())} fill="currentColor" />
        {showCountdown && (
          <span className="text-xs font-mono">{formatCountdown()}</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {timeRemaining.isOverdue ? 'Overdue' : timeRemaining.isWarning ? 'Warning' : 'On Time'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDeadline()}
          </span>
        </div>
      </div>

      {showCountdown && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className={cn(
              'text-sm font-mono font-semibold',
              timeRemaining.isOverdue && 'text-red-600',
              timeRemaining.isWarning && 'text-yellow-600',
              !timeRemaining.isOverdue && !timeRemaining.isWarning && 'text-green-600'
            )}>
              {formatCountdown()}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeRemaining.isOverdue ? 'overdue' : 'remaining'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Traffic light badge version - shows just the status dot
 */
export const SLAStatusLight: FC<{ deadline: number }> = ({ deadline }) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(deadline))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline))
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  const getColor = () => {
    switch (timeRemaining.status) {
      case 'on_time':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500 animate-pulse'
      case 'overdue':
        return 'bg-red-500 animate-pulse'
    }
  }

  return (
    <Circle className={cn('h-3 w-3', getColor())} fill="currentColor" />
  )
}

/**
 * Badge version for tables
 */
export const SLABadge: FC<{ deadline: number }> = ({ deadline }) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(deadline))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline))
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  const getVariant = (): 'primary' | 'secondary' | 'destructive' => {
    switch (timeRemaining.status) {
      case 'on_time':
        return 'primary'
      case 'warning':
        return 'secondary'
      case 'overdue':
        return 'destructive'
    }
  }

  const formatText = () => {
    const { hours, minutes, isOverdue, isWarning } = timeRemaining

    if (isOverdue) {
      return hours > 0 ? `Overdue ${hours}h ${minutes}m` : `Overdue ${minutes}m`
    }

    if (isWarning) {
      return `${minutes}m left`
    }

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <Badge variant={getVariant()} className="font-mono text-xs">
      {formatText()}
    </Badge>
  )
}
