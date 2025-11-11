<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { HACApiService } from '../services/hac.service';
import type { HACCredentials } from '../types/hac.types';

const emit = defineEmits<{
  loginSuccess: [];
}>();

const auth = useAuth();

// Form state
const hacUrl = ref('');
const username = ref('');
const password = ref('');
const masterPassword = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const showMasterPassword = ref(false);

// UI state
const isLoggingIn = ref(false);
const errorMessage = ref('');
const showStoredLogin = ref(auth.hasStoredCredentials.value);

// Validation
const isFormValid = computed(() => {
  return hacUrl.value.trim() !== '' &&
         username.value.trim() !== '' &&
         password.value !== ''; // Don't trim password - spaces may be intentional
});

const isMasterPasswordRequired = computed(() => {
  return rememberMe.value;
});

/**
 * Handle login with new credentials
 */
const handleLogin = async () => {
  if (!isFormValid.value) return;

  if (rememberMe.value && !masterPassword.value.trim()) {
    errorMessage.value = 'Master password is required to save credentials';
    return;
  }

  isLoggingIn.value = true;
  errorMessage.value = '';

  try {
    const credentials: HACCredentials = {
      hacUrl: hacUrl.value.trim(), // Trim URL to remove accidental whitespace
      username: username.value.trim(), // Trim username (usually no intentional spaces)
      password: password.value, // DON'T trim - password spaces may be intentional!
    };

    // Validate credentials with HAC API
    const isValid = await HACApiService.validateCredentials(credentials);
    
    if (!isValid) {
      errorMessage.value = 'Invalid credentials. Please check your username and password.';
      return;
    }

    // Login successful, save credentials
    const success = await auth.login(
      credentials,
      masterPassword.value || undefined,
      rememberMe.value
    );

    if (success) {
      // Fetch student name
      const nameResponse = await HACApiService.getStudentName(credentials);
      if (nameResponse.success && nameResponse.data) {
        auth.setStudentName(nameResponse.data.name);
      }

      emit('loginSuccess');
    } else {
      errorMessage.value = 'Failed to save login information';
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'An error occurred during login';
  } finally {
    isLoggingIn.value = false;
  }
};

/**
 * Handle login with stored credentials
 */
const handleStoredLogin = async () => {
  if (!masterPassword.value.trim()) {
    errorMessage.value = 'Master password is required';
    return;
  }

  isLoggingIn.value = true;
  errorMessage.value = '';

  try {
    const credentials = await auth.loadStoredCredentials(masterPassword.value);
    
    if (!credentials) {
      errorMessage.value = 'Invalid master password';
      return;
    }

    // Validate credentials are still valid
    const isValid = await HACApiService.validateCredentials(credentials);
    
    if (!isValid) {
      errorMessage.value = 'Stored credentials are no longer valid. Please login again.';
      auth.clearStoredCredentials();
      showStoredLogin.value = false;
      return;
    }

    // Fetch student name
    const nameResponse = await HACApiService.getStudentName(credentials);
    if (nameResponse.success && nameResponse.data) {
      auth.setStudentName(nameResponse.data.name);
    }

    emit('loginSuccess');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'An error occurred';
  } finally {
    isLoggingIn.value = false;
  }
};

/**
 * Clear stored credentials and show new login form
 */
const handleClearStored = () => {
  auth.clearStoredCredentials();
  showStoredLogin.value = false;
  masterPassword.value = '';
  errorMessage.value = '';
};

/**
 * Toggle password visibility
 */
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleMasterPasswordVisibility = () => {
  showMasterPassword.value = !showMasterPassword.value;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">HAC Wrapper</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Secure access to your grades
        </p>
      </div>

      <!-- Stored Login Form -->
      <div v-if="showStoredLogin" class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            Welcome back! Enter your master password to access your saved account.
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Master Password</label>
          <div class="relative">
            <input
              v-model="masterPassword"
              :type="showMasterPassword ? 'text' : 'password'"
              class="input-field pr-10"
              placeholder="Enter your master password"
              @keyup.enter="handleStoredLogin"
            />
            <button
              type="button"
              @click="toggleMasterPasswordVisibility"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span v-if="showMasterPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <button
          @click="handleStoredLogin"
          :disabled="isLoggingIn || !masterPassword.trim()"
          class="btn-primary w-full"
        >
          {{ isLoggingIn ? 'Logging in...' : 'Unlock' }}
        </button>

        <button
          @click="handleClearStored"
          class="btn-secondary w-full"
          :disabled="isLoggingIn"
        >
          Use Different Account
        </button>
      </div>

      <!-- New Login Form -->
      <form v-else @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">HAC URL</label>
          <input
            v-model="hacUrl"
            type="url"
            class="input-field"
            placeholder="https://homeaccess.yourschool.org/"
            required
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your school district's Home Access Center URL
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Username</label>
          <input
            v-model="username"
            type="text"
            class="input-field"
            placeholder="Enter your HAC username"
            required
            autocomplete="username"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="input-field pr-10"
              placeholder="Enter your HAC password"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <div class="flex items-start space-x-2">
          <input
            v-model="rememberMe"
            type="checkbox"
            id="rememberMe"
            class="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label for="rememberMe" class="text-sm text-gray-700 dark:text-gray-300">
            Remember me (requires master password for encryption)
          </label>
        </div>

        <div v-if="isMasterPasswordRequired">
          <label class="block text-sm font-medium mb-2">
            Master Password <span class="text-danger">*</span>
          </label>
          <div class="relative">
            <input
              v-model="masterPassword"
              :type="showMasterPassword ? 'text' : 'password'"
              class="input-field pr-10"
              placeholder="Create a master password"
              :required="rememberMe"
            />
            <button
              type="button"
              @click="toggleMasterPasswordVisibility"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span v-if="showMasterPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This password encrypts your credentials. Don't forget it!
          </p>
        </div>

        <button
          type="submit"
          :disabled="isLoggingIn || !isFormValid"
          class="btn-primary w-full"
        >
          {{ isLoggingIn ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <p class="text-sm text-red-800 dark:text-red-200">{{ errorMessage }}</p>
      </div>

      <!-- Security Notice -->
      <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p class="text-xs text-gray-600 dark:text-gray-400 text-center">
          🔒 Your credentials are encrypted end-to-end and never stored in plain text.
          The HAC API does not store your password.
        </p>
      </div>
    </div>
  </div>
</template>
