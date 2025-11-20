// src/features/yourobc/dashboard/components/YourOBCQuickActions.tsx

import React, { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { 
  Plus,
  Building,
  FileText,
  Package,
  Receipt,
  Handshake,
  Truck,
  Users,
  Clock,
  BookOpen,
  DollarSign,
  Target,
  Star,
  ArrowUpRight,
  ExternalLink,
  Grid3X3,
  List,
  Search,
  Settings,
  Zap,
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { YourOBCQuickAction } from '../types'

interface YourOBCQuickActionsProps {
  actions: YourOBCQuickAction[]
  isLoading?: boolean
  error?: Error | null
  onActionClick?: (action: YourOBCQuickAction) => void
  layout?: 'grid' | 'list' | 'compact'
  showSearch?: boolean
  showCategories?: boolean
  maxVisible?: number
  userRole?: string
}

type ActionCategory = 'core' | 'admin' | 'support' | 'analytics' | 'all'

const defaultActions: YourOBCQuickAction[] = [
  {
    id: 'create_customer',
    label: 'Add Customer',
    description: 'Create new customer account',
    icon: 'Building',
    href: '/yourobc/customers/new',
    color: 'blue',
    permission: 'customers.create'
  },
  {
    id: 'create_quote',
    label: 'New Quote',
    description: 'Generate customer quote',
    icon: 'FileText',
    href: '/yourobc/quotes/new',
    color: 'green',
    permission: 'quotes.create'
  },
  {
    id: 'create_shipment',
    label: 'Book Shipment',
    description: 'Schedule new shipment',
    icon: 'Package',
    href: '/yourobc/shipments/new',
    color: 'purple',
    permission: 'shipments.create'
  },
  {
    id: 'create_invoice',
    label: 'Create Invoice',
    description: 'Generate new invoice',
    icon: 'Receipt',
    href: '/yourobc/invoices/new',
    color: 'orange',
    permission: 'invoices.create'
  },
  {
    id: 'manage_partners',
    label: 'Manage Partners',
    description: 'Partner relationships',
    icon: 'Handshake',
    href: '/yourobc/partners',
    color: 'indigo',
    permission: 'partners.manage'
  },
  {
    id: 'assign_couriers',
    label: 'Assign Couriers',
    description: 'Manage courier assignments',
    icon: 'Truck',
    href: '/yourobc/couriers',
    color: 'teal',
    permission: 'couriers.manage'
  },
  {
    id: 'knowledge_base',
    label: 'Knowledge Base',
    description: 'Access documentation',
    icon: 'BookOpen',
    href: '/yourobc/wiki',
    color: 'emerald',
    permission: 'wiki.access'
  },
  {
    id: 'follow_ups',
    label: 'Follow-ups',
    description: 'Manage reminders',
    icon: 'Clock',
    href: '/yourobc/supporting/reminders',
    color: 'amber',
    permission: 'reminders.manage'
  }
]

export function YourOBCQuickActions({ 
  actions = defaultActions,
  isLoading = false,
  error = null,
  onActionClick,
  layout = 'grid',
  showSearch = true,
  showCategories = true,
  maxVisible = 12,
  userRole = 'user'
}: YourOBCQuickActionsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory>('all')
  const [currentLayout, setCurrentLayout] = useState<'grid' | 'list'>(layout as 'grid' | 'list')

  const getIconComponent = (iconName: string) => {
    const icons = {
      Building,
      FileText,
      Package,
      Receipt,
      Handshake,
      Truck,
      Users,
      Clock,
      BookOpen,
      DollarSign,
      Target,
      Star,
      Plus,
      Activity,
      TrendingUp,
      Shield,
      Zap
    }
    return icons[iconName as keyof typeof icons] || Activity
  }

  const getColorClasses = (color: string): string => {
    const colorMap = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      green: 'bg-green-600 hover:bg-green-700 text-white',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white',
      orange: 'bg-orange-600 hover:bg-orange-700 text-white',
      indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      teal: 'bg-teal-600 hover:bg-teal-700 text-white',
      emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      amber: 'bg-amber-600 hover:bg-amber-700 text-white',
      red: 'bg-red-600 hover:bg-red-700 text-white',
      gray: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  const categorizeAction = (action: YourOBCQuickAction): ActionCategory => {
    if (action.permission?.includes('manage') || action.permission?.includes('admin')) {
      return 'admin'
    }
    if (action.label.toLowerCase().includes('knowledge') || 
        action.label.toLowerCase().includes('wiki') ||
        action.label.toLowerCase().includes('follow')) {
      return 'support'
    }
    if (action.label.toLowerCase().includes('report') ||
        action.label.toLowerCase().includes('analytics') ||
        action.label.toLowerCase().includes('dashboard')) {
      return 'analytics'
    }
    return 'core'
  }

  const filteredActions = useMemo(() => {
    let filtered = actions

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(action =>
        action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(action => categorizeAction(action) === selectedCategory)
    }

    // Filter by permissions (basic check)
    if (userRole !== 'admin') {
      filtered = filtered.filter(action => 
        !action.permission || 
        !action.permission.includes('admin') ||
        action.permission.includes('view')
      )
    }

    // Apply visibility limit
    return filtered.slice(0, maxVisible)
  }, [actions, searchQuery, selectedCategory, userRole, maxVisible])

  const actionsByCategory = useMemo(() => {
    const categorized = {
      core: actions.filter(action => categorizeAction(action) === 'core'),
      admin: actions.filter(action => categorizeAction(action) === 'admin'),
      support: actions.filter(action => categorizeAction(action) === 'support'),
      analytics: actions.filter(action => categorizeAction(action) === 'analytics')
    }
    return categorized
  }, [actions])

  const handleActionClick = (action: YourOBCQuickAction, event: React.MouseEvent) => {
    if (action.disabled) {
      event.preventDefault()
      return
    }

    if (onActionClick) {
      onActionClick(action)
    }
  }

  if (error) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="text-center text-red-600">
            <Zap className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load quick actions</p>
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
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  const renderGridLayout = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredActions.map((action) => {
        const IconComponent = getIconComponent(action.icon)
        const isDisabled = action.disabled

        return (
          <Link
            key={action.id}
            to={action.href}
            disabled={isDisabled}
            onClick={(event) => handleActionClick(action, event)}
            className={`relative group p-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : `${getColorClasses(action.color)} shadow-sm hover:shadow-md`
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <IconComponent className="h-6 w-6" />
                {action.badge && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 min-w-[1.25rem] h-5">
                    {action.badge}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs opacity-80 mt-1">{action.description}</p>
              </div>
              {action.external && (
                <ExternalLink className="h-3 w-3 opacity-60 absolute top-2 right-2" />
              )}
              <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" />
            </div>
          </Link>
        )
      })}
    </div>
  )

  const renderListLayout = () => (
    <div className="space-y-2">
      {filteredActions.map((action) => {
        const IconComponent = getIconComponent(action.icon)
        const isDisabled = action.disabled

        return (
          <Link
            key={action.id}
            to={action.href}
            disabled={isDisabled}
            onClick={(event) => handleActionClick(action, event)}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors group ${
              isDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isDisabled ? 'bg-gray-200' : getColorClasses(action.color).replace('hover:bg-', 'bg-').split(' ')[0]
              }`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                  {action.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {action.external && <ExternalLink className="h-3 w-3 text-gray-400" />}
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </Link>
        )
      })}
    </div>
  )

  return (
    <Card>
      <CardBody className="p-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filteredActions.length} available
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentLayout('grid')}
                className={`p-2 rounded-md ${currentLayout === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentLayout('list')}
                className={`p-2 rounded-md ${currentLayout === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          {(showSearch || showCategories) && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              {showSearch && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search actions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              
              {showCategories && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ActionCategory)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories ({actions.length})</option>
                  <option value="core">Core Actions ({actionsByCategory.core.length})</option>
                  <option value="admin">Admin ({actionsByCategory.admin.length})</option>
                  <option value="support">Support ({actionsByCategory.support.length})</option>
                  <option value="analytics">Analytics ({actionsByCategory.analytics.length})</option>
                </select>
              )}
            </div>
          )}
        </div>

        {/* Actions Content */}
        <div className="p-6">
          {filteredActions.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">No actions found</p>
              <p className="text-gray-500">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No quick actions are available for your role'
                }
              </p>
            </div>
          ) : (
            <>
              {currentLayout === 'grid' ? renderGridLayout() : renderListLayout()}
            </>
          )}
        </div>

        {/* Footer */}
        {filteredActions.length > 0 && actions.length > maxVisible && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-center text-sm text-gray-600">
              Showing {filteredActions.length} of {actions.length} actions
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}