// convex/schema/software/yourobc/customers/types.ts
// Type extractions from validators for customers module

import { Infer } from 'convex/values';
import { customersValidators } from './validators';

// Extract types from validators
export type CustomerStatus = Infer<typeof customersValidators.status>;
export type CustomerCurrency = Infer<typeof customersValidators.currency>;
export type CustomerPaymentMethod = Infer<typeof customersValidators.paymentMethod>;
