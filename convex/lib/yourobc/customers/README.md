# YourOBC Customer Module - Implementation Documentation

## Overview

Complete customer management module for the YourOBC CRM system, implemented according to the specifications in `YOUROBC.md`. This module provides comprehensive customer data management, analytics, contact tracking, and business intelligence features.

## Table of Contents

- [Configuration](#configuration)
- [Architecture](#architecture)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Validation Rules](#validation-rules)
- [Permissions](#permissions)
- [Extending the Module](#extending-the-module)

---

## Configuration

All features are configured via the central configuration file:

**File:** `/convex/config/yourobc.ts`

### Core Features (Always Enabled)

```typescript
coreFeatures: {
  basicInfo: true,           // Company name, contacts, addresses
  businessTerms: true,       // Currency, payment terms, margins
  tags: true,                // Customer categorization
  notes: true,               // Customer and internal notes
  inquirySource: true,       // Track customer acquisition source
  status: true,              // Active/Inactive/Blacklisted management
  multipleContacts: true,    // Multiple contact persons
  billingShippingAddresses: true, // Separate billing/shipping addresses
}
```

### Enhanced Features (Can be Disabled)

```typescript
enhancedFeatures: {
  // Contact Protocol & Follow-up
  contactProtocol: false,    // Contact logging with date/time/channel
  followUpReminders: false,  // Manual and automatic reminders
  inactivityAlerts: false,   // Alert after X days without contact (default: 35)

  // Payment & Dunning
  dunningSystem: false,      // Payment reminder system
  customPaymentTerms: false, // Customer-specific payment rules
  serviceSuspension: false,  // Auto-suspend service after X dunning levels

  // Margin Management
  advancedMargins: false,    // Service/route/volume-based margins
  marginCalculator: false,   // Preview margin calculations
  minimumMargin: false,      // Support for % + minimum EUR logic

  // Analytics & Insights
  customerAnalytics: false,  // Lifetime value, payment behavior
  performanceMetrics: false, // Customer scoring and risk levels
  standardRoutes: false,     // Frequently used routes per customer
  conversionTracking: false, // Quote-to-order conversion rates
}
```

### Field Limits

```typescript
limits: {
  maxCompanyNameLength: 200,
  maxShortNameLength: 50,
  maxContactNameLength: 100,
  maxEmailLength: 100,
  maxPhoneLength: 20,
  maxWebsiteLength: 200,
  maxNotesLength: 5000,
  maxInternalNotesLength: 5000,
  maxTags: 20,
  maxContacts: 10,
  minPaymentTerms: 0,
  maxPaymentTerms: 365,       // Maximum 1 year
  minMargin: -100,            // Allow negative margins (loss leaders)
  maxMargin: 1000,            // Up to 1000% markup
}
```

### Default Values

```typescript
defaults: {
  status: 'active',
  currency: 'EUR',
  paymentTerms: 30,           // Net 30 days
  paymentMethod: 'bank_transfer',
  margin: 0,                  // 0% default margin
  inactivityThresholdDays: 35,
  riskLevel: 'medium',
  score: 0,
}
```

---

## Architecture

### Module Structure

```
convex/lib/yourobc/customers/
├── index.ts                 # Main exports
├── types.ts                 # TypeScript type definitions
├── validators.ts            # Input validation schemas
├── constants.ts             # Module constants
├── mutations.ts             # Create, update, delete operations
├── queries.ts               # Read operations
├── utils.ts                 # Utility functions
├── README.md                # This file
├── analytics/               # Customer analytics submodule
│   ├── index.ts
│   ├── queries.ts
│   └── mutations.ts
├── contacts/                # Contact protocol submodule
│   ├── index.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── utils.ts
├── margins/                 # Advanced margin management
│   ├── index.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── utils.ts
└── dunning/                 # Payment dunning management
    ├── index.ts
    ├── queries.ts
    └── mutations.ts
```

### Database Tables

- **yourobcCustomers** - Main customer data
- **yourobcInquirySources** - Customer acquisition sources
- **yourobcCustomerMargins** - Advanced margin rules
- **yourobcContactLog** - Contact history
- **yourobcCustomerAnalytics** - Analytics snapshots
- **yourobcCustomerDunningConfig** - Dunning configuration

---

## Features

### 1. Core Customer Management

#### Basic Information
- Company name (required, max 200 chars)
- Short name for display (optional, max 50 chars)
- Website URL (optional, max 200 chars)
- Status: active | inactive | blacklisted

#### Contact Management
- Primary contact (required)
  - Name, email, phone
  - Validated email format
  - Role/position
- Multiple additional contacts (max 10)
- Contact validation and sanitization

#### Address Management
- Billing address (required)
  - Street, city, postal code
  - Country and country code
- Shipping address (optional)
- Formatted address strings for display

#### Financial Settings
- Default currency (EUR | USD)
- Payment terms (0-365 days)
- Payment method (bank_transfer, credit_card, cash, check, paypal, wire_transfer)
- Default margin percentage (-100% to 1000%)

#### Classification & Organization
- Inquiry source tracking (where did this customer come from?)
- Tags for categorization (max 20 tags)
- Customer notes (public, max 5000 chars)
- Internal notes (private, max 5000 chars)

### 2. Statistics Tracking

Automatically tracked for each customer:
- Total quotes issued
- Accepted quotes count
- Rejected quotes count
- Total revenue (all-time)
- Total margin (all-time)
- Average margin percentage
- Total shipments
- Last quote date
- Last shipment date
- Last invoice date

### 3. Customer Scoring & Risk Assessment

**Customer Score** (0-100):
- Revenue score (40% weight)
- Activity score (30% weight)
- Payment score (20% weight)
- Longevity score (10% weight)

**Risk Level** (low | medium | high):
- Based on payment behavior
- Outstanding invoice amounts
- Payment delay patterns
- Automatic calculation

### 4. Advanced Margin Management

When `enhancedFeatures.advancedMargins` is enabled:

**Margin Types:**
- **Percentage** - Fixed percentage markup
- **Fixed** - Fixed amount in EUR/USD
- **Hybrid** - Percentage OR minimum amount (whichever is higher)

**Margin Rules:**
- Default margin (applies to all quotes)
- Service-specific margins (OBC vs NFO)
- Route-specific margins (origin/destination country)
- Volume-based margins (min/max quantity)
- Priority-based rule application

**Example Hybrid Margin:**
```typescript
{
  type: 'hybrid',
  percentage: 15,         // 15% margin
  minimumAmount: 50,      // OR minimum €50
  currency: 'EUR'
}
// Result: Higher of (15% of cost) or (€50)
```

### 5. Contact Protocol

When `enhancedFeatures.contactProtocol` is enabled:

**Contact Logging:**
- Date and time of contact
- Contact channel (email, phone, WhatsApp, meeting)
- Contact subject/reason
- Notes about the conversation
- Next follow-up date
- Logged by user

**Follow-up Reminders:**
- Manual reminder creation
- Automatic reminder generation
- Assigned to specific users
- Due date tracking
- Status: pending | completed | cancelled

**Inactivity Alerts:**
- Alert after X days without contact (default: 35 days)
- Configurable threshold per customer
- In-app and email notifications

### 6. Customer Analytics

When `enhancedFeatures.customerAnalytics` is enabled:

**Lifetime Value Analysis:**
- Total revenue to date
- Total margin to date
- Average order value
- Order frequency
- Customer lifespan in days
- Projected lifetime value

**Payment Behavior:**
- Average payment delay (days)
- On-time payment rate (%)
- Late payment count
- Total invoices
- Outstanding amount
- Credit rating

**Standard Routes:**
- Most frequently used origin/destination pairs
- Revenue per route
- Quote count per route

**Top Services:**
- Most used services (OBC vs NFO)
- Revenue per service type
- Quote count per service

### 7. Payment Dunning

When `enhancedFeatures.dunningSystem` is enabled:

**Dunning Configuration (Per Customer):**
- First reminder: +7 days after due date (configurable)
- Second reminder: +14 days after due date (configurable)
- Third reminder: +21 days after due date (configurable)
- Custom dunning fees per level
- Currency for fees (EUR | USD)

**Service Suspension:**
- Automatic suspension at dunning level 3 (configurable)
- Manual override available
- Reactivation tracking
- Suspension reason logging

---

## Database Schema

### yourobcCustomers Table

```typescript
{
  // Core Identity
  companyName: string                    // Required, max 200 chars
  shortName?: string                     // Optional, max 50 chars
  website?: string                       // Optional, max 200 chars

  // Contact Information
  primaryContact: {
    name: string                         // Required, max 100 chars
    email?: string                       // Optional, validated
    phone?: string                       // Optional, max 20 chars
    role?: string
  }
  additionalContacts: Contact[]          // Max 10 contacts

  // Address Information
  billingAddress: {
    street?: string
    city: string                         // Required
    postalCode?: string
    country: string                      // Required
    countryCode: string                  // Required (e.g., 'DE', 'US')
  }
  shippingAddress?: Address              // Optional

  // Financial Settings
  defaultCurrency: 'EUR' | 'USD'
  paymentTerms: number                   // 0-365 days
  paymentMethod: string
  margin: number                         // -100 to 1000 percent

  // Status & Classification
  status: 'active' | 'inactive' | 'blacklisted'
  inquirySourceId?: Id<'yourobcInquirySources'>

  // Service Suspension Tracking
  serviceSuspended?: boolean
  serviceSuspendedDate?: number
  serviceSuspendedReason?: string
  serviceReactivatedDate?: number

  // Statistics
  stats: {
    totalQuotes: number
    acceptedQuotes: number
    rejectedQuotes: number
    totalRevenue: number
    totalMargin: number
    averageMargin: number
    totalShipments: number
    lastQuoteDate?: number
    lastShipmentDate?: number
    lastInvoiceDate?: number
  }

  // Notes
  notes?: string                         // Max 5000 chars
  internalNotes?: string                 // Max 5000 chars

  // Metadata
  tags: string[]                         // Max 20 tags

  // Audit Fields
  createdAt: number
  updatedAt: number
  createdBy: string
  deletedAt?: number                     // Soft delete
  deletedBy?: string
}
```

**Indexes:**
- `by_companyName` - Search by company name
- `by_status` - Filter by status
- `by_country` - Geographic filtering
- `by_inquirySource` - Track acquisition sources
- `by_created` - Sort by creation date
- `by_deleted` - Filter soft-deleted customers

### yourobcInquirySources Table

```typescript
{
  name: string
  type: 'whatsapp' | 'email' | 'phone' | 'website' | 'referral' | 'other'
  description?: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}
```

---

## API Reference

### Mutations

#### `createCustomer`

Creates a new customer in the system.

**Arguments:**
```typescript
{
  authUserId: string
  data: {
    companyName: string              // Required
    primaryContact: Contact          // Required
    billingAddress: Address          // Required
    shortName?: string
    website?: string
    additionalContacts?: Contact[]
    shippingAddress?: Address
    defaultCurrency?: 'EUR' | 'USD'
    paymentTerms?: number
    paymentMethod?: string
    margin?: number
    inquirySourceId?: Id
    tags?: string[]
    notes?: string
    internalNotes?: string
  }
}
```

**Returns:** `Id<'yourobcCustomers'>`

**Validation:**
- Company name must be unique
- All field length limits enforced
- Email format validated
- Payment terms: 0-365 days
- Margin: -100% to 1000%
- Max 20 tags, max 10 contacts

**Permissions:** `customers.create` (admin, superadmin)

**Example:**
```typescript
const customerId = await createCustomer(ctx, {
  authUserId: 'user_123',
  data: {
    companyName: 'Acme Corporation',
    shortName: 'ACME',
    primaryContact: {
      name: 'John Doe',
      email: 'john@acme.com',
      phone: '+1-555-0100',
      role: 'Logistics Manager'
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      postalCode: '10001',
      country: 'United States',
      countryCode: 'US'
    },
    defaultCurrency: 'USD',
    paymentTerms: 30,
    margin: 15,
    tags: ['vip', 'usa'],
  }
})
```

#### `updateCustomer`

Updates an existing customer.

**Arguments:**
```typescript
{
  authUserId: string
  customerId: Id<'yourobcCustomers'>
  data: {
    // All fields optional
    companyName?: string
    status?: CustomerStatus
    primaryContact?: Contact
    // ... (same as createCustomer, all optional)
  }
}
```

**Returns:** `Id<'yourobcCustomers'>`

**Validation:**
- Same as createCustomer
- Company name uniqueness checked if changed

**Permissions:** `customers.edit` (admin, superadmin)

#### `deleteCustomer`

Soft deletes a customer (marks as deleted, doesn't remove from database).

**Arguments:**
```typescript
{
  authUserId: string
  customerId: Id<'yourobcCustomers'>
}
```

**Returns:** `Id<'yourobcCustomers'>`

**Business Rules:**
- Cannot delete if customer has active quotes
- Cannot delete if customer has shipments
- Cannot delete if customer has invoices
- Soft delete only (sets `deletedAt` timestamp)

**Permissions:** `customers.delete` (admin, superadmin)

#### `updateCustomerStats`

Updates customer statistics (typically called by system processes).

**Arguments:**
```typescript
{
  customerId: Id<'yourobcCustomers'>
  stats: {
    totalQuotes?: number
    acceptedQuotes?: number
    totalRevenue?: number
    // ... (all fields optional)
  }
}
```

**Returns:** `Id<'yourobcCustomers'>`

**Note:** This is typically called automatically when quotes/shipments/invoices are created.

#### `addCustomerTag`

Adds a tag to a customer.

**Arguments:**
```typescript
{
  authUserId: string
  customerId: Id<'yourobcCustomers'>
  tag: string
}
```

**Returns:** `Id<'yourobcCustomers'>`

**Validation:**
- Tag is trimmed and normalized
- Duplicate tags rejected
- Max 20 tags per customer

**Permissions:** `customers.edit`

#### `removeCustomerTag`

Removes a tag from a customer.

**Arguments:**
```typescript
{
  authUserId: string
  customerId: Id<'yourobcCustomers'>
  tag: string
}
```

**Returns:** `Id<'yourobcCustomers'>`

**Permissions:** `customers.edit`

---

### Queries

#### `getCustomers`

Retrieves a paginated list of customers with filtering and sorting.

**Arguments:**
```typescript
{
  authUserId: string
  options?: {
    limit?: number                    // Default: 50
    offset?: number                   // Default: 0
    sortBy?: string                   // Default: 'companyName'
    sortOrder?: 'asc' | 'desc'        // Default: 'asc'
    filters?: {
      status?: CustomerStatus[]
      countries?: string[]
      currencies?: ('EUR' | 'USD')[]
      paymentMethods?: string[]
      inquirySources?: Id[]
      tags?: string[]
      search?: string                 // Search across multiple fields
      hasRecentActivity?: boolean     // Active in last 90 days
      minRevenue?: number
      maxRevenue?: number
      minPaymentTerms?: number
      maxPaymentTerms?: number
    }
  }
}
```

**Returns:**
```typescript
{
  customers: CustomerWithDetails[]
  total: number
  hasMore: boolean
}
```

**Permissions:** `customers.view`

**Example:**
```typescript
const result = await getCustomers(ctx, {
  authUserId: 'user_123',
  options: {
    limit: 25,
    sortBy: 'totalRevenue',
    sortOrder: 'desc',
    filters: {
      status: ['active'],
      countries: ['US', 'DE'],
      hasRecentActivity: true,
      minRevenue: 10000
    }
  }
})
```

#### `getCustomer`

Retrieves detailed information for a single customer.

**Arguments:**
```typescript
{
  authUserId: string
  customerId?: Id<'yourobcCustomers'>
}
```

**Returns:** `CustomerWithActivity | null`

**Includes:**
- Full customer data
- Inquiry source details
- Calculated score and risk level
- Recent activity summary (quotes, shipments, invoices)
- Outstanding invoice information

**Permissions:** `customers.view`

#### `getCustomerStats`

Retrieves aggregate statistics across all customers.

**Arguments:**
```typescript
{
  authUserId: string
}
```

**Returns:**
```typescript
{
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  blacklistedCustomers: number
  customersByCountry: Record<string, number>
  customersByCurrency: Record<string, number>
  averagePaymentTerms: number
  totalRevenue: number
  newCustomersThisMonth: number
}
```

**Permissions:** `customers.view_stats`

#### `searchCustomers`

Fast search across customer data.

**Arguments:**
```typescript
{
  authUserId: string
  searchTerm: string                  // Min 2 characters
  limit?: number                      // Default: 20
  includeInactive?: boolean           // Default: false
}
```

**Returns:** `CustomerWithDetails[]`

**Searches:**
- Company name
- Short name
- Primary contact name
- Primary contact email
- Primary contact phone
- Website
- Tags

**Permissions:** `customers.view`

#### `getCustomerActivity`

Retrieves recent activity (quotes, shipments, invoices) for a customer.

**Arguments:**
```typescript
{
  authUserId: string
  customerId?: Id<'yourobcCustomers'>
  limit?: number                      // Default: 50
}
```

**Returns:**
```typescript
{
  activities: Activity[]              // Sorted by date (newest first)
  summary: {
    totalQuotes: number
    totalShipments: number
    totalInvoices: number
  }
}
```

**Permissions:** `customers.view`

#### `getTopCustomers`

Retrieves top customers ranked by revenue, quotes, or score.

**Arguments:**
```typescript
{
  authUserId: string
  limit?: number                      // Default: 10
  sortBy?: 'revenue' | 'quotes' | 'score'  // Default: 'revenue'
}
```

**Returns:** `TopCustomerEntry[]`

**Note:** Only includes active customers

**Permissions:** `customers.view_stats`

#### `getCustomerTags`

Retrieves all unique tags with usage counts.

**Arguments:**
```typescript
{
  authUserId: string
}
```

**Returns:**
```typescript
Array<{
  tag: string
  count: number
}>
```

**Sorted by:** Usage count (descending)

**Permissions:** `customers.view`

---

## Usage Examples

### Creating a Customer

```typescript
import { createCustomer } from 'convex/lib/yourobc/customers'

const customerId = await createCustomer(ctx, {
  authUserId: currentUser._id,
  data: {
    companyName: 'Global Logistics GmbH',
    shortName: 'GLGMBH',
    primaryContact: {
      name: 'Maria Schmidt',
      email: 'maria@globallogistics.de',
      phone: '+49-30-12345678',
      role: 'Head of Procurement'
    },
    billingAddress: {
      street: 'Friedrichstraße 123',
      city: 'Berlin',
      postalCode: '10117',
      country: 'Germany',
      countryCode: 'DE'
    },
    defaultCurrency: 'EUR',
    paymentTerms: 30,
    paymentMethod: 'bank_transfer',
    margin: 18,
    tags: ['germany', 'vip', 'high-volume'],
    notes: 'Main customer for German market',
    internalNotes: 'Always require 2 business days for approval'
  }
})
```

### Searching Customers

```typescript
import { searchCustomers } from 'convex/lib/yourobc/customers'

const results = await searchCustomers(ctx, {
  authUserId: currentUser._id,
  searchTerm: 'logistics',
  limit: 10,
  includeInactive: false
})

results.forEach(customer => {
  console.log(`${customer.companyName} - ${customer.primaryContact.email}`)
})
```

### Getting Top Customers

```typescript
import { getTopCustomers } from 'convex/lib/yourobc/customers'

const topByRevenue = await getTopCustomers(ctx, {
  authUserId: currentUser._id,
  limit: 5,
  sortBy: 'revenue'
})

topByRevenue.forEach((customer, index) => {
  console.log(`${index + 1}. ${customer.companyName}: €${customer.stats.totalRevenue}`)
})
```

### Filtering Customers

```typescript
import { getCustomers } from 'convex/lib/yourobc/customers'

const germanVIPs = await getCustomers(ctx, {
  authUserId: currentUser._id,
  options: {
    filters: {
      countries: ['DE'],
      tags: ['vip'],
      status: ['active'],
      minRevenue: 50000
    },
    sortBy: 'totalRevenue',
    sortOrder: 'desc'
  }
})
```

---

## Validation Rules

### Field Validation

All input data is validated against business rules:

| Field | Rule | Error Code |
|-------|------|------------|
| companyName | Required, max 200 chars | REQUIRED, MAX_LENGTH |
| shortName | Max 50 chars | MAX_LENGTH |
| website | Max 200 chars, valid URL | MAX_LENGTH, INVALID_FORMAT |
| notes | Max 5000 chars | MAX_LENGTH |
| internalNotes | Max 5000 chars | MAX_LENGTH |
| tags | Max 20 tags, valid format | MAX_COUNT, INVALID_FORMAT |
| additionalContacts | Max 10 contacts | MAX_COUNT |
| primaryContact.name | Required, max 100 chars | REQUIRED, MAX_LENGTH |
| primaryContact.email | Valid email format, max 100 chars | INVALID_FORMAT, MAX_LENGTH |
| primaryContact.phone | Max 20 chars | MAX_LENGTH |
| paymentTerms | 0-365 days | OUT_OF_RANGE |
| margin | -100% to 1000% | OUT_OF_RANGE |

### Email Validation

```typescript
import { validateEmail } from 'convex/lib/yourobc/customers'

if (!validateEmail('test@example.com')) {
  throw new Error('Invalid email format')
}
```

### Website Validation

```typescript
import { validateWebsite } from 'convex/lib/yourobc/customers'

if (!validateWebsite('https://example.com')) {
  throw new Error('Invalid website URL')
}
```

### Tag Validation

```typescript
import { validateTag, sanitizeTag } from 'convex/lib/yourobc/customers'

const tag = sanitizeTag(' VIP Customer ')  // Result: 'vip customer'
if (!validateTag(tag)) {
  throw new Error('Invalid tag format')
}
```

---

## Permissions

### Permission Levels

| Permission | Description | Roles |
|------------|-------------|-------|
| `customers.view` | View customer data | All roles |
| `customers.create` | Create new customers | admin, superadmin |
| `customers.edit` | Update customer data | admin, superadmin |
| `customers.delete` | Delete customers | admin, superadmin |
| `customers.view_stats` | View aggregate statistics | admin, superadmin, manager |
| `customers.export` | Export customer data | admin, superadmin |

### Checking Permissions

```typescript
import { requirePermission } from 'convex/lib/auth.helper'

await requirePermission(ctx, authUserId, 'customers.create')
```

---

## Extending the Module

### Adding Custom Fields

To add custom fields to the customer schema:

1. Update the schema in `/convex/schema/yourobc/customers.ts`
2. Update types in `/convex/lib/yourobc/customers/types.ts`
3. Update validators in `/convex/lib/yourobc/customers/validators.ts`
4. Update mutations/queries as needed
5. Run type check: `npx convex dev`

### Adding New Features

1. Enable feature in config: `/convex/config/yourobc.ts`
2. Create submodule if needed (e.g., `/analytics`, `/contacts`)
3. Add database table if needed
4. Implement queries and mutations
5. Export from main index file
6. Update documentation

### Custom Margin Rules

```typescript
import { margins } from 'convex/lib/yourobc/customers'

// Add route-specific margin
await margins.createMarginRule(ctx, {
  customerId: 'customer_123',
  ruleType: 'route',
  marginType: 'hybrid',
  percentage: 20,
  minimumAmount: 100,
  currency: 'EUR',
  originCountry: 'DE',
  destinationCountry: 'US',
  priority: 10,
  isActive: true
})
```

---

## Testing

### Unit Tests

```bash
# Run all customer module tests
npm test -- customers

# Run specific test file
npm test -- customers.mutations.test.ts
```

### Integration Tests

```bash
# Run integration tests
npm test -- integration/customers
```

### Validation Tests

```typescript
import { validateCustomerData } from 'convex/lib/yourobc/customers'

const errors = validateCustomerData({
  companyName: '',  // Should fail - required
  paymentTerms: 500,  // Should fail - out of range
})

expect(errors.length).toBe(2)
expect(errors[0].code).toBe('REQUIRED')
expect(errors[1].code).toBe('OUT_OF_RANGE')
```

---

## Migration Guide

### Migrating from Legacy System

1. Export customer data in JSON format
2. Map fields to new schema
3. Use `createCustomer` mutation for each customer
4. Verify data integrity
5. Update references in quotes/shipments/invoices

### Example Migration Script

```typescript
async function migrateCustomers(legacyData: LegacyCustomer[]) {
  for (const legacy of legacyData) {
    await createCustomer(ctx, {
      authUserId: 'migration_user',
      data: {
        companyName: legacy.name,
        shortName: legacy.shortName,
        primaryContact: {
          name: legacy.contactName,
          email: legacy.contactEmail,
          phone: legacy.contactPhone,
        },
        billingAddress: {
          street: legacy.address,
          city: legacy.city,
          postalCode: legacy.zip,
          country: legacy.country,
          countryCode: legacy.countryCode,
        },
        defaultCurrency: legacy.currency,
        paymentTerms: legacy.paymentDays,
        margin: legacy.defaultMargin,
        tags: legacy.tags?.split(',') || [],
        notes: legacy.notes,
      }
    })
  }
}
```

---

## Troubleshooting

### Common Issues

**Issue:** 'A customer with this company name already exists'
- **Solution:** Company names must be unique. Use a different name or update the existing customer.

**Issue:** 'Maximum 20 tags allowed'
- **Solution:** Remove unnecessary tags or consolidate related tags.

**Issue:** 'Cannot delete customer with existing quotes'
- **Solution:** Cannot delete customers with business records. Set status to 'inactive' instead.

**Issue:** 'Payment terms must be between 0 and 365 days'
- **Solution:** Use valid payment terms. For special cases, contact admin.

**Issue:** 'Invalid email format'
- **Solution:** Ensure email follows standard format: `user@domain.com`

---

## Support

For questions or issues:

1. Check this documentation
2. Review configuration: `/convex/config/yourobc.ts`
3. Check schema: `/convex/schema/yourobc/customers.ts`
4. Review YOUROBC.md specification
5. Contact development team

---

## Changelog

### Version 1.0.0 (2025-01-XX)

**Initial Release:**
- ✅ Core customer management (CRUD operations)
- ✅ Multiple contacts per customer
- ✅ Billing and shipping addresses
- ✅ Financial settings (currency, payment terms, margin)
- ✅ Customer categorization (tags, inquiry source)
- ✅ Statistics tracking
- ✅ Customer scoring and risk assessment
- ✅ Comprehensive validation
- ✅ Permissions system
- ✅ Search and filtering
- ✅ Soft delete support
- ✅ Audit logging
- ✅ Configuration-based feature flags
- ✅ Submodules: analytics, contacts, margins, dunning
- ✅ Full TypeScript support
- ✅ Comprehensive documentation

---

*Last updated: 2025-01-03*
*Module version: 1.0.0*
*Specification: YOUROBC.md*
