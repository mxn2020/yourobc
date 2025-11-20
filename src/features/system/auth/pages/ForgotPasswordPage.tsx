// src/features/boilerplate/pages/ForgotPasswordPage.tsx
import React from 'react'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'
import { AuthLayout } from '../components/AuthLayout'
import { useTranslation } from '@/features/boilerplate/i18n'

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout
      title={t('pages.forgotPassword.title')}
      subtitle={t('pages.forgotPassword.subtitle')}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
