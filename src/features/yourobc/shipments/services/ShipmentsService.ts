// src/features/yourobc/shipments/services/ShipmentsService.ts

import { useQuery, useSuspenseQuery, useMutation, useQueryClient, skipToken } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateShipmentData,
  UpdateShipmentData,
  Address,
  Dimensions,
  CurrencyAmount,
  ShipmentSearchFilters,
  ShipmentFormData,
  StatusUpdateFormData,
  Shipment,
} from '../types'
import { SHIPMENT_CONSTANTS } from '../types'

type ShipmentListOptions = {
  limit?: number
  cursor?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: ShipmentSearchFilters
}

export class ShipmentsService {
  private normalizeFilters(filters?: ShipmentSearchFilters) {
    if (!filters) return undefined

    const { status, serviceType, priority, customerId, assignedCourierId, employeeId, partnerId, search, dateFrom, dateTo } =
      filters

    return {
      status,
      serviceType,
      priority,
      customerId: Array.isArray(customerId) ? customerId[0] : customerId,
      assignedCourierId: Array.isArray(assignedCourierId) ? assignedCourierId[0] : assignedCourierId,
      employeeId,
      partnerId: Array.isArray(partnerId) ? partnerId[0] : partnerId,
      search,
      dateFrom,
      dateTo,
    }
  }

  getShipmentsQueryOptions(options?: ShipmentListOptions) {
    return convexQuery(api.lib.yourobc.shipments.queries.getShipments, {
      limit: options?.limit,
      cursor: options?.cursor,
      filters: this.normalizeFilters(options?.filters),
    })
  }

  getShipmentQueryOptions(shipmentId: Id<'yourobcShipments'>) {
    return convexQuery(api.lib.yourobc.shipments.queries.getShipment, { shipmentId })
  }

  getShipmentStatusHistoryQueryOptions(shipmentId: Id<'yourobcShipments'>) {
    return convexQuery(api.lib.yourobc.shipments.queries.getShipmentStatusHistory, { shipmentId })
  }

  getShipmentStatsQueryOptions() {
    return convexQuery(api.lib.yourobc.shipments.queries.getShipmentStats, {})
  }

  getOverdueShipmentsQueryOptions(options?: { limit?: number }) {
    return this.getShipmentsQueryOptions({
      ...options,
      filters: {
        status: [
          SHIPMENT_CONSTANTS.STATUS.PICKUP,
          SHIPMENT_CONSTANTS.STATUS.IN_TRANSIT,
          SHIPMENT_CONSTANTS.STATUS.CUSTOMS,
        ],
      },
    })
  }

  getShipmentsByCustomerQueryOptions(customerId: Id<'yourobcCustomers'>, limit = 20) {
    return convexQuery(api.lib.yourobc.shipments.queries.getShipmentsByCustomer, {
      customerId,
      limit,
    })
  }

  getShipmentsByCourierQueryOptions(courierId: Id<'yourobcCouriers'>, limit = 20) {
    return convexQuery(api.lib.yourobc.shipments.queries.getShipmentsByCourier, {
      courierId,
      limit,
    })
  }

  getShipmentsByEmployeeQueryOptions(employeeId: Id<'yourobcEmployees'>) {
    return convexQuery(api.lib.yourobc.shipments.queries.getShipmentsByEmployee, {
      employeeId,
    })
  }

  // Query hooks for shipment data fetching
  useShipments(options?: ShipmentListOptions) {
    return useSuspenseQuery({
      ...this.getShipmentsQueryOptions(options),
      staleTime: 300000, // 5 minutes
    })
  }

  useShipment(shipmentId?: Id<'yourobcShipments'>) {
    return useQuery(
      shipmentId
        ? {
            ...this.getShipmentQueryOptions(shipmentId),
            staleTime: 300000,
          }
        : skipToken
    )
  }

