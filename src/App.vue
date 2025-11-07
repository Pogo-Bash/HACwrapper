<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Class {
  classId: string
  className: string
  courseCode: string
  teacher: string
  teacherEmail: string
  period: string
  grade: string
  average: number
  hasGrade: boolean
}

interface Assignment {
  dateDue: string
  dateAssigned: string
  turnedIn: string
  name: string
  category: string
  score: string
  weight: string
  weightedScore: string
  totalPoints: string
  weightedTotalPoints: string
  percentage: string
}

interface ClassDetails {
  className: string
  teacher: string
  average: string
  lastUpdated: string
  assignments: Assignment[]
  categories: {
    name: string
    points: string
    maxPoints: string
    percentage: string
  }[]
  markingPeriods: number[]
  currentMarkingPeriod: number
}

const hacUrl = ref('https://hac.eths.k12.il.us/')
const username = ref('')
const password = ref('')
const studentName = ref('')
const classes = ref<Class[]>([])
const selectedClassDetails = ref<ClassDetails | null>(null)
const loading = ref(false)
const loadingDetails = ref(false)
const error = ref('')
const isLoggedIn = ref(false)
const debugInfo = ref('')
const showClassModal = ref(false)
const selectedMarkingPeriod = ref(1)
const originalClassName = ref('')
const darkMode = ref(false)

onMounted(async () => {
  // Load dark mode preference
  const savedTheme = localStorage.getItem('theme')
  darkMode.value = savedTheme === 'dark'
  applyTheme()
  
  const savedUsername = localStorage.getItem('hacUsername')
  if (savedUsername) username.value = savedUsername
  
  try {
    debugInfo.value = 'Testing proxy connection...'
    const response = await fetch('/api/health')
    const data = await response.json()
    debugInfo.value = `✅ ${data.status}`
    console.log('Proxy test:', data)
  } catch (err) {
    debugInfo.value = '❌ Proxy not reachable. Check that both servers are running.'
    console.error('Proxy connection failed:', err)
  }
})

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  localStorage.setItem('theme', darkMode.value ? 'dark' : 'light')
  applyTheme()
}

function applyTheme() {
  if (darkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

async function login() {
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }

  loading.value = true
  error.value = ''
  debugInfo.value = ''

  try {
    localStorage.setItem('hacUsername', username.value)
    debugInfo.value = 'Logging in securely...'
    
    const nameResponse = await fetch('/api/name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        link: hacUrl.value,
        user: username.value,
        pass: password.value
      })
    })

    if (!nameResponse.ok) {
      throw new Error(`HTTP ${nameResponse.status}: ${nameResponse.statusText}`)
    }

    const nameData = await nameResponse.json()
    
    if (nameData.error) {
      throw new Error(nameData.error)
    }
    
    if (nameData.name && nameData.name !== 'Student') {
      studentName.value = nameData.name
      isLoggedIn.value = true
      debugInfo.value = `✅ Logged in as ${nameData.name}`
    } else {
      throw new Error('Login failed - check your credentials')
    }

    debugInfo.value = 'Fetching classes...'
    
    const classesResponse = await fetch('/api/classaverage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        link: hacUrl.value,
        user: username.value,
        pass: password.value
      })
    })

    if (!classesResponse.ok) {
      throw new Error(`HTTP ${classesResponse.status}: ${classesResponse.statusText}`)
    }

    const classesData = await classesResponse.json()
    
    if (Array.isArray(classesData)) {
      classes.value = classesData
      debugInfo.value = `✅ Loaded ${classesData.length} classes`
    }

  } catch (err) {
    console.error('Login error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch data'
    
    if (error.value.includes('Failed to fetch') || error.value.includes('ERR_CONNECTION_REFUSED')) {
      error.value = '❌ Cannot connect to proxy server. Make sure both servers are running.'
    }
    
    isLoggedIn.value = false
  } finally {
    loading.value = false
  }
}

