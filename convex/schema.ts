// convex/schema.ts

import { defineSchema } from 'convex/server'

import { systemSchemas } from './schema/system'

const schema = defineSchema({

  // System System Tables
  ...systemSchemas,

})

export default schema

