// src/features/yourobc/shipments/components/SLAWarningBanner.tsx

import { FC } from 'react'
import { AlertTriangle, Clock, X } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface SLAWarning {
  shipmentId: string
  shipmentNumber: string
  customerName: string
  deadline: number
  remainingMinutes: number
  currentStatus: string
  priority: 'standard' | 'urgent' | 'critical'
}

interface SLAWarningBannerProps {
  warnings: SLAWarning[]
  onDismiss?: () => void
  compact?: boolean
}

export const SLAWarningBanner: FC<SLAWarningBannerProps> = ({
  warnings,
  onDismiss,
  compact = false,
}) => {
  if (warnings.length === 0) {
    return null
  }

  const criticalWarnings = warnings.filter((w) => w.remainingMinutes < 5)
  const urgentWarnings = warnings.filter((w) => w.remainingMinutes >= 5 && w.remainingMinutes < 15)

  const getAlertVariant = () => {
    if (criticalWarnings.length > 0) return 'destructive'
    return 'default'
  }

  const getIcon = () => {
    if (criticalWarnings.length > 0) {
      return <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
    }
    return <Clock className="h-5 w-5 text-yellow-600" />
  }

  const getTitle = () => {
    if (criticalWarnings.length > 0) {
      return `⚠️ ${criticalWarnings.length} Critical SLA Warning${criticalWarnings.length > 1 ? 's' : ''}`
    }
    return `⏰ ${warnings.length} SLA Warning${warnings.length > 1 ? 's' : ''}`
  }

  if (compact) {
    return (
      <Alert variant={getAlertVariant()} className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <AlertTitle className="mb-0">{getTitle()}</AlertTitle>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/yourobc/shipments" search={{ filter: 'sla-warning' }}>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </Link>
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Alert>
    )
  }

  return (
    <Alert variant={getAlertVariant()} className="mb-6">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <AlertTitle>{getTitle()}</AlertTitle>
          <AlertDescription className="mt-2">
            {criticalWarnings.length > 0 && (
              <div className="mb-3">
                <span className="text-sm font-semibold text-red-600">
                  Critical (&lt; 5 minutes):
                </span>
                <div className="mt-2 space-y-2">
                  {criticalWarnings.slice(0, 3).map((warning) => (
                    <Link
                      key={warning.shipmentId}
                      to="/yourobc/shipments/$shipmentId"
                      params={{ shipmentId: warning.shipmentId }}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="font-mono">
                            {warning.shipmentNumber}
                          </Badge>
                          <span className="text-sm font-medium">{warning.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            warning.priority === 'critical' && 'border-red-600 text-red-600',
                            warning.priority === 'urgent' && 'border-orange-600 text-orange-600'
                          )}>
                            {warning.priority}
                          </Badge>
                          <span className="text-sm font-mono font-semibold text-red-600">
                            {warning.remainingMinutes}m left
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {criticalWarnings.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{criticalWarnings.length - 3} more critical warnings
                    </p>
                  )}
                </div>
              </div>
            )}

            {urgentWarnings.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-yellow-700">
                  Approaching (&lt; 15 minutes):
                </span>
                <div className="mt-2 space-y-2">
                  {urgentWarnings.slice(0, 3).map((warning) => (
                    <Link
                      key={warning.shipmentId}
                      to="/yourobc/shipments/$shipmentId"
                      params={{ shipmentId: warning.shipmentId }}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200 hover:bg-yellow-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            {warning.shipmentNumber}
                          </Badge>
                          <span className="text-sm font-medium">{warning.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{warning.priority}</Badge>
                          <span className="text-sm font-mono font-semibold text-yellow-700">
                            {warning.remainingMinutes}m left
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {urgentWarnings.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{urgentWarnings.length - 3} more warnings
                    </p>
                  )}
                </div>
              </div>
            )}
          </AlertDescription>
        </div>
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  )
}

/**
 * Compact version for dashboard widgets
 */
export const SLAWarningWidget: FC<{ warnings: SLAWarning[] }> = ({ warnings }) => {
  if (warnings.length === 0) {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">All SLAs on track</span>
        </div>
      </div>
    )
  }

  const critical = warnings.filter((w) => w.remainingMinutes < 5).length
  const urgent = warnings.filter((w) => w.remainingMinutes >= 5 && w.remainingMinutes < 15).length

  return (
    <Link to="/yourobc/shipments" search={{ filter: 'sla-warning' }}>
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(
              'h-5 w-5',
              critical > 0 ? 'text-red-600 animate-pulse' : 'text-yellow-600'
            )} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {warnings.length} SLA Warning{warnings.length > 1 ? 's' : ''}
              </span>
              <span className="text-xs text-muted-foreground">
                {critical > 0 && `${critical} critical`}
                {critical > 0 && urgent > 0 && ', '}
                {urgent > 0 && `${urgent} approaching`}
              </span>
            </div>
          </div>
          <Badge variant={critical > 0 ? 'destructive' : 'secondary'}>
            View
          </Badge>
        </div>
      </div>
    </Link>
  )
}
