// features/projects/components/ProjectCard.tsx
import { FC } from "react";
import { Link } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from "@/components/ui";
import { useProjectActions } from "../hooks/useProjects";
import type { Project } from "../types";
import { useTranslation } from "@/features/system/i18n";
import { getCurrentLocale } from "@/features/system/i18n/utils/path";
import * as projectHelpers from "../utils/projectHelpers";

interface ProjectCardProps {
  project: Project & {
    collaboratorDetails?: Array<{ userId: string; role?: string; name?: string }>;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  trackViews?: boolean;
  compact?: boolean;
  showActions?: boolean;
}

export const ProjectCard: FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  trackViews = false,
  compact = false,
  showActions = true,
}) => {
  const { t } = useTranslation("projects");
  const { viewProject } = useProjectActions();
  const locale = getCurrentLocale();
  // ✅ Use utility helpers directly instead of through service
  const isOverdue = projectHelpers.isProjectOverdue(project);
  const daysUntilDue = project.dueDate ? projectHelpers.getDaysUntilDue(project.dueDate) : null;
  const health = projectHelpers.calculateProjectHealth(project);

  // Get collaborator count from collaboratorDetails if available
  const collaboratorCount = project.collaboratorDetails
    ? project.collaboratorDetails.length
    : 0;

  const handleProjectClick = () => {
    // Log the view when user clicks on the project title
    if (trackViews && project.visibility === "private") {
      viewProject(project._id, project.title);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "primary";
      case "on_hold":
        return "warning";
      case "cancelled":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "critical":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getHealthVariant = (healthLevel: string) => {
    switch (healthLevel) {
      case "excellent":
        return "success";
      case "good":
        return "info";
      case "warning":
        return "warning";
      case "critical":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <Card hover={true} className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Link
                to="/{-$locale}/projects/$projectId"
                params={{ locale, projectId: project._id }}
                className={`font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate ${
                  compact ? "text-base" : "text-lg"
                }`}
                onClick={handleProjectClick}
              >
                {project.title}
              </Link>

              {health.health === "excellent" && (
                <Badge variant="success" size="sm">
                  ⭐ {t("health.excellent")}
                </Badge>
              )}
            </div>

            {project.description && !compact && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{project.description}</p>
            )}

            {project.category && (
              <div className="text-xs text-gray-500">📁 {project.category}</div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 ml-4">
            <Badge variant={getStatusVariant(project.status)} size="sm">
              {project.status.replace("_", " ")}
            </Badge>

            <Badge variant={getPriorityVariant(project.priority)} size="sm">
              {project.priority}
            </Badge>

            {project.visibility === "private" && (
              <Badge variant="warning" size="sm">
                🔒 {t("card.privateLabel")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{t("card.progress")}</span>
            <span>{project.progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                project.progress.percentage === 100 ? "bg-green-600" : "bg-blue-600"
              }`}
              style={{ width: `${project.progress.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {project.progress.completedTasks} / {project.progress.totalTasks} {t("card.tasks")}
            </span>
            {project.progress.percentage === 100 && (
              <span className="text-green-600 font-medium">✓ {t("card.complete")}</span>
            )}
          </div>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Due Date */}
        {project.dueDate && (
          <div className="mb-4">
            <div
              className={`text-sm flex items-center gap-2 ${
                isOverdue ? "text-red-600 font-medium" : "text-gray-600"
              }`}
            >
              <span>
                {t("card.due")} {new Date(project.dueDate).toLocaleDateString()}
              </span>
              {isOverdue && (
                <Badge variant="danger" size="sm">
                  ⚠️ {t("card.overdue")}
                </Badge>
              )}
              {!isOverdue && daysUntilDue !== null && project.status !== "completed" && (
                <span
                  className={`text-xs ${
                    daysUntilDue <= 3
                      ? "text-red-600"
                      : daysUntilDue <= 7
                      ? "text-orange-600"
                      : "text-gray-400"
                  }`}
                >
                  ({daysUntilDue} {t("card.days")})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Budget Information */}
        {project.extendedMetadata?.budget && !compact && (
          <div className="p-2 bg-gray-50 rounded-lg mb-4">
            <div className="text-xs font-medium text-gray-900 mb-1">{t("card.budget")}</div>
            <div className="flex justify-between text-xs text-gray-600">
              <div>
                <div className="font-medium">{t("card.budget")}</div>
                <div>${project.extendedMetadata.budget.toLocaleString()}</div>
              </div>
              {project.extendedMetadata.actualCost !== undefined && (
                <div>
                  <div className="font-medium">{t("card.spent")}</div>
                  <div
                    className={
                      project.extendedMetadata.actualCost > project.extendedMetadata.budget
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    ${project.extendedMetadata.actualCost.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-500">
          <div className="flex justify-between mb-1">
            <span>
              {t("card.created")} {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <span>
              {t("card.updated")}{" "}
              {new Date(project.updatedAt ?? project.createdAt).toLocaleDateString()}
            </span>
          </div>
          {collaboratorCount > 0 && (
            <div>
              <Badge variant="secondary" size="sm">
                👥 {collaboratorCount}{" "}
                {collaboratorCount !== 1 ? t("card.collaborators") : t("card.collaborator")}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Link
                to="/{-$locale}/projects/$projectId"
                params={{ locale, projectId: project._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="primary">
                  {t("card.viewDetails")}
                </Button>
              </Link>

              {onEdit && (
                <Button size="sm" variant="secondary" onClick={onEdit}>
                  {t("actions.edit")}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {health && (
                <Badge variant={getHealthVariant(health.health)} size="sm">
                  {t(`health.${health.health}`)}
                </Badge>
              )}

              {onDelete && (
                <Button size="sm" variant="danger" onClick={onDelete}>
                  {t("actions.delete")}
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};