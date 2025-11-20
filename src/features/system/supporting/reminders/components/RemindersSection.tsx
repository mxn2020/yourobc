// src/features/boilerplate/supporting/reminders/components/RemindersSection.tsx

import { useAuth } from '@/features/boilerplate/auth';
import { useEntityReminders, useCompleteReminder, useCancelReminder, useDeleteReminder } from '../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bell } from 'lucide-react';
import { ReminderCard } from './ReminderCard';
import type { Id } from '@/convex/_generated/dataModel';

interface RemindersSectionProps {
  entityType: string;
  entityId: string;
  title?: string;
  className?: string;
}

export function RemindersSection({
  entityType,
  entityId,
  title = 'Reminders',
  className,
}: RemindersSectionProps) {
  const { user, profile } = useAuth();

  if (!user) {
    return null;
  }

  const userId = profile?._id;

  const reminders = useEntityReminders(entityType, entityId);
  const completeReminder = useCompleteReminder();
  const cancelReminder = useCancelReminder();
  const deleteReminder = useDeleteReminder();

  const handleComplete = async (reminderId: Id<'reminders'>) => {
    if (!user) return;

    await completeReminder({
      reminderId,
    });
  };

  const handleSnooze = async (reminderId: Id<'reminders'>) => {
    // TODO: Implement snooze dialog
    console.log('Snooze reminder:', reminderId);
  };

  const handleCancel = async (reminderId: Id<'reminders'>) => {
    if (!user) return;

    await cancelReminder({
      reminderId,
    });
  };

  const handleDelete = async (reminderId: Id<'reminders'>) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    await deleteReminder({
      reminderId,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {title}
          {reminders && <Badge variant="secondary">{reminders.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminders && reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                currentUserId={userId}
                onComplete={handleComplete}
                onSnooze={handleSnooze}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            No reminders set.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
