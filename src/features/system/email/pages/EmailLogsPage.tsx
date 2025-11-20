// src/features/email/pages/EmailLogsPage.tsx

import { FC } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { Mail, ArrowLeft, Filter } from 'lucide-react'
import { defaultLocale } from '@/features/system/i18n'

export const EmailLogsPage: FC = () => {
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
            Email Logs
          </h1>
          <p className="text-gray-600 mt-2">View email delivery history and analytics</p>
        </div>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Sent</div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Delivered</div>
          <div className="text-2xl font-bold text-green-600">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-red-600">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">0</div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Emails</h2>
        <div className="text-gray-500 text-center py-8">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No emails sent yet</p>
          <p className="text-sm mt-2">Email logs will appear here once you start sending emails</p>
        </div>
      </div>
    </div>
  )
}
