// convex/lib/yourobc/partners/queries.ts
// convex/yourobc/partners/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { PARTNER_CONSTANTS } from './constants';
import { 
  isPartnerAvailableForRoute,
  isPartnerAvailableForCity,
  isPartnerAvailableForAirport,
  formatPartnerDisplayName,
  getPartnerContactInfo,
  getPartnerServiceCapabilities
} from './utils';

export const getPartners = query({
  args: {
    authUserId: v.string(),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      sortBy: v.optional(v.string()),
      sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
      filters: v.optional(v.object({
        status: v.optional(v.array(v.string())),
        serviceType: v.optional(v.array(v.string())),
        countries: v.optional(v.array(v.string())),
        cities: v.optional(v.array(v.string())),
        airports: v.optional(v.array(v.string())),
        search: v.optional(v.string()),
      }))
    }))
  },
  handler: async (ctx, { authUserId, options = {} }) => {
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.VIEW);

    const {
      limit = 50,
      offset = 0,
      sortOrder = 'asc',
      filters = {}
    } = options;

    let partnersQuery = ctx.db.query('yourobcPartners');

    const { status, serviceType } = filters;

    if (status?.length) {
      partnersQuery = partnersQuery.filter((q) =>
        q.or(...status.map(s => q.eq(q.field('status'), s)))
      );
    }

    if (serviceType?.length) {
      partnersQuery = partnersQuery.filter((q) =>
        q.or(...serviceType.map(s => q.eq(q.field('serviceType'), s)))
      );
    }

    const partners = await partnersQuery
      .order(sortOrder === 'desc' ? 'desc' : 'asc')
      .collect();

    let filteredPartners = partners;

    if (filters.countries?.length) {
      filteredPartners = filteredPartners.filter(partner =>
        partner.serviceCoverage.countries.some(country => filters.countries!.includes(country))
      );
    }

    if (filters.cities?.length) {
      filteredPartners = filteredPartners.filter(partner =>
        partner.serviceCoverage.cities.some(city => filters.cities!.includes(city))
      );
    }

    if (filters.airports?.length) {
      filteredPartners = filteredPartners.filter(partner =>
        partner.serviceCoverage.airports.some(airport => filters.airports!.includes(airport))
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPartners = filteredPartners.filter(partner =>
        partner.companyName.toLowerCase().includes(searchTerm) ||
        partner.shortName?.toLowerCase().includes(searchTerm) ||
        partner.partnerCode?.toLowerCase().includes(searchTerm) ||
        partner.primaryContact.name.toLowerCase().includes(searchTerm) ||
        partner.primaryContact.email?.toLowerCase().includes(searchTerm) ||
        partner.quotingEmail?.toLowerCase().includes(searchTerm)
      );
    }

    const partnersWithDetails = filteredPartners.slice(offset, offset + limit).map(partner => {
      const displayName = formatPartnerDisplayName(partner);
      const contactInfo = getPartnerContactInfo(partner);
      const capabilities = getPartnerServiceCapabilities(partner);
      
      return {
        ...partner,
        displayName,
        contactInfo,
        capabilities,
      };
    });

    return {
      partners: partnersWithDetails,
      total: filteredPartners.length,
      hasMore: filteredPartners.length > offset + limit,
    };
  },
});

export const getPartner = query({
  args: {
    partnerId: v.id('yourobcPartners'),
    authUserId: v.string()
  },
  handler: async (ctx, { partnerId, authUserId }) => {
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.VIEW);

    const partner = await ctx.db.get(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    const displayName = formatPartnerDisplayName(partner);
    const contactInfo = getPartnerContactInfo(partner);
    const capabilities = getPartnerServiceCapabilities(partner);

    // Get recent quotes from this partner
    const recentQuotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q) => {
        return q.and(
          q.neq(q.field('partnerQuotes'), undefined),
          q.gt(q.field('createdAt'), Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        );
      })
      .order('desc')
      .take(10);

    const partnerQuotes = recentQuotes
      .map(quote => {
        const partnerQuote = quote.partnerQuotes?.find(pq => pq.partnerId === partnerId);
        return partnerQuote ? { ...partnerQuote, quoteId: quote._id } : null;
      })
      .filter((pq): pq is NonNullable<typeof pq> => pq !== null);

    return {
      ...partner,
      displayName,
      contactInfo,
      capabilities,
      recentQuotes: partnerQuotes,
    };
  },
});

