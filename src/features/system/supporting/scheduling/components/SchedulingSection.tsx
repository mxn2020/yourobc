// src/features/boilerplate/supporting/scheduling/components/SchedulingSection.tsx

import { useState } from 'react';
import { useAuth } from '@/features/boilerplate/auth';
import {
  useEntityEvents,
  useCancelEvent,
  useCompleteEvent,
  useRespondToEvent,
} from '../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Plus } from 'lucide-react';
import { EventList } from './EventList';
import type { Id } from '@/convex/_generated/dataModel';

interface SchedulingSectionProps {
  entityType: string;
  entityId: string;
  title?: string;
  showCreateButton?: boolean;
  className?: string;
}

export function SchedulingSection({
  entityType,
  entityId,
  title = 'Schedule',
  showCreateButton = true,
  className,
}: SchedulingSectionProps) {
  const { user, profile } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const userId = profile?._id;

  const events = useEntityEvents(entityType, entityId);
  const cancelEvent = useCancelEvent();
  const completeEvent = useCompleteEvent();
  const respondToEvent = useRespondToEvent();

  const handleEdit = (eventId: Id<'scheduledEvents'>) => {
    // TODO: Open edit dialog
    console.log('Edit event:', eventId);
  };

  const handleCancel = async (eventId: Id<'scheduledEvents'>) => {
    if (!user) return;
    if (!confirm('Are you sure you want to cancel this event?')) return;

    await cancelEvent({
      eventId,
      reason: 'Cancelled by user',
    });
  };

  const handleComplete = async (eventId: Id<'scheduledEvents'>) => {
    if (!user) return;

    await completeEvent({
      eventId,
    });
  };

  const handleRSVP = async (
    eventId: Id<'scheduledEvents'>,
    status: 'accepted' | 'declined' | 'tentative'
  ) => {
    if (!user) return;

    await respondToEvent({
      eventId,
      status,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
            {events && <Badge variant="secondary">{events.length}</Badge>}
          </div>
          {showCreateButton && (
            <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreateForm && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              Event creation form would go here (implement EventCreateForm component)
            </p>
          </div>
        )}

        <EventList
          events={events || []}
          currentUserId={userId}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onComplete={handleComplete}
          onRSVP={handleRSVP}
          emptyMessage="No events scheduled."
        />
      </CardContent>
    </Card>
  );
}
