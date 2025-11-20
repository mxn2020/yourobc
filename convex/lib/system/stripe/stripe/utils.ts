// convex/lib/boilerplate/stripe/stripe/utils.ts
// Utility functions for stripe module

import { STRIPE_CONSTANTS } from './constants';
import type {
  ValidationResult,
  CreateCustomerInput,
  CreateSubscriptionInput,
  CreatePaymentInput,
  StripeAddress,
} from './types';

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  return STRIPE_CONSTANTS.VALIDATION_PATTERNS.EMAIL.test(email);
}

/**
 * Validate Stripe Customer ID
 */
export function validateStripeCustomerId(customerId: string): boolean {
  return STRIPE_CONSTANTS.VALIDATION_PATTERNS.STRIPE_CUSTOMER_ID.test(
    customerId
  );
}

/**
 * Validate Stripe Subscription ID
 */
export function validateStripeSubscriptionId(subscriptionId: string): boolean {
  return STRIPE_CONSTANTS.VALIDATION_PATTERNS.STRIPE_SUBSCRIPTION_ID.test(
    subscriptionId
  );
}

/**
 * Validate Stripe Payment Intent ID
 */
export function validateStripePaymentIntentId(paymentIntentId: string): boolean {
  return STRIPE_CONSTANTS.VALIDATION_PATTERNS.STRIPE_PAYMENT_INTENT_ID.test(
    paymentIntentId
  );
}

/**
 * Validate currency code
 */
