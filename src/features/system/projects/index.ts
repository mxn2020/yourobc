// features/projects/index.ts

// === Services ===
export { ProjectsService, projectsService } from './services/ProjectsService'

// === Pages ===
export { ProjectsPage } from './pages/ProjectsPage'
export { ProjectDetailsPage } from './pages/ProjectDetailsPage'
export { CreateProjectPage } from './pages/CreateProjectPage'

// === Components ===
export { ProjectCard } from './components/ProjectCard'
export { ProjectForm } from './components/ProjectForm'
export { ProjectStats } from './components/ProjectStats'
export { ProjectsPageHeader } from './components/ProjectsPageHeader'
export { ProjectsFilters } from './components/ProjectsFilters'
export { ProjectQuickFilterBadges } from './components/ProjectQuickFilterBadges'
export { ProjectsTable } from './components/ProjectsTable'
export { ProjectsHelpSection } from './components/ProjectsHelpSection'

// === Hooks ===
export {
  useProjects,
  useProject,
  useProjectsList,
  useProjectStats,
  useProjectSuspense,
  useProjectActions,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useUpdateProjectProgress,
} from './hooks/useProjects'

// === Types ===
export type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectId,
  ProjectsListOptions
} from './types'
