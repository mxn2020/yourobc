// convex/lib/yourobc/index.ts
// convex/yourobc/index.ts

import { EntityType } from '../../types'

// Export all yourobc functionality
export * from './customers'
export * from './quotes'
export * from './shipments'
export * from './invoices'
export * from './partners'
export * from './employees'
export * from './couriers'

// Export statistics module
export * as statistics from './statistics'

// Export dashboard module
export * as dashboard from './dashboard'

// Export supporting modules
export * from './supporting/exchange_rates'
export * from './supporting/wiki'
export * from './supporting/comments'
export * from './supporting/followup_reminders'
export * from './supporting/inquiry_sources'

// Export shared utilities (explicitly to avoid naming conflicts)
export {
  // Constants
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  SERVICE_TYPE,
  SERVICE_TYPE_LABELS,
  PRIORITY,
  CURRENCY,
  WEIGHT_UNITS,
  DIMENSION_UNITS,
  COMMON_AIRPORTS,
  COMMON_AIRLINES,
  DEFAULT_TIMEZONES,

  // Utility functions
  getPriorityColor,
  getPriorityLabel,
  getServiceTypeLabel,
  getStatusColor,
  getStatusLabel,
  convertWeight,
  convertDimension,
  calculateChargeableWeight,
  generateReference,
  calculateDeadlineUrgency,
  calculateSearchScore,
  calculatePerformanceMetric,

  formatDate,
  formatDateTime,
  formatTimeRemaining,
  formatFileSize,
  formatRoute,
  daysBetween,

  // Other shared utilities
  isImageFile,
  isPdfFile,
  validateAirportCode,
  normalizeAirportCode,
  getCountryFromCode,
  isNonEmptyString,
  isPositiveNumber,
  isFutureDate,
  isPastDate,
  sanitizeString,
  isValidUrl,
} from './shared'

export type {
  // Core shared types
  Address,
  Dimensions,
  Routing,
  CurrencyAmount,
  Contact,
  FlightDetails,
} from './shared'

// Export base YourOBC types and schemas
export * from '../../schema/yourobc'

// YourOBC Module Constants
export const YourOBC_MODULES = {
  CUSTOMERS: 'yourobcCustomers',
  QUOTES: 'yourobcQuotes',
  SHIPMENTS: 'yourobcShipments',
  INVOICES: 'yourobcInvoices',
  PARTNERS: 'yourobcPartners',
  EMPLOYEES: 'yourobcEmployees',
  COURIERS: 'couriers',
  EXCHANGE_RATES: 'yourobcExchangeRates',
  INQUIRY_SOURCES: 'inquirySources',
  WIKI: 'wiki',
  COMMENTS: 'comments',
  REMINDERS: 'yourobcFollowupReminders',
} as const;

// Consolidated YourOBC permissions
export const YourOBC_PERMISSIONS = {
  // Customer permissions
  'customers.view': 'View customers',
  'customers.create': 'Create customers',
  'customers.edit': 'Edit customers',
  'customers.delete': 'Delete customers',

  // Quote permissions
  'quotes.view': 'View quotes',
  'quotes.create': 'Create quotes',
  'quotes.edit': 'Edit quotes',
  'quotes.delete': 'Delete quotes',
  'quotes.convert': 'Convert quotes to shipments',

  // Shipment permissions
  'shipments.view': 'View shipments',
  'shipments.create': 'Create shipments',
  'shipments.edit': 'Edit shipments',
  'shipments.delete': 'Delete shipments',
  'shipments.assign': 'Assign shipments',

  // Invoice permissions
  'invoices.view': 'View invoices',
  'invoices.create': 'Create invoices',
  'invoices.edit': 'Edit invoices',
  'invoices.delete': 'Delete invoices',
  'invoices.approve': 'Approve invoices',
  'invoices.process_payment': 'Process payments',

  // Partner permissions
  'partners.view': 'View partners',
  'partners.create': 'Create partners',
  'partners.edit': 'Edit partners',
  'partners.delete': 'Delete partners',
  'partners.manage_contracts': 'Manage partner contracts',

  // Employee permissions
  'employees.view': 'View employees',
  'employees.create': 'Create employees',
  'employees.edit': 'Edit employees',
  'employees.delete': 'Delete employees',
  'employees.view_commissions': 'View employee commissions',
  'employees.edit_commissions': 'Edit employee commissions',
  'employees.approve_vacation': 'Approve vacation requests',
  'employees.view_time_entries': 'View time entries',

  // Courier permissions
  'couriers.view': 'View couriers',
  'couriers.create': 'Create couriers',
  'couriers.edit': 'Edit couriers',
  'couriers.delete': 'Delete couriers',
  'couriers.assign': 'Assign couriers to shipments',
  'couriers.view_time_entries': 'View courier time entries',

  // Exchange Rate permissions
  'exchange_rates.view': 'View exchange rates',
  'exchange_rates.create': 'Create exchange rates',
  'exchange_rates.edit': 'Edit exchange rates',
  'exchange_rates.delete': 'Delete exchange rates',

  // Wiki permissions
  'wiki.view': 'View wiki entries',
  'wiki.create': 'Create wiki entries',
  'wiki.edit': 'Edit wiki entries',
  'wiki.delete': 'Delete wiki entries',
  'wiki.publish': 'Publish wiki entries',

  // Comment permissions
  'comments.view': 'View comments',
  'comments.create': 'Create comments',
  'comments.edit': 'Edit comments',
  'comments.delete': 'Delete comments',

  // Reminder permissions
  'reminders.view': 'View reminders',
  'reminders.create': 'Create reminders',
  'reminders.edit': 'Edit reminders',
  'reminders.delete': 'Delete reminders',
  'reminders.assign': 'Assign reminders',

  // Inquiry Source permissions
  'inquiry_sources.view': 'View inquiry sources',
  'inquiry_sources.create': 'Create inquiry sources',
  'inquiry_sources.edit': 'Edit inquiry sources',
  'inquiry_sources.delete': 'Delete inquiry sources',
  'inquiry_sources.analyze': 'Analyze inquiry sources',
} as const;

