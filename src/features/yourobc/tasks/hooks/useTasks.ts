// src/features/yourobc/tasks/hooks/useTasks.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { tasksService } from '../services/TasksService'
import { TASK_CONSTANTS } from '../types'
import type {
  CreateTaskData,
  UpdateTaskData,
  TaskFormData,
  TaskId,
  TaskListItem,
  TaskInsights,
  TaskSearchFilters,
  TaskStatus,
} from '../types'
import type { Id } from '@/convex/_generated/dataModel'

/**
 * Main hook for task management (all tasks)
 */
export function useTasks(options?: {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: TaskSearchFilters
  autoRefresh?: boolean
}) {
  const authUser = useAuthenticatedUser()

  // ========================================
  // QUERIES
  // ========================================

  const {
    data: tasksQuery,
    isPending,
    error,
    refetch,
  } = tasksService.useAllTasks(authUser?.id!, options?.filters)

  const {
    data: stats,
    isPending: isStatsLoading,
  } = tasksService.useTaskStats(authUser?.id!)

  // ========================================
  // MUTATIONS
  // ========================================

  const createMutation = tasksService.useCreateTask()
  const updateMutation = tasksService.useUpdateTask()
  const completeMutation = tasksService.useCompleteTask()
  const cancelMutation = tasksService.useCancelTask()
  const deleteMutation = tasksService.useDeleteTask()
  const assignMutation = tasksService.useAssignTask()
  const unassignMutation = tasksService.useUnassignTask()
  const startMutation = tasksService.useStartTask()

  // ========================================
  // ACTIONS (with validation & business logic)
  // ========================================

  const createTask = useCallback(async (taskData: TaskFormData) => {
    if (!authUser) throw new Error('Authentication required')

    // Frontend validation
    const errors = tasksService.validateTaskData(taskData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateTaskData = {
      shipmentId: taskData.shipmentId!,
      title: taskData.title.trim(),
      description: taskData.description?.trim(),
      type: taskData.type || TASK_CONSTANTS.DEFAULT_VALUES.TYPE,
      priority: taskData.priority,
      assignedTo: taskData.assignedTo,
      dueDate: taskData.dueDate,
      metadata: taskData.metadata,
    }

    return await tasksService.createTask(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updateTask = useCallback(async (
    taskId: TaskId,
    updates: Partial<TaskFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    // Frontend validation
    const errors = tasksService.validateTaskData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const updateData: UpdateTaskData = {}
    if (updates.title !== undefined) updateData.title = updates.title.trim()
    if (updates.description !== undefined) updateData.description = updates.description?.trim()
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.assignedTo !== undefined) updateData.assignedTo = updates.assignedTo
    if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata

    return await tasksService.updateTask(updateMutation, authUser.id, taskId, updateData)
  }, [authUser, updateMutation])

  const completeTask = useCallback(async (
    taskId: TaskId,
    completionNotes?: string
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.completeTask(completeMutation, authUser.id, taskId, completionNotes)
  }, [authUser, completeMutation])

  const cancelTask = useCallback(async (
    taskId: TaskId,
    reason?: string
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.cancelTask(cancelMutation, authUser.id, taskId, reason)
  }, [authUser, cancelMutation])

  const deleteTask = useCallback(async (taskId: TaskId) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.deleteTask(deleteMutation, authUser.id, taskId)
  }, [authUser, deleteMutation])

  const assignTask = useCallback(async (
    taskId: TaskId,
    userId: Id<'userProfiles'>
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.assignTask(assignMutation, authUser.id, taskId, userId)
  }, [authUser, assignMutation])

  const unassignTask = useCallback(async (
    taskId: TaskId
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.unassignTask(unassignMutation, authUser.id, taskId)
  }, [authUser, assignMutation])

  const startTask = useCallback(async (taskId: TaskId) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.startTask(startMutation, authUser.id, taskId)
  }, [authUser, startMutation])

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const enrichedTasks = useMemo(() => {
    const tasks = tasksQuery || []
    return tasks.map((task: any): TaskListItem => ({
      ...task,
      isOverdue: tasksService.isTaskOverdue(task),
      dueIn: task.dueDate ? tasksService.getTimeUntilDue(task.dueDate) : undefined,
    }))
  }, [tasksQuery])

  // ========================================
  // PERMISSION CHECKS
  // ========================================

  const canCreateTasks = useMemo(() => {
    if (!authUser) return false
    if (authUser.role === 'admin' || authUser.role === 'superadmin') return true
    return authUser.permissions.includes('tasks.create')
  }, [authUser])

  const canEditTasks = useMemo(() => {
    if (!authUser) return false
    if (authUser.role === 'admin' || authUser.role === 'superadmin') return true
    return authUser.permissions.includes('tasks.edit')
  }, [authUser])

  const canDeleteTasks = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canAssignTasks = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin' || authUser.role === 'manager'
  }, [authUser])

  // ========================================
  // RETURN
  // ========================================

  return {
    // Data
    tasks: enrichedTasks,
    stats,
    isLoading: isPending,
    isStatsLoading,
    error,

    // Actions
    createTask,
    updateTask,
    completeTask,
    cancelTask,
    deleteTask,
    assignTask,
    unassignTask,
    startTask,
    refetch,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCompleting: completeMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAssigning: assignMutation.isPending,
    isStarting: startMutation.isPending,

    // Permissions
    canCreateTasks,
    canEditTasks,
    canDeleteTasks,
    canAssignTasks,

    // User info
    currentUser: authUser,
  }
}

