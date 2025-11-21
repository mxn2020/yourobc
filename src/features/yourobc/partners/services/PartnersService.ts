// src/features/yourobc/partners/services/PartnersService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreatePartnerData,
  UpdatePartnerData,
} from '../types'
import { PartnerListOptions } from '@/convex/lib/yourobc'
import type {
  PartnerId
} from '@/convex/lib/yourobc'
import { PARTNERS_CONFIG, getLimit, isFeatureEnabled } from '../config/partners.config'

export class PartnersService {
  // Query hooks for partner data fetching
  usePartners(authUserId: string, options?: PartnerListOptions) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.partners.queries.getPartners, {
        authUserId,
        options,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  usePartner(authUserId: string, partnerId: PartnerId) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.partners.queries.getPartner, {
        partnerId,
        authUserId,
      }),
      staleTime: 300000,
      enabled: !!authUserId && !!partnerId,
    })
  }

  useAvailablePartners(
    authUserId: string,
    serviceType: 'OBC' | 'NFO',
    originCountryCode?: string,
    destinationCountryCode?: string,
    city?: string,
    airportCode?: string,
    limit = 50
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.partners.queries.getAvailablePartners, {
        authUserId,
        serviceType,
        originCountryCode,
        destinationCountryCode,
        city,
        airportCode,
        limit,
      }),
      staleTime: 60000, // 1 minute for availability
      enabled: !!authUserId,
    })
  }

  usePartnerStats(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.partners.queries.getPartnerStats, {
        authUserId,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useSearchPartners(
    authUserId: string,
    searchTerm: string,
    limit = 20,
    includeInactive = false,
    serviceType?: 'OBC' | 'NFO' | 'both'
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.partners.queries.searchPartners, {
        authUserId,
        searchTerm,
        limit,
        includeInactive,
        serviceType,
      }),
      staleTime: 30000,
      enabled: !!authUserId && searchTerm.length >= 2,
    })
  }

  usePartnerQuotes(
    authUserId: string,
    partnerId: PartnerId,
    dateRange?: { start: number; end: number },
    limit = 50,
    offset = 0
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.partners.queries.getPartnerQuotes, {
        authUserId,
        partnerId,
        dateRange,
        limit,
        offset,
      }),
      staleTime: 60000,
      enabled: !!authUserId && !!partnerId,
    })
  }

  usePartnerCoverage(
    authUserId: string,
    serviceType?: 'OBC' | 'NFO'
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.partners.queries.getPartnerCoverage, {
        authUserId,
        serviceType,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  // === NFO-Specific Query Hooks ===

  /**
   * Get partners suitable for NFO quote based on departure country
   * Only enabled if PARTNERS_MODULE_CONFIG.enablePartnerListForNFO is true
   */
  usePartnersForNFOQuote(
    authUserId: string,
    departureCountry: string,
    departureCountryCode: string
  ) {
    const enabled = PARTNERS_CONFIG.nfo.partnerListForNFO

    return useQuery({
      ...convexQuery(api.lib.yourobc.partners.queries.getPartnersForNFOQuote, {
        authUserId,
        departureCountry,
        departureCountryCode,
      }),
      staleTime: 60000, // 1 minute
      enabled: enabled && !!authUserId && !!departureCountryCode,
    })
  }

  /**
   * Get partner quote request email template
   * Only enabled if PARTNERS_MODULE_CONFIG.enablePartnerQuoteRequestTemplate is true
   */
  usePartnerQuoteRequestTemplate(
    authUserId: string,
    quoteData: {
      pickupLocation: string
      deliveryLocation: string
      dimensions: string
      weight: number
      deadline: number
      shipmentType: string
      shippingTerms: string
      customerName?: string
      notes?: string
    }
  ) {
    const enabled = PARTNERS_CONFIG.nfo.quoteRequestTemplate

    return useQuery({
      ...convexQuery(api.lib.yourobc.partners.queries.generatePartnerQuoteRequestTemplate, {
        authUserId,
        quoteData,
      }),
      staleTime: 0, // Always fetch fresh template
      enabled: enabled && !!authUserId && !!quoteData.pickupLocation,
    })
  }

  // Mutation hooks for partner modifications
  useCreatePartner() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.partners.mutations.createPartner),
    })
  }

  useUpdatePartner() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.partners.mutations.updatePartner),
    })
  }

  useDeletePartner() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.partners.mutations.deletePartner),
    })
  }

  useUpdatePartnerCoverage() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.partners.mutations.updatePartnerCoverage),
    })
  }

  useTogglePartnerStatus() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.partners.mutations.togglePartnerStatus),
    })
  }

  // Business operations using mutations
  async createPartner(
    mutation: ReturnType<typeof this.useCreatePartner>,
    authUserId: string,
    data: CreatePartnerData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create partner: ${error.message}`)
    }
  }

  async updatePartner(
    mutation: ReturnType<typeof this.useUpdatePartner>,
    authUserId: string,
    partnerId: PartnerId,
    data: UpdatePartnerData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, partnerId, data })
    } catch (error: any) {
      throw new Error(`Failed to update partner: ${error.message}`)
    }
  }

  async deletePartner(
    mutation: ReturnType<typeof this.useDeletePartner>,
    authUserId: string,
    partnerId: PartnerId
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, partnerId })
    } catch (error: any) {
      throw new Error(`Failed to delete partner: ${error.message}`)
    }
  }

  async updatePartnerCoverage(
    mutation: ReturnType<typeof this.useUpdatePartnerCoverage>,
    authUserId: string,
    partnerId: PartnerId,
    serviceCoverage: {
      countries: string[]
      cities: string[]
      airports: string[]
    }
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, partnerId, serviceCoverage })
    } catch (error: any) {
      throw new Error(`Failed to update partner coverage: ${error.message}`)
    }
  }

  async togglePartnerStatus(
    mutation: ReturnType<typeof this.useTogglePartnerStatus>,
    authUserId: string,
    partnerId: PartnerId
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, partnerId })
    } catch (error: any) {
      throw new Error(`Failed to toggle partner status: ${error.message}`)
    }
  }

  // Utility functions for data processing
  formatPartnerName(partner: {
    companyName: string
    shortName?: string
    partnerCode?: string
  }): string {
    return partner.shortName || partner.companyName || `Partner ${partner.partnerCode || 'Unknown'}`
  }

  formatPartnerLocation(address: {
    city: string
    country: string
    countryCode: string
    street?: string
    postalCode?: string
  }): string {
    return `${address.city}, ${address.country}`
  }

  getPartnerContactInfo(partner: {
    primaryContact: {
      name: string
      email?: string
      phone?: string
    }
  }): {
    name: string
    email?: string
    phone?: string
  } {
    return {
      name: partner.primaryContact.name,
      email: partner.primaryContact.email,
      phone: partner.primaryContact.phone,
    }
  }

  getPartnerServiceCapabilities(partner: {
    serviceType: 'OBC' | 'NFO' | 'both'
  }): {
    canHandleOBC: boolean
    canHandleNFO: boolean
    primaryService: string
  } {
    return {
      canHandleOBC: partner.serviceType === 'OBC' || partner.serviceType === 'both',
      canHandleNFO: partner.serviceType === 'NFO' || partner.serviceType === 'both',
      primaryService: partner.serviceType,
    }
  }

  calculatePartnerPerformanceScore(stats: {
    totalQuotes: number
    selectedQuotes: number
    averageResponseTime: number // in hours
    averageQuoteAccuracy: number // percentage
  }): number {
    const responseScore = Math.max(0, 100 - (stats.averageResponseTime * 5)) // Penalty for slow response
    const selectionRate = stats.totalQuotes > 0 ? 
      (stats.selectedQuotes / stats.totalQuotes) * 100 : 0
    const accuracyScore = stats.averageQuoteAccuracy

    return Math.round((responseScore + selectionRate + accuracyScore) / 3)
  }

  isPartnerAvailableForRoute(
    partner: {
      status: 'active' | 'inactive'
      serviceType: 'OBC' | 'NFO' | 'both'
      serviceCoverage: {
        countries: string[]
      }
    },
    serviceType: 'OBC' | 'NFO',
    originCountryCode: string,
    destinationCountryCode: string
  ): boolean {
    if (partner.status !== 'active') {
      return false
    }

    if (partner.serviceType !== serviceType && partner.serviceType !== 'both') {
      return false
    }

    const hasOriginCoverage = partner.serviceCoverage.countries.includes(originCountryCode) ||
                             partner.serviceCoverage.countries.length === 0
    
    const hasDestinationCoverage = partner.serviceCoverage.countries.includes(destinationCountryCode) ||
                                  partner.serviceCoverage.countries.length === 0

    return hasOriginCoverage && hasDestinationCoverage
  }

  isPartnerAvailableForCity(
    partner: {
      status: 'active' | 'inactive'
      serviceCoverage: {
        cities: string[]
      }
    },
    city: string
  ): boolean {
    if (partner.status !== 'active') {
      return false
    }

    return partner.serviceCoverage.cities.includes(city) ||
           partner.serviceCoverage.cities.length === 0
  }

  isPartnerAvailableForAirport(
    partner: {
      status: 'active' | 'inactive'
      serviceCoverage: {
        airports: string[]
      }
    },
    airportCode: string
  ): boolean {
    if (partner.status !== 'active') {
      return false
    }

    return partner.serviceCoverage.airports.includes(airportCode) ||
           partner.serviceCoverage.airports.length === 0
  }

  validatePartnerData(data: Partial<CreatePartnerData | UpdatePartnerData>): string[] {
    const errors: string[] = []

    // Company name validation
    if (data.companyName !== undefined && !data.companyName?.trim()) {
      errors.push('Company name is required')
    }

    if (data.companyName && data.companyName.length > getLimit(PARTNERS_CONFIG, 'maxCompanyNameLength')) {
      errors.push(`Company name must be less than ${getLimit(PARTNERS_CONFIG, 'maxCompanyNameLength')} characters`)
    }

    if (data.shortName && data.shortName.length > getLimit(PARTNERS_CONFIG, 'maxShortNameLength')) {
      errors.push(`Short name must be less than ${getLimit(PARTNERS_CONFIG, 'maxShortNameLength')} characters`)
    }

    if (data.partnerCode && data.partnerCode.length > getLimit(PARTNERS_CONFIG, 'maxPartnerCodeLength')) {
      errors.push(`Partner code must be less than ${getLimit(PARTNERS_CONFIG, 'maxPartnerCodeLength')} characters`)
    }

    // Contact validation
    if (data.primaryContact) {
      if (!data.primaryContact.name?.trim()) {
        errors.push('Primary contact name is required')
      }

      if (data.primaryContact.name && data.primaryContact.name.length > getLimit(PARTNERS_CONFIG, 'maxContactNameLength')) {
        errors.push(`Contact name must be less than ${getLimit(PARTNERS_CONFIG, 'maxContactNameLength')} characters`)
      }

      if (data.primaryContact.email && !this.isValidEmail(data.primaryContact.email)) {
        errors.push('Contact email format is invalid')
      }

      if (data.primaryContact.phone && data.primaryContact.phone.length > getLimit(PARTNERS_CONFIG, 'maxPhoneLength')) {
        errors.push(`Phone must be less than ${getLimit(PARTNERS_CONFIG, 'maxPhoneLength')} characters`)
      }
    }

    // Address validation
    if (data.address) {
      if (!data.address.city?.trim()) {
        errors.push('City is required')
      }

      if (!data.address.country?.trim()) {
        errors.push('Country is required')
      }

      if (!data.address.countryCode?.trim()) {
        errors.push('Country code is required')
      }
    }

    // Service coverage validation
    if (data.serviceCoverage) {
      if (!data.serviceCoverage.countries || data.serviceCoverage.countries.length === 0) {
        errors.push('At least one country must be specified in service coverage')
      }

      if (data.serviceCoverage.countries && data.serviceCoverage.countries.length > getLimit(PARTNERS_CONFIG, 'maxCountries')) {
        errors.push(`Maximum ${getLimit(PARTNERS_CONFIG, 'maxCountries')} countries allowed in service coverage`)
      }

      if (data.serviceCoverage.cities && data.serviceCoverage.cities.length > getLimit(PARTNERS_CONFIG, 'maxCities')) {
        errors.push(`Maximum ${getLimit(PARTNERS_CONFIG, 'maxCities')} cities allowed in service coverage`)
      }

      if (data.serviceCoverage.airports && data.serviceCoverage.airports.length > getLimit(PARTNERS_CONFIG, 'maxAirports')) {
        errors.push(`Maximum ${getLimit(PARTNERS_CONFIG, 'maxAirports')} airports allowed in service coverage`)
      }
    }

    // Payment terms validation
    if (data.paymentTerms !== undefined) {
      const minPayment = getLimit(PARTNERS_CONFIG, 'minPaymentTerms')
      const maxPayment = getLimit(PARTNERS_CONFIG, 'maxPaymentTerms')
      if (data.paymentTerms < minPayment || data.paymentTerms > maxPayment) {
        errors.push(`Payment terms must be between ${minPayment} and ${maxPayment} days`)
      }
    }

    // Quoting email validation
    if (data.quotingEmail && !this.isValidEmail(data.quotingEmail)) {
      errors.push('Quoting email format is invalid')
    }

    // Notes validation
    if (data.notes && data.notes.length > getLimit(PARTNERS_CONFIG, 'maxNotesLength')) {
      errors.push(`Notes must be less than ${getLimit(PARTNERS_CONFIG, 'maxNotesLength')} characters`)
    }

    // Ranking validation (if feature enabled)
    if (PARTNERS_CONFIG.business.ranking && 'ranking' in data && data.ranking !== undefined) {
      const minRanking = getLimit(PARTNERS_CONFIG, 'minRanking')
      const maxRanking = getLimit(PARTNERS_CONFIG, 'maxRanking')
      if (data.ranking < minRanking || data.ranking > maxRanking) {
        errors.push(`Ranking must be between ${minRanking} and ${maxRanking}`)
      }
    }

    return errors
  }

  generatePartnerCode(companyName: string, sequence?: number): string {
    if (sequence) {
      return `PTR${sequence.toString().padStart(3, '0')}`
    }

    // Generate from company name
    const cleanName = companyName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6)

    return cleanName.length >= 3 ? cleanName : `PTR001`
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Export singleton instance
export const partnersService = new PartnersService()