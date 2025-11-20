// src/features/boilerplate/[module_name]/components/[Entities]Table.tsx

import { FC } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Button,
} from "@/components/ui";
import { useTranslation } from "@/features/boilerplate/i18n";
import type { [Entity] } from "../types";
import * as {entity}Helpers from "../utils/{entity}Helpers";

interface [Entities]TableProps {
  [entities]: [Entity][];
  on[Entity]Click?: ({entity}: [Entity]) => void;
  onEdit?: ({entity}: [Entity]) => void;
  onDelete?: ({entity}: [Entity]) => void;
  showActions?: boolean;
}

export const [Entities]Table: FC<[Entities]TableProps> = ({
  [entities],
  on[Entity]Click,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { t } = useTranslation("[module_name]");

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

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.columns.title")}</TableHead>
            <TableHead>{t("table.columns.status")}</TableHead>
            <TableHead>{t("table.columns.priority")}</TableHead>
            <TableHead>{t("table.columns.category")}</TableHead>
            <TableHead>{t("table.columns.dueDate")}</TableHead>
            <TableHead>{t("table.columns.progress")}</TableHead>
            {showActions && <TableHead className="text-right">{t("table.columns.actions")}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[entities].length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} className="text-center text-muted-foreground">
                {t("table.empty")}
              </TableCell>
            </TableRow>
          ) : (
            [entities].map(({entity}) => {
              const isOverdue = {entity}Helpers.is[Entity]Overdue({entity});

              return (
                <TableRow key={{entity}._id}>
                  <TableCell>
                    <div>
                      <button
                        className="font-medium hover:text-primary cursor-pointer text-left"
                        onClick={() => on[Entity]Click?.({entity})}
                      >
                        {{entity}.title}
                      </button>
                      {{entity}.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {{entity}.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant({entity}.status)}>
                      {t(`status.${{entity}.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant({entity}.priority)}>
                      {t(`priority.${{entity}.priority}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {{entity}.category || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {{entity}.dueDate ? (
                      <span className={isOverdue ? "text-destructive font-medium" : ""}>
                        {new Date({entity}.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {{entity}.progress !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${{entity}.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{{entity}.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => on[Entity]Click?.({entity})}
                        >
                          {t("table.actions.view")}
                        </Button>
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit({entity})}
                          >
                            {t("table.actions.edit")}
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete({entity})}
                          >
                            {t("table.actions.delete")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
