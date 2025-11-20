// src/features/yourobc/partners/hooks/usePartners.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { partnersService } from '../services/PartnersService'
import { parseConvexError, type ParsedError } from '@/utils/errorHandling'
import { PARTNER_CONSTANTS } from '../types'
import type {
  CreatePartnerData,
  UpdatePartnerData,
  PartnerFormData,
  PartnerId,
  PartnerListItem,
  PartnerInsights,
  PartnerPerformanceMetrics,
} from '../types'
import { PartnerListOptions } from '@/convex/lib/yourobc'

/**
 * Main hook for partner management
 */
export function usePartners(options?: PartnerListOptions & { autoRefresh?: boolean }) {
  const authUser = useAuthenticatedUser()

  const {
    data: partnersQuery,
    isPending,
    error,
    refetch,
  } = partnersService.usePartners(authUser?.id!, options)

  const {
    data: stats,
    isPending: isStatsLoading,
  } = partnersService.usePartnerStats(authUser?.id!)

  const createMutation = partnersService.useCreatePartner()
  const updateMutation = partnersService.useUpdatePartner()
  const deleteMutation = partnersService.useDeletePartner()
  const toggleStatusMutation = partnersService.useTogglePartnerStatus()

  // Parse error for better user experience
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null
  }, [error])

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED'

  const createPartner = useCallback(async (partnerData: PartnerFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = partnersService.validatePartnerData(partnerData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreatePartnerData = {
      companyName: partnerData.companyName.trim(),
      shortName: partnerData.shortName?.trim(),
      partnerCode: partnerData.partnerCode?.trim(),
      serviceType: partnerData.serviceType,
      primaryContact: {
        ...partnerData.primaryContact,
        name: partnerData.primaryContact.name.trim(),
        email: partnerData.primaryContact.email?.trim(),
        phone: partnerData.primaryContact.phone?.trim(),
      },
      address: {
        ...partnerData.address,
        street: partnerData.address.street?.trim(),
        city: partnerData.address.city.trim(),
        postalCode: partnerData.address.postalCode?.trim(),
        country: partnerData.address.country.trim(),
        countryCode: partnerData.address.countryCode.trim().toUpperCase(),
      },
      serviceCoverage: partnerData.serviceCoverage,
      preferredCurrency: partnerData.preferredCurrency || PARTNER_CONSTANTS.DEFAULT_VALUES.PREFERRED_CURRENCY,
      paymentTerms: partnerData.paymentTerms || PARTNER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
      quotingEmail: partnerData.quotingEmail?.trim(),
      notes: partnerData.notes?.trim(),
    }

    return await partnersService.createPartner(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updatePartner = useCallback(async (
    partnerId: PartnerId,
    updates: Partial<PartnerFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = partnersService.validatePartnerData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const updateData: UpdatePartnerData = {}
    if (updates.companyName !== undefined) updateData.companyName = updates.companyName.trim()
    if (updates.shortName !== undefined) updateData.shortName = updates.shortName?.trim()
    if (updates.partnerCode !== undefined) updateData.partnerCode = updates.partnerCode?.trim()
    if (updates.serviceType !== undefined) updateData.serviceType = updates.serviceType
    if (updates.primaryContact !== undefined) {
      updateData.primaryContact = {
        ...updates.primaryContact,
        name: updates.primaryContact.name.trim(),
        email: updates.primaryContact.email?.trim(),
        phone: updates.primaryContact.phone?.trim(),
      }
    }
    if (updates.address !== undefined) {
      updateData.address = {
        ...updates.address,
        street: updates.address.street?.trim(),
        city: updates.address.city.trim(),
        postalCode: updates.address.postalCode?.trim(),
        country: updates.address.country.trim(),
        countryCode: updates.address.countryCode.trim().toUpperCase(),
      }
    }
    if (updates.serviceCoverage !== undefined) updateData.serviceCoverage = updates.serviceCoverage
    if (updates.preferredCurrency !== undefined) updateData.preferredCurrency = updates.preferredCurrency
    if (updates.paymentTerms !== undefined) updateData.paymentTerms = updates.paymentTerms
    if (updates.quotingEmail !== undefined) updateData.quotingEmail = updates.quotingEmail?.trim()
    if (updates.notes !== undefined) updateData.notes = updates.notes?.trim()

    return await partnersService.updatePartner(updateMutation, authUser.id, partnerId, updateData)
  }, [authUser, updateMutation])

  const deletePartner = useCallback(async (partnerId: PartnerId) => {
    if (!authUser) throw new Error('Authentication required')
    return await partnersService.deletePartner(deleteMutation, authUser.id, partnerId)
  }, [authUser, deleteMutation])

  const togglePartnerStatus = useCallback(async (partnerId: PartnerId) => {
    if (!authUser) throw new Error('Authentication required')
    return await partnersService.togglePartnerStatus(toggleStatusMutation, authUser.id, partnerId)
  }, [authUser, toggleStatusMutation])

  const canCreatePartners = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canEditPartners = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canDeletePartners = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const enrichedPartners = useMemo(() => {
    const partners = partnersQuery?.partners || []
    return partners.map((partner): PartnerListItem => ({
      ...partner,
      formattedLocation: partnersService.formatPartnerLocation(partner.address),
      coverageStats: {
        countries: partner.serviceCoverage.countries.length,
        cities: partner.serviceCoverage.cities.length,
        airports: partner.serviceCoverage.airports.length,
      },
      performanceScore: partnersService.calculatePartnerPerformanceScore({
        totalQuotes: 0,
        selectedQuotes: 0,
        averageResponseTime: 24,
        averageQuoteAccuracy: 85,
      }),
      isPreferred: false, // Could be calculated based on performance
      hasRecentActivity: false, // Could be calculated based on recent quotes
    }))
  }, [partnersQuery])

  return {
    partners: enrichedPartners,
    total: partnersQuery?.total || 0,
    hasMore: partnersQuery?.hasMore || false,
    stats,
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    createPartner,
    updatePartner,
    deletePartner,
    togglePartnerStatus,
    refetch,
    canCreatePartners,
    canEditPartners,
    canDeletePartners,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
  }
}

/**
 * Hook for managing a single partner
 */
export function usePartner(partnerId?: PartnerId) {

  if (!partnerId) {
    return {
      partner: null,
      partnerInsights: null,
      partnerMetrics: null,
      isLoading: false,
      error: null,
      refetch: async () => {},
    }
  }

  const authUser = useAuthenticatedUser()

  const {
    data: partner,
    isPending,
    error,
    refetch,
  } = partnersService.usePartner(authUser?.id!, partnerId)

  // Mock partner metrics (would come from actual quote queries)
  const partnerMetrics = useMemo((): PartnerPerformanceMetrics | null => {
    if (!partner) return null

    return {
      totalQuotes: 0,
      selectedQuotes: 0,
      selectionRate: 0,
      avgResponseTime: 24,
      avgQuoteAccuracy: 85,
      totalRevenue: 0,
      lastQuoteDate: undefined,
    }
  }, [partner])

  // Enrich partner data with formatted location, coverage stats, and performance score
  const enrichedPartner = useMemo((): PartnerListItem | null => {
    if (!partner) return null

    const performanceScore = partnersService.calculatePartnerPerformanceScore({
      totalQuotes: partnerMetrics?.totalQuotes || 0,
      selectedQuotes: partnerMetrics?.selectedQuotes || 0,
      averageResponseTime: partnerMetrics?.avgResponseTime || 24,
      averageQuoteAccuracy: partnerMetrics?.avgQuoteAccuracy || 85,
    })

    return {
      ...partner,
      formattedLocation: partnersService.formatPartnerLocation(partner.address),
      coverageStats: {
        countries: partner.serviceCoverage.countries.length,
        cities: partner.serviceCoverage.cities.length,
        airports: partner.serviceCoverage.airports.length,
      },
      performanceScore,
      isPreferred: performanceScore >= 80, // Based on performance
      hasRecentActivity: partnerMetrics?.lastQuoteDate
        ? (Date.now() - partnerMetrics.lastQuoteDate) < (30 * 24 * 60 * 60 * 1000)
        : false,
    }
  }, [partner, partnerMetrics])

  const partnerInsights = useMemo((): PartnerInsights | null => {
    if (!partner || !enrichedPartner) return null

    const daysSinceCreated = Math.floor(
      (Date.now() - (partner.createdAt || Date.now())) / (24 * 60 * 60 * 1000)
    )

    const daysSinceLastQuote = partnerMetrics?.lastQuoteDate
      ? Math.floor((Date.now() - partnerMetrics.lastQuoteDate) / (24 * 60 * 60 * 1000))
      : null

    const performanceScore = enrichedPartner.performanceScore || 0

    return {
      performanceScore: performanceScore,
      isNewPartner: daysSinceCreated <= 30,
      needsAttention: daysSinceLastQuote !== null && daysSinceLastQuote > 30,
      isTopPerformer: performanceScore >= 80,
      daysSinceLastQuote,
      responsiveness: performanceScore >= 80 ? 'excellent' :
                     performanceScore >= 60 ? 'good' :
                     performanceScore >= 40 ? 'average' : 'poor',
    }
  }, [partner, enrichedPartner, partnerMetrics])

  return {
    partner: enrichedPartner,
    partnerInsights,
    partnerMetrics,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for available partners search
 */
export function useAvailablePartners(
  serviceType: 'OBC' | 'NFO',
  originCountryCode?: string,
  destinationCountryCode?: string,
  city?: string,
  airportCode?: string,
  limit = 50
) {
  const authUser = useAuthenticatedUser()

  const {
    data: partners,
    isPending,
    error,
  } = partnersService.useAvailablePartners(
    authUser?.id!,
    serviceType,
    originCountryCode,
    destinationCountryCode,
    city,
    airportCode,
    limit
  )

  return {
    partners: partners || [],
    isLoading: isPending,
    error,
    hasResults: (partners || []).length > 0,
  }
}

/**
 * Hook for partner search
 */
export function usePartnerSearch(searchTerm: string, serviceType?: 'OBC' | 'NFO' | 'both') {
  const authUser = useAuthenticatedUser()

  const {
    data: searchResults,
    isPending,
    error,
  } = partnersService.useSearchPartners(authUser?.id!, searchTerm, 20, false, serviceType)

  return {
    results: searchResults || [],
    isLoading: isPending,
    error,
    hasResults: (searchResults?.length || 0) > 0,
  }
}

/**
 * Hook for partner quotes
 */
export function usePartnerQuotes(
  partnerId: PartnerId,
  dateRange?: { start: number; end: number }
) {
  const authUser = useAuthenticatedUser()

  const {
    data: quotesData,
    isPending,
    error,
    refetch,
  } = partnersService.usePartnerQuotes(authUser?.id!, partnerId, dateRange)

  return {
    quotes: quotesData?.quotes || [],
    summary: quotesData?.summary || null,
    total: quotesData?.total || 0,
    hasMore: quotesData?.hasMore || false,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for partner coverage
 */
export function usePartnerCoverage(serviceType?: 'OBC' | 'NFO') {
  const authUser = useAuthenticatedUser()

  const {
    data: coverage,
    isPending,
    error,
    refetch,
  } = partnersService.usePartnerCoverage(authUser?.id!, serviceType)

  return {
    coverage,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for partner form management
 */
export function usePartnerForm(initialData?: Partial<PartnerFormData>) {
  const [formData, setFormData] = useState<PartnerFormData>({
    companyName: '',
    serviceType: 'both',
    primaryContact: {
      name: '',
      isPrimary: true,
    },
    address: {
      city: '',
      country: '',
      countryCode: '',
    },
    serviceCoverage: {
      countries: [],
      cities: [],
      airports: [],
    },
    preferredCurrency: PARTNER_CONSTANTS.DEFAULT_VALUES.PREFERRED_CURRENCY,
    paymentTerms: PARTNER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
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
    const validationErrors = partnersService.validatePartnerData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('Company name')) errorMap.companyName = error
      else if (error.includes('contact name')) errorMap['primaryContact.name'] = error
      else if (error.includes('contact email')) errorMap['primaryContact.email'] = error
      else if (error.includes('contact phone')) errorMap['primaryContact.phone'] = error
      else if (error.includes('City')) errorMap['address.city'] = error
      else if (error.includes('Country')) errorMap['address.country'] = error
      else if (error.includes('service coverage')) errorMap['serviceCoverage.countries'] = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: PartnerFormData = {
      companyName: '',
      serviceType: 'both',
      primaryContact: { name: '', isPrimary: true },
      address: { city: '', country: '', countryCode: '' },
      serviceCoverage: { countries: [], cities: [], airports: [] },
      preferredCurrency: PARTNER_CONSTANTS.DEFAULT_VALUES.PREFERRED_CURRENCY,
      paymentTerms: PARTNER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
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