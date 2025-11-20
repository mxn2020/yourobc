// src/features/notifications/services/notification-triggers.ts
import { api } from '@/convex/_generated/api'
import type { FunctionReference } from 'convex/server'
import type { Id } from '@/convex/_generated/dataModel'

/**
 * Notification trigger helpers to be used in Convex mutations
 * These functions create notification objects to be passed to createNotification
 */

export const notificationTriggers = {
  // Project-related notifications
  projectAssigned: (assignedTo: string, projectTitle: string, projectId: Id<'projects'>) => ({
    userId: assignedTo,
    type: 'assignment',
    title: 'New Project Assignment',
    message: `You've been assigned to project "${projectTitle}"`,
    emoji: '📋',
    actionUrl: `/projects/${projectId}`,
    entityType: 'project',
    entityId: projectId,
  }),

  projectCompleted: (ownerId: string, projectTitle: string, projectId: Id<'projects'>, completedBy: string) => ({
    userId: ownerId,
    type: 'completion',
    title: 'Project Completed',
    message: `Project "${projectTitle}" has been marked as completed by ${completedBy}`,
    emoji: '✅',
    actionUrl: `/projects/${projectId}`,
    entityType: 'project',
    entityId: projectId,
  }),

  projectInvite: (invitedUserId: string, projectTitle: string, projectId: Id<'projects'>, invitedBy: string) => ({
    userId: invitedUserId,
    type: 'invite',
    title: 'Project Invitation',
    message: `${invitedBy} invited you to join "${projectTitle}"`,
    emoji: '💌',
    actionUrl: `/projects/${projectId}`,
    entityType: 'project',
    entityId: projectId,
  }),

  // Task-related notifications
  taskAssigned: (assignedTo: string, taskTitle: string, projectTitle: string, taskId: string) => ({
    userId: assignedTo,
    type: 'assignment',
    title: 'New Task Assignment',
    message: `You've been assigned task "${taskTitle}" in "${projectTitle}"`,
    emoji: '📝',
    actionUrl: `/projects/${taskId}`,
    entityType: 'task',
    entityId: taskId,
  }),

  taskCompleted: (ownerId: string, taskTitle: string, projectTitle: string, taskId: string, completedBy: string) => ({
    userId: ownerId,
    type: 'completion',
    title: 'Task Completed',
    message: `Task "${taskTitle}" in "${projectTitle}" was completed by ${completedBy}`,
    emoji: '✅',
    actionUrl: `/projects/${taskId}`,
    entityType: 'task',
    entityId: taskId,
  }),

  // Achievement notifications
  achievementUnlocked: (userId: Id<"userProfiles">, achievementName: string, achievementDescription: string) => ({
    userId,
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: `You unlocked "${achievementName}" - ${achievementDescription}`,
    emoji: '🏆',
  }),

  // Reminder notifications
  projectReminder: (userId: Id<"userProfiles">, projectTitle: string, projectId: Id<'projects'>, dueDate: Date) => ({
    userId,
    type: 'reminder',
    title: 'Project Due Soon',
    message: `Project "${projectTitle}" is due on ${dueDate.toLocaleDateString()}`,
    emoji: '⏰',
    actionUrl: `/projects/${projectId}`,
    entityType: 'project',
    entityId: projectId,
  }),

  taskReminder: (userId: Id<"userProfiles">, taskTitle: string, taskId: string, dueDate: Date) => ({
    userId,
    type: 'reminder',
    title: 'Task Due Soon',
    message: `Task "${taskTitle}" is due on ${dueDate.toLocaleDateString()}`,
    emoji: '⏰',
    actionUrl: `/projects/${taskId}`,
    entityType: 'task',
    entityId: taskId,
  }),

  // System notifications
  systemUpdate: (userId: Id<"userProfiles">, updateTitle: string, updateMessage: string) => ({
    userId,
    type: 'info' as const, // Using 'info' type for system messages
    title: updateTitle,
    message: updateMessage,
    emoji: '📢',
  }),

  // Billing notifications
  subscriptionExpiring: (userId: Id<"userProfiles">, daysLeft: number) => ({
    userId,
    type: 'info' as const, // Using 'info' type for billing info
    title: 'Subscription Expiring Soon',
    message: `Your subscription will expire in ${daysLeft} days. Please renew to continue using all features.`,
    emoji: '💳',
    actionUrl: '/billing',
  }),

  paymentFailed: (userId: Id<"userProfiles">) => ({
    userId,
    type: 'error' as const, // Using 'error' type for payment failures
    title: 'Payment Failed',
    message: 'We were unable to process your payment. Please update your payment method.',
    emoji: '❌',
    actionUrl: '/billing',
  }),

  // Info notifications
  infoNotification: (userId: Id<"userProfiles">, title: string, message: string, actionUrl?: string) => ({
    userId,
    type: 'info' as const,
    title,
    message,
    emoji: 'ℹ️',
    actionUrl,
  }),

  // Success notifications
  successNotification: (userId: Id<"userProfiles">, title: string, message: string, actionUrl?: string) => ({
    userId,
    type: 'success' as const,
    title,
    message,
    emoji: '✅',
    actionUrl,
  }),

  // Error notifications
  errorNotification: (userId: Id<"userProfiles">, title: string, message: string, actionUrl?: string) => ({
    userId,
    type: 'error' as const,
    title,
    message,
    emoji: '❌',
    actionUrl,
  }),

  // Permission request notifications
  permissionRequested: (adminUserId: Id<"userProfiles">, requesterName: string, permission: string) => ({
    userId: adminUserId,
    type: 'info' as const,
    title: 'New Permission Request',
    message: `${requesterName} has requested ${permission} permission`,
    emoji: '🔑',
    actionUrl: '/admin/permission-requests',
  }),

  permissionApproved: (userId: Id<"userProfiles">, permission: string) => ({
    userId,
    type: 'success' as const,
    title: 'Permission Request Approved',
    message: `Your request for ${permission} permission has been approved`,
    emoji: '✅',
  }),

  permissionDenied: (userId: Id<"userProfiles">, permission: string) => ({
    userId,
    type: 'error' as const,
    title: 'Permission Request Denied',
    message: `Your request for ${permission} permission has been denied`,
    emoji: '❌',
  }),
}

/**
 * Helper function to create a notification in a Convex mutation
 * This should be called within Convex mutation handlers
 * 
 * Example usage in a Convex mutation:
 * 
 * await ctx.db.insert('notifications', {
 *   ...notificationTriggers.projectAssigned(userId, projectTitle, projectId),
 *   id: crypto.randomUUID(),
 *   isRead: false,
 *   createdAt: Date.now(),
 *   updatedAt: Date.now(),
 * })
 */
export function createNotificationData(trigger: ReturnType<typeof notificationTriggers[keyof typeof notificationTriggers]>) {
  return {
    ...trigger,
    id: crypto.randomUUID(),
    isRead: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}