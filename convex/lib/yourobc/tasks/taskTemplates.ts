// convex/lib/yourobc/tasks/taskTemplates.ts

import type { TaskTemplate } from './types'

/**
 * Task templates for automatic task generation based on shipment status
 * These templates define what tasks should be created automatically when
 * a shipment enters a specific status
 */

export const TASK_TEMPLATES: TaskTemplate[] = [
  // ===== QUOTED STATUS =====
  {
    shipmentStatus: 'quoted',
    serviceType: 'both',
    taskTitle: 'Follow up on quote',
    taskDescription: 'Contact customer regarding the quote and answer any questions',
    priority: 'medium',
    dueAfterMinutes: 24 * 60, // 24 hours
    autoAssign: false,
  },

  // ===== BOOKED STATUS =====
  {
    shipmentStatus: 'booked',
    serviceType: 'OBC',
    taskTitle: 'Pickup bestätigen',
    taskDescription: 'Courier pickup confirmation required - verify courier assignment and pickup time',
    priority: 'high',
    dueAfterMinutes: 60, // 1 hour
    autoAssign: true,
  },
  {
    shipmentStatus: 'booked',
    serviceType: 'NFO',
    taskTitle: 'Partner kontaktieren',
    taskDescription: 'Contact NFO partner to confirm booking and provide shipment details',
    priority: 'high',
    dueAfterMinutes: 60, // 1 hour
    autoAssign: false,
  },
  {
    shipmentStatus: 'booked',
    serviceType: 'both',
    taskTitle: 'Versanddokumente prüfen',
    taskDescription: 'Verify all shipping documents are prepared (AWB, commercial invoice, etc.)',
    priority: 'medium',
    dueAfterMinutes: 2 * 60, // 2 hours
    autoAssign: false,
  },

  // ===== PICKUP STATUS =====
  {
    shipmentStatus: 'pickup',
    serviceType: 'OBC',
    taskTitle: 'AWB prüfen',
    taskDescription: 'Verify AWB number and documentation from courier',
    priority: 'high',
    dueAfterMinutes: 30, // 30 minutes
    autoAssign: false,
    requiredDocuments: ['AWB'],
  },
  {
    shipmentStatus: 'pickup',
    serviceType: 'NFO',
    taskTitle: 'HAWB/MAWB prüfen',
    taskDescription: 'Verify HAWB and MAWB numbers from partner',
    priority: 'high',
    dueAfterMinutes: 30, // 30 minutes
    autoAssign: false,
    requiredDocuments: ['HAWB', 'MAWB'],
  },
  {
    shipmentStatus: 'pickup',
    serviceType: 'both',
    taskTitle: 'Kunde informieren',
    taskDescription: 'Send pickup confirmation to customer with tracking information',
    priority: 'medium',
    dueAfterMinutes: 60, // 1 hour
    autoAssign: false,
  },

  // ===== IN_TRANSIT STATUS =====
  {
    shipmentStatus: 'in_transit',
    serviceType: 'OBC',
    taskTitle: 'Flugstatus überwachen',
    taskDescription: 'Monitor flight status and update customer on any delays',
    priority: 'medium',
    dueAfterMinutes: 4 * 60, // 4 hours
    autoAssign: false,
  },
  {
    shipmentStatus: 'in_transit',
    serviceType: 'NFO',
    taskTitle: 'Tracking aktualisieren',
    taskDescription: 'Update tracking information with latest airline status',
    priority: 'medium',
    dueAfterMinutes: 4 * 60, // 4 hours
    autoAssign: false,
  },
  {
    shipmentStatus: 'in_transit',
    serviceType: 'both',
    taskTitle: 'Zollstatus prüfen',
    taskDescription: 'Check customs clearance status if applicable',
    priority: 'high',
    dueAfterMinutes: 2 * 60, // 2 hours
    autoAssign: false,
  },

  // ===== DELIVERED STATUS =====
  {
    shipmentStatus: 'delivered',
    serviceType: 'both',
    taskTitle: 'PoD anfordern',
    taskDescription: 'Request Proof of Delivery from courier/partner',
    priority: 'critical',
    dueAfterMinutes: 30, // 30 minutes
    autoAssign: false,
    requiredDocuments: ['PoD'],
  },
  {
    shipmentStatus: 'delivered',
    serviceType: 'both',
    taskTitle: 'Kundenreferenz prüfen',
    taskDescription: 'Verify customer reference in delivery documentation',
    priority: 'medium',
    dueAfterMinutes: 60, // 1 hour
    autoAssign: false,
  },
  {
    shipmentStatus: 'delivered',
    serviceType: 'both',
    taskTitle: 'Zoll/Übergepäck prüfen',
    taskDescription: 'Check for any customs duties or excess baggage charges',
    priority: 'medium',
    dueAfterMinutes: 2 * 60, // 2 hours
    autoAssign: false,
  },
  {
    shipmentStatus: 'delivered',
    serviceType: 'both',
    taskTitle: 'Kunde benachrichtigen',
    taskDescription: 'Send delivery confirmation to customer',
    priority: 'high',
    dueAfterMinutes: 30, // 30 minutes
    autoAssign: false,
  },

  // ===== DOCUMENT STATUS =====
  {
    shipmentStatus: 'document',
    serviceType: 'OBC',
    taskTitle: 'OBC-Abrechnung erstellen',
    taskDescription: 'Create courier billing based on actual costs and agreed price',
    priority: 'high',
    dueAfterMinutes: 24 * 60, // 24 hours
    autoAssign: false,
  },
  {
    shipmentStatus: 'document',
    serviceType: 'NFO',
    taskTitle: 'Partner-Rechnung prüfen',
    taskDescription: 'Verify partner invoice matches agreed costs',
    priority: 'high',
    dueAfterMinutes: 24 * 60, // 24 hours
    autoAssign: false,
  },
  {
    shipmentStatus: 'document',
    serviceType: 'both',
    taskTitle: 'Alle Dokumente archivieren',
    taskDescription: 'Archive all shipment documents (AWB, PoD, invoices, etc.)',
    priority: 'medium',
    dueAfterMinutes: 48 * 60, // 48 hours
    autoAssign: false,
    requiredDocuments: ['AWB', 'PoD'],
  },
  {
    shipmentStatus: 'document',
    serviceType: 'both',
    taskTitle: 'Rechnung vorbereiten',
    taskDescription: 'Prepare customer invoice with all charges',
    priority: 'high',
    dueAfterMinutes: 24 * 60, // 24 hours
    autoAssign: false,
  },

  // ===== INVOICED STATUS =====
  {
    shipmentStatus: 'invoiced',
    serviceType: 'both',
    taskTitle: 'Zahlungseingang überwachen',
    taskDescription: 'Monitor payment receipt from customer',
    priority: 'medium',
    dueAfterMinutes: 7 * 24 * 60, // 7 days
    autoAssign: false,
  },
  {
    shipmentStatus: 'invoiced',
    serviceType: 'OBC',
    taskTitle: 'Kurier bezahlen',
    taskDescription: 'Process payment to courier based on commission structure',
    priority: 'high',
    dueAfterMinutes: 3 * 24 * 60, // 3 days
    autoAssign: false,
  },
  {
    shipmentStatus: 'invoiced',
    serviceType: 'NFO',
    taskTitle: 'Partner bezahlen',
    taskDescription: 'Process payment to NFO partner',
    priority: 'high',
    dueAfterMinutes: 3 * 24 * 60, // 3 days
    autoAssign: false,
  },
]

