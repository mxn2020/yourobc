// features/system/projects/pages/ProjectDetailsPage.tsx

import { FC, useState, useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useProjectSuspense, useProjectMembersSuspense } from '../hooks/useProjects'
import { useUpdateProject, useDeleteProject } from '../hooks/useProjects'
import { useProjectAudit } from '../hooks/useProjectAudit'
import { useProjectPermissions } from '../hooks/useProjectPermissions'
import { useToast } from '@/features/system/notifications'
import { parseConvexError, ParsedError } from '@/utils/errorHandling'
import type { ProjectId, UpdateProjectData } from '../types'
import * as projectHelpers from '../utils/projectHelpers'
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertDescription,
  Breadcrumb,
  useProjectBreadcrumbs,
} from '@/components/ui'
import { DeleteConfirmationModal } from '@/components/ui'
import { PermissionDeniedModal } from '@/components/Permission/PermissionDeniedModal'
import { PermissionButton } from '@/components/Permission//PermissionButton'
import { PermissionGate } from '@/components/Permission//PermissionGate'
import { ProjectRoleBadge } from '../components/ProjectRoleBadge'
import { PermissionWarningBanner } from '@/components/Permission//PermissionWarningBanner'
import { RequestAccessModal } from '@/components/Permission//RequestAccessModal'
import { TaskFormModal } from '../components/tasks/TaskFormModal'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskDetailModal } from '../components/tasks/TaskDetailModal'
import { TaskBoard } from '../components/tasks/TaskBoard'
import { MilestoneFormModal } from '../components/milestones/MilestoneFormModal'
import { MilestoneCard } from '../components/milestones/MilestoneCard'
import { MilestoneDetailModal } from '../components/milestones/MilestoneDetailModal'
import { MilestoneTimeline } from '../components/milestones/MilestoneTimeline'
import { MemberManagerModal } from '../components/members/MemberManagerModal'
import { MemberCard } from '../components/members/MemberCard'
import {
  TaskCardSkeleton,
  MilestoneCardSkeleton,
  MemberCardSkeleton
} from '../components/ProjectDetailsSkeleton'
import { ProjectAnalytics } from '../components/analytics/ProjectAnalytics'
import { TeamActivityFeed } from '../components/team/TeamActivityFeed'
import { MemberWorkloadChart } from '../components/team/MemberWorkloadChart'
import { useProjectTasks } from '../hooks/useTasks'
import { useProjectMilestones } from '../hooks/useMilestones'
import { tasksService } from '../services/TasksService'
import { milestonesService } from '../services/MilestonesService'
import { teamService } from '../services/TeamService'
import { getCurrentLocale } from "@/features/system/i18n/utils/path";
import type { Id } from '@/convex/_generated/dataModel'
import { useAuth } from '@/features/system/auth/hooks/useAuth'

interface ProjectDetailsPageProps {
  projectId: ProjectId
}

