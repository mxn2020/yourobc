// convex/schema/yourobc/partners/types.ts
// Type extractions from validators for partners module

import { Infer } from 'convex/values';
import { partnersValidators, partnersFields } from './validators';

// Extract types from validators
export type PartnersStatus = Infer<typeof partnersValidators.status>;
export type PartnersContactRole = Infer<typeof partnersValidators.contactRole>;
export type PartnersPreferredContactMethod = Infer<typeof partnersValidators.preferredContactMethod>;
export type PartnersPartnerServiceType = Infer<typeof partnersValidators.partnerServiceType>;

// Extract types from fields
export type PartnersAddress = Infer<typeof partnersFields.address>;
export type PartnersContact = Infer<typeof partnersFields.contact>;
export type PartnersServiceCoverage = Infer<typeof partnersFields.serviceCoverage>;
export type PartnersServiceCapabilities = Infer<typeof partnersFields.serviceCapabilities>;
