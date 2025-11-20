// src/features/projects/components/ProjectsTable.tsx

import { FC, useState, useMemo } from "react";
import { Badge } from "@/components/ui";
import type { Project } from "../types";
import { useTranslation } from "@/features/boilerplate/i18n";
import * as projectHelpers from "../utils/projectHelpers";

interface ProjectsTableProps {
  projects: Array<
    Project & {
      collaboratorDetails?: Array<{ userId: string; role?: string; name?: string }>;
    }
  >;
  onRowClick: (project: Project) => void;
}

type SortField = "title" | "status" | "priority" | "progress" | "dueDate" | "createdAt";
type SortOrder = "asc" | "desc";

export const ProjectsTable: FC<ProjectsTableProps> = ({ projects, onRowClick }) => {
  const { t } = useTranslation("projects");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "priority":
          const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3, critical: 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "progress":
          aValue = a.progress.percentage;
          bValue = b.progress.percentage;
          break;
        case "dueDate":
          aValue = a.dueDate || 0;
          bValue = b.dueDate || 0;
          break;
        case "createdAt":
          aValue = a.createdAt || 0;
          bValue = b.createdAt || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [projects, sortField, sortOrder]);

  const SortIcon: FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-400">⇅</span>;
    return sortOrder === "asc" ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("title")}
              >
                {t("table.headers.project")} <SortIcon field="title" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                {t("table.headers.status")} <SortIcon field="status" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("priority")}
              >
                {t("table.headers.priority")} <SortIcon field="priority" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("progress")}
              >
                {t("table.headers.progress")} <SortIcon field="progress" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("dueDate")}
              >
                {t("table.headers.dueDate")} <SortIcon field="dueDate" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.headers.collaborators")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.headers.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProjects.map((project) => {
              // ✅ Use utility helpers directly instead of through service
              const isOverdue = projectHelpers.isProjectOverdue(project);
              const daysUntilDue = project.dueDate
                ? projectHelpers.getDaysUntilDue(project.dueDate)
                : null;
              const collaboratorCount = project.collaboratorDetails
                ? project.collaboratorDetails.length
                : 0;

              return (
                <tr
                  key={project._id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onRowClick(project)}
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.title}</div>
                    {project.description && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {project.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        project.status === "active"
                          ? "success"
                          : project.status === "completed"
                          ? "primary"
                          : project.status === "on_hold"
                          ? "warning"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        project.priority === "urgent" || project.priority === "critical"
                          ? "danger"
                          : project.priority === "high"
                          ? "warning"
                          : project.priority === "medium"
                          ? "info"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {project.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            project.progress.percentage === 100 ? "bg-green-600" : "bg-blue-600"
                          }`}
                          style={{ width: `${project.progress.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 min-w-[3rem] text-right">
                        {project.progress.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {project.dueDate ? (
                      <div>
                        <div
                          className={`text-sm ${
                            isOverdue ? "text-red-600 font-medium" : "text-gray-900"
                          }`}
                        >
                          {new Date(project.dueDate).toLocaleDateString()}
                        </div>
                        {daysUntilDue !== null && !isOverdue && project.status !== "completed" && (
                          <div
                            className={`text-xs ${
                              daysUntilDue <= 3
                                ? "text-red-600"
                                : daysUntilDue <= 7
                                ? "text-orange-600"
                                : "text-gray-500"
                            }`}
                          >
                            {daysUntilDue} {t("table.daysLeft")}
                          </div>
                        )}
                        {isOverdue && (
                          <div className="text-xs text-red-600">{t("table.overdue")}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">{t("table.noDueDate")}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {collaboratorCount > 0 ? (
                        <Badge variant="secondary" size="sm">
                          👥 {collaboratorCount}{" "}
                          {collaboratorCount !== 1 ? t("table.members") : t("table.member")}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(project);
                      }}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      {t("table.view")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedProjects.length === 0 && (
        <div className="text-center py-12 text-gray-500">{t("table.empty")}</div>
      )}
    </div>
  );
};