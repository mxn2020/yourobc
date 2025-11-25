// convex/schema/yourobc/shipments/schemas.ts
// Schema exports for shipments module

import { v } from 'convex/values';
import { shipmentStatusHistoryTable, shipmentsTable } from './tables';

export const shipmentIdSchema = v.id('yourobcShipments')
export const shipmentStatusHistoryIdSchema = v.id('yourobcShipmentStatusHistory')

export const yourobcShipmentsSchemas = {
  yourobcShipments: shipmentsTable,
  yourobcShipmentStatusHistory: shipmentStatusHistoryTable,
};
