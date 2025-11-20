// src/components/ui/EmptyState.tsx

import { FC, ReactNode } from 'react'
import {
  Inbox,
  FileText,
  Users,
  FolderOpen,
  Search,
  Filter,
  PackageOpen,
  ListTodo,
  CalendarDays,
  MessageSquare,
  Bell,
  Star,
  AlertCircle,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react'
import { Button } from './Button'
import { Card, CardContent } from './Card'
import { useTranslation } from '@/features/system/i18n'

export type EmptyStateVariant =
  | 'default'
  | 'search'
  | 'filter'
  | 'projects'
  | 'tasks'
  | 'users'
  | 'files'
  | 'messages'
  | 'notifications'
  | 'calendar'
  | 'success'
  | 'error'

export interface EmptyStateProps {
  /**
   * Variant determines the default icon and styling
   */
  variant?: EmptyStateVariant

  /**
   * Custom icon to override variant default
   */
  icon?: LucideIcon

  /**
   * Main title text
   */
  title?: string

  /**
   * Description/subtitle text
   */
  description?: string

  /**
   * Primary action button
   */
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  }

  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }

  /**
   * Custom content to render below description
   */
  children?: ReactNode

  /**
   * Compact mode (smaller, less padding)
   */
  compact?: boolean

  /**
   * Show border around card
   */
  bordered?: boolean

  /**
   * Custom illustration/image
   */
  illustration?: ReactNode

  /**
   * Show decorative elements
   */
  showDecoration?: boolean
}

/**
 * Empty State Component
 *
 * Displays when there's no content to show with helpful guidance.
 * Supports various contexts (search, filters, projects, etc.)
 *
 * @example
 * ```tsx
 * <EmptyState
 *   variant="projects"
 *   title="No projects yet"
 *   description="Create your first project to get started"
 *   action={{
 *     label: "Create Project",
 *     onClick: () => navigate('/projects/new'),
 *     icon: Plus
 *   }}
 * />
 * ```
 */
