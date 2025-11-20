// src/features/boilerplate/supporting/scheduling/components/EventCard.tsx

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, MapPin, Users, Edit, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { SchedulingService } from '../services';
import type { ScheduledEvent } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface EventCardProps {
  event: ScheduledEvent;
  currentUserId?: Id<"userProfiles">;
  onEdit?: (eventId: Id<'scheduledEvents'>) => void;
  onCancel?: (eventId: Id<'scheduledEvents'>) => void;
  onComplete?: (eventId: Id<'scheduledEvents'>) => void;
  onRSVP?: (eventId: Id<'scheduledEvents'>, status: 'accepted' | 'declined' | 'tentative') => void;
  compact?: boolean;
}

export function EventCard({
  event,
  currentUserId,
  onEdit,
  onCancel,
  onComplete,
  onRSVP,
  compact = false,
}: EventCardProps) {
  // Only call service methods if currentUserId is provided
  const isOrganizer = currentUserId ? SchedulingService.isOrganizer(event, currentUserId) : false;
  const isAttendee = currentUserId ? SchedulingService.isAttendee(event, currentUserId) : false;
  const attendeeStatus = currentUserId ? SchedulingService.getAttendeeStatus(event, currentUserId) : 'not_invited';
  const duration = SchedulingService.getEventDuration(event);
  const typeIcon = SchedulingService.getTypeIcon(event.type);
  const isNow = SchedulingService.isEventNow(event);
  const isUpcoming = SchedulingService.isEventUpcoming(event);

  const borderColor = isNow ? 'border-green-500 border-2' : isUpcoming ? 'border-blue-300' : '';
  const bgColor = event.color ? `bg-[${event.color}]` : '';

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${borderColor}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{typeIcon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{event.title}</h3>
                {isNow && <Badge variant="primary" className="text-xs bg-green-600">Now</Badge>}
                {isUpcoming && <Badge variant="primary" className="text-xs bg-blue-600">Soon</Badge>}
              </div>
              {event.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
              )}
            </div>
          </div>

          {/* Event details */}
          <div className="space-y-1 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(event.startTime, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {SchedulingService.formatTimeRange(event.startTime, event.endTime, event.allDay)}
                {' '}({SchedulingService.formatDuration(duration)})
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">
                  {event.location.type === 'virtual' && event.location.meetingUrl
                    ? 'Virtual meeting'
                    : event.location.address || event.location.roomNumber || 'TBD'}
                </span>
              </div>
            )}
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {SchedulingService.countAcceptedAttendees(event)}/{event.attendees.length} accepted
                </span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {SchedulingService.getTypeLabel(event.type)}
            </Badge>
            <Badge variant={SchedulingService.getStatusBadgeVariant(event.status)} className="text-xs">
              {event.status}
            </Badge>
            <Badge className={`text-xs ${SchedulingService.getPriorityColor(event.priority)}`}>
              {event.priority}
            </Badge>
            {event.isRecurring && (
              <Badge variant="secondary" className="text-xs">🔁 Recurring</Badge>
            )}
            {isAttendee && attendeeStatus !== 'not_invited' && (
              <Badge
                variant={attendeeStatus === 'accepted' ? 'primary' : 'outline'}
                className="text-xs"
              >
                {attendeeStatus}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {isOrganizer && event.status !== 'cancelled' && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(event._id)}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}

            {isAttendee && attendeeStatus === 'pending' && onRSVP && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRSVP(event._id, 'accepted')}
                  className="text-green-600"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRSVP(event._id, 'declined')}
                  className="text-red-600"
                >
                  <X className="h-3 w-3 mr-1" />
                  Decline
                </Button>
              </>
            )}

            {isOrganizer && event.status === 'scheduled' && onComplete && (
              <Button variant="ghost" size="sm" onClick={() => onComplete(event._id)}>
                <Check className="h-3 w-3 mr-1" />
                Mark Complete
              </Button>
            )}

            {isOrganizer && event.status !== 'cancelled' && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(event._id)}
                className="text-red-600"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
