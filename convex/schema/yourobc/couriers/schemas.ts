// convex/schema/yourobc/couriers/schemas.ts
// Schema exports for couriers module

import { v } from 'convex/values';
import { couriersTable, commissionsTable } from './tables';

// ID schemas
export const courierIdSchema = v.id('yourobcCouriers');
export const courierCommissionIdSchema = v.id('yourobcCourierCommissions');

export const yourobcCouriersSchemas = {
  yourobcCouriers: couriersTable,
  yourobcCourierCommissions: commissionsTable,
};
