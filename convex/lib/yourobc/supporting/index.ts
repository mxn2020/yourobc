// convex/lib/yourobc/supporting/index.ts
// convex/yourobc/supporting/index.ts - Simplified YourOBC Supporting Modules

import { EntityType } from '../../../types'

// Exchange Rates for EUR/USD conversion
export * from './exchange_rates'

// Inquiry Sources for lead tracking  
export * from './inquiry_sources'

// Wiki for knowledge base with search
export * from './wiki'

// Comments for entities (includes employee support)
export * from './comments'

// Follow-up Reminders (includes employee/HR reminders)
export * from './followup_reminders'

// Documents for file management (includes employee documents)
export * from './documents'

// YourOBC-specific notifications (includes employee/HR notifications)
export * from './yourobc_notifications'

// Utility functions for supporting modules
export const SUPPORTING_MODULE_UTILS = {
  // Format currency amounts consistently
  formatCurrency: (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Generate entity links for notifications and comments
  generateEntityLink: (entityType: EntityType, entityId: string): string => {
    const routes: Record<string, string> = {
      customer: `/customers/${entityId}`,
      quote: `/quotes/${entityId}`,
      shipment: `/shipments/${entityId}`,
      invoice: `/invoices/${entityId}`,
      partner: `/partners/${entityId}`,
      employee: `/employees/${entityId}`,
      reminder: `/reminders/${entityId}`,
      wiki: `/wiki/${entityId}`,
    };
    return routes[entityType] || '#';
  },

  // Calculate days between dates
  daysBetween: (date1: number, date2: number): number => {
    return Math.floor(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  },

  // Format file size for documents
  formatFileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Generate notification title based on type and entity
  generateNotificationTitle: (type: string, entityType: EntityType, entityId?: string): string => {
    const titles: Record<string, string> = {
      quote_expiring: 'Quote Expiring Soon',
      sla_warning: 'SLA Warning',
      payment_overdue: 'Payment Overdue',
      task_assigned: 'New Task Assigned',
      reminder_due: 'Reminder Due',
      vacation_request: 'Vacation Request',
      vacation_approved: 'Vacation Approved',
      vacation_denied: 'Vacation Denied',
      commission_ready: 'Commission Ready',
      performance_review_due: 'Performance Review Due',
      employee_status_change: 'Employee Status Change',
    };
    return titles[type] || 'YourOBC Notification';
  },
} as const;

// Common validation helpers for all supporting modules
export const VALIDATION_HELPERS = {
  // Check if string is not empty after trimming
  isNonEmptyString: (value: any): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
  },

  // Check if value is a positive number
  isPositiveNumber: (value: any): value is number => {
    return typeof value === 'number' && value > 0;
  },

  // Check if date is in the future
  isFutureDate: (timestamp: number): boolean => {
    return timestamp > Date.now();
  },

  // Check if date is in the past
  isPastDate: (timestamp: number): boolean => {
    return timestamp < Date.now();
  },

  // Sanitize string input
  sanitizeString: (input: string): string => {
    return input.trim().replace(/\s+/g, ' ');
  },

  // Validate URL format
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
} as const;

// Supporting module permissions (simplified)
export const SUPPORTING_PERMISSIONS = {
  // Exchange Rates
  'exchange_rates.view': 'View exchange rates',
  'exchange_rates.create': 'Create exchange rates',
  
  // Inquiry Sources  
  'inquiry_sources.view': 'View inquiry sources',
  'inquiry_sources.create': 'Create inquiry sources',
  'inquiry_sources.edit': 'Edit inquiry sources',
  
  // Wiki
  'wiki.view': 'View wiki entries',
  'wiki.create': 'Create wiki entries',
  'wiki.edit': 'Edit wiki entries',
  'wiki.publish': 'Publish wiki entries',
  
  // Comments
  'comments.view': 'View comments',
  'comments.create': 'Create comments',
  'comments.edit': 'Edit comments',
  
  // Reminders
  'reminders.view': 'View reminders',
  'reminders.create': 'Create reminders',
  'reminders.edit': 'Edit reminders',
  'reminders.assign': 'Assign reminders',
  
  // Documents
  'documents.view': 'View documents',
  'documents.upload': 'Upload documents',
  'documents.edit': 'Edit documents',
  'documents.delete': 'Delete documents',
  
  // YourOBC Notifications
  'yourobc_notifications.view': 'View YourOBC notifications',
  'yourobc_notifications.create': 'Create YourOBC notifications',
} as const;

// Role-based access for supporting modules
export const SUPPORTING_ROLE_ACCESS = {
  admin: Object.keys(SUPPORTING_PERMISSIONS),
  superadmin: Object.keys(SUPPORTING_PERMISSIONS),
  hr: [
    'wiki.view', 'wiki.create', 'wiki.edit',
    'comments.view', 'comments.create',
    'reminders.view', 'reminders.create', 'reminders.assign',
    'documents.view', 'documents.upload', 'documents.edit',
    'yourobc_notifications.view',
  ],
  sales: [
    'exchange_rates.view',
    'inquiry_sources.view', 'inquiry_sources.create', 'inquiry_sources.edit',
    'wiki.view', 'wiki.create', 'wiki.edit',
    'comments.view', 'comments.create',
    'reminders.view', 'reminders.create',
    'documents.view', 'documents.upload',
    'yourobc_notifications.view',
  ],
  operations: [
    'exchange_rates.view',
    'wiki.view', 'wiki.create', 'wiki.edit',
    'comments.view', 'comments.create',
    'reminders.view', 'reminders.create', 'reminders.assign',
    'documents.view', 'documents.upload', 'documents.edit',
    'yourobc_notifications.view',
  ],
  finance: [
    'exchange_rates.view', 'exchange_rates.create',
    'wiki.view',
    'comments.view', 'comments.create',
    'reminders.view', 'reminders.create',
    'documents.view', 'documents.upload',
    'yourobc_notifications.view',
  ],
  viewer: [
    'wiki.view',
    'comments.view',
    'reminders.view',
    'documents.view',
    'yourobc_notifications.view',
  ],
} as const;