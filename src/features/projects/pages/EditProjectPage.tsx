// features/projects/pages/EditProjectPage.tsx

import { FC, useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useProjectSuspense } from '../hooks/useProjects'
import { useUpdateProject } from '../hooks/useProjects'
import { useProjectAudit } from '../hooks/useProjectAudit'
import { useToast } from '@/features/system/notifications'
import { useErrorContext } from '@/contexts/ErrorContext'
import { Card } from '@/components/ui'
import { ProjectForm } from '../components/ProjectForm'
import type { CreateProjectData, UpdateProjectData, ProjectId } from '../types'
import { getCurrentLocale } from "@/features/system/i18n/utils/path";
import * as projectHelpers from '../utils/projectHelpers';

interface EditProjectPageProps {
  projectId: ProjectId
}

export const EditProjectPage: FC<EditProjectPageProps> = ({ projectId }) => {
  // Track component render performance
  const mountTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    console.log('🎨 EditProjectPage: Component mounted')

    const logInteractive = () => {
      if (mountTimeRef.current) {
        const duration = performance.now() - mountTimeRef.current;
        console.log(`🎨 EditProjectPage: Became interactive in ${duration.toFixed(2)}ms`);
      }
    };

    const timeoutId = setTimeout(logInteractive, 0);

    return () => {
      clearTimeout(timeoutId);
      if (mountTimeRef.current) {
        const duration = performance.now() - mountTimeRef.current;
        console.log(`🎨 EditProjectPage: Unmounted after ${duration.toFixed(2)}ms`);
      }
    };
  }, [])

  const navigate = useNavigate()
  const locale = getCurrentLocale();
  const toast = useToast()
  const { handleError } = useErrorContext()

  // ✅ Use Suspense hook - data is guaranteed to be available from SSR cache or fetch
  const { data: project } = useProjectSuspense(projectId)
  
  const updateProjectMutation = useUpdateProject()
  const { logProjectUpdated } = useProjectAudit()

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

  const isUpdating = updateProjectMutation.isPending;

  const handleSubmit = async (data: CreateProjectData | UpdateProjectData) => {
    try {
      await updateProject(projectId, data as UpdateProjectData)
      toast.success(`${data.title || project.title} updated successfully!`)
      navigate({
        to: `/${locale}/projects/$projectId`,
        params: { projectId }
      })
    } catch (error: any) {
      // Let ErrorContext handle all errors (including permission errors)
      handleError(error)
    }
  }

  const handleCancel = () => {
    navigate({ to: `/${locale}/projects/$projectId`, params: { projectId } })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Link
            to="/{-$locale}/projects/$projectId"
            params={{ locale, projectId }}
            className="text-blue-600 hover:text-blue-800 font-medium"
            >
            ← Back to {project.title} Details
            </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit {project.title}</h1>
          <p className="text-gray-600 mt-2">Update project information and settings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ProjectForm
            mode="edit"
            initialData={project}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isUpdating}
          />
        </div>
      </div>
    </div>
  )
}