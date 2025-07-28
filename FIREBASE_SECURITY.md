# Firebase Security Guide

## 🔒 Security Overview

Your Firebase configuration is **secure by design**. Here's why your public keys are safe and how security is maintained.

## ✅ Public Keys Are Safe

### What's Exposed (Safe):

```javascript
// These are intentionally public and safe:
apiKey: "AIzaSyC..."; // Public API key
authDomain: "project.firebaseapp.com";
projectId: "your-project-id";
storageBucket: "project.appspot.com";
messagingSenderId: "123456789";
appId: "1:123456789:web:abc123";
measurementId: "G-ABC123DEF";
```

### What's Protected (Never Exposed):

- **Service Account Keys** - Server-side only
- **Database Secrets** - Never in client code
- **Admin SDK Keys** - Server-side only

## 🛡️ Security Layers

### 1. Firebase Security Rules

- **Firestore Rules** (`firestore.rules`) - Protect database access
- **Storage Rules** (`storage.rules`) - Protect file uploads
- **Authentication Required** - All admin operations require login

### 2. Environment Variables

```bash
# .env.local (not committed to git)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### 3. Authentication & Authorization

- **Firebase Auth** - Handles user sessions
- **JWT Tokens** - Secure communication
- **User-Specific Access** - Users can only access their own data

## 🔐 Security Rules Explained

### Firestore Rules

```javascript
// Admin users - only access own data
match /admin-users/{userId} {
  allow read, write: if request.auth != null &&
    request.auth.uid == userId;
}

// Site config - only active admins
match /site-config/{document=**} {
  allow read, write: if request.auth != null &&
    exists(/databases/$(database)/documents/admin-users/$(request.auth.uid)) &&
    get(/databases/$(database)/documents/admin-users/$(request.auth.uid)).data.isActive == true;
}
```

### Storage Rules

```javascript
// Site assets - public read, admin write
match /site-assets/{allPaths=**} {
  allow read: if true; // Public access
  allow write: if request.auth != null &&
    firestore.get(/databases/(default)/documents/admin-users/$(request.auth.uid)).data.isActive == true;
}
```

## 🚨 Security Best Practices

### ✅ What You're Doing Right:

1. **Environment Variables** - Keys not hardcoded
2. **Security Rules** - Proper access control
3. **Authentication** - Required for admin access
4. **HTTPS Only** - Secure communication
5. **No Private Keys** - Only public keys exposed

### ❌ What to Never Do:

1. **Hardcode Keys** - Never put keys directly in code
2. **Expose Service Accounts** - Keep private keys server-side
3. **Disable Security Rules** - Always use proper rules
4. **Use Admin SDK in Client** - Admin SDK is server-side only

## 🔍 Security Verification

### Check Your Security:

```bash
# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only storage

# Test rules locally
firebase emulators:start --only firestore
```

### Monitor Access:

- **Firebase Console** - Monitor authentication
- **Firestore Logs** - Check access patterns
- **Analytics** - Track usage

## 📋 Deployment Checklist

1. **✅ Environment Variables** - Set in deployment platform
2. **✅ Security Rules** - Deploy to Firebase
3. **✅ HTTPS** - Ensure secure connections
4. **✅ Authentication** - Test admin login
5. **✅ Access Control** - Verify user permissions

## 🆘 Security Incident Response

If you suspect a security issue:

1. **Immediate Actions**:

   - Change admin passwords
   - Review Firebase logs
   - Check for unauthorized access

2. **Investigation**:

   - Review authentication logs
   - Check data access patterns
   - Verify security rules

3. **Recovery**:
   - Update security rules if needed
   - Rotate any compromised keys
   - Monitor for future issues

## 📞 Support

For security concerns:

- **Firebase Support** - Official Firebase help
- **Security Documentation** - Firebase security docs
- **Community** - Firebase community forums

---

**Remember**: Your Firebase setup follows security best practices. The public keys are designed to be exposed, while real security comes from proper authentication and authorization rules.
