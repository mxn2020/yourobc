// convex/lib/yourobc/tasks/templates.ts

/**
 * Task Templates for Automatic Task Generation
 * Different workflows for OBC vs NFO shipments
 */

export interface TaskTemplate {
  title: string
  description: string
  triggerStatus: string // Shipment status that triggers this task
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueAfterMinutes?: number // Minutes after status change
  autoAssign?: boolean // Auto-assign to shipment creator
  requiredFor: 'OBC' | 'NFO' | 'both'
  category: 'booking' | 'pickup' | 'transit' | 'delivery' | 'documentation' | 'customs' | 'invoicing'
}

/**
 * OBC Task Templates
 */
export const OBC_TASK_TEMPLATES: TaskTemplate[] = [
  // Booking Phase
  {
    title: 'Confirm Courier Assignment',
    description: 'Verify courier availability and assign to shipment',
    triggerStatus: 'booked',
    priority: 'high',
    dueAfterMinutes: 30,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'booking',
  },
  {
    title: 'Flight Booking Confirmation',
    description: 'Confirm flight booking and share details with courier',
    triggerStatus: 'booked',
    priority: 'high',
    dueAfterMinutes: 60,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'booking',
  },

  // Pickup Phase
  {
    title: 'Confirm Pickup Schedule',
    description: 'Coordinate pickup time with customer and courier',
    triggerStatus: 'booked',
    priority: 'high',
    dueAfterMinutes: 120,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'pickup',
  },
  {
    title: 'Verify Pickup Completion',
    description: 'Confirm courier has picked up shipment and AWB received',
    triggerStatus: 'pickup',
    priority: 'critical',
    dueAfterMinutes: 60,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'pickup',
  },
  {
    title: 'Check AWB Number',
    description: 'Verify AWB number is correct and entered in system',
    triggerStatus: 'pickup',
    priority: 'high',
    dueAfterMinutes: 30,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'documentation',
  },

  // Transit Phase
  {
    title: 'Monitor Flight Status',
    description: 'Track flight and update customer on any delays',
    triggerStatus: 'in_transit',
    priority: 'medium',
    dueAfterMinutes: 60,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'transit',
  },
  {
    title: 'Customs Clearance Check',
    description: 'Verify customs clearance status and documentation',
    triggerStatus: 'in_transit',
    priority: 'high',
    dueAfterMinutes: 120,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'customs',
  },

  // Delivery Phase
  {
    title: 'Coordinate Final Delivery',
    description: 'Arrange delivery time with recipient',
    triggerStatus: 'in_transit',
    priority: 'high',
    dueAfterMinutes: 240,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'delivery',
  },
  {
    title: 'Obtain Proof of Delivery',
    description: 'Collect POD and upload to system',
    triggerStatus: 'delivered',
    priority: 'critical',
    dueAfterMinutes: 60,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'documentation',
  },

  // Documentation Phase
  {
    title: 'Complete Documentation',
    description: 'Ensure all documents (AWB, POD) are complete',
    triggerStatus: 'delivered',
    priority: 'high',
    dueAfterMinutes: 120,
    autoAssign: true,
    requiredFor: 'OBC',
    category: 'documentation',
  },
  {
    title: 'Create Invoice',
    description: 'Generate and send invoice to customer',
    triggerStatus: 'document',
    priority: 'high',
    dueAfterMinutes: 240,
    autoAssign: false,
    requiredFor: 'OBC',
    category: 'invoicing',
  },
]

/**
 * NFO Task Templates
 */
