# HAC Wrapper - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Open http://localhost:5173 in your browser

## 🔐 Security Overview

This application uses **end-to-end encryption** to protect your credentials:

### Without "Remember Me"
- Credentials stored in memory only
- Cleared when you close the browser
- Most secure option

### With "Remember Me"
- Creates a master password (your choice)
- Encrypts credentials using AES-GCM (256-bit)
- Stores encrypted data in browser localStorage
- Master password never leaves your device
- No way to recover forgotten master password

## 📖 How to Use

1. **First Login**
   - Enter your school's HAC URL
   - Enter your HAC username and password
   - Optionally check "Remember me" and set a master password
   - Click Login

2. **View Grades**
   - See all your classes with current grades
   - Click any class to see detailed grades and assignments
   - View your overall GPA

3. **Logout**
   - Click "Logout" button in the dashboard header
   - Clears session (keeps encrypted data if "Remember me" was used)

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Type Checking
npm run type-check   # Check TypeScript types
```

## 🔧 Configuration

### Change HAC API Endpoint
Edit `src/services/hac.service.ts`:
```typescript
private static readonly BASE_URL = 'your-api-url';
```

### Customize Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#3b82f6',  // Change this!
    }
  }
}
```

## ⚠️ Important Notes

- ✅ Your password is **NEVER** sent to our servers
- ✅ The HAC API does **NOT** store passwords
- ✅ Master password is used **ONLY** for local encryption
- ✅ Clear browser data to remove saved credentials
- ❌ **NO** way to recover forgotten master password

## 🌐 Browser Compatibility

Requires modern browser with Web Crypto API:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 79+

## 📱 Deploy to Production

### Build
```bash
npm run build
```

### Deploy
Upload the `dist/` folder to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- etc.

## 🐛 Common Issues

**"Invalid credentials"**
- Check HAC URL format
- Verify username/password
- Ensure account is active

**"Invalid master password"**
- Try re-entering carefully
- Use "Different Account" to reset

**Grades not loading**
- Check internet connection
- Verify HAC API is accessible
- Check browser console for errors

## 📚 Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Vite** - Lightning fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Web Crypto API** - Native browser encryption

## 🤝 Need Help?

Check the full README.md for detailed documentation.

---

Made with ❤️ for students
