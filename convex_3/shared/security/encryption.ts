// convex/lib/security/encryption.ts
// AES-GCM encryption for sensitive data (API keys, credentials)

/**
 * EncryptedPayload represents the structure of encrypted data
 * Includes IV (initialization vector) and ciphertext
 */
interface EncryptedPayload {
  iv: string // Base64 encoded IV
  ciphertext: string // Base64 encoded ciphertext
}

/**
 * Derives a consistent 256-bit key from the encryption secret
 * Uses SHA-256 to ensure proper key length for AES-256
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const data = encoder.encode(secret)

  // Use SHA-256 to derive a consistent key from the secret
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  return await crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param plaintext - The data to encrypt
 * @param secret - The encryption secret (should come from environment variables)
 * @returns JSON string containing base64-encoded IV and ciphertext
 */
export async function encryptSensitiveData(plaintext: string, secret: string): Promise<string> {
  if (!plaintext || !secret) {
    throw new Error('Both plaintext and secret are required for encryption')
  }

  try {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const data = encoder.encode(plaintext)

    // Generate random 96-bit IV (12 bytes) for GCM
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Derive encryption key
    const key = await deriveKey(secret)

    // Encrypt using AES-GCM
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    )

    // Package the result
    const payload: EncryptedPayload = {
      iv: btoa(String.fromCharCode(...iv)),
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    }

    return JSON.stringify(payload)
  } catch (error) {
    throw new Error(
      `Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Decrypts data that was encrypted with encryptSensitiveData
 * @param encrypted - JSON string containing base64-encoded IV and ciphertext
 * @param secret - The encryption secret (must match the one used during encryption)
 * @returns Decrypted plaintext
 */
export async function decryptSensitiveData(encrypted: string, secret: string): Promise<string> {
  if (!encrypted || !secret) {
    throw new Error('Both encrypted data and secret are required for decryption')
  }

  try {
    const decoder = new TextDecoder()

    // Parse the encrypted payload
    let payload: EncryptedPayload
    try {
      payload = JSON.parse(encrypted)
    } catch {
      throw new Error('Invalid encrypted data format')
    }

    if (!payload.iv || !payload.ciphertext) {
      throw new Error('Encrypted payload missing required fields')
    }

    // Decode IV and ciphertext from base64
    const iv = new Uint8Array(atob(payload.iv).split('').map((c) => c.charCodeAt(0)))
    const ciphertext = new Uint8Array(
      atob(payload.ciphertext).split('').map((c) => c.charCodeAt(0))
    )

    // Derive decryption key
    const key = await deriveKey(secret)

    // Decrypt using AES-GCM
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      ciphertext
    )

    return decoder.decode(decryptedBuffer)
  } catch (error) {
    throw new Error(
      `Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
