<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { HACApiService } from '../services/hac.service';
import type { ClassInfo, ClassGrades } from '../types/hac.types';

const auth = useAuth();

// State
const classes = ref<ClassInfo[]>([]);
const selectedClass = ref<ClassGrades | null>(null);
const isLoadingClasses = ref(false);
const isLoadingGrades = ref(false);
const error = ref<string | null>(null);
const showGradeDetails = ref(false);

// Computed
const averageGPA = computed(() => {
  if (classes.value.length === 0) return '0.00';
  const sum = classes.value.reduce((acc, c) => acc + c.average, 0);
  return (sum / classes.value.length).toFixed(2);
});

/**
 * Load class averages
 */
const loadClasses = async () => {
  const credentials = auth.getCredentials();
  if (!credentials) return;

  isLoadingClasses.value = true;
  error.value = null;

  try {
    const response = await HACApiService.getClassAverages(credentials);
    
    if (response.success && response.data) {
      classes.value = response.data;
    } else {
      error.value = response.error || 'Failed to load classes';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoadingClasses.value = false;
  }
};

/**
 * Load detailed grades for a class
 */
const loadClassGrades = async (classId: string) => {
  const credentials = auth.getCredentials();
  if (!credentials) return;

  isLoadingGrades.value = true;
  error.value = null;

  try {
    const response = await HACApiService.getClassGrades(credentials, classId);
    
    if (response.success && response.data) {
      selectedClass.value = response.data;
      showGradeDetails.value = true;
    } else {
      error.value = response.error || 'Failed to load class grades';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoadingGrades.value = false;
  }
};

/**
 * Get grade color based on percentage
 */
const getGradeColor = (average: number): string => {
  if (average >= 90) return 'text-green-600 dark:text-green-400';
  if (average >= 80) return 'text-blue-600 dark:text-blue-400';
  if (average >= 70) return 'text-yellow-600 dark:text-yellow-400';
  if (average >= 60) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

/**
 * Get grade letter
 */
const getGradeLetter = (average: number): string => {
  if (average >= 90) return 'A';
  if (average >= 80) return 'B';
  if (average >= 70) return 'C';
  if (average >= 60) return 'D';
  return 'F';
};

/**
 * Close grade details modal
 */
const closeGradeDetails = () => {
  showGradeDetails.value = false;
  selectedClass.value = null;
};

/**
 * Handle logout
 */
const handleLogout = () => {
  auth.logout();
  window.location.reload();
};

// Load data on mount
onMounted(() => {
  loadClasses();
});
</script>

<template>
  <div class="min-h-screen p-4 md:p-8">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-8">
      <div class="card">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold mb-2">
              Welcome, {{ auth.studentName || 'Student' }}!
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Here's your academic overview
            </p>
          </div>
          <button @click="handleLogout" class="btn-secondary">
            Logout
          </button>
        </div>

        <!-- GPA Display -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gradient-to-br from-primary to-blue-600 rounded-lg p-4 text-white">
            <p class="text-sm opacity-90">Current GPA</p>
            <p class="text-3xl font-bold">{{ averageGPA }}</p>
          </div>
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <p class="text-sm opacity-90">Total Classes</p>
            <p class="text-3xl font-bold">{{ classes.length }}</p>
          </div>
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <p class="text-sm opacity-90">Status</p>
            <p class="text-xl font-bold">{{ averageGPA >= 2.0 ? 'Good Standing' : 'Needs Improvement' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="max-w-6xl mx-auto mb-6">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingClasses" class="max-w-6xl mx-auto">
      <div class="card text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading your classes...</p>
      </div>
    </div>

    <!-- Classes Grid -->
    <div v-else class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(classInfo, index) in classes"
          :key="index"
          class="card hover:shadow-xl transition-shadow cursor-pointer"
          @click="loadClassGrades(classInfo.className)"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="font-bold text-lg mb-1">{{ classInfo.className }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ classInfo.teacher }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500">
                Period {{ classInfo.period }}
              </p>
            </div>
            <div class="text-right">
              <p :class="['text-3xl font-bold', getGradeColor(classInfo.average)]">
                {{ classInfo.average.toFixed(1) }}%
              </p>
              <p :class="['text-sm font-medium', getGradeColor(classInfo.average)]">
                {{ getGradeLetter(classInfo.average) }}
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
            <div
              :class="[
                'h-2 rounded-full transition-all',
                classInfo.average >= 90 ? 'bg-green-500' :
                classInfo.average >= 80 ? 'bg-blue-500' :
                classInfo.average >= 70 ? 'bg-yellow-500' :
                classInfo.average >= 60 ? 'bg-orange-500' :
                'bg-red-500'
              ]"
              :style="{ width: `${classInfo.average}%` }"
            ></div>
          </div>

          <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Click to view details
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoadingClasses && classes.length === 0" class="card text-center py-12">
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          No classes found. Please check your HAC account.
        </p>
      </div>
    </div>

    <!-- Grade Details Modal -->
    <div
      v-if="showGradeDetails"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeGradeDetails"
    >
      <div class="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-bold">{{ selectedClass?.className }}</h2>
            <p class="text-gray-600 dark:text-gray-400">{{ selectedClass?.teacher }}</p>
          </div>
          <button @click="closeGradeDetails" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
            ×
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoadingGrades" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading grades...</p>
        </div>

        <!-- Grade Categories -->
        <div v-else-if="selectedClass">
          <div class="mb-6">
            <h3 class="font-bold mb-3">Grade Categories</h3>
            <div class="space-y-2">
              <div
                v-for="(category, index) in selectedClass.categories"
                :key="index"
                class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span class="font-medium">{{ category.name }}</span>
                <div class="text-right">
                  <span class="font-bold">{{ category.average }}%</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ category.weight }} weight)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Assignments -->
          <div>
            <h3 class="font-bold mb-3">Recent Assignments</h3>
            <div class="space-y-2">
              <div
                v-for="(assignment, index) in selectedClass.assignments"
                :key="index"
                class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div class="flex justify-between items-start mb-2">
                  <div class="flex-1">
                    <p class="font-medium">{{ assignment.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ assignment.category }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold">{{ assignment.score }} / {{ assignment.totalPoints }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ assignment.weight }} weight</p>
                  </div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Assigned: {{ assignment.dateAssigned }}</span>
                  <span>Due: {{ assignment.dateDue }}</span>
                </div>
              </div>

              <div v-if="selectedClass.assignments.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                No assignments available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
