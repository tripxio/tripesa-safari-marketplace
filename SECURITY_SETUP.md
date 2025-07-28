# Security Setup Guide

## Overview

This guide explains how to securely handle sensitive credentials for deployment.

## Sensitive Files Removed

The following files contain sensitive private keys and should **NEVER** be committed to Git:

- `google-analytics-key.json` - Google Analytics service account
- `firebase-service-account-key.json` - Firebase Admin service account

## Environment Variables Setup

### Local Development (.env.local)

Add these environment variables to your `.env.local` file:

```env
# Google Analytics Service Account (JSON as string)
GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"tripesa-marketplace",...}

# Firebase Service Account (JSON as string)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"tripesa-marketplace",...}

# Other existing variables...
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=glorrysibomana758@gmail.com
```

### Production Deployment

For production deployment (Vercel, Netlify, etc.), add these as environment variables in your hosting platform:

1. **Vercel**: Go to Project Settings → Environment Variables
2. **Netlify**: Go to Site Settings → Environment Variables
3. **Railway**: Go to Project Settings → Variables

## Security Best Practices

### ✅ DO

- Use environment variables for all sensitive data
- Keep `.env.local` in `.gitignore`
- Use different API keys for development and production
- Regularly rotate API keys
- Use service accounts with minimal required permissions

### ❌ DON'T

- Commit JSON key files to Git
- Share API keys in public repositories
- Use the same keys across environments
- Store keys in client-side code

## Deployment Checklist

Before deploying:

1. ✅ Remove sensitive JSON files from repository
2. ✅ Add environment variables to hosting platform
3. ✅ Test with environment variables locally
4. ✅ Verify `.gitignore` excludes sensitive files
5. ✅ Check that no sensitive data is in client-side code

## Troubleshooting

### "Credentials not configured" Error

- Check that environment variables are set correctly
- Verify JSON format in environment variables
- Ensure hosting platform has the environment variables

### "Key not found" Error

- Verify API keys are valid and active
- Check account permissions and billing status
- Ensure keys have the correct permissions

## File Structure

```
├── .env.local (local development - not committed)
├── .gitignore (excludes sensitive files)
├── lib/firebase/admin.ts (uses env vars)
├── lib/firebase/google-analytics-service.ts (uses env vars)
└── [sensitive files removed]
```

## Next Steps

1. Add environment variables to your hosting platform
2. Test deployment with new configuration
3. Remove any remaining references to JSON files
4. Monitor for any credential-related errors
