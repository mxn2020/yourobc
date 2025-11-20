// src/features/yourobc/shipments/components/TimezoneTimes.tsx

import { FC } from 'react'
import { Clock } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'

interface TimezoneTimesProps {
  localTime: number
  berlinTime: number
  timezone: string
  label?: string
  compact?: boolean
}

export const TimezoneTimes: FC<TimezoneTimesProps> = ({
  localTime,
  berlinTime,
  timezone,
  label,
  compact = false,
}) => {
  const formatTime = (timestamp: number, tz: string) => {
    return formatInTimeZone(new Date(timestamp), tz, 'MMM d, HH:mm')
  }

  const formatTimeShort = (timestamp: number, tz: string) => {
    return formatInTimeZone(new Date(timestamp), tz, 'HH:mm')
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="font-medium">{formatTimeShort(localTime, timezone)}</span>
          <span className="text-xs text-muted-foreground">
            {formatTimeShort(berlinTime, 'Europe/Berlin')} DE
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
      <div className="flex items-start gap-2">
        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Local:</span>
            <span className="text-sm">{formatTime(localTime, timezone)}</span>
            <span className="text-xs text-muted-foreground">{timezone}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Berlin:</span>
            <span className="text-sm">{formatTime(berlinTime, 'Europe/Berlin')}</span>
            <span className="text-xs text-muted-foreground">Europe/Berlin</span>
          </div>
        </div>
      </div>
    </div>
  )
}
