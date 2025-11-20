// src/features/boilerplate/pages/ResetPasswordPage.tsx
import React from 'react'
import { ResetPasswordForm } from '../components/ResetPasswordForm'
import { AuthLayout } from '../components/AuthLayout'
import { useTranslation } from '@/features/boilerplate/i18n'

export function ResetPasswordPage() {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout
      title={t('pages.resetPassword.title')}
      subtitle={t('pages.resetPassword.subtitle')}
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
