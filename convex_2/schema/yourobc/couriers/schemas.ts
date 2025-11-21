// convex/schema/yourobc/couriers/schemas.ts
// Schema exports for couriers module

import { couriersTable } from './couriers';
import { commissionsTable } from './commissions';

export const yourobcCouriersSchemas = {
  yourobcCouriers: couriersTable,
  yourobcCourierCommissions: commissionsTable,
};
