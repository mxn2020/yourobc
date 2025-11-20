// convex/lib/yourobc/partners/mutations.ts
// convex/yourobc/partners/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { PARTNER_CONSTANTS } from './constants';
import { validatePartnerData, generatePartnerCode } from './utils';

const contactSchema = v.object({
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  isPrimary: v.boolean(),
});

const addressSchema = v.object({
  street: v.optional(v.string()),
  city: v.string(),
  postalCode: v.optional(v.string()),
  country: v.string(),
  countryCode: v.string(),
});

const serviceCoverageSchema = v.object({
  countries: v.array(v.string()),
  cities: v.array(v.string()),
  airports: v.array(v.string()),
});

export const createPartner = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      companyName: v.string(),
      shortName: v.optional(v.string()),
      partnerCode: v.optional(v.string()),
      serviceType: v.union(v.literal('OBC'), v.literal('NFO'), v.literal('both')),
      primaryContact: contactSchema,
      address: addressSchema,
      serviceCoverage: serviceCoverageSchema,
      preferredCurrency: v.optional(v.union(v.literal('EUR'), v.literal('USD'))),
      paymentTerms: v.optional(v.number()),
      quotingEmail: v.optional(v.string()),
      notes: v.optional(v.string()),
      ranking: v.optional(v.number()),
      rankingNotes: v.optional(v.string()),
      internalPaymentNotes: v.optional(v.string()),
      serviceCapabilities: v.optional(v.object({
        handlesCustoms: v.optional(v.boolean()),
        handlesPickup: v.optional(v.boolean()),
        handlesDelivery: v.optional(v.boolean()),
        handlesNFO: v.optional(v.boolean()),
        handlesTrucking: v.optional(v.boolean()),
      })),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validatePartnerData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check for duplicate company name
    const existingCompany = await ctx.db
      .query('yourobcPartners')
      .withIndex('by_companyName', (q) => q.eq('companyName', data.companyName))
      .first();

    if (existingCompany) {
      throw new Error('Partner with this company name already exists');
    }

    let partnerCode = data.partnerCode;
    if (!partnerCode) {
      const existingPartners = await ctx.db.query('yourobcPartners').collect();
      partnerCode = generatePartnerCode(data.companyName, existingPartners.length + 1);
    }

    // Check for duplicate partner code if provided
    if (partnerCode) {
      const existingCode = await ctx.db
        .query('yourobcPartners')
        .filter((q) => q.eq(q.field('partnerCode'), partnerCode))
        .first();

      if (existingCode) {
        throw new Error('Partner code already exists');
      }
    }

    const now = Date.now();

    const partnerData = {
      companyName: data.companyName.trim(),
      shortName: data.shortName?.trim(),
      partnerCode,
      status: PARTNER_CONSTANTS.STATUS.ACTIVE,
      serviceType: data.serviceType,
      primaryContact: {
        ...data.primaryContact,
        name: data.primaryContact.name.trim(),
        email: data.primaryContact.email?.trim(),
        phone: data.primaryContact.phone?.trim(),
      },
      address: {
        ...data.address,
        street: data.address.street?.trim(),
        city: data.address.city.trim(),
        postalCode: data.address.postalCode?.trim(),
        country: data.address.country.trim(),
        countryCode: data.address.countryCode.trim().toUpperCase(),
      },
      serviceCoverage: data.serviceCoverage,
      preferredCurrency: data.preferredCurrency || PARTNER_CONSTANTS.DEFAULT_VALUES.PREFERRED_CURRENCY,
      paymentTerms: data.paymentTerms || PARTNER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
      quotingEmail: data.quotingEmail?.trim(),
      notes: data.notes?.trim(),
      ranking: data.ranking,
      rankingNotes: data.rankingNotes?.trim(),
      internalPaymentNotes: data.internalPaymentNotes?.trim(),
      serviceCapabilities: data.serviceCapabilities,
      tags: [],
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    };

    const partnerId = await ctx.db.insert('yourobcPartners', partnerData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'partner.created',
      entityType: 'yourobc_partner',
      entityId: partnerId,
      entityTitle: `Partner ${data.companyName}`,
      description: `Created partner record for ${data.companyName}`,
      createdAt: now,
    });

    return partnerId;
  },
});

