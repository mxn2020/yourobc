// src/features/yourobc/mobile/components/MobileLayout.tsx

import { FC, ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { useMobileDetect } from '../hooks/useMobileDetect'

interface MobileLayoutProps {
  children: ReactNode
  showTabBar?: boolean
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  headerActions?: ReactNode
}

export const MobileLayout: FC<MobileLayoutProps> = ({
  children,
  showTabBar = true,
  title,
  showBackButton = false,
  onBack,
  headerActions,
}) => {
  const { isMobile } = useMobileDetect()

  // If not mobile, render children without mobile layout
  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header (optional) */}
      {(title || showBackButton || headerActions) && (
        <div className="sticky top-0 bg-white border-b border-gray-200 z-20">
          <div className="flex items-center justify-between p-4">
            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Title */}
            {title && (
              <h1 className="flex-1 text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}

            {/* Header Actions */}
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={showTabBar ? 'pb-16' : ''}>{children}</main>

      {/* Bottom Tab Bar */}
      {showTabBar && <BottomTabBar />}
    </div>
  )
}

/**
 * Mobile Page Container
 * Provides consistent spacing and styling for mobile pages
 */
interface MobilePageContainerProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export const MobilePageContainer: FC<MobilePageContainerProps> = ({
  children,
  className = '',
  noPadding = false,
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${noPadding ? '' : 'p-4'} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Mobile Card Container
 * Standard card styling for mobile views
 */
interface MobileCardProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
  onClick?: () => void
}

export const MobileCard: FC<MobileCardProps> = ({
  children,
  className = '',
  noPadding = false,
  onClick,
}) => {
  const baseClasses = `
    bg-white
    rounded-lg
    border border-gray-200
    ${noPadding ? '' : 'p-4'}
    ${onClick ? 'hover:shadow-md active:bg-gray-50 cursor-pointer' : ''}
    transition-all
  `

  return (
    <div className={`${baseClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

/**
 * Mobile Section Header
 * Consistent section headers for mobile pages
 */
interface MobileSectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export const MobileSectionHeader: FC<MobileSectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

/**
 * Mobile Empty State
 * Consistent empty state display
 */
interface MobileEmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export const MobileEmptyState: FC<MobileEmptyStateProps> = ({
  icon = '📦',
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <div className="text-lg font-semibold text-gray-900 mb-2">{title}</div>
      {description && <div className="text-sm text-gray-600 mb-4">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/**
 * Mobile Loading State
 * Consistent loading display
 */
interface MobileLoadingStateProps {
  message?: string
}

export const MobileLoadingState: FC<MobileLoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <div className="text-sm text-gray-600">{message}</div>
    </div>
  )
}

/**
 * Mobile Pull to Refresh
 * Visual indicator for pull-to-refresh gesture
 */
interface MobilePullToRefreshProps {
  isRefreshing: boolean
  onRefresh: () => Promise<void>
  children: ReactNode
}

export const MobilePullToRefresh: FC<MobilePullToRefreshProps> = ({
  isRefreshing,
  onRefresh,
  children,
}) => {
  return (
    <div className="relative">
      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 flex justify-center p-4 bg-white border-b border-gray-200 z-10">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Content */}
      <div className={isRefreshing ? 'mt-14' : ''}>{children}</div>
    </div>
  )
}
