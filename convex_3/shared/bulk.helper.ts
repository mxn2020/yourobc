// convex/lib/shared/bulk.helper.ts

export function chunkIds<T>(ids: T[], size = 50): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    out.push(ids.slice(i, i + size));
  }
  return out;
}
