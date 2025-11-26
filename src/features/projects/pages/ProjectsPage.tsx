// src/features/projects/pages/ProjectsPage.tsx

import { FC, useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectStats } from "../components/ProjectStats";
import { ProjectsPageHeader } from "../components/ProjectsPageHeader";
import { ProjectsFilters } from "../components/ProjectsFilters";
import { ProjectsTable } from "../components/ProjectsTable";
import { ProjectQuickFilterBadges } from "../components/ProjectQuickFilterBadges";
import { ProjectsHelpSection } from "../components/ProjectsHelpSection";
import { useProjectsList, useProjectStatsSuspense, useUserProjects } from "../hooks/useProjects";
import { useCanCreateProjects } from "../hooks/useProjectPermissions";
import { useTranslation, getCurrentLocale } from "@/features/system/i18n";
import { Loading, PermissionDenied, ErrorState, EmptyState } from "@/components/ui";
import type { Project } from "../types";

export const ProjectsPage: FC = () => {
  // Track component render performance (dev mode only)
  const mountTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Record mount time
      mountTimeRef.current = performance.now();

      // Log when component becomes interactive (after first paint)
      const logInteractive = () => {
        if (mountTimeRef.current) {
          const duration = performance.now() - mountTimeRef.current;
          console.log(`ProjectsPage: Became interactive in ${duration.toFixed(2)}ms`);
        }
      };

      // Use setTimeout to log after React finishes rendering
      const timeoutId = setTimeout(logInteractive, 0);

      return () => {
        clearTimeout(timeoutId);
        // Log unmount for debugging StrictMode behavior
        if (mountTimeRef.current) {
          const duration = performance.now() - mountTimeRef.current;
          console.log(`ProjectsPage: Unmounted after ${duration.toFixed(2)}ms`);
        }
      };
    }
  }, [])

  // ✅ Clean hooks using service layer
  // These use useSuspenseQuery internally with service-provided query options
  // SSR cache is automatically utilized when available
  const { data: projectsData } = useProjectsList({ limit: 100 })
  const { data: stats } = useProjectStatsSuspense()

  const { t } = useTranslation("projects");
  const navigate = useNavigate();
  const locale = getCurrentLocale();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showMyProjects, setShowMyProjects] = useState(false);

  // Use the new getUserProjects for "My Projects" view
  const {
    data: userProjectsData,
    isPending: isUserProjectsLoading,
    error: userProjectsError,
  } = useUserProjects({
    includeArchived: false,
  });

  const canCreate = useCanCreateProjects();

  // Determine which data to use
  const isLoading = showMyProjects ? isUserProjectsLoading : false;
  const error = showMyProjects ? userProjectsError : null;
  const isPermissionError = false; // Will be handled by error boundary
  const isStatsLoading = false; // Stats are already loaded via useSuspenseQuery

  const projects = useMemo(() => {
    if (showMyProjects && userProjectsData) {
      // Combine owned and collaborated projects
      return [...userProjectsData.owned, ...userProjectsData.collaborated];
    }
    return projectsData?.projects || [];
  }, [showMyProjects, userProjectsData, projectsData?.projects]);

  const refetch = () => {
    // Refetch will be handled automatically by React Query
    window.location.reload();
  };

  const handleProjectClick = (project: Project) => {
    navigate({
      to: `/${locale}/projects/$projectId`,
      params: { projectId: project._id },
    });
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    projects.forEach((project) => {
      if (project.category) {
        categorySet.add(project.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [projects]);

  // Filter projects (client-side for UX responsiveness)
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          project.title.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower) ||
          project.tags.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (statusFilter) {
        if (statusFilter === "overdue") {
          const isOverdue =
            project.dueDate && project.dueDate < Date.now() && project.status !== "completed";
          if (!isOverdue) return false;
        } else if (statusFilter === "at-risk") {
          const now = Date.now();
          const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
          const isAtRisk =
            project.dueDate &&
            project.dueDate > now &&
            project.dueDate < sevenDaysFromNow &&
            project.status !== "completed";
          if (!isAtRisk) return false;
        } else {
          if (project.status !== statusFilter) return false;
        }
      }

      if (priorityFilter && project.priority !== priorityFilter) return false;
      if (categoryFilter && project.category !== categoryFilter) return false;

      return true;
    });
  }, [projects, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
  };

  const hasActiveFilters = Boolean(
    searchTerm || statusFilter || priorityFilter || categoryFilter
  );

  // Loading state
  if (isLoading && projects.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" message="page.loading" namespace="projects" showMessage />
      </div>
    );
  }

  // Permission error
  if (isPermissionError && error && typeof error === 'object' && 'permission' in error) {
    const permissionError = error as { permission?: string; message?: string };
    return (
      <PermissionDenied
        permission={permissionError.permission}
        module="Projects"
        message={permissionError.message}
        showDetails={true}
      />
    );
  }

  // Other errors
  if (error) {
    return <ErrorState error={error} onRetry={refetch} showDetails={true} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ProjectsPageHeader
          stats={stats}
          isStatsLoading={isStatsLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          canCreate={canCreate}
        />

        {/* Toggle between All Projects and My Projects */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
            <button
              onClick={() => setShowMyProjects(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !showMyProjects
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              📋 {t("page.allProjects")}
            </button>
            <button
              onClick={() => setShowMyProjects(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                showMyProjects
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              👤 {t("page.myProjects")}
            </button>
          </div>

          {showMyProjects && userProjectsData && (
            <div className="mt-3 flex gap-4 text-sm text-gray-600">
              <span>
                {t("page.owned")}: <strong>{userProjectsData.stats.totalOwned}</strong>
              </span>
              <span>•</span>
              <span>
                {t("page.collaborating")}: <strong>{userProjectsData.stats.totalCollaborated}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Stats Overview - Only show for "All Projects" view */}
        {!showMyProjects && (
          <ProjectStats stats={stats} isLoading={isStatsLoading} />
        )}

        {/* Filters */}
        <ProjectsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onClearFilters={handleClearFilters}
          showClearButton={hasActiveFilters}
          categories={categories}
        />

        {/* Quick Filter Badges - Only show for "All Projects" view */}
        {!showMyProjects && (
          <ProjectQuickFilterBadges
            stats={stats}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onStatusFilterChange={setStatusFilter}
            onPriorityFilterChange={setPriorityFilter}
          />
        )}

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {t("page.showing")} {filteredProjects.length} {t("page.of")} {projects.length}{" "}
            {projects.length === 1 ? t("page.projects_one") : t("page.projects_other")}
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                {t("page.for")} "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Projects Display */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? t("page.noProjectsFound") : t("page.noProjects")}
            description={
              hasActiveFilters
                ? t("page.tryAdjusting")
                : canCreate
                ? t("page.createFirst")
                : t("page.projectsWillAppear")
            }
            action={
              hasActiveFilters ? {
                label: t("page.clearAllFilters"),
                onClick: handleClearFilters,
                variant: "ghost" as const
              } : canCreate ? {
                label: t("page.createNew"),
                onClick: () => navigate({ to: `/${locale}/projects/new` }),
                variant: "primary" as const
              } : undefined
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} trackViews={true} />
            ))}
          </div>
        ) : (
          <ProjectsTable projects={filteredProjects} onRowClick={handleProjectClick} />
        )}

        {/* Quick Actions */}
        {canCreate && (
          <div className="fixed bottom-6 right-6">
            <Link to="/{-$locale}/projects/new" params={{ locale }}>
              <button
                className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
                title={t("page.addNewProject")}
              >
                ➕
              </button>
            </Link>
          </div>
        )}

        {/* Help Section */}
        <ProjectsHelpSection />
      </div>
    </div>
  );
};
