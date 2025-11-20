// convex/schema.ts

import { defineSchema } from 'convex/server'

import { systemSchemas } from './schema/system'
import { gameSchemas } from './schema/games'
import { addonsSchemas } from './schema/addons'
import { appsSchemas } from './schema/apps'
import { externalSchemas } from './schema/external'
import { softwareSchemas } from './schema/software'

const schema = defineSchema({

  // System System Tables
  ...systemSchemas,

  // Games engine schemas
  ...gameSchemas,

  // Addons schemas
  ...addonsSchemas,

  // Apps schemas
  ...appsSchemas,

  // External Projects schemas
  ...externalSchemas,

  // Software schemas
  ...softwareSchemas, 

})

export default schema

