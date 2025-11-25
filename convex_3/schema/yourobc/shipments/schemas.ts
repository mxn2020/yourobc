// convex/schema/yourobc/shipments/schemas.ts
// Schema exports for shipments module

import { v } from 'convex/values';
import { shipmentsTable } from './shipments';
import { shipmentStatusHistoryTable } from './shipmentStatusHistory';

export const shipmentIdSchema = v.id('yourobcShipments')
export const shipmentStatusHistoryIdSchema = v.id('yourobcShipmentStatusHistory')

export const yourobcShipmentsSchemas = {
  yourobcShipments: shipmentsTable,
  yourobcShipmentStatusHistory: shipmentStatusHistoryTable,
};
