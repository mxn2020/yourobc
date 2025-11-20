// src/features/boilerplate/auth/services/AuthService.ts

import { authClient } from '../lib/auth-client'
import {
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  AuthProvider,
  AuthResponse,
  AuthUser,
  AuthErrorCode,
  createAuthError,
  AUTH_ERROR_CODES
} from '../types/auth.types'

/**
 * Core authentication service - handles only auth operations
 * Singleton pattern for consistent state management
 */
class AuthService {
  readonly client = authClient

  // === Session Management ===
  useSession() {
    return this.client.useSession()
  }

  async getSession() {
    return await this.client.getSession()
  }

  // === Authentication Actions ===
  async signInWithEmail(credentials: LoginFormData): Promise<AuthResponse<AuthUser>> {
    try {
      const result = await this.client.signIn.email({
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.remember
      })

      if (result.error) {
        return {
          success: false,
          error: this.parseAuthError(result.error)
        }
      }

      return {
        success: true,
        data: result.data?.user
      }
    } catch (error) {
      return {
        success: false,
        error: this.parseAuthError(error)
      }
    }
  }

  async signUpWithEmail(data: SignupFormData): Promise<AuthResponse<AuthUser>> {
    try {
      const result = await this.client.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password
      })

      if (result.error) {
        return {
          success: false,
          error: this.parseAuthError(result.error)
        }
      }

      return {
        success: true,
        data: result.data?.user
      }
    } catch (error) {
      return {
        success: false,
        error: this.parseAuthError(error)
      }
    }
  }

  async signInWithProvider(provider: Exclude<AuthProvider, 'email'>): Promise<AuthResponse<void>> {
    try {
      await this.client.signIn.social({ provider })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: this.parseAuthError(error)
      }
    }
  }

  async signOut(): Promise<AuthResponse<void>> {
    try {
      await this.client.signOut()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: this.parseAuthError(error)
      }
    }
  }

  async forgotPassword(data: ForgotPasswordFormData): Promise<AuthResponse<void>> {
    try {
      await this.client.forgetPassword({
        email: data.email,
        redirectTo: "/auth/reset-password"
      })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: this.parseAuthError(error)
      }
    }
  }

  async resetPassword(data: ResetPasswordFormData): Promise<AuthResponse<void>> {
    try {
      await this.client.resetPassword({
        newPassword: data.password,
        token: data.token
      })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: this.parseAuthError(error)
      }
    }
  }

  // === Validation Utilities ===
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validatePassword(password: string): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) errors.push('Password must be at least 8 characters long')
    if (!/(?=.*[a-z])/.test(password)) errors.push('Password must contain at least one lowercase letter')
    if (!/(?=.*[A-Z])/.test(password)) errors.push('Password must contain at least one uppercase letter')
    if (!/(?=.*\d)/.test(password)) errors.push('Password must contain at least one number')
    if (!/(?=.*[@$!%*?&])/.test(password)) errors.push('Password must contain at least one special character')

    return { isValid: errors.length === 0, errors }
  }

  calculatePasswordStrength(password: string): {
    score: number
    level: 'weak' | 'fair' | 'good' | 'strong'
    feedback: string[]
  } {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) score += 1
    else feedback.push('Use at least 8 characters')

    if (password.length >= 12) score += 1
    else if (password.length >= 8) feedback.push('Use 12+ characters for better security')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Add lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Add uppercase letters')

    if (/\d/.test(password)) score += 1
    else feedback.push('Add numbers')

    if (/[@$!%*?&]/.test(password)) score += 1
    else feedback.push('Add special characters')

    if (/(.)\1{2,}/.test(password)) {
      score -= 1
      feedback.push('Avoid repeating characters')
    }

    if (/123|abc|qwe/i.test(password)) {
      score -= 1
      feedback.push('Avoid common sequences')
    }

    const level = score <= 2 ? 'weak' : score <= 4 ? 'fair' : score <= 5 ? 'good' : 'strong'
    return { score: Math.max(0, score), level, feedback }
  }

  // === Error Handling ===
  private parseAuthError(error: any) {
    let code: AuthErrorCode = AUTH_ERROR_CODES.UNKNOWN_ERROR
    let message = 'Authentication failed. Please try again'

    if (error?.status === 422 || error?.status === 409) {
      code = AUTH_ERROR_CODES.USER_EXISTS
      message = 'An account with this email already exists. Please try signing in instead.'
    } else if (error?.status === 400) {
      message = 'Invalid request. Please check your information and try again.'
    } else if (error?.status === 429) {
      code = AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED
      message = 'Too many attempts. Please try again later.'
    } else if (typeof error === 'string') {
      message = error
    } else if (error?.message) {
      message = error.message
      if (error.message.toLowerCase().includes('already exists')) {
        code = AUTH_ERROR_CODES.USER_EXISTS
        message = 'An account with this email already exists. Please try signing in instead.'
      }
    }

    return createAuthError(code, message, { originalError: error })
  }
}

export const authService = new AuthService()