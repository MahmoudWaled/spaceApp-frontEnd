# Environment Variables Setup Guide

This project uses environment variables to manage configuration across different environments (development, staging, production).

## Quick Start

1. **Copy the example file:**

   ```bash
   cp .env.example .env
   ```

2. **Update the values in `.env`:**
   Edit the `.env` file and set the appropriate values for your environment.

## Environment Variables

### `VITE_API_BASE_URL`

The base URL for your API endpoints.

**Important:** In Vite projects, environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

#### Development

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Production

```env
VITE_API_BASE_URL=http://space-app-production.up.railway.app/api
```

## Configuration File

All environment variables are centralized in `src/config/env.ts`:

```typescript
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
```

## Usage in API Files

Import the configuration in your API files:

```typescript
import { API_BASE_URL } from "../config/env";

// Use in API calls
const response = await axios.get(`${API_BASE_URL}/posts`);
```

## Security Notes

- ✅ `.env` is added to `.gitignore` and will NOT be committed to version control
- ✅ `.env.example` provides a template for other developers
- ⚠️ Never commit sensitive data (API keys, passwords, tokens) to version control
- ⚠️ Remember that Vite client-side environment variables are exposed in the browser

## Changing Environments

To switch between environments, simply update the `.env` file:

**For local development:**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**For production:**

```env
VITE_API_BASE_URL=http://space-app-production.up.railway.app/api
```

**Note:** After changing environment variables, you need to restart the development server:

```bash
npm run dev
```

## Deployment

When deploying to platforms like Vercel, Netlify, or Railway:

1. Add the environment variables in your deployment platform's dashboard
2. Set `VITE_API_BASE_URL` to your production API URL
3. The platform will automatically use these values during the build process

## Troubleshooting

### Environment variables not working?

1. **Check the prefix:** All client-side variables must start with `VITE_`
2. **Restart the dev server:** Changes to `.env` require a server restart
3. **Check the file location:** `.env` should be in the project root
4. **Verify syntax:** No spaces around `=` (use `KEY=value`, not `KEY = value`)

### Build issues?

- Make sure `.env` exists (copy from `.env.example`)
- Verify all required environment variables are set
- Check for typos in variable names
