// convex/lib/yourobc/shared/generators.ts
// convex/yourobc/shared/generators.ts

import { EntityType } from "@/config/index";


/**
 * Common generator utilities shared across YourOBC modules
 */

export function generateShortName(companyName: string): string {
  return companyName
    .split(' ')
    .filter(word => word.length > 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 8);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export function generateEntityLink(entityType: EntityType, entityId: string): string {
  const routes: Record<string, string> = {
    customer: `/customers/${entityId}`,
    quote: `/quotes/${entityId}`,
    shipment: `/shipments/${entityId}`,
    invoice: `/invoices/${entityId}`,
    partner: `/partners/${entityId}`,
    employee: `/employees/${entityId}`,
    courier: `/couriers/${entityId}`,
    reminder: `/reminders/${entityId}`,
    wiki: `/wiki/${entityId}`,
    commission: `/commissions/${entityId}`,
    vacation: `/vacations/${entityId}`,
  };
  return routes[entityType] || '#';
}

export function generateActionUrl(entityType: EntityType, entityId: string): string {
  return generateEntityLink(entityType, entityId);
}

export function generateSystemFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop() || '';
  return `${timestamp}_${randomId}.${extension}`;
}

export function generatePartnerCode(companyName: string): string {
  return companyName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6)
    .padEnd(3, 'X');
}

export function generateSourceCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8)
    .padEnd(3, 'X');
}

/**
 * Generate sequential number with prefix
 * @param prefix - The prefix for the number (e.g., 'COU', 'EMP', 'OBC')
 * @param sequence - The sequence number
 * @param padding - Number of digits to pad (default: 4)
 */
export function generateSequentialNumber(
  prefix: string,
  sequence: number,
  padding: number = 4
): string {
  return `${prefix}${sequence.toString().padStart(padding, '0')}`;
}

/**
 * Generate date-based number (e.g., for quotes, shipments)
 * @param prefix - The prefix (e.g., 'OBC', 'NFO', 'OUT', 'IN')
 * @param sequence - The sequence number
 */
export function generateDateBasedNumber(prefix: string, sequence: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  return `${prefix}${year}${month}${sequence.toString().padStart(4, '0')}`;
}

export function generateAWBNumber(): string {
  const prefix = '001'; // Your company prefix
  const sequence = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
  return `${prefix}-${sequence}`;
}