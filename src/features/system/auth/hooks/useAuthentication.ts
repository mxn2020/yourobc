// src/features/system/auth/hooks/useAuthentication.ts

import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/AuthService'
import {
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  AuthProvider
} from '../types/auth.types'
import { getCurrentLocale } from '@/features/system/i18n/utils/path'

/**
 * Core authentication hook - handles login, signup, logout
 * Optimized with proper cache management
 */
export function useAuthentication() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, isPending: isAuthLoading } = authService.useSession()

  // === Authentication Actions ===
  const signIn = useCallback(async (credentials: LoginFormData) => {
    const result = await authService.signInWithEmail(credentials)

    if (result.success) {
      const locale = getCurrentLocale()
      router.navigate({ to: '/{-$locale}/dashboard', params: { locale }, replace: true })
    }

    return result
  }, [router])

  const signUp = useCallback(async (data: SignupFormData) => {
    const result = await authService.signUpWithEmail(data)

    if (result.success) {
      const locale = getCurrentLocale()
      router.navigate({ to: '/{-$locale}/dashboard', params: { locale }, replace: true })
    }

    return result
  }, [router])

  const signInWithProvider = useCallback(async (provider: Exclude<AuthProvider, 'email'>) => {
    return await authService.signInWithProvider(provider)
  }, [])

  const forgotPassword = useCallback(async (data: ForgotPasswordFormData) => {
    return await authService.forgotPassword(data)
  }, [])

  const resetPassword = useCallback(async (data: ResetPasswordFormData) => {
    const result = await authService.resetPassword(data)

    if (result.success) {
      const locale = getCurrentLocale()
      router.navigate({
        to: '/{-$locale}/auth/login',
        params: { locale },
        replace: true,
      })
    }

    return result
  }, [router])

  const signOut = useCallback(async () => {
    const result = await authService.signOut()

    // Clear all cached queries on signout
    queryClient.clear()

    // Always redirect to login
    const locale = getCurrentLocale()
    router.navigate({
      to: '/{-$locale}/auth/login',
      params: { locale },
      replace: true,
    })

    return result
  }, [router, queryClient])

  // === Computed States ===
  const isAuthenticated = !!session?.user?.id
  const user = session?.user || null
  const isReady = !isAuthLoading

  return {
    // State
    user,
    session,
    isAuthenticated,
    isAuthLoading,
    isReady,

    // Actions
    signIn,
    signUp,
    signInWithProvider,
    forgotPassword,
    resetPassword,
    signOut,

    // Utils
    validateEmail: authService.validateEmail,
    validatePassword: authService.validatePassword,
    calculatePasswordStrength: authService.calculatePasswordStrength,
  }
}