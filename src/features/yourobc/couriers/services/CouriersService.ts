// src/features/yourobc/couriers/services/CouriersService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateCourierData,
  UpdateCourierData,
  CreateCommissionData,
} from '../types'
import { CourierListOptions, CourierId, PaymentMethod } from '@/convex/lib/yourobc'

export class CouriersService {
  // Query hooks for courier data fetching
  useCouriers(authUserId: string, options?: CourierListOptions) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.couriers.queries.getCouriers, {
        authUserId,
        options,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useCourier(authUserId: string, courierId?: CourierId) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.couriers.queries.getCourier, {
        courierId,
        authUserId,
      }),
      staleTime: 300000,
      enabled: !!authUserId && !!courierId,
    })
  }

  useCourierByAuthId(authUserId: string, targetAuthUserId?: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.couriers.queries.getCourierByAuthId, {
        authUserId,
        targetAuthUserId,
      }),
      staleTime: 300000,
      enabled: !!authUserId,
    })
  }

  useAvailableCouriers(
    authUserId: string,
    serviceType?: 'OBC' | 'NFO',
    requiredLanguages?: string[],
    limit = 50
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.couriers.queries.getAvailableCouriers, {
        authUserId,
        serviceType,
        requiredLanguages,
        limit,
      }),
      staleTime: 60000, // 1 minute for availability
      enabled: !!authUserId,
    })
  }

  useCourierStats(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.couriers.queries.getCourierStats, {
        authUserId,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useCourierTimeEntries(
    authUserId: string,
    courierId?: Id<'yourobcCouriers'>,
    dateRange?: { start: number; end: number }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.couriers.queries.getCourierTimeEntries, {
        authUserId,
        courierId,
        dateRange,
      }),
      staleTime: 30000,
      enabled: !!authUserId,
    })
  }

  useSearchCouriers(
    authUserId: string,
    searchTerm: string,
    limit = 20,
    includeInactive = false
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.couriers.queries.searchCouriers, {
        authUserId,
        searchTerm,
        limit,
        includeInactive,
      }),
      staleTime: 30000,
      enabled: !!authUserId && searchTerm.length >= 2,
    })
  }

  // Commission query hooks
  useCommissions(
    authUserId: string,
    filters?: {
      courierId?: Id<'yourobcCouriers'>
      status?: ('pending' | 'paid')[]
      dateRange?: { start: number; end: number }
      limit?: number
      offset?: number
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.couriers.queries.getCommissions, {
        authUserId,
        filters,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useCourierCommissions(
    authUserId: string,
    courierId?: Id<'yourobcCouriers'>,
    dateRange?: { start: number; end: number }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.couriers.queries.getCourierCommissions, {
        authUserId,
        courierId,
        dateRange,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  // Mutation hooks for courier modifications
  useCreateCourier() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.couriers.mutations.createCourier),
    })
  }

  useUpdateCourier() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.couriers.mutations.updateCourier),
    })
  }

  useRecordTimeEntry() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.couriers.mutations.recordCourierTimeEntry),
    })
  }

  useDeleteCourier() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.couriers.mutations.deleteCourier),
    })
  }

  // Commission mutation hooks
  useCreateCommission() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.couriers.mutations.createCommission),
    })
  }

  useMarkCommissionPaid() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.couriers.mutations.markCommissionPaid),
    })
  }

  // Business operations using mutations
  async createCourier(
    mutation: ReturnType<typeof this.useCreateCourier>,
    authUserId: string,
    data: CreateCourierData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create courier: ${error.message}`)
    }
  }

  async updateCourier(
    mutation: ReturnType<typeof this.useUpdateCourier>,
    authUserId: string,
    courierId: Id<'yourobcCouriers'>,
    data: UpdateCourierData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, courierId, data })
    } catch (error: any) {
      throw new Error(`Failed to update courier: ${error.message}`)
    }
  }

  async deleteCourier(
    mutation: ReturnType<typeof this.useDeleteCourier>,
    authUserId: string,
    courierId: Id<'yourobcCouriers'>
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, courierId })
    } catch (error: any) {
      throw new Error(`Failed to delete courier: ${error.message}`)
    }
  }

  async createCommission(
    mutation: ReturnType<typeof this.useCreateCommission>,
    authUserId: string,
    data: CreateCommissionData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create commission: ${error.message}`)
    }
  }

  async markCommissionPaid(
    mutation: ReturnType<typeof this.useMarkCommissionPaid>,
    authUserId: string,
    commissionId: Id<'yourobcCommissions'>,
    paymentReference?: string,
    paymentMethod?: PaymentMethod
  ) {
    try {
      return await mutation.mutateAsync({
        authUserId,
        commissionId,
        paymentReference,
        paymentMethod,
      })
    } catch (error: any) {
      throw new Error(`Failed to mark commission as paid: ${error.message}`)
    }
  }

  // Utility functions for data processing
  formatCourierName(courier: {
    firstName: string
    middleName?: string
    lastName: string
    courierNumber?: string
  }): string {
    const nameParts = [
      courier.firstName,
      courier.middleName,
      courier.lastName,
    ].filter(Boolean)

    return nameParts.length > 0
      ? nameParts.join(' ')
      : `Courier ${courier.courierNumber || 'Unknown'}`
  }

  formatCourierLocation(location?: {
    city?: string
    country: string
    countryCode: string
  }): string {
    if (!location) return 'Unknown'

    return location.city
      ? `${location.city}, ${location.country}`
      : location.country
  }

  calculateCourierRating(stats: {
    totalShipments: number
    completedShipments: number
    onTimeDeliveries: number
  }): {
    rating: 'excellent' | 'good' | 'average' | 'poor'
    score: number
  } {
    const { totalShipments, completedShipments, onTimeDeliveries } = stats
    
    if (totalShipments === 0) {
      return { rating: 'poor', score: 0 }
    }

    let score = 0

    // Completion rate (50% of score)
    const completionRate = (completedShipments / totalShipments) * 100
    if (completionRate >= 95) score += 50
    else if (completionRate >= 85) score += 40
    else if (completionRate >= 75) score += 30
    else if (completionRate >= 60) score += 20
    else score += 10

    // On-time delivery rate (50% of score)
    const onTimeRate = completedShipments > 0 
      ? (onTimeDeliveries / completedShipments) * 100 
      : 0
    if (onTimeRate >= 95) score += 50
    else if (onTimeRate >= 85) score += 40
    else if (onTimeRate >= 75) score += 30
    else if (onTimeRate >= 60) score += 20
    else score += 10

    let rating: 'excellent' | 'good' | 'average' | 'poor'
    if (score >= 80) rating = 'excellent'
    else if (score >= 60) rating = 'good'
    else if (score >= 40) rating = 'average'
    else rating = 'poor'

    return { rating, score }
  }

  validateCourierData(data: Partial<CreateCourierData | UpdateCourierData>): string[] {
    const errors: string[] = []

    // Name validation
    if (data.firstName !== undefined && !data.firstName?.trim()) {
      errors.push('First name is required')
    }

    if (data.firstName && data.firstName.length > 100) {
      errors.push('First name must be less than 100 characters')
    }

    if (data.lastName !== undefined && !data.lastName?.trim()) {
      errors.push('Last name is required')
    }

    if (data.lastName && data.lastName.length > 100) {
      errors.push('Last name must be less than 100 characters')
    }

    if (data.middleName && data.middleName.length > 100) {
      errors.push('Middle name must be less than 100 characters')
    }

    // Contact validation
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format')
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email address')
    }

    // Skills validation
    if (data.skills) {
      if (data.skills.languages && data.skills.languages.length === 0) {
        errors.push('At least one language must be selected')
      }

      if (data.skills.languages && data.skills.languages.length > 10) {
        errors.push('Maximum 10 languages allowed')
      }

      if (data.skills.certifications && data.skills.certifications.length > 20) {
        errors.push('Maximum 20 certifications allowed')
      }

      if (data.skills.maxCarryWeight && data.skills.maxCarryWeight > 50) {
        errors.push('Maximum carry weight cannot exceed 50kg')
      }

      if (data.skills.availableServices && data.skills.availableServices.length === 0) {
        errors.push('At least one service type must be selected')
      }
    }

    // Location validation
    if (data.currentLocation) {
      if (!data.currentLocation.country?.trim()) {
        errors.push('Country is required for location')
      }

      if (!data.currentLocation.countryCode?.trim()) {
        errors.push('Country code is required for location')
      }
    }

    return errors
  }

  validateCommissionData(data: {
    rate: number
    baseAmount: number
    type: 'percentage' | 'fixed'
    commissionAmount?: number
  }): string[] {
    const errors: string[] = []

    if (data.rate < 0 || data.rate > 100) {
      errors.push('Commission rate must be between 0 and 100')
    }

    if (data.baseAmount <= 0) {
      errors.push('Base amount must be greater than 0')
    }

    if (data.type === 'percentage' && data.commissionAmount !== undefined) {
      const expectedCommission = Math.round((data.baseAmount * data.rate / 100) * 100) / 100
      if (Math.abs(data.commissionAmount - expectedCommission) > 0.01) {
        errors.push('Commission amount does not match calculated percentage')
      }
    }

    return errors
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }
}

export const couriersService = new CouriersService()