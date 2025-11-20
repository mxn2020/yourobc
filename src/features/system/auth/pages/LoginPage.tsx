// src/features/system/pages/LoginPage.tsx
import React from 'react'
import { LoginForm } from '../components/LoginForm'
import { AuthLayout } from '../components/AuthLayout'
import { useTranslation } from '@/features/system/i18n'

export function LoginPage() {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout
      title={t('pages.login.title')}
      subtitle={t('pages.login.subtitle')}
    >
      <LoginForm />
    </AuthLayout>
  )
}
