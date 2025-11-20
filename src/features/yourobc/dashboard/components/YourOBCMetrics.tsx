// src/features/yourobc/dashboard/components/YourOBCMetrics.tsx

import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Star, 
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { YourOBCMetrics as YourOBCMetricsType, MetricsPeriod } from '../types'

interface YourOBCMetricsProps {
  data: YourOBCMetricsType | undefined
  isLoading?: boolean
  error?: Error | null
  selectedPeriod: MetricsPeriod
  onPeriodChange?: (period: MetricsPeriod) => void
}

type MetricsView = 'overview' | 'revenue' | 'conversion' | 'performance' | 'efficiency'

export function YourOBCMetrics({ 
  data, 
  isLoading = false, 
  error = null,
  selectedPeriod,
  onPeriodChange 
}: YourOBCMetricsProps) {
  const [activeView, setActiveView] = useState<MetricsView>('overview')

  const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`
  }

  const formatDecimal = (num: number, decimals: number = 1): string => {
    return num.toFixed(decimals)
  }

  const getTrendIcon = (trend: number[]) => {
    if (trend.length < 2) return <Activity className="h-4 w-4 text-gray-400" />
    const isIncreasing = trend[trend.length - 1] > trend[trend.length - 2]
    return isIncreasing 
      ? <TrendingUp className="h-4 w-4 text-green-600" />
      : <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getTrendColor = (trend: number[]): string => {
    if (trend.length < 2) return 'text-gray-500'
    const isIncreasing = trend[trend.length - 1] > trend[trend.length - 2]
    return isIncreasing ? 'text-green-600' : 'text-red-600'
  }

  const getPerformanceColor = (value: number, threshold: number): string => {
    if (value >= threshold) return 'text-green-600'
    if (value >= threshold * 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceIcon = (value: number, threshold: number) => {
    if (value >= threshold) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (value >= threshold * 0.8) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const viewTabs: Array<{ key: MetricsView; label: string; icon: React.ElementType }> = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'revenue', label: 'Revenue', icon: DollarSign },
    { key: 'conversion', label: 'Conversion', icon: Target },
    { key: 'performance', label: 'Performance', icon: Star },
    { key: 'efficiency', label: 'Efficiency', icon: Zap }
  ]

  if (error) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load metrics data</p>
            <p className="text-sm text-gray-500 mt-1">{error.message}</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-4 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Revenue Summary */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(data.revenue.total)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +{formatPercentage(data.revenue.growth)} growth
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </CardBody>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Quote Conversion</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatPercentage(data.conversion.quoteToOrder)}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(data.conversion.trends.quoteToOrder)}
                <span className={`text-sm ml-1 ${getTrendColor(data.conversion.trends.quoteToOrder)}`}>
                  Trending
                </span>
              </div>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </CardBody>
      </Card>

      {/* SLA Compliance */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">SLA Compliance</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatPercentage(data.performance.slaCompliance)}
              </p>
              <div className="flex items-center mt-1">
                {getPerformanceIcon(data.performance.slaCompliance, 90)}
                <span className={`text-sm ml-1 ${getPerformanceColor(data.performance.slaCompliance, 90)}`}>
                  {data.performance.slaCompliance >= 90 ? 'Excellent' : 'Needs attention'}
                </span>
              </div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardBody>
      </Card>

      {/* Customer Satisfaction */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Satisfaction</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatDecimal(data.performance.customerSatisfaction, 1)}/5.0
              </p>
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.floor(data.performance.customerSatisfaction) ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </CardBody>
      </Card>
    </div>
  )

  const renderRevenue = () => (
    <div className="space-y-6">
      {/* Revenue Progress */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Current Revenue</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(data.revenue.total)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${data.revenue.targetProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-gray-500">Target: {formatCurrency(data.revenue.target)}</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(data.revenue.targetProgress)}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Revenue</span>
                <span className="font-semibold">
                  {formatCurrency(data.revenue.breakdown.customers)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Partner Revenue</span>
                <span className="font-semibold">
                  {formatCurrency(data.revenue.breakdown.partners)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="font-semibold text-green-600">
                  +{formatPercentage(data.revenue.growth)}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Revenue Trend */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {data.revenue.trend.map((item, index) => (
              <div key={item.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">{item.period}</span>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold">{formatCurrency(item.value)}</span>
                  {index > 0 && (
                    <div className="flex items-center">
                      {item.value > data.revenue.trend[index - 1].value 
                        ? <TrendingUp className="h-4 w-4 text-green-600" />
                        : <TrendingDown className="h-4 w-4 text-red-600" />
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )

  const renderConversion = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Quote to Order</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{formatPercentage(data.conversion.quoteToOrder)}</span>
                {getTrendIcon(data.conversion.trends.quoteToOrder)}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Lead to Customer</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{formatPercentage(data.conversion.leadToCustomer)}</span>
                {getTrendIcon(data.conversion.trends.leadToCustomer)}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Proposal to Contract</span>
              <span className="font-semibold">{formatPercentage(data.conversion.proposalToContract)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Inquiry to Quote</span>
              <span className="font-semibold">{formatPercentage(data.conversion.inquiryToQuote)}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded"></div>
              <div className="pl-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Inquiries</span>
                  <span className="text-sm text-gray-500">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded"></div>
              <div className="pl-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Quotes</span>
                  <span className="text-sm text-gray-500">{formatPercentage(data.conversion.inquiryToQuote)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${data.conversion.inquiryToQuote}%` }}></div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded"></div>
              <div className="pl-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Orders</span>
                  <span className="text-sm text-gray-500">{formatPercentage(data.conversion.quoteToOrder)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${data.conversion.quoteToOrder}%` }}></div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-600 rounded"></div>
              <div className="pl-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Customers</span>
                  <span className="text-sm text-gray-500">{formatPercentage(data.conversion.leadToCustomer)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${data.conversion.leadToCustomer}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  const renderPerformance = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'SLA Compliance', value: data.performance.slaCompliance, target: 90, unit: '%' },
              { label: 'Customer Satisfaction', value: data.performance.customerSatisfaction, target: 4.0, unit: '/5' },
              { label: 'Response Time', value: data.performance.responseTime, target: 4.0, unit: 'h', reverse: true },
              { label: 'Delivery Accuracy', value: data.performance.deliveryAccuracy, target: 95, unit: '%' },
              { label: 'Quality Score', value: data.performance.qualityScore, target: 85, unit: '%' }
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getPerformanceIcon(metric.value, metric.target)}
                  <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${getPerformanceColor(metric.value, metric.target)}`}>
                    {formatDecimal(metric.value)}{metric.unit}
                  </span>
                  <p className="text-xs text-gray-500">Target: {metric.target}{metric.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">SLA Compliance Trend</span>
                {getTrendIcon(data.performance.trends.slaCompliance)}
              </div>
              <div className="flex space-x-2">
                {data.performance.trends.slaCompliance.map((value, index) => (
                  <div key={index} className="flex-1 bg-blue-200 rounded">
                    <div 
                      className="bg-blue-600 rounded"
                      style={{ height: `${(value / 100) * 40}px` }}
                    ></div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Latest: {formatPercentage(data.performance.trends.slaCompliance[data.performance.trends.slaCompliance.length - 1])}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Satisfaction Trend</span>
                {getTrendIcon(data.performance.trends.customerSatisfaction)}
              </div>
              <div className="flex space-x-2">
                {data.performance.trends.customerSatisfaction.map((value, index) => (
                  <div key={index} className="flex-1 bg-green-200 rounded">
                    <div 
                      className="bg-green-600 rounded"
                      style={{ height: `${(value / 5) * 40}px` }}
                    ></div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-green-600 mt-2">
                Latest: {formatDecimal(data.performance.trends.customerSatisfaction[data.performance.trends.customerSatisfaction.length - 1])}/5
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  const renderEfficiency = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Processing Time', value: data.efficiency.processingTime, unit: 'h', icon: Clock },
              { label: 'Resource Utilization', value: data.efficiency.resourceUtilization, unit: '%', icon: Activity },
              { label: 'Cost per Transaction', value: data.efficiency.costPerTransaction, unit: '€', icon: DollarSign },
              { label: 'Automation Rate', value: data.efficiency.automationRate, unit: '%', icon: Zap },
              { label: 'Error Rate', value: data.efficiency.errorRate, unit: '%', icon: AlertTriangle }
            ].map((metric) => {
              const IconComponent = metric.icon
              return (
                <div key={metric.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {metric.unit === '€' ? '€' : ''}{formatDecimal(metric.value)}{metric.unit !== '€' ? metric.unit : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Trends</h3>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Processing Time</span>
                {getTrendIcon(data.efficiency.trends.processingTime)}
              </div>
              <div className="flex space-x-2">
                {data.efficiency.trends.processingTime.map((value, index) => (
                  <div key={index} className="flex-1 bg-purple-200 rounded">
                    <div 
                      className="bg-purple-600 rounded"
                      style={{ height: `${(value / Math.max(...data.efficiency.trends.processingTime)) * 40}px` }}
                    ></div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-purple-600 mt-2">
                Latest: {formatDecimal(data.efficiency.trends.processingTime[data.efficiency.trends.processingTime.length - 1])}h
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-700">Resource Utilization</span>
                {getTrendIcon(data.efficiency.trends.resourceUtilization)}
              </div>
              <div className="flex space-x-2">
                {data.efficiency.trends.resourceUtilization.map((value, index) => (
                  <div key={index} className="flex-1 bg-orange-200 rounded">
                    <div 
                      className="bg-orange-600 rounded"
                      style={{ height: `${(value / 100) * 40}px` }}
                    ></div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-orange-600 mt-2">
                Latest: {formatPercentage(data.efficiency.trends.resourceUtilization[data.efficiency.trends.resourceUtilization.length - 1])}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
          <p className="text-sm text-gray-500">
            Detailed analytics and performance tracking
          </p>
        </div>
        <div className="text-xs text-gray-400">
          Generated: {new Date(data.generatedAt).toLocaleString()}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {viewTabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'revenue' && renderRevenue()}
        {activeView === 'conversion' && renderConversion()}
        {activeView === 'performance' && renderPerformance()}
        {activeView === 'efficiency' && renderEfficiency()}
      </div>
    </div>
  )
}