// src/features/yourobc/dashboard/components/YourOBCAlerts.tsx

import React, { useState, useMemo } from 'react'
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Package, 
  FileText, 
  Users, 
  Truck, 
  CheckCircle,
  X,
  Eye,
  ExternalLink,
  Filter,
  Bell,
  BellOff,
  AlertCircle,
  Info,
  Shield
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { YourOBCAlert, AlertSeverity } from '../types'

interface YourOBCAlertsProps {
  alerts: YourOBCAlert[]
  isLoading?: boolean
  error?: Error | null
  onAcknowledge?: (alertId: string) => void
  onAction?: (url: string) => void
  showFilters?: boolean
  compact?: boolean
  maxVisible?: number
}

type AlertFilter = 'all' | AlertSeverity | 'unacknowledged'

export function YourOBCAlerts({ 
  alerts = [],
  isLoading = false,
  error = null,
  onAcknowledge,
  onAction,
  showFilters = true,
  compact = false,
  maxVisible = 10
}: YourOBCAlertsProps) {
  const [filter, setFilter] = useState<AlertFilter>('all')
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  const getAlertIcon = (type: YourOBCAlert['type']) => {
    switch (type) {
      case 'overdue':
        return Clock
      case 'expiring':
        return AlertTriangle
      case 'payment':
        return DollarSign
      case 'sla':
        return Shield
      case 'performance':
        return Users
      case 'system':
        return AlertCircle
      default:
        return Info
    }
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'yourobcCustomers':
        return Users
      case 'yourobcQuotes':
        return FileText
      case 'yourobcShipments':
        return Package
      case 'yourobcInvoices':
        return DollarSign
      case 'yourobcPartners':
        return Users
      case 'couriers':
        return Truck
      default:
        return Info
    }
  }

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredAlerts = useMemo(() => {
    let filtered = alerts

    // Apply severity/status filter
    if (filter !== 'all') {
      if (filter === 'unacknowledged') {
        filtered = filtered.filter(alert => !alert.acknowledged)
      } else {
        filtered = filtered.filter(alert => alert.severity === filter)
      }
    }

    // Apply acknowledged filter
    if (!showAcknowledged) {
      filtered = filtered.filter(alert => !alert.acknowledged)
    }

    // Sort by severity and creation date
    return filtered
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
        if (severityDiff !== 0) return severityDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, maxVisible)
  }, [alerts, filter, showAcknowledged, maxVisible])

  const alertCounts = useMemo(() => {
    const counts = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
      high: alerts.filter(a => a.severity === 'high' && !a.acknowledged).length,
      medium: alerts.filter(a => a.severity === 'medium' && !a.acknowledged).length,
      low: alerts.filter(a => a.severity === 'low' && !a.acknowledged).length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length
    }
    return counts
  }, [alerts])

  const handleAcknowledge = (alertId: string) => {
    if (onAcknowledge) {
      onAcknowledge(alertId)
    }
  }

  const handleAction = (url: string) => {
    if (onAction) {
      onAction(url)
    }
  }

  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date()
    const alertTime = new Date(timestamp)
    const diffMs = now.getTime() - alertTime.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (error) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load alerts</p>
            <p className="text-sm text-gray-500 mt-1">{error.message}</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="p-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                System Alerts
              </h2>
              {alertCounts.unacknowledged > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {alertCounts.unacknowledged} active
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {showFilters && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAcknowledged(!showAcknowledged)}
                  >
                    {showAcknowledged ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  </Button>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as AlertFilter)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Alerts ({alertCounts.total})</option>
                    <option value="unacknowledged">Unacknowledged ({alertCounts.unacknowledged})</option>
                    <option value="critical">Critical ({alertCounts.critical})</option>
                    <option value="high">High ({alertCounts.high})</option>
                    <option value="medium">Medium ({alertCounts.medium})</option>
                    <option value="low">Low ({alertCounts.low})</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {!compact && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {[
                { label: 'Critical', count: alertCounts.critical, color: 'text-red-600 bg-red-50' },
                { label: 'High', count: alertCounts.high, color: 'text-orange-600 bg-orange-50' },
                { label: 'Medium', count: alertCounts.medium, color: 'text-yellow-600 bg-yellow-50' },
                { label: 'Low', count: alertCounts.low, color: 'text-blue-600 bg-blue-50' }
              ].map((stat) => (
                <div key={stat.label} className={`p-3 rounded-lg ${stat.color}`}>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">No alerts to show</p>
              <p className="text-gray-500">
                {filter === 'all' ? 'All systems are running smoothly' : 'No alerts match the current filter'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAlerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.type)
                const ModuleIcon = getModuleIcon(alert.module)
                
                return (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      alert.acknowledged ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Alert Icon */}
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        alert.severity === 'critical' ? 'bg-red-100' :
                        alert.severity === 'high' ? 'bg-orange-100' :
                        alert.severity === 'medium' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <AlertIcon className={`h-4 w-4 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {alert.title}
                              </h3>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                                {getSeverityIcon(alert.severity)}
                                <span className="ml-1">{alert.severity}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <ModuleIcon className="h-3 w-3" />
                                <span className="capitalize">{alert.module}</span>
                              </div>
                              <span>{formatRelativeTime(alert.createdAt)}</span>
                              {alert.count && (
                                <span className="font-medium">{alert.count} items</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {alert.actionUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(alert.actionUrl!)}
                                className="flex items-center space-x-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>{alert.action || 'View'}</span>
                              </Button>
                            )}
                            
                            {!alert.acknowledged && onAcknowledge && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAcknowledge(alert.id)}
                                className="flex items-center space-x-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Acknowledge</span>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Acknowledged Status */}
                        {alert.acknowledged && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>
                                Acknowledged by {alert.acknowledgedBy} on{' '}
                                {alert.acknowledgedAt && new Date(alert.acknowledgedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredAlerts.length > 0 && alerts.length > maxVisible && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-center text-sm text-gray-600">
              Showing {filteredAlerts.length} of {alerts.length} alerts
              {filter !== 'all' && ` (filtered)`}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}