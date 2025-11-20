// src/features/yourobc/mobile/components/BottomTabBar.tsx

import { FC } from 'react'
import { Link, useLocation } from '@tanstack/react-router'

interface Tab {
  id: string
  label: string
  icon: JSX.Element
  path: string
  badge?: number
}

interface BottomTabBarProps {
  tabs?: Tab[]
  currentPath?: string
}

export const BottomTabBar: FC<BottomTabBarProps> = ({ tabs: customTabs, currentPath }) => {
  const location = useLocation()
  const activePath = currentPath || location.pathname

  // Default tabs
  const defaultTabs: Tab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/yourobc',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: 'yourobcShipments',
      label: 'Shipments',
      path: '/yourobc/shipments',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      id: 'yourobcQuotes',
      label: 'Quotes',
      path: '/yourobc/quotes',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: 'more',
      label: 'More',
      path: '/yourobc/more',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
    },
  ]

  const tabs = customTabs || defaultTabs

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-40">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activePath.startsWith(tab.path)

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`
                flex-1 flex flex-col items-center justify-center
                py-2 px-3 transition-colors relative
                ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}
              `}
            >
              {/* Icon */}
              <div className="relative">
                {tab.icon}

                {/* Badge */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-xs mt-1 font-medium">{tab.label}</span>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 bg-blue-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Safe area bottom padding for iOS */}
      <div className="h-safe-bottom" />
    </div>
  )
}

/**
 * Floating Action Button (FAB)
 * For quick actions like creating new quote/shipment
 */
interface FloatingActionButtonProps {
  onClick: () => void
  icon?: JSX.Element
  label?: string
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left'
}

export const FloatingActionButton: FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label = 'New',
  position = 'bottom-right',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-20 left-4',
  }

  const defaultIcon = (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  )

  return (
    <button
      onClick={onClick}
      className={`
        fixed ${positionClasses[position]}
        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
        text-white
        rounded-full
        shadow-lg hover:shadow-xl
        transition-all
        z-30
        flex items-center gap-2
        px-6 py-4
        font-medium
      `}
    >
      {icon || defaultIcon}
      <span>{label}</span>
    </button>
  )
}

/**
 * Mobile Action Sheet (Bottom drawer for actions)
 */
interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  actions: Array<{
    id: string
    label: string
    icon?: JSX.Element
    onClick: () => void
    variant?: 'default' | 'danger'
  }>
}

export const MobileActionSheet: FC<ActionSheetProps> = ({ isOpen, onClose, title, actions }) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 safe-area-inset-bottom animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-4 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}

        {/* Actions */}
        <div className="pb-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.onClick()
                onClose()
              }}
              className={`
                w-full px-4 py-4 text-left
                flex items-center gap-3
                hover:bg-gray-50 active:bg-gray-100
                transition-colors
                ${action.variant === 'danger' ? 'text-red-600' : 'text-gray-900'}
              `}
            >
              {action.icon && <div className="flex-shrink-0">{action.icon}</div>}
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-3 text-center font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Safe area bottom */}
        <div className="h-safe-bottom" />
      </div>
    </>
  )
}
