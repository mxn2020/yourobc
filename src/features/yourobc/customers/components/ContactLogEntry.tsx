// src/features/yourobc/customers/components/ContactLogEntry.tsx

import { FC, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/generated/api'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import {
  Card,
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
  Checkbox,
} from '@/components/ui'
import { Phone, Mail, Video, MessageSquare, MapPin, Users, Save, X } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

interface ContactLogEntryProps {
  customerId: Id<'yourobcCustomers'>
  onSuccess?: () => void
  onCancel?: () => void
}

const CONTACT_TYPES = [
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'video_call', label: 'Video Call', icon: Video },
  { value: 'chat', label: 'Chat', icon: MessageSquare },
  { value: 'visit', label: 'Visit', icon: MapPin },
  { value: 'other', label: 'Other', icon: MessageSquare },
]

const DIRECTIONS = [
  { value: 'inbound', label: 'Inbound (Customer contacted us)' },
  { value: 'outbound', label: 'Outbound (We contacted customer)' },
]

const OUTCOMES = [
  { value: 'successful', label: 'Successful' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'callback_requested', label: 'Callback Requested' },
  { value: 'issue_resolved', label: 'Issue Resolved' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'follow_up_needed', label: 'Follow-up Needed' },
  { value: 'other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export const ContactLogEntry: FC<ContactLogEntryProps> = ({
  customerId,
  onSuccess,
  onCancel,
}) => {
  const toast = useToast()
  const { user } = useAuth()
  const logContact = useMutation(api.lib.yourobc.customers.contacts.index.logContact)

  const [contactType, setContactType] = useState<string>('phone')
  const [direction, setDirection] = useState<string>('outbound')
  const [subject, setSubject] = useState('')
  const [summary, setSummary] = useState('')
  const [detailedNotes, setDetailedNotes] = useState('')
  const [outcome, setOutcome] = useState<string>('successful')
  const [priority, setPriority] = useState<string>('medium')
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(undefined)
  const [requiresFollowUp, setRequiresFollowUp] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !summary.trim()) {
      toast.error('Subject and summary are required')
      return
    }

    if (!user?.id) {
      toast.error('You must be logged in to log contact')
      return
    }

    setIsLoading(true)
    try {
      await logContact({
        authUserId: user.id,
        customerId,
        contactType: contactType as any,
        direction: direction as any,
        subject: subject.trim(),
        summary: summary.trim(),
        details: detailedNotes.trim() || undefined,
        outcome: outcome as any,
        priority: priority as any,
        duration: durationMinutes,
        requiresFollowUp,
        followUpDate: followUpDate ? new Date(followUpDate).getTime() : undefined,
        followUpNotes: followUpNotes.trim() || undefined,
        category: (category.trim() || undefined) as 'sales' | 'support' | 'billing' | 'complaint' | 'general' | 'other' | undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      })

      toast.success('Contact logged successfully')

      // Reset form
      setSubject('')
      setSummary('')
      setDetailedNotes('')
      setDurationMinutes(undefined)
      setRequiresFollowUp(false)
      setFollowUpDate('')
      setFollowUpNotes('')
      setCategory('')
      setTags('')

      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to log contact')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Log Customer Contact</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Type & Direction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactType">Contact Type *</Label>
            <Select value={contactType} onValueChange={setContactType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="direction">Direction *</Label>
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((dir) => (
                  <SelectItem key={dir.value} value={dir.value}>
                    {dir.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief subject of the contact"
            required
          />
        </div>

        {/* Summary */}
        <div>
          <Label htmlFor="summary">Summary *</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Quick summary of the interaction"
            rows={2}
            required
          />
        </div>

        {/* Detailed Notes */}
        <div>
          <Label htmlFor="detailedNotes">Detailed Notes</Label>
          <Textarea
            id="detailedNotes"
            value={detailedNotes}
            onChange={(e) => setDetailedNotes(e.target.value)}
            placeholder="Additional details, action items, etc."
            rows={4}
          />
        </div>

        {/* Outcome, Priority, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="outcome">Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTCOMES.map((out) => (
                  <SelectItem key={out.value} value={out.value}>
                    {out.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((pri) => (
                  <SelectItem key={pri.value} value={pri.value}>
                    {pri.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              value={durationMinutes || ''}
              onChange={(e) =>
                setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Category & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Support, Sales, Billing"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., urgent, pricing, delivery"
            />
          </div>
        </div>

        {/* Follow-up Section */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              id="requiresFollowUp"
              checked={requiresFollowUp}
              onChange={(checked: boolean | 'indeterminate') => setRequiresFollowUp(checked === true)}
            />
            <Label htmlFor="requiresFollowUp" className="font-semibold">
              Requires Follow-up
            </Label>
          </div>

          {requiresFollowUp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                <Textarea
                  id="followUpNotes"
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="What needs to be done in the follow-up?"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}

          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Logging...' : 'Log Contact'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
