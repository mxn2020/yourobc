// src/features/boilerplate/auth/hooks/useAuthForm.ts

import { useState } from 'react'
import { AuthResponse } from '../types/auth.types'

/**
 * Shared form hook for auth forms
 * Handles common form state management and submission logic
 */
export function useAuthForm<T extends Record<string, any>>(
  initialData: T,
  onSubmit: (data: T) => Promise<AuthResponse<any>>
) {
  const [formData, setFormData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await onSubmit(formData)
      
      if (!result.success) {
        setError(result.error?.message || 'Operation failed')
      }
      
      setIsLoading(false)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
      return { success: false, error: err }
    }
  }

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const resetForm = () => {
    setFormData(initialData)
    setError(null)
  }

  return {
    formData,
    isLoading,
    error,
    handleSubmit,
    updateField,
    setError,
    resetForm,
  }
}