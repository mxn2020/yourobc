// convex/schema.ts
// Central Convex schema definition
// Includes both system tables and YouROBC business entity tables

import { defineSchema } from 'convex/server'

import { systemSchemas } from './schema/system'
import {
  yourobcAccountingSchemas,
  yourobcCouriersSchemas,
  yourobcCustomerMarginsSchemas,
  yourobcCustomersSchemas,
  yourobcDashboardSchemas,
  yourobcEmployeeCommissionsSchemas,
  yourobcEmployeeKpisSchemas,
  yourobcEmployeeSessionsSchemas,
  yourobcEmployeesSchemas,
  yourobcInvoicesSchemas,
  yourobcPartnersSchemas,
  yourobcQuotesSchemas,
  yourobcShipmentsSchemas,
  yourobcStatisticsSchemas,
  yourobcSupportingSchemas,
  yourobcTasksSchemas,
  yourobcTrackingMessagesSchemas,
} from './schema/yourobc/index'

const schema = defineSchema({
  // System Tables
  ...systemSchemas,

  // YouROBC Modules (all tables prefixed with 'yourobc')
  ...yourobcAccountingSchemas,
  ...yourobcCouriersSchemas,
  ...yourobcCustomerMarginsSchemas,
  ...yourobcCustomersSchemas,
  ...yourobcDashboardSchemas,
  ...yourobcEmployeeCommissionsSchemas,
  ...yourobcEmployeeKpisSchemas,
  ...yourobcEmployeeSessionsSchemas,
  ...yourobcEmployeesSchemas,
  ...yourobcInvoicesSchemas,
  ...yourobcPartnersSchemas,
  ...yourobcQuotesSchemas,
  ...yourobcShipmentsSchemas,
  ...yourobcStatisticsSchemas,
  ...yourobcSupportingSchemas,
  ...yourobcTasksSchemas,
  ...yourobcTrackingMessagesSchemas,
})

export default schema
