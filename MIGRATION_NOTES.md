# HAC Wrapper v2.0 - Direct Scraper Migration

## 🎉 Migration Complete!

Your project has been upgraded to use **direct HAC scraping** instead of relying on external APIs.

## ✅ What Changed

### Added Files:
- `hac-proxy-server.js` - Express server that scrapes HAC directly
- `MIGRATION_NOTES.md` - This file

### Modified Files:
- `package.json` - Added new dependencies and scripts
- `vite.config.ts` - Updated proxy to point to local server
- `src/services/hac.service.ts` - Cleaned up logging

### New Dependencies:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `axios` - HTTP client for scraping
- `cheerio` - HTML parser (jQuery for Node.js)
- `concurrently` - Run multiple commands simultaneously

## 🚀 How to Run

### Development Mode (Recommended):
```bash
npm run dev:full
```

This starts both:
- Proxy server on `http://localhost:3001`
- Vue dev server on `http://localhost:5173`

### Separate Processes:

Terminal 1:
```bash
npm run proxy
```

Terminal 2:
```bash
npm run dev
```

## 🎯 How It Works

1. **Your Vue app** makes requests to `/api/name`, `/api/classaverage`, etc.
2. **Vite proxy** forwards these to `http://localhost:3001`
3. **Express server** receives the request
4. **Scraper** logs into your HAC directly
5. **Cheerio** parses the HTML and extracts grades
6. **JSON response** sent back to your Vue app

## ✨ Benefits

- ✅ Works with **ANY** HAC school district (including ETHS!)
- ✅ No dependency on external APIs
- ✅ Direct scraping like GradeWay
- ✅ Same Vue/TypeScript/Tailwind frontend
- ✅ Easy to customize for your school's HAC version

## 🔧 Customizing for Your HAC

If grades aren't showing up, you may need to adjust the HTML selectors:

1. Open your HAC in a browser
2. Right-click on the grades table → Inspect
3. Find the table's class or ID
4. Edit `hac-proxy-server.js` and update the selectors:

```javascript
// Line ~80 in hac-proxy-server.js
const tables = $('.sg-asp-table, table.InfoTable, #YourTableId');
```

## 📝 Testing

Test the proxy directly:

```bash
curl "http://localhost:3001/api/name?link=https://hac.eths.k12.il.us/&user=YOUR_USERNAME&pass=YOUR_PASSWORD"
```

## 🚀 Deployment

For production:

1. **Deploy the proxy server** to:
   - Railway.app (recommended, free)
   - Render.com
   - Heroku
   - Your own VPS

2. **Update Vite config** to point to deployed URL:
```typescript
proxy: {
  '/api': {
    target: 'https://your-proxy.railway.app',
    changeOrigin: true,
  }
}
```

3. **Build and deploy Vue app** to:
   - Vercel
   - Netlify
   - Cloudflare Pages

## ⚠️ Important Notes

- The proxy server must be running for the app to work
- Each request makes a fresh login to HAC (could add session caching)
- Respect your school's terms of service
- For educational purposes only

## 🐛 Troubleshooting

### Proxy won't start:
```bash
# Kill any process on port 3001
lsof -ti:3001 | xargs kill -9

# Try starting manually to see errors
node hac-proxy-server.js
```

### Can't login:
- Check your HAC URL ends with `/`
- Verify username and password are correct
- Check browser console for errors

### Empty data:
- Your HAC version might use different HTML structure
- Inspect the HTML and update selectors
- Check proxy server logs for errors

## 📚 Resources

- Cheerio docs: https://cheerio.js.org/
- Express docs: https://expressjs.com/
- Axios docs: https://axios-http.com/

---

**Questions?** Check the proxy server logs - they show exactly what's happening!