export const updatePartner = mutation({
  args: {
    authUserId: v.string(),
    partnerId: v.id('yourobcPartners'),
    data: v.object({
      companyName: v.optional(v.string()),
      shortName: v.optional(v.string()),
      partnerCode: v.optional(v.string()),
      status: v.optional(v.union(v.literal('active'), v.literal('inactive'))),
      serviceType: v.optional(v.union(v.literal('OBC'), v.literal('NFO'), v.literal('both'))),
      primaryContact: v.optional(contactSchema),
      address: v.optional(addressSchema),
      serviceCoverage: v.optional(serviceCoverageSchema),
      preferredCurrency: v.optional(v.union(v.literal('EUR'), v.literal('USD'))),
      paymentTerms: v.optional(v.number()),
      quotingEmail: v.optional(v.string()),
      notes: v.optional(v.string()),
      ranking: v.optional(v.number()),
      rankingNotes: v.optional(v.string()),
      internalPaymentNotes: v.optional(v.string()),
      serviceCapabilities: v.optional(v.object({
        handlesCustoms: v.optional(v.boolean()),
        handlesPickup: v.optional(v.boolean()),
        handlesDelivery: v.optional(v.boolean()),
        handlesNFO: v.optional(v.boolean()),
        handlesTrucking: v.optional(v.boolean()),
      })),
    })
  },
  handler: async (ctx, { authUserId, partnerId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.EDIT);

    const partner = await ctx.db.get(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    const errors = validatePartnerData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check for duplicate company name if changed
    if (data.companyName && data.companyName !== partner.companyName) {
      const companyName = data.companyName;
      const existingCompany = await ctx.db
        .query('yourobcPartners')
        .withIndex('by_companyName', (q) => q.eq('companyName', companyName))
        .first();

      if (existingCompany && existingCompany._id !== partnerId) {
        throw new Error('Partner with this company name already exists');
      }
    }

    // Check for duplicate partner code if changed
    if (data.partnerCode && data.partnerCode !== partner.partnerCode) {
      const existingCode = await ctx.db
        .query('yourobcPartners')
        .filter((q) => q.eq(q.field('partnerCode'), data.partnerCode))
        .first();

      if (existingCode && existingCode._id !== partnerId) {
        throw new Error('Partner code already exists');
      }
    }

    const now = Date.now();
    const updateData = {
      ...data,
      updatedAt: now,
    };

    // Clean up string fields
    if (data.companyName) updateData.companyName = data.companyName.trim();
    if (data.shortName) updateData.shortName = data.shortName.trim();
    if (data.partnerCode) updateData.partnerCode = data.partnerCode.trim();
    if (data.quotingEmail) updateData.quotingEmail = data.quotingEmail.trim();
    if (data.notes) updateData.notes = data.notes.trim();
    if (data.rankingNotes) updateData.rankingNotes = data.rankingNotes.trim();
    if (data.internalPaymentNotes) updateData.internalPaymentNotes = data.internalPaymentNotes.trim();

    // Clean up contact fields
    if (data.primaryContact) {
      updateData.primaryContact = {
        ...data.primaryContact,
        name: data.primaryContact.name.trim(),
        email: data.primaryContact.email?.trim(),
        phone: data.primaryContact.phone?.trim(),
      };
    }

    // Clean up address fields
    if (data.address) {
      updateData.address = {
        ...data.address,
        street: data.address.street?.trim(),
        city: data.address.city.trim(),
        postalCode: data.address.postalCode?.trim(),
        country: data.address.country.trim(),
        countryCode: data.address.countryCode.trim().toUpperCase(),
      };
    }

    await ctx.db.patch(partnerId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'partner.updated',
      entityType: 'yourobc_partner',
      entityId: partnerId,
      entityTitle: `Partner ${partner.companyName}`,
      description: `Updated partner record`,
      createdAt: now,
    });

    return partnerId;
  },
});