export function validateCurrency(currency: string): boolean {
  return STRIPE_CONSTANTS.VALIDATION_PATTERNS.CURRENCY_CODE.test(
    currency.toUpperCase()
  );
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(
  amount: number,
  currency: string = 'usd'
): ValidationResult {
  const errors: string[] = [];
  const currencyUpper = currency.toUpperCase();

  if (amount <= 0) {
    errors.push('Amount must be greater than zero');
  }

  const minAmount = STRIPE_CONSTANTS.LIMITS.MIN_AMOUNT_USD;
  const maxAmount = STRIPE_CONSTANTS.LIMITS.MAX_AMOUNT_USD;

  if (amount < minAmount) {
    errors.push(
      `Amount must be at least ${minAmount} cents (${formatCurrency(minAmount, currency)})`
    );
  }

  if (amount > maxAmount) {
    errors.push(
      `Amount cannot exceed ${maxAmount} cents (${formatCurrency(maxAmount, currency)})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amountInCents: number,
  currency: string = 'usd'
): string {
  const amount = amountInCents / 100;
  const currencyUpper = currency.toUpperCase();

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyUpper,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Validate customer input
 */
export function validateCustomerInput(
  input: CreateCustomerInput
): ValidationResult {
  const errors: string[] = [];

  // Email validation
  if (!input.email) {
    errors.push(STRIPE_CONSTANTS.ERROR_MESSAGES.CUSTOMER_EMAIL_REQUIRED);
  } else if (!validateEmail(input.email)) {
    errors.push(STRIPE_CONSTANTS.ERROR_MESSAGES.CUSTOMER_EMAIL_INVALID);
  } else if (input.email.length > STRIPE_CONSTANTS.LIMITS.CUSTOMER_EMAIL_MAX) {
    errors.push(
      `Email must be less than ${STRIPE_CONSTANTS.LIMITS.CUSTOMER_EMAIL_MAX} characters`
    );
  }

  // Name validation
  if (input.name && input.name.length > STRIPE_CONSTANTS.LIMITS.CUSTOMER_NAME_MAX) {
    errors.push(
      `Name must be less than ${STRIPE_CONSTANTS.LIMITS.CUSTOMER_NAME_MAX} characters`
    );
  }

  // Description validation
  if (
    input.description &&
    input.description.length > STRIPE_CONSTANTS.LIMITS.CUSTOMER_DESCRIPTION_MAX
  ) {
    errors.push(
      `Description must be less than ${STRIPE_CONSTANTS.LIMITS.CUSTOMER_DESCRIPTION_MAX} characters`
    );
  }

  // Phone validation
  if (input.phone) {
    if (input.phone.length > STRIPE_CONSTANTS.LIMITS.CUSTOMER_PHONE_MAX) {
      errors.push(
        `Phone must be less than ${STRIPE_CONSTANTS.LIMITS.CUSTOMER_PHONE_MAX} characters`
      );
    }
    if (!STRIPE_CONSTANTS.VALIDATION_PATTERNS.PHONE.test(input.phone)) {
      errors.push('Phone number format is invalid');
    }
  }

  // Address validation
  if (input.address) {
    const addressErrors = validateAddress(input.address);
    if (!addressErrors.isValid && addressErrors.errors) {
      errors.push(...addressErrors.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate address
 */
export function validateAddress(address: StripeAddress): ValidationResult {
  const errors: string[] = [];

  if (address.line1 && address.line1.length > STRIPE_CONSTANTS.LIMITS.ADDRESS_LINE_MAX) {
    errors.push(
      `Address line 1 must be less than ${STRIPE_CONSTANTS.LIMITS.ADDRESS_LINE_MAX} characters`
    );
  }

  if (address.line2 && address.line2.length > STRIPE_CONSTANTS.LIMITS.ADDRESS_LINE_MAX) {
    errors.push(
      `Address line 2 must be less than ${STRIPE_CONSTANTS.LIMITS.ADDRESS_LINE_MAX} characters`
    );
  }

  if (address.city && address.city.length > STRIPE_CONSTANTS.LIMITS.CITY_MAX) {
    errors.push(`City must be less than ${STRIPE_CONSTANTS.LIMITS.CITY_MAX} characters`);
  }

  if (address.state && address.state.length > STRIPE_CONSTANTS.LIMITS.STATE_MAX) {
    errors.push(`State must be less than ${STRIPE_CONSTANTS.LIMITS.STATE_MAX} characters`);
  }

  if (
    address.postalCode &&
    address.postalCode.length > STRIPE_CONSTANTS.LIMITS.POSTAL_CODE_MAX
  ) {
    errors.push(
      `Postal code must be less than ${STRIPE_CONSTANTS.LIMITS.POSTAL_CODE_MAX} characters`
    );
  }

  if (address.country && address.country.length !== STRIPE_CONSTANTS.LIMITS.COUNTRY_MAX) {
    errors.push('Country must be a 2-letter ISO code');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate subscription input
 */
export function validateSubscriptionInput(
  input: CreateSubscriptionInput
): ValidationResult {
  const errors: string[] = [];

  // Customer ID validation
  if (!input.stripeCustomerId) {
    errors.push('Stripe customer ID is required');
  } else if (!validateStripeCustomerId(input.stripeCustomerId)) {
    errors.push('Invalid Stripe customer ID format');
  }

  // Price ID validation
  if (!input.stripePriceId) {
    errors.push('Stripe price ID is required');
  } else if (!STRIPE_CONSTANTS.VALIDATION_PATTERNS.STRIPE_PRICE_ID.test(input.stripePriceId)) {
    errors.push('Invalid Stripe price ID format');
  }

  // Product ID validation
  if (!input.stripeProductId) {
    errors.push('Stripe product ID is required');
  } else if (
    !STRIPE_CONSTANTS.VALIDATION_PATTERNS.STRIPE_PRODUCT_ID.test(input.stripeProductId)
  ) {
    errors.push('Invalid Stripe product ID format');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate payment input
 */
export function validatePaymentInput(input: CreatePaymentInput): ValidationResult {
  const errors: string[] = [];

  // Amount validation
  const amountValidation = validatePaymentAmount(input.amount, input.currency);
  if (!amountValidation.isValid && amountValidation.errors) {
    errors.push(...amountValidation.errors);
  }

  // Currency validation
  if (!input.currency) {
    errors.push('Currency is required');
  } else if (!validateCurrency(input.currency)) {
    errors.push(STRIPE_CONSTANTS.ERROR_MESSAGES.INVALID_CURRENCY);
  }

  // Description validation
  if (
    input.description &&
    input.description.length > STRIPE_CONSTANTS.LIMITS.PAYMENT_DESCRIPTION_MAX
  ) {
    errors.push(
      `Description must be less than ${STRIPE_CONSTANTS.LIMITS.PAYMENT_DESCRIPTION_MAX} characters`
    );
  }

  // Receipt email validation
  if (input.receiptEmail && !validateEmail(input.receiptEmail)) {
    errors.push('Receipt email is invalid');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Generate public ID for Stripe entities
 */
export function generateStripePublicId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}${random}`;
}

/**
 * Generate customer public ID
 */
export function generateCustomerPublicId(): string {
  return generateStripePublicId('cust');
}

/**
 * Generate subscription public ID
 */
export function generateSubscriptionPublicId(): string {
  return generateStripePublicId('sub');
}

/**
 * Generate payment public ID
 */
export function generatePaymentPublicId(): string {
  return generateStripePublicId('pay');
}

/**
 * Generate webhook event public ID
 */
export function generateWebhookPublicId(): string {
  return generateStripePublicId('wh');
}

/**
 * Calculate subscription end date
 */
export function calculateSubscriptionEndDate(
  startDate: number,
  interval: 'day' | 'week' | 'month' | 'year',
  intervalCount: number = 1
): number {
  const date = new Date(startDate);

  switch (interval) {
    case 'day':
      date.setDate(date.getDate() + intervalCount);
      break;
    case 'week':
      date.setDate(date.getDate() + intervalCount * 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() + intervalCount);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() + intervalCount);
      break;
  }

  return date.getTime();
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(status: string): boolean {
  return (
    status === STRIPE_CONSTANTS.SUBSCRIPTION_STATUSES.ACTIVE ||
    status === STRIPE_CONSTANTS.SUBSCRIPTION_STATUSES.TRIALING
  );
}

/**
 * Check if payment is successful
 */
export function isPaymentSuccessful(status: string): boolean {
  return status === STRIPE_CONSTANTS.PAYMENT_STATUSES.SUCCEEDED;
}

/**
 * Check if payment can be refunded
 */
export function canRefundPayment(payment: {
  status: string;
  refunded?: boolean;
  amount: number;
  refundAmount?: number;
}): boolean {
  if (!isPaymentSuccessful(payment.status)) {
    return false;
  }

  if (payment.refunded) {
    return false;
  }

  const refundedAmount = payment.refundAmount || 0;
  return refundedAmount < payment.amount;
}

/**
 * Calculate refund amount available
 */
export function getRefundableAmount(payment: {
  amount: number;
  refundAmount?: number;
}): number {
  const refundedAmount = payment.refundAmount || 0;
  return Math.max(0, payment.amount - refundedAmount);
}

/**
 * Parse webhook event type
 */
export function parseWebhookEventType(eventType: string): {
  object: string;
  action: string;
} {
  const parts = eventType.split('.');
  if (parts.length < 2) {
    return { object: eventType, action: 'unknown' };
  }

  return {
    object: parts[0],
    action: parts.slice(1).join('.'),
  };
}

/**
 * Check if webhook should be processed
 */
export function shouldProcessWebhook(
  eventType: string,
  livemode: boolean = false
): boolean {
  // Always process webhook events in production (livemode = true)
  // In test mode, you might want to filter certain events
  return true;
}

/**
 * Generate idempotency key
 */
export function generateIdempotencyKey(eventId: string): string {
  return `stripe_webhook_${eventId}`;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string | undefined): string | undefined {
  return input?.trim() || undefined;
}

/**
 * Trim object string fields
 */
export function trimObjectFields<T extends Record<string, any>>(obj: T): T {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = value.trim();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = trimObjectFields(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Calculate monthly recurring revenue from subscriptions
 */
export function calculateMRR(subscriptions: Array<{ amount?: number; interval?: string; intervalCount?: number; status: string }>): number {
  return subscriptions
    .filter((sub) => isSubscriptionActive(sub.status))
    .reduce((total, sub) => {
      if (!sub.amount || !sub.interval) return total;

      const intervalCount = sub.intervalCount || 1;
      let monthlyAmount = sub.amount;

      switch (sub.interval) {
        case 'day':
          monthlyAmount = (sub.amount / intervalCount) * 30;
          break;
        case 'week':
          monthlyAmount = (sub.amount / intervalCount) * 4.33;
          break;
        case 'month':
          monthlyAmount = sub.amount / intervalCount;
          break;
        case 'year':
          monthlyAmount = sub.amount / (intervalCount * 12);
          break;
      }

      return total + monthlyAmount;
    }, 0);
}

/**
 * Calculate annual recurring revenue
 */
export function calculateARR(mrr: number): number {
  return mrr * 12;
}
