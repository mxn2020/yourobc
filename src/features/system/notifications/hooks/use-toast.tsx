// features/notifications/hooks/use-toast.ts
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import type { ToastConfig } from '../types'

export function useToast() {
  const showToast = useCallback((config: ToastConfig) => {
    const { type, message, title, duration = 4000, actions } = config
    
    const content = (
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          {title && <div className="font-medium text-white-900">{title}</div>}
          <div className={title ? 'text-white-600 text-sm' : 'text-white-900'}>{message}</div>
          {actions && actions.length > 0 && (
            <div className="flex space-x-2 mt-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`px-3 py-1 text-sm rounded ${
                    action.variant === 'danger' 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
    
    switch (type) {
      case 'success':
        return toast.success(content, { duration })
      case 'error':
        return toast.error(content, { duration: duration || 6000 })
      case 'warning':
        return toast(content, { 
          duration, 
          icon: '⚠️',
          style: { borderLeft: '4px solid #f59e0b' }
        })
      case 'info':
        return toast(content, { 
          duration,
          icon: 'ℹ️',
          style: { borderLeft: '4px solid #3b82f6' }
        })
      case 'loading':
        return toast.loading(content)
      default:
        return toast(content, { duration })
    }
  }, [])
  
  const success = useCallback((message: string, title?: string) => {
    showToast({ type: 'success', message, title })
  }, [showToast])
  
  const error = useCallback((message: string, title?: string) => {
    showToast({ type: 'error', message, title })
  }, [showToast])
  
  const warning = useCallback((message: string, title?: string) => {
    showToast({ type: 'warning', message, title })
  }, [showToast])
  
  const info = useCallback((message: string, title?: string) => {
    showToast({ type: 'info', message, title })
  }, [showToast])
  
  const loading = useCallback((message: string, title?: string) => {
    return showToast({ type: 'loading', message, title })
  }, [showToast])
  
  const promise = useCallback(async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((result: T) => string)
      error: string | ((error: Error) => string)
    }
  ): Promise<T> => {
    return toast.promise(promise, messages)
  }, [])
  
  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    custom: showToast,
    dismiss: toast.dismiss,
    remove: toast.remove,
  }
}
