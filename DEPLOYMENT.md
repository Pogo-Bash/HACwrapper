# Deployment Guide for Render

This guide will help you deploy the HAC Wrapper application to Render.

## Prerequisites

- A [Render account](https://render.com) (free tier available)
- Git repository with this code

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" and select "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Click "Apply" to create the service
7. Your app will be deployed automatically!

### Option 2: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:

   **Build & Deploy Settings:**
   - **Name:** hac-wrapper (or your preferred name)
   - **Runtime:** Node
   - **Build Command:** `npm install --production=false && npm run build`
   - **Start Command:** `npm start`

   **Environment Variables:**
   - `NODE_ENV` = `production`

5. Click "Create Web Service"
6. Wait for the deployment to complete

## What Happens During Deployment

1. **Build Phase:**
   - `npm install --production=false` - Installs all dependencies including devDependencies
   - `npm run build` - Builds the Vue.js frontend into the `dist` folder

2. **Start Phase:**
   - `npm start` - Starts the Express server on Render's assigned PORT
   - The server serves both:
     - API endpoints at `/api/*`
     - Static frontend files from `/dist`

## Architecture

The deployment runs a **single unified server** that:
- Serves the built Vue.js frontend as static files
- Handles API proxy requests to HomeAccess Center
- Uses the PORT environment variable assigned by Render
- Includes compression and caching for optimal performance

## Build & Start Commands for Render

For quick reference when setting up manually:

```
Build Command: npm install --production=false && npm run build
Start Command: npm start
```

**Note:** The `--production=false` flag ensures that devDependencies (like vite, vue-tsc) are installed during the build phase, which are required to build the frontend.

## Troubleshooting

### Port Issues
The server automatically uses `process.env.PORT` provided by Render. No manual port configuration needed.

### Build Failures
If the build fails, check:
- All dependencies are listed in `package.json`
- The build command completes successfully locally
- You have sufficient memory (free tier has limitations)

### Runtime Errors
Check the Render logs:
1. Go to your service in Render Dashboard
2. Click on "Logs" tab
3. Look for error messages

## Local Testing

To test the production build locally:

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

The server will run on http://localhost:3001 (or the PORT environment variable if set).

## Environment Variables

Currently, the app doesn't require additional environment variables. The server automatically:
- Uses `process.env.PORT` for the port (provided by Render)
- Sets `process.env.NODE_ENV` to `production`

## Performance Features

The deployed app includes:
- ✅ Server-side compression (gzip)
- ✅ LRU caching (5-minute TTL)
- ✅ Static file serving
- ✅ PWA support with service workers
- ✅ Optimized bundle splitting

## Support

If you encounter issues:
1. Check the Render logs for error messages
2. Verify your build completes successfully locally
3. Ensure all environment variables are set correctly