export const getAvailablePartners = query({
  args: {
    authUserId: v.string(),
    serviceType: v.union(v.literal('OBC'), v.literal('NFO')),
    originCountryCode: v.optional(v.string()),
    destinationCountryCode: v.optional(v.string()),
    city: v.optional(v.string()),
    airportCode: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { 
    authUserId, 
    serviceType, 
    originCountryCode, 
    destinationCountryCode, 
    city, 
    airportCode, 
    limit = 50 
  }) => {
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.VIEW);

    const partners = await ctx.db
      .query('yourobcPartners')
      .withIndex('by_status', (q) => q.eq('status', PARTNER_CONSTANTS.STATUS.ACTIVE))
      .take(limit * 2);

    let availablePartners = partners.filter(partner => {
      // Check service type compatibility
      if (partner.serviceType !== serviceType && partner.serviceType !== 'both') {
        return false;
      }

      // Check route availability
      if (originCountryCode && destinationCountryCode) {
        return isPartnerAvailableForRoute(partner, serviceType, originCountryCode, destinationCountryCode);
      }

      // Check city availability
      if (city) {
        return isPartnerAvailableForCity(partner, city);
      }

      // Check airport availability
      if (airportCode) {
        return isPartnerAvailableForAirport(partner, airportCode);
      }

      return true;
    });

    const partnersWithDetails = availablePartners.slice(0, limit).map(partner => {
      const displayName = formatPartnerDisplayName(partner);
      const contactInfo = getPartnerContactInfo(partner);
      const capabilities = getPartnerServiceCapabilities(partner);

      return {
        ...partner,
        displayName,
        contactInfo,
        capabilities,
      };
    });

    return partnersWithDetails;
  },
});

export const getPartnerStats = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.VIEW);

    const partners = await ctx.db.query('yourobcPartners').collect();

    const partnersByServiceType = partners.reduce((acc, partner) => {
      const key = partner.serviceType;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const partnersByCountry = partners.reduce((acc, partner) => {
      if (partner.address.country) {
        const key = partner.address.country;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get quotes with partner quotes to calculate average
    const quotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q) => q.neq(q.field('partnerQuotes'), undefined))
      .collect();

    const totalPartnerQuotes = quotes.reduce((sum, quote) => {
      return sum + (quote.partnerQuotes?.length || 0);
    }, 0);

    const stats = {
      totalPartners: partners.length,
      activePartners: partners.filter(p => p.status === PARTNER_CONSTANTS.STATUS.ACTIVE).length,
      partnersByServiceType,
      partnersByCountry,
      avgQuotesPerPartner: partners.length > 0 ? Math.round(totalPartnerQuotes / partners.length) : 0,
    };

    return stats;
  },
});

export const searchPartners = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
    includeInactive: v.optional(v.boolean()),
    serviceType: v.optional(v.union(v.literal('OBC'), v.literal('NFO'), v.literal('both'))),
  },
  handler: async (ctx, { authUserId, searchTerm, limit = 20, includeInactive = false, serviceType }) => {
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.VIEW);

    if (searchTerm.length < 2) {
      return [];
    }

    let partnersQuery = ctx.db.query('yourobcPartners');
    
    if (!includeInactive) {
      partnersQuery = partnersQuery.filter((q) => q.eq(q.field('status'), PARTNER_CONSTANTS.STATUS.ACTIVE));
    }

    if (serviceType) {
      partnersQuery = partnersQuery.filter((q) => 
        q.or(
          q.eq(q.field('serviceType'), serviceType),
          q.eq(q.field('serviceType'), 'both')
        )
      );
    }

    const partners = await partnersQuery.collect();
    const searchLower = searchTerm.toLowerCase();

    const filtered = partners.filter(partner =>
      partner.companyName.toLowerCase().includes(searchLower) ||
      partner.shortName?.toLowerCase().includes(searchLower) ||
      partner.partnerCode?.toLowerCase().includes(searchLower) ||
      partner.primaryContact.name.toLowerCase().includes(searchLower) ||
      partner.primaryContact.email?.toLowerCase().includes(searchLower) ||
      partner.quotingEmail?.toLowerCase().includes(searchLower)
    );

    const partnersWithDetails = filtered.slice(0, limit).map(partner => {
      const displayName = formatPartnerDisplayName(partner);
      const contactInfo = getPartnerContactInfo(partner);
      const capabilities = getPartnerServiceCapabilities(partner);

      return {
        ...partner,
        displayName,
        contactInfo,
        capabilities,
      };
    });

    return partnersWithDetails;
  },
});

