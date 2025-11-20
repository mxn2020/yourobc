// src/features/boilerplate/[module_name]/hooks/use[Entities].ts

import { useCallback, useMemo, useEffect, useRef } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { use[Entity]Audit } from "./use[Entity]Audit";
import { [entities]Service } from "../services/[Entities]Service";
import { parseConvexError } from "@/utils/errorHandling";
import * as {entity}Helpers from "../utils/{entity}Helpers";
import type {
  Create[Entity]Data,
  [Entity]Id,
  [Entities]ListOptions,
  Update[Entity]Data,
} from "../types";
import { Id } from "@/convex/_generated/dataModel";

// Generate unique ID for each hook instance
let instanceCounter = 0;

/**
 * Main [entities] hook
 * Handles data fetching, mutations, and audit logging
 */
export function use[Entities](options?: [Entities]ListOptions) {
  // Create unique timer ID for this hook instance
  const instanceId = useRef(++instanceCounter);
  const timerLabel = `use[Entities]: Data Fetch [${instanceId.current}]`;

  // Track data fetching performance with unique timer ID
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    startTimeRef.current = performance.now();
  }, []);

  // Core data queries
  const { data: [entities]Query, isPending, error, refetch } = [entities]Service.use[Entities](options);

  // Stats query
  const { data: stats, isPending: isStatsLoading } = [entities]Service.use[Entity]Stats();

  // Log when data is loaded (dev mode only)
  useEffect(() => {
    if (import.meta.env.DEV && !isPending && [entities]Query) {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        const source = duration < 10 ? "from SSR cache" : "from WebSocket";
        console.log(
          `${timerLabel}: ${duration.toFixed(2)}ms - Loaded ${
            [entities]Query.[entities]?.length || 0
          } [entities] ${source}`
        );
        startTimeRef.current = undefined; // Clear to prevent duplicate logs
      }
    }
  }, [isPending, [entities]Query, timerLabel]);

  // Audit logging
  const {
    log[Entity]Created,
    log[Entity]Updated,
    log[Entity]Deleted,
    log[Entity]Viewed,
  } = use[Entity]Audit();

  // Mutations
  const create[Entity]Mutation = [entities]Service.useCreate[Entity]();
  const update[Entity]Mutation = [entities]Service.useUpdate[Entity]();
  const delete[Entity]Mutation = [entities]Service.useDelete[Entity]();

  // Parse error
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null;
  }, [error]);

  const isPermissionError = parsedError?.code === "PERMISSION_DENIED";

  // Enhanced action functions with audit logging
  const create[Entity] = useCallback(
    async (data: Create[Entity]Data) => {
      const errors = {entity}Helpers.validate[Entity]Data(data);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      const result = await create[Entity]Mutation.mutateAsync({ data });

      // ✅ No try-catch needed - audit hook handles failures internally
      log[Entity]Created(result._id, data.title, data);

      return result;
    },
    [create[Entity]Mutation, log[Entity]Created]
  );

  const update[Entity] = useCallback(
    async ({entity}Id: [Entity]Id, updates: Update[Entity]Data) => {
      const errors = {entity}Helpers.validate[Entity]Data(updates);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      const current[Entity] = [entities]Query?.[entities]?.find((p) => p._id === {entity}Id);
      if (!current[Entity]) {
        throw new Error("[Entity] not found");
      }

      const result = await update[Entity]Mutation.mutateAsync({
        {entity}Id,
        updates,
      });

      // ✅ Clean - no error handling needed
      log[Entity]Updated({entity}Id, current[Entity].title, current[Entity], updates);

      return result;
    },
    [update[Entity]Mutation, log[Entity]Updated, [entities]Query]
  );

  const delete[Entity] = useCallback(
    async ({entity}Id: [Entity]Id, hardDelete = false) => {
      const {entity}ToDelete = [entities]Query?.[entities]?.find((p) => p._id === {entity}Id);
      if (!{entity}ToDelete) {
        throw new Error("[Entity] not found");
      }

      const result = await delete[Entity]Mutation.mutateAsync({ {entity}Id, hardDelete });

      // Log deletion
      log[Entity]Deleted({entity}Id, {entity}ToDelete.title, {entity}ToDelete, hardDelete).catch(
        console.warn
      );

      return result;
    },
    [delete[Entity]Mutation, log[Entity]Deleted, [entities]Query]
  );

  const view[Entity] = useCallback(
    async ({entity}Id: [Entity]Id) => {
      const {entity} = [entities]Query?.[entities]?.find((p) => p._id === {entity}Id);
      if ({entity} && {entity}.visibility === "private") {
        log[Entity]Viewed({entity}Id, {entity}.title).catch(console.warn);
      }
    },
    [log[Entity]Viewed, [entities]Query]
  );

  return {
    // Data
    [entities]: [entities]Query?.[entities] || [],
    total: [entities]Query?.total || 0,
    hasMore: [entities]Query?.hasMore || false,
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    stats,

    // Actions
    create[Entity],
    update[Entity],
    delete[Entity],
    view[Entity],
    refetch,
  };
}

/**
 * Get single {entity} by ID
 */
export function use[Entity]({entity}Id: Id<"[tableName]">) {
  return [entities]Service.use[Entity]({entity}Id);
}

/**
 * Get [entities] list with options
 */
export function use[Entities]List(options?: [Entities]ListOptions) {
  return [entities]Service.use[Entities](options);
}

/**
 * Get user's [entities] (owned + collaborated)
 */
export function useUser[Entities](options?: { includeArchived?: boolean }) {
  return [entities]Service.useUser[Entities](options);
}

/**
 * Get {entity} stats
 */
export function use[Entity]Stats() {
  return [entities]Service.use[Entity]Stats();
}

/**
 * [Entity] actions hook (without data fetching)
 */
export function use[Entity]Actions() {
  const create[Entity]Mutation = [entities]Service.useCreate[Entity]();
  const update[Entity]Mutation = [entities]Service.useUpdate[Entity]();
  const delete[Entity]Mutation = [entities]Service.useDelete[Entity]();

  const {
    log[Entity]Created,
    log[Entity]Updated,
    log[Entity]Deleted,
    log[Entity]Viewed,
  } = use[Entity]Audit();

  const create[Entity] = useCallback(
    async (data: Create[Entity]Data) => {
      const result = await create[Entity]Mutation.mutateAsync({ data });
      log[Entity]Created(result._id, data.title, data);
      return result;
    },
    [create[Entity]Mutation, log[Entity]Created]
  );

  const update[Entity] = useCallback(
    async ({entity}Id: [Entity]Id, updates: Update[Entity]Data) => {
      const result = await update[Entity]Mutation.mutateAsync({ {entity}Id, updates });
      log[Entity]Updated({entity}Id, updates.title || "", {}, updates);
      return result;
    },
    [update[Entity]Mutation, log[Entity]Updated]
  );

  const delete[Entity] = useCallback(
    async ({entity}Id: [Entity]Id, hardDelete = false) => {
      const result = await delete[Entity]Mutation.mutateAsync({ {entity}Id, hardDelete });
      log[Entity]Deleted({entity}Id, "", {}, hardDelete);
      return result;
    },
    [delete[Entity]Mutation, log[Entity]Deleted]
  );

  const view[Entity] = useCallback(
    async ({entity}Id: [Entity]Id, title: string) => {
      log[Entity]Viewed({entity}Id, title);
    },
    [log[Entity]Viewed]
  );

  return {
    create[Entity],
    update[Entity],
    delete[Entity],
    view[Entity],
  };
}
