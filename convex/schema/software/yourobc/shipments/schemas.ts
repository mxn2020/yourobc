// convex/schema/software/yourobc/shipments/schemas.ts
// Schema exports for shipments module

import { shipmentsTable } from './shipments';
import { shipmentStatusHistoryTable } from './shipmentStatusHistory';

/**
 * Shipments module schema export
 * Exports both the main shipments table and the status history sub-table
 */
export const shipmentsSchemas = {
  yourobcShipments: shipmentsTable,
  yourobcShipmentStatusHistory: shipmentStatusHistoryTable,
};
