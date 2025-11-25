// features/projects/components/analytics/ProjectAnalytics.tsx

import { FC, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  Calendar,
  Activity,
  BarChart3,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface Task {
  _id: string
  status: string
  priority: string
  estimatedHours?: number
  actualHours?: number
  dueDate?: number
  completedAt?: number
  createdAt: number
  assignedTo?: string
}

interface Milestone {
  _id: string
  status: string
  progress: number
  dueDate: number
  startDate: number
  deliverables?: Array<{ completed: boolean }>
}

interface Member {
  _id: string
  userId: string
  status: string
  joinedAt: number
}

interface ProjectAnalyticsProps {
  tasks: Task[]
  milestones: Milestone[]
  members: Member[]
  project: {
    progress: {
      percentage: number
      completedTasks: number
      totalTasks: number
    }
    startDate?: number
    dueDate?: number
    status: string
  }
}

export const ProjectAnalytics: FC<ProjectAnalyticsProps> = ({
  tasks,
  milestones,
  members,
  project,
}) => {
  // Calculate analytics
  const analytics = useMemo(() => {
    const now = Date.now()

    // Task Analytics
    const tasksByStatus = tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const tasksByPriority = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Overdue tasks
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && t.status !== 'completed' && t.dueDate < now
    ).length

    // Time tracking
    const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    const totalActual = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
    const timeVariance = totalActual - totalEstimated

    // Completion rate
    const completedTasks = tasksByStatus.completed || 0
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Velocity (tasks completed per week)
    const completedTasksThisWeek = tasks.filter(
      (t) => t.completedAt && t.completedAt > now - 7 * 24 * 60 * 60 * 1000
    ).length

    // Milestone Analytics
    const completedMilestones = milestones.filter((m) => m.status === 'completed').length
    const totalMilestones = milestones.length
    const milestoneCompletionRate =
      totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

    const overdueMilestones = milestones.filter(
      (m) => m.dueDate < now && m.status !== 'completed' && m.status !== 'cancelled'
    ).length

    // Average milestone progress
    const avgMilestoneProgress =
      milestones.length > 0
        ? milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
        : 0

    // Team Analytics
    const activeMembers = members.filter((m) => m.status === 'active').length
    const tasksPerMember = activeMembers > 0 ? totalTasks / activeMembers : 0

    // Task assignment distribution
    const assignedTasks = tasks.filter((t) => t.assignedTo).length
    const unassignedTasks = totalTasks - assignedTasks
    const assignmentRate = totalTasks > 0 ? (assignedTasks / totalTasks) * 100 : 0

    // Project timeline
    const projectDuration = project.dueDate && project.startDate
      ? Math.ceil((project.dueDate - project.startDate) / (1000 * 60 * 60 * 24))
      : 0

    const daysElapsed = project.startDate
      ? Math.ceil((now - project.startDate) / (1000 * 60 * 60 * 24))
      : 0

    const daysRemaining = project.dueDate
      ? Math.ceil((project.dueDate - now) / (1000 * 60 * 60 * 24))
      : 0

    const timeProgress = projectDuration > 0 ? (daysElapsed / projectDuration) * 100 : 0

    // Health Score
    const healthScore = calculateHealthScore({
      completionRate,
      overdueTasks,
      overdueMilestones,
      timeVariance,
      assignmentRate,
      avgMilestoneProgress,
    })

    return {
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      totalEstimated,
      totalActual,
      timeVariance,
      completionRate,
      completedTasksThisWeek,
      completedMilestones,
      totalMilestones,
      milestoneCompletionRate,
      overdueMilestones,
      avgMilestoneProgress,
      activeMembers,
      tasksPerMember,
      assignedTasks,
      unassignedTasks,
      assignmentRate,
      projectDuration,
      daysElapsed,
      daysRemaining,
      timeProgress,
      healthScore,
    }
  }, [tasks, milestones, members, project])

  return (
    <div className="space-y-6">
      {/* Health Score & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Project Health</h3>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold">{analytics.healthScore}%</div>
            <Badge
              variant={
                analytics.healthScore >= 80
                  ? 'success'
                  : analytics.healthScore >= 60
                    ? 'warning'
                    : 'destructive'
              }
            >
              {analytics.healthScore >= 80 ? 'Healthy' : analytics.healthScore >= 60 ? 'At Risk' : 'Critical'}
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Completion Rate</h3>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            {analytics.completionRate >= 50 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {project.progress.completedTasks} of {project.progress.totalTasks} tasks
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Velocity</h3>
            <Target className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold">{analytics.completedTasksThisWeek}</div>
          <div className="mt-2 text-xs text-gray-500">Tasks completed this week</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Overdue Items</h3>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-600">
            {analytics.overdueTasks + analytics.overdueMilestones}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {analytics.overdueTasks} tasks, {analytics.overdueMilestones} milestones
          </div>
        </Card>
      </div>

      {/* Progress Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Task Status Distribution</h3>
          </div>
          <div className="space-y-3">
            {[
              { status: 'todo', label: 'To Do', color: 'bg-gray-500' },
              { status: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
              { status: 'in_review', label: 'In Review', color: 'bg-yellow-500' },
              { status: 'completed', label: 'Completed', color: 'bg-green-500' },
              { status: 'blocked', label: 'Blocked', color: 'bg-red-500' },
            ].map(({ status, label, color }) => {
              const count = analytics.tasksByStatus[status] || 0
              const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className={twMerge('h-2', color)} />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Priority Distribution</h3>
          </div>
          <div className="space-y-3">
            {[
              { priority: 'critical', label: 'Critical', color: 'bg-red-700' },
              { priority: 'urgent', label: 'Urgent', color: 'bg-red-500' },
              { priority: 'high', label: 'High', color: 'bg-orange-500' },
              { priority: 'medium', label: 'Medium', color: 'bg-blue-500' },
              { priority: 'low', label: 'Low', color: 'bg-gray-500' },
            ].map(({ priority, label, color }) => {
              const count = analytics.tasksByPriority[priority] || 0
              const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0
              return (
                <div key={priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className={twMerge('h-2', color)} />
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Time & Team Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Time Tracking</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated:</span>
              <span className="font-medium">{analytics.totalEstimated}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Actual:</span>
              <span className="font-medium">{analytics.totalActual}h</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Variance:</span>
              <span
                className={twMerge(
                  'font-medium',
                  analytics.timeVariance > 0 ? 'text-red-600' : 'text-green-600'
                )}
              >
                {analytics.timeVariance > 0 ? '+' : ''}
                {analytics.timeVariance}h
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Team Metrics</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Members:</span>
              <span className="font-medium">{analytics.activeMembers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tasks/Member:</span>
              <span className="font-medium">{analytics.tasksPerMember.toFixed(1)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Assignment Rate:</span>
              <span className="font-medium">{analytics.assignmentRate.toFixed(0)}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Timeline Progress</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Days Elapsed:</span>
              <span className="font-medium">{analytics.daysElapsed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Days Remaining:</span>
              <span className="font-medium">{analytics.daysRemaining}</span>
            </div>
            <div className="mt-3">
              <Progress value={analytics.timeProgress} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {analytics.timeProgress.toFixed(0)}% of timeline elapsed
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Milestone Progress */}
      {milestones.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Milestone Progress</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{analytics.completedMilestones}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{analytics.totalMilestones}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                {analytics.avgMilestoneProgress.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
          <Progress value={analytics.milestoneCompletionRate} className="h-3" />
          <div className="text-sm text-gray-500 mt-2 text-center">
            {analytics.milestoneCompletionRate.toFixed(0)}% of milestones completed
          </div>
        </Card>
      )}
    </div>
  )
}

// Health score calculation
function calculateHealthScore(metrics: {
  completionRate: number
  overdueTasks: number
  overdueMilestones: number
  timeVariance: number
  assignmentRate: number
  avgMilestoneProgress: number
}): number {
  let score = 100

  // Penalize for low completion rate
  if (metrics.completionRate < 50) score -= 20
  else if (metrics.completionRate < 75) score -= 10

  // Penalize for overdue items
  score -= metrics.overdueTasks * 5
  score -= metrics.overdueMilestones * 10

  // Penalize for time overruns
  if (metrics.timeVariance > 20) score -= 15
  else if (metrics.timeVariance > 10) score -= 10

  // Penalize for low assignment rate
  if (metrics.assignmentRate < 70) score -= 10

  // Penalize for low milestone progress
  if (metrics.avgMilestoneProgress < 50) score -= 10

  return Math.max(0, Math.min(100, score))
}