  useShipmentsByCustomer(customerId?: Id<'yourobcCustomers'>, limit = 20) {
    return useQuery(
      customerId
        ? {
            ...this.getShipmentsByCustomerQueryOptions(customerId, limit),
            staleTime: 300000,
          }
        : skipToken
    )
  }

  useShipmentsByCourier(courierId?: Id<'yourobcCouriers'>, limit = 20) {
    return useQuery(
      courierId
        ? {
            ...this.getShipmentsByCourierQueryOptions(courierId, limit),
            staleTime: 300000,
          }
        : skipToken
    )
  }

  useShipmentStats() {
    return useSuspenseQuery({
      ...this.getShipmentStatsQueryOptions(),
      staleTime: 60000,
    })
  }

  useShipmentStatusHistory(shipmentId?: Id<'yourobcShipments'>) {
    return useQuery(
      shipmentId
        ? {
            ...this.getShipmentStatusHistoryQueryOptions(shipmentId),
            staleTime: 30000,
          }
        : skipToken
    )
  }

  useSearchShipments(searchTerm: string, limit = 20) {
    return useQuery({
      ...this.getShipmentsQueryOptions({
        limit,
        filters: { search: searchTerm.length >= 2 ? searchTerm : undefined },
      }),
      staleTime: 30000,
      enabled: searchTerm.length >= 2,
    })
  }

  useOverdueShipments(limit = 50) {
    return useQuery({
      ...this.getOverdueShipmentsQueryOptions({ limit }),
      staleTime: 60000,
    })
  }

