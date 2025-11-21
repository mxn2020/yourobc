// convex/lib/yourobc/customers/bulkHelpers.ts

import { Id } from "@/generated/dataModel";
import { MutationCtx } from "@/generated/server";
import { UserProfile } from "@/schema/system";
import { Customer } from "./types";

export type BulkFailure = { id: Id<'yourobcCustomers'>; reason: string };
export type BulkSuccess = { id: Id<'yourobcCustomers'>; success: true };

export type BulkResult = BulkSuccess | (BulkFailure & { success?: false });

export async function processCustomerBulk(
  ctx: MutationCtx,
  user: UserProfile,
  customerId: Id<'yourobcCustomers'>,
  {
    ensureAllowed,
    perform,
  }: {
    ensureAllowed: (customer: Customer, user: UserProfile) => Promise<boolean> | boolean;
    perform: (customer: Customer) => Promise<void>;
  },
): Promise<BulkResult> {
  try {
    const customer = await ctx.db.get<'yourobcCustomers'>(customerId);

    if (!customer || customer.deletedAt) {
      return { id: customerId, reason: 'Not found' };
    }

    const allowed = await ensureAllowed(customer, user);
    if (!allowed) {
      return { id: customerId, reason: 'No permission' };
    }

    await perform(customer);

    return { id: customerId, success: true };
  } catch (error: any) {
    return {
      id: customerId,
      reason: error?.message ?? 'Unexpected error',
    };
  }
}

export function splitBulkResults(results: BulkResult[]) {
  const succeeded: BulkSuccess[] = [];
  const failed: BulkFailure[] = [];

  for (const r of results) {
    if ('success' in r && r.success) {
      succeeded.push(r);
    } else {
      failed.push({ id: r.id, reason: r.reason });
    }
  }

  return { succeeded, failed };
}

