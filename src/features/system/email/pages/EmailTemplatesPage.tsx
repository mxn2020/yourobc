// src/features/email/pages/EmailTemplatesPage.tsx

import { FC } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { Mail, ArrowLeft, Plus } from 'lucide-react'
import { defaultLocale } from '@/features/boilerplate/i18n'

export const EmailTemplatesPage: FC = () => {
  const params = useParams({ strict: false });
  const locale = (params as any).locale;
  const currentLocale = locale || defaultLocale;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            to="/{-$locale}/email"
            params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Configuration
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-8 h-8" />
            Email Templates
          </h1>
          <p className="text-gray-600 mt-2">Manage your email templates</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Templates</h2>
        <div className="text-gray-500 text-center py-8">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No templates created yet</p>
          <p className="text-sm mt-2">Create your first email template to get started</p>
        </div>
      </div>
    </div>
  )
}
