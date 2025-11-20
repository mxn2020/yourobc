// src/features/yourobc/shipments/hooks/useShipments.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { shipmentsService } from '../services/ShipmentsService'
import { parseConvexError, type ParsedError } from '@/utils/errorHandling'
import { SHIPMENT_CONSTANTS } from '../types'
import type {
  CreateShipmentData,
  UpdateShipmentData,
  ShipmentFormData,
  StatusUpdateFormData,
  ShipmentId,
  ShipmentListItem,
  ShipmentInsights,
  ShipmentMetrics,
  ShipmentSearchFilters,
  ShipmentWithDetails,
} from '../types'
import type { Id } from '@/convex/_generated/dataModel'

/**
 * Main hook for shipment management
 */
export function useShipments(options?: {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: ShipmentSearchFilters
  autoRefresh?: boolean
}) {
  const authUser = useAuthenticatedUser()

  const {
    data: shipmentsQuery,
    isPending,
    error,
    refetch,
  } = shipmentsService.useShipments(authUser?.id!, options)

  const {
    data: stats,
    isPending: isStatsLoading,
  } = shipmentsService.useShipmentStats(authUser?.id!)

  const createMutation = shipmentsService.useCreateShipment()
  const updateMutation = shipmentsService.useUpdateShipment()
  const updateStatusMutation = shipmentsService.useUpdateShipmentStatus()
  const assignCourierMutation = shipmentsService.useAssignCourier()
  const deleteMutation = shipmentsService.useDeleteShipment()

  // Parse error for better user experience
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null
  }, [error])

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED'

  const createShipment = useCallback(async (shipmentData: ShipmentFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = shipmentsService.validateShipmentData(shipmentData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateShipmentData = {
      customerId: shipmentData.customerId,
      serviceType: shipmentData.serviceType,
      priority: shipmentData.priority || SHIPMENT_CONSTANTS.DEFAULT_VALUES.PRIORITY,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      dimensions: shipmentData.dimensions,
      description: shipmentData.description.trim(),
      specialInstructions: shipmentData.specialInstructions?.trim(),
      deadline: shipmentData.deadline,
      agreedPrice: shipmentData.agreedPrice,
      shipmentNumber: shipmentData.shipmentNumber,
      awbNumber: shipmentData.awbNumber,
      customerReference: shipmentData.customerReference?.trim(),
      quoteId: shipmentData.quoteId,
      assignedCourierId: shipmentData.assignedCourierId,
      courierInstructions: shipmentData.courierInstructions?.trim(),
      partnerId: shipmentData.partnerId,
      partnerReference: shipmentData.partnerReference?.trim(),
      routing: shipmentData.routing,
      actualCosts: shipmentData.actualCosts,
    }

    return await shipmentsService.createShipment(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updateShipment = useCallback(async (
    shipmentId: ShipmentId,
    updates: Partial<ShipmentFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = shipmentsService.validateShipmentData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const updateData: UpdateShipmentData = {}
    if (updates.shipmentNumber !== undefined) updateData.shipmentNumber = updates.shipmentNumber
    if (updates.awbNumber !== undefined) updateData.awbNumber = updates.awbNumber
    if (updates.customerReference !== undefined) updateData.customerReference = updates.customerReference?.trim()
    if (updates.serviceType !== undefined) updateData.serviceType = updates.serviceType
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.origin !== undefined) updateData.origin = updates.origin
    if (updates.destination !== undefined) updateData.destination = updates.destination
    if (updates.dimensions !== undefined) updateData.dimensions = updates.dimensions
    if (updates.description !== undefined) updateData.description = updates.description?.trim()
    if (updates.specialInstructions !== undefined) updateData.specialInstructions = updates.specialInstructions?.trim()
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline
    if (updates.assignedCourierId !== undefined) updateData.assignedCourierId = updates.assignedCourierId
    if (updates.courierInstructions !== undefined) updateData.courierInstructions = updates.courierInstructions?.trim()
    if (updates.partnerId !== undefined) updateData.partnerId = updates.partnerId
    if (updates.partnerReference !== undefined) updateData.partnerReference = updates.partnerReference?.trim()
    if (updates.routing !== undefined) updateData.routing = updates.routing
    if (updates.agreedPrice !== undefined) updateData.agreedPrice = updates.agreedPrice
    if (updates.actualCosts !== undefined) updateData.actualCosts = updates.actualCosts

    return await shipmentsService.updateShipment(updateMutation, authUser.id, shipmentId, updateData)
  }, [authUser, updateMutation])

  const updateShipmentStatus = useCallback(async (
    shipmentId: ShipmentId,
    statusData: StatusUpdateFormData
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await shipmentsService.updateShipmentStatus(updateStatusMutation, authUser.id, shipmentId, statusData)
  }, [authUser, updateStatusMutation])

  const assignCourier = useCallback(async (
    shipmentId: ShipmentId,
    courierId: Id<'yourobcCouriers'>,
    instructions?: string
  ) => {
    if (!authUser) throw new Error('Authentication required')
    return await shipmentsService.assignCourier(assignCourierMutation, authUser.id, shipmentId, courierId, instructions)
  }, [authUser, assignCourierMutation])

  const deleteShipment = useCallback(async (shipmentId: ShipmentId) => {
    if (!authUser) throw new Error('Authentication required')
    return await shipmentsService.deleteShipment(deleteMutation, authUser.id, shipmentId)
  }, [authUser, deleteMutation])

  const canCreateShipments = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin' || authUser.role === 'manager'
  }, [authUser])

  const canEditShipments = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin' || authUser.role === 'manager'
  }, [authUser])

  const canDeleteShipments = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canUpdateStatus = useMemo(() => {
    if (!authUser) return false
    // Couriers are tracked separately in yourobcCouriers table, not as user roles
    return authUser.role === 'admin' || authUser.role === 'superadmin' || authUser.role === 'manager' || authUser.role === 'operations'
  }, [authUser])

  const canAssignCouriers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin' || authUser.role === 'manager'
  }, [authUser])

  const enrichedShipments = useMemo(() => {
    const shipments = shipmentsQuery?.shipments || []
    return shipments.map((shipment): ShipmentListItem => ({
      ...shipment,
      displayName: shipmentsService.formatShipmentNumber(shipment),
      formattedOrigin: shipmentsService.formatAddress(shipment.origin),
      formattedDestination: shipmentsService.formatAddress(shipment.destination),
      formattedPrice: shipmentsService.formatCurrency(shipment.agreedPrice),
      statusColor: shipmentsService.getStatusColor(shipment.currentStatus),
      priorityColor: shipmentsService.getPriorityColor(shipment.priority),
      slaColor: shipmentsService.getSLAColor(shipment.sla.status),
      overdueHours: shipment.isOverdue ? Math.ceil((Date.now() - shipment.sla.deadline) / (1000 * 60 * 60)) : undefined,
    }))
  }, [shipmentsQuery])

  return {
    shipments: enrichedShipments,
    total: shipmentsQuery?.total || 0,
    hasMore: shipmentsQuery?.hasMore || false,
    stats,
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    createShipment,
    updateShipment,
    updateShipmentStatus,
    assignCourier,
    deleteShipment,
    refetch,
    canCreateShipments,
    canEditShipments,
    canDeleteShipments,
    canUpdateStatus,
    canAssignCouriers,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isAssigning: assignCourierMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single shipment
 */
export function useShipment(shipmentId?: ShipmentId) {
  const authUser = useAuthenticatedUser()

  const {
    data: shipment,
    isPending,
    error,
    refetch,
  } = shipmentsService.useShipment(authUser?.id!, shipmentId)

  const {
    data: statusHistory,
    isPending: isLoadingHistory,
  } = shipmentsService.useShipmentStatusHistory(authUser?.id!, shipmentId)

  const shipmentInsights = useMemo((): ShipmentInsights | null => {
    if (!shipment) return null

    const sla = shipmentsService.calculateSLA(shipment.sla.deadline, shipment.currentStatus)
    const now = Date.now()
    const isUrgent = shipment.priority === 'urgent' || shipment.priority === 'critical'
    const needsAttention = sla.status === 'overdue' || (sla.status === 'warning' && isUrgent)
    
    // Calculate completion progress based on status
    const statusOrder = ['quoted', 'booked', 'pickup', 'in_transit', 'delivered', 'document', 'invoiced']
    const currentIndex = statusOrder.indexOf(shipment.currentStatus)
    const completionProgress = currentIndex >= 0 ? (currentIndex / (statusOrder.length - 1)) * 100 : 0

    return {
      slaStatus: sla.status,
      remainingHours: sla.remainingHours,
      isOverdue: sla.status === 'overdue',
      isUrgent,
      needsAttention,
      estimatedDelivery: null, // Would be calculated based on routing
      completionProgress,
    }
  }, [shipment])

  const shipmentMetrics = useMemo((): ShipmentMetrics | null => {
    if (!shipment) return null

    const deliveryTime = shipmentsService.calculateDeliveryTime(shipment)
    
    return {
      totalShipments: 1,
      activeShipments: shipmentsService.isShipmentActive(shipment) ? 1 : 0,
      completedShipments: shipment.currentStatus === 'delivered' || shipment.currentStatus === 'invoiced' ? 1 : 0,
      avgDeliveryTime: deliveryTime || 0,
      onTimeDeliveryRate: shipment.sla.status === 'on_time' ? 100 : 0,
      totalRevenue: shipment.agreedPrice.amount,
      avgRevenue: shipment.agreedPrice.amount,
    }
  }, [shipment])

  return {
    shipment,
    statusHistory: statusHistory || [],
    shipmentInsights,
    shipmentMetrics,
    isLoading: isPending,
    isLoadingHistory,
    error,
    refetch,
  }
}

/**
 * Hook for searching shipments
 */
export function useShipmentSearch(searchTerm: string) {
  const authUser = useAuthenticatedUser()

  const {
    data: searchResults,
    isPending,
    error,
  } = shipmentsService.useSearchShipments(authUser?.id!, searchTerm)

  return {
    results: searchResults || [],
    isLoading: isPending,
    error,
    hasResults: (searchResults?.length || 0) > 0,
  }
}

/**
 * Hook for overdue shipments
 */
export function useOverdueShipments(limit = 50) {
  const authUser = useAuthenticatedUser()

  const {
    data: overdueShipments,
    isPending,
    error,
    refetch,
  } = shipmentsService.useOverdueShipments(authUser?.id!, limit)

  return {
    shipments: overdueShipments || [],
    isLoading: isPending,
    error,
    refetch,
    hasOverdue: (overdueShipments?.length || 0) > 0,
  }
}

/**
 * Hook for shipment form management
 */
export function useShipmentForm(initialData?: Partial<ShipmentFormData>) {
  const [formData, setFormData] = useState<ShipmentFormData>({
    customerId: '' as Id<'yourobcCustomers'>,
    serviceType: 'OBC',
    priority: SHIPMENT_CONSTANTS.DEFAULT_VALUES.PRIORITY,
    origin: {
      city: '',
      country: '',
      countryCode: '',
    },
    destination: {
      city: '',
      country: '',
      countryCode: '',
    },
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      unit: 'cm',
      weightUnit: 'kg',
    },
    description: '',
    deadline: Date.now() + (24 * 60 * 60 * 1000), // Tomorrow
    agreedPrice: {
      amount: 0,
      currency: SHIPMENT_CONSTANTS.DEFAULT_VALUES.CURRENCY,
    },
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const validationErrors = shipmentsService.validateShipmentData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('Description')) errorMap.description = error
      else if (error.includes('deadline')) errorMap.deadline = error
      else if (error.includes('origin')) errorMap.origin = error
      else if (error.includes('destination')) errorMap.destination = error
      else if (error.includes('dimensions')) errorMap.dimensions = error
      else if (error.includes('price')) errorMap.agreedPrice = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: ShipmentFormData = {
      customerId: '' as Id<'yourobcCustomers'>,
      serviceType: 'OBC',
      priority: SHIPMENT_CONSTANTS.DEFAULT_VALUES.PRIORITY,
      origin: { city: '', country: '', countryCode: '' },
      destination: { city: '', country: '', countryCode: '' },
      dimensions: { length: 0, width: 0, height: 0, weight: 0, unit: 'cm', weightUnit: 'kg' },
      description: '',
      deadline: Date.now() + (24 * 60 * 60 * 1000),
      agreedPrice: { amount: 0, currency: SHIPMENT_CONSTANTS.DEFAULT_VALUES.CURRENCY },
    }
    setFormData(initialData ? { ...defaultFormData, ...initialData } : defaultFormData)
    setErrors({})
    setIsDirty(false)
  }, [initialData])

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    resetForm,
    setFormData,
  }
}