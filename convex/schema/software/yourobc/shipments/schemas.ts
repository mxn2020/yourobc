// convex/schema/software/yourobc/shipments/schemas.ts
// Schema exports for shipments module

import { shipmentsTable, shipmentStatusHistoryTable } from './shipments';

export const softwareYourObcShipmentsSchemas = {
  yourobcShipments: shipmentsTable,
  yourobcShipmentStatusHistory: shipmentStatusHistoryTable,
};
