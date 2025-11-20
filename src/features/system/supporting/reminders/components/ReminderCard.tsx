// src/features/boilerplate/supporting/reminders/components/ReminderCard.tsx

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, X, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RemindersService } from '../services';
import type { Reminder } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface ReminderCardProps {
  reminder: Reminder;
  currentUserId?: Id<"userProfiles">;
  onComplete?: (reminderId: Id<'reminders'>) => void;
  onSnooze?: (reminderId: Id<'reminders'>) => void;
  onCancel?: (reminderId: Id<'reminders'>) => void;
  onDelete?: (reminderId: Id<'reminders'>) => void;
  compact?: boolean;
}

export function ReminderCard({
  reminder,
  currentUserId,
  onComplete,
  onSnooze,
  onCancel,
  onDelete,
  compact = false,
}: ReminderCardProps) {
  const isOwner = currentUserId === reminder.assignedBy;
  const isAssigned = currentUserId === reminder.assignedTo;
  const isOverdue = RemindersService.isOverdue(reminder);
  const typeIcon = RemindersService.getTypeIcon(reminder.type);
  const typeLabel = RemindersService.getTypeLabel(reminder.type);

  return (
    <div className={`border rounded-lg p-4 ${isOverdue ? 'border-red-300 bg-red-50' : 'hover:shadow-md'} transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{typeIcon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-medium">{reminder.title}</h3>
              {reminder.description && (
                <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
            <Badge variant={RemindersService.getStatusBadgeVariant(reminder.status)} className="text-xs">
              {reminder.status}
            </Badge>
            <Badge className={`text-xs ${RemindersService.getPriorityColor(reminder.priority)}`}>
              {RemindersService.getPriorityLabel(reminder.priority)}
            </Badge>
            {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>Due {formatDistanceToNow(reminder.dueDate, { addSuffix: true })}</span>
            <span>•</span>
            <span>Assigned to {reminder.assignedTo}</span>
          </div>

          {reminder.status === 'pending' && (isAssigned || isOwner) && (
            <div className="flex items-center gap-2 mt-3">
              {onComplete && (
                <Button variant="outline" size="sm" onClick={() => onComplete(reminder._id)}>
                  <Check className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              )}
              {onSnooze && (
                <Button variant="ghost" size="sm" onClick={() => onSnooze(reminder._id)}>
                  <Clock className="h-3 w-3 mr-1" />
                  Snooze
                </Button>
              )}
              {onCancel && (
                <Button variant="ghost" size="sm" onClick={() => onCancel(reminder._id)}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              )}
              {isOwner && onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(reminder._id)} className="text-red-600">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
