// convex/lib/shared/db.helper.ts
import { FilterBuilder } from "convex/server";

/**
 * Standard soft-delete filter.
 * Usage: .filter(notDeleted)
 */
export const notDeleted = (q: FilterBuilder<any>) =>
  q.eq(q.field("deletedAt"), undefined);
