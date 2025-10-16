# 👋 START HERE - HAC Wrapper Setup Guide

Welcome! You're about to set up a secure, encrypted grade viewer for Home Access Center.

## 🚀 Quick Start (5 minutes)

### Step 1: Open Terminal
Navigate to this project folder:
```bash
cd hac-wrapper
```

### Step 2: Run Setup Script
```bash
./setup.sh
```
*OR manually:*
```bash
npm install
```

### Step 3: Start Dev Server
```bash
npm run dev
```

### Step 4: Open Browser
Go to: **http://localhost:5173**

**That's it!** 🎉

---

## 📚 Documentation Guide

### 🏁 Just Getting Started?
→ **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide

### 📖 Need Full Documentation?
→ **[README.md](README.md)** - Complete user manual

### 🏗️ Want to Understand the Code?
→ **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & diagrams

### 📁 Looking for Specific Files?
→ **[FILE_INDEX.md](FILE_INDEX.md)** - Complete file listing

### 🎯 Need Project Overview?
→ **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical summary

---

## ⚡ Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5173)

# Building
npm run build            # Create production build
npm run preview          # Preview production build

# Type Checking
npm run type-check       # Check TypeScript errors
```

---

## 🔐 Security Quick Facts

✅ **Your credentials are encrypted** using AES-GCM (military-grade)
✅ **Master password never leaves your device**
✅ **No data sent to our servers** - everything is local
✅ **HAC API doesn't store passwords** - verified by their docs
✅ **Optional "Remember Me"** - encrypted local storage

---

## 🎯 What You'll Build

A secure web app that lets you:
- ✅ Login to Home Access Center
- ✅ View all your class grades
- ✅ See your GPA
- ✅ View detailed assignment grades
- ✅ Save credentials securely (optional)

All with a beautiful, modern UI!

---

## 🛠️ Tech Stack

- **Vue 3** - Modern JavaScript framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Beautiful styling
- **Web Crypto API** - Secure encryption

---

## 📱 Browser Requirements

- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 79+

(Basically any modern browser from the last 5+ years)

---

## 🆘 Need Help?

### Installation Issues?
1. Make sure Node.js is installed: `node --version`
2. Make sure npm is installed: `npm --version`
3. Delete `node_modules/` and run `npm install` again

### Can't Login?
1. Check your HAC URL is correct
2. Verify your username/password
3. Make sure your school's HAC is accessible

### Other Issues?
- Check the browser console (F12) for errors
- Read the full documentation in README.md
- Check that you're using a supported browser

---

## 🎓 Learning Resources

### New to Vue?
- Vue 3 Docs: https://vuejs.org
- Vue Tutorial: https://vuejs.org/tutorial/

### New to TypeScript?
- TS Handbook: https://www.typescriptlang.org/docs/

### New to Tailwind?
- Tailwind Docs: https://tailwindcss.com/docs

---

## 🚀 Deployment

When you're ready to deploy:

1. Build: `npm run build`
2. Upload `dist/` folder to:
   - Vercel (recommended)
   - Netlify
   - GitHub Pages
   - Any static host

**Important**: Always use HTTPS in production!

---

## ⚠️ Important Notes

1. **Not Official**: This is not affiliated with HAC or any school
2. **Use Responsibly**: Follow your school's policies
3. **Master Password**: Cannot be recovered if forgotten
4. **Local Only**: Everything runs in your browser

---

## 🎯 Next Steps

1. ✅ Run `./setup.sh` or `npm install`
2. ✅ Start dev server: `npm run dev`
3. ✅ Open http://localhost:5173
4. ✅ Try logging in with your HAC credentials
5. ✅ Read the other docs to learn more

---

## 📞 Support

Questions? Issues?
1. Check README.md for detailed docs
2. Read QUICKSTART.md for common issues
3. Review code comments in source files

---

**Happy coding!** 🎉

Made with ❤️ for students everywhere

---

## 🗂️ File Structure Quick Reference

```
hac-wrapper/
├── 📄 START_HERE.md          ← You are here!
├── 📄 QUICKSTART.md           ← Quick setup guide
├── 📄 README.md               ← Full documentation
├── 📄 ARCHITECTURE.md         ← System design
├── 📄 FILE_INDEX.md           ← File listing
├── 📄 PROJECT_SUMMARY.md      ← Technical overview
├── 📄 setup.sh                ← Setup script
├── 📄 package.json            ← Dependencies
└── 📁 src/                    ← Source code
    ├── components/            ← Vue components
    ├── composables/           ← State management
    ├── services/              ← API calls
    ├── types/                 ← TypeScript types
    └── utils/                 ← Utilities
```

---

**Pro Tip**: Bookmark this file - it's your map to everything! 🗺️
