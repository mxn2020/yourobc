// src/components/ui/Breadcrumb.tsx

import { FC, Fragment } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import { getCurrentLocale } from '@/features/boilerplate/i18n/utils/path'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

/**
 * Breadcrumb navigation component
 *
 * Usage:
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Projects', href: '/projects' },
 *     { label: projectName, href: `/projects/${projectId}` },
 *     { label: 'Tasks' }
 *   ]}
 * />
 * ```
 */
export const Breadcrumb: FC<BreadcrumbProps> = ({
  items,
  className = '',
  showHome = true,
}) => {
  const currentLocale = getCurrentLocale()

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      {showHome && (
        <>
          <Link
            to="/{-$locale}/dashboard"
            params={{ locale: currentLocale }}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          {items.length > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const IconComponent = item.icon

        return (
          <Fragment key={index}>
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span className="font-medium">{item.label}</span>
              </Link>
            ) : (
              <div
                className={`flex items-center space-x-1 ${
                  isLast
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-600'
                }`}
                {...(isLast && { 'aria-current': 'page' })}
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span>{item.label}</span>
              </div>
            )}

            {!isLast && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

/**
 * Hook to generate breadcrumb items for project routes
 */
export const useProjectBreadcrumbs = (
  projectName?: string,
  projectId?: string,
  additionalItems?: BreadcrumbItem[]
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    { label: 'Projects', href: '/{-$locale}/projects' },
  ]

  if (projectName && projectId) {
    items.push({
      label: projectName,
      href: `/{-$locale}/projects/${projectId}`,
    })
  }

  if (additionalItems) {
    items.push(...additionalItems)
  }

  return items
}
