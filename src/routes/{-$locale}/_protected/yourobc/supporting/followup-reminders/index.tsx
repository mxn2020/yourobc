// src/routes/_protected/yourobc/supporting/followup-reminders/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { RemindersPage } from '@/features/yourobc/supporting/followup-reminders'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import { z } from 'zod'
import { entityTypeOptionalSchema } from '@/lib/validation/entity-types'

// Query params schema for filtering reminders
const remindersSearchSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled', 'snoozed']).optional(),
  priority: z.enum(['urgent', 'critical', 'standard']).optional(),
  type: z.enum(['follow_up', 'deadline', 'review', 'payment', 'vacation_approval', 'commission_review', 'performance_review']).optional(),
  entityType: entityTypeOptionalSchema,
  entityId: z.string().optional(),
  overdue: z.boolean().optional(),
})

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/supporting/followup-reminders/')({
  validateSearch: remindersSearchSchema,
  loader: async ({ context }) => {
    try {
      // Get authenticated session (already verified by _protected layout)
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch reminders data using TanStack Query
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.supporting.followup_reminders.queries.getReminders, {
            authUserId: session.data.user.id,
            filters: {}
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch reminders data:', error)
      return {}
    }
  },
  component: RemindersIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Follow-up Reminders - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage customer follow-up reminders and schedules',
      },
    ],
  }),
})

function RemindersIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout
  const search = Route.useSearch() // Get query parameters

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading reminders...</div>
    </div>}>
      <RemindersPage
        status={search.status}
        priority={search.priority}
        type={search.type}
        entityType={search.entityType}
        entityId={search.entityId}
        overdue={search.overdue}
      />
    </Suspense>
  )
}

