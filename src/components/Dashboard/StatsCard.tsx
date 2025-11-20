import React from 'react'
import { Card } from '../ui/Card'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    trend: 'up' | 'down' | 'neutral'
  }
  icon?: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    value: 'text-blue-900',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    value: 'text-green-900',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    value: 'text-yellow-900',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    value: 'text-red-900',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    value: 'text-purple-900',
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'text-gray-600',
    value: 'text-gray-900',
  },
}

const trendClasses = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-500',
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue' 
}: StatsCardProps) {
  const colorClass = colorClasses[color]
  
  return (
    <Card className="relative overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className={`text-2xl font-bold ${colorClass.value}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${trendClasses[change.trend]}`}>
                  {change.trend === 'up' && '↗'}
                  {change.trend === 'down' && '↘'}
                  {change.trend === 'neutral' && '→'}
                  {change.value}%
                </span>
                <span className="text-sm text-gray-500 ml-2">{change.label}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`rounded-lg p-3 ${colorClass.bg}`}>
              <Icon className={`w-6 h-6 ${colorClass.icon}`} />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}