// convex/lib/yourobc/couriers/types.ts
// convex/yourobc/couriers/types.ts

import type { Doc, Id } from '../../../_generated/dataModel';
import type { TimeEntry } from '../shared';
import { ShipmentId } from '../shipments';

export type Courier = Doc<'yourobcCouriers'>;
export type CourierId = Id<'yourobcCouriers'>;
export type Commission = Doc<'yourobcCommissions'>;
export type CommissionId = Id<'yourobcCommissions'>;


export interface Skills {
  languages: string[];
  maxCarryWeight?: number;
  availableServices: ('OBC' | 'NFO')[];
  certifications?: string[];
}

export interface Location {
  country: string;
  countryCode: string;
  city?: string;
}

export interface CreateCourierData {
  userProfileId?: Id<'userProfiles'>;
  authUserId?: string;
  courierNumber?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone: string;
  skills: Skills;
  currentLocation?: Location;
  timezone?: string;
}

export interface UpdateCourierData {
  courierNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: 'available' | 'busy' | 'offline' | 'vacation';
  isActive?: boolean;
  isOnline?: boolean;
  skills?: Skills;
  currentLocation?: Location;
  timezone?: string;
}

export interface CourierFilters {
  status?: ('available' | 'busy' | 'offline' | 'vacation')[];
  isActive?: boolean;
  isOnline?: boolean;
  languages?: string[];
  services?: ('OBC' | 'NFO')[];
  location?: string[];
  search?: string;
}

export interface CourierListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'courierNumber' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  filters?: CourierFilters;
}

export interface CourierStats {
  totalCouriers: number;
  activeCouriers: number;
  onlineCouriers: number;
  couriersByStatus: Record<string, number>;
  couriersByLocation: Record<string, number>;
  avgShipmentsPerCourier: number;
}

export interface CreateCommissionData {
  employeeId: Id<'yourobcCouriers'>;
  shipmentId: ShipmentId;
  type: 'percentage' | 'fixed';
  rate: number;
  baseAmount: number;
  commissionAmount: number;
}
