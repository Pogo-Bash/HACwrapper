# HAC Wrapper - Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Browser - Client Side)                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        VUE 3 APPLICATION                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    App.vue (Root)                        │  │
│  │                                                          │  │
│  │  ┌────────────────────┐    ┌──────────────────────┐    │  │
│  │  │   Login.vue        │    │   Dashboard.vue      │    │  │
│  │  │  • Auth Form       │ ←→ │  • Grade Display     │    │  │
│  │  │  • Master Password │    │  • Class Cards       │    │  │
│  │  │  • Remember Me     │    │  • GPA Calculator    │    │  │
│  │  └────────────────────┘    └──────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
┌────────────────────────────────┐  ┌─────────────────────────┐
│     COMPOSABLES (State)        │  │   SERVICES (API)        │
│                                │  │                         │
│  useAuth.ts                    │  │  hac.service.ts         │
│  • isAuthenticated             │  │  • getStudentName()     │
│  • currentCredentials          │  │  • getClassAverages()   │
│  • login()                     │  │  • getClassGrades()     │
│  • logout()                    │  │  • validateCredentials()│
│  • saveCredentials()           │  │                         │
└────────────────────────────────┘  └─────────────────────────┘
                    │                         │
                    ▼                         ▼
┌────────────────────────────────┐  ┌─────────────────────────┐
│     UTILS (Security)           │  │   HAC API (External)    │
│                                │  │                         │
│  crypto.ts                     │  │  homeaccesscenterapi    │
│  • encryptCredentials()        │  │  .vercel.app            │
│  • decryptCredentials()        │  │                         │
│  • deriveKey() [PBKDF2]        │  │  GET /api/name          │
│  • AES-GCM encryption          │  │  GET /api/classaverage  │
└────────────────────────────────┘  │  GET /api/classgrade    │
                    │                │                         │
                    ▼                └─────────────────────────┘
┌────────────────────────────────┐              │
│   LOCAL STORAGE (Browser)      │              ▼
│                                │  ┌─────────────────────────┐
│  {                             │  │  HOME ACCESS CENTER     │
│    hacUrl: "...",              │  │  (School District)      │
│    encrypted: {                │  │                         │
│      encryptedUsername,        │  │  • Stores real data     │
│      encryptedPassword,        │  │  • Validates users      │
│      salt,                     │  │  • Returns grades       │
│      iv                        │  │                         │
│    }                           │  └─────────────────────────┘
│  }                             │
└────────────────────────────────┘
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      CREDENTIAL FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. USER INPUT
   │
   ├── HAC Username: "student123"
   ├── HAC Password: "password123"
   └── Master Password: "secure456" (if Remember Me)
   
2. MEMORY STORAGE (Always)
   │
   └── Plain text in RAM → Used for API calls → Cleared on logout
   
3. OPTIONAL: PERSISTENT STORAGE (if Remember Me)
   │
   ├── Generate Salt: crypto.getRandomValues(16 bytes)
   ├── Generate IV: crypto.getRandomValues(12 bytes)
   │
   ├── Key Derivation (PBKDF2):
   │   Master Password + Salt → 100,000 iterations → 256-bit key
   │
   ├── Encryption (AES-GCM):
   │   Username + Key + IV → Encrypted Username
   │   Password + Key + IV → Encrypted Password
   │
   └── Store in localStorage:
       {
         encryptedUsername: "base64...",
         encryptedPassword: "base64...",
         salt: "base64...",
         iv: "base64..."
       }

4. RETRIEVAL (Next Session)
   │
   ├── User enters Master Password
   ├── Derive Key: Master Password + Stored Salt
   ├── Decrypt: Encrypted Data + Key + IV → Plain Credentials
   └── Use for API calls
