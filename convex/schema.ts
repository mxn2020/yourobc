// convex/schema.ts

import { defineSchema } from 'convex/server'

import { boilerplateSchemas } from './schema/boilerplate'
import { gameSchemas } from './schema/games'
import { addonsSchemas } from './schema/addons'
import { appsSchemas } from './schema/apps'
import { externalSchemas } from './schema/external'
import { softwareSchemas } from './schema/software'

const schema = defineSchema({

  // Boilerplate System Tables
  ...boilerplateSchemas,

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

