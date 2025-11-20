// src/features/boilerplate/[module_name]/pages/[Entity]DetailsPage.tsx

import { FC, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Loading,
  ErrorState,
} from "@/components/ui";
import { use[Entity], use[Entity]Actions } from "../hooks/use[Entities]";
import { useCanEdit[Entity], useCanDelete[Entity] } from "../hooks/use[Entity]Permissions";
import { [Entity]FormModal } from "../components/[Entity]FormModal";
import { useTranslation } from "@/features/boilerplate/i18n";
import { useToast } from "@/features/boilerplate/notifications";
import { getCurrentLocale } from "@/features/boilerplate/i18n/utils/path";
import type { Update[Entity]Data } from "../types";
import * as {entity}Helpers from "../utils/{entity}Helpers";

export const [Entity]DetailsPage: FC = () => {
  const { {entity}Id } = useParams({ from: "/$locale/[feature-path]/${entity}Id" });
  const navigate = useNavigate();
  const locale = getCurrentLocale();
  const { t } = useTranslation("[module_name]");
  const toast = useToast();

  // State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Data hooks
  const { data: {entity}, isLoading, error } = use[Entity]({entity}Id);
  const { update[Entity], delete[Entity] } = use[Entity]Actions();

  // Permission hooks
  const canEdit = useCanEdit[Entity]({entity}Id);
  const canDelete = useCanDelete[Entity]({entity}Id);

  // Handlers
  const handleUpdate = async (data: Update[Entity]Data) => {
    try {
      await update[Entity]({ {entity}Id, data });
      toast.success(t("details.messages.updateSuccess"));
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(t("details.messages.updateError"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("details.confirmDelete"))) {
      return;
    }

    try {
      await delete[Entity]({entity}Id);
      toast.success(t("details.messages.deleteSuccess"));
      navigate({ to: `/${locale}/[feature-path]` });
    } catch (error) {
      toast.error(t("details.messages.deleteError"));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error || !entity) {
    return (
      <div className="container mx-auto py-6">
        <ErrorState
          title={t("details.errors.loadFailed")}
          message={error?.message || t("details.errors.notFound")}
          onRetry={() => navigate({ to: `/${locale}/[feature-path]` })}
        />
      </div>
    );
  }

  // Helper values
  const isOverdue = {entity}Helpers.is[Entity]Overdue({entity});
  const health = {entity}Helpers.calculate[Entity]Health({entity});

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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: `/${locale}/[feature-path]` })}
            >
              ← {t("details.backTo[Entities]")}
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{{entity}.title}</h1>
          {{entity}.category && (
            <p className="text-muted-foreground mt-1">{{entity}.category}</p>
          )}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={() => setIsEditModalOpen(true)}>
              {t("details.actions.edit")}
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              {t("details.actions.delete")}
            </Button>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2">
        <Badge variant={getStatusVariant({entity}.status)}>
          {t(`status.${{entity}.status}`)}
        </Badge>
        <Badge variant={getPriorityVariant({entity}.priority)}>
          {t(`priority.${{entity}.priority}`)}
        </Badge>
        {isOverdue && (
          <Badge variant="destructive">{t("details.badges.overdue")}</Badge>
        )}
        {health && (
          <Badge variant={health === "critical" ? "destructive" : "default"}>
            {t(`health.${health}`)}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t("details.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="details">{t("details.tabs.details")}</TabsTrigger>
          <TabsTrigger value="activity">{t("details.tabs.activity")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("details.sections.overview")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              {{entity}.description && (
                <div>
                  <h3 className="font-semibold mb-2">{t("details.fields.description")}</h3>
                  <p className="text-muted-foreground">{{entity}.description}</p>
                </div>
              )}

              {/* Progress */}
              {{entity}.progress !== undefined && (
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{t("details.fields.progress")}</h3>
                    <span className="font-medium">{{entity}.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${{entity}.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {{entity}.startDate && (
                  <div>
                    <h3 className="font-semibold mb-1">{t("details.fields.startDate")}</h3>
                    <p className="text-muted-foreground">
                      {new Date({entity}.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {{entity}.dueDate && (
                  <div>
                    <h3 className="font-semibold mb-1">{t("details.fields.dueDate")}</h3>
                    <p className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
                      {new Date({entity}.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {{entity}.tags && {entity}.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">{t("details.fields.tags")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {{entity}.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("details.sections.details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">{t("details.fields.createdAt")}</h3>
                  <p className="text-muted-foreground">
                    {new Date({entity}.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("details.fields.updatedAt")}</h3>
                  <p className="text-muted-foreground">
                    {new Date({entity}.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("details.fields.visibility")}</h3>
                  <Badge>{t(`visibility.${{entity}.visibility}`)}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("details.fields.publicId")}</h3>
                  <code className="text-sm bg-secondary px-2 py-1 rounded">
                    {{entity}.publicId}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>{t("details.sections.activity")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t("details.activityPlaceholder")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <[Entity]FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        initialData={{entity}}
        onSubmit={handleUpdate}
      />
    </div>
  );
};
