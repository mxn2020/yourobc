// src/features/system/admin/services/PermissionRequestsService.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Permission Requests Service
 * Handles permission request data fetching and mutations
 */
class PermissionRequestsService {
  // ==========================================
  // QUERY OPTION FACTORIES
  // These methods return query options that can be used in both loaders and hooks
  // ensuring consistent query keys for SSR cache hits
  // ==========================================

  getPermissionRequestsStatsQueryOptions() {
    return convexQuery(api.lib.system.permission_requests.queries.getPermissionRequestsStats, {});
  }

  getAllPermissionRequestsQueryOptions(status?: 'pending' | 'approved' | 'denied') {
    return convexQuery(api.lib.system.permission_requests.queries.getAllPermissionRequests, {
      status,
    });
  }

  getUserPermissionRequestsQueryOptions(userId: Id<'userProfiles'>) {
    return convexQuery(api.lib.system.permission_requests.queries.getUserPermissionRequests, {
      userId,
    });
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  usePermissionRequestsStats() {
    return useQuery({
      ...this.getPermissionRequestsStatsQueryOptions(),
      staleTime: 60000, // 1 minute
    });
  }

  useAllPermissionRequests(status?: 'pending' | 'approved' | 'denied') {
    return useQuery({
      ...this.getAllPermissionRequestsQueryOptions(status),
      staleTime: 30000, // 30 seconds
    });
  }

  useUserPermissionRequests(userId: Id<'userProfiles'>) {
    return useQuery({
      ...this.getUserPermissionRequestsQueryOptions(userId),
      enabled: !!userId,
      staleTime: 30000,
    });
  }

  // ==========================================
  // MUTATION HOOKS
  // ==========================================

  useApprovePermissionRequest() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.permission_requests.mutations.approvePermissionRequest),
    });
  }

  useDenyPermissionRequest() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.permission_requests.mutations.denyPermissionRequest),
    });
  }

  useCreatePermissionRequest() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.permission_requests.mutations.createPermissionRequest),
    });
  }

  useCancelPermissionRequest() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.permission_requests.mutations.cancelPermissionRequest),
    });
  }

  // ==========================================
  // BUSINESS OPERATIONS
  // ==========================================

  async approvePermissionRequest(
    mutation: ReturnType<typeof this.useApprovePermissionRequest>,
    requestId: Id<'permissionRequests'>,
    reviewNotes?: string
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        requestId,
        reviewNotes,
      });
    } catch (error) {
      throw new Error(`Failed to approve permission request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async denyPermissionRequest(
    mutation: ReturnType<typeof this.useDenyPermissionRequest>,
    requestId: Id<'permissionRequests'>,
    reviewNotes?: string
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        requestId,
        reviewNotes,
      });
    } catch (error) {
      throw new Error(`Failed to deny permission request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createPermissionRequest(
    mutation: ReturnType<typeof this.useCreatePermissionRequest>,
    permission: string,
    module: string,
    message?: string
  ): Promise<Id<'permissionRequests'>> {
    try {
      return await mutation.mutateAsync({
        permission,
        module,
        message,
      });
    } catch (error) {
      throw new Error(`Failed to create permission request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cancelPermissionRequest(
    mutation: ReturnType<typeof this.useCancelPermissionRequest>,
    requestId: Id<'permissionRequests'>
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        requestId,
      });
    } catch (error) {
      throw new Error(`Failed to cancel permission request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const permissionRequestsService = new PermissionRequestsService();
