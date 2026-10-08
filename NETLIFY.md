# Netlify Deployment Guide for Dhatwal Ki Awaaz (DKA) TTS Studio

This repository is pre-configured and 100% Netlify-ready.

## Configuration Overview

- **`netlify.toml`**: Configures the build command (`npm run build`), publish directory (`dist`), Node 22 environment, esbuild bundler for functions, security headers, and asset caching.
- **`public/_redirects`**: Automatically copied to `dist/_redirects` during `npm run build`, routing `/api/*` to Netlify Serverless Functions and `/*` to `index.html` for single-page application routing.
- **`netlify/functions/`**:
  - `health.ts`: Checks API and environment status.
  - `tts.ts`: High-performance Indian speech synthesis with Gemini 3.8/2.5 cascade, multi-speaker dialogue support, and browser fallback.
  - `translate-script.ts`: Translates, transliterates, and enhances scripts for speech synthesis.

---

## How to Deploy to Netlify

### Option 1: Deploy with Git (Recommended)
1. Push this project to GitHub / GitLab / Bitbucket.
2. In [Netlify Dashboard](https://app.netlify.com/), click **Add new site** > **Import an existing project**.
3. Select your repository.
4. Netlify will automatically detect `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Click **Deploy Site**.

### Option 2: Deploy with Netlify CLI
```bash
# Install Netlify CLI globally (if needed)
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

---

## Environment Variables on Netlify

In your Netlify site dashboard:
1. Go to **Site Configuration** > **Environment variables**.
2. Add:
   - `GEMINI_API_KEY`: Your Google Gemini API key.

> **Note**: Even if `GEMINI_API_KEY` is not set or remote quotas are exceeded, the app includes automatic, seamless fallback to the browser's native Indian speech synthesis engine with 0 downtime.
