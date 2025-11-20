// src/features/boilerplate/notifications/services/NotificationService.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Notifications Service
 *
 * Handles data fetching and mutations for notifications.
 * ⚠️ NO authentication/authorization logic here - that's in the backend!
 */
export class NotificationService {
  private static instance: NotificationService | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ==========================================
  // QUERY OPTION FACTORIES
  // These methods return query options that can be used in both loaders and hooks
  // ensuring consistent query keys for SSR cache hits
  // ==========================================

  public getNotificationsQueryOptions() {
    return convexQuery(api.lib.boilerplate.notifications.queries.getNotifications, {});
  }

  public getUnreadCountQueryOptions() {
    return convexQuery(api.lib.boilerplate.notifications.queries.getUnreadCount, {});
  }

  public getNotificationSettingsQueryOptions() {
    // Notification settings are stored in userSettings.notificationPreferences
    return convexQuery(api.lib.boilerplate.user_settings.queries.getUserSettings, {});
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  public useNotifications() {
    return useQuery({
      ...this.getNotificationsQueryOptions(),
      staleTime: 30000, // 30 seconds
    });
  }

  public useUnreadCount() {
    return useQuery({
      ...this.getUnreadCountQueryOptions(),
      staleTime: 10000, // 10 seconds - refresh more frequently
    });
  }

  public useNotificationSettings() {
    return useQuery({
      ...this.getNotificationSettingsQueryOptions(),
      staleTime: 60000, // 1 minute
    });
  }

  // ==========================================
  // MUTATION HOOKS
  // ==========================================

  public useMarkAsRead() {
    return useConvexMutation(api.lib.boilerplate.notifications.mutations.markAsRead);
  }

  public useMarkAllAsRead() {
    return useConvexMutation(api.lib.boilerplate.notifications.mutations.markAllAsRead);
  }

  public useDeleteNotification() {
    return useConvexMutation(api.lib.boilerplate.notifications.mutations.deleteNotification);
  }

  public useUpdateSettings() {
    // Notification settings are part of userSettings.notificationPreferences
    return useConvexMutation(api.lib.boilerplate.user_settings.mutations.updateUserSettings);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
