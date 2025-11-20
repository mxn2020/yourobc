// src/components/ui/LoadingSpinner.tsx

interface LoadingSpinnerProps {
  /**
   * Whether to center the spinner vertically and horizontally on full screen
   * @default false
   */
  fullScreen?: boolean
  /**
   * Optional message to display below the spinner
   */
  message?: string
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ fullScreen = false, message, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const spinner = (
    <div className="text-center">
      <div className={`inline-block animate-spin rounded-full border-b-2 border-gray-900 ${sizeClasses[size]} mb-4`}></div>
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex justify-center py-8">
      {spinner}
    </div>
  )
}
