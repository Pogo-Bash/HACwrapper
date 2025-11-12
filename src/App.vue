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
const showClassModal = ref(false)
const selectedMarkingPeriod = ref(1)
const originalClassName = ref('')
const darkMode = ref(false)
const assignmentSortBy = ref<'date' | 'grade-low' | 'grade-high' | 'alpha'>('date')
const editMode = ref(false)
const editedAssignments = ref<Assignment[]>([])
const originalAverage = ref<string>('')

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme')
  darkMode.value = savedTheme === 'dark'
  applyTheme()

  const savedUsername = localStorage.getItem('hacUsername')
  if (savedUsername) username.value = savedUsername
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
    // Entering edit mode - create a deep copy of assignments
    editedAssignments.value = JSON.parse(JSON.stringify(selectedClassDetails.value?.assignments || []))
    originalAverage.value = selectedClassDetails.value?.average || '0'
  } else {
    // Exiting edit mode - clear edited data
    editedAssignments.value = []
  }
}

function resetEditedGrades() {
  if (selectedClassDetails.value?.assignments) {
    editedAssignments.value = JSON.parse(JSON.stringify(selectedClassDetails.value.assignments))
    originalAverage.value = selectedClassDetails.value.average || '0'
  }
}

function updateAssignmentGrade(assignment: Assignment, field: 'score' | 'totalPoints', value: string) {
  // Find the assignment in the editedAssignments array
  const index = editedAssignments.value.findIndex(a =>
    a.name === assignment.name &&
    a.dateAssigned === assignment.dateAssigned &&
    a.category === assignment.category
  )

  if (index !== -1) {
    editedAssignments.value[index][field] = value

    // Recalculate percentage for this assignment
    const score = parseFloat(editedAssignments.value[index].score) || 0
    const total = parseFloat(editedAssignments.value[index].totalPoints) || 1
    const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : '0.00'
    editedAssignments.value[index].percentage = percentage
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
              HAC Wrapper
            </h1>
            <p class="text-sm text-base-content/60 mt-2">Secure grade access, beautifully designed</p>
          </div>
          <div class="flex items-center gap-4">
            <!-- Theme Toggle -->
            <label class="swap swap-rotate btn btn-ghost btn-circle btn-lg">
              <input type="checkbox" :checked="darkMode" @change="toggleDarkMode" />
              <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
              <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
            </label>

            <div v-if="isLoggedIn" class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-xs text-base-content/60">Logged in as</p>
                <p class="font-semibold text-sm mt-1">{{ studentName }}</p>
              </div>
              <button @click="logout" class="btn btn-ghost btn-sm px-6 py-2">
                Logout
              </button>
            </div>
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
              <div class="text-7xl mb-6">🎓</div>
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
                  class="input input-bordered input-lg w-full touch-manipulation"
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
                  class="input input-bordered input-lg w-full touch-manipulation"
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
                  class="input input-bordered input-lg w-full touch-manipulation"
                />
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="btn btn-primary w-full font-semibold text-base px-6 py-4 h-auto min-h-[3rem] mt-6"
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
      <div v-else class="space-y-12">
        <!-- Welcome Card -->
        <div class="card bg-primary shadow-xl">
          <div class="card-body p-8 md:p-10">
            <h2 class="text-4xl md:text-5xl font-bold text-primary-content mb-4 tracking-tight">
              Welcome back, {{ studentName }}! 👋
            </h2>
            <p class="text-lg text-primary-content/80">Here's your academic overview</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div class="stats shadow-lg bg-base-100">
            <div class="stat p-6 md:p-8">
              <div class="stat-figure text-5xl mb-4">📊</div>
              <div class="stat-title text-base mb-3">Unweighted GPA</div>
              <div class="stat-value text-5xl tabular-nums">{{ calculateUnweightedGPA() }}</div>
              <div class="stat-desc text-sm mt-2">Out of 4.0</div>
            </div>
          </div>

          <div class="stats shadow-lg bg-base-100">
            <div class="stat p-6 md:p-8">
              <div class="stat-figure text-5xl mb-4">⭐</div>
              <div class="stat-title text-base mb-3">Weighted GPA</div>
              <div class="stat-value text-5xl tabular-nums">{{ calculateWeightedGPA() }}</div>
              <div class="stat-desc text-sm mt-2">Out of 5.0 (H/AP)</div>
            </div>
          </div>

          <div class="stats shadow-lg bg-base-100">
            <div class="stat p-6 md:p-8">
              <div class="stat-figure text-5xl mb-4">✅</div>
              <div class="stat-title text-base mb-3">Graded Classes</div>
              <div class="stat-value text-5xl tabular-nums">{{ classes.filter(c => c.hasGrade).length }}</div>
            </div>
          </div>
        </div>

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
      <div class="modal-box max-w-6xl p-8 md:p-10">
        <!-- Modal Header -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <h3 class="text-3xl font-bold mb-2">{{ selectedClassDetails?.className || 'Loading...' }}</h3>
            <p v-if="selectedClassDetails && selectedClassDetails.teacher" class="text-base text-base-content/60">
              {{ selectedClassDetails.teacher }}
            </p>
          </div>
          <button @click="closeClassModal" class="btn btn-ghost btn-circle btn-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Quarter Tabs -->
        <div class="tabs tabs-boxed mb-8 p-2">
          <button
            v-for="mp in [1, 2, 3, 4]"
            :key="mp"
            @click="changeMarkingPeriod(mp)"
            :class="[
              'tab tab-lg px-6 py-3 transition-all',
              selectedMarkingPeriod === mp
                ? 'tab-active !bg-primary !text-primary-content font-bold shadow-lg scale-105'
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
        <div v-else-if="selectedClassDetails" class="space-y-8">
          <!-- Average Card -->
          <div class="stats shadow-lg bg-primary w-full">
            <div class="stat p-8">
              <div class="stat-title text-primary-content/80 text-base mb-2">
                Quarter {{ selectedMarkingPeriod }} Average
              </div>
              <div class="stat-value text-primary-content text-6xl tabular-nums mb-2">
                {{ selectedClassDetails.average }}
              </div>
              <div v-if="editMode && calculatedAverage !== selectedClassDetails.average" class="mt-4">
                <div class="text-primary-content/80 text-sm mb-1">What-If Scenario:</div>
                <div class="flex items-center gap-3">
                  <span class="text-3xl font-bold text-primary-content/60 line-through tabular-nums">
                    {{ originalAverage }}
                  </span>
                  <span class="text-4xl text-primary-content">→</span>
                  <span class="text-4xl font-bold text-success tabular-nums">
                    {{ calculatedAverage }}
                  </span>
                  <span class="badge badge-lg" :class="parseFloat(calculatedAverage) > parseFloat(originalAverage) ? 'badge-success' : 'badge-error'">
                    {{ (parseFloat(calculatedAverage) - parseFloat(originalAverage)).toFixed(2) > '0' ? '+' : '' }}{{ (parseFloat(calculatedAverage) - parseFloat(originalAverage)).toFixed(2) }}%
                  </span>
                </div>
              </div>
              <div v-if="selectedClassDetails.lastUpdated" class="stat-desc text-primary-content/60 text-sm mt-2">
                Last Updated: {{ selectedClassDetails.lastUpdated }}
              </div>
            </div>
          </div>

          <!-- Assignments Table -->
          <div v-if="selectedClassDetails.assignments && selectedClassDetails.assignments.length > 0">
            <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h4 class="font-bold text-xl">Assignments ({{ selectedClassDetails.assignments.length }})</h4>
              <div class="flex gap-3 items-end">
                <div class="form-control">
                  <label class="label pb-1">
                    <span class="label-text text-sm font-medium">Sort by:</span>
                  </label>
                  <select v-model="assignmentSortBy" class="select select-bordered select-sm">
                    <option value="date">Date Assigned (Newest)</option>
                    <option value="grade-low">Grade (Lowest First)</option>
                    <option value="grade-high">Grade (Highest First)</option>
                    <option value="alpha">Alphabetical</option>
                  </select>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="toggleEditMode"
                    :class="['btn btn-sm', editMode ? 'btn-success' : 'btn-outline']"
                  >
                    {{ editMode ? '✓ Edit Mode Active' : '✏️ Edit Mode' }}
                  </button>
                  <button
                    v-if="editMode"
                    @click="resetEditedGrades"
                    class="btn btn-sm btn-ghost"
                    title="Reset to original grades"
                  >
                    ↺ Reset
                  </button>
                </div>
              </div>
            </div>
            <div v-if="editMode" class="alert alert-info mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span class="text-sm">Edit assignment scores to see how they would impact your grade. Changes are temporary and won't be saved.</span>
            </div>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr class="text-base">
                    <th class="py-5">Due Date</th>
                    <th class="py-5">Assignment</th>
                    <th class="py-5">Category</th>
                    <th class="py-5 text-center">Score</th>
                    <th class="py-5 text-center">Total</th>
                    <th class="py-5 text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(assignment, idx) in sortedAssignments" :key="idx">
                    <td class="py-5 text-sm">{{ assignment.dateDue }}</td>
                    <td class="py-5 font-medium">{{ assignment.name }}</td>
                    <td class="py-5 text-sm">{{ assignment.category }}</td>
                    <td class="py-5 text-center tabular-nums">
                      <input
                        v-if="editMode"
                        type="number"
                        step="0.01"
                        :value="assignment.score"
                        @input="updateAssignmentGrade(assignment, 'score', ($event.target as HTMLInputElement).value)"
                        class="input input-bordered input-sm w-20 text-center"
                      />
                      <span v-else>{{ assignment.score }}</span>
                    </td>
                    <td class="py-5 text-center tabular-nums">
                      <input
                        v-if="editMode"
                        type="number"
                        step="0.01"
                        :value="assignment.totalPoints"
                        @input="updateAssignmentGrade(assignment, 'totalPoints', ($event.target as HTMLInputElement).value)"
                        class="input input-bordered input-sm w-20 text-center"
                      />
                      <span v-else>{{ assignment.totalPoints }}</span>
                    </td>
                    <td class="py-5 text-center font-semibold tabular-nums" :class="editMode ? getGradeColor(parseFloat(assignment.percentage)) : ''">
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
            <h4 class="font-bold text-xl mb-6">Categories</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="(category, idx) in selectedClassDetails.categories"
                :key="idx"
                class="card bg-base-200 shadow-sm"
              >
                <div class="card-body p-6">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold text-base">{{ category.name }}</span>
                    <span class="text-xl font-bold text-primary tabular-nums">{{ category.percentage }}</span>
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