export const getPartnerQuotes = query({
  args: {
    authUserId: v.string(),
    partnerId: v.id('yourobcPartners'),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, partnerId, dateRange, limit = 50, offset = 0 }) => {
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.VIEW_QUOTES);

    const partner = await ctx.db.get(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    let quotesQuery = ctx.db
      .query('yourobcQuotes')
      .filter((q) => q.neq(q.field('partnerQuotes'), undefined));

    if (dateRange) {
      quotesQuery = quotesQuery.filter((q) =>
        q.and(
          q.gte(q.field('createdAt'), dateRange.start),
          q.lte(q.field('createdAt'), dateRange.end)
        )
      );
    }

    const quotes = await quotesQuery
      .order('desc')
      .collect();

    // Filter quotes that include this partner and extract partner quote data
    const partnerQuotes = quotes
      .map(quote => {
        const partnerQuote = quote.partnerQuotes?.find(pq => pq.partnerId === partnerId);
        if (!partnerQuote) return null;

        return {
          quoteId: quote._id,
          quoteNumber: quote.quoteNumber,
          customerReference: quote.customerReference,
          serviceType: quote.serviceType,
          priority: quote.priority,
          origin: quote.origin,
          destination: quote.destination,
          description: quote.description,
          deadline: quote.deadline,
          partnerQuote,
          status: quote.status,
          selected: quote.selectedPartnerQuote === partnerId,
          createdAt: quote.createdAt,
        };
      })
      .filter(Boolean);

    const paginatedQuotes = partnerQuotes.slice(offset, offset + limit);

    // Calculate summary statistics
    const totalQuotes = partnerQuotes.length;
    const selectedQuotes = partnerQuotes.filter((q): q is NonNullable<typeof q> => q !== null && q.selected).length;
    const avgResponseTime = partnerQuotes.length > 0 ?
      partnerQuotes.reduce((sum, q) => q ? sum + (q.partnerQuote.receivedAt - q.createdAt) : sum, 0) / partnerQuotes.length / (1000 * 60 * 60) : 0; // in hours

    // Calculate average quote value
    const quotesWithPrice = partnerQuotes.filter((q): q is NonNullable<typeof q> => q !== null && q.partnerQuote.quotedPrice?.amount !== undefined);
    const avgQuoteValue = quotesWithPrice.length > 0 ?
      quotesWithPrice.reduce((sum, q) => sum + (q.partnerQuote.quotedPrice?.amount || 0), 0) / quotesWithPrice.length : 0;

    return {
      quotes: paginatedQuotes,
      total: totalQuotes,
      hasMore: partnerQuotes.length > offset + limit,
      summary: {
        totalQuotes,
        selectedQuotes,
        selectionRate: totalQuotes > 0 ? Math.round((selectedQuotes / totalQuotes) * 100) : 0,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
        avgQuoteValue: Math.round(avgQuoteValue * 100) / 100, // Round to 2 decimals
      },
    };
  },
});

export const getPartnerCoverage = query({
  args: {
    authUserId: v.string(),
    serviceType: v.optional(v.union(v.literal('OBC'), v.literal('NFO'))),
  },
  handler: async (ctx, { authUserId, serviceType }) => {
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.VIEW);

    let partnersQuery = ctx.db
      .query('yourobcPartners')
      .withIndex('by_status', (q) => q.eq('status', PARTNER_CONSTANTS.STATUS.ACTIVE));

    const partners = await partnersQuery.collect();

    let filteredPartners = partners;
    if (serviceType) {
      filteredPartners = partners.filter(partner =>
        partner.serviceType === serviceType || partner.serviceType === 'both'
      );
    }

    // Aggregate coverage data
    const allCountries = new Set<string>();
    const allCities = new Set<string>();
    const allAirports = new Set<string>();

    filteredPartners.forEach(partner => {
      partner.serviceCoverage.countries.forEach(country => allCountries.add(country));
      partner.serviceCoverage.cities.forEach(city => allCities.add(city));
      partner.serviceCoverage.airports.forEach(airport => allAirports.add(airport));
    });

    // Count partners per location
    const countryCoverage = Array.from(allCountries).map(country => ({
      country,
      partnerCount: filteredPartners.filter(p => p.serviceCoverage.countries.includes(country)).length,
      partners: filteredPartners
        .filter(p => p.serviceCoverage.countries.includes(country))
        .map(p => ({ id: p._id, name: formatPartnerDisplayName(p) })),
    }));

    const cityCoverage = Array.from(allCities).map(city => ({
      city,
      partnerCount: filteredPartners.filter(p => p.serviceCoverage.cities.includes(city)).length,
      partners: filteredPartners
        .filter(p => p.serviceCoverage.cities.includes(city))
        .map(p => ({ id: p._id, name: formatPartnerDisplayName(p) })),
    }));

    const airportCoverage = Array.from(allAirports).map(airport => ({
      airport,
      partnerCount: filteredPartners.filter(p => p.serviceCoverage.airports.includes(airport)).length,
      partners: filteredPartners
        .filter(p => p.serviceCoverage.airports.includes(airport))
        .map(p => ({ id: p._id, name: formatPartnerDisplayName(p) })),
    }));

    return {
      summary: {
        totalPartners: filteredPartners.length,
        countriesCount: allCountries.size,
        citiesCount: allCities.size,
        airportsCount: allAirports.size,
      },
      coverage: {
        countries: countryCoverage.sort((a, b) => b.partnerCount - a.partnerCount),
        cities: cityCoverage.sort((a, b) => b.partnerCount - a.partnerCount),
        airports: airportCoverage.sort((a, b) => b.partnerCount - a.partnerCount),
      },
    };
  },
});

