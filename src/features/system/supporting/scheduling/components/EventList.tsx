// src/features/system/supporting/scheduling/components/EventList.tsx

import { EventCard } from './EventCard';
import { SchedulingService } from '../services';
import type { ScheduledEvent } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface EventListProps {
  events: ScheduledEvent[];
  currentUserId?: Id<"userProfiles">;
  onEdit?: (eventId: Id<'scheduledEvents'>) => void;
  onCancel?: (eventId: Id<'scheduledEvents'>) => void;
  onComplete?: (eventId: Id<'scheduledEvents'>) => void;
  onRSVP?: (eventId: Id<'scheduledEvents'>, status: 'accepted' | 'declined' | 'tentative') => void;
  groupByDate?: boolean;
  emptyMessage?: string;
}

export function EventList({
  events,
  currentUserId,
  onEdit,
  onCancel,
  onComplete,
  onRSVP,
  groupByDate = true,
  emptyMessage = 'No events found.',
}: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  if (groupByDate) {
    const grouped = SchedulingService.groupEventsByDate(events);
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return (
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date}>
            <h3 className="font-medium text-lg mb-3">{date}</h3>
            <div className="space-y-3">
              {grouped[date].map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  currentUserId={currentUserId}
                  onEdit={onEdit}
                  onCancel={onCancel}
                  onComplete={onComplete}
                  onRSVP={onRSVP}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onCancel={onCancel}
          onComplete={onComplete}
          onRSVP={onRSVP}
        />
      ))}
    </div>
  );
}