/**
 * Hook for managing a single task
 */
export function useTask(taskId?: TaskId) {
  const authUser = useAuthenticatedUser()

  const {
    data: task,
    isPending,
    error,
    refetch,
  } = tasksService.useTask(authUser?.id!, taskId)

  const taskInsights = useMemo((): TaskInsights | null => {
    if (!task) return null

    const isOverdue = tasksService.isTaskOverdue(task)
    const isDueSoon = task.dueDate
      ? (task.dueDate - Date.now()) < (TASK_CONSTANTS.DUE_SOON_HOURS * 60 * 60 * 1000)
      : false

    const urgencyLevel = tasksService.calculateTaskUrgency(task)

    const daysUntilDue = task.dueDate
      ? Math.ceil((task.dueDate - Date.now()) / (24 * 60 * 60 * 1000))
      : undefined

    return {
      isOverdue,
      isDueSoon,
      urgencyLevel,
      daysUntilDue,
      canBeCompleted: tasksService.canTaskBeCompleted(task),
      canBeStarted: tasksService.canTaskBeStarted(task),
      canBeCancelled: tasksService.canTaskBeCancelled(task),
      canBeEdited: tasksService.canTaskBeEdited(task),
    }
  }, [task])

  return {
    task,
    taskInsights,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for getting the next pending task for a shipment
 */
export function useNextTask(shipmentId?: Id<'yourobcShipments'>) {
  const authUser = useAuthenticatedUser()

  const {
    data: nextTask,
    isPending,
    error,
    refetch,
  } = tasksService.useNextTask(authUser?.id!, shipmentId)

  return {
    nextTask,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for tasks by shipment
 */
export function useTasksByShipment(
  shipmentId?: Id<'yourobcShipments'>,
  includeCompleted = false
) {
  const authUser = useAuthenticatedUser()

  const {
    data: tasks,
    isPending,
    error,
    refetch,
  } = tasksService.useTasks(authUser?.id!, shipmentId, includeCompleted)

  const {
    data: nextTask,
    isPending: isLoadingNext,
  } = tasksService.useNextTask(authUser?.id!, shipmentId)

  const enrichedTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.map((task: any): TaskListItem => ({
      ...task,
      isOverdue: tasksService.isTaskOverdue(task),
      dueIn: task.dueDate ? tasksService.getTimeUntilDue(task.dueDate) : undefined,
    }))
  }, [tasks])

  return {
    tasks: enrichedTasks,
    nextTask,
    isLoading: isPending,
    isLoadingNext,
    error,
    refetch,
    hasTasks: enrichedTasks.length > 0,
  }
}

/**
 * Hook for tasks by assignee
 */
export function useTasksByAssignee(
  userId?: Id<'userProfiles'>,
  status?: TaskStatus
) {
  const authUser = useAuthenticatedUser()

  const {
    data: tasks,
    isPending,
    error,
  } = tasksService.useTasksByAssignee(authUser?.id!, userId, status)

  const enrichedTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.map((task: any): TaskListItem => ({
      ...task,
      isOverdue: tasksService.isTaskOverdue(task),
      dueIn: task.dueDate ? tasksService.getTimeUntilDue(task.dueDate) : undefined,
    }))
  }, [tasks])

  return {
    tasks: enrichedTasks,
    isLoading: isPending,
    error,
    hasTasks: enrichedTasks.length > 0,
  }
}

