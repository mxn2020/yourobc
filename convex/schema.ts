// convex/schema.ts
// Central Convex schema definition
// Includes both system tables and YouROBC business entity tables

import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

import { systemSchemas } from './schema/system'
import { yourobcSchemas } from './schema/yourobc'
import { projectsSchemas } from './schema/projects'
import { marketingSchemas } from './schema/marketing'

const schema = defineSchema({
  // System Tables
  ...systemSchemas,

  // YouROBC Tables
  ...yourobcSchemas,

  // Projects Module Tables
  ...projectsSchemas,

  ...marketingSchemas

})

export default schema