  // Mutation hooks for shipment modifications
  useCreateShipment() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.shipments.mutations.createShipment),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: this.getShipmentsQueryOptions().queryKey })
        queryClient.invalidateQueries({ queryKey: this.getShipmentStatsQueryOptions().queryKey })
      },
    })
  }

  useUpdateShipment() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.shipments.mutations.updateShipment),
      onSuccess: (_, { shipmentId }) => {
        if (shipmentId) {
          queryClient.invalidateQueries({ queryKey: this.getShipmentQueryOptions(shipmentId as Id<'yourobcShipments'>).queryKey })
          queryClient.invalidateQueries({ queryKey: this.getShipmentStatusHistoryQueryOptions(shipmentId as Id<'yourobcShipments'>).queryKey })
        }
        queryClient.invalidateQueries({ queryKey: this.getShipmentsQueryOptions().queryKey })
      },
    })
  }

  useUpdateShipmentStatus() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.shipments.mutations.updateShipmentStatus),
      onSuccess: (_, { shipmentId }) => {
        if (shipmentId) {
          queryClient.invalidateQueries({ queryKey: this.getShipmentQueryOptions(shipmentId as Id<'yourobcShipments'>).queryKey })
          queryClient.invalidateQueries({ queryKey: this.getShipmentStatusHistoryQueryOptions(shipmentId as Id<'yourobcShipments'>).queryKey })
        }
      },
    })
  }

  useAssignCourier() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.shipments.mutations.assignCourier),
      onSuccess: (_, { shipmentId }) => {
        if (shipmentId) {
          queryClient.invalidateQueries({ queryKey: this.getShipmentQueryOptions(shipmentId as Id<'yourobcShipments'>).queryKey })
        }
      },
    })
  }

  useDeleteShipment() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.shipments.mutations.deleteShipment),
      onSuccess: (_, { shipmentId }) => {
        queryClient.invalidateQueries({ queryKey: this.getShipmentsQueryOptions().queryKey })
        if (shipmentId) {
          queryClient.removeQueries({ queryKey: this.getShipmentQueryOptions(shipmentId as Id<'yourobcShipments'>).queryKey })
        }
      },
    })
  }

  // Business operations using mutations
  async createShipment(
    mutation: ReturnType<typeof this.useCreateShipment>,
    data: CreateShipmentData
  ) {
    try {
      return await mutation.mutateAsync({ data })
    } catch (error: any) {
      throw new Error(`Failed to create shipment: ${error.message}`)
    }
  }

  async updateShipment(
    mutation: ReturnType<typeof this.useUpdateShipment>,
    shipmentId: Id<'yourobcShipments'>,
    data: UpdateShipmentData
  ) {
    try {
      return await mutation.mutateAsync({ shipmentId, updates: data })
    } catch (error: any) {
      throw new Error(`Failed to update shipment: ${error.message}`)
    }
  }

  async updateShipmentStatus(
    mutation: ReturnType<typeof this.useUpdateShipmentStatus>,
    shipmentId: Id<'yourobcShipments'>,
    statusData: StatusUpdateFormData
  ) {
    try {
      return await mutation.mutateAsync({
        shipmentId,
        status: statusData.status,
        location: statusData.location,
        notes: statusData.notes,
        metadata: statusData.metadata,
      })
    } catch (error: any) {
      throw new Error(`Failed to update shipment status: ${error.message}`)
    }
  }

  async assignCourier(
    mutation: ReturnType<typeof this.useAssignCourier>,
    shipmentId: Id<'yourobcShipments'>,
    courierId: Id<'yourobcCouriers'>,
    instructions?: string
  ) {
    try {
      return await mutation.mutateAsync({
        shipmentId,
        courierId,
        instructions,
      })
    } catch (error: any) {
      throw new Error(`Failed to assign courier: ${error.message}`)
    }
  }

  async deleteShipment(
    mutation: ReturnType<typeof this.useDeleteShipment>,
    shipmentId: Id<'yourobcShipments'>
  ) {
    try {
      return await mutation.mutateAsync({ shipmentId })
    } catch (error: any) {
      throw new Error(`Failed to delete shipment: ${error.message}`)
    }
  }

  // Utility functions for data processing
  formatShipmentNumber(shipment: { shipmentNumber: string; serviceType: string }): string {
    return `${shipment.serviceType}-${shipment.shipmentNumber}`
  }

  formatAddress(address: Address): string {
    const parts = [address.street, address.city, address.country].filter(Boolean)
    return parts.join(', ')
  }

  formatDimensions(dimensions: Dimensions): string {
    const { length, width, height, weight, unit, weightUnit } = dimensions
    return `${length}×${width}×${height} ${unit}, ${weight} ${weightUnit}`
  }

  formatCurrency(amount: CurrencyAmount): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: amount.currency,
    })
    return formatter.format(amount.amount)
  }

  calculateSLA(deadline: number, currentStatus: string): {
    status: 'on_time' | 'warning' | 'overdue'
    remainingHours: number | null
  } {
    const now = Date.now()
    const remainingHours = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60)))
    const warningThreshold = 24 // hours

    let status: 'on_time' | 'warning' | 'overdue' = 'on_time'
    
    if (['delivered', 'invoiced', 'cancelled'].includes(currentStatus)) {
      status = now <= deadline ? 'on_time' : 'overdue'
    } else if (now > deadline) {
      status = 'overdue'
    } else if (remainingHours <= warningThreshold) {
      status = 'warning'
    }

    return {
      status,
      remainingHours: remainingHours > 0 ? remainingHours : null,
    }
  }

  getStatusColor(status: string): string {
    const colors = {
      quoted: '#6b7280',
      booked: '#3b82f6',
      pickup: '#f59e0b',
      in_transit: '#8b5cf6',
      delivered: '#10b981',
      document: '#06b6d4',
      invoiced: '#22c55e',
      cancelled: '#ef4444',
    }
    return colors[status as keyof typeof colors] || '#6b7280'
  }

  getPriorityColor(priority: string): string {
    const colors = {
      standard: '#6b7280',
      urgent: '#f59e0b',
      critical: '#ef4444',
    }
    return colors[priority as keyof typeof colors] || '#6b7280'
  }

  getSLAColor(slaStatus: string): string {
    const colors = {
      on_time: '#10b981',
      warning: '#f59e0b',
      overdue: '#ef4444',
    }
    return colors[slaStatus as keyof typeof colors] || '#6b7280'
  }

  validateShipmentData(data: Partial<ShipmentFormData>): string[] {
    const errors: string[] = []

    // Basic validation
    if (data.description !== undefined && !data.description?.trim()) {
      errors.push('Description is required')
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }

    if (data.deadline && data.deadline <= Date.now()) {
      errors.push('Deadline must be in the future')
    }

    // Address validation
    if (data.origin) {
      const originErrors = this.validateAddress(data.origin, 'origin')
      errors.push(...originErrors)
    }

    if (data.destination) {
      const destinationErrors = this.validateAddress(data.destination, 'destination')
      errors.push(...destinationErrors)
    }

    // Dimensions validation
    if (data.dimensions) {
      const dimensionsErrors = this.validateDimensions(data.dimensions)
      errors.push(...dimensionsErrors)
    }

    // Price validation
    if (data.agreedPrice) {
      const priceErrors = this.validateCurrencyAmount(data.agreedPrice, 'agreed price')
      errors.push(...priceErrors)
    }

    return errors
  }

  private validateAddress(address: Partial<Address>, fieldName: string): string[] {
    const errors: string[] = []

    if (!address.city?.trim()) {
      errors.push(`${fieldName} city is required`)
    }

    if (!address.country?.trim()) {
      errors.push(`${fieldName} country is required`)
    }

    if (!address.countryCode?.trim()) {
      errors.push(`${fieldName} country code is required`)
    }

    return errors
  }

  private validateDimensions(dimensions: Partial<Dimensions>): string[] {
    const errors: string[] = []

    if (dimensions.length !== undefined && (dimensions.length < 0.1 || dimensions.length > 10000)) {
      errors.push('Length must be between 0.1 and 10000')
    }

    if (dimensions.width !== undefined && (dimensions.width < 0.1 || dimensions.width > 10000)) {
      errors.push('Width must be between 0.1 and 10000')
    }

    if (dimensions.height !== undefined && (dimensions.height < 0.1 || dimensions.height > 10000)) {
      errors.push('Height must be between 0.1 and 10000')
    }

    if (dimensions.weight !== undefined && (dimensions.weight < 0.1 || dimensions.weight > 1000)) {
      errors.push('Weight must be between 0.1 and 1000')
    }

    return errors
  }

  private validateCurrencyAmount(amount: Partial<CurrencyAmount>, fieldName: string): string[] {
    const errors: string[] = []

    if (amount.amount !== undefined && amount.amount < 0) {
      errors.push(`${fieldName} amount cannot be negative`)
    }

    if (amount.exchangeRate !== undefined && amount.exchangeRate <= 0) {
      errors.push(`${fieldName} exchange rate must be positive`)
    }

    return errors
  }

  canUpdateShipmentStatus(currentStatus: string, newStatus: string): boolean {
    const statusFlow: Record<string, string[]> = {
      quoted: ['booked', 'cancelled'],
      booked: ['pickup', 'cancelled'],
      pickup: ['in_transit', 'cancelled'],
      in_transit: ['delivered', 'cancelled'],
      delivered: ['document'],
      document: ['invoiced'],
      invoiced: [],
      cancelled: [],
    }

    return statusFlow[currentStatus]?.includes(newStatus) || false
  }

  calculateDeliveryTime(shipment: {
    completedAt?: number
    createdAt: number
    currentStatus: string
  }): number | null {
    if (!shipment.completedAt || shipment.currentStatus !== 'delivered') {
      return null
    }

    return Math.ceil((shipment.completedAt - shipment.createdAt) / (1000 * 60 * 60)) // Hours
  }

  isShipmentOverdue(shipment: { sla: { deadline: number; status: string } }): boolean {
    return shipment.sla.status === 'overdue'
  }

  isShipmentActive(shipment: { currentStatus: string }): boolean {
    return !['delivered', 'invoiced', 'cancelled'].includes(shipment.currentStatus)
  }
}

export const shipmentsService = new ShipmentsService()
