// src/features/boilerplate/[module_name]/pages/[Entities]Page.tsx

import { FC, useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { [Entity]Card } from "../components/[Entity]Card";
import { [Entity]Stats } from "../components/[Entity]Stats";
import { [Entities]PageHeader } from "../components/[Entities]PageHeader";
import { [Entities]Filters } from "../components/[Entities]Filters";
import { [Entities]Table } from "../components/[Entities]Table";
import { [Entity]QuickFilterBadges } from "../components/[Entity]QuickFilterBadges";
import { [Entities]HelpSection } from "../components/[Entities]HelpSection";
import { use[Entities]List, use[Entity]Stats, useUser[Entities] } from "../hooks/use[Entities]";
import { useCanCreate[Entities] } from "../hooks/use[Entity]Permissions";
import { useTranslation } from "@/features/boilerplate/i18n";
import { Loading, PermissionDenied, ErrorState, EmptyState } from "@/components/ui";
import type { [Entity] } from "../types";
import { getCurrentLocale } from "@/features/boilerplate/i18n/utils/path";

export const [Entities]Page: FC = () => {
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
          console.log(`[Entities]Page: Became interactive in ${duration.toFixed(2)}ms`);
        }
      };

      // Use setTimeout to log after React finishes rendering
      const timeoutId = setTimeout(logInteractive, 0);

      return () => {
        clearTimeout(timeoutId);
        // Log unmount for debugging StrictMode behavior
        if (mountTimeRef.current) {
          const duration = performance.now() - mountTimeRef.current;
          console.log(`[Entities]Page: Unmounted after ${duration.toFixed(2)}ms`);
        }
      };
    }
  }, [])

  // ✅ Clean hooks using service layer
  // These use useSuspenseQuery internally with service-provided query options
  // SSR cache is automatically utilized when available
  const { data: [entities]Data } = use[Entities]List({ limit: 100 })
  const { data: stats } = use[Entity]Stats()

  const { t } = useTranslation("[module_name]");
  const navigate = useNavigate();
  const locale = getCurrentLocale();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showMy[Entities], setShowMy[Entities]] = useState(false);

  // Use the new getUser[Entities] for "My [Entities]" view
  const {
    data: user[Entities]Data,
    isPending: isUser[Entities]Loading,
    error: user[Entities]Error,
  } = useUser[Entities]({
    includeArchived: false,
  });

  const canCreate = useCanCreate[Entities]();

  // Determine which data to use
  const isLoading = showMy[Entities] ? isUser[Entities]Loading : false;
  const error = showMy[Entities] ? user[Entities]Error : null;
  const isPermissionError = false; // Will be handled by error boundary
  const isStatsLoading = false; // Stats are already loaded via useSuspenseQuery

  const [entities] = useMemo(() => {
    if (showMy[Entities] && user[Entities]Data) {
      // Combine owned and collaborated [entities]
      return [...user[Entities]Data.owned, ...user[Entities]Data.collaborated];
    }
    return [entities]Data?.[entities] || [];
  }, [showMy[Entities], user[Entities]Data, [entities]Data?.[entities]]);

  const refetch = () => {
    // Refetch will be handled automatically by React Query
    window.location.reload();
  };

  const handle[Entity]Click = ({entity}: [Entity]) => {
    navigate({
      to: `/${locale}/[feature-path]/${entity}Id`,
      params: { {entity}Id: {entity}._id },
    });
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    [entities].forEach(({entity}) => {
      if ({entity}.category) {
        categorySet.add({entity}.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [[entities]]);

  // Filter [entities] (client-side for UX responsiveness)
  const filtered[Entities] = useMemo(() => {
    return [entities].filter(({entity}) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          {entity}.title.toLowerCase().includes(searchLower) ||
          {entity}.description?.toLowerCase().includes(searchLower) ||
          {entity}.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (statusFilter) {
        if (statusFilter === "overdue") {
          const isOverdue =
            {entity}.dueDate && {entity}.dueDate < Date.now() && {entity}.status !== "completed";
          if (!isOverdue) return false;
        } else if (statusFilter === "at-risk") {
          const now = Date.now();
          const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
          const isAtRisk =
            {entity}.dueDate &&
            {entity}.dueDate > now &&
            {entity}.dueDate < sevenDaysFromNow &&
            {entity}.status !== "completed";
          if (!isAtRisk) return false;
        } else {
          if ({entity}.status !== statusFilter) return false;
        }
      }

      if (priorityFilter && {entity}.priority !== priorityFilter) return false;
      if (categoryFilter && {entity}.category !== categoryFilter) return false;

      return true;
    });
  }, [[entities], searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (priorityFilter ? 1 : 0) +
    (categoryFilter ? 1 : 0);

  // Handle permission errors
  if (isPermissionError) {
    return <PermissionDenied message={t("errors.permissionDenied")} />;
  }

  // Handle general errors
  if (error) {
    return (
      <ErrorState
        title={t("errors.loadFailed")}
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  // Handle empty state
  const isEmpty = !isLoading && filtered[Entities].length === 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <[Entities]PageHeader
        canCreate={canCreate}
        onCreateClick={() => navigate({ to: `/${locale}/[feature-path]/new` })}
      />

      {/* Stats Section */}
      {!isStatsLoading && stats && <[Entity]Stats stats={stats} />}

      {/* Filters */}
      <[Entities]Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showMy[Entities]={showMy[Entities]}
        onShowMy[Entities]Change={setShowMy[Entities]}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={clearFilters}
      />

      {/* Quick Filter Badges */}
      {activeFiltersCount > 0 && (
        <[Entity]QuickFilterBadges
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          categoryFilter={categoryFilter}
          onRemoveSearch={() => setSearchTerm("")}
          onRemoveStatus={() => setStatusFilter("")}
          onRemovePriority={() => setPriorityFilter("")}
          onRemoveCategory={() => setCategoryFilter("")}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loading />
        </div>
      )}

      {/* Empty State */}
      {isEmpty && !searchTerm && !statusFilter && !priorityFilter && !categoryFilter && (
        <EmptyState
          title={t("empty.title")}
          description={t("empty.description")}
          action={
            canCreate
              ? {
                  label: t("empty.createButton"),
                  onClick: () => navigate({ to: `/${locale}/[feature-path]/new` }),
                }
              : undefined
          }
        />
      )}

      {/* No Results State */}
      {isEmpty && (searchTerm || statusFilter || priorityFilter || categoryFilter) && (
        <EmptyState
          title={t("noResults.title")}
          description={t("noResults.description")}
          action={{
            label: t("noResults.clearFilters"),
            onClick: clearFilters,
          }}
        />
      )}

      {/* [Entities] Grid View */}
      {!isLoading && !isEmpty && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered[Entities].map(({entity}) => (
            <[Entity]Card
              key={{entity}._id}
              {entity}={{entity}}
              onClick={() => handle[Entity]Click({entity})}
            />
          ))}
        </div>
      )}

      {/* [Entities] Table View */}
      {!isLoading && !isEmpty && viewMode === "table" && (
        <[Entities]Table
          [entities]={filtered[Entities]}
          on[Entity]Click={handle[Entity]Click}
        />
      )}

      {/* Help Section */}
      <[Entities]HelpSection />
    </div>
  );
};
