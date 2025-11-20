// src/features/boilerplate/auth/components/ForgotPasswordForm.tsx

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Mail, ArrowRight, ArrowLeft, Send, Loader2 } from 'lucide-react'
import { authService } from '../services/AuthService'
import { Button, Input, Alert, AlertDescription } from '@/components/ui'
import { useTranslation, defaultLocale } from '@/features/boilerplate/i18n'
import { useAuthForm } from '../hooks/useAuthForm'
import type { ForgotPasswordFormData } from '../types/auth.types'

export function ForgotPasswordForm() {
  const { t, locale } = useTranslation('auth')
  const [isEmailSent, setIsEmailSent] = useState(false)

  const {
    formData,
    isLoading,
    error,
    handleSubmit: onSubmit,
    updateField,
    resetForm
  } = useAuthForm<ForgotPasswordFormData>(
    { email: '' },
    async (data) => {
      // Client-side validation
      if (!authService.validateEmail(data.email)) {
        throw new Error(t('forms.validation.emailInvalid'))
      }

      const result = await authService.forgotPassword(data)

      if (result.success) {
        setIsEmailSent(true)
      }

      return result
    }
  )

  const handleResend = () => {
    setIsEmailSent(false)
    resetForm()
  }

  if (isEmailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {t('forms.forgotPassword.success.heading')}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {t('forms.forgotPassword.success.description', { email: formData.email })}
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={handleResend}
            className="w-full"
            variant="primary"
          >
            <Send className="h-5 w-5 mr-2" />
            <span>{t('forms.forgotPassword.success.resendButton')}</span>
          </Button>

          <Button variant="ghost" asChild className="w-full">
            <Link
              to="/{-$locale}/auth/login"
              params={{ locale: locale === defaultLocale ? undefined : locale }}
              className="flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('forms.forgotPassword.backToSignIn')}</span>
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t('forms.forgotPassword.heading')}
        </h3>
        <p className="text-gray-600">
          {t('forms.forgotPassword.description')}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
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
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          variant="primary"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>{t('forms.forgotPassword.sending')}</span>
            </>
          ) : (
            <>
              <span>{t('forms.forgotPassword.sendButton')}</span>
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
          className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors flex items-center justify-center space-x-2 mx-auto hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('forms.forgotPassword.backToSignIn')}</span>
        </Link>
      </div>
    </div>
  )
}