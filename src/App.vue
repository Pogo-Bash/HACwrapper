<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

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
  const html = document.documentElement
  if (darkMode.value) {
    html.setAttribute('data-theme', 'dark')
    html.classList.add('dark')
  } else {
    html.setAttribute('data-theme', 'light')
    html.classList.remove('dark')
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

  if (!showClassModal.value || !originalClassName.value) {
    originalClassName.value = className
  }

  if (markingPeriod !== 1 && originalClassName.value) {
    className = originalClassName.value
  } else {
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
        class: className,
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
  originalClassName.value = ''
}

function logout() {
  isLoggedIn.value = false
  studentName.value = ''
  classes.value = []
  password.value = ''
  debugInfo.value = ''
  error.value = ''
  showClassModal.value = false
  selectedClassDetails.value = null
  selectedMarkingPeriod.value = 1
  originalClassName.value = ''
  console.log('✅ Logged out - all state cleared')
}

function getGradeColor(average: number): string {
  if (average >= 90) return 'text-success'
  if (average >= 80) return 'text-info'
  if (average >= 70) return 'text-warning'
  if (average >= 60) return 'text-warning'
  return 'text-error'
}

function calculateGPA(): string {
  const gradedClasses = classes.value.filter(c => c.hasGrade)
  if (gradedClasses.length === 0) return 'N/A'
  const sum = gradedClasses.reduce((acc, c) => acc + c.average, 0)
  return (sum / gradedClasses.length).toFixed(1)
}
</script>

<template>
  <div class="min-h-screen bg-neutral">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-base-100 border-b border-base-300 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-base-content">
              HAC Wrapper
            </h1>
            <p class="text-sm text-base-content/60 mt-1">Secure grade access, beautifully designed</p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Theme Toggle -->
            <label class="swap swap-rotate btn btn-ghost btn-circle">
              <input type="checkbox" :checked="darkMode" @change="toggleDarkMode" />
              <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
              <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
            </label>

            <div v-if="isLoggedIn" class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <p class="text-xs text-base-content/60">Logged in as</p>
                <p class="font-semibold text-sm">{{ studentName }}</p>
              </div>
              <button @click="logout" class="btn btn-ghost btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Debug Info -->
      <div v-if="debugInfo" class="alert alert-info mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span class="text-sm">{{ debugInfo }}</span>
      </div>

      <!-- Login Form -->
      <div v-if="!isLoggedIn" class="max-w-md mx-auto">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <div class="text-center mb-6">
              <div class="text-6xl mb-4">🎓</div>
              <h2 class="card-title justify-center text-3xl font-bold tracking-tight mb-2">Login to HAC</h2>
              <p class="text-base-content/60">Enter your credentials to view grades</p>
            </div>

            <form @submit.prevent="login" class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">HAC URL</span>
                </label>
                <input
                  v-model="hacUrl"
                  type="url"
                  required
                  placeholder="https://hac.eths.k12.il.us/"
                  class="input input-bordered w-full"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Username</span>
                </label>
                <input
                  v-model="username"
                  type="text"
                  required
                  autocomplete="username"
                  placeholder="Your username"
                  class="input input-bordered w-full"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Password</span>
                </label>
                <input
                  v-model="password"
                  type="password"
                  required
                  autocomplete="current-password"
                  placeholder="Your password"
                  class="input input-bordered w-full"
                />
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="btn btn-primary w-full font-semibold"
              >
                <span v-if="loading" class="loading loading-spinner"></span>
                {{ loading ? 'Logging in...' : 'Login' }}
              </button>

              <div v-if="error" class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="text-sm">{{ error }}</span>
              </div>

              <div class="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="text-xs"><strong>Secure:</strong> Your credentials are encrypted</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-8">
        <!-- Welcome Card -->
        <div class="card bg-primary shadow-xl">
          <div class="card-body">
            <h2 class="hero-text text-primary-content">Welcome back, {{ studentName }}! 👋</h2>
            <p class="text-primary-content/80">Here's your academic overview</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="stats shadow-md bg-base-100">
            <div class="stat">
              <div class="stat-figure text-4xl">📚</div>
              <div class="stat-title">Total Classes</div>
              <div class="stat-value tabular-nums">{{ classes.length }}</div>
            </div>
          </div>

          <div class="stats shadow-md bg-base-100">
            <div class="stat">
              <div class="stat-figure text-4xl">📊</div>
              <div class="stat-title">Average</div>
              <div class="stat-value tabular-nums">{{ calculateGPA() }}</div>
            </div>
          </div>

          <div class="stats shadow-md bg-base-100">
            <div class="stat">
              <div class="stat-figure text-4xl">✅</div>
              <div class="stat-title">Graded</div>
              <div class="stat-value tabular-nums">{{ classes.filter(c => c.hasGrade).length }}</div>
            </div>
          </div>
        </div>

        <!-- Classes Grid -->
        <div>
          <h3 class="section-header mb-6">Your Classes</h3>

          <div v-if="classes.length === 0" class="card bg-base-100 shadow-md">
            <div class="card-body text-center py-12">
              <p class="text-base-content/60">No classes found</p>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="cls in classes"
              :key="cls.classId"
              class="card-custom cursor-pointer"
              @click="viewClassDetails(cls.className)"
            >
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1 pr-4">
                  <h4 class="text-lg font-semibold mb-2 leading-tight">{{ cls.className }}</h4>
                  <div class="flex flex-wrap gap-2 mb-3">
                    <div class="badge badge-outline badge-sm">{{ cls.courseCode }}</div>
                    <div class="badge badge-info badge-sm">Period {{ cls.period }}</div>
                  </div>
                  <p class="text-sm text-base-content/60 flex items-center gap-1">
                    <span>👨‍🏫</span>
                    <a :href="`mailto:${cls.teacherEmail}`" class="hover:underline" @click.stop>
                      {{ cls.teacher }}
                    </a>
                  </p>
                </div>

                <div v-if="cls.hasGrade" class="text-right">
                  <div :class="['text-4xl font-bold tabular-nums', getGradeColor(cls.average)]">
                    {{ cls.average.toFixed(1) }}
                  </div>
                  <div class="text-xs text-base-content/60 mt-1">{{ cls.grade }}</div>
                </div>
                <div v-else class="text-right">
                  <div class="text-3xl text-base-content/20">N/A</div>
                </div>
              </div>

              <!-- Progress indicator -->
              <div v-if="cls.hasGrade" class="w-full bg-base-200 rounded-full h-2">
                <div
                  :class="['h-2 rounded-full transition-all',
                    cls.average >= 90 ? 'bg-success' :
                    cls.average >= 80 ? 'bg-info' :
                    cls.average >= 70 ? 'bg-warning' : 'bg-error'
                  ]"
                  :style="{ width: `${Math.min(cls.average, 100)}%` }"
                ></div>
              </div>

              <p class="text-xs text-center text-base-content/40 mt-3">Click to view assignments</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Class Details Modal -->
    <div v-if="showClassModal" class="modal modal-open">
      <div class="modal-box max-w-5xl">
        <!-- Modal Header -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-2xl font-bold">{{ selectedClassDetails?.className || 'Loading...' }}</h3>
            <p v-if="selectedClassDetails && selectedClassDetails.teacher" class="text-sm text-base-content/60 mt-1">
              {{ selectedClassDetails.teacher }}
            </p>
          </div>
          <button @click="closeClassModal" class="btn btn-ghost btn-sm btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Quarter Tabs -->
        <div class="tabs tabs-boxed mb-6">
          <button
            v-for="mp in [1, 2, 3, 4]"
            :key="mp"
            @click="changeMarkingPeriod(mp)"
            :class="['tab', selectedMarkingPeriod === mp ? 'tab-active' : '']"
            :disabled="loadingDetails"
          >
            Q{{ mp }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingDetails" class="flex flex-col items-center justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="text-base-content/60 mt-4">Loading assignments...</p>
        </div>

        <!-- Class Details Content -->
        <div v-else-if="selectedClassDetails" class="space-y-6">
          <!-- Average Card -->
          <div class="stats shadow bg-primary w-full">
            <div class="stat">
              <div class="stat-title text-primary-content/80">Quarter {{ selectedMarkingPeriod }} Average</div>
              <div class="stat-value text-primary-content tabular-nums">{{ selectedClassDetails.average }}</div>
              <div v-if="selectedClassDetails.lastUpdated" class="stat-desc text-primary-content/60">
                Last Updated: {{ selectedClassDetails.lastUpdated }}
              </div>
            </div>
          </div>

          <!-- Assignments Table -->
          <div v-if="selectedClassDetails.assignments && selectedClassDetails.assignments.length > 0">
            <h4 class="font-bold text-lg mb-3">Assignments ({{ selectedClassDetails.assignments.length }})</h4>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Due Date</th>
                    <th>Assignment</th>
                    <th>Category</th>
                    <th class="text-center">Score</th>
                    <th class="text-center">Total</th>
                    <th class="text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(assignment, idx) in selectedClassDetails.assignments" :key="idx">
                    <td class="text-sm">{{ assignment.dateDue }}</td>
                    <td class="font-medium">{{ assignment.name }}</td>
                    <td class="text-sm">{{ assignment.category }}</td>
                    <td class="text-center tabular-nums">{{ assignment.score }}</td>
                    <td class="text-center tabular-nums">{{ assignment.totalPoints }}</td>
                    <td class="text-center font-semibold tabular-nums">{{ assignment.percentage }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center py-8 text-base-content/60">
            No assignments found for Quarter {{ selectedMarkingPeriod }}
          </div>

          <!-- Categories -->
          <div v-if="selectedClassDetails.categories && selectedClassDetails.categories.length > 0">
            <h4 class="font-bold text-lg mb-3">Categories</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(category, idx) in selectedClassDetails.categories"
                :key="idx"
                class="card bg-base-200"
              >
                <div class="card-body py-4">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold">{{ category.name }}</span>
                    <span class="text-lg font-bold text-primary tabular-nums">{{ category.percentage }}</span>
                  </div>
                  <p class="text-sm text-base-content/60 tabular-nums">
                    {{ category.points }} / {{ category.maxPoints }} points
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeClassModal">
        <button>close</button>
      </form>
    </div>
  </div>
</template>
