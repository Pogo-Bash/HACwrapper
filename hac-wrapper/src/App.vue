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

const hacUrl = ref('https://hac.eths.k12.il.us/')
const username = ref('')
const password = ref('')
const studentName = ref('')
const classes = ref<Class[]>([])
const loading = ref(false)
const error = ref('')
const isLoggedIn = ref(false)
const debugInfo = ref('')

onMounted(async () => {
  const savedUsername = localStorage.getItem('hacUsername')
  if (savedUsername) username.value = savedUsername
  
  try {
    debugInfo.value = 'Testing proxy connection...'
    const response = await fetch('http://localhost:3001/')
    const data = await response.json()
    debugInfo.value = `✅ ${data.status}`
    console.log('Proxy test:', data)
  } catch (err) {
    debugInfo.value = '❌ Proxy not reachable on port 3001. Run: node hac-proxy-secure.js'
    console.error('Proxy connection failed:', err)
  }
})

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

    // 🔒 SECURE: POST request with credentials in body
    debugInfo.value = 'Logging in securely...'
    
    const nameResponse = await fetch('http://localhost:3001/api/name', {
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
    console.log('Name response:', nameData)
    
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

    // Fetch classes
    debugInfo.value = 'Fetching classes...'
    
    const classesResponse = await fetch('http://localhost:3001/api/classaverage', {
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
    console.log('Classes response:', classesData)
    
    if (Array.isArray(classesData)) {
      classes.value = classesData
      debugInfo.value = `✅ Loaded ${classesData.length} classes`
    }

  } catch (err) {
    console.error('Login error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch data'
    
    if (error.value.includes('Failed to fetch') || error.value.includes('ERR_CONNECTION_REFUSED')) {
      error.value = '❌ Cannot connect to proxy server.\n\nMake sure proxy is running:\nnode hac-proxy-secure.js'
    }
    
    isLoggedIn.value = false
  } finally {
    loading.value = false
  }
}

function logout() {
  isLoggedIn.value = false
  studentName.value = ''
  classes.value = []
  password.value = ''
  debugInfo.value = ''
  error.value = ''
}

function getGradeColor(average: number): string {
  if (average >= 90) return 'text-green-600'
  if (average >= 80) return 'text-blue-600'
  if (average >= 70) return 'text-yellow-600'
  if (average >= 60) return 'text-orange-600'
  return 'text-red-600'
}

function calculateGPA(): string {
  const gradedClasses = classes.value.filter(c => c.hasGrade)
  if (gradedClasses.length === 0) return 'N/A'
  const sum = gradedClasses.reduce((acc, c) => acc + c.average, 0)
  return (sum / gradedClasses.length).toFixed(1)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HAC Wrapper 🔒
            </h1>
            <p class="text-sm text-gray-600">Secure grade access with encrypted requests</p>
          </div>
          <div v-if="isLoggedIn" class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-sm text-gray-600">Logged in as</p>
              <p class="font-semibold text-gray-900">{{ studentName }}</p>
            </div>
            <button
              @click="logout"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div v-if="debugInfo" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-sm text-blue-800 whitespace-pre-wrap">{{ debugInfo }}</p>
      </div>

      <!-- Login Form -->
      <div v-if="!isLoggedIn" class="max-w-md mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="text-center mb-8">
            <div class="text-6xl mb-4">🎓</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Login to HAC</h2>
            <p class="text-gray-600">Enter your credentials to view your grades</p>
          </div>

          <form @submit.prevent="login" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">HAC URL</label>
              <input
                v-model="hacUrl"
                type="url"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://hac.eths.k12.il.us/"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                v-model="username"
                type="text"
                required
                autocomplete="username"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your username"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-800 whitespace-pre-wrap">{{ error }}</p>
            </div>

            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <p class="text-xs text-green-800 flex items-center gap-2">
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
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Total Classes</p>
                <p class="text-3xl font-bold">{{ classes.length }}</p>
              </div>
              <div class="text-4xl">📚</div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Average</p>
                <p class="text-3xl font-bold">{{ calculateGPA() }}</p>
              </div>
              <div class="text-4xl">📊</div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Graded</p>
                <p class="text-3xl font-bold">{{ classes.filter(c => c.hasGrade).length }}</p>
              </div>
              <div class="text-4xl">✅</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 class="text-xl font-bold text-white">Your Classes</h3>
          </div>

          <div v-if="classes.length === 0" class="p-8 text-center text-gray-500">
            No classes found
          </div>

          <div v-else class="divide-y">
            <div v-for="cls in classes" :key="cls.classId" class="p-6 hover:bg-gray-50 transition">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 class="text-lg font-semibold">{{ cls.className }}</h4>
                    <span class="px-2 py-1 bg-gray-100 text-xs rounded-full">{{ cls.courseCode }}</span>
                    <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Period {{ cls.period }}</span>
                  </div>

                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <span>👨‍🏫</span>
                    <a :href="`mailto:${cls.teacherEmail}`" class="hover:text-blue-600 hover:underline">
                      {{ cls.teacher }}
                    </a>
                  </div>
                </div>

                <div class="text-right ml-4">
                  <div v-if="cls.hasGrade" :class="['text-3xl font-bold', getGradeColor(cls.average)]">
                    {{ cls.grade }}
                  </div>
                  <div v-else class="text-2xl text-gray-400">N/A</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>