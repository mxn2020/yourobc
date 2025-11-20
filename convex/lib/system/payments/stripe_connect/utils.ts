// convex/lib/boilerplate/payments/stripe_connect/utils.ts

/**
 * Stripe Connect Utilities
 *
 * Validation and helper functions for Stripe Connect module
 */

import { STRIPE_CONNECT_CONSTANTS } from './constants';
import type {
  CreateConnectedAccountData,
  UpdateConnectedAccountData,
  CreateProductData,
  UpdateProductData,
  CreatePaymentData,
  UpdatePaymentData,
} from './types';

// ============================================
// Connected Account Validation
// ============================================

/**
 * Validate create connected account data
 */
export function validateCreateConnectedAccountData(
  data: Partial<CreateConnectedAccountData>
): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.clientName || !data.clientName.trim()) {
    errors.push('Client name is required');
  } else if (data.clientName.length > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
    errors.push(
      `Client name must be ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters or less`
    );
  }

  if (!data.clientEmail || !data.clientEmail.trim()) {
    errors.push('Client email is required');
  } else if (!STRIPE_CONNECT_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(data.clientEmail)) {
    errors.push('Invalid email format');
  } else if (data.clientEmail.length > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH) {
    errors.push(
      `Email must be ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH} characters or less`
    );
  }

  if (!data.stripeAccountId || !data.stripeAccountId.trim()) {
    errors.push('Stripe account ID is required');
  } else if (
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.STRIPE_ACCOUNT_ID_PATTERN.test(data.stripeAccountId)
  ) {
    errors.push('Invalid Stripe account ID format');
  }

  // Optional fields validation
  if (data.statement_descriptor && data.statement_descriptor.length > 22) {
    errors.push('Statement descriptor must be 22 characters or less');
  }

  if (
    data.default_currency &&
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.CURRENCY_PATTERN.test(data.default_currency)
  ) {
    errors.push('Invalid currency code (must be 3 lowercase letters)');
  }

  return errors;
}

/**
 * Validate update connected account data
 */
export function validateUpdateConnectedAccountData(
  data: Partial<UpdateConnectedAccountData>
): string[] {
  const errors: string[] = [];

  if (data.clientName !== undefined) {
    if (!data.clientName.trim()) {
      errors.push('Client name cannot be empty');
    } else if (data.clientName.length > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(
        `Client name must be ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters or less`
      );
    }
  }

  if (data.clientEmail !== undefined) {
    if (!data.clientEmail.trim()) {
      errors.push('Client email cannot be empty');
    } else if (!STRIPE_CONNECT_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(data.clientEmail)) {
      errors.push('Invalid email format');
    }
  }

  if (
    data.default_currency &&
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.CURRENCY_PATTERN.test(data.default_currency)
  ) {
    errors.push('Invalid currency code');
  }

  return errors;
}

// ============================================
// Product Validation
// ============================================

/**
 * Validate create product data
 */
export function validateCreateProductData(data: Partial<CreateProductData>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.name || !data.name.trim()) {
    errors.push('Product name is required');
  } else if (data.name.length > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
    errors.push(
      `Product name must be ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters or less`
    );
  }

  if (!data.stripeProductId || !data.stripeProductId.trim()) {
    errors.push('Stripe product ID is required');
  } else if (
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.STRIPE_PRODUCT_PATTERN.test(data.stripeProductId)
  ) {
    errors.push('Invalid Stripe product ID format');
  }

  if (!data.stripePriceId || !data.stripePriceId.trim()) {
    errors.push('Stripe price ID is required');
  } else if (
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.STRIPE_PRICE_PATTERN.test(data.stripePriceId)
  ) {
    errors.push('Invalid Stripe price ID format');
  }

  // Amount validation
  if (data.amount === undefined || data.amount === null) {
    errors.push('Amount is required');
  } else if (data.amount < STRIPE_CONNECT_CONSTANTS.LIMITS.MIN_AMOUNT) {
    errors.push(`Amount must be at least ${STRIPE_CONNECT_CONSTANTS.LIMITS.MIN_AMOUNT} cents`);
  } else if (data.amount > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_AMOUNT) {
    errors.push(`Amount must be less than ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_AMOUNT} cents`);
  }

  // Currency validation
  if (!data.currency || !data.currency.trim()) {
    errors.push('Currency is required');
  } else if (!STRIPE_CONNECT_CONSTANTS.VALIDATION.CURRENCY_PATTERN.test(data.currency)) {
    errors.push('Invalid currency code');
  }

  // Application fee validation
  if (data.application_fee_percent !== undefined) {
    if (data.application_fee_percent < STRIPE_CONNECT_CONSTANTS.LIMITS.MIN_APPLICATION_FEE_PERCENT) {
      errors.push('Application fee percent cannot be negative');
    } else if (
      data.application_fee_percent > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_APPLICATION_FEE_PERCENT
    ) {
      errors.push('Application fee percent cannot exceed 100%');
    }
  }

  // Description validation
  if (
    data.description &&
    data.description.length > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH
  ) {
    errors.push(
      `Description must be ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters or less`
    );
  }

  return errors;
}