export const NFO_TASK_TEMPLATES: TaskTemplate[] = [
  // Quote Phase
  {
    title: 'Send Partner Inquiries',
    description: 'Send quote request to relevant partners based on route',
    triggerStatus: 'quoted',
    priority: 'high',
    dueAfterMinutes: 60,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'booking',
  },
  {
    title: 'Review Partner Quotes',
    description: 'Compare partner quotes and select best option',
    triggerStatus: 'quoted',
    priority: 'high',
    dueAfterMinutes: 480, // 8 hours
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'booking',
  },

  // Booking Phase
  {
    title: 'Confirm Partner Booking',
    description: 'Confirm booking with selected partner',
    triggerStatus: 'booked',
    priority: 'high',
    dueAfterMinutes: 60,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'booking',
  },
  {
    title: 'Obtain HAWB/MAWB',
    description: 'Get House AWB and Master AWB numbers from partner',
    triggerStatus: 'booked',
    priority: 'high',
    dueAfterMinutes: 120,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'documentation',
  },
  {
    title: 'Send Pre-Alert',
    description: 'Send pre-alert to destination agent/partner',
    triggerStatus: 'booked',
    priority: 'high',
    dueAfterMinutes: 240,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'booking',
  },

  // Pickup Phase
  {
    title: 'Coordinate Pickup with Partner',
    description: 'Confirm pickup arrangements with partner',
    triggerStatus: 'pickup',
    priority: 'high',
    dueAfterMinutes: 60,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'pickup',
  },
  {
    title: 'Verify Pickup Completion',
    description: 'Confirm partner has picked up shipment',
    triggerStatus: 'pickup',
    priority: 'critical',
    dueAfterMinutes: 120,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'pickup',
  },

  // Transit Phase
  {
    title: 'Request Tracking Updates',
    description: 'Get transit status updates from partner',
    triggerStatus: 'in_transit',
    priority: 'medium',
    dueAfterMinutes: 240,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'transit',
  },
  {
    title: 'Monitor Customs Clearance',
    description: 'Track customs clearance process with partner',
    triggerStatus: 'in_transit',
    priority: 'high',
    dueAfterMinutes: 360,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'customs',
  },
  {
    title: 'Update Customer on Status',
    description: 'Provide transit update to customer',
    triggerStatus: 'in_transit',
    priority: 'medium',
    dueAfterMinutes: 480,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'transit',
  },

  // Delivery Phase
  {
    title: 'Confirm Delivery Arrangement',
    description: 'Coordinate final delivery with partner and recipient',
    triggerStatus: 'in_transit',
    priority: 'high',
    dueAfterMinutes: 600,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'delivery',
  },
  {
    title: 'Obtain POD from Partner',
    description: 'Request and verify proof of delivery from partner',
    triggerStatus: 'delivered',
    priority: 'critical',
    dueAfterMinutes: 120,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'documentation',
  },

  // Documentation Phase
  {
    title: 'Collect All Documents',
    description: 'Ensure HAWB, MAWB, and POD are complete',
    triggerStatus: 'delivered',
    priority: 'high',
    dueAfterMinutes: 240,
    autoAssign: true,
    requiredFor: 'NFO',
    category: 'documentation',
  },
  {
    title: 'Verify Partner Invoice',
    description: 'Check partner invoice matches agreed rate',
    triggerStatus: 'document',
    priority: 'high',
    dueAfterMinutes: 480,
    autoAssign: false,
    requiredFor: 'NFO',
    category: 'invoicing',
  },
  {
    title: 'Create Customer Invoice',
    description: 'Generate and send invoice to customer',
    triggerStatus: 'document',
    priority: 'high',
    dueAfterMinutes: 600,
    autoAssign: false,
    requiredFor: 'NFO',
    category: 'invoicing',
  },
]

/**
 * Get applicable task templates for a shipment
 */
export function getTaskTemplatesForShipment(
  serviceType: 'OBC' | 'NFO',
  currentStatus: string
): TaskTemplate[] {
  const templates = serviceType === 'OBC' ? OBC_TASK_TEMPLATES : NFO_TASK_TEMPLATES

  return templates.filter(
    (template) =>
      template.triggerStatus === currentStatus &&
      (template.requiredFor === serviceType || template.requiredFor === 'both')
  )
}

/**
 * Get all task templates for a service type
 */
export function getAllTaskTemplates(serviceType: 'OBC' | 'NFO' | 'both'): TaskTemplate[] {
  if (serviceType === 'both') {
    return [...OBC_TASK_TEMPLATES, ...NFO_TASK_TEMPLATES]
  }
  return serviceType === 'OBC' ? OBC_TASK_TEMPLATES : NFO_TASK_TEMPLATES
}

/**
 * Get task template by title
 */
export function getTaskTemplateByTitle(title: string): TaskTemplate | undefined {
  return [...OBC_TASK_TEMPLATES, ...NFO_TASK_TEMPLATES].find((t) => t.title === title)
}
