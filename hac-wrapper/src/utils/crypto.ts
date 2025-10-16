import type { EncryptedCredentials } from '../types/hac.types';

/**
 * Secure encryption utilities for HAC credentials
 * Uses Web Crypto API for end-to-end encryption
 */
export class CryptoService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly ITERATIONS = 100000;

  /**
   * Generate a cryptographic key from password using PBKDF2
   */
  private static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt credentials with user's master password
   */
  static async encryptCredentials(
    username: string,
    password: string,
    masterPassword: string
  ): Promise<EncryptedCredentials> {
    const encoder = new TextEncoder();
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive encryption key from master password
    const key = await this.deriveKey(masterPassword, salt);

    // Encrypt username
    const encryptedUsernameBuffer = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv: iv },
      key,
      encoder.encode(username)
    );

    // Encrypt password
    const encryptedPasswordBuffer = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv: iv },
      key,
      encoder.encode(password)
    );

    // Convert to base64 for storage
    return {
      encryptedUsername: this.bufferToBase64(encryptedUsernameBuffer),
      encryptedPassword: this.bufferToBase64(encryptedPasswordBuffer),
      salt: this.bufferToBase64(salt),
      iv: this.bufferToBase64(iv),
    };
  }

  /**
   * Decrypt credentials with user's master password
   */
  static async decryptCredentials(
    encrypted: EncryptedCredentials,
    masterPassword: string
  ): Promise<{ username: string; password: string }> {
    const decoder = new TextDecoder();

    // Convert from base64
    const salt = this.base64ToBuffer(encrypted.salt);
    const iv = this.base64ToBuffer(encrypted.iv);
    const encryptedUsername = this.base64ToBuffer(encrypted.encryptedUsername);
    const encryptedPassword = this.base64ToBuffer(encrypted.encryptedPassword);

    // Derive encryption key
    const key = await this.deriveKey(masterPassword, new Uint8Array(salt));

    try {
      // Decrypt username
      const usernameBuffer = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv: new Uint8Array(iv) },
        key,
        encryptedUsername
      );

      // Decrypt password
      const passwordBuffer = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv: new Uint8Array(iv) },
        key,
        encryptedPassword
      );

      return {
        username: decoder.decode(usernameBuffer),
        password: decoder.decode(passwordBuffer),
      };
    } catch (error) {
      throw new Error('Invalid master password or corrupted data');
    }
  }

  /**
   * Hash credentials for verification (one-way)
   */
  static async hashCredentials(username: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(username + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToBase64(hashBuffer);
  }

  /**
   * Generate a secure session token
   */
  static generateSessionToken(): string {
    const buffer = crypto.getRandomValues(new Uint8Array(32));
    return this.bufferToBase64(buffer);
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private static bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private static base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
