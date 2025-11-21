// convex/schema/yourobc/shipments/schemas.ts
// Schema exports for shipments module

import { shipmentsTable } from './shipments';
import { shipmentStatusHistoryTable } from './shipmentStatusHistory';

export const yourobcShipmentsSchemas = {
  yourobcShipments: shipmentsTable,
  yourobcShipmentStatusHistory: shipmentStatusHistoryTable,
};
