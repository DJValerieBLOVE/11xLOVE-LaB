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
 */

import { useCallback } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface EncryptedStorageResult {
  /** Encrypt data to self (only user can decrypt) */
  encrypt: (data: unknown) => Promise<string>;
  /** Decrypt data from self */
  decrypt: (encryptedData: string) => Promise<unknown>;
  /** Check if encryption is available */
  isAvailable: boolean;
  /** Error message if encryption not available */
  error: string | null;
}

/**
 * Hook for encrypting/decrypting private data using NIP-44
 * 
 * @example
 * ```tsx
 * const { encrypt, decrypt, isAvailable } = useEncryptedStorage();
 * 
 * // Save encrypted Big Dreams
 * const encrypted = await encrypt({ dimension1: "My goal..." });
 * // Store `encrypted` string in Nostr event content
 * 
 * // Load and decrypt
 * const data = await decrypt(event.content);
 * ```
 */
export function useEncryptedStorage(): EncryptedStorageResult {
  const { user } = useCurrentUser();

  // Check if NIP-44 encryption is available
  const isAvailable = !!(user?.signer?.nip44);
  const error = !user 
    ? 'Not logged in' 
    : !user.signer?.nip44 
      ? 'Signer does not support NIP-44 encryption. Please upgrade your extension.'
      : null;

  /**
   * Encrypt data to self using NIP-44
   * Only the user can decrypt this data
   */
  const encrypt = useCallback(async (data: unknown): Promise<string> => {
    if (!user?.signer?.nip44) {
      throw new Error('NIP-44 encryption not available');
    }

    const jsonString = JSON.stringify(data);
    const encrypted = await user.signer.nip44.encrypt(user.pubkey, jsonString);
    return encrypted;
  }, [user]);

  /**
   * Decrypt data from self using NIP-44
   */
  const decrypt = useCallback(async (encryptedData: string): Promise<unknown> => {
    if (!user?.signer?.nip44) {
      throw new Error('NIP-44 decryption not available');
    }

    const decrypted = await user.signer.nip44.decrypt(user.pubkey, encryptedData);
    return JSON.parse(decrypted);
  }, [user]);

  return {
    encrypt,
    decrypt,
    isAvailable,
    error,
  };
}

/**
 * Helper to check if content is encrypted (NIP-44 format)
 * NIP-44 encrypted content starts with specific patterns
 */
export function isEncrypted(content: string): boolean {
  // NIP-44 uses base64-encoded ciphertext
  // A simple heuristic: if it's valid base64 and not JSON, it's likely encrypted
  try {
    JSON.parse(content);
    return false; // It's valid JSON, not encrypted
  } catch {
    // Check if it looks like base64
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    return base64Regex.test(content.replace(/\s/g, ''));
  }
}
