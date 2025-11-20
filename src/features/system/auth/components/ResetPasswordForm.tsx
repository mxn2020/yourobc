// src/features/boilerplate/auth/components/ResetPasswordForm.tsx

import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { authService } from '../services/AuthService'
import type { ResetPasswordFormData } from '../types/auth.types'
import { Button, Input, Alert, AlertDescription } from '@/components/ui'
import { useTranslation, defaultLocale } from '@/features/boilerplate/i18n'
import { useAuthForm } from '../hooks/useAuthForm'

export function ResetPasswordForm() {
  const { t, locale } = useTranslation('auth')
  const navigate = useNavigate()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState('')

  // Extract token from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tokenParam = urlParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [])

  const {
    formData,
    isLoading,
    error,
    handleSubmit: onSubmit,
    updateField,
    setError
  } = useAuthForm<ResetPasswordFormData>(
    {
      password: '',
      confirmPassword: '',
      token: '',
    },
    async (data) => {
      // Validation
      if (!token) {
        throw new Error(t('forms.validation.tokenMissing'))
      }

      if (data.password !== data.confirmPassword) {
        throw new Error(t('forms.validation.passwordsNoMatch'))
      }

      const passwordValidation = authService.validatePassword(data.password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0])
      }

      // Include token in the data
      const result = await authService.resetPassword({
        ...data,
        token
      })

      if (result.success) {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate({
            to: '/{-$locale}/auth/login',
            params: { locale: locale === defaultLocale ? undefined : locale }
          })
        }, 3000)
      }

      return result
    }
  )

  // Show error if no token
  useEffect(() => {
    if (!token) {
      setError(t('forms.validation.tokenMissing'))
    }
  }, [token, setError, t])

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {t('forms.resetPassword.success.heading')}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {t('forms.resetPassword.success.description')}
        </p>

        <Button className="w-full" asChild>
          <Link
            to="/{-$locale}/auth/login"
            params={{ locale: locale === defaultLocale ? undefined : locale }}
            className="flex items-center justify-center space-x-2"
          >
            <span>{t('forms.resetPassword.success.signInButton')}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t('forms.resetPassword.heading')}
        </h3>
        <p className="text-gray-600">
          {t('forms.resetPassword.description')}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Password Field */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              label={t('forms.resetPassword.newPasswordLabel')}
              placeholder={t('forms.resetPassword.newPasswordPlaceholder')}
              icon={<Lock className="h-5 w-5" />}
              required
              minLength={8}
              disabled={isLoading || !token}
              autoComplete="new-password"
              className="pr-12"
            />
            <Button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              variant="ghost"
              className="absolute right-0 top-[29px] h-10 w-10 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t('forms.validation.passwordMinLength')}</p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              label={t('forms.resetPassword.confirmPasswordLabel')}
              placeholder={t('forms.resetPassword.confirmPasswordPlaceholder')}
              icon={<Lock className="h-5 w-5" />}
              required
              disabled={isLoading || !token}
              autoComplete="new-password"
              className="pr-12"
            />
            <Button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              variant="ghost"
              className="absolute right-0 top-[29px] h-10 w-10 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !token}
          className="w-full"
          variant="primary"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>{t('forms.resetPassword.resetting')}</span>
            </>
          ) : (
            <>
              <span>{t('forms.resetPassword.resetButton')}</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center pt-4 border-t border-gray-200">
        <Link
          to="/{-$locale}/auth/login"
          params={{ locale: locale === defaultLocale ? undefined : locale }}
          className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors hover:underline"
        >
          {t('forms.resetPassword.backToSignIn')}
        </Link>
      </div>
    </div>
  )
}