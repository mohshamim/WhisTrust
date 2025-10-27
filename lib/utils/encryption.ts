/**
 * BRD Phase 3: Client-Side Message Encryption
 * 
 * This implementation provides lightweight encryption for messages stored in the database.
 * Using client-side encryption with crypto-js (AES) for security.
 * 
 * Note: This is a simplified implementation for MVP. In production, consider:
 * - Server-side encryption for better security
 * - Key rotation mechanisms
 * - Separate encryption keys per report
 * - Hardware security modules (HSM) for key management
 */

import CryptoJS from 'crypto-js';

// Simple encryption key (in production, this should be stored securely)
// For MVP, we'll use a key derived from the report ID to ensure same report = same key
const ENCRYPTION_KEY_PREFIX = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'whistrust-secure-key-2024';

/**
 * Get encryption key for a specific report
 * This ensures messages for the same report use the same decryption key
 */
function getEncryptionKey(reportId: string): string {
  return `${ENCRYPTION_KEY_PREFIX}-${reportId}`;
}

/**
 * BRD Phase 3: Encrypt message content before storage
 * @param content - Plain text message content
 * @param reportId - Report ID for key derivation
 * @returns Encrypted content as base64 string
 */
export function encryptMessage(content: string, reportId: string): string {
  try {
    const key = getEncryptionKey(reportId);
    const encrypted = CryptoJS.AES.encrypt(content, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * BRD Phase 3: Decrypt message content for display
 * @param encryptedContent - Encrypted content from database
 * @param reportId - Report ID for key derivation
 * @returns Decrypted plain text content
 */
export function decryptMessage(encryptedContent: string, reportId: string): string {
  try {
    const key = getEncryptionKey(reportId);
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, key);
    const plainText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plainText) {
      // If decryption fails, return original (might be unencrypted legacy data)
      console.warn('Decryption failed, returning original content');
      return encryptedContent;
    }
    
    return plainText;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return original content if decryption fails (graceful degradation)
    return encryptedContent;
  }
}

/**
 * BRD Phase 3: Check if content appears to be encrypted
 * Simple heuristic - check if it's base64 and decodable
 */
export function isEncrypted(content: string): boolean {
  try {
    // Encrypted content should be base64 and not contain typical plain text patterns
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(content)) {
      return false;
    }
    // Additional check: encrypted content is usually longer and structured
    return content.length > 50 && !content.includes(' '); // No spaces in base64
  } catch {
    return false;
  }
}
