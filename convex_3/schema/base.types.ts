// convex/schema/base.types.ts
// Grouped base types inferred from validators

import { Infer } from 'convex/values';
import { baseValidators, baseFields } from './base.validators';

/**
 * Simple union base types
 * Used for status fields, enums, and simple type constraints
 */
export type ServiceType = Infer<typeof baseValidators.serviceType>;
export type Currency = Infer<typeof baseValidators.currency>;
export type ContactRole = Infer<typeof baseValidators.contactRole>;
export type PreferredContactMethod = Infer<typeof baseValidators.preferredContactMethod>;
export type PaymentMethod = Infer<typeof baseValidators.paymentMethod>;

/**
 * Complex object types for shipments
 * Used for nested data structures and composed objects
 */
export type Address = Infer<typeof baseFields.address>;
export type Contact = Infer<typeof baseFields.contact>;
