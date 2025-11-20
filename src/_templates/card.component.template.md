// src/features/boilerplate/[module_name]/components/[Entity]Card.tsx

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
import { use[Entity]Actions } from "../hooks/use[Entities]";
import type { [Entity] } from "../types";
import { useTranslation } from "@/features/boilerplate/i18n";
import { getCurrentLocale } from "@/features/boilerplate/i18n/utils/path";
import * as {entity}Helpers from "../utils/{entity}Helpers";

interface [Entity]CardProps {
  {entity}: [Entity] & {
    collaboratorDetails?: Array<{ userId: string; role?: string; name?: string }>;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  trackViews?: boolean;
  compact?: boolean;
  showActions?: boolean;
}

export const [Entity]Card: FC<[Entity]CardProps> = ({
  {entity},
  onEdit,
  onDelete,
  onClick,
  trackViews = false,
  compact = false,
  showActions = true,
}) => {
  const { t } = useTranslation("[module_name]");
  const { view[Entity] } = use[Entity]Actions();
  const locale = getCurrentLocale();

  // ✅ Use utility helpers directly instead of through service
  const isOverdue = {entity}Helpers.is[Entity]Overdue({entity});
  const daysUntilDue = {entity}.dueDate ? {entity}Helpers.getDaysUntilDue({entity}.dueDate) : null;
  const health = {entity}Helpers.calculate[Entity]Health({entity});

  // Get collaborator count from collaboratorDetails if available
  const collaboratorCount = {entity}.collaboratorDetails
    ? {entity}.collaboratorDetails.length
    : 0;

  const handle[Entity]Click = () => {
    // Log the view when user clicks on the {entity} title
    if (trackViews && {entity}.visibility === "private") {
      view[Entity]({entity}._id, {entity}.title);
    }
    onClick?.();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "default";
      case "on-hold":
        return "warning";
      case "archived":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "warning";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getHealthVariant = (health: string) => {
    switch (health) {
      case "excellent":
        return "success";
      case "good":
        return "default";
      case "at-risk":
        return "warning";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3
              className="text-lg font-semibold hover:text-primary cursor-pointer"
              onClick={handle[Entity]Click}
            >
              {{entity}.title}
            </h3>
            {{entity}.category && (
              <p className="text-sm text-muted-foreground mt-1">
                {{entity}.category}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusVariant({entity}.status)}>
              {t(`status.${{entity}.status}`)}
            </Badge>
            <Badge variant={getPriorityVariant({entity}.priority)}>
              {t(`priority.${{entity}.priority}`)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {{entity}.description && !compact && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {{entity}.description}
          </p>
        )}

        {/* Progress */}
        {{entity}.progress !== undefined && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{t("card.progress")}</span>
              <span className="font-medium">{{entity}.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${{entity}.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Due Date */}
        {{entity}.dueDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("card.dueDate")}</span>
            <span className={isOverdue ? "text-destructive font-medium" : ""}>
              {new Date({entity}.dueDate).toLocaleDateString()}
              {daysUntilDue !== null && (
                <span className="ml-2">
                  ({daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Health Indicator */}
        {health && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("card.health")}</span>
            <Badge variant={getHealthVariant(health)}>
              {t(`health.${health}`)}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {{entity}.tags && {entity}.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-2">
            {{entity}.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {{entity}.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{{entity}.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Collaborators */}
        {collaboratorCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {t("card.collaborators", { count: collaboratorCount })}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handle[Entity]Click}
          >
            {t("card.actions.view")}
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              {t("card.actions.edit")}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              {t("card.actions.delete")}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
