// features/system/projects/components/team/MemberWorkloadChart.tsx

import { FC } from 'react'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, Badge, Progress } from '@/components/ui'
import { User, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { teamService } from '../../services/TeamService'

interface MemberWorkloadChartProps {
  projectId: Id<'projects'>
}

export const MemberWorkloadChart: FC<MemberWorkloadChartProps> = ({
  projectId,
}) => {
  // ✅ Use service hook instead of direct Convex query
  const { data: workloadData } = teamService.useMemberWorkload(projectId)

  if (!workloadData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const {
    memberWorkloads = [],
    unassignedTasks = 0,
    totalTasks = 0,
    averageTasksPerMember = 0,
  } = workloadData

  const getWorkloadStatus = (totalTasks: number, average: number) => {
    if (totalTasks === 0) return 'none'
    if (totalTasks > average * 1.5) return 'overloaded'
    if (totalTasks > average) return 'busy'
    if (totalTasks < average * 0.5) return 'underutilized'
    return 'balanced'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overloaded':
        return 'red'
      case 'busy':
        return 'orange'
      case 'balanced':
        return 'green'
      case 'underutilized':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'overloaded':
        return '⚠️ Overloaded'
      case 'busy':
        return '🔥 Busy'
      case 'balanced':
        return '✅ Balanced'
      case 'underutilized':
        return '💤 Available'
      default:
        return '—'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Team Workload</h3>
        <p className="text-sm text-gray-600">Task distribution across team members</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{memberWorkloads.length}</div>
          <div className="text-sm text-gray-600">Team Members</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {averageTasksPerMember.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg Tasks/Member</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{unassignedTasks}</div>
          <div className="text-sm text-gray-600">Unassigned Tasks</div>
        </Card>
      </div>

      {/* Member Workloads */}
      <Card className="divide-y divide-gray-200">
        {memberWorkloads.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No team members yet</p>
            <p className="text-sm text-gray-500">
              Add members to see workload distribution
            </p>
          </div>
        ) : (
          memberWorkloads.map((workload) => {
            const status = getWorkloadStatus(workload.totalTasks, averageTasksPerMember)
            const percentage = totalTasks > 0 ? (workload.totalTasks / totalTasks) * 100 : 0

            return (
              <div key={workload.memberId} className="p-4">
                {/* Member Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {workload.userProfile?.avatar ? (
                      <img
                        src={workload.userProfile.avatar}
                        alt={workload.userProfile.name || ''}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {workload.userProfile?.name || 'Unknown User'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {workload.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {workload.userProfile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {workload.totalTasks}
                    </div>
                    <Badge color={getStatusColor(status)} className="text-xs">
                      {getStatusLabel(status)}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Task Load</span>
                    <span className="text-gray-900 font-medium">
                      {percentage.toFixed(0)}% of total
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>

                {/* Task Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span className="text-gray-600">
                      Todo: <span className="font-medium">{workload.tasksByStatus.todo}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-gray-600">
                      In Progress:{' '}
                      <span className="font-medium">{workload.tasksByStatus.inProgress}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-gray-600">
                      Done: <span className="font-medium">{workload.tasksByStatus.completed}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span className="text-gray-600">
                      Overdue: <span className="font-medium text-red-600">{workload.overdueTasks}</span>
                    </span>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Est: <span className="font-medium">{workload.estimatedHours}h</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">
                      Actual: <span className="font-medium">{workload.actualHours}h</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">
                      Completion:{' '}
                      <span className="font-medium">{workload.completionRate.toFixed(0)}%</span>
                    </span>
                  </div>
                  {workload.overdueTasks > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 font-medium">
                        {workload.overdueTasks} overdue
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
