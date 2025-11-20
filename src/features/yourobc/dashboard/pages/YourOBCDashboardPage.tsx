// src/features/yourobc/dashboard/pages/YourOBCDashboardPage.tsx

import React, { useState, useCallback } from 'react'
import { 
  RefreshCw, 
  BarChart3, 
  Settings, 
  Download, 
  Calendar,
  Filter,
  Layout,
  Maximize2,
  Minimize2,
  Bell,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useYourOBCDashboard } from '../hooks/useYourOBCDashboard'
import { YourOBCOverview } from '../components/YourOBCOverview'
import { YourOBCMetrics } from '../components/YourOBCMetrics'
import { YourOBCAlerts } from '../components/YourOBCAlerts'
import { YourOBCRecentActivity } from '../components/YourOBCRecentActivity'
import { YourOBCQuickActions } from '../components/YourOBCQuickActions'
import type { MetricsPeriod, DashboardConfig } from '../types'

interface YourOBCDashboardPageProps {
  userRole?: string
  defaultConfig?: Partial<DashboardConfig>
}

export function YourOBCDashboardPage({ 
  userRole = 'user',
  defaultConfig = {}
}: YourOBCDashboardPageProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const dashboardConfig: DashboardConfig = {
    defaultPeriod: 'week',
    autoRefresh: true,
    userRole,
    activityLimit: 20,
    includePerformanceData: true,
    includeTrendData: true,
    trendMetrics: ['revenue', 'yourobcCustomers', 'satisfaction'],
    theme: 'light',
    compactMode: false,
    ...defaultConfig
  }

  const {
    overview,
    metrics,
    activities,
    alerts,
    quickActions,
    performanceData,
    trendData,
    selectedPeriod,
    isLoading,
    isRefreshing,
    lastRefresh,
    errors,
    hasErrors,
    criticalAlertsCount,
    unacknowledgedAlertsCount,
    recentActivitiesCount,
    changePeriod,
    acknowledgeAlert,
    refreshDashboard,
    isAcknowledgingAlert
  } = useYourOBCDashboard(dashboardConfig)

  const handlePeriodChange = useCallback((period: MetricsPeriod) => {
    changePeriod(period)
  }, [changePeriod])

  const handleRefresh = useCallback(() => {
    refreshDashboard()
  }, [refreshDashboard])

  const handleAlertAcknowledge = useCallback((alertId: string) => {
    acknowledgeAlert(alertId)
  }, [acknowledgeAlert])

  const handleSectionExpand = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const handleExport = () => {
    // Implementation for dashboard export
    console.log('Exporting dashboard data...')
  }

  const periodOptions: Array<{ value: MetricsPeriod; label: string }> = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ]

  const formatLastRefresh = (date: Date): string => {
    return `Last updated: ${date.toLocaleTimeString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">YourOBC Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive view of your customer relationship management
              </p>
              {lastRefresh && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatLastRefresh(lastRefresh)}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value as MetricsPeriod)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </div>
          </div>

          {/* Status Bar */}
          {(hasErrors || criticalAlertsCount > 0 || isLoading) && (
            <div className="mt-4 flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-4">
                {hasErrors && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Some data failed to load</span>
                  </div>
                )}
                
                {criticalAlertsCount > 0 && (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">{criticalAlertsCount} critical alerts</span>
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading dashboard data...</span>
                  </div>
                )}
                
                {!hasErrors && !isLoading && criticalAlertsCount === 0 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">All systems operational</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                {recentActivitiesCount > 0 && `${recentActivitiesCount} recent activities`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Overview Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Overview</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSectionExpand('overview')}
            >
              {expandedSection === 'overview' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          
          <YourOBCOverview
            data={overview}
            isLoading={isLoading}
            error={errors.overview}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Metrics and Performance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSectionExpand('metrics')}
                >
                  {expandedSection === 'metrics' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              
              <YourOBCMetrics
                data={metrics}
                isLoading={isLoading}
                error={errors.metrics}
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
              />
            </section>

            {/* Recent Activity Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Recent Activity</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSectionExpand('activity')}
                >
                  {expandedSection === 'activity' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              
              <YourOBCRecentActivity
                activities={activities || []}
                isLoading={isLoading}
                error={errors.activities}
                onRefresh={handleRefresh}
                showFilters={true}
                maxVisible={expandedSection === 'activity' ? 50 : 10}
              />
            </section>
          </div>

          {/* Right Column - Alerts and Quick Actions */}
          <div className="space-y-6">
            {/* Alerts Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>System Alerts</span>
                  {unacknowledgedAlertsCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {unacknowledgedAlertsCount}
                    </span>
                  )}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSectionExpand('alerts')}
                >
                  {expandedSection === 'alerts' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              
              <YourOBCAlerts
                alerts={alerts || []}
                isLoading={isLoading}
                error={errors.alerts}
                onAcknowledge={handleAlertAcknowledge}
                showFilters={expandedSection === 'alerts'}
                compact={expandedSection !== 'alerts'}
                maxVisible={expandedSection === 'alerts' ? 20 : 5}
              />
            </section>

            {/* Quick Actions Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Layout className="h-5 w-5" />
                  <span>Quick Actions</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSectionExpand('actions')}
                >
                  {expandedSection === 'actions' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              
              <YourOBCQuickActions
                actions={quickActions || []}
                isLoading={isLoading}
                error={errors.quickActions}
                layout={expandedSection === 'actions' ? 'grid' : 'list'}
                showSearch={expandedSection === 'actions'}
                showCategories={expandedSection === 'actions'}
                maxVisible={expandedSection === 'actions' ? 16 : 8}
                userRole={userRole}
              />
            </section>
          </div>
        </div>

        {/* Additional Sections for Expanded Views */}
        {expandedSection && (
          <section className="mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layout className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Viewing expanded {expandedSection} section
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSection(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Minimize2 className="h-4 w-4" />
                  <span className="ml-1">Collapse</span>
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer Information */}
      <footer className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            <p>
              YourOBC Dashboard - Powered by{' '}
              <span className="font-medium">YourOBC Business System</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span>Data refreshed automatically every 30 seconds</span>
            <span>•</span>
            <span>
              {overview?.lastUpdated && 
                `Last update: ${new Date(overview.lastUpdated).toLocaleTimeString()}`
              }
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}