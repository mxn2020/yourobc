// src/features/boilerplate/[module_name]/hooks/use[Entity]Audit.ts

import { useCallback } from "react";
import { useAuditLog } from "@/features/boilerplate/audit";
import type { [Entity], Create[Entity]Data, Update[Entity]Data } from "../types";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * [Entity] audit logging hook
 * Provides type-safe audit logging functions for {entity} operations
 */
export function use[Entity]Audit() {
  const { logAction } = useAuditLog();

  const log[Entity]Created = useCallback(
    async ({entity}Id: Id<"[tableName]">, title: string, data: Create[Entity]Data) => {
      return logAction({
        action: "[module_name].{entity}.created",
        entityType: "[module_name]_{entity}",
        entityId: {entity}Id,
        entityTitle: title,
        description: `Created {entity}: ${title}`,
        metadata: {
          priority: data.priority,
          category: data.category,
          visibility: data.visibility,
          tags: data.tags,
        },
      });
    },
    [logAction]
  );

  const log[Entity]Updated = useCallback(
    async (
      {entity}Id: Id<"[tableName]">,
      title: string,
      before: Partial<[Entity]>,
      after: Update[Entity]Data
    ) => {
      const changes: string[] = [];

      if (after.title && after.title !== before.title) {
        changes.push(`title: "${before.title}" → "${after.title}"`);
      }

      if (after.status && after.status !== before.status) {
        changes.push(`status: ${before.status} → ${after.status}`);
      }

      if (after.priority && after.priority !== before.priority) {
        changes.push(`priority: ${before.priority} → ${after.priority}`);
      }

      if (after.description !== undefined && after.description !== before.description) {
        changes.push("description updated");
      }

      return logAction({
        action: "[module_name].{entity}.updated",
        entityType: "[module_name]_{entity}",
        entityId: {entity}Id,
        entityTitle: title,
        description: `Updated {entity}: ${title}${
          changes.length > 0 ? ` (${changes.join(", ")})` : ""
        }`,
        metadata: {
          changes,
          updatedFields: Object.keys(after),
        },
      });
    },
    [logAction]
  );

  const log[Entity]Deleted = useCallback(
    async (
      {entity}Id: Id<"[tableName]">,
      title: string,
      {entity}: Partial<[Entity]>,
      hardDelete: boolean
    ) => {
      return logAction({
        action: hardDelete ? "[module_name].{entity}.hard_deleted" : "[module_name].{entity}.deleted",
        entityType: "[module_name]_{entity}",
        entityId: {entity}Id,
        entityTitle: title,
        description: hardDelete
          ? `Permanently deleted {entity}: ${title}`
          : `Deleted {entity}: ${title}`,
        metadata: {
          hardDelete,
          status: {entity}.status,
          category: {entity}.category,
        },
      });
    },
    [logAction]
  );

  const log[Entity]Viewed = useCallback(
    async ({entity}Id: Id<"[tableName]">, title: string) => {
      return logAction({
        action: "[module_name].{entity}.viewed",
        entityType: "[module_name]_{entity}",
        entityId: {entity}Id,
        entityTitle: title,
        description: `Viewed {entity}: ${title}`,
        metadata: {},
      });
    },
    [logAction]
  );

  const log[Entity]Archived = useCallback(
    async ({entity}Id: Id<"[tableName]">, title: string) => {
      return logAction({
        action: "[module_name].{entity}.archived",
        entityType: "[module_name]_{entity}",
        entityId: {entity}Id,
        entityTitle: title,
        description: `Archived {entity}: ${title}`,
        metadata: {},
      });
    },
    [logAction]
  );

  const log[Entity]Restored = useCallback(
    async ({entity}Id: Id<"[tableName]">, title: string) => {
      return logAction({
        action: "[module_name].{entity}.restored",
        entityType: "[module_name]_{entity}",
        entityId: {entity}Id,
        entityTitle: title,
        description: `Restored {entity}: ${title}`,
        metadata: {},
      });
    },
    [logAction]
  );

  return {
    log[Entity]Created,
    log[Entity]Updated,
    log[Entity]Deleted,
    log[Entity]Viewed,
    log[Entity]Archived,
    log[Entity]Restored,
  };
}
