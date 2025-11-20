// src/features/yourobc/couriers/hooks/useCouriers.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { couriersService } from '../services/CouriersService'
import { parseConvexError, type ParsedError } from '@/utils/errorHandling'
import { COURIER_CONSTANTS } from '../types'
import type {
  CreateCourierData,
  UpdateCourierData,
  CourierFormData,
  CommissionFormData,
  CourierId,
  CommissionId,
  CourierListItem,
  CourierInsights,
  CourierPerformanceMetrics,
  ShipmentId,
} from '../types'
import { CourierListOptions, PaymentMethod } from '@/convex/lib/yourobc'

/**
 * Main hook for courier management
 */
export function useCouriers(options?: CourierListOptions & { autoRefresh?: boolean }) {
  const authUser = useAuthenticatedUser()

  const {
    data: couriersQuery,
    isPending,
    error,
    refetch,
  } = couriersService.useCouriers(authUser?.id!, options)

  const {
    data: stats,
    isPending: isStatsLoading,
  } = couriersService.useCourierStats(authUser?.id!)

  const createMutation = couriersService.useCreateCourier()
  const updateMutation = couriersService.useUpdateCourier()
  const deleteMutation = couriersService.useDeleteCourier()

  // Parse error for better user experience
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null
  }, [error])

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED'

  const createCourier = useCallback(async (courierData: CourierFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = couriersService.validateCourierData(courierData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateCourierData = {
      firstName: courierData.firstName.trim(),
      middleName: courierData.middleName?.trim(),
      lastName: courierData.lastName.trim(),
      email: courierData.email?.trim(),
      phone: courierData.phone.trim(),
      skills: courierData.skills,
      currentLocation: courierData.currentLocation,
      timezone: courierData.timezone || COURIER_CONSTANTS.DEFAULT_VALUES.TIMEZONE,
    }

    return await couriersService.createCourier(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updateCourier = useCallback(async (
    courierId: CourierId,
    updates: Partial<CourierFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = couriersService.validateCourierData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const updateData: UpdateCourierData = {}
    if (updates.firstName !== undefined) updateData.firstName = updates.firstName.trim()
    if (updates.middleName !== undefined) updateData.middleName = updates.middleName?.trim()
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName.trim()
    if (updates.email !== undefined) updateData.email = updates.email?.trim()
    if (updates.phone !== undefined) updateData.phone = updates.phone.trim()
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive
    if (updates.isOnline !== undefined) updateData.isOnline = updates.isOnline
    if (updates.skills !== undefined) updateData.skills = updates.skills
    if (updates.currentLocation !== undefined) updateData.currentLocation = updates.currentLocation
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone

    return await couriersService.updateCourier(updateMutation, authUser.id, courierId, updateData)
  }, [authUser, updateMutation])

  const deleteCourier = useCallback(async (courierId: CourierId) => {
    if (!authUser) throw new Error('Authentication required')
    return await couriersService.deleteCourier(deleteMutation, authUser.id, courierId)
  }, [authUser, deleteMutation])

  const canCreateCouriers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canEditCouriers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canDeleteCouriers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const enrichedCouriers = useMemo(() => {
    const couriers = couriersQuery?.couriers || []
    return couriers.map((courier): CourierListItem => ({
      ...courier,
      displayName: couriersService.formatCourierName(courier),
      formattedLocation: couriersService.formatCourierLocation(courier.currentLocation),
      rating: couriersService.calculateCourierRating({
        totalShipments: 0,
        completedShipments: 0,
        onTimeDeliveries: 0,
      }),
      hasRecentActivity: courier.workStatus?.lastLogin
        ? (Date.now() - courier.workStatus.lastLogin) < (24 * 60 * 60 * 1000)
        : false,
      isHighPerformer: false,
    }))
  }, [couriersQuery])

  // Calculate stats with proper defaults
  const enrichedStats = useMemo(() => {
    if (!stats) return null
    
    return {
      ...stats,
      availableCouriers: stats.couriersByStatus?.available || 0,
      busyCouriers: stats.couriersByStatus?.busy || 0,
      totalShipments: 0,
      onTimeDeliveryRate: 0,
      totalCommissions: 0,
      pendingCommissions: 0,
    }
  }, [stats])

  return {
    couriers: enrichedCouriers,
    total: couriersQuery?.total || 0,
    hasMore: couriersQuery?.hasMore || false,
    stats: enrichedStats,
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    createCourier,
    updateCourier,
    deleteCourier,
    refetch,
    canCreateCouriers,
    canEditCouriers,
    canDeleteCouriers,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single courier
 */
export function useCourier(courierId?: CourierId) {

  if (!courierId) {
    return {
      courier: null,
      courierInsights: null,
      courierMetrics: null,
      isLoading: false,
      error: null,
      refetch: async () => {},
    }
  }
  
  const authUser = useAuthenticatedUser()

  const {
    data: courier,
    isPending,
    error,
    refetch,
  } = couriersService.useCourier(authUser?.id!, courierId)

  const courierInsights = useMemo((): CourierInsights | null => {
    if (!courier) return null

    const rating = couriersService.calculateCourierRating({
      totalShipments: 0,
      completedShipments: 0,
      onTimeDeliveries: 0,
    })
    
    const daysSinceCreated = Math.floor(
      (Date.now() - (courier.createdAt || Date.now())) / (24 * 60 * 60 * 1000)
    )
    
    const daysSinceLastActivity = courier.workStatus?.lastLogin
      ? Math.floor((Date.now() - courier.workStatus.lastLogin) / (24 * 60 * 60 * 1000))
      : null

    return {
      rating,
      courierAge: daysSinceCreated,
      daysSinceLastActivity,
      needsAttention: daysSinceLastActivity !== null && daysSinceLastActivity > 7,
      isNewCourier: daysSinceCreated <= 30,
      isTopPerformer: rating.score >= 80,
    }
  }, [courier])

  // Mock courier metrics (would come from actual shipment queries)
  const courierMetrics = useMemo((): CourierPerformanceMetrics | null => {
    if (!courier) return null

    return {
      totalShipments: 0,
      completedShipments: 0,
      onTimeDeliveries: 0,
      averageRating: 0,
      totalCommissions: 0,
      pendingCommissions: 0,
    }
  }, [courier])

  return {
    courier,
    courierInsights,
    courierMetrics,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for available couriers search
 */
export function useAvailableCouriers(
  serviceType?: 'OBC' | 'NFO',
  requiredLanguages?: string[],
  limit = 50
) {
  const authUser = useAuthenticatedUser()

  const {
    data: couriers,
    isPending,
    error,
  } = couriersService.useAvailableCouriers(
    authUser?.id!,
    serviceType,
    requiredLanguages,
    limit
  )

  return {
    couriers: couriers || [],
    isLoading: isPending,
    error,
    hasResults: (couriers || []).length > 0,
  }
}

/**
 * Hook for courier search
 */
export function useCourierSearch(searchTerm: string) {
  const authUser = useAuthenticatedUser()

  const {
    data: searchResults,
    isPending,
    error,
  } = couriersService.useSearchCouriers(authUser?.id!, searchTerm)

  return {
    results: searchResults || [],
    isLoading: isPending,
    error,
    hasResults: (searchResults?.length || 0) > 0,
  }
}

/**
 * Hook for courier form management
 */
export function useCourierForm(initialData?: Partial<CourierFormData>) {
  const [formData, setFormData] = useState<CourierFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    skills: {
      languages: [],
      availableServices: [],
    },
    timezone: COURIER_CONSTANTS.DEFAULT_VALUES.TIMEZONE,
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
    const validationErrors = couriersService.validateCourierData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('First name')) errorMap.firstName = error
      else if (error.includes('Last name')) errorMap.lastName = error
      else if (error.includes('phone')) errorMap.phone = error
      else if (error.includes('email')) errorMap.email = error
      else if (error.includes('languages')) errorMap['skills.languages'] = error
      else if (error.includes('service')) errorMap['skills.availableServices'] = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: CourierFormData = {
      firstName: '',
      lastName: '',
      phone: '',
      skills: { languages: [], availableServices: [] },
      timezone: COURIER_CONSTANTS.DEFAULT_VALUES.TIMEZONE,
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

/**
 * Hook for commission management
 */
export function useCourierCommissions(
  courierId?: CourierId,
  dateRange?: { start: number; end: number }
) {
  const authUser = useAuthenticatedUser()

  const {
    data: commissionsData,
    isPending,
    error,
    refetch,
  } = couriersService.useCourierCommissions(authUser?.id!, courierId, dateRange)

  const createMutation = couriersService.useCreateCommission()
  const markPaidMutation = couriersService.useMarkCommissionPaid()

  const createCommission = useCallback(async (commissionData: CommissionFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = couriersService.validateCommissionData({
      rate: commissionData.rate,
      baseAmount: commissionData.baseAmount,
      type: commissionData.type,
    })
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const commissionAmount =
      commissionData.type === 'percentage'
        ? Math.round((commissionData.baseAmount * commissionData.rate / 100) * 100) / 100
        : commissionData.rate

    const createData = {
      courierId: commissionData.courierId as CourierId,
      shipmentId: commissionData.shipmentId as ShipmentId,
      type: commissionData.type,
      rate: commissionData.rate,
      baseAmount: commissionData.baseAmount,
      commissionAmount,
      currency: commissionData.currency,
    }

    return await couriersService.createCommission(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const markCommissionPaid = useCallback(async (
    commissionId: CommissionId,
    paymentReference?: string,
    paymentMethod?: PaymentMethod
  ) => {
    if (!authUser) throw new Error('Authentication required')

    return await couriersService.markCommissionPaid(
      markPaidMutation,
      authUser.id,
      commissionId,
      paymentReference,
      paymentMethod
    )
  }, [authUser, markPaidMutation])

  // Normalize summary data
  const summary = useMemo(() => {
    if (!commissionsData?.summary) return null
    
    const rawSummary = commissionsData.summary
    
    return {
      totalCommissions: rawSummary.totalCommissions || 0,
      totalPending: rawSummary.totalPending || 0,
      totalPaid: rawSummary.totalPaid || 0,
      totalEarnings: rawSummary.totalEarnings || 0,
      pendingCount: commissionsData.commissions.filter(c => c.status === 'pending').length,
      paidCount: commissionsData.commissions.filter(c => c.status === 'paid').length,
      pendingCommissions: rawSummary.totalPending || 0,
      paidCommissions: rawSummary.totalPaid || 0,
    }
  }, [commissionsData])

  return {
    commissions: commissionsData?.commissions || [],
    summary,
    isLoading: isPending,
    error,
    refetch,
    createCommission,
    markCommissionPaid,
    isCreating: createMutation.isPending,
    isMarkingPaid: markPaidMutation.isPending,
  }
}