// Role-based permission sets for YourOBC
export const YourOBC_ROLE_PERMISSIONS = {
  admin: Object.keys(YourOBC_PERMISSIONS),
  sales: [
    'customers.view', 'customers.create', 'customers.edit',
    'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.convert',
    'shipments.view',
    'invoices.view', 'invoices.create',
    'partners.view',
    'employees.view',
    'couriers.view',
    'exchange_rates.view',
    'wiki.view', 'wiki.create', 'wiki.edit',
    'comments.view', 'comments.create', 'comments.edit',
    'reminders.view', 'reminders.create', 'reminders.edit',
    'inquiry_sources.view', 'inquiry_sources.analyze',
  ],
  operations: [
    'customers.view',
    'quotes.view',
    'shipments.view', 'shipments.edit', 'shipments.assign',
    'invoices.view',
    'partners.view', 'partners.edit',
    'employees.view', 'employees.edit',
    'couriers.view', 'couriers.edit', 'couriers.assign',
    'exchange_rates.view',
    'wiki.view', 'wiki.create', 'wiki.edit',
    'comments.view', 'comments.create', 'comments.edit',
    'reminders.view', 'reminders.create', 'reminders.edit', 'reminders.assign',
    'inquiry_sources.view',
  ],
  finance: [
    'customers.view',
    'quotes.view',
    'shipments.view',
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.approve', 'invoices.process_payment',
    'partners.view',
    'employees.view', 'employees.view_commissions',
    'couriers.view',
    'exchange_rates.view', 'exchange_rates.create', 'exchange_rates.edit',
    'wiki.view',
    'comments.view', 'comments.create',
    'reminders.view', 'reminders.create',
    'inquiry_sources.view',
  ],
  hr: [
    'employees.view', 'employees.create', 'employees.edit', 'employees.approve_vacation',
    'employees.view_commissions', 'employees.edit_commissions', 'employees.view_time_entries',
    'couriers.view', 'couriers.create', 'couriers.edit', 'couriers.view_time_entries',
    'customers.view',
    'partners.view',
    'wiki.view', 'wiki.create', 'wiki.edit',
    'comments.view', 'comments.create',
    'reminders.view', 'reminders.create',
  ],
  marketing: [
    'customers.view', 'customers.create',
    'quotes.view',
    'inquiry_sources.view', 'inquiry_sources.create', 'inquiry_sources.edit', 'inquiry_sources.analyze',
    'wiki.view', 'wiki.create', 'wiki.edit',
    'comments.view', 'comments.create',
    'reminders.view', 'reminders.create',
  ],
  viewer: [
    'customers.view',
    'quotes.view',
    'shipments.view',
    'invoices.view',
    'partners.view',
    'employees.view',
    'couriers.view',
    'exchange_rates.view',
    'wiki.view',
    'comments.view',
    'reminders.view',
    'inquiry_sources.view',
  ],
} as const;