/**
 * Hook for overdue tasks
 */
export function useOverdueTasks() {
  const authUser = useAuthenticatedUser()

  const {
    data: tasks,
    isPending,
    error,
    refetch,
  } = tasksService.useOverdueTasks(authUser?.id!)

  const enrichedTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.map((task: any): TaskListItem => ({
      ...task,
      isOverdue: true,
      dueIn: task.dueDate ? tasksService.getTimeUntilDue(task.dueDate) : undefined,
    }))
  }, [tasks])

  return {
    tasks: enrichedTasks,
    isLoading: isPending,
    error,
    refetch,
    count: enrichedTasks.length,
  }
}

/**
 * Hook for tasks due today
 */
export function useTasksDueToday() {
  const authUser = useAuthenticatedUser()

  const {
    data: tasks,
    isPending,
    error,
    refetch,
  } = tasksService.useTasksDueToday(authUser?.id!)

  const enrichedTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.map((task: any): TaskListItem => ({
      ...task,
      isOverdue: tasksService.isTaskOverdue(task),
      dueIn: task.dueDate ? tasksService.getTimeUntilDue(task.dueDate) : undefined,
    }))
  }, [tasks])

  return {
    tasks: enrichedTasks,
    isLoading: isPending,
    error,
    refetch,
    count: enrichedTasks.length,
  }
}

/**
 * Hook for pending tasks
 */
export function useAllPendingTasks() {
  const authUser = useAuthenticatedUser()

  const {
    data: tasks,
    isPending,
    error,
    refetch,
  } = tasksService.useAllPendingTasks(authUser?.id!)

  const enrichedTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.map((task: any): TaskListItem => ({
      ...task,
      isOverdue: tasksService.isTaskOverdue(task),
      dueIn: task.dueDate ? tasksService.getTimeUntilDue(task.dueDate) : undefined,
    }))
  }, [tasks])

  return {
    tasks: enrichedTasks,
    isLoading: isPending,
    error,
    refetch,
    count: enrichedTasks.length,
  }
}

/**
 * Hook for tasks by status
 */
export function useTasksByStatus(status: TaskStatus) {
  const authUser = useAuthenticatedUser()

  const {
    data: tasks,
    isPending,
    error,
  } = tasksService.useTasksByStatus(authUser?.id!, status)

  const enrichedTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.map((task: any): TaskListItem => ({
      ...task,
      isOverdue: tasksService.isTaskOverdue(task),
      dueIn: task.dueDate ? tasksService.getTimeUntilDue(task.dueDate) : undefined,
    }))
  }, [tasks])

  return {
    tasks: enrichedTasks,
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for task form management
 */
export function useTaskForm(initialData?: Partial<TaskFormData>) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    type: TASK_CONSTANTS.DEFAULT_VALUES.TYPE,
    priority: TASK_CONSTANTS.DEFAULT_VALUES.PRIORITY,
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const validationErrors = tasksService.validateTaskData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('title')) errorMap.title = error
      else if (error.includes('description')) errorMap.description = error
      else if (error.includes('priority')) errorMap.priority = error
      else if (error.includes('Due date')) errorMap.dueDate = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: TaskFormData = {
      title: '',
      type: TASK_CONSTANTS.DEFAULT_VALUES.TYPE,
      priority: TASK_CONSTANTS.DEFAULT_VALUES.PRIORITY,
    }
    setFormData(initialData ? { ...defaultFormData, ...initialData } : defaultFormData)
    setErrors({})
    setIsDirty(false)
  }, [initialData])

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    resetForm,
    setFormData,
  }
}

/**
 * Helper hook that combines task data and mutations (legacy compatibility)
 */