export const deletePartner = mutation({
  args: {
    authUserId: v.string(),
    partnerId: v.id('yourobcPartners'),
  },
  handler: async (ctx, { authUserId, partnerId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.DELETE);

    const partner = await ctx.db.get(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    // Check if partner is referenced in quotes
    const quotesWithPartner = await ctx.db
      .query('yourobcQuotes')
      .filter((q) => 
        q.or(
          q.eq(q.field('selectedPartnerQuote'), partnerId),
          q.neq(q.field('partnerQuotes'), undefined)
        )
      )
      .first();

    if (quotesWithPartner) {
      // Check if this specific partner is in the partnerQuotes array
      const hasPartnerQuote = quotesWithPartner.partnerQuotes?.some(pq => pq.partnerId === partnerId);
      if (hasPartnerQuote || quotesWithPartner.selectedPartnerQuote === partnerId) {
        throw new Error('Cannot delete partner with existing quotes. Deactivate instead.');
      }
    }

    // Check if partner is referenced in shipments
    const shipmentWithPartner = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_partner', (q) => q.eq('partnerId', partnerId))
      .first();

    if (shipmentWithPartner) {
      throw new Error('Cannot delete partner with existing shipments. Deactivate instead.');
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(partnerId, {
      deletedAt: now,
      deletedBy: authUserId,
    });
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'partner.deleted',
      entityType: 'yourobc_partner',
      entityId: partnerId,
      entityTitle: `Partner ${partner.companyName}`,
      description: `Deleted partner record`,
      createdAt: now,
    });

    return partnerId;
  },
});

export const updatePartnerCoverage = mutation({
  args: {
    authUserId: v.string(),
    partnerId: v.id('yourobcPartners'),
    serviceCoverage: serviceCoverageSchema,
  },
  handler: async (ctx, { authUserId, partnerId, serviceCoverage }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.MANAGE_COVERAGE);

    const partner = await ctx.db.get(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    // Validate coverage data
    const coverageErrors = [];
    
    if (!serviceCoverage.countries || serviceCoverage.countries.length === 0) {
      coverageErrors.push('At least one country must be specified');
    }

    if (serviceCoverage.countries && serviceCoverage.countries.length > PARTNER_CONSTANTS.LIMITS.MAX_COUNTRIES) {
      coverageErrors.push(`Maximum ${PARTNER_CONSTANTS.LIMITS.MAX_COUNTRIES} countries allowed`);
    }

    if (serviceCoverage.cities && serviceCoverage.cities.length > PARTNER_CONSTANTS.LIMITS.MAX_CITIES) {
      coverageErrors.push(`Maximum ${PARTNER_CONSTANTS.LIMITS.MAX_CITIES} cities allowed`);
    }

    if (serviceCoverage.airports && serviceCoverage.airports.length > PARTNER_CONSTANTS.LIMITS.MAX_AIRPORTS) {
      coverageErrors.push(`Maximum ${PARTNER_CONSTANTS.LIMITS.MAX_AIRPORTS} airports allowed`);
    }

    if (coverageErrors.length > 0) {
      throw new Error(`Coverage validation failed: ${coverageErrors.join(', ')}`);
    }

    const now = Date.now();
    await ctx.db.patch(partnerId, {
      serviceCoverage,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'partner.coverage_updated',
      entityType: 'yourobc_partner',
      entityId: partnerId,
      entityTitle: `Partner ${partner.companyName}`,
      description: `Updated service coverage`,
      createdAt: now,
    });

    return partnerId;
  },
});

export const togglePartnerStatus = mutation({
  args: {
    authUserId: v.string(),
    partnerId: v.id('yourobcPartners'),
  },
  handler: async (ctx, { authUserId, partnerId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, PARTNER_CONSTANTS.PERMISSIONS.EDIT);

    const partner = await ctx.db.get(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    const newStatus = partner.status === PARTNER_CONSTANTS.STATUS.ACTIVE ? 
      PARTNER_CONSTANTS.STATUS.INACTIVE : 
      PARTNER_CONSTANTS.STATUS.ACTIVE;

    const now = Date.now();
    await ctx.db.patch(partnerId, {
      status: newStatus,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'partner.status_changed',
      entityType: 'yourobc_partner',
      entityId: partnerId,
      entityTitle: `Partner ${partner.companyName}`,
      description: `Changed status from ${partner.status} to ${newStatus}`,
      createdAt: now,
    });

    return partnerId;
  },
});