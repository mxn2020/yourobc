// src/routes/test/auth.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { authService } from '@/features/system/auth'
import { useState } from 'react'

export const Route = createFileRoute('/{-$locale}/test/auth')({
  component: AuthTestPage,
})

/**
 * JWT Authentication Test Page
 *
 * Interactive UI for testing the Better Auth → Convex JWT flow
 * Development only
 */
function AuthTestPage() {
  const { data: sessionData } = authService.useSession()
  const [jwtTestResult, setJwtTestResult] = useState<any>(null)
  const [convexTestResult, setConvexTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Live Convex test query
  const convexLiveTest = useConvexQuery(api.test.authTest.testJWTAuth)
  const permissionsTest = useConvexQuery(api.test.authTest.testJWTPermissions)

  // Test JWT endpoint
  const testJWT = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/test-jwt')
      const data = await response.json()
      setJwtTestResult(data)
    } catch (error) {
      setJwtTestResult({
        error: 'Failed to fetch',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Test Convex endpoint
  const testConvex = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/test-convex')
      const data = await response.json()
      setConvexTestResult(data)
    } catch (error) {
      setConvexTestResult({
        error: 'Failed to fetch',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Test all
  const testAll = async () => {
    await testJWT()
    await testConvex()
  }

  if (!sessionData?.user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              JWT Authentication Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to test JWT authentication
            </p>
            <a
              href="/auth/signin"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            JWT Authentication Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Validate Better Auth JWT integration with Convex
          </p>
        </div>

        {/* Current Session */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Current Session
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">User ID:</span>
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                {sessionData.user.id}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
              <span className="text-gray-900 dark:text-white">{sessionData.user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Role:</span>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                {sessionData.user.role || 'user'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Run Tests
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testJWT}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test JWT Generation
            </button>
            <button
              onClick={testConvex}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Convex Integration
            </button>
            <button
              onClick={testAll}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run All Tests
            </button>
          </div>
        </div>

        {/* Live Convex Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Live Convex Test (Real-time)
          </h2>
          <TestResultCard
            result={convexLiveTest}
            title="Convex Query Result"
          />
        </div>

        {/* Permissions Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Permissions Test
          </h2>
          <TestResultCard
            result={permissionsTest}
            title="User Permissions"
          />
        </div>

        {/* JWT Test Results */}
        {jwtTestResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              JWT Test Results
            </h2>
            <TestResultCard
              result={jwtTestResult}
              title="Better Auth JWT"
            />
          </div>
        )}

        {/* Convex Test Results */}
        {convexTestResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Convex Test Results
            </h2>
            <TestResultCard
              result={convexTestResult}
              title="Convex Integration"
            />
          </div>
        )}

        {/* Documentation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            Test Endpoints
          </h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                GET /api/auth/test-jwt
              </code>
              <span className="ml-2">- Test JWT generation and structure</span>
            </div>
            <div>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                GET /api/auth/test-convex
              </code>
              <span className="ml-2">- Test Convex JWT integration</span>
            </div>
            <div>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                api.test.authTest.testJWTAuth
              </code>
              <span className="ml-2">- Convex query (live test)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Component to display test results in a formatted way
 */
function TestResultCard({ result, title }: { result: any; title: string }) {
  if (!result) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm">
        No data yet...
      </div>
    )
  }

  // Determine status color
  const getStatusColor = () => {
    if (result.error) return 'text-red-600 dark:text-red-400'
    if (result.success === true || result.status === 'success') {
      return 'text-green-600 dark:text-green-400'
    }
    if (result.status === 'warning') return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="space-y-3">
      {/* Status Message */}
      {result.message && (
        <div className={`font-semibold ${getStatusColor()}`}>
          {result.message}
        </div>
      )}

      {/* JSON Display */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  )
}
