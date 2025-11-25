# Pre-Implementation Checklist

Before creating any files, check off these items:

## Module Planning
- [ ] Choose category (`addons`, `apps`, `external`, `games`, `software`)
- [ ] Define entity name (use snake_case)
- [ ] Define module name (snake_case, plural)
- [ ] Check folder name doesn't use reserved words (`logs`, `templates`)
- [ ] Decide on structure pattern (flat, nested, sibling)
- [ ] Prepare placeholder replacements table

## Schema Requirements
- [ ] Decide if `ownerId` will be required (default yes). Common exemptions:
  - System lookup tables (currencies, countries)
  - Event/log tables (use `userId`)
  - Join tables with indirect ownership
- [ ] Choose display field: `name`, `title`, or `displayName`
- [ ] Determine if search indexes are needed
- [ ] List required indexes based on expected queries

## Directory Structure
- [ ] Create schema directory: `convex/schema/{category}/{entity}/{module}/`
- [ ] Create library directory: `convex/lib/{category}/{entity}/{module}/`
- [ ] Create placeholder reference file

## Next Steps
Once checklist is complete:
1. **Create directory structure** using scaffold command
2. **Move to [Schema Implementation](../01-CORE/02-schema.md)**
3. **Keep placeholder reference table** handy for find-and-replace
4. **Start with validators.ts** in schema directory
