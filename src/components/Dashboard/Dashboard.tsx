// src/components/Dashboard/Dashboard.tsx
import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { useRouter, useParams } from '@tanstack/react-router'
import { useAuth } from '@/features/system/auth'
import { api } from '@/generated/api';
import { defaultLocale } from '@/features/system/i18n';
import { StatsCard } from './StatsCard'
import { ProjectChart } from './ProjectChart'
import { QuickActions } from './QuickActions'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal'
import { Button } from '../ui/Button'
// import { CreateProjectData, UpdateProjectData, Project, ProjectForm, useProjects } from '@/features/system/projects'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Progress } from '../ui/Progress'
import { FolderOpen, CheckCircle, Clock, AlertTriangle, DollarSign, TrendingUp, Calendar, Target } from 'lucide-react'
import type { ChartDataPoint } from '@/types'
import { Id } from '@/convex/_generated/dataModel'
import { parseConvexError, ParsedError } from '@/utils/errorHandling'
import { PermissionDeniedModal } from '../Permission/PermissionDeniedModal'
import { RequestAccessModal } from '@/components/Permission/RequestAccessModal'
import { useToast } from '@/features/system/notifications'

export function Dashboard() {
  const { auth, profile, isReady, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams({ strict: false });
  const locale = (params as any).locale;
  const currentLocale = locale || defaultLocale;
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [permissionError, setPermissionError] = useState<ParsedError | null>(null)
  const [requestAccessOpen, setRequestAccessOpen] = useState(false)
  const toast = useToast()

  /*
  const { createProject, isCreating } = useProjects()

  // TanStack Query will use prefetched data automatically if available
  const dashboardStats = useQuery(
    api.lib.system.projects.queries.getDashboardStats,
    isReady && isAuthenticated ? {} : "skip"
  )

  const projectsList = useQuery(
    api.lib.system.projects.queries.getProjects,
    isReady && isAuthenticated ? { options: { limit: 10 } } : "skip"
  )

  const handleCreateProject = () => {
    setShowCreateProject(true)
  }

  const handleViewProjects = () => {
    router.navigate({
      to: '/{-$locale}/projects',
      params: { locale: currentLocale === defaultLocale ? undefined : currentLocale }
    })
  }

  const handleViewReports = () => {
    router.navigate({
      to: '/{-$locale}/projects',
      params: { locale: currentLocale === defaultLocale ? undefined : currentLocale }
    })
  }

  const handleProjectCreated = async (project: CreateProjectData | UpdateProjectData) => {
    const processedData = {
      ...project,
      priority: project.priority || 'medium',
      visibility: project.visibility || 'private',
      tags: project.tags || [],
      settings: project.settings
        ? {
            allowComments: project.settings.allowComments ?? false,
            requireApproval: project.settings.requireApproval ?? false,
            autoArchive: project.settings.autoArchive ?? false,
            emailNotifications: project.settings.emailNotifications ?? false,
          }
        : undefined,
    }

    try {
      const { _id: newProjectId, publicId } = await createProject(processedData as CreateProjectData)
      toast.success(`Project "${project.title}" created successfully!`)
      setShowCreateProject(false)
      router.navigate({
        to: '/{-$locale}/projects/$projectId',
        params: {
          locale: currentLocale === defaultLocale ? undefined : currentLocale,
          projectId: newProjectId
        }
      })
    } catch (error: any) {
      const parsed = parseConvexError(error)

      // Show permission modal for permission errors
      if (parsed.type === 'permission') {
        setShowCreateProject(false)
        setPermissionError(parsed)
      } else {
        // Log unexpected errors for debugging
        console.error('Project creation error:', error)
        // Show toast for other errors
        toast.error(parsed.message)
      }
    }
  }
    */

  const handleRequestAccess = async (message?: string) => {
    try {
      toast.info('Please contact your administrator to request project creation permissions')
      setRequestAccessOpen(false)
    } catch (error: any) {
      console.error('Request access error:', error)
      throw error
    }
  }

  // Show loading state while auth is loading or data is not ready
  if (!isReady || !isAuthenticated) { // || !dashboardStats || !projectsList) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /*
  const projects = projectsList.projects || []

  const statusChartData: ChartDataPoint[] = [
    { name: 'Active', value: dashboardStats.activeProjects, color: '#10B981' },
    { name: 'Completed', value: dashboardStats.completedProjects, color: '#3B82F6' },
    { name: 'On Hold', value: projects.filter((p: Project) => p.status === 'on_hold').length, color: '#F59E0B' },
    { name: 'Cancelled', value: projects.filter((p: Project) => p.status === 'cancelled').length, color: '#EF4444' },
  ]

  const priorityChartData: ChartDataPoint[] = [
    { name: 'Urgent', value: projects.filter((p: Project) => p.priority === 'urgent').length, color: '#EF4444' },
    { name: 'High', value: projects.filter((p: Project) => p.priority === 'high').length, color: '#F59E0B' },
    { name: 'Medium', value: projects.filter((p: Project) => p.priority === 'medium').length, color: '#3B82F6' },
    { name: 'Low', value: projects.filter((p: Project) => p.priority === 'low').length, color: '#10B981' },
  ]

  const projectsCompletedThisMonth = projects.filter((p: Project) => {
    if (p.status !== 'completed' || !p.completedAt) return false
    const completedDate = new Date(p.completedAt)
    const now = new Date()
    return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear()
  }).length
  */

  return (
    <>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || auth?.name}
          </h1>
          <p className="text-lg text-gray-600">
            Here's an overview of your project management dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/*
          <StatsCard
            title="Total Projects"
            value={dashboardStats.totalProjects}
            icon={FolderOpen}
            color="blue"
          />
          <StatsCard
            title="Active Projects"
            value={dashboardStats.activeProjects}
            icon={Target}
            color="green"
          />
          <StatsCard
            title="Completed"
            value={dashboardStats.completedProjects}
            icon={CheckCircle}
            color="blue"
            change={{
              value: projectsCompletedThisMonth,
              label: 'this month',
              trend: 'up'
            }}
          />
          <StatsCard
            title="Overdue"
            value={dashboardStats.overdueProjects}
            icon={AlertTriangle}
            color="red"
          />
          */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/*
          <StatsCard
            title="Total Budget"
            value={`$${dashboardStats.totalBudget.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
          />
          <StatsCard
            title="Average Progress"
            value={`${Math.round(dashboardStats.averageProgress)}%`}
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="Completed This Month"
            value={projectsCompletedThisMonth}
            icon={Calendar}
            color="blue"
          />
          */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectChart
                title="Project Status Distribution"
                type="pie"
                data={statusChartData}
                height={300}
              />
              <ProjectChart
                title="Priority Distribution"
                type="bar"
                data={priorityChartData}
                height={300}
              />
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project: Project) => (
                      <div 
                        key={project._id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => router.navigate({
                          to: '/{-$locale}/projects/$projectId',
                          params: {
                            locale: currentLocale === defaultLocale ? undefined : currentLocale,
                            projectId: project._id
                          }
                        })}
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 hover:text-blue-600">{project.title}</h4>
                          <p className="text-sm text-gray-500">{project.description}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Progress
                            value={project.progress?.percentage || 0}
                            className="w-24"
                          />
                          <span className="text-sm font-medium text-gray-600">
                            {project.progress?.percentage || 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No projects yet. Create your first project!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <QuickActions
              onCreateProject={handleCreateProject}
              onViewProjects={handleViewProjects}
              onViewReports={handleViewReports}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        title="Create New Project"
        size="lg"
      >
        <ModalBody>
          <ProjectForm
            mode="create"
            onSubmit={handleProjectCreated}
            onCancel={() => setShowCreateProject(false)}
            isLoading={isCreating}
          />
        </ModalBody>
      </Modal>

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
        title="Request Project Creation Permission"
        description="You need permission to create projects. Contact your administrator to request access."
      />
    </>
  )
}