// src/features/system/pages/SignupPage.tsx
import React from 'react'
import { SignupForm } from '../components/SignupForm'
import { AuthLayout } from '../components/AuthLayout'
import { useTranslation } from '@/features/system/i18n'

export function SignupPage() {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout
      title={t('pages.signup.title')}
      subtitle={t('pages.signup.subtitle')}
    >
      <SignupForm />
    </AuthLayout>
  )
}
