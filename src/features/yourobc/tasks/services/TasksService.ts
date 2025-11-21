// src/features/yourobc/tasks/services/TasksService.ts

import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateTaskData,
  UpdateTaskData,
  TaskId,
  TaskFormData,
  TaskStatus,
  TaskFilters,
} from '../types'

export class TasksService {
  // ========================================
  // QUERY HOOKS
  // ========================================

  useTasks(
    authUserId: string,
    shipmentId?: Id<'yourobcShipments'>,
    includeCompleted?: boolean
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getTasksByShipment, {
        authUserId,
        shipmentId: shipmentId!,
        includeCompleted,
      }),
      staleTime: 60000, // 1 minute
      enabled: !!authUserId && !!shipmentId,
    })
  }

  useNextTask(authUserId: string, shipmentId?: Id<'yourobcShipments'>) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getNextTaskForShipment, {
        authUserId,
        shipmentId: shipmentId!,
      }),
      staleTime: 60000,
      enabled: !!authUserId && !!shipmentId,
    })
  }

  useTasksByAssignee(
    authUserId: string,
    userId?: Id<'userProfiles'>,
    status?: TaskStatus
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getTasksByAssignee, {
        authUserId,
        userId: userId!,
        status,
      }),
      staleTime: 60000,
      enabled: !!authUserId && !!userId,
    })
  }

  useAllPendingTasks(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getAllPendingTasks, { authUserId }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useOverdueTasks(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getOverdueTasks, { authUserId }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useTasksDueToday(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getTasksDueToday, { authUserId }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useAllTasks(authUserId: string, filters?: TaskFilters) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getAllTasks, { authUserId }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useTasksByStatus(authUserId: string, status: TaskStatus) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getTasksByStatus, { authUserId, status }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useTaskStats(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getTaskStats, { authUserId }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useTask(authUserId: string, taskId?: TaskId) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.tasks.queries.getTask, {
        authUserId,
        taskId: taskId!,
      }),
      staleTime: 60000,
      enabled: !!authUserId && !!taskId,
    })
  }

  // ========================================
  // MUTATION HOOKS
  // ========================================

  useCreateTask() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tasks.mutations.createTask)
    })
  }

  useUpdateTask() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tasks.mutations.updateTask)
    })
  }

  useCompleteTask() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tasks.mutations.completeTask)
    })
  }

  useCancelTask() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tasks.mutations.cancelTask)
    })
  }

  useDeleteTask() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tasks.mutations.deleteTask)
    })
  }

  useAssignTask() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tasks.mutations.assignTask)
    })
  }

  useUnassignTask() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tasks.mutations.unassignTask)
    })
  }

  useStartTask() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tasks.mutations.startTask)
    })
  }

  useBulkCompleteTasks() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.tasks.mutations.bulkCompleteTasks)
    })
  }

  // ========================================
  // MUTATION ACTIONS
  // ========================================

  async createTask(
    mutation: ReturnType<typeof this.useCreateTask>,
    authUserId: string,
    data: CreateTaskData
  ) {
    return await mutation.mutateAsync({ authUserId, ...data })
  }

  async updateTask(
    mutation: ReturnType<typeof this.useUpdateTask>,
    authUserId: string,
    taskId: TaskId,
    data: UpdateTaskData
  ) {
    return await mutation.mutateAsync({ authUserId, taskId, ...data })
  }

  async completeTask(
    mutation: ReturnType<typeof this.useCompleteTask>,
    authUserId: string,
    taskId: TaskId,
    completionNotes?: string
  ) {
    return await mutation.mutateAsync({
      authUserId,
      taskId,
      notes: completionNotes,
    })
  }

  async cancelTask(
    mutation: ReturnType<typeof this.useCancelTask>,
    authUserId: string,
    taskId: TaskId,
    reason?: string
  ) {
    return await mutation.mutateAsync({
      authUserId,
      taskId,
      reason,
    })
  }

  async deleteTask(
    mutation: ReturnType<typeof this.useDeleteTask>,
    authUserId: string,
    taskId: TaskId
  ) {
    return await mutation.mutateAsync({ authUserId, taskId })
  }

  async assignTask(
    mutation: ReturnType<typeof this.useAssignTask>,
    authUserId: string,
    taskId: TaskId,
    userId: Id<'userProfiles'>
  ) {
    return await mutation.mutateAsync({
      authUserId,
      taskId,
      userId,
    })
  }

  async unassignTask(
    mutation: ReturnType<typeof this.useUnassignTask>,
    authUserId: string,
    taskId: TaskId
  ) {
    return await mutation.mutateAsync({ authUserId, taskId })
  }

  async startTask(
    mutation: ReturnType<typeof this.useStartTask>,
    authUserId: string,
    taskId: TaskId
  ) {
    return await mutation.mutateAsync({
      authUserId,
      taskId,
    })
  }

  async bulkCompleteTasks(
    mutation: ReturnType<typeof this.useBulkCompleteTasks>,
    authUserId: string,
    taskIds: TaskId[],
    notes?: string
  ) {
    return await mutation.mutateAsync({
      authUserId,
      taskIds,
      notes,
    })
  }

  // ========================================
  // VALIDATION
  // ========================================

  validateTaskData(data: Partial<TaskFormData>): string[] {
    const errors: string[] = []

    if (data.title !== undefined) {
      const trimmedTitle = data.title.trim()
      if (trimmedTitle.length === 0) {
        errors.push('Task title is required')
      }
      if (trimmedTitle.length < 3) {
        errors.push('Task title must be at least 3 characters')
      }
      if (trimmedTitle.length > 200) {
        errors.push('Task title must be less than 200 characters')
      }
    }

    if (data.description !== undefined && data.description) {
      if (data.description.trim().length > 1000) {
        errors.push('Task description must be less than 1000 characters')
      }
    }

    if (data.priority !== undefined) {
      if (!['low', 'medium', 'high', 'critical'].includes(data.priority)) {
        errors.push('Invalid task priority')
      }
    }

    if (data.dueDate !== undefined && data.dueDate) {
      if (data.dueDate < Date.now()) {
        errors.push('Due date cannot be in the past')
      }
    }

    return errors
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  isTaskOverdue(task: { status: TaskStatus; dueDate?: number }): boolean {
    if (!task.dueDate) return false
    if (task.status === 'completed' || task.status === 'cancelled') return false
    return task.dueDate < Date.now()
  }

  getTimeUntilDue(dueDate: number): string {
    const now = Date.now()
    const diff = dueDate - now

    if (diff < 0) {
      const absHours = Math.abs(diff / (1000 * 60 * 60))
      if (absHours < 24) {
        return `${Math.floor(absHours)} hours ago`
      }
      return `${Math.floor(absHours / 24)} days ago`
    }

    const hours = diff / (1000 * 60 * 60)
    if (hours < 1) {
      return `in ${Math.floor(diff / (1000 * 60))} minutes`
    }
    if (hours < 24) {
      return `in ${Math.floor(hours)} hours`
    }
    return `in ${Math.floor(hours / 24)} days`
  }

  formatTaskTitle(task: { title: string }): string {
    return task.title.trim()
  }

  getPriorityColor(priority: 'low' | 'medium' | 'high' | 'critical'): string {
    const colors = {
      low: '#6b7280',
      medium: '#3b82f6',
      high: '#f59e0b',
      critical: '#ef4444',
    }
    return colors[priority] || colors.medium
  }

  getStatusColor(status: TaskStatus): string {
    const colors = {
      pending: '#6b7280',
      in_progress: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
    }
    return colors[status] || colors.pending
  }

  getPriorityLabel(priority: 'low' | 'medium' | 'high' | 'critical'): string {
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    }
    return labels[priority] || 'Medium'
  }

  getStatusLabel(status: TaskStatus): string {
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
    return labels[status] || 'Pending'
  }

  calculateTaskUrgency(task: {
    priority: 'low' | 'medium' | 'high' | 'critical'
    dueDate?: number
    status: TaskStatus
  }): 'low' | 'medium' | 'high' | 'critical' {
    if (task.status === 'completed' || task.status === 'cancelled') {
      return 'low'
    }

    const isOverdue = this.isTaskOverdue(task)
    if (isOverdue) {
      return 'critical'
    }

    if (task.priority === 'critical') return 'critical'
    if (task.priority === 'high') return 'high'

    // Check if due soon (within 24 hours)
    if (task.dueDate && task.dueDate - Date.now() < 24 * 60 * 60 * 1000) {
      return task.priority === 'medium' ? 'high' : 'medium'
    }

    return task.priority
  }

  isTaskActive(task: { status: TaskStatus }): boolean {
    return task.status === 'pending' || task.status === 'in_progress'
  }

  canTaskBeEdited(task: { status: TaskStatus }): boolean {
    return task.status !== 'completed' && task.status !== 'cancelled'
  }

  canTaskBeCompleted(task: { status: TaskStatus }): boolean {
    return task.status === 'pending' || task.status === 'in_progress'
  }

  canTaskBeStarted(task: { status: TaskStatus }): boolean {
    return task.status === 'pending'
  }

  canTaskBeCancelled(task: { status: TaskStatus }): boolean {
    return task.status === 'pending' || task.status === 'in_progress'
  }
}

// Export singleton instance
export const tasksService = new TasksService()
