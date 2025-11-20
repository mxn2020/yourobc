import React from 'react'
import { Plus, Users, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardHeader, CardContent } from '../ui/Card'

interface QuickActionsProps {
  onCreateProject: () => void
  onViewProjects: () => void
  onViewReports: () => void
}

export function QuickActions({ onCreateProject, onViewProjects, onViewReports }: QuickActionsProps) {
  const actions = [
    {
      label: 'New Project',
      description: 'Create a new project',
      icon: Plus,
      onClick: onCreateProject,
      color: 'primary' as const,
    },
    {
      label: 'View Projects',
      description: 'Manage all projects',
      icon: Users,
      onClick: onViewProjects,
      color: 'secondary' as const,
    },
    {
      label: 'Reports',
      description: 'View analytics',
      icon: BarChart3,
      onClick: onViewReports,
      color: 'secondary' as const,
    },
    {
      label: 'Schedule',
      description: 'View calendar',
      icon: Calendar,
      onClick: () => console.log('Calendar clicked'),
      color: 'secondary' as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant={action.color}
                className="flex items-center justify-start p-4 h-auto text-left"
                onClick={action.onClick}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs opacity-75">{action.description}</div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}