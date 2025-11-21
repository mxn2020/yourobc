// convex/lib/yourobc/couriers/utils.ts
// Validation functions and utility helpers for couriers module

import { COURIERS_CONSTANTS } from './constants';
import type {
  CreateCourierData,
  UpdateCourierData,
  ContactData,
  AddressData,
  ServiceCoverageData,
  ApiIntegrationData,
  CostStructureData,
} from './types';

/**
 * Validate courier data for creation/update
 */
export function validateCourierData(
  data: Partial<CreateCourierData | UpdateCourierData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Courier name is required');
    } else if (trimmed.length < COURIERS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${COURIERS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > COURIERS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!COURIERS_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  // Validate short name
  if (data.shortName !== undefined && data.shortName.trim()) {
    const trimmed = data.shortName.trim();
    if (trimmed.length > COURIERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH) {
      errors.push(`Short name cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH} characters`);
    }
  }

  // Validate website
  if (data.website !== undefined && data.website.trim()) {
    const trimmed = data.website.trim();
    if (trimmed.length > COURIERS_CONSTANTS.LIMITS.MAX_WEBSITE_LENGTH) {
      errors.push(`Website cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_WEBSITE_LENGTH} characters`);
    } else if (!COURIERS_CONSTANTS.VALIDATION.WEBSITE_PATTERN.test(trimmed)) {
      errors.push('Website URL is invalid');
    }
  }

  // Validate email
  if (data.email !== undefined && data.email.trim()) {
    const trimmed = data.email.trim();
    if (trimmed.length > COURIERS_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH) {
      errors.push(`Email cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH} characters`);
    } else if (!COURIERS_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(trimmed)) {
      errors.push('Email address is invalid');
    }
  }

  // Validate phone
  if (data.phone !== undefined && data.phone.trim()) {
    const trimmed = data.phone.trim();
    if (trimmed.length > COURIERS_CONSTANTS.LIMITS.MAX_PHONE_LENGTH) {
      errors.push(`Phone cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_PHONE_LENGTH} characters`);
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim();
    if (trimmed.length > COURIERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
    }
  }

  // Validate internal notes
  if (data.internalNotes !== undefined && data.internalNotes.trim()) {
    const trimmed = data.internalNotes.trim();
    if (trimmed.length > COURIERS_CONSTANTS.LIMITS.MAX_INTERNAL_NOTES_LENGTH) {
      errors.push(`Internal notes cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_INTERNAL_NOTES_LENGTH} characters`);
    }
  }

  // Validate service types
  if ('serviceTypes' in data && data.serviceTypes) {
    if (data.serviceTypes.length === 0) {
      errors.push('At least one service type is required');
    } else if (data.serviceTypes.length > COURIERS_CONSTANTS.LIMITS.MAX_SERVICE_TYPES) {
      errors.push(`Cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_SERVICE_TYPES} service types`);
    }
  }

  // Validate delivery speeds
  if ('deliverySpeeds' in data && data.deliverySpeeds) {
    if (data.deliverySpeeds.length === 0) {
      errors.push('At least one delivery speed is required');
    } else if (data.deliverySpeeds.length > COURIERS_CONSTANTS.LIMITS.MAX_DELIVERY_SPEEDS) {
      errors.push(`Cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_DELIVERY_SPEEDS} delivery speeds`);
    }
  }

  // Validate service coverage
  if ('serviceCoverage' in data && data.serviceCoverage) {
    const coverageErrors = validateServiceCoverage(data.serviceCoverage);
    if (coverageErrors.length > 0) {
      errors.push(`Service coverage: ${coverageErrors.join(', ')}`);
    }
  }

  // Validate additional contacts
  if ('additionalContacts' in data && data.additionalContacts) {
    if (data.additionalContacts.length > COURIERS_CONSTANTS.LIMITS.MAX_ADDITIONAL_CONTACTS) {
      errors.push(`Cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_ADDITIONAL_CONTACTS} additional contacts`);
    }

    data.additionalContacts.forEach((contact, index) => {
      const contactErrors = validateContact(contact);
      if (contactErrors.length > 0) {
        errors.push(`Contact ${index + 1}: ${contactErrors.join(', ')}`);
      }
    });
  }

  // Validate primary contact
  if ('primaryContact' in data && data.primaryContact) {
    const contactErrors = validateContact(data.primaryContact);
    if (contactErrors.length > 0) {
      errors.push(`Primary contact: ${contactErrors.join(', ')}`);
    }
  }

  // Validate headquarters address
  if ('headquartersAddress' in data && data.headquartersAddress) {
    const addressErrors = validateAddress(data.headquartersAddress);
    if (addressErrors.length > 0) {
      errors.push(`Headquarters address: ${addressErrors.join(', ')}`);
    }
  }

  // Validate API integration
  if ('apiIntegration' in data && data.apiIntegration) {
    const apiErrors = validateApiIntegration(data.apiIntegration);
    if (apiErrors.length > 0) {
      errors.push(`API integration: ${apiErrors.join(', ')}`);
    }
  }

  // Validate cost structure
  if ('costStructure' in data && data.costStructure) {
    const costErrors = validateCostStructure(data.costStructure);
    if (costErrors.length > 0) {
      errors.push(`Cost structure: ${costErrors.join(', ')}`);
    }
  }

  // Validate metrics
  if ('metrics' in data && data.metrics) {
    if (data.metrics.reliabilityScore !== undefined) {
      if (
        data.metrics.reliabilityScore < COURIERS_CONSTANTS.LIMITS.MIN_RELIABILITY_SCORE ||
        data.metrics.reliabilityScore > COURIERS_CONSTANTS.LIMITS.MAX_RELIABILITY_SCORE
      ) {
        errors.push(
          `Reliability score must be between ${COURIERS_CONSTANTS.LIMITS.MIN_RELIABILITY_SCORE} and ${COURIERS_CONSTANTS.LIMITS.MAX_RELIABILITY_SCORE}`
        );
      }
    }

    if (data.metrics.onTimeDeliveryRate !== undefined) {
      if (
        data.metrics.onTimeDeliveryRate < COURIERS_CONSTANTS.LIMITS.MIN_DELIVERY_RATE ||
        data.metrics.onTimeDeliveryRate > COURIERS_CONSTANTS.LIMITS.MAX_DELIVERY_RATE
      ) {
        errors.push(
          `On-time delivery rate must be between ${COURIERS_CONSTANTS.LIMITS.MIN_DELIVERY_RATE} and ${COURIERS_CONSTANTS.LIMITS.MAX_DELIVERY_RATE}`
        );
      }
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > COURIERS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter((tag) => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  return errors;
}

/**
 * Validate contact data
 */
export function validateContact(contact: ContactData): string[] {
  const errors: string[] = [];

  if (!contact.name || !contact.name.trim()) {
    errors.push('Contact name is required');
  }

  if (contact.email && contact.email.trim()) {
    if (!COURIERS_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(contact.email.trim())) {
      errors.push('Invalid email address');
    }
  }

  return errors;
}

/**
 * Validate address data
 */
export function validateAddress(address: AddressData): string[] {
  const errors: string[] = [];

  if (!address.city || !address.city.trim()) {
    errors.push('City is required');
  }

  if (!address.country || !address.country.trim()) {
    errors.push('Country is required');
  }

  if (!address.countryCode || !address.countryCode.trim()) {
    errors.push('Country code is required');
  } else if (address.countryCode.trim().length !== 2) {
    errors.push('Country code must be 2 characters');
  }

  return errors;
}

/**
 * Validate service coverage data
 */
export function validateServiceCoverage(coverage: ServiceCoverageData): string[] {
  const errors: string[] = [];

  if (!coverage.countries || coverage.countries.length === 0) {
    errors.push('At least one country is required');
  } else if (coverage.countries.length > COURIERS_CONSTANTS.LIMITS.MAX_COVERAGE_COUNTRIES) {
    errors.push(`Cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_COVERAGE_COUNTRIES} countries`);
  }

  if (coverage.regions && coverage.regions.length > COURIERS_CONSTANTS.LIMITS.MAX_COVERAGE_REGIONS) {
    errors.push(`Cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_COVERAGE_REGIONS} regions`);
  }

  if (coverage.cities && coverage.cities.length > COURIERS_CONSTANTS.LIMITS.MAX_COVERAGE_CITIES) {
    errors.push(`Cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_COVERAGE_CITIES} cities`);
  }

  if (coverage.airports && coverage.airports.length > COURIERS_CONSTANTS.LIMITS.MAX_COVERAGE_AIRPORTS) {
    errors.push(`Cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_COVERAGE_AIRPORTS} airports`);
  }

  return errors;
}

/**
 * Validate API integration data
 */
export function validateApiIntegration(api: ApiIntegrationData): string[] {
  const errors: string[] = [];

  if (api.enabled && api.baseUrl) {
    const trimmed = api.baseUrl.trim();
    if (trimmed.length > COURIERS_CONSTANTS.LIMITS.MAX_API_URL_LENGTH) {
      errors.push(`API URL cannot exceed ${COURIERS_CONSTANTS.LIMITS.MAX_API_URL_LENGTH} characters`);
    } else if (!COURIERS_CONSTANTS.VALIDATION.API_URL_PATTERN.test(trimmed)) {
      errors.push('API URL is invalid (must start with http:// or https://)');
    }
  }

  return errors;
}

/**
 * Validate cost structure data
 */
export function validateCostStructure(cost: CostStructureData): string[] {
  const errors: string[] = [];

  if (cost.baseFee !== undefined && cost.baseFee < 0) {
    errors.push('Base fee cannot be negative');
  }

  if (cost.perKgRate !== undefined && cost.perKgRate < 0) {
    errors.push('Per kg rate cannot be negative');
  }

  if (cost.perKmRate !== undefined && cost.perKmRate < 0) {
    errors.push('Per km rate cannot be negative');
  }

  if (cost.fuelSurcharge !== undefined && cost.fuelSurcharge < 0) {
    errors.push('Fuel surcharge cannot be negative');
  }

  if (cost.handlingFee !== undefined && cost.handlingFee < 0) {
    errors.push('Handling fee cannot be negative');
  }

  return errors;
}

/**
 * Format courier display name
 */
export function formatCourierDisplayName(courier: { name: string; status?: string }): string {
  const statusBadge = courier.status ? ` [${courier.status}]` : '';
  return `${courier.name}${statusBadge}`;
}

/**
 * Check if courier is editable
 */
export function isCourierEditable(courier: { status: string; deletedAt?: number }): boolean {
  if (courier.deletedAt) return false;
  return courier.status !== 'archived';
}

/**
 * Check if courier supports service type
 */
export function courierSupportsService(
  courier: { serviceTypes: string[] },
  serviceType: string
): boolean {
  return courier.serviceTypes.includes(serviceType);
}

/**
 * Check if courier covers country
 */
export function courierCoversCountry(
  courier: { serviceCoverage: { countries: string[] } },
  countryCode: string
): boolean {
  return courier.serviceCoverage.countries.includes(countryCode);
}

/**
 * Calculate average reliability score
 */
export function calculateAverageReliability(
  couriers: Array<{ metrics?: { reliabilityScore?: number } }>
): number {
  const scores = couriers
    .map((c) => c.metrics?.reliabilityScore)
    .filter((score): score is number => score !== undefined);

  if (scores.length === 0) return 0;

  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round((total / scores.length) * 100) / 100;
}

/**
 * Calculate average on-time delivery rate
 */
export function calculateAverageOnTimeRate(
  couriers: Array<{ metrics?: { onTimeDeliveryRate?: number } }>
): number {
  const rates = couriers
    .map((c) => c.metrics?.onTimeDeliveryRate)
    .filter((rate): rate is number => rate !== undefined);

  if (rates.length === 0) return 0;

  const total = rates.reduce((sum, rate) => sum + rate, 0);
  return Math.round((total / rates.length) * 100) / 100;
}
