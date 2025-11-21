// src/features/system/supporting/reminders/hooks/useReminders.ts

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export function useEntityReminders(entityType: string, entityId: string) {
  return useQuery(
    api.lib.system.supporting.reminders.queries.getRemindersByEntity,
    entityType && entityId ? { entityType, entityId } : 'skip'
  );
}

export function useReminder(reminderId?: Id<'reminders'>) {
  return useQuery(
    api.lib.system.supporting.reminders.queries.getReminder,
    reminderId ? { reminderId } : 'skip'
  );
}

export function useUserReminders() {
  return useQuery(
    api.lib.system.supporting.reminders.queries.getMyReminders,
    {}
  );
}

export function useOverdueReminders() {
  return useQuery(
    api.lib.system.supporting.reminders.queries.getOverdueReminders,
    {}
  );
}

export function useUpcomingReminders(daysAhead = 7) {
  return useQuery(
    api.lib.system.supporting.reminders.queries.getUpcomingReminders,
    { daysAhead }
  );
}

export function useCreateReminder() {
  return useMutation(api.lib.system.supporting.reminders.mutations.createReminder);
}

export function useUpdateReminder() {
  return useMutation(api.lib.system.supporting.reminders.mutations.updateReminder);
}

export function useCompleteReminder() {
  return useMutation(api.lib.system.supporting.reminders.mutations.completeReminder);
}

export function useSnoozeReminder() {
  return useMutation(api.lib.system.supporting.reminders.mutations.snoozeReminder);
}

export function useCancelReminder() {
  return useMutation(api.lib.system.supporting.reminders.mutations.cancelReminder);
}

export function useDeleteReminder() {
  return useMutation(api.lib.system.supporting.reminders.mutations.deleteReminder);
}
