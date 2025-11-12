<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { themes, getTheme, applyTheme as applyThemeColors, getSavedTheme, saveTheme, type ThemeColors } from './themes'
import Logo from './components/Logo.vue'

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
const showClassModal = ref(false)
const selectedMarkingPeriod = ref(1)
const originalClassName = ref('')
const displayClassName = ref('')
const showSettingsModal = ref(false)
const currentThemeName = ref(getSavedTheme())
const assignmentSortBy = ref<'date' | 'grade-low' | 'grade-high' | 'alpha'>('date')
const editMode = ref(false)
const editedAssignments = ref<Assignment[]>([])
const originalAverage = ref<string>('')

onMounted(async () => {
  // Apply saved theme
  const themeName = getSavedTheme()
  const theme = getTheme(themeName)
  if (theme) {
    applyThemeColors(theme)
    currentThemeName.value = themeName
  }

  const savedUsername = localStorage.getItem('hacUsername')
  if (savedUsername) username.value = savedUsername
})

function changeTheme(themeName: string) {
  const theme = getTheme(themeName)
  if (theme) {
    applyThemeColors(theme)
    saveTheme(themeName)
    currentThemeName.value = themeName
  }
}

async function login() {
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    localStorage.setItem('hacUsername', username.value)

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
    } else {
      throw new Error('Login failed - check your credentials')
    }

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
    }

  } catch (err) {
    console.error('Login error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch data'

    if (error.value.includes('Failed to fetch')) {
      error.value = '❌ Network error: Cannot connect to server. Please check your internet connection.'
    } else if (error.value.includes('ERR_CONNECTION_REFUSED')) {
      error.value = '❌ Connection refused: Server may be offline or unreachable.'
    } else if (error.value.includes('CORS')) {
      error.value = '❌ CORS error: Browser security blocking request. Try clearing cache or using a different browser.'
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

  // Reset edit mode when switching classes
  editMode.value = false
  editedAssignments.value = []

  if (!showClassModal.value || !originalClassName.value) {
    originalClassName.value = className
    displayClassName.value = className
  }

  if (markingPeriod !== 1 && originalClassName.value) {
    className = originalClassName.value
  } else {
    originalClassName.value = className
    displayClassName.value = className
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
  displayClassName.value = ''

  // Reset edit mode when closing modal
  editMode.value = false
  editedAssignments.value = []
}

function logout() {
  isLoggedIn.value = false
  studentName.value = ''
  classes.value = []
  password.value = ''
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

function isHonorsOrAP(className: string): boolean {
  // Match "AP" or standalone "H" as whole words in the class name
  return /\b(AP|H)\b/i.test(className)
}

function percentageToGPA(average: number, isWeighted: boolean = false): number {
  let gpa = 0
  if (average >= 90) gpa = 4.0
  else if (average >= 80) gpa = 3.0
  else if (average >= 70) gpa = 2.0
  else if (average >= 60) gpa = 1.0
  else gpa = 0.0

  // Add 1.0 point for weighted (H/AP) classes
  if (isWeighted && gpa > 0) gpa += 1.0

  return gpa
}

function calculateUnweightedGPA(): string {
  const gradedClasses = classes.value.filter(c => c.hasGrade)
  if (gradedClasses.length === 0) return 'N/A'

  const totalGPA = gradedClasses.reduce((acc, c) => {
    return acc + percentageToGPA(c.average, false)
  }, 0)

  return (totalGPA / gradedClasses.length).toFixed(2)
}

function calculateWeightedGPA(): string {
  const gradedClasses = classes.value.filter(c => c.hasGrade)
  if (gradedClasses.length === 0) return 'N/A'

  const totalGPA = gradedClasses.reduce((acc, c) => {
    const isWeighted = isHonorsOrAP(c.className)
    return acc + percentageToGPA(c.average, isWeighted)
  }, 0)

  return (totalGPA / gradedClasses.length).toFixed(2)
}

const sortedAssignments = computed(() => {
  if (!selectedClassDetails.value?.assignments) return []

  const assignments = editMode.value ? [...editedAssignments.value] : [...selectedClassDetails.value.assignments]

  switch (assignmentSortBy.value) {
    case 'grade-low':
      return assignments.sort((a, b) => {
        const percentA = parseFloat(a.percentage) || 0
        const percentB = parseFloat(b.percentage) || 0
        return percentA - percentB
      })
    case 'grade-high':
      return assignments.sort((a, b) => {
        const percentA = parseFloat(a.percentage) || 0
        const percentB = parseFloat(b.percentage) || 0
        return percentB - percentA
      })
    case 'alpha':
      return assignments.sort((a, b) => a.name.localeCompare(b.name))
    case 'date':
    default:
      return assignments.sort((a, b) => {
        const dateA = new Date(a.dateAssigned).getTime() || 0
        const dateB = new Date(b.dateAssigned).getTime() || 0
        return dateB - dateA // Most recent first
      })
  }
})

function toggleEditMode() {
  editMode.value = !editMode.value

  if (editMode.value) {
    // Entering edit mode - create a deep copy of assignments with unique IDs
    editedAssignments.value = JSON.parse(JSON.stringify(selectedClassDetails.value?.assignments || [])).map((a: Assignment, idx: number) => ({
      ...a,
      _id: idx // Add unique ID for tracking
    }))
    originalAverage.value = selectedClassDetails.value?.average || '0'
  } else {
    // Exiting edit mode - clear edited data
    editedAssignments.value = []
  }
}

function resetEditedGrades() {
  if (selectedClassDetails.value?.assignments) {
    editedAssignments.value = JSON.parse(JSON.stringify(selectedClassDetails.value.assignments)).map((a: Assignment, idx: number) => ({
      ...a,
      _id: idx
    }))
    originalAverage.value = selectedClassDetails.value.average || '0'
  }
}

function updateAssignmentGrade(assignmentId: number, field: 'score' | 'totalPoints', value: string) {
  // Find the assignment in the editedAssignments array by ID
  const assignment = editedAssignments.value.find((a: any) => a._id === assignmentId)

  if (assignment) {
    assignment[field] = value

    // Recalculate percentage for this assignment
    const score = parseFloat(assignment.score) || 0
    const total = parseFloat(assignment.totalPoints) || 1
    const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : '0.00'
    assignment.percentage = percentage
  }
}

const calculatedAverage = computed(() => {
  if (!editMode.value || editedAssignments.value.length === 0) {
    return selectedClassDetails.value?.average || '0'
  }

  // Group assignments by category
  const categoriesByName: { [key: string]: { points: number, maxPoints: number, weight: number } } = {}

  editedAssignments.value.forEach(assignment => {
    const category = assignment.category
    const score = parseFloat(assignment.score) || 0
    const total = parseFloat(assignment.totalPoints) || 0
    const weight = parseFloat(assignment.weight) || 1

    if (!categoriesByName[category]) {
      categoriesByName[category] = { points: 0, maxPoints: 0, weight: weight }
    }

    categoriesByName[category].points += score * weight
    categoriesByName[category].maxPoints += total * weight
  })

  // Calculate weighted average across categories
  let totalWeightedPoints = 0
  let totalMaxPoints = 0

  Object.values(categoriesByName).forEach(cat => {
    totalWeightedPoints += cat.points
    totalMaxPoints += cat.maxPoints
  })

  const average = totalMaxPoints > 0 ? (totalWeightedPoints / totalMaxPoints) * 100 : 0
  return average.toFixed(2)
})
</script>

<template>
  <div class="min-h-screen bg-neutral">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-base-100 border-b border-base-300 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-base-content">
              staHAC
            </h1>
            <p class="text-sm text-base-content/60 mt-2">Secure grade access, beautifully designed</p>
          </div>
          <div class="flex items-center gap-3 sm:gap-4">
            <button
              @click="showSettingsModal = true"
              class="btn btn-ghost btn-circle min-h-[44px] min-w-[44px] sm:btn-md"
              title="Theme Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button v-if="isLoggedIn" @click="logout" class="btn btn-ghost min-h-[44px] px-4 sm:px-6 text-sm sm:text-base">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <!-- Login Form -->
      <div v-if="!isLoggedIn" class="max-w-md mx-auto">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body p-8 md:p-10">
            <div class="text-center mb-8">
              <div class="flex justify-center mb-6">
                <Logo :width="112" :height="112" :animated="true" />
              </div>
              <h2 class="text-3xl font-bold tracking-tight mb-3">Login to HAC</h2>
              <p class="text-base text-base-content/60">Enter your credentials to view grades</p>
            </div>

            <form @submit.prevent="login" class="space-y-5">
              <div class="form-control">
                <label class="label pb-2">
                  <span class="label-text font-medium text-base">HAC URL</span>
                </label>
                <input
                  v-model="hacUrl"
                  type="url"
                  required
                  inputmode="url"
                  placeholder="https://hac.eths.k12.il.us/"
                  class="input input-bordered input-lg w-full touch-manipulation min-h-[52px] text-base"
                />
              </div>

              <div class="form-control">
                <label class="label pb-2">
                  <span class="label-text font-medium text-base">Username</span>
                </label>
                <input
                  v-model="username"
                  type="text"
                  required
                  inputmode="text"
                  autocomplete="username"
                  placeholder="Your username"
                  class="input input-bordered input-lg w-full touch-manipulation min-h-[52px] text-base"
                />
              </div>

              <div class="form-control">
                <label class="label pb-2">
                  <span class="label-text font-medium text-base">Password</span>
                </label>
                <input
                  v-model="password"
                  type="password"
                  required
                  autocomplete="current-password"
                  placeholder="Your password"
                  class="input input-bordered input-lg w-full touch-manipulation min-h-[52px] text-base"
                />
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="btn btn-primary w-full font-semibold text-lg px-6 py-4 h-auto min-h-[56px] mt-6 touch-manipulation"
              >
                <span v-if="loading" class="loading loading-spinner loading-md"></span>
                {{ loading ? 'Logging in...' : 'Login' }}
              </button>

              <div v-if="error" class="alert alert-error py-4 px-6 mt-5">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="text-sm">{{ error }}</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-8">
        <!-- Classes Grid -->
        <div>
          <h3 class="text-2xl font-semibold mb-8">Your Classes</h3>

          <div v-if="classes.length === 0" class="card bg-base-100 shadow-md">
            <div class="card-body text-center py-16">
              <p class="text-base-content/60 text-lg">No classes found</p>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div
              v-for="cls in classes"
              :key="cls.classId"
              class="card bg-base-100 shadow-lg rounded-2xl p-6 md:p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
              @click="viewClassDetails(cls.className)"
            >
              <div class="flex justify-between items-start gap-4 mb-6">
                <!-- Left side: Content (can shrink) -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-xl font-semibold mb-3 leading-tight break-words">
                    {{ cls.className }}
                  </h4>
                  <div class="flex flex-wrap gap-2 mb-4">
                    <div class="badge badge-outline badge-sm px-3 py-2 text-xs">{{ cls.courseCode }}</div>
                    <div class="badge badge-info badge-sm px-3 py-2 text-xs">Period {{ cls.period }}</div>
                  </div>
                  <p class="text-sm text-base-content/60 flex items-center gap-2 mt-3">
                    <span>👨‍🏫</span>
                    <span class="truncate">{{ cls.teacher }}</span>
                  </p>
                </div>

                <!-- Right side: Grade (never shrinks) -->
                <div v-if="cls.hasGrade" class="text-right flex-shrink-0 w-28">
                  <div :class="['text-4xl font-bold tabular-nums leading-none mb-2', getGradeColor(cls.average)]">
                    {{ cls.average.toFixed(1) }}
                  </div>
                  <div class="text-xs text-base-content/60">{{ cls.grade }}</div>
                </div>
                <div v-else class="text-right flex-shrink-0 w-28">
                  <div class="text-4xl text-base-content/20 leading-none">N/A</div>
                </div>
              </div>

              <!-- Progress indicator -->
              <div v-if="cls.hasGrade" class="w-full bg-base-200 rounded-full h-3 mb-4">
                <div
                  :class="['h-3 rounded-full transition-all',
                    cls.average >= 90 ? 'bg-success' :
                    cls.average >= 80 ? 'bg-info' :
                    cls.average >= 70 ? 'bg-warning' : 'bg-error'
                  ]"
                  :style="{ width: `${Math.min(cls.average, 100)}%` }"
                ></div>
              </div>

              <p class="text-xs text-center text-base-content/40 mt-4 pt-4 border-t border-base-200">
                Click to view assignments
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Class Details Modal -->
    <div v-if="showClassModal" class="modal modal-open">
      <div class="modal-box w-full h-full max-h-full md:max-w-6xl md:h-auto md:max-h-[90vh] p-4 sm:p-6 md:p-8 lg:p-10 m-0 md:m-4 rounded-none md:rounded-2xl overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex justify-between items-start mb-6 md:mb-8 sticky top-0 bg-base-100 z-10 pb-4 -mt-4 pt-4">
          <div class="flex-1 min-w-0 mr-3">
            <h3 class="text-xl sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2 truncate">{{ displayClassName }}</h3>
            <p v-if="selectedClassDetails && selectedClassDetails.teacher" class="text-sm md:text-base text-base-content/60 truncate">
              {{ selectedClassDetails.teacher }}
            </p>
          </div>
          <button @click="closeClassModal" class="btn btn-ghost btn-circle min-h-[44px] min-w-[44px] md:btn-lg flex-shrink-0 touch-manipulation">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Quarter Tabs -->
        <div class="tabs tabs-boxed mb-6 md:mb-8 p-1 md:p-2 grid grid-cols-4 gap-1 sm:gap-2">
          <button
            v-for="mp in [1, 2, 3, 4]"
            :key="mp"
            @click="changeMarkingPeriod(mp)"
            :class="[
              'tab text-sm sm:text-base md:text-lg md:tab-lg px-3 sm:px-4 md:px-6 py-3 md:py-4 transition-all touch-manipulation min-h-[48px] font-semibold',
              selectedMarkingPeriod === mp
                ? 'tab-active !bg-primary !text-primary-content font-bold shadow-lg md:scale-105'
                : 'hover:bg-base-300'
            ]"
            :disabled="loadingDetails"
          >
            Q{{ mp }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingDetails" class="flex flex-col items-center justify-center py-16">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="text-base-content/60 mt-6 text-base">Loading assignments...</p>
        </div>

        <!-- Class Details Content -->
        <div v-else-if="selectedClassDetails" class="space-y-6 md:space-y-8">
          <!-- Average Card -->
          <div class="stats shadow-lg bg-primary w-full">
            <div class="stat p-4 sm:p-6 md:p-8">
              <div class="stat-title text-primary-content/80 text-sm md:text-base mb-2">
                Quarter {{ selectedMarkingPeriod }} Average
              </div>
              <div class="stat-value text-primary-content text-4xl sm:text-5xl md:text-6xl tabular-nums mb-2">
                {{ selectedClassDetails.average }}
              </div>
              <div v-if="editMode && calculatedAverage !== selectedClassDetails.average" class="mt-3 md:mt-4">
                <div class="text-primary-content/80 text-xs md:text-sm mb-1">What-If Scenario:</div>
                <div class="flex flex-wrap items-center gap-2 md:gap-3">
                  <span class="text-xl sm:text-2xl md:text-3xl font-bold text-primary-content/60 line-through tabular-nums">
                    {{ originalAverage }}
                  </span>
                  <span class="text-2xl sm:text-3xl md:text-4xl text-primary-content">→</span>
                  <span class="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-content tabular-nums">
                    {{ calculatedAverage }}
                  </span>
                  <span class="badge badge-md md:badge-lg font-bold" :style="{ backgroundColor: parseFloat(calculatedAverage) > parseFloat(originalAverage) ? 'var(--color-primary)' : 'var(--color-error)', color: parseFloat(calculatedAverage) > parseFloat(originalAverage) ? 'var(--color-primaryContent)' : 'var(--color-surface)' }">
                    {{ (parseFloat(calculatedAverage) - parseFloat(originalAverage)).toFixed(2) > '0' ? '+' : '' }}{{ (parseFloat(calculatedAverage) - parseFloat(originalAverage)).toFixed(2) }}%
                  </span>
                </div>
              </div>
              <div v-if="selectedClassDetails.lastUpdated" class="stat-desc text-primary-content/60 text-xs md:text-sm mt-2">
                Last Updated: {{ selectedClassDetails.lastUpdated }}
              </div>
            </div>
          </div>

          <!-- Assignments Table -->
          <div v-if="selectedClassDetails.assignments && selectedClassDetails.assignments.length > 0">
            <div class="mb-6">
              <h4 class="font-bold text-lg md:text-xl mb-4">Assignments ({{ selectedClassDetails.assignments.length }})</h4>
              <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                <div class="form-control flex-1 sm:flex-initial sm:min-w-[200px]">
                  <label class="label pb-2">
                    <span class="label-text text-sm sm:text-base font-medium">Sort by</span>
                  </label>
                  <select v-model="assignmentSortBy" class="select select-bordered select-md w-full touch-manipulation min-h-[48px] text-base">
                    <option value="date">Date (Newest)</option>
                    <option value="grade-low">Grade (Low→High)</option>
                    <option value="grade-high">Grade (High→Low)</option>
                    <option value="alpha">A-Z</option>
                  </select>
                </div>
                <div class="flex gap-3 flex-1 sm:flex-initial">
                  <button
                    @click="toggleEditMode"
                    :class="['btn btn-md flex-1 sm:flex-initial touch-manipulation min-h-[48px] text-base font-medium', editMode ? 'btn-success' : 'btn-outline']"
                  >
                    <span class="hidden sm:inline">{{ editMode ? '✓ Edit Mode Active' : '✏️ Edit Mode' }}</span>
                    <span class="sm:hidden">{{ editMode ? '✓ Active' : '✏️ Edit' }}</span>
                  </button>
                  <button
                    v-if="editMode"
                    @click="resetEditedGrades"
                    class="btn btn-ghost btn-md touch-manipulation min-h-[48px] text-base"
                    title="Reset to original grades"
                  >
                    <span class="text-xl mr-1">↺</span> <span class="hidden sm:inline">Reset</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="editMode" class="alert alert-info mb-4 py-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-5 h-5 md:w-6 md:h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span class="text-sm md:text-base">Edit scores to see grade impact. Changes are temporary.</span>
            </div>
            <div class="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table class="table table-zebra table-md md:table-lg w-full">
                <thead>
                  <tr class="text-sm sm:text-base md:text-lg">
                    <th class="py-4 md:py-5 px-3 sm:px-4 hidden sm:table-cell w-[100px]">Due Date</th>
                    <th class="py-4 md:py-5 px-3 sm:px-4 w-auto min-w-[140px]">Assignment</th>
                    <th class="py-4 md:py-5 px-3 sm:px-4 hidden lg:table-cell w-[120px]">Category</th>
                    <th class="py-4 md:py-5 px-3 sm:px-4 text-center w-[90px] sm:w-[110px]">Score</th>
                    <th class="py-4 md:py-5 px-3 sm:px-4 text-center w-[90px] sm:w-[110px]">Total</th>
                    <th class="py-4 md:py-5 px-3 sm:px-4 text-center w-[80px] sm:w-[100px]">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(assignment, idx) in sortedAssignments" :key="editMode ? (assignment as any)._id : idx">
                    <td class="py-4 md:py-5 px-3 sm:px-4 text-sm hidden sm:table-cell whitespace-nowrap">{{ assignment.dateDue }}</td>
                    <td class="py-4 md:py-5 px-3 sm:px-4 text-sm sm:text-base font-medium">
                      <div class="truncate min-w-[140px] max-w-[200px] sm:max-w-none">{{ assignment.name }}</div>
                      <div class="text-xs sm:hidden text-base-content/60 mt-1 truncate">{{ assignment.category }}</div>
                    </td>
                    <td class="py-4 md:py-5 px-3 sm:px-4 text-sm hidden lg:table-cell">{{ assignment.category }}</td>
                    <td class="py-4 md:py-5 px-3 sm:px-4 text-center tabular-nums whitespace-nowrap">
                      <input
                        v-if="editMode"
                        type="number"
                        step="0.01"
                        inputmode="decimal"
                        :value="assignment.score"
                        @input="updateAssignmentGrade((assignment as any)._id, 'score', ($event.target as HTMLInputElement).value)"
                        class="input input-bordered input-sm md:input-md w-16 sm:w-20 md:w-24 text-center touch-manipulation text-sm md:text-base min-h-[44px]"
                      />
                      <span v-else class="text-sm md:text-base">{{ assignment.score }}</span>
                    </td>
                    <td class="py-4 md:py-5 px-3 sm:px-4 text-center tabular-nums whitespace-nowrap">
                      <input
                        v-if="editMode"
                        type="number"
                        step="0.01"
                        inputmode="decimal"
                        :value="assignment.totalPoints"
                        @input="updateAssignmentGrade((assignment as any)._id, 'totalPoints', ($event.target as HTMLInputElement).value)"
                        class="input input-bordered input-sm md:input-md w-16 sm:w-20 md:w-24 text-center touch-manipulation text-sm md:text-base min-h-[44px]"
                      />
                      <span v-else class="text-sm md:text-base">{{ assignment.totalPoints }}</span>
                    </td>
                    <td class="py-4 md:py-5 px-3 sm:px-4 text-center font-semibold tabular-nums text-sm md:text-base whitespace-nowrap">
                      {{ assignment.percentage }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center py-16 text-base-content/60 text-base">
            No assignments found for Quarter {{ selectedMarkingPeriod }}
          </div>

          <!-- Categories -->
          <div v-if="selectedClassDetails.categories && selectedClassDetails.categories.length > 0">
            <h4 class="font-bold text-lg md:text-xl mb-4 md:mb-6">Categories</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div
                v-for="(category, idx) in selectedClassDetails.categories"
                :key="idx"
                class="card bg-base-200 shadow-sm"
              >
                <div class="card-body p-4 md:p-6">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold text-sm md:text-base">{{ category.name }}</span>
                    <span class="text-lg md:text-xl font-bold text-primary tabular-nums">{{ category.percentage }}</span>
                  </div>
                  <p class="text-xs md:text-sm text-base-content/60 tabular-nums">
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

    <!-- Settings Modal -->
    <div v-if="showSettingsModal" class="modal modal-open">
      <div class="modal-box max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        <!-- Fixed Header -->
        <div class="sticky top-0 bg-base-100 z-10 px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-base-300">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1 mr-3">
              <h3 class="text-2xl sm:text-3xl font-bold mb-2">Theme Settings</h3>
              <p class="text-sm sm:text-base text-base-content/60">Choose from 8 beautiful dark pastel themes</p>
            </div>
            <button @click="showSettingsModal = false" class="btn btn-ghost btn-circle min-h-[44px] min-w-[44px] sm:btn-md flex-shrink-0 touch-manipulation">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto max-h-[calc(85vh-140px)] px-6 sm:px-8 py-6 sm:py-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <button
              v-for="theme in themes"
              :key="theme.name"
              @click="changeTheme(theme.name); showSettingsModal = false"
              :class="[
                'card bg-base-100 border-2 p-6 sm:p-7 text-left transition-all hover:shadow-xl hover:scale-[1.02] touch-manipulation min-h-[120px]',
                currentThemeName === theme.name ? 'border-primary shadow-xl ring-2 ring-primary ring-opacity-50' : 'border-base-300 hover:border-base-content/20'
              ]"
            >
              <div class="flex items-start gap-4 sm:gap-5">
                <div class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-lg" :style="{ background: theme.colors.primary }"></div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-base sm:text-lg md:text-xl mb-2">{{ theme.name }}</h4>
                  <p class="text-xs sm:text-sm text-base-content/60 line-clamp-2 mb-4 leading-relaxed">{{ theme.description }}</p>
                  <div class="flex gap-2 sm:gap-2.5">
                    <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm" :style="{ background: theme.colors.gradeA }" title="A"></div>
                    <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm" :style="{ background: theme.colors.gradeB }" title="B"></div>
                    <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm" :style="{ background: theme.colors.gradeC }" title="C"></div>
                    <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm" :style="{ background: theme.colors.gradeD }" title="D"></div>
                    <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm" :style="{ background: theme.colors.gradeF }" title="F"></div>
                  </div>
                </div>
                <div v-if="currentThemeName === theme.name" class="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 sm:h-8 sm:w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showSettingsModal = false">
        <button>close</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Apply theme colors using CSS variables */
:global(body) {
  background-color: var(--color-background);
  color: var(--color-textPrimary);
}

:global(.bg-neutral) {
  background-color: var(--color-background) !important;
}

:global(.bg-base-100) {
  background-color: var(--color-surface) !important;
}

:global(.bg-base-200) {
  background-color: var(--color-surface) !important;
  opacity: 0.8;
}

:global(.bg-primary) {
  background-color: var(--color-primary) !important;
}

:global(.bg-success) {
  background-color: var(--color-success) !important;
}

:global(.text-base-content) {
  color: var(--color-textPrimary) !important;
}

:global(.text-base-content\/60) {
  color: var(--color-textSecondary) !important;
}

:global(.text-base-content\/40) {
  color: var(--color-textMuted) !important;
}

:global(.text-primary-content) {
  color: var(--color-primaryContent) !important;
}

:global(.text-primary-content\/80) {
  color: var(--color-primaryContent) !important;
  opacity: 0.8;
}

:global(.text-primary-content\/60) {
  color: var(--color-primaryContent) !important;
  opacity: 0.6;
}

:global(.text-success) {
  color: var(--color-gradeA) !important;
}

:global(.text-info) {
  color: var(--color-gradeB) !important;
}

:global(.text-warning) {
  color: var(--color-gradeC) !important;
}

:global(.text-error) {
  color: var(--color-gradeF) !important;
}

:global(.text-primary) {
  color: var(--color-primary) !important;
}

:global(.border-base-300) {
  border-color: var(--color-border) !important;
}

:global(.border-base-200) {
  border-color: var(--color-border) !important;
}

:global(.input) {
  background-color: var(--color-inputBg) !important;
  border-color: var(--color-inputBorder) !important;
  color: var(--color-textPrimary) !important;
}

:global(.input:focus) {
  border-color: var(--color-inputFocus) !important;
  outline-color: var(--color-inputFocus) !important;
}

:global(.select) {
  background-color: var(--color-inputBg) !important;
  border-color: var(--color-inputBorder) !important;
  color: var(--color-textPrimary) !important;
}

:global(.select:focus) {
  border-color: var(--color-inputFocus) !important;
  outline-color: var(--color-inputFocus) !important;
}

:global(.btn-primary) {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-primaryContent) !important;
}

:global(.btn-primary:hover) {
  background-color: var(--color-primaryHover) !important;
  border-color: var(--color-primaryHover) !important;
}

:global(.btn-outline) {
  border-color: var(--color-primary) !important;
  color: var(--color-primary) !important;
}

:global(.btn-outline:hover) {
  background-color: var(--color-primary) !important;
  color: var(--color-primaryContent) !important;
}

:global(.btn-success) {
  background-color: var(--color-success) !important;
  border-color: var(--color-success) !important;
  color: var(--color-textPrimary) !important;
}

:global(.badge-success) {
  background-color: var(--color-success) !important;
  color: var(--color-textPrimary) !important;
}

:global(.badge-error) {
  background-color: var(--color-error) !important;
  color: var(--color-surface) !important;
}

:global(.badge-info) {
  background-color: var(--color-info) !important;
  color: var(--color-textPrimary) !important;
}

:global(.alert-info) {
  background-color: var(--color-info) !important;
  color: var(--color-textPrimary) !important;
  opacity: 0.9;
}

:global(.card) {
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
}

:global(.card:hover) {
  background-color: var(--color-surfaceHover) !important;
}

:global(.modal-backdrop) {
  background-color: var(--color-modalBackdrop) !important;
}

:global(.tab) {
  background-color: var(--color-tabInactive) !important;
  color: var(--color-textSecondary) !important;
}

:global(.tab-active) {
  background-color: var(--color-tabActive) !important;
  color: var(--color-primaryContent) !important;
}

:global(.progress) {
  background-color: var(--color-progressBar) !important;
}
</style>
