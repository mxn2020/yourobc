// convex/schema/{category}/{entity}/{module}/schemas.ts
// Schema exports for {module} module

import { {module}Table } from './tables';

/**
 * Schema export object for registration in main schema.ts
 * Naming: {category}{Entity}{Module}Schemas
 */
export const {category}{Entity}{Module}Schemas = {
  {tableName}: {module}Table,
};

// Multi-table example:
// export const {category}{Entity}{Module}Schemas = {
//   {tableName}: {module}Table,
//   {tableName2}: {subModule}Table,
// };

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating schemas.ts:
 * [ ] Import table from ./tables
 * [ ] Export as {category}{Entity}{Module}Schemas
 * [ ] Use correct {tableName} key (camelCase)
 * [ ] Add all tables for multi-table modules
 * [ ] Register in main schema.ts
 *
 * DO:
 * [ ] Use PascalCase for export name
 * [ ] Use camelCase for table name keys
 * [ ] Follow naming convention exactly
 * [ ] Include all tables in module
 *
 * DON'T:
 * [ ] Use different naming patterns
 * [ ] Skip table registration
 * [ ] Use snake_case for table names
 * [ ] Forget to import in schema.ts
 */