export const EmptyState: FC<EmptyStateProps> = ({
  variant = 'default',
  icon: CustomIcon,
  title,
  description,
  action,
  secondaryAction,
  children,
  compact = false,
  bordered = true,
  illustration,
  showDecoration = true,
}) => {
  const { t } = useTranslation('ui')

  // Get default icon based on variant
  const getDefaultIcon = (): LucideIcon => {
    const iconMap: Record<EmptyStateVariant, LucideIcon> = {
      default: Inbox,
      search: Search,
      filter: Filter,
      projects: FolderOpen,
      tasks: ListTodo,
      users: Users,
      files: FileText,
      messages: MessageSquare,
      notifications: Bell,
      calendar: CalendarDays,
      success: CheckCircle2,
      error: AlertCircle,
    }
    return iconMap[variant]
  }

  // Get default colors based on variant
  const getColors = () => {
    const colorMap: Record<
      EmptyStateVariant,
      { bg: string; icon: string; accent: string }
    > = {
      default: {
        bg: 'bg-gray-100',
        icon: 'text-gray-500',
        accent: 'text-gray-600',
      },
      search: {
        bg: 'bg-blue-100',
        icon: 'text-blue-500',
        accent: 'text-blue-600',
      },
      filter: {
        bg: 'bg-purple-100',
        icon: 'text-purple-500',
        accent: 'text-purple-600',
      },
      projects: {
        bg: 'bg-indigo-100',
        icon: 'text-indigo-500',
        accent: 'text-indigo-600',
      },
      tasks: {
        bg: 'bg-green-100',
        icon: 'text-green-500',
        accent: 'text-green-600',
      },
      users: {
        bg: 'bg-cyan-100',
        icon: 'text-cyan-500',
        accent: 'text-cyan-600',
      },
      files: {
        bg: 'bg-orange-100',
        icon: 'text-orange-500',
        accent: 'text-orange-600',
      },
      messages: {
        bg: 'bg-pink-100',
        icon: 'text-pink-500',
        accent: 'text-pink-600',
      },
      notifications: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        accent: 'text-yellow-700',
      },
      calendar: {
        bg: 'bg-teal-100',
        icon: 'text-teal-500',
        accent: 'text-teal-600',
      },
      success: {
        bg: 'bg-emerald-100',
        icon: 'text-emerald-500',
        accent: 'text-emerald-600',
      },
      error: {
        bg: 'bg-red-100',
        icon: 'text-red-500',
        accent: 'text-red-600',
      },
    }
    return colorMap[variant]
  }

  const Icon = CustomIcon || getDefaultIcon()
  const colors = getColors()

  // Get default title and description if not provided
  const defaultTitle =
    title ||
    t(`emptyState.${variant}.title`, {
      defaultValue: t('emptyState.default.title'),
    })
  const defaultDescription =
    description ||
    t(`emptyState.${variant}.description`, {
      defaultValue: t('emptyState.default.description'),
    })

  const containerClass = compact
    ? 'flex items-center justify-center p-4'
    : 'flex items-center justify-center min-h-[300px] p-6'

  const content = (
    <div className="text-center space-y-6 max-w-md mx-auto">
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="flex justify-center">{illustration}</div>
      ) : (
        <div className="flex justify-center relative">
          {/* Main Icon */}
          <div
            className={`rounded-full ${colors.bg} p-4 relative z-10 ${
              compact ? 'w-16 h-16' : 'w-20 h-20'
            } flex items-center justify-center`}
          >
            <Icon
              className={`${colors.icon} ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
            />
          </div>

          {/* Decorative Elements */}
          {showDecoration && !compact && (
            <>
              {/* Floating circles */}
              <div
                className={`absolute top-0 right-0 w-3 h-3 ${colors.bg} rounded-full opacity-60 animate-pulse`}
                style={{ animationDelay: '0.5s' }}
              />
              <div
                className={`absolute bottom-0 left-0 w-4 h-4 ${colors.bg} rounded-full opacity-40 animate-pulse`}
                style={{ animationDelay: '1s' }}
              />
              <div
                className={`absolute top-1/2 -left-4 w-2 h-2 ${colors.bg} rounded-full opacity-50 animate-pulse`}
                style={{ animationDelay: '1.5s' }}
              />
            </>
          )}
        </div>
      )}

      {/* Title & Description */}
      <div className="space-y-2">
        <h3
          className={`font-semibold text-gray-900 ${
            compact ? 'text-lg' : 'text-xl'
          }`}
        >
          {defaultTitle}
        </h3>
        {defaultDescription && (
          <p className={`text-gray-600 ${compact ? 'text-sm' : 'text-base'}`}>
            {defaultDescription}
          </p>
        )}
      </div>

      {/* Custom Children Content */}
      {children && <div className="text-sm text-gray-600">{children}</div>}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'primary'}
              className="w-full sm:w-auto"
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="w-4 h-4 mr-2" />
              )}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )

  // Return with or without Card wrapper based on bordered prop
  if (!bordered) {
    return <div className={containerClass}>{content}</div>
  }

  return (
    <div className={containerClass}>
      <Card className="w-full">
        <CardContent className={compact ? 'py-8' : 'py-12'}>{content}</CardContent>
      </Card>
    </div>
  )
}

/**
 * Specialized Empty States for Common Use Cases
 */

export const NoSearchResults: FC<
  Omit<EmptyStateProps, 'variant' | 'icon'>
> = (props) => (
  <EmptyState
    {...props}
    variant="search"
    title={props.title || 'No results found'}
    description={
      props.description || 'Try adjusting your search or filters to find what you\'re looking for'
    }
  />
)

export const NoFilterResults: FC<
  Omit<EmptyStateProps, 'variant' | 'icon'>
> = (props) => (
  <EmptyState
    {...props}
    variant="filter"
    title={props.title || 'No matches'}
    description={
      props.description || 'No items match your current filters. Try clearing some filters.'
    }
  />
)

export const NoProjects: FC<Omit<EmptyStateProps, 'variant' | 'icon'>> = (
  props
) => (
  <EmptyState
    {...props}
    variant="projects"
    title={props.title || 'No projects yet'}
    description={
      props.description || 'Create your first project to start organizing your work'
    }
  />
)

export const NoTasks: FC<Omit<EmptyStateProps, 'variant' | 'icon'>> = (
  props
) => (
  <EmptyState
    {...props}
    variant="tasks"
    title={props.title || 'No tasks yet'}
    description={
      props.description || 'Add your first task to get started on your project'
    }
  />
)

export const NoNotifications: FC<Omit<EmptyStateProps, 'variant' | 'icon'>> = (
  props
) => (
  <EmptyState
    {...props}
    variant="notifications"
    title={props.title || 'All caught up!'}
    description={
      props.description || 'You have no new notifications at the moment'
    }
  />
)