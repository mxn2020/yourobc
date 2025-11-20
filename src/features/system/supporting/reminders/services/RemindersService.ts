// src/features/boilerplate/supporting/reminders/services/RemindersService.ts

import type { Reminder, CreateReminderData, UpdateReminderData } from '../types';
import { MAX_CONTENT_LENGTH } from '../../shared/constants';

export class RemindersService {
  static validateReminderData(data: Partial<CreateReminderData>): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > MAX_CONTENT_LENGTH.SHORT_TEXT) {
      errors.push(`Title must be less than ${MAX_CONTENT_LENGTH.SHORT_TEXT} characters`);
    }

    if (data.description && data.description.length > MAX_CONTENT_LENGTH.MEDIUM_TEXT) {
      errors.push(`Description must be less than ${MAX_CONTENT_LENGTH.MEDIUM_TEXT} characters`);
    }

    if (!data.dueDate) {
      errors.push('Due date is required');
    } else if (data.dueDate < Date.now()) {
      errors.push('Due date must be in the future');
    }

    if (!data.assignedTo) {
      errors.push('Assigned user is required');
    }

    if (!data.entityType) {
      errors.push('Entity type is required');
    }

    if (!data.entityId) {
      errors.push('Entity ID is required');
    }

    return errors;
  }

  static isOverdue(reminder: Reminder): boolean {
    return reminder.status === 'pending' && reminder.dueDate < Date.now();
  }

  static isDueToday(reminder: Reminder): boolean {
    const now = new Date();
    const dueDate = new Date(reminder.dueDate);
    return (
      reminder.status === 'pending' &&
      now.toDateString() === dueDate.toDateString()
    );
  }

  static isDueSoon(reminder: Reminder, days = 7): boolean {
    const soonDate = Date.now() + days * 24 * 60 * 60 * 1000;
    return reminder.status === 'pending' && reminder.dueDate <= soonDate && reminder.dueDate > Date.now();
  }

  static getPriorityColor(priority: Reminder['priority']): string {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colors[priority];
  }

  static getPriorityLabel(priority: Reminder['priority']): string {
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    };
    return labels[priority];
  }

  static getTypeLabel(type: Reminder['type']): string {
    const labels = {
      task: 'Task',
      follow_up: 'Follow-up',
      review: 'Review',
      meeting: 'Meeting',
      deadline: 'Deadline',
    };
    return labels[type];
  }

  static getTypeIcon(type: Reminder['type']): string {
    const icons = {
      task: '✓',
      follow_up: '↩',
      review: '👁',
      meeting: '📅',
      deadline: '⏰',
    };
    return icons[type];
  }

  static getStatusBadgeVariant(status: Reminder['status']): 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'danger' | 'info' | 'error' {
    const variants = {
      pending: 'info' as const,
      snoozed: 'warning' as const,
      completed: 'success' as const,
      cancelled: 'danger' as const,
    };
    return variants[status];
  }

  static filterOverdueReminders(reminders: Reminder[]): Reminder[] {
    return reminders.filter((r) => this.isOverdue(r));
  }

  static filterDueTodayReminders(reminders: Reminder[]): Reminder[] {
    return reminders.filter((r) => this.isDueToday(r));
  }

  static filterUpcomingReminders(reminders: Reminder[], days = 7): Reminder[] {
    return reminders.filter((r) => this.isDueSoon(r, days));
  }

  static sortRemindersByDate(reminders: Reminder[], ascending = true): Reminder[] {
    return [...reminders].sort((a, b) => {
      const diff = a.dueDate - b.dueDate;
      return ascending ? diff : -diff;
    });
  }

  static sortRemindersByPriority(reminders: Reminder[]): Reminder[] {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...reminders].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  static getRemindersStats(reminders: Reminder[]): {
    total: number;
    overdue: number;
    dueToday: number;
    upcoming: number;
    completed: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  } {
    const stats = {
      total: reminders.length,
      overdue: 0,
      dueToday: 0,
      upcoming: 0,
      completed: 0,
      byPriority: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };

    reminders.forEach((reminder) => {
      if (this.isOverdue(reminder)) stats.overdue++;
      if (this.isDueToday(reminder)) stats.dueToday++;
      if (this.isDueSoon(reminder)) stats.upcoming++;
      if (reminder.status === 'completed') stats.completed++;

      stats.byPriority[reminder.priority] = (stats.byPriority[reminder.priority] || 0) + 1;
      stats.byType[reminder.type] = (stats.byType[reminder.type] || 0) + 1;
    });

    return stats;
  }
}
