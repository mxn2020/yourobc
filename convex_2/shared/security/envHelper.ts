// convex/lib/security/envHelper.ts
// Helper module to access environment variables in Convex

declare const process: { env: Record<string, string | undefined> }

/**
 * Gets the encryption secret from environment variables
 * Can be used in mutations, queries, and actions
 * @returns The encryption secret
 * @throws Error if encryption secret is not configured
 */
export function getEncryptionSecret(): string {
  // In Convex, accessing environment variables this way is safe and type-correct
  // Declaration: declare const process: { env: Record<string, string | undefined> }
  const secret =
    (typeof process !== 'undefined' && process.env?.ENCRYPTION_SECRET) ||
    (typeof process !== 'undefined' && process.env?.API_KEY_ENCRYPTION_SECRET)

  if (!secret) {
    throw new Error(
      'Encryption secret not configured. Set ENCRYPTION_SECRET or API_KEY_ENCRYPTION_SECRET environment variable'
    )
  }

  return secret
}