```

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      GRADE FETCHING FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. USER AUTHENTICATES
   └── Login.vue captures credentials
   
2. VALIDATE CREDENTIALS
   │
   └── hac.service.ts
       └── validateCredentials()
           └── GET /api/name?link={hacUrl}&user={user}&pass={pass}
               └── Success? → Continue
                   └── Failure? → Show error

3. SAVE SESSION (useAuth)
   │
   ├── Memory: currentCredentials.value = {...}
   └── Optional: Encrypt & save to localStorage

4. FETCH GRADES
   │
   └── Dashboard.vue mounted
       └── loadClasses()
           └── hac.service.ts
               └── getClassAverages()
                   └── GET /api/classaverage
                       └── Response: Array<ClassInfo>
                           └── Display in UI

5. VIEW DETAILS
   │
   └── User clicks class card
       └── loadClassGrades(classId)
           └── hac.service.ts
               └── getClassGrades(classId)
                   └── GET /api/classgrade?class={classId}
                       └── Response: ClassGrades
                           └── Show in modal
```

## 🎨 Component Hierarchy

```
App.vue (Root)
│
├─ v-if="!isAuthenticated"
│  └─ Login.vue
│     ├─ Form inputs
│     ├─ Remember me checkbox
│     ├─ Master password field
│     └─ Login button → @click="handleLogin()"
│
└─ v-else
   └─ Dashboard.vue
      ├─ Header
      │  ├─ Welcome message
      │  └─ Logout button
      │
      ├─ Stats Cards
      │  ├─ Current GPA
      │  ├─ Total Classes
      │  └─ Status
      │
      ├─ Classes Grid
      │  └─ v-for class in classes
      │     └─ Class Card
      │        ├─ Class name
      │        ├─ Teacher
      │        ├─ Grade
      │        └─ Progress bar
      │
      └─ Grade Details Modal (v-if="showGradeDetails")
         ├─ Category breakdown
         └─ Assignment list
```

## 🔄 State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      STATE FLOW (useAuth)                       │
└─────────────────────────────────────────────────────────────────┘

useAuth Composable:
  ├─ isAuthenticated: Ref<boolean>
  ├─ currentCredentials: Ref<HACCredentials | null>
  ├─ studentName: Ref<string | null>
  ├─ isLoading: Ref<boolean>
  └─ error: Ref<string | null>

Methods:
  ├─ login(credentials, masterPassword?, rememberMe?)
  │  ├─ Validate with API
  │  ├─ Set currentCredentials
  │  ├─ Set isAuthenticated = true
  │  └─ Optional: Encrypt & save
  │
  ├─ logout()
  │  ├─ Clear currentCredentials
  │  ├─ Set isAuthenticated = false
  │  └─ Keep localStorage if Remember Me
  │
  └─ loadStoredCredentials(masterPassword)
     ├─ Read from localStorage
     ├─ Decrypt with master password
     └─ Set currentCredentials

Shared Across:
  ✓ Login.vue
  ✓ Dashboard.vue
  ✓ App.vue
```

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

Layer 1: TRANSPORT SECURITY
  └─ HTTPS enforced
  └─ TLS encryption in transit

Layer 2: CLIENT-SIDE ENCRYPTION
  ├─ Web Crypto API (native browser)
  ├─ AES-GCM (256-bit authenticated encryption)
  └─ PBKDF2 (100,000 iterations)

Layer 3: KEY MANAGEMENT
  ├─ Master password never transmitted
  ├─ Keys never stored (derived on-demand)
  └─ Salt & IV unique per encryption

Layer 4: STORAGE SECURITY
  ├─ Encrypted data only
  ├─ No plain text passwords
  └─ localStorage isolation per origin

Layer 5: SESSION MANAGEMENT
  ├─ Credentials in memory only
  ├─ Cleared on logout
  └─ Optional persistence with master password

Layer 6: API SECURITY
  └─ HAC API: "Passwords not stored"
```

## 📦 Build Process

```
Source Code (.vue, .ts)
        │
        ▼
    TypeScript Compiler (tsc)
        │
        ▼
    Vue Compiler (vue-tsc)
        │
        ▼
    Vite Bundler
        │
        ├─ Tree-shaking
        ├─ Minification
        ├─ Code splitting
        └─ Asset optimization
        │
        ▼
    dist/
        ├─ index.html
        ├─ assets/
        │   ├─ index-[hash].js
        │   └─ index-[hash].css
        └─ vite.svg
        │
        ▼
    Deploy to Static Host
        (Vercel, Netlify, etc.)
```

---

**Legend:**
- `→` : Data flow
- `┌─┐` : Container/boundary
- `▼` : Process direction
- `├─` : Branch/option
