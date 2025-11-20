// src/features/yourobc/shipments/components/TimezonedDateTime.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import type { ScheduledTime } from '@/convex/schema/yourobc/base'
import {
  formatDualTimezone,
  formatRelativeTime,
  getTimezoneAbbreviation,
} from '../utils/timezoneUtils'

interface TimezonedDateTimeProps {
  time?: ScheduledTime
  showBerlinTime?: boolean
  showRelative?: boolean
  compact?: boolean
  label?: string
}

export const TimezonedDateTime: FC<TimezonedDateTimeProps> = ({
  time,
  showBerlinTime = true,
  showRelative = false,
  compact = false,
  label,
}) => {
  if (!time) {
    return compact ? (
      <span className="text-xs text-muted-foreground">-</span>
    ) : (
      <div className="text-sm text-muted-foreground">Not set</div>
    )
  }

  const { local, berlin, offset } = formatDualTimezone(time)
  const relative = showRelative ? formatRelativeTime(time.utcTimestamp) : null
  const tzAbbr = getTimezoneAbbreviation(time.timezone, time.utcTimestamp)

  // Compact mode for table cells
  if (compact) {
    return (
      <div className="space-y-0.5">
        {label && <div className="text-xs font-medium text-muted-foreground">{label}</div>}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono">{local}</span>
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {tzAbbr}
          </Badge>
        </div>
        {showBerlinTime && time.timezone !== 'Europe/Berlin' && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono">{berlin}</span>
            <span className="text-xs">DE</span>
          </div>
        )}
        {showRelative && relative && (
          <div className="text-xs text-muted-foreground italic">{relative}</div>
        )}
      </div>
    )
  }

  // Full display mode
  return (
    <div className="space-y-2">
      {label && <h4 className="text-sm font-semibold">{label}</h4>}

      {/* Local Time */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="text-sm font-medium">{local}</div>
          <div className="text-xs text-muted-foreground">
            {time.timezone} ({offset})
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {tzAbbr}
        </Badge>
      </div>

      {/* Berlin Time (if different) */}
      {showBerlinTime && time.timezone !== 'Europe/Berlin' && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="flex-1">
            <div className="text-sm font-medium text-muted-foreground">{berlin}</div>
            <div className="text-xs text-muted-foreground">Europe/Berlin (DE)</div>
          </div>
          <Badge variant="outline" className="text-xs">
            CET
          </Badge>
        </div>
      )}

      {/* Relative Time */}
      {showRelative && relative && (
        <div className="text-xs text-muted-foreground italic pt-1">{relative}</div>
      )}
    </div>
  )
}

/**
 * Compact version for table cells
 */
export const TimezonedDateTimeCompact: FC<TimezonedDateTimeProps> = (props) => {
  return <TimezonedDateTime {...props} compact={true} />
}

/**
 * Display pickup and delivery times side by side
 */
interface PickupDeliveryTimesProps {
  pickupTime?: ScheduledTime
  deliveryTime?: ScheduledTime
  showBerlinTime?: boolean
  compact?: boolean
}

export const PickupDeliveryTimes: FC<PickupDeliveryTimesProps> = ({
  pickupTime,
  deliveryTime,
  showBerlinTime = true,
  compact = false,
}) => {
  if (!pickupTime && !deliveryTime) {
    return compact ? (
      <span className="text-xs text-muted-foreground">-</span>
    ) : (
      <div className="text-sm text-muted-foreground">No times set</div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {pickupTime && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">📤</span>
            <TimezonedDateTimeCompact time={pickupTime} showBerlinTime={showBerlinTime} />
          </div>
        )}
        {deliveryTime && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">📥</span>
            <TimezonedDateTimeCompact time={deliveryTime} showBerlinTime={showBerlinTime} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <TimezonedDateTime
          time={pickupTime}
          label="📤 Pickup Time"
          showBerlinTime={showBerlinTime}
          showRelative={true}
        />
      </div>
      <div>
        <TimezonedDateTime
          time={deliveryTime}
          label="📥 Delivery Time"
          showBerlinTime={showBerlinTime}
          showRelative={true}
        />
      </div>
    </div>
  )
}

/**
 * Helper component for displaying a single date with timezone
 */
interface SimpleDateTimeProps {
  timestamp: number
  timezone?: string
  format?: 'full' | 'date' | 'time'
  showTimezone?: boolean
}

export const SimpleDateTime: FC<SimpleDateTimeProps> = ({
  timestamp,
  timezone = 'Europe/Berlin',
  format = 'full',
  showTimezone = false,
}) => {
  const date = new Date(timestamp)

  let formatted: string
  const options: Intl.DateTimeFormatOptions = { timeZone: timezone }

  switch (format) {
    case 'date':
      formatted = date.toLocaleDateString('de-DE', { ...options, dateStyle: 'medium' })
      break
    case 'time':
      formatted = date.toLocaleTimeString('de-DE', { ...options, timeStyle: 'short' })
      break
    case 'full':
    default:
      formatted = date.toLocaleString('de-DE', {
        ...options,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
  }

  const tzAbbr = showTimezone ? getTimezoneAbbreviation(timezone, timestamp) : null

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-mono">{formatted}</span>
      {tzAbbr && (
        <Badge variant="secondary" className="text-xs px-1 py-0">
          {tzAbbr}
        </Badge>
      )}
    </div>
  )
}
