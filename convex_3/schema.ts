// convex/schema.ts
// Central Convex schema definition
// Includes both system tables and YouROBC business entity tables

import { defineSchema } from 'convex/server'

import { systemSchemas } from './schema/system'
import { yourobcSchemas } from './schema/yourobc'

const schema = defineSchema({
  // System Tables
  ...systemSchemas,

  // YouROBC Tables
  ...yourobcSchemas,
  
})

export default schema
