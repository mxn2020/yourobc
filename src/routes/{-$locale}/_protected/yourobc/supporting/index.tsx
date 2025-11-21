// src/routes/_protected/yourobc/supporting/index.tsx
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/supporting/')({
  component: SupportingIndexPage,
  head: () => ({
    meta: [
      {
        title: 'YourOBC Supporting Tools',
      },
      {
        name: 'description',
        content: 'Supporting tools and utilities for YourOBC management',
      },
    ],
  }),
})

function SupportingIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Comments */}
      <Link 
        to="/yourobc/supporting/comments"
        className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-xl">💬</span>
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">Comments</h3>
        </div>
        <p className="text-gray-600">
          Manage customer comments and notes across all YourOBC entities
        </p>
      </Link>

      {/* Exchange Rates */}
      <Link 
        to="/yourobc/supporting/exchange-rates"
        className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-xl">💱</span>
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">Exchange Rates</h3>
        </div>
        <p className="text-gray-600">
          Monitor and manage currency exchange rates for international business
        </p>
      </Link>

      {/* Follow-up Reminders */}
      <Link 
        to="/yourobc/supporting/followup-reminders"
        className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span className="text-yellow-600 text-xl">⏰</span>
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">Follow-up Reminders</h3>
        </div>
        <p className="text-gray-600">
          Set and manage customer follow-up reminders and schedules
        </p>
      </Link>

      {/* Inquiry Sources */}
      <Link 
        to="/yourobc/supporting/inquiry-sources"
        className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-xl">📊</span>
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">Inquiry Sources</h3>
        </div>
        <p className="text-gray-600">
          Track and manage customer inquiry sources for better analytics
        </p>
      </Link>

      {/* Wiki */}
      <Link 
        to="/yourobc/supporting/wiki"
        className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span className="text-indigo-600 text-xl">📚</span>
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">YourOBC Wiki</h3>
        </div>
        <p className="text-gray-600">
          Access your YourOBC knowledge base and documentation
        </p>
      </Link>

      {/* Placeholder for future tools */}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg opacity-60">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xl">⚙️</span>
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-500">More Tools</h3>
        </div>
        <p className="text-gray-500">
          Additional supporting tools coming soon...
        </p>
      </div>
    </div>
  )
}