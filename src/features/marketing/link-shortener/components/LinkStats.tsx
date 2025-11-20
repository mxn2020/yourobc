// src/features/marketing/link-shortener/components/LinkStats.tsx

import { FC } from 'react'
import { Card } from '@/components/ui'
import { Link2, MousePointerClick, TrendingUp, Activity } from 'lucide-react'

interface LinkStatsProps {
  totalLinks: number
  activeLinks: number
  totalClicks: number
  avgClicksPerLink: number
}

export const LinkStats: FC<LinkStatsProps> = ({
  totalLinks,
  activeLinks,
  totalClicks,
  avgClicksPerLink,
}) => {
  const stats = [
    {
      label: 'Total Links',
      value: totalLinks,
      icon: Link2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active Links',
      value: activeLinks,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Clicks',
      value: totalClicks.toLocaleString(),
      icon: MousePointerClick,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Avg. Clicks/Link',
      value: avgClicksPerLink.toFixed(1),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
