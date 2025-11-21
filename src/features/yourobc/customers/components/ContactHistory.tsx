// src/features/yourobc/customers/components/ContactHistory.tsx

import { FC, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/generated/api'
import { useToast } from '@/features/system/notifications'
import { useAuth } from '@/features/system/auth'
import {
  Card,
  Button,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui'
import {
  Phone,
  Mail,
  Video,
  MessageSquare,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

interface ContactHistoryProps {
  customerId: Id<'yourobcCustomers'>
}

const CONTACT_ICONS: Record<string, any> = {
  phone: Phone,
  email: Mail,
  meeting: Users,
  video_call: Video,
  chat: MessageSquare,
  visit: MapPin,
  other: MessageSquare,
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const OUTCOME_COLORS: Record<string, string> = {
  successful: 'bg-green-100 text-green-700',
  no_answer: 'bg-gray-100 text-gray-700',
  callback_requested: 'bg-blue-100 text-blue-700',
  issue_resolved: 'bg-green-100 text-green-700',
  complaint: 'bg-red-100 text-red-700',
  inquiry: 'bg-blue-100 text-blue-700',
  follow_up_needed: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
}

export const ContactHistory: FC<ContactHistoryProps> = ({ customerId }) => {
  const toast = useToast()
  const { user } = useAuth()
  const [filterType, setFilterType] = useState<string>('all')
  const [filterOutcome, setFilterOutcome] = useState<string>('all')

  const contactLog = useQuery(api.lib.yourobc.customers.contacts.index.getContactLog, {
    customerId,
    limit: 50,
  })
  const contacts = contactLog?.contacts || []
  const hasMore = contactLog?.hasMore || false

  const completeFollowUp = useMutation(api.lib.yourobc.customers.contacts.index.completeFollowUp)

  const handleCompleteFollowUp = async (contactLogId: Id<'yourobcContactLog'>) => {
    if (!user?.id) return

    try {
      await completeFollowUp({ authUserId: user.id, contactLogId })
      toast.success('Follow-up marked as completed')
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  // Filter contacts
  const filteredContacts = contacts.filter((contact: any) => {
    if (filterType !== 'all' && contact.contactType !== filterType) return false
    if (filterOutcome !== 'all' && contact.outcome !== filterOutcome) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="video_call">Video Call</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="visit">Visit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterOutcome} onValueChange={setFilterOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="no_answer">No Answer</SelectItem>
                <SelectItem value="callback_requested">Callback Requested</SelectItem>
                <SelectItem value="issue_resolved">Issue Resolved</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="follow_up_needed">Follow-up Needed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No contact history found</p>
          </Card>
        ) : (
          filteredContacts.map((contact: any, index: number) => {
            const Icon = CONTACT_ICONS[contact.contactType] || MessageSquare
            const isOverdue =
              contact.requiresFollowUp &&
              !contact.followUpCompleted &&
              contact.followUpDate &&
              contact.followUpDate < Date.now()

            return (
              <Card key={contact._id} className="p-6 relative">
                {/* Timeline Connector */}
                {index < filteredContacts.length - 1 && (
                  <div className="absolute left-[29px] top-[60px] bottom-[-16px] w-0.5 bg-gray-200" />
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center relative z-10">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{contact.subject}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(contact.contactDate)}
                          {contact.durationMinutes && (
                            <span className="ml-2">• {formatDuration(contact.durationMinutes)}</span>
                          )}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap justify-end">
                        <Badge className={PRIORITY_COLORS[contact.priority || 'medium']}>
                          {contact.priority}
                        </Badge>
                        {contact.outcome && (
                          <Badge className={OUTCOME_COLORS[contact.outcome]}>
                            {contact.outcome.replace('_', ' ')}
                          </Badge>
                        )}
                        {contact.direction && (
                          <Badge variant="outline">
                            {contact.direction === 'inbound' ? '→ In' : '← Out'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-gray-700 mb-3">{contact.summary}</p>

                    {/* Detailed Notes */}
                    {contact.detailedNotes && (
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-3">
                        {contact.detailedNotes}
                      </div>
                    )}

                    {/* Tags */}
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {contact.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Follow-up */}
                    {contact.requiresFollowUp && (
                      <div
                        className={`mt-3 p-3 rounded border ${
                          contact.followUpCompleted
                            ? 'bg-green-50 border-green-200'
                            : isOverdue
                              ? 'bg-red-50 border-red-200'
                              : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            {contact.followUpCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            ) : isOverdue ? (
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                            )}

                            <div className="text-sm">
                              <p
                                className={`font-semibold ${
                                  contact.followUpCompleted
                                    ? 'text-green-900'
                                    : isOverdue
                                      ? 'text-red-900'
                                      : 'text-yellow-900'
                                }`}
                              >
                                {contact.followUpCompleted
                                  ? 'Follow-up Completed'
                                  : isOverdue
                                    ? 'Follow-up Overdue'
                                    : 'Follow-up Required'}
                              </p>
                              {contact.followUpDate && (
                                <p
                                  className={
                                    contact.followUpCompleted
                                      ? 'text-green-700'
                                      : isOverdue
                                        ? 'text-red-700'
                                        : 'text-yellow-700'
                                  }
                                >
                                  {contact.followUpCompleted ? 'Completed: ' : 'Due: '}
                                  {formatDate(
                                    contact.followUpCompleted && contact.followUpCompletedDate
                                      ? contact.followUpCompletedDate
                                      : contact.followUpDate
                                  )}
                                </p>
                              )}
                              {contact.followUpNotes && (
                                <p className="text-gray-600 mt-1">{contact.followUpNotes}</p>
                              )}
                            </div>
                          </div>

                          {!contact.followUpCompleted && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteFollowUp(contact._id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}

        {hasMore && (
          <div className="text-center">
            <Button variant="outline">Load More</Button>
          </div>
        )}
      </div>
    </div>
  )
}
