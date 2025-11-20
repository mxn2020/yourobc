// src/features/boilerplate/auth/components/LoginForm.tsx

import React, { useEffect } from 'react'
import { useSearch, useNavigate, Link } from '@tanstack/react-router'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { authService } from '../services/AuthService'
import type { LoginFormData, AuthFormProps } from '../types/auth.types'
import { useToast } from '@/features/boilerplate/notifications/hooks/use-toast'
import { Button, Checkbox, Input, Alert, AlertDescription, Label } from '@/components/ui'
import { useTranslation, defaultLocale } from '@/features/boilerplate/i18n'
import { useAuthForm } from '../hooks/useAuthForm'

interface LoginFormProps extends Omit<AuthFormProps, 'onSubmit'> {
  onSuccess?: () => void
}

export function LoginForm({ isLoading: externalLoading, error: externalError, onSuccess }: LoginFormProps) {
  const { t, locale } = useTranslation('auth')
  const search = useSearch({ from: '/{-$locale}/auth/login' }) as { redirect?: string; email?: string }
  const navigate = useNavigate()
  const toast = useToast()

  const [showPassword, setShowPassword] = React.useState(false)

  // Use shared form hook
  const {
    formData,
    isLoading,
    error,
    handleSubmit: onSubmit,
    updateField
  } = useAuthForm<LoginFormData>(
    {
      email: '',
      password: '',
      remember: false
    },
    async (data) => {
      // Client-side validation
      if (!authService.validateEmail(data.email)) {
        throw new Error(t('forms.validation.emailInvalid'))
      }

      if (!data.password) {
        throw new Error(t('forms.validation.passwordRequired'))
      }

      const result = await authService.signInWithEmail(data)

      if (result.success) {
        toast.success(t('forms.login.success'), t('forms.login.successTitle'))

        setTimeout(() => {
          const defaultRedirect = locale === defaultLocale ? '/dashboard' : `/${locale}/dashboard`
          const redirectTo = search?.redirect || defaultRedirect

          if (onSuccess) {
            onSuccess()
          } else {
            window.location.href = redirectTo
          }
        }, 500)
      }

      return result
    }
  )

  // Pre-populate email from search params
  useEffect(() => {
    if (search?.email) {
      updateField('email', search.email)
    }
  }, [search?.email])

  const currentError = externalError || error
  const currentLoading = externalLoading || isLoading

  const handleSocialSignIn = async (provider: 'google' | 'apple' | 'twitter') => {
    if (currentLoading) return

    try {
      const result = await authService.signInWithProvider(provider)

      if (!result.success) {
        const errorMsg = result.error?.message || t('forms.login.socialFailed')
        toast.error(errorMsg, t('forms.login.socialFailed'))
      } else {
        toast.success(t('forms.social.signingInWith', { provider }))
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('forms.login.socialFailed')
      toast.error(errorMsg, t('forms.login.socialFailed'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          onClick={() => handleSocialSignIn('google')}
          disabled={currentLoading}
          variant="outline"
          className="flex items-center justify-center"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        <Button
          type="button"
          onClick={() => handleSocialSignIn('apple')}
          disabled={currentLoading}
          variant="outline"
          className="flex items-center justify-center"
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
          </svg>
          Apple
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">{t('forms.common.orContinueWith')}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {currentError && (
          <Alert variant="destructive">
            <AlertDescription>{currentError}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            label={t('forms.common.emailLabel')}
            placeholder={t('forms.common.emailPlaceholder')}
            icon={<Mail className="h-5 w-5" />}
            required
            disabled={currentLoading}
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              label={t('forms.common.passwordLabel')}
              placeholder={t('forms.common.passwordPlaceholder')}
              icon={<Lock className="h-5 w-5" />}
              required
              disabled={currentLoading}
              autoComplete="current-password"
              className="pr-12"
            />
            <Button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              disabled={currentLoading}
              variant="ghost"
              className="absolute right-0 top-[29px] h-10 w-10 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <Checkbox
            id="remember"
            checked={formData.remember || false}
            onChange={(checked) => updateField('remember', checked)}
            disabled={currentLoading}
          />
          <Label htmlFor="remember" className="ml-2">
            {t('forms.login.rememberMe')}
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={currentLoading}
          className="w-full"
          variant="primary"
        >
          {currentLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>{t('forms.login.signingIn')}</span>
            </>
          ) : (
            <>
              <span>{t('forms.login.signInButton')}</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <Link
            to="/{-$locale}/auth/forgot-password"
            params={{ locale: locale === defaultLocale ? undefined : locale }}
            search={{ redirect: search?.redirect }}
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium hover:underline transition-colors"
          >
            {t('forms.login.forgotPassword')}
          </Link>
        </div>
      </form>

      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-gray-600">
          {t('forms.login.noAccount')}{' '}
          <Link
            to="/{-$locale}/auth/signup"
            params={{ locale: locale === defaultLocale ? undefined : locale }}
            search={{ redirect: search?.redirect }}
            className="text-indigo-600 font-medium hover:text-indigo-500 transition-colors hover:underline"
          >
            {t('forms.login.signUpLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
