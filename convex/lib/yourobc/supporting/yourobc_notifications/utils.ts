// convex/lib/yourobc/supporting/yourobc_notifications/utils.ts

import { EntityType } from '../../../../types';
import { YourOBC_NOTIFICATION_CONSTANTS } from './constants';
import type { CreateYourOBCNotificationData } from './types';

export function validateYourOBCNotificationData(data: Partial<CreateYourOBCNotificationData>): string[] {
  const errors: string[] = [];

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required');
    } else if (data.title.length > YourOBC_NOTIFICATION_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${YourOBC_NOTIFICATION_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
    }
  }

  if (data.message !== undefined) {
    if (!data.message.trim()) {
      errors.push('Message is required');
    } else if (data.message.length > YourOBC_NOTIFICATION_CONSTANTS.LIMITS.MAX_MESSAGE_LENGTH) {
      errors.push(`Message must be less than ${YourOBC_NOTIFICATION_CONSTANTS.LIMITS.MAX_MESSAGE_LENGTH} characters`);
    }
  }

  return errors;
}

export function generateActionUrl(entityType: EntityType, entityId: string): string {
  const routes: Record<string, string> = {
    customer: `/customers/${entityId}`,
    quote: `/quotes/${entityId}`,
    shipment: `/shipments/${entityId}`,
    invoice: `/invoices/${entityId}`,
    employee: `/employees/${entityId}`,
    partner: `/partners/${entityId}`,
    reminder: `/reminders/${entityId}`,
  };
  
  return routes[entityType] || '#';
}