export function useTaskManager(shipmentId?: Id<'yourobcShipments'>) {
  const { tasks, nextTask, isLoading, error, refetch } = useTasksByShipment(shipmentId)
  const createMutation = tasksService.useCreateTask()
  const updateMutation = tasksService.useUpdateTask()
  const completeMutation = tasksService.useCompleteTask()
  const cancelMutation = tasksService.useCancelTask()
  const deleteMutation = tasksService.useDeleteTask()
  const assignMutation = tasksService.useAssignTask()
  const unassignMutation = tasksService.useUnassignTask()
  const startMutation = tasksService.useStartTask()
  const bulkCompleteMutation = tasksService.useBulkCompleteTasks()

  return {
    tasks,
    nextTask,
    isLoading,
    error,
    refetch,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    completeTask: completeMutation.mutate,
    cancelTask: cancelMutation.mutate,
    deleteTask: deleteMutation.mutate,
    assignTask: assignMutation.mutate,
    unassignTask: unassignMutation.mutate,
    startTask: startMutation.mutate,
    bulkCompleteTasks: bulkCompleteMutation.mutate,
  }
}

/**
 * Hook for standalone task mutations
 * Useful when you don't need the full task list data
 */
export function useTaskMutations() {
  const authUser = useAuthenticatedUser()

  const createMutation = tasksService.useCreateTask()
  const updateMutation = tasksService.useUpdateTask()
  const completeMutation = tasksService.useCompleteTask()
  const cancelMutation = tasksService.useCancelTask()
  const deleteMutation = tasksService.useDeleteTask()
  const assignMutation = tasksService.useAssignTask()
  const unassignMutation = tasksService.useUnassignTask()
  const startMutation = tasksService.useStartTask()

  const createTask = useCallback(async (taskData: TaskFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = tasksService.validateTaskData(taskData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateTaskData = {
      shipmentId: taskData.shipmentId!,
      title: taskData.title.trim(),
      description: taskData.description?.trim(),
      type: taskData.type || TASK_CONSTANTS.DEFAULT_VALUES.TYPE,
      priority: taskData.priority,
      assignedTo: taskData.assignedTo,
      dueDate: taskData.dueDate,
      metadata: taskData.metadata,
    }

    return await tasksService.createTask(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updateTask = useCallback(async (
    taskId: TaskId,
    updates: Partial<TaskFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = tasksService.validateTaskData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const updateData: UpdateTaskData = {}
    if (updates.title !== undefined) updateData.title = updates.title.trim()
    if (updates.description !== undefined) updateData.description = updates.description?.trim()
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.assignedTo !== undefined) updateData.assignedTo = updates.assignedTo
    if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata

    return await tasksService.updateTask(updateMutation, authUser.id, taskId, updateData)
  }, [authUser, updateMutation])

  const completeTask = useCallback(async (
    taskId: TaskId,
    completionNotes?: string
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.completeTask(completeMutation, authUser.id, taskId, completionNotes)
  }, [authUser, completeMutation])

  const cancelTask = useCallback(async (
    taskId: TaskId,
    reason?: string
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.cancelTask(cancelMutation, authUser.id, taskId, reason)
  }, [authUser, cancelMutation])

  const deleteTask = useCallback(async (taskId: TaskId) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.deleteTask(deleteMutation, authUser.id, taskId)
  }, [authUser, deleteMutation])

  const assignTask = useCallback(async (
    taskId: TaskId,
    userId: Id<'userProfiles'>
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.assignTask(assignMutation, authUser.id, taskId, userId)
  }, [authUser, assignMutation])

  const unassignTask = useCallback(async (
    taskId: TaskId
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.unassignTask(unassignMutation, authUser.id, taskId)
  }, [authUser, assignMutation])

  const startTask = useCallback(async (taskId: TaskId) => {
    if (!authUser) throw new Error('Authentication required')
    return await tasksService.startTask(startMutation, authUser.id, taskId)
  }, [authUser, startMutation])

  return {
    createTask,
    updateTask,
    completeTask,
    cancelTask,
    deleteTask,
    assignTask,
    unassignTask,
    startTask,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCompleting: completeMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAssigning: assignMutation.isPending,
    isUnassigning: unassignMutation.isPending,
    isStarting: startMutation.isPending,
  }
}
