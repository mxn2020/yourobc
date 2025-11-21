// convex/lib/yourobc/shared/validation.ts
// convex/yourobc/shared/validation.ts

/**
 * Common validation utilities shared across YourOBC modules
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function validateAddress(
  address: { city?: string; country?: string; countryCode?: string },
  prefix = 'Address'
): string[] {
  const errors: string[] = [];

  if (!address.city?.trim()) {
    errors.push(`${prefix} city is required`);
  }

  if (!address.country?.trim()) {
    errors.push(`${prefix} country is required`);
  }

  if (!address.countryCode?.trim()) {
    errors.push(`${prefix} country code is required`);
  }

  return errors;
}

export function validateContact(
  contact: { name: string; email?: string; phone?: string },
  prefix = 'Contact'
): string[] {
  const errors: string[] = [];

  if (!contact.name.trim()) {
    errors.push(`${prefix} name is required`);
  }

  if (contact.email && !isValidEmail(contact.email)) {
    errors.push(`${prefix} email is invalid`);
  }

  if (contact.phone && !isValidPhone(contact.phone)) {
    errors.push(`${prefix} phone is invalid`);
  }

  return errors;
}

export function validateDimensions(
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: 'cm' | 'inch';
    weightUnit: 'kg' | 'lb';
  },
  maxDimensionsCm = 300,
  maxWeightKg = 50
): string[] {
  const errors: string[] = [];

  if (dimensions.length <= 0 || dimensions.width <= 0 || dimensions.height <= 0) {
    errors.push('All dimensions must be greater than 0');
  }

  if (dimensions.weight <= 0) {
    errors.push('Weight must be greater than 0');
  }

  // Convert to cm for validation
  const lengthCm = dimensions.unit === 'inch' ? dimensions.length * 2.54 : dimensions.length;
  const widthCm = dimensions.unit === 'inch' ? dimensions.width * 2.54 : dimensions.width;
  const heightCm = dimensions.unit === 'inch' ? dimensions.height * 2.54 : dimensions.height;

  if (lengthCm > maxDimensionsCm || widthCm > maxDimensionsCm || heightCm > maxDimensionsCm) {
    errors.push(`Dimensions cannot exceed ${maxDimensionsCm}cm in any direction`);
  }

  // Convert to kg for validation
  const weightKg = dimensions.weightUnit === 'lb' ? dimensions.weight * 0.453592 : dimensions.weight;
  
  if (weightKg > maxWeightKg) {
    errors.push(`Weight cannot exceed ${maxWeightKg}kg`);
  }

  return errors;
}

export function validateCurrencyAmount(
  amount: { amount: number; currency: string; exchangeRate?: number },
  prefix = 'Amount'
): string[] {
  const errors: string[] = [];

  if (amount.amount <= 0) {
    errors.push(`${prefix} must be greater than 0`);
  }

  if (amount.exchangeRate && amount.exchangeRate <= 0) {
    errors.push(`${prefix} exchange rate must be greater than 0`);
  }

  return errors;
}

export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveNumber(value: any): value is number {
  return typeof value === 'number' && value > 0;
}

export function isFutureDate(timestamp: number): boolean {
  return timestamp > Date.now();
}

export function isPastDate(timestamp: number): boolean {
  return timestamp < Date.now();
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}