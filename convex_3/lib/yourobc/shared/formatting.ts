// convex/lib/yourobc/shared/formatting.ts
// convex/yourobc/shared/formatting.ts

/**
 * Common formatting utilities shared across YourOBC modules
 */

export function formatCurrencyAmount(amount: { amount: number; currency: string }): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency,
  }).format(amount.amount);
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatAddress(address: { 
  street?: string; 
  city: string; 
  postalCode?: string;
  country: string; 
  countryCode: string;
}): string {
  const parts = [address.city, address.country];
  return parts.filter(Boolean).join(', ');
}

export function formatDimensions(dimensions: {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: 'cm' | 'inch';
  weightUnit: 'kg' | 'lb';
}): string {
  const { length, width, height, weight, unit, weightUnit } = dimensions;
  return `${length}×${width}×${height}${unit}, ${weight}${weightUnit}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function formatTimeRemaining(deadline: number, currentTime = Date.now()): string {
  const remainingMs = deadline - currentTime;
  
  if (remainingMs <= 0) {
    const overdueHours = Math.abs(Math.round(remainingMs / (1000 * 60 * 60)));
    return `${overdueHours}h overdue`;
  }

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatRoute(
  origin: { city: string; countryCode: string },
  destination: { city: string; countryCode: string }
): string {
  return `${origin.city}, ${origin.countryCode} → ${destination.city}, ${destination.countryCode}`;
}

export function daysBetween(date1: number, date2: number): number {
  return Math.floor(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
}