/**
 * Get all task templates for a specific shipment status and service type
 */
export function getTaskTemplatesForStatus(
  status: string,
  serviceType: 'OBC' | 'NFO'
): TaskTemplate[] {
  return TASK_TEMPLATES.filter(
    (template) =>
      template.shipmentStatus === status &&
      (template.serviceType === serviceType || template.serviceType === 'both')
  )
}

/**
 * Get a specific task template
 */
export function getTaskTemplate(
  status: string,
  serviceType: 'OBC' | 'NFO',
  taskTitle: string
): TaskTemplate | undefined {
  return TASK_TEMPLATES.find(
    (template) =>
      template.shipmentStatus === status &&
      (template.serviceType === serviceType || template.serviceType === 'both') &&
      template.taskTitle === taskTitle
  )
}

/**
 * Get all unique shipment statuses that have task templates
 */
export function getStatusesWithTemplates(): string[] {
  return Array.from(new Set(TASK_TEMPLATES.map((t) => t.shipmentStatus)))
}

/**
 * Calculate due date based on template
 */
export function calculateDueDate(template: TaskTemplate, fromTimestamp?: number): number {
  const baseTime = fromTimestamp || Date.now()
  const dueAfterMs = (template.dueAfterMinutes || 0) * 60 * 1000
  return baseTime + dueAfterMs
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(dueDate: number | undefined): boolean {
  if (!dueDate) return false
  return Date.now() > dueDate
}

/**
 * Get priority score for sorting (higher = more urgent)
 */
export function getPriorityScore(priority: TaskTemplate['priority']): number {
  const scores = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  }
  return scores[priority]
}
