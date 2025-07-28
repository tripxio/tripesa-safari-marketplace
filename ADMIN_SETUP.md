# 🔥 Firebase Admin Setup Guide

This guide will help you set up the Firebase-based admin system for Tripesa Safari.

## 📋 Prerequisites

1. **Firebase Project**: You need a Firebase project with the following services enabled:

   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Analytics (optional)

2. **Environment Variables**: Make sure your `.env.local` file contains all required Firebase configuration.

## 🔐 Two-Factor Authentication (2FA)

The admin system uses **production-ready TOTP (Time-based One-Time Password)** authentication powered by the `otplib` library:

### Features:

- **RFC 6238 compliant** TOTP implementation
- **Compatible with all major authenticator apps** (Google Authenticator, Authy, Microsoft Authenticator, 1Password, etc.)
- **30-second time windows** with 1-step tolerance (60 seconds total)
- **6-digit codes** as industry standard
- **Secure secret generation** using cryptographically secure random values
- **Backup codes** for emergency access (10 single-use codes)

### Security:

- **HMAC-SHA1 algorithm** (industry standard)
- **Base32 encoded secrets** for optimal security and compatibility
- **Browser-compatible** implementation with no Node.js dependencies
- **No buffer-related errors** common with other libraries

## 🚀 Quick Setup

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable the following services:

#### Authentication

- Go to Authentication → Sign-in method
- Enable Email/Password authentication
- Add your admin email domains to authorized domains

#### Firestore Database

- Go to Firestore Database → Create database
- Start in production mode
- Choose a location close to your users

#### Storage

- Go to Storage → Get started
- Start in production mode
- Choose the same location as Firestore

#### Analytics (Optional)

- Go to Analytics → Get started
- Follow the setup wizard

### 2. Environment Configuration

Create or update your `.env.local` file:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://backend.tripesa.co/api/search
NEXT_PUBLIC_AI_CHAT_WEBHOOK_URL=https://bot.tripesa.co/webhook/scraped/chat

# App Configuration
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Create Your First Admin User

Run the admin creation script:

```bash
# Using npm
npm run create-admin admin@tripesa.co yourpassword "Admin Name" super-admin

# Using pnpm
pnpm create-admin admin@tripesa.co yourpassword "Admin Name" super-admin

# Using yarn
yarn create-admin admin@tripesa.co yourpassword "Admin Name" super-admin
```

**Parameters:**

- `email`: Admin email address
- `password`: Admin password (minimum 6 characters)
- `name`: Full name of the admin
- `role`: `admin` or `super-admin` (default: `super-admin`)

### 4. Access Admin Dashboard

1. Start your development server: `pnpm dev`
2. Navigate to: `http://localhost:3000/admin/login`
3. Log in with your admin credentials

## 🔐 Security Features

### Authentication

- ✅ Email/password authentication
- ✅ Two-factor authentication (TOTP)
- ✅ Role-based access control
- ✅ Session management
- ✅ Secure password policies

### Admin Roles

- **Admin**: Can manage site configuration, themes, banners, tiles
- **Super Admin**: Can do everything + manage other admin users

### 2FA Setup

1. Log in to admin dashboard
2. Go to Users section (super-admin only)
3. Click "Enable 2FA" for any user
4. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
5. Enter the 6-digit code to verify

## 📊 Admin Features

### Dashboard Overview

- Site statistics
- Recent activity
- Quick actions

### Site Configuration

- **Theme Colors**: Customize website color scheme
- **Home Banner**: Manage hero section images
- **Tile Images**: Manage featured content tiles
- **General Settings**: Site name, description, contact info

### User Management (Super Admin Only)

- Create new admin users
- Activate/deactivate users
- Manage 2FA settings
- View user activity

### Analytics

- Page view tracking
- User interaction events
- Admin action logging
- Error tracking

## 🛠️ Development

### Adding New Admin Features

1. **Create new page**: Add to `app/admin/` directory
2. **Update navigation**: Add to `components/admin/AdminLayout.tsx`
3. **Add analytics**: Use functions from `lib/firebase/analytics.ts`
4. **Add Firebase service**: Create new functions in `lib/firebase/`

### Firebase Security Rules

For production, set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin users collection
    match /admin-users/{userId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == userId ||
         get(/databases/$(database)/documents/admin-users/$(request.auth.uid)).data.role == 'super-admin');
    }

    // Site configuration
    match /site-config/{docId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/admin-users/$(request.auth.uid)).data.role in ['admin', 'super-admin'];
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true; // Public read access for images
      allow write: if request.auth != null &&
        firestore.get(/databases/(default)/documents/admin-users/$(request.auth.uid)).data.role in ['admin', 'super-admin'];
    }
  }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **"User not authorized as admin"**

   - User exists in Firebase Auth but not in admin collection
   - Run the create-admin script again or manually add to Firestore

2. **"2FA code required"**

   - User has 2FA enabled but didn't provide code
   - Enter 6-digit code from authenticator app

3. **"Account is deactivated"**

   - Admin user has been deactivated
   - Super admin needs to reactivate the account

4. **Firebase connection errors**
   - Check environment variables
   - Verify Firebase project configuration
   - Check network connectivity

### Debug Mode

Enable debug logging by adding to your browser console:

```javascript
localStorage.setItem("debug", "firebase:*");
```

## 📈 Monitoring

### Firebase Console

- **Authentication**: Monitor login attempts, user status
- **Firestore**: View data, monitor usage
- **Storage**: Monitor file uploads, usage
- **Analytics**: Track user behavior, admin actions

### Admin Dashboard Analytics

- Page views and user interactions
- Admin action logging
- Error tracking and performance metrics

## 🔄 Updates and Maintenance

### Regular Tasks

1. **Monitor user activity**: Check for suspicious login attempts
2. **Review admin actions**: Audit logs in Firebase Console
3. **Update security rules**: Review and update as needed
4. **Backup data**: Export Firestore data regularly

### Scaling Considerations

- **Firebase Free Tier Limits**:
  - 1GB storage
  - 50K reads/day
  - 20K writes/day
  - 20K deletes/day
- **Upgrade when needed**: Firebase scales automatically

## 🆘 Support

For issues or questions:

1. Check Firebase Console for errors
2. Review browser console for client-side errors
3. Check server logs for backend errors
4. Contact development team with error details

---

**Last Updated**: December 2024
**Version**: 1.0.0
