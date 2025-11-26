// features/projects/pages/CreateProjectPage.tsx

import { FC, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCreateProject } from '../hooks/useProjects'
import { useProjectAudit } from '../hooks/useProjectAudit'
import { useToast } from '@/features/system/notifications'
import { useErrorContext } from '@/contexts/ErrorContext'
import { ProjectForm } from '../components/ProjectForm'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui'
import type { CreateProjectData, UpdateProjectData } from '../types'
import { getCurrentLocale } from "@/features/system/i18n/utils/path";
import * as projectHelpers from '../utils/projectHelpers';

export const CreateProjectPage: FC = () => {
  const navigate = useNavigate()
  const locale = getCurrentLocale();
  const toast = useToast()
  const { handleError } = useErrorContext()

  const createProjectMutation = useCreateProject()
  const { logProjectCreated } = useProjectAudit()

  const createProject = useCallback(
    async (data: CreateProjectData) => {
      // ✅ Use utility helper directly instead of through service
      const errors = projectHelpers.validateProjectData(data);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      // ✅ Backend returns { _id, publicId }
      const result = await createProjectMutation.mutateAsync({ data });

      // ✅ Use publicId for audit logs (backend expects publicId in entityId)
      logProjectCreated(result.publicId, data.title, data);

      // ✅ Return publicId for navigation
      return result.publicId;
    },
    [createProjectMutation, logProjectCreated]
  );

  const isCreating = createProjectMutation.isPending;

  const handleSubmit = async (data: CreateProjectData | UpdateProjectData) => {
    try {
      // Type guard: CreateProjectPage only handles CreateProjectData
      if (!('title' in data) || !data.title) {
        throw new Error('Title is required')
      }
      const newProjectPublicId = await createProject(data as CreateProjectData)
      toast.success(`Project "${data.title}" created successfully!`)
      
      // ✅ Navigate using publicId
      navigate({
        to: `/${locale}/projects/$projectId`,
        params: { projectId: newProjectPublicId }
      })
    } catch (error: any) {
      // Let ErrorContext handle all errors (including permission errors)
      handleError(error)
    }
  }

  const handleCancel = () => {
    navigate({ to: `/${locale}/projects` })
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Projects', href: '/{-$locale}/projects' },
    { label: 'Create New Project' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">Set up a new project to start organizing your work</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ProjectForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isCreating}
          />
        </div>
      </div>
    </div>
  )
}