// features/projects/components/tasks/TaskBoard.tsx

import { FC, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TaskCard } from './TaskCard'
import type { Task } from './TaskFormModal'
import type { Id } from '@/convex/_generated/dataModel'

interface TaskBoardProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onTaskEdit?: (task: Task) => void
  onTaskDelete?: (taskId: Id<'projectTasks'>) => void
  onTaskMove?: (taskId: Id<'projectTasks'>, newStatus: Task['status']) => void
  onTaskReorder?: (taskId: Id<'projectTasks'>, newOrder: number) => void
  canEdit?: boolean
  canDelete?: boolean
}

type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked' | 'cancelled'

const COLUMN_CONFIG: Record<
  TaskStatus,
  { title: string; color: string; bgColor: string; icon: string }
> = {
  todo: {
    title: 'To Do',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    icon: '📋',
  },
  in_progress: {
    title: 'In Progress',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: '⚡',
  },
  in_review: {
    title: 'In Review',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: '👀',
  },
  completed: {
    title: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: '✅',
  },
  blocked: {
    title: 'Blocked',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: '🚫',
  },
  cancelled: {
    title: 'Cancelled',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    icon: '❌',
  },
}

export const TaskBoard: FC<TaskBoardProps> = ({
  tasks,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onTaskMove,
  onTaskReorder,
  canEdit = true,
  canDelete = true,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to activate drag
      },
    })
  )

  // Group tasks by status
  const tasksByStatus = tasks.reduce(
    (acc, task) => {
      const status = task.status as TaskStatus
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(task)
      return acc
    },
    {} as Record<TaskStatus, Task[]>
  )

  // Sort tasks within each column by order
  Object.keys(tasksByStatus).forEach((status) => {
    tasksByStatus[status as TaskStatus].sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTaskId = active.id as Id<'projectTasks'>
    const activeTask = tasks.find((t) => t._id === activeTaskId)

    if (!activeTask) return

    // Check if dropped on a column (status change)
    const overColumnId = over.id as string
    if (overColumnId.startsWith('column-')) {
      const newStatus = overColumnId.replace('column-', '') as TaskStatus
      if (newStatus !== activeTask.status && onTaskMove) {
        onTaskMove(activeTaskId, newStatus)
      }
      return
    }

    // Check if dropped on another task (reordering within same column)
    const overTaskId = over.id as Id<'projectTasks'>
    const overTask = tasks.find((t) => t._id === overTaskId)

    if (overTask && overTask.status === activeTask.status) {
      // Reorder within the same column
      if (onTaskReorder) {
        onTaskReorder(activeTaskId, overTask.order || 0)
      }
    } else if (overTask && overTask.status !== activeTask.status) {
      // Move to different column
      if (onTaskMove) {
        onTaskMove(activeTaskId, overTask.status)
      }
    }
  }

  const handleDragCancel = () => {
    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {(Object.keys(COLUMN_CONFIG) as TaskStatus[]).map((status) => {
          const config = COLUMN_CONFIG[status]
          const columnTasks = tasksByStatus[status] || []

          return (
            <div key={status} className="flex-shrink-0 w-80">
              <Card className={`${config.bgColor} border-2`}>
                {/* Column Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{config.icon}</span>
                      <h3 className={`font-semibold ${config.color}`}>{config.title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </div>

                {/* Droppable Column Area */}
                <SortableContext
                  id={`column-${status}`}
                  items={columnTasks.map((t) => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    id={`column-${status}`}
                    className="p-3 min-h-[400px] space-y-3"
                    style={{ minHeight: '400px' }}
                  >
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-400">
                        Drop tasks here
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <DraggableTaskCard
                          key={task._id}
                          task={task}
                          onClick={onTaskClick}
                          onEdit={onTaskEdit}
                          onDelete={onTaskDelete}
                          canEdit={canEdit}
                          canDelete={canDelete}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 rotate-3 scale-105">
            <TaskCard
              task={activeTask}
              canEdit={false}
              canDelete={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// Separate component for draggable task cards
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DraggableTaskCardProps {
  task: Task
  onClick?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: Id<'projectTasks'>) => void
  canEdit?: boolean
  canDelete?: boolean
}

const DraggableTaskCard: FC<DraggableTaskCardProps> = ({
  task,
  onClick,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}