/**
 * Validate update product data
 */
export function validateUpdateProductData(data: Partial<UpdateProductData>): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Product name cannot be empty');
    } else if (data.name.length > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(
        `Product name must be ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters or less`
      );
    }
  }

  if (data.amount !== undefined) {
    if (data.amount < STRIPE_CONNECT_CONSTANTS.LIMITS.MIN_AMOUNT) {
      errors.push(`Amount must be at least ${STRIPE_CONNECT_CONSTANTS.LIMITS.MIN_AMOUNT} cents`);
    } else if (data.amount > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_AMOUNT) {
      errors.push(`Amount must be less than ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_AMOUNT} cents`);
    }
  }

  if (data.application_fee_percent !== undefined) {
    if (data.application_fee_percent < STRIPE_CONNECT_CONSTANTS.LIMITS.MIN_APPLICATION_FEE_PERCENT) {
      errors.push('Application fee percent cannot be negative');
    } else if (
      data.application_fee_percent > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_APPLICATION_FEE_PERCENT
    ) {
      errors.push('Application fee percent cannot exceed 100%');
    }
  }

  if (
    data.description &&
    data.description.length > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH
  ) {
    errors.push(
      `Description must be ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters or less`
    );
  }

  return errors;
}

// ============================================
// Payment Validation
// ============================================

/**
 * Validate create payment data
 */
export function validateCreatePaymentData(data: Partial<CreatePaymentData>): string[] {
  const errors: string[] = [];

  // Amount validation
  if (data.amount === undefined || data.amount === null) {
    errors.push('Amount is required');
  } else if (data.amount < STRIPE_CONNECT_CONSTANTS.LIMITS.MIN_AMOUNT) {
    errors.push(`Amount must be at least ${STRIPE_CONNECT_CONSTANTS.LIMITS.MIN_AMOUNT} cents`);
  } else if (data.amount > STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_AMOUNT) {
    errors.push(`Amount must be less than ${STRIPE_CONNECT_CONSTANTS.LIMITS.MAX_AMOUNT} cents`);
  }

  // Currency validation
  if (!data.currency || !data.currency.trim()) {
    errors.push('Currency is required');
  } else if (!STRIPE_CONNECT_CONSTANTS.VALIDATION.CURRENCY_PATTERN.test(data.currency)) {
    errors.push('Invalid currency code');
  }

  // Email validation (if provided)
  if (
    data.customerEmail &&
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(data.customerEmail)
  ) {
    errors.push('Invalid customer email format');
  }

  // Stripe ID validations
  if (
    data.stripePaymentIntentId &&
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.STRIPE_PAYMENT_INTENT_PATTERN.test(
      data.stripePaymentIntentId
    )
  ) {
    errors.push('Invalid Stripe payment intent ID format');
  }

  if (
    data.stripeChargeId &&
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.STRIPE_CHARGE_PATTERN.test(data.stripeChargeId)
  ) {
    errors.push('Invalid Stripe charge ID format');
  }

  if (
    data.stripeSubscriptionId &&
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.STRIPE_SUBSCRIPTION_PATTERN.test(data.stripeSubscriptionId)
  ) {
    errors.push('Invalid Stripe subscription ID format');
  }

  if (
    data.stripeCustomerId &&
    !STRIPE_CONNECT_CONSTANTS.VALIDATION.STRIPE_CUSTOMER_PATTERN.test(data.stripeCustomerId)
  ) {
    errors.push('Invalid Stripe customer ID format');
  }

  return errors;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate net amount from gross amount and application fee percent
 */
export function calculateNetAmount(amount: number, applicationFeePercent: number): number {
  const applicationFeeAmount = Math.round((amount * applicationFeePercent) / 100);
  return amount - applicationFeeAmount;
}

/**
 * Calculate application fee amount from gross amount and application fee percent
 */
export function calculateApplicationFeeAmount(
  amount: number,
  applicationFeePercent: number
): number {
  return Math.round((amount * applicationFeePercent) / 100);
}

/**
 * Determine account status from Stripe account data
 */
export function determineAccountStatus(accountData: {
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  requirements?: { disabled_reason?: string };
}): 'pending' | 'onboarding' | 'active' | 'restricted' | 'disabled' {
  if (accountData.charges_enabled && accountData.payouts_enabled) {
    return 'active';
  } else if (accountData.details_submitted) {
    return 'onboarding';
  } else if (accountData.requirements?.disabled_reason) {
    return 'restricted';
  }
  return 'pending';
}
