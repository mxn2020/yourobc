// convex/lib/yourobc/shared/utils.ts
// convex/yourobc/shared/utils.ts

/**
 * Common utility functions shared across YourOBC modules
 */

import { PRIORITY_COLORS, PRIORITY_LABELS, SERVICE_TYPE_LABELS } from './constants';

// Color helper functions
export function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.standard;
}

export function getPriorityLabel(priority: string): string {
  return PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS] || PRIORITY_LABELS.standard;
}

export function getServiceTypeLabel(serviceType: string): string {
  return SERVICE_TYPE_LABELS[serviceType as keyof typeof SERVICE_TYPE_LABELS] || serviceType;
}

// Airport code utilities
export function validateAirportCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

export function normalizeAirportCode(code: string): string {
  return code.toUpperCase().trim();
}

export function getCountryFromCode(countryCode: string): string {
  // This would typically use a country code library
  // For now, return the code itself
  return countryCode.toUpperCase();
}

// Status color helper (generic)
export function getStatusColor(status: string, colorMap: Record<string, string>): string {
  return colorMap[status] || '#6b7280';
}

// Generic label helper
export function getStatusLabel(status: string, labelMap: Record<string, string>): string {
  return labelMap[status] || status;
}

// Weight conversion utilities
export function convertWeight(weight: number, fromUnit: 'kg' | 'lb', toUnit: 'kg' | 'lb'): number {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'lb' && toUnit === 'kg') {
    return weight * 0.453592;
  }
  
  if (fromUnit === 'kg' && toUnit === 'lb') {
    return weight / 0.453592;
  }
  
  return weight;
}

// Dimension conversion utilities
export function convertDimension(dimension: number, fromUnit: 'cm' | 'inch', toUnit: 'cm' | 'inch'): number {
  if (fromUnit === toUnit) return dimension;
  
  if (fromUnit === 'inch' && toUnit === 'cm') {
    return dimension * 2.54;
  }
  
  if (fromUnit === 'cm' && toUnit === 'inch') {
    return dimension / 2.54;
  }
  
  return dimension;
}

// calculateChargeableWeight is now in calculations.ts

// Generate entity reference numbers
export function generateReference(prefix: string, sequence: number, length = 6): string {
  return `${prefix}${sequence.toString().padStart(length, '0')}`;
}

// Calculate deadline urgency
export function calculateDeadlineUrgency(deadline: number, currentTime = Date.now()): 'critical' | 'urgent' | 'normal' {
  const hoursRemaining = (deadline - currentTime) / (1000 * 60 * 60);
  
  if (hoursRemaining <= 4) return 'critical';
  if (hoursRemaining <= 24) return 'urgent';
  return 'normal';
}

// Generic search helper
export function calculateSearchScore(searchTerm: string, text: string, title?: string): number {
  const termLower = searchTerm.toLowerCase();
  const textLower = text.toLowerCase();
  const titleLower = title?.toLowerCase() || '';
  
  let score = 0;
  
  // Title match (highest score)
  if (title && titleLower.includes(termLower)) {
    score += titleLower === termLower ? 100 : 50;
  }
  
  // Text matches
  const matches = (textLower.match(new RegExp(termLower, 'g')) || []).length;
  score += matches * 5;
  
  // Word boundary matches
  const wordMatches = (text.match(new RegExp(`\\b${termLower}\\b`, 'gi')) || []).length;
  score += wordMatches * 10;
  
  return score;
}

// Performance calculation helper
export function calculatePerformanceMetric(current: number, target: number): {
  percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
} {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  
  let status: 'excellent' | 'good' | 'warning' | 'critical';
  if (percentage >= 100) status = 'excellent';
  else if (percentage >= 90) status = 'good';
  else if (percentage >= 70) status = 'warning';
  else status = 'critical';
  
  return { percentage: Math.round(percentage), status };
}