# HAC Wrapper - Secure Home Access Center Interface

A secure, end-to-end encrypted Vue 3 + TypeScript application for accessing Home Access Center (HAC) grades and student information.

## 🔒 Security Features

- **End-to-End Encryption**: All credentials are encrypted using AES-GCM with PBKDF2 key derivation
- **No Plain Text Storage**: Passwords are never stored in plain text
- **Master Password Protection**: Optional master password for saving credentials
- **Secure API Communication**: Direct communication with HAC API without intermediate storage
- **Web Crypto API**: Uses browser's native cryptography for maximum security

## 🚀 Features

- ✅ Secure login with credential encryption
- ✅ View all class grades and averages
- ✅ Calculate GPA automatically
- ✅ View detailed assignment grades
- ✅ Beautiful, responsive UI with Tailwind CSS
- ✅ Dark mode support
- ✅ Remember me functionality with master password
- ✅ TypeScript for type safety

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A valid Home Access Center account

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 Usage

### First Time Login

1. Enter your school's HAC URL (e.g., `https://homeaccess.katyisd.org/`)
2. Enter your HAC username and password
3. (Optional) Check "Remember me" and create a master password to save your credentials securely
4. Click "Login"

### Returning User (with saved credentials)

1. Enter your master password
2. Click "Unlock"

### Viewing Grades

- Your dashboard will display all your classes with current grades
- Click on any class card to view detailed grades and assignments
- View your overall GPA and class count in the summary cards

## 🔐 How Encryption Works

### Credential Storage
When you choose to "Remember me":

1. **Key Derivation**: Your master password is used with PBKDF2 (100,000 iterations) to derive an encryption key
2. **Encryption**: Your HAC username and password are encrypted using AES-GCM
3. **Storage**: Only the encrypted data, salt, and IV are stored in localStorage
4. **Decryption**: Your master password is required to decrypt and access your credentials

### Session-Only Mode
If you don't check "Remember me":
- Credentials are kept in memory only
- No data is written to localStorage
- You'll need to re-enter credentials when you close the browser

## 📁 Project Structure

```
hac-wrapper/
├── src/
│   ├── components/
│   │   ├── Login.vue          # Login interface
│   │   └── Dashboard.vue      # Main dashboard
│   ├── composables/
│   │   └── useAuth.ts         # Authentication state management
│   ├── services/
│   │   └── hac.service.ts     # HAC API communication
│   ├── types/
│   │   └── hac.types.ts       # TypeScript interfaces
│   ├── utils/
│   │   └── crypto.ts          # Encryption utilities
│   ├── App.vue                # Root component
│   ├── main.ts                # Application entry point
│   └── style.css              # Global styles (Tailwind)
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
└── package.json               # Dependencies
```

## 🚨 Important Security Notes

1. **Master Password**: Your master password is NEVER sent to any server. It only exists in your browser and is used for encryption/decryption.

2. **API Security**: The HAC API documentation states: "Passwords are not stored by the API"

3. **HTTPS Required**: Always use HTTPS in production to prevent man-in-the-middle attacks

4. **LocalStorage**: Encrypted credentials are stored in localStorage. Clear browser data to remove them.

5. **Master Password Recovery**: There is NO way to recover your master password. If forgotten, you must clear stored credentials and login again.

## 📱 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🐛 Troubleshooting

### "Invalid credentials" error
- Verify your HAC URL is correct
- Check your username and password
- Ensure your HAC account is active

### "Invalid master password" error
- Double-check your master password
- If forgotten, click "Use Different Account" and login again

### Grades not loading
- Check your internet connection
- Verify the HAC API is accessible
- Check browser console for errors

## ⚖️ License

MIT License - feel free to use this project for personal or educational purposes.

## ⚠️ Disclaimer

This is an unofficial tool and is not affiliated with or endorsed by any school district or the Home Access Center platform. Use at your own risk. Always ensure you're following your school's acceptable use policies.

---

**Built with ❤️ using Vue 3, TypeScript, Vite, and Tailwind CSS**
