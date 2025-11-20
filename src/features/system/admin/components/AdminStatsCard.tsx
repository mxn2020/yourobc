// src/features/admin/components/AdminStatsCard.tsx
import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import type { AdminStatsCardProps } from '../types/admin.types'

export function AdminStatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'gray' 
}: AdminStatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
  }

  const changeColorClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            
            {change && (
              <div className="flex items-center mt-2">
                {change.type === 'increase' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${changeColorClasses[change.type]}`}>
                  {change.value}%
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {change.period}
                </span>
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}