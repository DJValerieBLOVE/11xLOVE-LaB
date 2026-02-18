/**
 * useEncryptedStorage Hook
 * 
 * Provides NIP-44 encryption for private user data
 * Data encrypted with user's key - only they can read it
 * Even admin cannot see this data!
 * 
 * Used for:
 * - Big Dreams
 * - Daily 5 V's entries
 * - Journal/Lab Notes
 * - Magic Mentor memory
 * - Progress tracking
 * 
 * FALLBACK: If NIP-44 is not available (mobile browsers, simple signers),
 * data is stored as plaintext on the private Railway relay.
 * The relay itself is still private (NIP-42 auth required).
 */

import { useCallback } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface EncryptedStorageResult {
  /** Encrypt data to self (only user can decrypt). Falls back to JSON stringify if NIP-44 unavailable. */
  encrypt: (data: unknown) => Promise<string>;
  /** Decrypt data from self. Falls back to JSON parse if not encrypted. */
  decrypt: (encryptedData: string) => Promise<unknown>;
  /** Check if NIP-44 encryption is available */
  isAvailable: boolean;
  /** Check if user is logged in at all */
  isLoggedIn: boolean;
  /** Error message if encryption not available */
  error: string | null;
}

/**
 * Safely check if NIP-44 is available without throwing.
 * The extension signer throws "Browser extension not available" when accessed
 * without an extension installed — we must wrap in try/catch.
 */
function checkNip44Available(user: ReturnType<typeof useCurrentUser>['user']): boolean {
  if (!user) return false;
  try {
    return !!(user.signer?.nip44);
  } catch {
    return false;
  }
}

/**
 * Hook for encrypting/decrypting private data using NIP-44.
 * 
 * Gracefully degrades: if NIP-44 is unavailable (no browser extension,
 * mobile signers, etc.), stores data as plaintext JSON on the private
 * Railway relay. The relay requires NIP-42 auth so data is still private.
 * 
 * @example
 * ```tsx
 * const { encrypt, decrypt, isAvailable } = useEncryptedStorage();
 * 
 * // Save encrypted Big Dreams (or plaintext if NIP-44 unavailable)
 * const stored = await encrypt({ dimension1: "My goal..." });
 * // Store `stored` string in Nostr event content
 * 
 * // Load and decrypt (or parse JSON if not encrypted)
 * const data = await decrypt(event.content);
 * ```
 */
export function useEncryptedStorage(): EncryptedStorageResult {
  const { user } = useCurrentUser();

  const isLoggedIn = !!user;
  const isAvailable = checkNip44Available(user);
  const error = !user
    ? 'Not logged in'
    : !isAvailable
      ? 'NIP-44 encryption not available — data stored as plaintext on private relay'
      : null;

  /**
   * Encrypt data to self using NIP-44.
   * Falls back to JSON.stringify if NIP-44 is not available.
   */
  const encrypt = useCallback(async (data: unknown): Promise<string> => {
    const jsonString = JSON.stringify(data);

    if (!isAvailable || !user) {
      // Fallback: store as plaintext JSON (relay is still private via NIP-42)
      return jsonString;
    }

    try {
      const encrypted = await user.signer.nip44!.encrypt(user.pubkey, jsonString);
      return encrypted;
    } catch {
      // If encryption fails at runtime, fall back to plaintext
      console.warn('[useEncryptedStorage] NIP-44 encrypt failed, storing as plaintext');
      return jsonString;
    }
  }, [user, isAvailable]);

  /**
   * Decrypt data from self using NIP-44.
   * Falls back to JSON.parse if the content is not encrypted.
   */
  const decrypt = useCallback(async (encryptedData: string): Promise<unknown> => {
    // First try JSON.parse — if it works, content was stored as plaintext
    try {
      return JSON.parse(encryptedData);
    } catch {
      // Not valid JSON — assume it's NIP-44 encrypted
    }

    if (!isAvailable || !user) {
      throw new Error('Content appears encrypted but NIP-44 decryption is not available');
    }

    try {
      const decrypted = await user.signer.nip44!.decrypt(user.pubkey, encryptedData);
      return JSON.parse(decrypted);
    } catch (err) {
      throw new Error(`Failed to decrypt content: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [user, isAvailable]);

  return {
    encrypt,
    decrypt,
    isAvailable,
    isLoggedIn,
    error,
  };
}

/**
 * Helper to check if content is encrypted (NIP-44 format).
 * NIP-44 encrypted content is base64 and not valid JSON.
 */
export function isEncrypted(content: string): boolean {
  try {
    JSON.parse(content);
    return false; // It's valid JSON, not encrypted
  } catch {
    // Check if it looks like base64
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    return base64Regex.test(content.replace(/\s/g, ''));
  }
}