async function viewClassDetails(className: string, markingPeriod: number = 1) {
  loadingDetails.value = true
  showClassModal.value = true
  selectedClassDetails.value = null
  selectedMarkingPeriod.value = markingPeriod
  
  // CRITICAL FIX: Always reset originalClassName when opening a new class modal
  // This ensures we use the SHORT class name from the class list
  if (!showClassModal.value || !originalClassName.value) {
    originalClassName.value = className
  }
  
  // When switching quarters, use the stored original name
  if (markingPeriod !== 1 && originalClassName.value) {
    className = originalClassName.value
  } else {
    // First time opening this class, store it
    originalClassName.value = className
  }

  try {
    const response = await fetch('/api/classgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        link: hacUrl.value,
        user: username.value,
        pass: password.value,
        class: className, // Use the short name
        markingPeriod: markingPeriod
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📊 Class details loaded:', data.className, 'Q' + markingPeriod)
    
    selectedClassDetails.value = {
      className: data.className || className,
      teacher: data.teacher || '',
      average: data.average || 'N/A',
      lastUpdated: data.lastUpdated || '',
      assignments: Array.isArray(data.assignments) ? data.assignments : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      markingPeriods: data.markingPeriods || [1, 2, 3, 4],
      currentMarkingPeriod: data.currentMarkingPeriod || 1
    }
  } catch (err) {
    console.error('Failed to load class details:', err)
    error.value = 'Failed to load class details'
  } finally {
    loadingDetails.value = false
  }
}

function changeMarkingPeriod(period: number) {
  if (originalClassName.value) {
    viewClassDetails(originalClassName.value, period)
  }
}

function closeClassModal() {
  showClassModal.value = false
  selectedClassDetails.value = null
  selectedMarkingPeriod.value = 1
  originalClassName.value = '' // Reset for next time
}

function logout() {
  // CRITICAL FIX: Reset ALL state when logging out
  isLoggedIn.value = false
  studentName.value = ''
  classes.value = []
  password.value = ''
  debugInfo.value = ''
  error.value = ''
  
  // Reset modal state
  showClassModal.value = false
  selectedClassDetails.value = null
  selectedMarkingPeriod.value = 1
  originalClassName.value = '' // IMPORTANT: Clear this on logout!
  
  console.log('✅ Logged out - all state cleared')
}

function getGradeColor(average: number): string {
  if (average >= 90) return darkMode.value ? 'text-green-400' : 'text-green-600'
  if (average >= 80) return darkMode.value ? 'text-blue-400' : 'text-blue-600'
  if (average >= 70) return darkMode.value ? 'text-yellow-400' : 'text-yellow-600'
  if (average >= 60) return darkMode.value ? 'text-orange-400' : 'text-orange-600'
  return darkMode.value ? 'text-red-400' : 'text-red-600'
}

function calculateGPA(): string {
  const gradedClasses = classes.value.filter(c => c.hasGrade)
  if (gradedClasses.length === 0) return 'N/A'
  const sum = gradedClasses.reduce((acc, c) => acc + c.average, 0)
  return (sum / gradedClasses.length).toFixed(1)
}
</script>

<template>
  <div :class="['min-h-screen transition-colors', darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50']">
    <header :class="['shadow-sm border-b', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white']">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HAC Wrapper 🔒
            </h1>
            <p :class="['text-sm', darkMode ? 'text-gray-400' : 'text-gray-600']">Secure grade access with encrypted requests</p>
          </div>
          <div class="flex items-center gap-4">
            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              :class="[
                'p-2 rounded-lg transition',
                darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
              :title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="!darkMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </button>
            
            <div v-if="isLoggedIn" class="flex items-center gap-4">
              <div class="text-right">
                <p :class="['text-sm', darkMode ? 'text-gray-400' : 'text-gray-600']">Logged in as</p>
                <p :class="['font-semibold', darkMode ? 'text-white' : 'text-gray-900']">{{ studentName }}</p>
              </div>
              <button
                @click="logout"
                :class="[
                  'px-4 py-2 rounded-lg transition',
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                ]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div v-if="debugInfo" :class="['mb-6 p-4 rounded-lg border', darkMode ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-50 border-blue-200']">
        <p :class="['text-sm whitespace-pre-wrap', darkMode ? 'text-blue-200' : 'text-blue-800']">{{ debugInfo }}</p>
      </div>

      <!-- Login Form -->
      <div v-if="!isLoggedIn" class="max-w-md mx-auto">
        <div :class="['rounded-2xl shadow-xl p-8', darkMode ? 'bg-gray-800' : 'bg-white']">
          <div class="text-center mb-8">
            <div class="text-6xl mb-4">🎓</div>
            <h2 :class="['text-2xl font-bold mb-2', darkMode ? 'text-white' : 'text-gray-900']">Login to HAC</h2>
            <p :class="darkMode ? 'text-gray-400' : 'text-gray-600'">Enter your credentials to view your grades</p>
          </div>

          <form @submit.prevent="login" class="space-y-6">
            <div>
              <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700']">HAC URL</label>
              <input
                v-model="hacUrl"
                type="url"
                required
                :class="[
                  'w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border border-gray-300'
                ]"
                placeholder="https://hac.eths.k12.il.us/"
              />
            </div>

            <div>
              <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700']">Username</label>
              <input
                v-model="username"
                type="text"
                required
                autocomplete="username"
                :class="[
                  'w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border border-gray-300'
                ]"
                placeholder="Your username"
              />
            </div>

            <div>
              <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700']">Password</label>
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                :class="[
                  'w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border border-gray-300'
                ]"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>

            <div v-if="error" :class="['p-4 rounded-lg border', darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200']">
              <p :class="['text-sm whitespace-pre-wrap', darkMode ? 'text-red-200' : 'text-red-800']">{{ error }}</p>
            </div>

            <div :class="['rounded-lg p-4 border', darkMode ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-200']">
              <p :class="['text-xs flex items-center gap-2', darkMode ? 'text-green-200' : 'text-green-800']">
                <span>🔒</span>
                <span><strong>Secure:</strong> Your credentials are sent via encrypted POST requests, never exposed in URLs</span>
              </p>
            </div>
          </form>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-6">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 class="text-3xl font-bold mb-2">Welcome back, {{ studentName }}! 👋</h2>
          <p class="text-blue-100">Here's your current grades</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div :class="['rounded-xl shadow-md p-6', darkMode ? 'bg-gray-800' : 'bg-white']">
            <div class="flex items-center justify-between">
              <div>
                <p :class="['text-sm mb-1', darkMode ? 'text-gray-400' : 'text-gray-600']">Total Classes</p>
                <p :class="['text-3xl font-bold', darkMode ? 'text-white' : 'text-gray-900']">{{ classes.length }}</p>
              </div>
              <div class="text-4xl">📚</div>
            </div>
          </div>

          <div :class="['rounded-xl shadow-md p-6', darkMode ? 'bg-gray-800' : 'bg-white']">
            <div class="flex items-center justify-between">
              <div>
                <p :class="['text-sm mb-1', darkMode ? 'text-gray-400' : 'text-gray-600']">Average</p>
                <p :class="['text-3xl font-bold', darkMode ? 'text-white' : 'text-gray-900']">{{ calculateGPA() }}</p>
              </div>
              <div class="text-4xl">📊</div>
            </div>
          </div>

          <div :class="['rounded-xl shadow-md p-6', darkMode ? 'bg-gray-800' : 'bg-white']">
            <div class="flex items-center justify-between">
              <div>
                <p :class="['text-sm mb-1', darkMode ? 'text-gray-400' : 'text-gray-600']">Graded</p>
                <p :class="['text-3xl font-bold', darkMode ? 'text-white' : 'text-gray-900']">{{ classes.filter(c => c.hasGrade).length }}</p>
              </div>
              <div class="text-4xl">✅</div>
            </div>
          </div>
        </div>

        <div :class="['rounded-2xl shadow-xl overflow-hidden', darkMode ? 'bg-gray-800' : 'bg-white']">
          <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 class="text-xl font-bold text-white">Your Classes</h3>
          </div>

          <div v-if="classes.length === 0" :class="['p-8 text-center', darkMode ? 'text-gray-400' : 'text-gray-500']">
            No classes found
          </div>

          <div v-else :class="['divide-y', darkMode ? 'divide-gray-700' : '']">
            <div 
              v-for="cls in classes" 
              :key="cls.classId" 
              :class="['p-6 transition cursor-pointer', darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50']"
              @click="viewClassDetails(cls.className)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 :class="['text-lg font-semibold', darkMode ? 'text-white' : 'text-gray-900']">{{ cls.className }}</h4>
                    <span :class="['px-2 py-1 text-xs rounded-full', darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100']">{{ cls.courseCode }}</span>
                    <span class="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs rounded-full">Period {{ cls.period }}</span>
                  </div>

                  <div :class="['flex items-center gap-2 text-sm', darkMode ? 'text-gray-400' : 'text-gray-600']">
                    <span>👨‍🏫</span>
                    <a :href="`mailto:${cls.teacherEmail}`" :class="['hover:underline', darkMode ? 'hover:text-blue-400' : 'hover:text-blue-600']" @click.stop>
                      {{ cls.teacher }}
                    </a>
                  </div>
                  
                  <p :class="['text-xs mt-2', darkMode ? 'text-gray-500' : 'text-gray-500']">Click to view assignments</p>
                </div>

                <div class="text-right ml-4">
                  <div v-if="cls.hasGrade" :class="['text-3xl font-bold', getGradeColor(cls.average)]">
                    {{ cls.grade }}
                  </div>
                  <div v-else :class="['text-2xl', darkMode ? 'text-gray-600' : 'text-gray-400']">N/A</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Class Details Modal -->
    <div 
      v-if="showClassModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeClassModal"
    >
      <div :class="['rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col', darkMode ? 'bg-gray-800' : 'bg-white']">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold">{{ selectedClassDetails?.className || 'Loading...' }}</h2>
            <p class="text-sm text-blue-100" v-if="selectedClassDetails && selectedClassDetails.teacher">
              {{ selectedClassDetails.teacher }}
            </p>
          </div>
          <button @click="closeClassModal" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Quarter Selector -->
        <div :class="['px-6 py-3 border-b flex items-center gap-4', darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50']">
          <span :class="['text-sm font-medium', darkMode ? 'text-gray-300' : 'text-gray-700']">Quarter:</span>
          <div class="flex gap-2">
            <button
              v-for="mp in [1, 2, 3, 4]"
              :key="mp"
              @click="changeMarkingPeriod(mp)"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition',
                selectedMarkingPeriod === mp
                  ? 'bg-blue-600 text-white'
                  : darkMode 
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              ]"
              :disabled="loadingDetails"
            >
              Q{{ mp }}
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Loading State -->
          <div v-if="loadingDetails" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p :class="darkMode ? 'text-gray-400' : 'text-gray-600'">Loading assignments...</p>
          </div>

          <!-- Class Details Content -->
          <div v-else-if="selectedClassDetails" class="space-y-6">
            <!-- Average Info -->
            <div :class="['rounded-lg p-4 flex justify-between items-center', darkMode ? 'bg-blue-900/50' : 'bg-blue-50']">
              <div>
                <p :class="['text-sm', darkMode ? 'text-gray-300' : 'text-gray-600']">Quarter {{ selectedMarkingPeriod }} Average</p>
                <p :class="['text-3xl font-bold', darkMode ? 'text-blue-400' : 'text-blue-600']">{{ selectedClassDetails.average }}</p>
              </div>
              <div :class="['text-right text-sm', darkMode ? 'text-gray-400' : 'text-gray-500']" v-if="selectedClassDetails.lastUpdated">
                Last Updated: {{ selectedClassDetails.lastUpdated }}
              </div>
            </div>

            <!-- Assignments Table -->
            <div v-if="selectedClassDetails.assignments && selectedClassDetails.assignments.length > 0">
              <h3 :class="['text-lg font-bold mb-3', darkMode ? 'text-white' : 'text-gray-900']">Assignments ({{ selectedClassDetails.assignments.length }})</h3>
              <div class="overflow-x-auto">
                <table :class="['w-full border-collapse border', darkMode ? 'border-gray-600' : 'border-gray-300']">
                  <thead :class="darkMode ? 'bg-gray-700' : 'bg-gray-100'">
                    <tr>
                      <th :class="['border px-3 py-2 text-left text-sm font-semibold', darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300']">Date Due</th>
                      <th :class="['border px-3 py-2 text-left text-sm font-semibold', darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300']">Assignment</th>
                      <th :class="['border px-3 py-2 text-left text-sm font-semibold', darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300']">Category</th>
                      <th :class="['border px-3 py-2 text-center text-sm font-semibold', darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300']">Score</th>
                      <th :class="['border px-3 py-2 text-center text-sm font-semibold', darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300']">Total Points</th>
                      <th :class="['border px-3 py-2 text-center text-sm font-semibold', darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300']">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(assignment, idx) in selectedClassDetails.assignments" :key="idx" :class="darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'">
                      <td :class="['border px-3 py-2 text-sm', darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300']">{{ assignment.dateDue }}</td>
                      <td :class="['border px-3 py-2 text-sm font-medium', darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300']">{{ assignment.name }}</td>
                      <td :class="['border px-3 py-2 text-sm', darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300']">{{ assignment.category }}</td>
                      <td :class="['border px-3 py-2 text-sm text-center', darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300']">{{ assignment.score }}</td>
                      <td :class="['border px-3 py-2 text-sm text-center', darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300']">{{ assignment.totalPoints }}</td>
                      <td :class="['border px-3 py-2 text-sm text-center font-semibold', darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300']">{{ assignment.percentage }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else>
              <p :class="['text-center py-8', darkMode ? 'text-gray-400' : 'text-gray-500']">No assignments found for Quarter {{ selectedMarkingPeriod }}.</p>
            </div>

            <!-- Categories -->
            <div v-if="selectedClassDetails.categories && selectedClassDetails.categories.length > 0">
              <h3 :class="['text-lg font-bold mb-3', darkMode ? 'text-white' : 'text-gray-900']">Categories</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="(category, idx) in selectedClassDetails.categories" 
                  :key="idx"
                  :class="['rounded-lg p-4', darkMode ? 'bg-gray-700' : 'bg-gray-50']"
                >
                  <div class="flex justify-between items-center">
                    <span :class="['font-semibold', darkMode ? 'text-gray-200' : 'text-gray-900']">{{ category.name }}</span>
                    <span :class="['text-lg font-bold', darkMode ? 'text-blue-400' : 'text-blue-600']">{{ category.percentage }}</span>
                  </div>
                  <p :class="['text-sm mt-1', darkMode ? 'text-gray-400' : 'text-gray-600']">
                    {{ category.points }} / {{ category.maxPoints }} points
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
