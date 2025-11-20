// src/features/yourobc/statistics/components/KPICard.tsx

import { FC, ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export const KPICard: FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
}) => {
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend.value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend.value > 0) return 'text-green-600'
    if (trend.value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && (
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold">{value}</p>

        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}

        {trend && (
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
