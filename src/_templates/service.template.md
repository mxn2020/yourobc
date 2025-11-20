// src/features/boilerplate/[module_name]/services/[Entities]Service.ts

import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { Create[Entity]Data, Update[Entity]Data, [Entity]Id, [Entities]ListOptions } from "../types";
import type { Id } from "@/convex/_generated/dataModel";
import * as {entity}Helpers from "../utils/{entity}Helpers";

/**
 * [Entities] Service
 *
 * Handles data fetching and mutations.
 * ⚠️ NO authentication/authorization logic here - that's in the backend!
 */
export class [Entities]Service {
  // ==========================================
  // QUERY OPTION FACTORIES
  // These methods return query options that can be used in both loaders and hooks
  // ensuring consistent query keys for SSR cache hits
  // ==========================================

  get[Entities]QueryOptions(options?: [Entities]ListOptions) {
    return convexQuery(api.lib.boilerplate.[module_name].queries.get[Entities], {
      options,
    });
  }

  get[Entity]QueryOptions({entity}Id: [Entity]Id) {
    return convexQuery(api.lib.boilerplate.[module_name].queries.get[Entity], {
      {entity}Id,
    });
  }

  get[Entity]ByPublicIdQueryOptions(publicId: string) {
    return convexQuery(api.lib.boilerplate.[module_name].queries.get[Entity]ByPublicId, {
      publicId,
    });
  }

  getUser[Entities]QueryOptions(options?: {
    targetUserId?: Id<"userProfiles">;
    includeArchived?: boolean;
    limit?: number;
  }) {
    return convexQuery(api.lib.boilerplate.[module_name].queries.getUser[Entities], options || {});
  }

  get[Entity]StatsQueryOptions(targetUserId?: Id<"userProfiles">) {
    return convexQuery(api.lib.boilerplate.[module_name].queries.get[Entity]Stats, {
      targetUserId,
    });
  }

  getDashboardStatsQueryOptions() {
    return convexQuery(api.lib.boilerplate.[module_name].queries.getDashboardStats, {});
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  use[Entities](options?: [Entities]ListOptions) {
    return useQuery({
      ...this.get[Entities]QueryOptions(options),
      staleTime: 30000, // 30 seconds
    });
  }

  use[Entity]({entity}Id?: [Entity]Id) {
    return useQuery({
      ...this.get[Entity]QueryOptions({entity}Id!),
      staleTime: 30000,
      enabled: !!{entity}Id,
    });
  }

  use[Entity]ByPublicId(publicId?: string) {
    return useQuery({
      ...this.get[Entity]ByPublicIdQueryOptions(publicId!),
      staleTime: 30000,
      enabled: !!publicId,
    });
  }

  useUser[Entities](options?: {
    targetUserId?: Id<"userProfiles">;
    includeArchived?: boolean;
    limit?: number;
  }) {
    return useQuery({
      ...this.getUser[Entities]QueryOptions(options),
      staleTime: 30000,
    });
  }

  use[Entity]Stats(targetUserId?: Id<"userProfiles">) {
    return useQuery({
      ...this.get[Entity]StatsQueryOptions(targetUserId),
      staleTime: 60000, // 1 minute
    });
  }

  useDashboardStats() {
    return useQuery({
      ...this.getDashboardStatsQueryOptions(),
      staleTime: 60000,
    });
  }

  // ==========================================
  // MUTATION HOOKS
  // ==========================================

  useCreate[Entity]() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.[module_name].mutations.create[Entity]);
    return useMutation({ mutationFn });
  }

  useUpdate[Entity]() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.[module_name].mutations.update[Entity]);
    return useMutation({ mutationFn });
  }

  useDelete[Entity]() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.[module_name].mutations.delete[Entity]);
    return useMutation({ mutationFn });
  }

  useArchive[Entity]() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.[module_name].mutations.archive[Entity]);
    return useMutation({ mutationFn });
  }

  useRestore[Entity]() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.[module_name].mutations.restore[Entity]);
    return useMutation({ mutationFn });
  }

  // ==========================================
  // UTILITY FUNCTIONS (No Auth Logic)
  // ==========================================

  format[Entity]Name({entity}: { title: string; _id?: [Entity]Id }): string {
    return {entity}.title || `[Entity] ${{entity}._id || "Unknown"}`;
  }

  // ==========================================
  // UTILITY METHODS (delegate to {entity}Helpers)
  // @deprecated Import directly from utils/{entity}Helpers for better layer separation
  // ==========================================

  calculate[Entity]Health({entity}: {
    status: string;
    progress?: number;
    dueDate?: number;
  }): string {
    return {entity}Helpers.calculate[Entity]Health({entity});
  }

  validate[Entity]Data(data: Partial<Create[Entity]Data | Update[Entity]Data>): string[] {
    return {entity}Helpers.validate[Entity]Data(data);
  }

  is[Entity]Overdue({entity}: { dueDate?: number; status: string }): boolean {
    return {entity}Helpers.is[Entity]Overdue({entity});
  }

  getDaysUntilDue(dueDate: number): number {
    return {entity}Helpers.getDaysUntilDue(dueDate);
  }

  get[Entity]StatusColor(status: string): string {
    return {entity}Helpers.get[Entity]StatusColor(status);
  }

  get[Entity]PriorityColor(priority: string): string {
    return {entity}Helpers.get[Entity]PriorityColor(priority);
  }
}

export const [entities]Service = new [Entities]Service();
