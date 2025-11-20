// convex/lib/yourobc/tracking_messages/defaultTemplates.ts
// convex/lib/yourobc/trackingMessages/defaultTemplates.ts

import type { CreateTrackingMessageData } from './types'

/**
 * Default tracking message templates for OBC and NFO workflows
 * These templates can be customized by users
 */

export const DEFAULT_TEMPLATES: Omit<CreateTrackingMessageData, 'isActive'>[] = [
  // ===== OBC - ENGLISH TEMPLATES =====
  {
    name: 'OBC Booking Confirmation - EN',
    serviceType: 'OBC',
    status: 'booked',
    language: 'en',
    category: 'booking',
    subject: 'Shipment {shipmentNumber} - Booking Confirmation',
    template: `Dear {customerName},

Your shipment {shipmentNumber} has been successfully booked.

Shipment Details:
- Route: {origin} → {destination}
- AWB Number: {awbNumber}
- Courier: {courierName}
- Scheduled Pickup: {pickupTime}

Your courier will contact you shortly to confirm the exact pickup time.

We will keep you updated on the progress.

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'origin', 'destination', 'awbNumber', 'courierName', 'pickupTime'],
  },
  {
    name: 'OBC Pickup Notification - EN',
    serviceType: 'OBC',
    status: 'pickup',
    language: 'en',
    category: 'pickup',
    subject: 'Shipment {shipmentNumber} - Picked Up',
    template: `Dear {customerName},

Your shipment {shipmentNumber} has been picked up by our courier.

Current Status:
- AWB Number: {awbNumber}
- Courier: {courierName} ({courierPhone})
- Picked up: {pickupTime}
- Estimated Delivery: {estimatedArrival}

You can track your shipment using AWB: {awbNumber}

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'awbNumber', 'courierName', 'courierPhone', 'pickupTime', 'estimatedArrival'],
  },
  {
    name: 'OBC In Transit Update - EN',
    serviceType: 'OBC',
    status: 'in_transit',
    language: 'en',
    category: 'in_transit',
    subject: 'Shipment {shipmentNumber} - In Transit',
    template: `Dear {customerName},

Your shipment {shipmentNumber} is currently in transit.

Flight Information:
- Flight Number: {flightNumber}
- Departure: {origin}
- Destination: {destination}
- Estimated Arrival: {estimatedArrival}

Your courier will contact the recipient upon arrival.

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'flightNumber', 'origin', 'destination', 'estimatedArrival'],
  },
  {
    name: 'OBC Delivery Confirmation - EN',
    serviceType: 'OBC',
    status: 'delivered',
    language: 'en',
    category: 'delivery',
    subject: 'Shipment {shipmentNumber} - Delivered',
    template: `Dear {customerName},

Your shipment {shipmentNumber} has been successfully delivered!

Delivery Information:
- Delivered: {deliveryTime}
- AWB Number: {awbNumber}
- Courier: {courierName}

Thank you for choosing our services.

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'deliveryTime', 'awbNumber', 'courierName'],
  },

  // ===== OBC - GERMAN TEMPLATES =====
  {
    name: 'OBC Buchungsbestätigung - DE',
    serviceType: 'OBC',
    status: 'booked',
    language: 'de',
    category: 'booking',
    subject: 'Sendung {shipmentNumber} - Buchungsbestätigung',
    template: `Sehr geehrte/r {customerName},

Ihre Sendung {shipmentNumber} wurde erfolgreich gebucht.

Sendungsdetails:
- Route: {origin} → {destination}
- AWB-Nummer: {awbNumber}
- Kurier: {courierName}
- Geplante Abholung: {pickupTime}

Ihr Kurier wird Sie in Kürze kontaktieren, um die genaue Abholzeit zu bestätigen.

Wir halten Sie über den Fortschritt auf dem Laufenden.

Mit freundlichen Grüßen,
Ihr Logistik-Team`,
    variables: ['shipmentNumber', 'customerName', 'origin', 'destination', 'awbNumber', 'courierName', 'pickupTime'],
  },
  {
    name: 'OBC Abholbenachrichtigung - DE',
    serviceType: 'OBC',
    status: 'delivered',
    language: 'de',
    category: 'delivery',
    subject: 'Sendung {shipmentNumber} - Zugestellt',
    template: `Sehr geehrte/r {customerName},

Ihre Sendung {shipmentNumber} wurde erfolgreich zugestellt!

Zustellinformationen:
- Zugestellt: {deliveryTime}
- AWB-Nummer: {awbNumber}
- Kurier: {courierName}

Vielen Dank, dass Sie unsere Dienste gewählt haben.

Mit freundlichen Grüßen,
Ihr Logistik-Team`,
    variables: ['shipmentNumber', 'customerName', 'deliveryTime', 'awbNumber', 'courierName'],
  },

  // ===== NFO - ENGLISH TEMPLATES =====
  {
    name: 'NFO Booking Confirmation - EN',
    serviceType: 'NFO',
    status: 'booked',
    language: 'en',
    category: 'booking',
    subject: 'Shipment {shipmentNumber} - NFO Booking Confirmation',
    template: `Dear {customerName},

Your Next Flight Out shipment {shipmentNumber} has been booked.

Shipment Details:
- Route: {origin} → {destination}
- Partner: {partnerName}
- Contact: {partnerContact}

Document numbers will be provided once the shipment is picked up.

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'origin', 'destination', 'partnerName', 'partnerContact'],
  },
  {
    name: 'NFO Pickup Notification - EN',
    serviceType: 'NFO',
    status: 'pickup',
    language: 'en',
    category: 'pickup',
    subject: 'Shipment {shipmentNumber} - NFO Picked Up',
    template: `Dear {customerName},

Your NFO shipment {shipmentNumber} has been picked up.

Tracking Information:
- HAWB: {hawbNumber}
- MAWB: {mawbNumber}
- AWB: {awbNumber}
- Partner: {partnerName}
- Estimated Arrival: {estimatedArrival}

We will update you when the shipment departs.

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'hawbNumber', 'mawbNumber', 'awbNumber', 'partnerName', 'estimatedArrival'],
  },
  {
    name: 'NFO In Transit Update - EN',
    serviceType: 'NFO',
    status: 'in_transit',
    language: 'en',
    category: 'in_transit',
    subject: 'Shipment {shipmentNumber} - NFO In Transit',
    template: `Dear {customerName},

Your NFO shipment {shipmentNumber} is in transit.

Flight Details:
- Flight Number: {flightNumber}
- Route: {origin} → {destination}
- Estimated Arrival: {estimatedArrival}
- MAWB: {mawbNumber}

You can track your shipment using the MAWB number on the airline's website.

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'flightNumber', 'origin', 'destination', 'estimatedArrival', 'mawbNumber'],
  },
  {
    name: 'NFO Delivery Confirmation - EN',
    serviceType: 'NFO',
    status: 'delivered',
    language: 'en',
    category: 'delivery',
    subject: 'Shipment {shipmentNumber} - NFO Delivered',
    template: `Dear {customerName},

Your NFO shipment {shipmentNumber} has been delivered.

Delivery Details:
- Delivered: {deliveryTime}
- MAWB: {mawbNumber}
- HAWB: {hawbNumber}
- Partner: {partnerName}

Thank you for your business.

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'deliveryTime', 'mawbNumber', 'hawbNumber', 'partnerName'],
  },

  // ===== NFO - GERMAN TEMPLATES =====
  {
    name: 'NFO Buchungsbestätigung - DE',
    serviceType: 'NFO',
    status: 'booked',
    language: 'de',
    category: 'booking',
    subject: 'Sendung {shipmentNumber} - NFO Buchungsbestätigung',
    template: `Sehr geehrte/r {customerName},

Ihre Next Flight Out Sendung {shipmentNumber} wurde gebucht.

Sendungsdetails:
- Route: {origin} → {destination}
- Partner: {partnerName}
- Kontakt: {partnerContact}

Dokumentennummern werden bereitgestellt, sobald die Sendung abgeholt wurde.

Mit freundlichen Grüßen,
Ihr Logistik-Team`,
    variables: ['shipmentNumber', 'customerName', 'origin', 'destination', 'partnerName', 'partnerContact'],
  },
  {
    name: 'NFO Abholbenachrichtigung - DE',
    serviceType: 'NFO',
    status: 'in_transit',
    language: 'de',
    category: 'in_transit',
    subject: 'Sendung {shipmentNumber} - NFO Unterwegs',
    template: `Sehr geehrte/r {customerName},

Ihre NFO-Sendung {shipmentNumber} ist unterwegs.

Flugdetails:
- Flugnummer: {flightNumber}
- Route: {origin} → {destination}
- Voraussichtliche Ankunft: {estimatedArrival}
- MAWB: {mawbNumber}

Sie können Ihre Sendung mit der MAWB-Nummer auf der Website der Fluggesellschaft verfolgen.

Mit freundlichen Grüßen,
Ihr Logistik-Team`,
    variables: ['shipmentNumber', 'customerName', 'flightNumber', 'origin', 'destination', 'estimatedArrival', 'mawbNumber'],
  },

  // ===== CUSTOMS TEMPLATES (Both OBC & NFO) =====
  {
    name: 'OBC Customs Clearance - EN',
    serviceType: 'OBC',
    status: 'customs',
    language: 'en',
    category: 'customs',
    subject: 'Shipment {shipmentNumber} - Customs Clearance',
    template: `Dear {customerName},

Your shipment {shipmentNumber} is currently in customs clearance.

Status: {notes}

We are working to expedite the clearance process.

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'notes'],
  },
  {
    name: 'NFO Customs Clearance - EN',
    serviceType: 'NFO',
    status: 'customs',
    language: 'en',
    category: 'customs',
    subject: 'Shipment {shipmentNumber} - NFO Customs Clearance',
    template: `Dear {customerName},

Your NFO shipment {shipmentNumber} is in customs clearance.

Status: {notes}
MAWB: {mawbNumber}

We will notify you once cleared.

Best regards,
Your Logistics Team`,
    variables: ['shipmentNumber', 'customerName', 'notes', 'mawbNumber'],
  },
]

/**
 * Get all templates for a specific service type and language
 */
export function getTemplatesByServiceAndLanguage(
  serviceType: 'OBC' | 'NFO',
  language: 'en' | 'de'
) {
  return DEFAULT_TEMPLATES.filter(
    (t) => t.serviceType === serviceType && t.language === language
  )
}

/**
 * Get template for specific status
 */
export function getTemplateForStatus(
  serviceType: 'OBC' | 'NFO',
  status: import('../../../schema/yourobc/base').ShipmentStatus,
  language: 'en' | 'de' = 'en'
) {
  return DEFAULT_TEMPLATES.find(
    (t) => t.serviceType === serviceType && t.status === status && t.language === language
  )
}
