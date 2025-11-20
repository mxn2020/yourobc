// src/components/ui/Loading.tsx
import { forwardRef, memo } from 'react'
import type { HTMLAttributes, ElementRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { useTranslation } from '@/features/system/i18n'

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse'
  /**
   * Optional message to display below the spinner
   * Can be a plain string or i18n translation key
   * Examples: "Loading projects...", "loading.projects", "projects:loading.list"
   */
  message?: string
  /**
   * i18n namespace to use for translation (optional)
   * If not provided, will try to translate from 'ui' namespace first,
   * then fall back to the message as-is
   */
  namespace?: 'common' | 'ui' | 'auth' | 'dashboard' | 'projects' | 'tasks' | 'settings' | 'admin' | 'blog' | 'ai' | 'payments' | 'email' | 'notifications' | 'errors' | 'validation'
  /**
   * Show the message visually (default: false, uses sr-only for accessibility)
   */
  showMessage?: boolean
  /**
   * Whether to center the spinner vertically and horizontally on full screen
   * When true, wraps the loading component in a full-screen centered container
   * @default false
   */
  fullScreen?: boolean
}

interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
  variant?: 'rectangular' | 'circular' | 'text'
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const SpinnerIcon = ({ className }: { className?: string }) => (
  <div className={twMerge('inline-block animate-spin rounded-full border-b-2 border-gray-900 mb-4', className)} />
)

const DotsIcon = ({ className }: { className?: string }) => (
  <div className={twMerge('flex space-x-1', className)}>
    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
)

const PulseIcon = ({ className }: { className?: string }) => (
  <div className={twMerge('bg-blue-600 rounded-full animate-pulse', className)} />
)

export const Loading = memo(forwardRef<ElementRef<'div'>, LoadingProps>(
  ({
    size = 'md',
    variant = 'spinner',
    message,
    namespace,
    showMessage = false,
    fullScreen = false,
    className,
    ...props
  }, ref) => {
    const { t } = useTranslation(namespace || 'ui');

    // Determine the message to display
    let displayMessage = message
    if (message) {
      // Try to translate the message
      // If it's a translation key, it will be translated
      // If it's a plain string, it will be returned as-is
      try {
        displayMessage = t(message as any)
      } catch {
        // If translation fails, use the message as-is
        displayMessage = message
      }
    } else {
      // Default fallback
      displayMessage = t('loading.loadingText')
    }

    const Icon = {
      spinner: SpinnerIcon,
      dots: DotsIcon,
      pulse: PulseIcon
    }[variant]

    const spinnerContent = (
      <div
        ref={!fullScreen ? ref : undefined}
        className={twMerge('flex flex-col items-center justify-center', !fullScreen && className)}
        role="status"
        aria-label={displayMessage}
        {...(!fullScreen && props)}
      >
        <Icon className={variant !== 'dots' ? sizeClasses[size] : undefined} />
        {message && showMessage && (
          <p className="mt-3 text-sm text-gray-600">{displayMessage}</p>
        )}
        <span className="sr-only">{displayMessage}</span>
      </div>
    )

    // If fullScreen is enabled, wrap in a full-screen centered container
    if (fullScreen) {
      return (
        <div
          ref={ref}
          className={twMerge('flex items-center justify-center min-h-screen bg-gray-50', className)}
          {...props}
        >
          {spinnerContent}
        </div>
      )
    }

    return spinnerContent
  }
))
Loading.displayName = 'Loading'

export const LoadingSkeleton = memo(forwardRef<ElementRef<'div'>, LoadingSkeletonProps>(
  ({
    className,
    width = 'w-full',
    height = 'h-4',
    variant = 'rectangular',
    ...props
  }, ref) => {
    const { t } = useTranslation('ui');
    const variantClasses = {
      rectangular: 'rounded',
      circular: 'rounded-full',
      text: 'rounded'
    }

    return (
      <div
        ref={ref}
        className={twMerge(
          'animate-pulse bg-gray-200',
          variantClasses[variant],
          width,
          height,
          className
        )}
        role="status"
        aria-label={t('loading.loadingContent')}
        {...props}
      >
        <span className="sr-only">{t('loading.loadingText')}</span>
      </div>
    )
  }
))
LoadingSkeleton.displayName = 'LoadingSkeleton'