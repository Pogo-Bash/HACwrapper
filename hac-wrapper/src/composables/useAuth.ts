import { ref, computed } from 'vue';
import type { HACCredentials, EncryptedCredentials } from '../types/hac.types';
import { CryptoService } from '../utils/crypto';

const STORAGE_KEY = 'hac_encrypted_credentials';

/**
 * Composable for managing HAC authentication and credentials
 */
export function useAuth() {
  const isAuthenticated = ref(false);
  const currentCredentials = ref<HACCredentials | null>(null);
  const studentName = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Check if credentials are stored
   */
  const hasStoredCredentials = computed(() => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  });

  /**
   * Save encrypted credentials to localStorage
   */
  const saveCredentials = async (
    credentials: HACCredentials,
    masterPassword: string,
    rememberMe: boolean = false
  ): Promise<void> => {
    if (!rememberMe) {
      // Store in session only (memory)
      currentCredentials.value = credentials;
      isAuthenticated.value = true;
      return;
    }

    try {
      const encrypted = await CryptoService.encryptCredentials(
        credentials.username,
        credentials.password,
        masterPassword
      );

      const storageData = {
        hacUrl: credentials.hacUrl,
        encrypted,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      currentCredentials.value = credentials;
      isAuthenticated.value = true;
    } catch (err) {
      error.value = 'Failed to save credentials securely';
      throw err;
    }
  };

  /**
   * Load and decrypt stored credentials
   */
  const loadStoredCredentials = async (
    masterPassword: string
  ): Promise<HACCredentials | null> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      isLoading.value = true;
      error.value = null;

      const { hacUrl, encrypted } = JSON.parse(stored);
      const decrypted = await CryptoService.decryptCredentials(encrypted, masterPassword);

      const credentials: HACCredentials = {
        hacUrl,
        username: decrypted.username,
        password: decrypted.password,
      };

      currentCredentials.value = credentials;
      isAuthenticated.value = true;

      return credentials;
    } catch (err) {
      error.value = 'Invalid master password or corrupted data';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Login with credentials
   */
  const login = async (
    credentials: HACCredentials,
    masterPassword?: string,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Store credentials
      if (masterPassword && rememberMe) {
        await saveCredentials(credentials, masterPassword, true);
      } else {
        currentCredentials.value = credentials;
        isAuthenticated.value = true;
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Logout and clear credentials
   */
  const logout = (): void => {
    currentCredentials.value = null;
    isAuthenticated.value = false;
    studentName.value = null;
    error.value = null;
  };

  /**
   * Clear stored credentials from localStorage
   */
  const clearStoredCredentials = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    logout();
  };

  /**
   * Get current credentials
   */
  const getCredentials = (): HACCredentials | null => {
    return currentCredentials.value;
  };

  /**
   * Set student name
   */
  const setStudentName = (name: string): void => {
    studentName.value = name;
  };

  return {
    // State
    isAuthenticated,
    currentCredentials,
    studentName,
    isLoading,
    error,
    hasStoredCredentials,

    // Methods
    login,
    logout,
    saveCredentials,
    loadStoredCredentials,
    clearStoredCredentials,
    getCredentials,
    setStudentName,
  };
}
