// src/features/boilerplate/[module_name]/index.ts

/**
 * [Module] Feature - Public API
 * Barrel export file for clean, consistent imports
 *
 * Usage:
 *   import { use[Entities], [Entity]Card, [MODULE]_CONSTANTS } from '@/features/boilerplate/[module_name]'
 */

// ==========================================
// SERVICES
// ==========================================
export { [Entities]Service, [entities]Service } from "./services/[Entities]Service";

// ==========================================
// PAGES
// ==========================================
export { [Entities]Page } from "./pages/[Entities]Page";
export { [Entity]DetailsPage } from "./pages/[Entity]DetailsPage";
export { Create[Entity]Page } from "./pages/Create[Entity]Page";

// ==========================================
// COMPONENTS
// ==========================================
export { [Entity]Card } from "./components/[Entity]Card";
export { [Entity]Form } from "./components/[Entity]Form";
export { [Entity]FormModal } from "./components/[Entity]FormModal";
export { [Entity]Stats } from "./components/[Entity]Stats";
export { [Entities]PageHeader } from "./components/[Entities]PageHeader";
export { [Entities]Filters } from "./components/[Entities]Filters";
export { [Entity]QuickFilterBadges } from "./components/[Entity]QuickFilterBadges";
export { [Entities]Table } from "./components/[Entities]Table";
export { [Entities]HelpSection } from "./components/[Entities]HelpSection";

// ==========================================
// HOOKS - Data Fetching
// ==========================================
export {
  use[Entities],
  use[Entity],
  use[Entities]List,
  useUser[Entities],
  use[Entity]Stats,
  use[Entity]Actions,
} from "./hooks/use[Entities]";

// ==========================================
// HOOKS - Permissions
// ==========================================
export {
  use[Entity]Permissions,
  useCanCreate[Entities],
  useCanEdit[Entity],
  useCanDelete[Entity],
  use[Entity]Role,
} from "./hooks/use[Entity]Permissions";

// ==========================================
// HOOKS - Audit
// ==========================================
export { use[Entity]Audit } from "./hooks/use[Entity]Audit";

// ==========================================
// TYPES
// ==========================================
export type {
  [Entity],
  [Entity]Id,
  Create[Entity]Data,
  Update[Entity]Data,
  [Entities]ListOptions,
  [Entities]QueryResult,
  [Entity]StatsResult,
  User[Entities]Result,
  [Entity]Member,
  [Entity]MemberId,
  Add[Entity]MemberData,
  Update[Entity]MemberData,
  [Entity]ValidationError,
  [Entity]FormErrors,
} from "./types";

// ==========================================
// CONSTANTS
// ==========================================
export { [MODULE]_CONSTANTS } from "./constants";
export type {
  [Entity]Status,
  [Entity]Priority,
  [Entity]Visibility,
  [Entity]MemberRole,
  [Entity]Health,
  [Entity]SortOption,
  [Entity]ViewMode,
} from "./constants";

// ==========================================
// UTILITIES
// ==========================================
export {
  validate[Entity]Data,
  is[Entity]Overdue,
  getDaysUntilDue,
  is[Entity]DueSoon,
  is[Entity]AtRisk,
  calculate[Entity]Health,
  format[Entity]Name,
  format[Entity]Description,
  get[Entity]StatusColor,
  get[Entity]PriorityColor,
  getHealthColor,
  filter[Entities]BySearch,
  sort[Entities],
  calculateCompletionRate,
  count[Entities]ByStatus,
  count[Entities]ByPriority,
} from "./utils/{entity}Helpers";

// ==========================================
// CONFIG
// ==========================================
export { [MODULE]_CONFIG, get[Module]Config } from "./config";
export type {
  [Module]Config,
  [Module]ViewMode,
  [Module]ExportFormat,
} from "./config";
