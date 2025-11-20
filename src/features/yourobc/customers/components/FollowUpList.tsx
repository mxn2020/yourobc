// src/features/yourobc/customers/components/FollowUpList.tsx

import { FC } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { Card, Button, Badge } from '@/components/ui'
import { CheckCircle2, Clock, AlertTriangle, Building2 } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

interface FollowUpListProps {
  customerId?: Id<'yourobcCustomers'>
  showOverdueOnly?: boolean
}

export const FollowUpList: FC<FollowUpListProps> = ({
  customerId,
  showOverdueOnly = false,
}) => {
  const toast = useToast()
  const { user } = useAuth()

  const followUps = useQuery(api.lib.yourobc.customers.contacts.index.getPendingFollowUps, {
    customerId,
    overdue: showOverdueOnly || undefined,
  })

  const completeFollowUp = useMutation(api.lib.yourobc.customers.contacts.index.completeFollowUp)

  const handleComplete = async (contactLogId: Id<'yourobcContactLog'>) => {
    if (!user?.id) {
      toast.error('You must be logged in to complete follow-ups')
      return
    }

    try {
      await completeFollowUp({ authUserId: user.id, contactLogId })
      toast.success('Follow-up completed')
    } catch (error) {
      toast.error('Failed to complete follow-up')
    }
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp))
  }

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = timestamp - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) {
      return `${Math.abs(days)} days overdue`
    } else if (days === 0) {
      return 'Due today'
    } else if (days === 1) {
      return 'Due tomorrow'
    } else {
      return `Due in ${days} days`
    }
  }

  if (!followUps) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </Card>
    )
  }

  if (followUps.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">All Caught Up!</h3>
        <p className="text-gray-600">
          {showOverdueOnly
            ? 'No overdue follow-ups'
            : 'No pending follow-ups at the moment'}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {followUps.map((followUp: any) => (
        <Card
          key={followUp._id}
          className={`p-4 ${followUp.isOverdue ? 'border-red-300 bg-red-50' : ''}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Customer Info (if showing all customers) */}
              {!customerId && followUp.customer && (
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {followUp.customer.companyName || followUp.customer.name}
                  </span>
                </div>
              )}

              {/* Subject */}
              <h4 className="font-semibold text-gray-900 mb-1">{followUp.subject}</h4>

              {/* Summary */}
              <p className="text-sm text-gray-600 mb-2">{followUp.summary}</p>

              {/* Follow-up Notes */}
              {followUp.followUpNotes && (
                <div className="bg-white p-2 rounded border border-gray-200 text-sm text-gray-700 mb-2">
                  <span className="font-medium">Follow-up: </span>
                  {followUp.followUpNotes}
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {/* Due Date */}
                <div className="flex items-center gap-1">
                  {followUp.isOverdue ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span
                    className={followUp.isOverdue ? 'text-red-700 font-medium' : 'text-gray-600'}
                  >
                    {followUp.followUpDate && formatRelativeTime(followUp.followUpDate)}
                  </span>
                </div>

                {/* Exact Date */}
                {followUp.followUpDate && (
                  <span className="text-gray-500">
                    • {formatDate(followUp.followUpDate)}
                  </span>
                )}

                {/* Contact Type */}
                <Badge variant="secondary" className="text-xs">
                  {followUp.contactType.replace('_', ' ')}
                </Badge>

                {/* Priority */}
                {followUp.priority && followUp.priority !== 'medium' && (
                  <Badge
                    className={
                      followUp.priority === 'urgent' || followUp.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }
                  >
                    {followUp.priority}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Button */}
            <Button
              size="sm"
              variant={followUp.isOverdue ? 'primary' : 'outline'}
              onClick={() => handleComplete(followUp._id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
