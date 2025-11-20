// src/features/yourobc/mobile/hooks/useClipboard.ts

import { useState, useCallback } from 'react'
import { useToast } from '@/features/system/notifications'

interface ClipboardOptions {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface ClipboardResult {
  copy: (text: string, options?: ClipboardOptions) => Promise<boolean>
  copied: boolean
  error: Error | null
}

/**
 * Hook for copying text to clipboard with feedback
 * Supports both modern Clipboard API and fallback for older browsers
 */
export function useClipboard(): ClipboardResult {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const copy = useCallback(async (text: string, options: ClipboardOptions = {}): Promise<
    boolean
  > => {
    const {
      successMessage = 'Copied to clipboard!',
      errorMessage = 'Failed to copy',
      onSuccess,
      onError,
    } = options

    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers or non-HTTPS
        await fallbackCopyToClipboard(text)
      }

      setCopied(true)
      setError(null)

      // Show success toast
      if (successMessage) {
        toast.success(successMessage)
      }

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)

      return true
    } catch (err) {
      const copyError = err instanceof Error ? err : new Error('Copy failed')
      setError(copyError)
      setCopied(false)

      // Show error toast
      if (errorMessage) {
        toast.error(errorMessage)
      }

      // Call error callback
      if (onError) {
        onError(copyError)
      }

      return false
    }
  }, [])

  return { copy, copied, error }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        resolve()
      } else {
        reject(new Error('execCommand failed'))
      }
    } catch (err) {
      document.body.removeChild(textArea)
      reject(err)
    }
  })
}

/**
 * Hook for copying with visual feedback (useful for buttons)
 */
export function useCopyButton() {
  const { copy, copied, error } = useClipboard()
  const [isAnimating, setIsAnimating] = useState(false)

  const copyWithAnimation = useCallback(
    async (text: string, options?: ClipboardOptions) => {
      setIsAnimating(true)
      const success = await copy(text, options)

      setTimeout(() => {
        setIsAnimating(false)
      }, 300)

      return success
    },
    [copy]
  )

  return {
    copy: copyWithAnimation,
    copied,
    error,
    isAnimating,
  }
}

/**
 * Hook for sharing (uses native share API if available, falls back to copy)
 */
export function useShare() {
  const { copy } = useClipboard()
  const toast = useToast()

  const share = useCallback(
    async (
      data: { title?: string; text?: string; url?: string },
      fallbackToCopy = true
    ): Promise<boolean> => {
      // Check if native share is available (mobile browsers)
      if (navigator.share) {
        try {
          await navigator.share(data)
          toast.success('Shared successfully!')
          return true
        } catch (err) {
          // User cancelled or error occurred
          if ((err as Error).name === 'AbortError') {
            // User cancelled, don't show error
            return false
          }
          // Fall through to copy
        }
      }

      // Fallback to copy
      if (fallbackToCopy && data.text) {
        return await copy(data.text, {
          successMessage: 'Copied to clipboard! You can now paste it.',
        })
      }

      toast.error('Sharing not supported on this device')
      return false
    },
    [copy]
  )

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return { share, canShare }
}