/**
 * Get partners suitable for NFO quote request based on departure country
 * As per YOUROBC.md: System suggests partners based on departure country
 */
export const getPartnersForNFOQuote = query({
  args: {
    authUserId: v.string(),
    departureCountry: v.string(),
    departureCountryCode: v.string(),
    serviceType: v.optional(v.union(v.literal('NFO'), v.literal('both'))),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, PARTNER_CONSTANTS.PERMISSIONS.VIEW);

    // Find partners that:
    // 1. Are active
    // 2. Handle NFO or both services
    // 3. Cover the departure country
    const partners = await ctx.db
      .query('yourobcPartners')
      .withIndex('by_status', (q) => q.eq('status', PARTNER_CONSTANTS.STATUS.ACTIVE))
      .collect();

    // Filter for NFO service type
    const nfoPartners = partners.filter(partner =>
      partner.serviceType === 'NFO' || partner.serviceType === 'both'
    );

    // Filter by departure country coverage
    const filteredPartners = nfoPartners.filter(partner => {
      // If partner has no country restriction, they cover all countries
      if (!partner.serviceCoverage.countries || partner.serviceCoverage.countries.length === 0) {
        return true;
      }
      // Check if departure country is in partner's coverage
      return partner.serviceCoverage.countries.includes(args.departureCountryCode);
    });

    // Sort by ranking if available (highest first)
    const sortedPartners = filteredPartners.sort((a, b) => {
      const rankingA = a.ranking || 0;
      const rankingB = b.ranking || 0;
      return rankingB - rankingA;
    });

    // Return partner data suitable for selection
    return sortedPartners.map((partner) => {
      const displayName = formatPartnerDisplayName(partner);
      const contactInfo = getPartnerContactInfo(partner);
      const capabilities = getPartnerServiceCapabilities(partner);

      return {
        _id: partner._id,
        companyName: partner.companyName,
        shortName: partner.shortName,
        partnerCode: partner.partnerCode,
        displayName,
        primaryContact: partner.primaryContact,
        quotingEmail: partner.quotingEmail,
        ranking: partner.ranking,
        rankingNotes: partner.rankingNotes,
        paymentTerms: partner.paymentTerms,
        preferredCurrency: partner.preferredCurrency,
        serviceCoverage: partner.serviceCoverage,
        serviceCapabilities: partner.serviceCapabilities,
        contactInfo,
        capabilities,
      };
    });
  },
});

/**
 * Generate email template for partner quote request
 * As per YOUROBC.md: System generates partner request template
 */
export const generatePartnerQuoteRequestTemplate = query({
  args: {
    authUserId: v.string(),
    quoteData: v.object({
      pickupLocation: v.string(),
      deliveryLocation: v.string(),
      dimensions: v.string(),
      weight: v.number(),
      deadline: v.number(),
      shipmentType: v.string(), // Door-Door, Door-Airport, Airport-Door
      shippingTerms: v.string(), // FCA, EXW, etc
      customerName: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, PARTNER_CONSTANTS.PERMISSIONS.VIEW);

    const deadlineDate = new Date(args.quoteData.deadline);
    const deadlineStr = deadlineDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const template = `
Subject: NFO Quote Request - ${args.quoteData.pickupLocation} to ${args.quoteData.deliveryLocation}

Dear Partner,

We would like to request a quote for the following shipment:

SHIPMENT DETAILS:
- Pickup Location: ${args.quoteData.pickupLocation}
- Delivery Location: ${args.quoteData.deliveryLocation}
- Dimensions: ${args.quoteData.dimensions}
- Weight: ${args.quoteData.weight} kg
- Deadline: ${deadlineStr}
- Shipment Type: ${args.quoteData.shipmentType}
- Shipping Terms: ${args.quoteData.shippingTerms}
${args.quoteData.customerName ? `- Customer: ${args.quoteData.customerName}` : ''}
${args.quoteData.notes ? `\nAdditional Notes:\n${args.quoteData.notes}` : ''}

Please provide your best quote including:
- Total cost breakdown
- Routing/flight details
- Transit time
- Any special requirements or conditions

We look forward to your response.

Best regards,
YourOBC Team
    `.trim();

    return template;
  },
});