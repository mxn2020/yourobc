// src/routes/_protected/yourobc/supporting.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/supporting')({
  component: SupportingLayout,
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

function SupportingLayout() {
  const { user } = Route.useRouteContext() // From _protected layout
  
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">YourOBC Supporting Tools</h1>
        <p className="text-gray-600">Manage supporting data and utilities for your YourOBC system</p>
      </div>
      
      {/* Navigation for supporting tools */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-4">
          <nav className="flex space-x-8">
            <a 
              href="/yourobc/supporting/comments" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Comments
            </a>
            <a 
              href="/yourobc/supporting/exchange-rates" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Exchange Rates
            </a>
            <a 
              href="/yourobc/supporting/followup-reminders" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Follow-up Reminders
            </a>
            <a 
              href="/yourobc/supporting/inquiry-sources" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Inquiry Sources
            </a>
            <a 
              href="/yourobc/supporting/wiki" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Wiki
            </a>
          </nav>
        </div>
      </div>
      
      <Outlet />
    </div>
  )
}