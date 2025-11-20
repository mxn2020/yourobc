// convex/lib/yourobc/customers/contacts/utils.ts

import { CONTACT_LOG_CONSTANTS } from './constants';

export function validateContactLogData(data: {
  subject?: string;
  summary?: string;
  details?: string;
  tags?: string[];
  duration?: number;
}): string[] {
  const errors: string[] = [];

  if (data.subject !== undefined && !data.subject.trim()) {
    errors.push('Subject is required');
  }

  if (data.subject && data.subject.length > CONTACT_LOG_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH) {
    errors.push(`Subject must be less than ${CONTACT_LOG_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH} characters`);
  }

  if (data.summary !== undefined && !data.summary.trim()) {
    errors.push('Summary is required');
  }

  if (data.summary && data.summary.length > CONTACT_LOG_CONSTANTS.LIMITS.MAX_SUMMARY_LENGTH) {
    errors.push(`Summary must be less than ${CONTACT_LOG_CONSTANTS.LIMITS.MAX_SUMMARY_LENGTH} characters`);
  }

  if (data.details && data.details.length > CONTACT_LOG_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    errors.push(`Detailed notes must be less than ${CONTACT_LOG_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
  }

  if (data.tags && data.tags.length > CONTACT_LOG_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${CONTACT_LOG_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
  }

  if (data.duration !== undefined && data.duration < 0) {
    errors.push('Duration must be a positive number');
  }

  return errors;
}

export function formatContactType(type: string): string {
  const labels: Record<string, string> = {
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.PHONE]: 'Phone Call',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.EMAIL]: 'Email',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.MEETING]: 'Meeting',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.VIDEO_CALL]: 'Video Call',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.CHAT]: 'Chat',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.VISIT]: 'Site Visit',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.OTHER]: 'Other',
  };
  return labels[type] || type;
}

export function formatOutcome(outcome: string): string {
  const labels: Record<string, string> = {
    [CONTACT_LOG_CONSTANTS.OUTCOME.SUCCESSFUL]: 'Successful',
    [CONTACT_LOG_CONSTANTS.OUTCOME.NO_ANSWER]: 'No Answer',
    [CONTACT_LOG_CONSTANTS.OUTCOME.CALLBACK_REQUESTED]: 'Callback Requested',
    [CONTACT_LOG_CONSTANTS.OUTCOME.ISSUE_RESOLVED]: 'Issue Resolved',
    [CONTACT_LOG_CONSTANTS.OUTCOME.COMPLAINT]: 'Complaint',
    [CONTACT_LOG_CONSTANTS.OUTCOME.INQUIRY]: 'Inquiry',
    [CONTACT_LOG_CONSTANTS.OUTCOME.FOLLOW_UP_NEEDED]: 'Follow-up Needed',
    [CONTACT_LOG_CONSTANTS.OUTCOME.OTHER]: 'Other',
  };
  return labels[outcome] || outcome;
}

export function getContactTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.PHONE]: '📞',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.EMAIL]: '📧',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.MEETING]: '🤝',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.VIDEO_CALL]: '📹',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.CHAT]: '💬',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.VISIT]: '🏢',
    [CONTACT_LOG_CONSTANTS.CONTACT_TYPE.OTHER]: '📝',
  };
  return icons[type] || '📝';
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}