export const ProjectDetailsPage: FC<ProjectDetailsPageProps> = ({ projectId }) => {
  // Track component render performance (dev mode only)
  const mountTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (import.meta.env.DEV) {
      mountTimeRef.current = performance.now();
      console.log('🎨 ProjectDetailsPage: Component mounted')

      const logInteractive = () => {
        if (mountTimeRef.current) {
          const duration = performance.now() - mountTimeRef.current;
          console.log(`🎨 ProjectDetailsPage: Became interactive in ${duration.toFixed(2)}ms`);
        }
      };

      const timeoutId = setTimeout(logInteractive, 0);

      return () => {
        clearTimeout(timeoutId);
        if (mountTimeRef.current) {
          const duration = performance.now() - mountTimeRef.current;
          console.log(`🎨 ProjectDetailsPage: Unmounted after ${duration.toFixed(2)}ms`);
        }
      };
    }
  }, [])

  const [activeTab, setActiveTab] = useState('overview')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [permissionError, setPermissionError] = useState<ParsedError | null>(null)
  const [requestAccessOpen, setRequestAccessOpen] = useState(false)

  // Task modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false)
  const [taskDetailData, setTaskDetailData] = useState<any>(null)
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'board'>('list')

  // Milestone modal states
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const [milestoneModalMode, setMilestoneModalMode] = useState<'create' | 'edit'>('create')
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null)
  const [milestoneDetailModalOpen, setMilestoneDetailModalOpen] = useState(false)
  const [milestoneDetailData, setMilestoneDetailData] = useState<any>(null)
  const [milestoneViewMode, setMilestoneViewMode] = useState<'list' | 'timeline'>('timeline')

  // Member modal state
  const [memberModalOpen, setMemberModalOpen] = useState(false)

  const navigate = useNavigate()
  const locale = getCurrentLocale();
  const toast = useToast()

  // ✅ Use Suspense hooks - data is guaranteed to be available from SSR cache or fetch
  const { data: project } = useProjectSuspense(projectId)
  const { data: members } = useProjectMembersSuspense(projectId)

  // Get current user
  const { user } = useAuth()
  // ✅ Use service hooks instead of direct Convex queries
  const { data: currentUserProfile } = teamService.useCurrentUserProfile()

  // Fetch project members (new system)
  const { data: members } = teamService.useProjectMembers(projectId as Id<'projects'>)

  // Fetch all user profiles for member assignment
  const { data: allUsers } = teamService.useAllUserProfiles()

  // Fetch tasks, milestones, and members for the project
  const { data: tasks = [] } = useProjectTasks(projectId)
  const { data: taskStats } = tasksService.useTaskStats(projectId)
  const createTaskMutation = tasksService.useCreateTask()
  const updateTaskMutation = tasksService.useUpdateTask()
  const deleteTaskMutation = tasksService.useDeleteTask()
  // ✅ Use service hooks instead of direct mutation calls
  const updateTaskStatusMutation = tasksService.useUpdateTaskStatus()
  const updateTaskOrderMutation = tasksService.useUpdateTaskOrder()

  // Fetch milestones
  const { data: milestones = [] } = useProjectMilestones(projectId)

  const createMilestoneMutation = milestonesService.useCreateMilestone()
  const updateMilestoneMutation = milestonesService.useUpdateMilestone()
  const deleteMilestoneMutation = milestonesService.useDeleteMilestone()

  // ✅ Use service hooks instead of direct mutation calls
  const addMemberMutation = teamService.useAddMember()
  const removeMemberMutation = teamService.useRemoveMember()
  const updateMemberRoleMutation = teamService.useUpdateMemberRole()

  // Get mutation hooks
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const { logProjectUpdated, logProjectDeleted } = useProjectAudit()

  const updateProject = useCallback(
    async (projectId: ProjectId, updates: UpdateProjectData) => {
      // ✅ Use utility helper directly instead of through service
      const errors = projectHelpers.validateProjectData(updates);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      if (!project) {
        throw new Error("Project not found");
      }

      const result = await updateProjectMutation.mutateAsync({
        projectId,
        updates,
      });

      // Log audit
      logProjectUpdated(projectId, project.title, project, updates);

      return result;
    },
    [updateProjectMutation, logProjectUpdated, project]
  );

  const deleteProject = useCallback(
    async (projectId: ProjectId, hardDelete = false) => {
      if (!project) {
        throw new Error("Project not found");
      }

      try {
        const result = await deleteProjectMutation.mutateAsync({ projectId, hardDelete });

        // Log deletion
        logProjectDeleted(projectId, project.title, project, hardDelete).catch(
          console.warn
        );

        return result;
      } catch (error) {
        throw error;
      }
    },
    [deleteProjectMutation, logProjectDeleted, project]
  );

  const isUpdating = updateProjectMutation.isPending
  const isDeleting = deleteProjectMutation.isPending

  // ✅ Use utility helpers directly instead of through service
  const isOverdue = projectHelpers.isProjectOverdue(project)
  const daysUntilDue = project.dueDate ? projectHelpers.getDaysUntilDue(project.dueDate) : null
  const health = projectHelpers.calculateProjectHealth(project)

  // Get permissions
  const permissions = useProjectPermissions(project)

  // ✅ Use service hook instead of direct mutation call
  const requestAccessMutation = projectsService.useRequestAccess()

  const handleEdit = async (data: UpdateProjectData) => {
    const processedData = {
      ...data,
      status: data.status || 'active',
      priority: data.priority || 'medium',
      visibility: data.visibility || 'private',
      tags: data.tags || [],
      settings: data.settings
        ? {
          allowComments: data.settings.allowComments ?? false,
          requireApproval: data.settings.requireApproval ?? false,
          autoArchive: data.settings.autoArchive ?? false,
          emailNotifications: data.settings.emailNotifications ?? false,
        }
        : undefined,
    }

    try {
      await updateProject(projectId, processedData)
      toast.success('Project updated successfully!')
    } catch (error: any) {
      console.error('Project update error:', error)
      const parsed = parseConvexError(error)

      if (parsed.type === 'permission') {
        setPermissionError(parsed)
      } else {
        toast.error(parsed.message)
      }
    }
  }

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteProject(projectId)
      toast.success(`${project.title} has been deleted successfully`)
      setDeleteModalOpen(false)
      navigate({ to: `/${locale}/projects` })
    } catch (error: any) {
      console.error('Project deletion error:', error)
      const parsed = parseConvexError(error)

      if (parsed.type === 'permission') {
        setDeleteModalOpen(false)
        setPermissionError(parsed)
      } else {
        toast.error(parsed.message)
      }
    }
  }

  const handleRequestAccess = async (message?: string) => {
    try {
      await requestAccessMutation({ projectId, message })
      toast.success('Access request sent successfully!')
      setRequestAccessOpen(false)
    } catch (error: any) {
      console.error('Request access error:', error)
      throw error // Let the modal handle the error
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'completed':
        return 'primary'
      case 'on_hold':
        return 'warning'
      case 'archived':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'critical':
        return 'danger'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  // Generate breadcrumb items
  const breadcrumbItems = useProjectBreadcrumbs(
    project?.title || 'Loading...',
    projectId,
    activeTab !== 'overview' ? [{
      label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    }] : undefined
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {permissions.isOwner && (
              <ProjectRoleBadge
                role={permissions.memberRole}
                isOwner={permissions.isOwner}
              />
            )}
            {!permissions.isOwner && permissions.memberRole && (
              <ProjectRoleBadge
                role={permissions.memberRole}
                isOwner={false}
              />
            )}

            <PermissionButton
              variant="secondary"
              hasPermission={permissions.canEdit}
              action="edit this project"
              onClick={() => navigate({ to: `/${locale}/projects/${projectId}/edit` })}
            >
              ✏️ Edit
            </PermissionButton>

            <PermissionButton
              variant="danger"
              hasPermission={permissions.canDelete}
              action="delete this project"
              deniedMessage="Only project owners can delete projects"
              onClick={handleDeleteClick}
              isDisabled={isDeleting}
            >
              🗑️ Delete
            </PermissionButton>
          </div>
        </div>

        {/* Project Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>

                  {health?.health === 'excellent' && (
                    <Badge variant="success">⭐ Excellent Health</Badge>
                  )}
                </div>

                {project.description && (
                  <p className="text-gray-600 mb-4 text-lg">{project.description}</p>
                )}

                <div className="flex items-center gap-6 flex-wrap">
                  {project.category && (
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{project.category}</span>
                    </div>
                  )}

                  {project.startDate && (
                    <div>
                      <span className="text-gray-500">Started:</span>
                      <span className="ml-2 font-medium">
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant={getStatusVariant(project.status)}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Badge>

                <Badge variant={getPriorityVariant(project.priority)}>
                  {project.priority.toUpperCase()} PRIORITY
                </Badge>

                {project.visibility === 'private' && (
                  <Badge variant="warning">🔒 Private</Badge>
                )}

                {isOverdue && <Badge variant="danger">⚠️ Overdue</Badge>}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {project.progress.percentage}%
                </div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {project.progress.completedTasks}
                </div>
                <div className="text-sm text-gray-600">Completed Tasks</div>
                <div className="text-xs text-gray-500 mt-1">
                  of {project.progress.totalTasks} total
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {members?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Members</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {project.tags.length}
                </div>
                <div className="text-sm text-gray-600">Tags</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="overview">👁️ Overview</TabsTrigger>
              <TabsTrigger value="tasks">✓ Tasks</TabsTrigger>
              <TabsTrigger value="timeline">🎯 Timeline</TabsTrigger>
              <TabsTrigger value="progress">📊 Progress</TabsTrigger>
              <TabsTrigger value="team">👥 Team</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Project Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Created:</span>{' '}
                              {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                            {project.startDate && (
                              <div>
                                <span className="text-gray-500">Start Date:</span>{' '}
                                {new Date(project.startDate).toLocaleDateString()}
                              </div>
                            )}
                            {project.dueDate && (
                              <div>
                                <span className="text-gray-500">Due Date:</span>{' '}
                                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                  {new Date(project.dueDate).toLocaleDateString()}
                                  {isOverdue && ' (Overdue)'}
                                </span>
                              </div>
                            )}
                            {daysUntilDue !== null && !isOverdue && project.status !== 'completed' && (
                              <div>
                                <span className="text-gray-500">Days Remaining:</span>{' '}
                                <span
                                  className={
                                    daysUntilDue <= 3
                                      ? 'text-red-600 font-medium'
                                      : daysUntilDue <= 7
                                        ? 'text-orange-600 font-medium'
                                        : ''
                                  }
                                >
                                  {daysUntilDue} days
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Status:</span>{' '}
                              <Badge variant={getStatusVariant(project.status)} size="sm">
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-500">Priority:</span>{' '}
                              <Badge variant={getPriorityVariant(project.priority)} size="sm">
                                {project.priority}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-500">Visibility:</span> {project.visibility}
                            </div>
                            {health && (
                              <div>
                                <span className="text-gray-500">Health:</span>{' '}
                                <Badge
                                  variant={
                                    health.health === 'excellent'
                                      ? 'success'
                                      : health.health === 'good'
                                        ? 'info'
                                        : health.health === 'warning'
                                          ? 'warning'
                                          : 'danger'
                                  }
                                  size="sm"
                                >
                                  {health.health}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {project.tags.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Budget Information */}
                    {project.extendedMetadata &&
                      (project.extendedMetadata.budget ||
                        project.extendedMetadata.estimatedHours ||
                        project.extendedMetadata.client) && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget & Resources</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.extendedMetadata.budget && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">Budget</div>
                                <div className="text-xl font-bold text-gray-900">
                                  ${project.extendedMetadata.budget.toLocaleString()}
                                </div>
                                {project.extendedMetadata.actualCost !== undefined && (
                                  <div
                                    className={`text-sm mt-1 ${project.extendedMetadata.actualCost > project.extendedMetadata.budget
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                      }`}
                                  >
                                    Spent: ${project.extendedMetadata.actualCost.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )}

                            {project.extendedMetadata.estimatedHours && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">Estimated Hours</div>
                                <div className="text-xl font-bold text-gray-900">
                                  {project.extendedMetadata.estimatedHours}h
                                </div>
                                {project.extendedMetadata.actualHours !== undefined && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    Actual: {project.extendedMetadata.actualHours}h
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {project.extendedMetadata.client && (
                            <div className="mt-4 text-sm">
                              <span className="text-gray-500">Client:</span>{' '}
                              <span className="font-medium">{project.extendedMetadata.client}</span>
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="bg-gray-50">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                          <PermissionButton
                            variant="primary"
                            className="w-full"
                            hasPermission={permissions.canEdit}
                            action="add tasks"
                            onClick={() => navigate({ to: `/${locale}/projects/tasks` })}
                          >
                            📝 Add Task
                          </PermissionButton>

                          <PermissionButton
                            variant="secondary"
                            className="w-full"
                            hasPermission={permissions.canManageTeam}
                            action="manage team members"
                            onClick={() => setActiveTab('team')}
                          >
                            👥 Add Collaborator
                          </PermissionButton>

                          <Button variant="ghost" className="w-full">
                            📊 View Report
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Health Insights */}
                    {health && (
                      <Alert
                        variant={
                          health.health === 'critical' || health.health === 'warning' ? 'default' : 'default'
                        }
                      >
                        <AlertDescription>
                          <h3 className="font-semibold text-blue-900 mb-3">Project Health</h3>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>Health Score: {health.score}/100</div>
                            <div>Status: {health.health.toUpperCase()}</div>

                            {isOverdue && (
                              <div className="text-red-800 font-medium mt-2">
                                ⚠️ Project is overdue - requires immediate attention
                              </div>
                            )}

                            {daysUntilDue !== null &&
                              daysUntilDue <= 7 &&
                              daysUntilDue > 0 &&
                              project.status !== 'completed' && (
                                <div className="text-orange-800 font-medium mt-2">
                                  ⚠️ Due in {daysUntilDue} days
                                </div>
                              )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="progress">
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Analytics & Insights</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Comprehensive project metrics and performance indicators
                    </p>
                  </div>

                  {tasks && milestones && members ? (
                    <ProjectAnalytics
                      tasks={tasks}
                      milestones={milestones}
                      members={members.members || []}
                      project={project}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-gray-200 rounded" />
                        <div className="h-32 bg-gray-200 rounded" />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="team">
                <div className="space-y-8">
                  {/* Team Members Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Team Members ({members?.members?.length || 0})
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Manage project team and permissions
                        </p>
                      </div>
                      <PermissionGate hasPermission={permissions.canManageTeam}>
                        <Button
                          onClick={() => setMemberModalOpen(true)}
                        >
                          + Add Member
                        </Button>
                      </PermissionGate>
                    </div>

                    <PermissionGate
                      hasPermission={permissions.canView}
                      fallback={
                        <PermissionWarningBanner
                          message="You need access to view team members"
                          onRequestAccess={() => setRequestAccessOpen(true)}
                        />
                      }
                    >
                      {members === undefined ? (
                        // Loading state
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <MemberCardSkeleton key={i} />
                          ))}
                        </div>
                      ) : !members?.members || members.members.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <div className="text-gray-400 mb-3">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-sm mb-4">No team members yet</p>
                          <PermissionButton
                            variant="primary"
                            size="sm"
                            hasPermission={permissions.canManageTeam}
                            action="add team members"
                            onClick={() => setMemberModalOpen(true)}
                          >
                            + Add First Member
                          </PermissionButton>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {members.members.map((member: any) => (
                            <MemberCard
                              key={member._id}
                              member={member}
                              currentUserId={currentUserProfile?._id}
                              canManageMembers={permissions.canManageTeam}
                              onChangeRole={async (memberId, newRole) => {
                                try {
                                  await updateMemberRoleMutation({
                                    memberId,
                                    role: newRole,
                                  })
                                  toast.success(`Member role updated to ${newRole}`)
                                } catch (error: any) {
                                  toast.error(error.message || 'Failed to update member role')
                                }
                              }}
                              onRemove={async (memberId) => {
                                if (confirm('Are you sure you want to remove this member from the project?')) {
                                  try {
                                    await removeMemberMutation({ memberId })
                                    toast.success('Member removed successfully')
                                  } catch (error: any) {
                                    toast.error(error.message || 'Failed to remove member')
                                  }
                                }
                              }
                              }
                            />
                          ))}
                        </div>
                      )}
                    </PermissionGate>
                  </div>

                  {/* Member Workload Section */}
                  <PermissionGate hasPermission={permissions.canView}>
                    <MemberWorkloadChart projectId={projectId as Id<'projects'>} />
                  </PermissionGate>

                  {/* Team Activity Feed Section */}
                  <PermissionGate hasPermission={permissions.canView}>
                    <TeamActivityFeed projectId={projectId as Id<'projects'>} limit={20} />
                  </PermissionGate>
                </div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage project tasks and track progress
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* View Toggle */}
                      <div className="flex items-center border rounded-lg p-1">
                        <Button
                          variant={taskViewMode === 'list' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setTaskViewMode('list')}
                          className="px-3 py-1"
                        >
                          📝 List
                        </Button>
                        <Button
                          variant={taskViewMode === 'board' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setTaskViewMode('board')}
                          className="px-3 py-1"
                        >
                          📊 Board
                        </Button>
                      </div>
                      <PermissionGate hasPermission={permissions.canEdit}>
                        <Button
                          onClick={() => {
                            setTaskModalMode('create')
                            setSelectedTask(null)
                            setTaskModalOpen(true)
                          }}
                        >
                          + Add Task
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>

                  {/* Task Stats */}
                  {taskStats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{taskStats.totalTasks}</div>
                        <div className="text-sm text-gray-600">Total</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold text-gray-600">{taskStats.todoTasks}</div>
                        <div className="text-sm text-gray-600">To Do</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{taskStats.inProgressTasks}</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold text-green-600">{taskStats.completedTasks}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold text-red-600">{taskStats.blockedTasks}</div>
                        <div className="text-sm text-gray-600">Blocked</div>
                      </Card>
                    </div>
                  )}

                  {/* Tasks Display - List or Board View */}
                  {tasks === undefined ? (
                    // Loading state
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <TaskCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : !tasks || tasks.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-4">No tasks yet</p>
                      <PermissionGate hasPermission={permissions.canEdit}>
                        <Button
                          onClick={() => {
                            setTaskModalMode('create')
                            setSelectedTask(null)
                            setTaskModalOpen(true)
                          }}
                        >
                          + Create First Task
                        </Button>
                      </PermissionGate>
                    </div>
                  ) : taskViewMode === 'list' ? (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          onClick={(task) => {
                            setTaskDetailData(task)
                            setTaskDetailModalOpen(true)
                          }}
                          onEdit={(task) => {
                            setTaskModalMode('edit')
                            setSelectedTask(task)
                            setTaskModalOpen(true)
                          }}
                          onDelete={async (taskId) => {
                            if (confirm('Are you sure you want to delete this task?')) {
                              try {
                                await deleteTaskMutation.mutateAsync({ taskId })
                                toast.success('Task deleted successfully')
                              } catch (error: any) {
                                toast.error(error.message || 'Failed to delete task')
                              }
                            }
                          }}
                          canEdit={permissions.canEdit}
                          canDelete={permissions.canEdit}
                        />
                      ))}
                    </div>
                  ) : (
                    <TaskBoard
                      tasks={tasks}
                      onTaskClick={(task) => {
                        setTaskDetailData(task)
                        setTaskDetailModalOpen(true)
                      }}
                      onTaskEdit={(task) => {
                        setTaskModalMode('edit')
                        setSelectedTask(task)
                        setTaskModalOpen(true)
                      }}
                      onTaskDelete={async (taskId) => {
                        if (confirm('Are you sure you want to delete this task?')) {
                          try {
                            await deleteTaskMutation.mutateAsync({ taskId })
                            toast.success('Task deleted successfully')
                          } catch (error: any) {
                            toast.error(error.message || 'Failed to delete task')
                          }
                        }
                      }}
                      onTaskMove={async (taskId, newStatus) => {
                        try {
                          await updateTaskStatusMutation({ taskId, status: newStatus })
                          toast.success(`Task moved to ${newStatus.replace('_', ' ')}`)
                        } catch (error: any) {
                          toast.error(error.message || 'Failed to move task')
                        }
                      }}
                      onTaskReorder={async (taskId, newOrder) => {
                        try {
                          await updateTaskOrderMutation({ taskId, order: newOrder })
                        } catch (error: any) {
                          toast.error(error.message || 'Failed to reorder task')
                        }
                      }}
                      canEdit={permissions.canEdit}
                      canDelete={permissions.canEdit}
                    />
                  )}
                </div>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Track milestones and project phases
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* View Toggle */}
                      <div className="flex items-center border rounded-lg p-1">
                        <Button
                          variant={milestoneViewMode === 'timeline' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setMilestoneViewMode('timeline')}
                          className="px-3 py-1"
                        >
                          🗓️ Timeline
                        </Button>
                        <Button
                          variant={milestoneViewMode === 'list' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setMilestoneViewMode('list')}
                          className="px-3 py-1"
                        >
                          📋 List
                        </Button>
                      </div>
                      <PermissionGate hasPermission={permissions.canEdit}>
                        <Button
                          onClick={() => {
                            setMilestoneModalMode('create')
                            setSelectedMilestone(null)
                            setMilestoneModalOpen(true)
                          }}
                        >
                          + Add Milestone
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>

                  {/* Milestones Display - Timeline or List View */}
                  {milestones === undefined ? (
                    // Loading state
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <MilestoneCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : !milestones || milestones.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-4">No milestones yet</p>
                      <PermissionGate hasPermission={permissions.canEdit}>
                        <Button
                          onClick={() => {
                            setMilestoneModalMode('create')
                            setSelectedMilestone(null)
                            setMilestoneModalOpen(true)
                          }}
                        >
                          + Create First Milestone
                        </Button>
                      </PermissionGate>
                    </div>
                  ) : milestoneViewMode === 'timeline' ? (
                    <MilestoneTimeline
                      milestones={milestones}
                      onMilestoneClick={(milestone) => {
                        setMilestoneDetailData(milestone)
                        setMilestoneDetailModalOpen(true)
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      {milestones.map((milestone: any) => (
                        <MilestoneCard
                          key={milestone._id}
                          milestone={milestone}
                          onClick={(milestone) => {
                            setMilestoneDetailData(milestone)
                            setMilestoneDetailModalOpen(true)
                          }}
                          onEdit={(milestone) => {
                            setMilestoneModalMode('edit')
                            setSelectedMilestone(milestone)
                            setMilestoneModalOpen(true)
                          }}
                          onDelete={async (milestoneId) => {
                            if (confirm('Are you sure you want to delete this milestone?')) {
                              try {
                                await deleteMilestoneMutation.mutateAsync({ milestoneId })
                                toast.success('Milestone deleted successfully')
                              } catch (error: any) {
                                toast.error(error.message || 'Failed to delete milestone')
                              }
                            }
                          }}
                          canEdit={permissions.canEdit}
                          canDelete={permissions.canEdit}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Settings</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Allow Comments</div>
                        <div className="text-sm text-gray-600">Team members can leave comments</div>
                      </div>
                      <Badge variant={project.settings.allowComments ? 'success' : 'secondary'} size="sm">
                        {project.settings.allowComments ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Require Approval</div>
                        <div className="text-sm text-gray-600">Changes require approval</div>
                      </div>
                      <Badge variant={project.settings.requireApproval ? 'warning' : 'secondary'} size="sm">
                        {project.settings.requireApproval ? 'Required' : 'Not Required'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-gray-600">Receive email updates</div>
                      </div>
                      <Badge variant={project.settings.emailNotifications ? 'info' : 'secondary'} size="sm">
                        {project.settings.emailNotifications ? 'On' : 'Off'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Auto Archive</div>
                        <div className="text-sm text-gray-600">Automatically archive when completed</div>
                      </div>
                      <Badge variant={project.settings.autoArchive ? 'info' : 'secondary'} size="sm">
                        {project.settings.autoArchive ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="Delete Project?"
          entityName={project?.title}
          description="This will permanently delete the project and all associated data. This action cannot be undone."
        />

        {/* Permission Denied Modal */}
        <PermissionDeniedModal
          error={permissionError}
          open={!!permissionError}
          onClose={() => setPermissionError(null)}
          onRequestAccess={() => {
            setPermissionError(null)
            setRequestAccessOpen(true)
          }}
        />

        {/* Request Access Modal */}
        <RequestAccessModal
          open={requestAccessOpen}
          onClose={() => setRequestAccessOpen(false)}
          onRequestAccess={handleRequestAccess}
          projectName={project?.title}
        />

        {/* Task Form Modal */}
        <TaskFormModal
          open={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false)
            setSelectedTask(null)
          }}
          onSubmit={async (data) => {
            if (taskModalMode === 'create') {
              await createTaskMutation.mutateAsync({
                data: {
                  title: data.title!,
                  ...data,
                  projectId
                }
              })
            } else if (selectedTask) {
              await updateTaskMutation.mutateAsync({
                taskId: selectedTask._id,
                updates: data
              })
            }
          }}
          mode={taskModalMode}
          initialData={selectedTask}
          projectId={projectId as Id<'projects'>}
          projectMembers={members?.map(c => ({
            userId: c.userId,
            name: c.name,
            email: c.email,
            role: c.role,
          }))}
        />

        {/* Milestone Form Modal */}
        <MilestoneFormModal
          open={milestoneModalOpen}
          onClose={() => {
            setMilestoneModalOpen(false)
            setSelectedMilestone(null)
          }}
          onSubmit={async (data) => {
            if (milestoneModalMode === 'create') {
              // In create mode, title, startDate, and dueDate are required by the form
              await createMilestoneMutation.mutateAsync({
                data: {
                  ...data,
                  title: data.title!,
                  startDate: data.startDate!,
                  dueDate: data.dueDate!,
                  projectId
                } as typeof data & { title: string; startDate: number; dueDate: number; projectId: ProjectId }
              })
            } else if (selectedMilestone) {
              await updateMilestoneMutation.mutateAsync({
                milestoneId: selectedMilestone._id,
                updates: data
              })
            }
          }}
          mode={milestoneModalMode}
          initialData={selectedMilestone}
          projectId={projectId as Id<'projects'>}
          projectMembers={members?.map(c => ({
            userId: c.userId,
            name: c.name,
            email: c.email,
            role: c.role,
          }))}
        />

        {/* Member Manager Modal */}
        <MemberManagerModal
          open={memberModalOpen}
          onClose={() => setMemberModalOpen(false)}
          onAddMember={async (data) => {
            try {
              await addMemberMutation({ data })
              toast.success('Member added successfully')
              setMemberModalOpen(false)
            } catch (error: any) {
              toast.error(error.message || 'Failed to add member')
              throw error
            }
          }}
          mode="add"
          projectId={projectId as Id<'projects'>}
          existingMemberIds={members?.members?.map((m: any) => m.userId) || []}
          availableUsers={allUsers?.profiles || []}
        />

        {/* Task Detail Modal */}
        {taskDetailData && (
          <TaskDetailModal
            open={taskDetailModalOpen}
            onClose={() => {
              setTaskDetailModalOpen(false)
              setTaskDetailData(null)
            }}
            task={taskDetailData}
            onEdit={(task) => {
              setTaskDetailModalOpen(false)
              setTaskModalMode('edit')
              setSelectedTask(task)
              setTaskModalOpen(true)
            }}
            onDelete={async (taskId) => {
              try {
                await deleteTaskMutation.mutateAsync({ taskId })
                toast.success('Task deleted successfully')
                setTaskDetailModalOpen(false)
                setTaskDetailData(null)
              } catch (error: any) {
                toast.error(error.message || 'Failed to delete task')
              }
            }}
            canEdit={permissions.canEdit}
            canDelete={permissions.canEdit}
          />
        )}

        {/* Milestone Detail Modal */}
        {milestoneDetailData && (
          <MilestoneDetailModal
            open={milestoneDetailModalOpen}
            onClose={() => {
              setMilestoneDetailModalOpen(false)
              setMilestoneDetailData(null)
            }}
            milestone={milestoneDetailData}
            onEdit={(milestone) => {
              setMilestoneDetailModalOpen(false)
              setMilestoneModalMode('edit')
              setSelectedMilestone(milestone)
              setMilestoneModalOpen(true)
            }}
            onDelete={async (milestoneId) => {
              try {
                await deleteMilestoneMutation.mutateAsync({ milestoneId })
                toast.success('Milestone deleted successfully')
                setMilestoneDetailModalOpen(false)
                setMilestoneDetailData(null)
              } catch (error: any) {
                toast.error(error.message || 'Failed to delete milestone')
              }
            }}
            canEdit={permissions.canEdit}
            canDelete={permissions.canEdit}
          />
        )}
      </div>
    </div>
  )
}