// YourOBC Business Workflow States
export const YourOBC_WORKFLOW = {
  QUOTE_TO_SHIPMENT: {
    REQUIRED_STATUS: 'accepted',
    TARGET_STATUS: 'booked',
  },
  SHIPMENT_TO_INVOICE: {
    REQUIRED_STATUS: 'delivered',
    TARGET_STATUS: 'draft',
  },
  INVOICE_APPROVAL: {
    REQUIRED_TYPE: 'outgoing',
    REQUIRED_STATUS: 'draft',
    TARGET_STATUS: 'sent',
  },
  INQUIRY_TO_CUSTOMER: {
    REQUIRED_SOURCE: true,
    TARGET_STATUS: 'active',
  },
  REMINDER_ESCALATION: {
    REQUIRED_STATUS: 'pending',
    OVERDUE_THRESHOLD: 24, // hours
  },
  COURIER_ASSIGNMENT: {
    REQUIRED_STATUS: 'available',
    TARGET_STATUS: 'busy',
  },
} as const;

// Utility functions for common YourOBC operations
export const YourOBC_UTILS = {
  // Currency formatting
  formatCurrency: (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Route display
  formatRoute: (origin: any, destination: any): string => {
    return `${origin.city}, ${origin.countryCode} → ${destination.city}, ${destination.countryCode}`;
  },

  // Status color mapping (enhanced)
  getStatusColor: (status: string, type: 'customer' | 'quote' | 'shipment' | 'invoice' | 'partner' | 'reminder' | 'wiki' | 'employee' | 'courier'): string => {
    const colorMaps = {
      customer: { active: '#10b981', inactive: '#f59e0b', blacklisted: '#ef4444' },
      quote: { draft: '#6b7280', sent: '#3b82f6', accepted: '#10b981', rejected: '#ef4444', expired: '#f59e0b' },
      shipment: { quoted: '#6b7280', booked: '#3b82f6', pickup: '#f59e0b', in_transit: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' },
      invoice: { draft: '#6b7280', sent: '#3b82f6', paid: '#10b981', overdue: '#ef4444', cancelled: '#9ca3af' },
      partner: { active: '#10b981', inactive: '#f59e0b', suspended: '#ef4444' },
      reminder: { pending: '#f59e0b', completed: '#10b981', cancelled: '#6b7280' },
      wiki: { draft: '#6b7280', published: '#10b981', archived: '#9ca3af' },
      employee: { available: '#10b981', busy: '#f59e0b', offline: '#6b7280' },
      courier: { available: '#10b981', busy: '#f59e0b', offline: '#6b7280' },
    };
    return colorMaps[type]?.[status as keyof typeof colorMaps[typeof type]] || '#6b7280';
  },

  // Date formatting
  formatDate: (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  },

  // Time remaining calculation
  getTimeRemaining: (deadline: number): string => {
    const now = Date.now();
    const diff = deadline - now;

    if (diff <= 0) return 'Overdue';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  },

  // Performance metrics calculation
  calculateKPI: (current: number, target: number): { percentage: number; status: 'good' | 'warning' | 'critical' } => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    const status = percentage >= 90 ? 'good' : percentage >= 70 ? 'warning' : 'critical';
    return { percentage: Math.round(percentage), status };
  },

  // Priority weight calculation
  getPriorityWeight: (priority: string): number => {
    const weights = { low: 1, medium: 2, high: 3, urgent: 4, critical: 5 };
    return weights[priority as keyof typeof weights] || 2;
  },

  // Entity linking helper
  generateEntityLink: (entityType: EntityType, entityId: string): string => {
    const routes = {
      customer: `/customers/${entityId}`,
      quote: `/quotes/${entityId}`,
      shipment: `/shipments/${entityId}`,
      invoice: `/invoices/${entityId}`,
      partner: `/partners/${entityId}`,
      employee: `/employees/${entityId}`,
      courier: `/couriers/${entityId}`,
      reminder: `/reminders/${entityId}`,
      wiki: `/wiki/${entityId}`,
    };
    return routes[entityType as keyof typeof routes] || '#';
  },

  // Search relevance scoring
  calculateSearchRelevance: (searchTerm: string, content: string, title: string): number => {
    const termLower = searchTerm.toLowerCase();
    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();

    let score = 0;

    // Exact title match (highest score)
    if (titleLower === termLower) score += 100;
    else if (titleLower.includes(termLower)) score += 50;

    // Content match
    const contentMatches = (contentLower.match(new RegExp(termLower, 'g')) || []).length;
    score += contentMatches * 5;

    // Word boundary matches (higher score for whole word matches)
    const wordBoundaryRegex = new RegExp(`\\b${termLower}\\b`, 'gi');
    const wordMatches = (content.match(wordBoundaryRegex) || []).length;
    score += wordMatches * 10;

    return score;
  },
} as const;

// YourOBC Dashboard Metrics Configuration
export const YourOBC_DASHBOARD_METRICS = {
  SALES: {
    QUOTES_THIS_MONTH: 'quotes_this_month',
    CONVERSION_RATE: 'conversion_rate',
    REVENUE_THIS_MONTH: 'revenue_this_month',
    AVERAGE_DEAL_SIZE: 'average_deal_size',
  },
  OPERATIONS: {
    ACTIVE_SHIPMENTS: 'active_shipments',
    ON_TIME_DELIVERY: 'on_time_delivery',
    SLA_COMPLIANCE: 'sla_compliance',
    OVERDUE_TASKS: 'overdue_tasks',
    AVAILABLE_COURIERS: 'available_couriers',
  },
  FINANCE: {
    OUTSTANDING_INVOICES: 'outstanding_invoices',
    OVERDUE_PAYMENTS: 'overdue_payments',
    MONTHLY_REVENUE: 'monthly_revenue',
    PROFIT_MARGIN: 'profit_margin',
  },
  HR: {
    ACTIVE_EMPLOYEES: 'active_employees',
    ACTIVE_COURIERS: 'active_couriers',
    PERFORMANCE_AVERAGE: 'performance_average',
    LEAVE_REQUESTS: 'leave_requests',
    TRAINING_COMPLETION: 'training_completion',
  },
} as const;

// Export YourOBC notification types
export const YourOBC_NOTIFICATION_TYPES = {
  QUOTE_EXPIRING: 'quote_expiring',
  SHIPMENT_OVERDUE: 'shipment_overdue',
  INVOICE_DUE: 'invoice_due',
  REMINDER_DUE: 'reminder_due',
  EMPLOYEE_AVAILABLE: 'employee_available',
  COURIER_AVAILABLE: 'courier_available',
  COURIER_ASSIGNED: 'courier_assigned',
  PARTNER_RESPONSE: 'partner_response',
  SLA_WARNING: 'sla_warning',
  PAYMENT_RECEIVED: 'payment_received',
  DOCUMENT_UPLOADED: 'document_uploaded',
  COMMENT_MENTION: 'comment_mention',
} as const;

// YourOBC integration endpoints configuration
export const YourOBC_INTEGRATIONS = {
  FLIGHT_STATS: {
    BASE_URL: 'https://api.flightstats.com/flex',
    ENDPOINTS: {
      SCHEDULES: '/schedules/rest/v1/json',
      STATUS: '/flightstatus/rest/v2/json',
    },
  },
  EXCHANGE_RATES: {
    ECB: 'https://api.exchangerate-api.com/v4/latest',
    FIXER: 'https://api.fixer.io/latest',
  },
  ACCOUNTING: {
    DATEV: '/api/datev/export',
    LEXOFFICE: '/api/lexoffice/export',
  },
} as const;

// YourOBC file types and document management
export const YourOBC_DOCUMENT_TYPES = {
  QUOTE: ['pdf', 'doc', 'docx'],
  SHIPMENT: ['pdf', 'jpg', 'png', 'doc'],
  INVOICE: ['pdf', 'xls', 'xlsx'],
  PARTNER: ['pdf', 'doc', 'jpg', 'png'],
  EMPLOYEE: ['pdf', 'jpg', 'png'],
  COURIER: ['pdf', 'jpg', 'png'],
  WIKI: ['pdf', 'doc', 'docx', 'md'],
} as const;

// YourOBC automation rules configuration
export const YourOBC_AUTOMATION_RULES = {
  QUOTE_FOLLOW_UP: {
    TRIGGER: 'quote_sent',
    DELAY_HOURS: 48,
    ACTION: 'create_reminder',
  },
  SLA_WARNING: {
    TRIGGER: 'shipment_created',
    DELAY_HOURS: -2, // 2 hours before deadline
    ACTION: 'send_notification',
  },
  INVOICE_REMINDER: {
    TRIGGER: 'invoice_sent',
    DELAY_DAYS: 25, // 5 days before due date (assuming 30-day terms)
    ACTION: 'create_reminder',
  },
  PARTNER_EVALUATION: {
    TRIGGER: 'shipment_completed',
    CONDITION: 'monthly_shipments >= 10',
    ACTION: 'update_performance',
  },
  COURIER_AVAILABILITY: {
    TRIGGER: 'courier_status_change',
    CONDITION: 'status === available',
    ACTION: 'notify_operations',
  },
} as const;