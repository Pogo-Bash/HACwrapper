# HAC Wrapper - File Index

## 📁 Complete File Structure

### Root Directory
```
hac-wrapper/
├── 📄 package.json              # Project dependencies and scripts
├── 📄 package-lock.json         # Locked dependency versions
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 tsconfig.node.json        # TypeScript config for Node
├── 📄 vite.config.ts            # Vite build configuration
├── 📄 tailwind.config.js        # Tailwind CSS configuration
├── 📄 postcss.config.js         # PostCSS configuration
├── 📄 index.html                # HTML entry point
├── 📄 README.md                 # Full documentation
├── 📄 QUICKSTART.md             # Quick start guide
├── 📄 PROJECT_SUMMARY.md        # This file - project overview
├── 📄 setup.sh                  # Setup script (run first!)
└── 📁 node_modules/             # Dependencies (install with npm)
```

### Source Code (`src/`)
```
src/
├── 📄 main.ts                   # Application entry point
├── 📄 App.vue                   # Root Vue component
├── 📄 style.css                 # Global Tailwind styles
│
├── 📁 components/               # Vue components
│   ├── 📄 Login.vue            # Login/authentication interface
│   └── 📄 Dashboard.vue        # Main dashboard with grades
│
├── 📁 composables/              # Vue composables (state management)
│   └── 📄 useAuth.ts           # Authentication state & logic
│
├── 📁 services/                 # API services
│   └── 📄 hac.service.ts       # HAC API integration
│
├── 📁 types/                    # TypeScript type definitions
│   └── 📄 hac.types.ts         # HAC data interfaces
│
├── 📁 utils/                    # Utility functions
│   └── 📄 crypto.ts            # Encryption utilities
│
└── 📁 assets/                   # Static assets
    └── 📄 vue.svg              # Vue logo
```

### Public Directory (`public/`)
```
public/
└── 📄 vite.svg                  # Vite logo
```

## 🔑 Key Files Explained

### Configuration Files

**package.json**
- Dependencies: Vue, TypeScript, Vite, Tailwind
- Scripts: dev, build, preview, type-check
- Project metadata

**tsconfig.json**
- TypeScript compiler options
- Path mappings
- Type checking rules

**vite.config.ts**
- Vite build settings
- Vue plugin configuration
- Development server options

**tailwind.config.js**
- Custom color palette
- Content paths
- Theme extensions

### Source Files

**main.ts**
- Initializes Vue app
- Imports global styles
- Mounts app to DOM

**App.vue**
- Root component
- Handles authentication routing
- Renders Login or Dashboard

**style.css**
- Tailwind directives
- Custom CSS classes
- Component utilities

### Components

**Login.vue** (10,111 bytes)
- User authentication form
- Master password creation
- Credential validation
- "Remember me" functionality
- Encrypted credential storage

**Dashboard.vue** (10,640 bytes)
- Class grades display
- GPA calculation
- Assignment details modal
- Responsive grid layout
- Grade color coding

### Composables

**useAuth.ts** (4,101 bytes)
- Authentication state management
- Credential encryption/decryption
- Login/logout logic
- LocalStorage interaction
- Session management

### Services

**hac.service.ts** (3,881 bytes)
- HAC API endpoint calls
- Request building
- Error handling
- Response parsing
- Credential validation

### Types

**hac.types.ts** (1,785 bytes)
- TypeScript interfaces for:
  - Credentials
  - Student info
  - Classes
  - Assignments
  - Grades
  - API responses

### Utils

**crypto.ts** (4,632 bytes)
- AES-GCM encryption
- PBKDF2 key derivation
- Random generation
- Base64 encoding/decoding
- Secure credential handling

## 📊 File Statistics

### By Type
- **TypeScript files**: 5
- **Vue components**: 3
- **Configuration files**: 6
- **Documentation files**: 4
- **Total LOC**: ~3,000

### By Size
- Largest: Dashboard.vue (10.6 KB)
- Smallest: hac.types.ts (1.8 KB)
- Average: ~5 KB per file

## 🎯 Important Files to Edit

### For Customization
1. **tailwind.config.js** - Change colors/theme
2. **Dashboard.vue** - Modify grade display
3. **Login.vue** - Customize login form
4. **style.css** - Add custom styles

### For API Changes
1. **hac.service.ts** - Update endpoints
2. **hac.types.ts** - Modify data structures

### For Security Tweaks
1. **crypto.ts** - Adjust encryption settings
2. **useAuth.ts** - Modify auth logic

## 🚀 Quick Navigation

**Getting Started?**
→ Read QUICKSTART.md

**Need Full Docs?**
→ Read README.md

**Want Technical Details?**
→ Read PROJECT_SUMMARY.md

**Ready to Code?**
→ Run `./setup.sh` then `npm run dev`

## 📝 Development Checklist

- [ ] Run `./setup.sh` or `npm install`
- [ ] Read QUICKSTART.md
- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Test login functionality
- [ ] Check TypeScript errors: `npm run type-check`
- [ ] Build for production: `npm run build`
- [ ] Test production build: `npm run preview`

## 🔍 Finding Things

**Authentication logic?**
→ `src/composables/useAuth.ts`

**Encryption code?**
→ `src/utils/crypto.ts`

**API calls?**
→ `src/services/hac.service.ts`

**UI components?**
→ `src/components/*.vue`

**Type definitions?**
→ `src/types/hac.types.ts`

**Styling?**
→ `src/style.css` + `tailwind.config.js`

---

**Pro Tip**: Use your IDE's file search (Ctrl+P / Cmd+P) to quickly navigate between files!
