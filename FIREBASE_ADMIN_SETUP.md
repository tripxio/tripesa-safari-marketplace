# 🔐 Firebase Admin SDK Setup Guide

## 🚨 **Current Issue**

You're encountering the error: **"Cannot read properties of null (reading 'app')"** when creating users. This happens because the Firebase Admin SDK requires proper service account credentials for server-side operations.

## 🔧 **Solution: Set Up Firebase Admin SDK**

### **Step 1: Generate Service Account Key**

1. **Go to Firebase Console**

   - Visit [Firebase Console](https://console.firebase.google.com/project/tripesa-marketplace)
   - Select your project: `tripesa-marketplace`

2. **Navigate to Service Accounts**

   - Go to **Project Settings** (gear icon)
   - Click **Service Accounts** tab
   - Click **Firebase Admin SDK**

3. **Generate Private Key**
   - Click **Generate new private key**
   - Choose **Node.js** as the configuration
   - Click **Generate key**
   - Download the JSON file

### **Step 2: Add to Environment Variables**

Add the service account key to your `.env.local` file:

```bash
# Firebase Admin SDK (Server-side)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"tripesa-marketplace","private_key_id":"your-private-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@tripesa-marketplace.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40tripesa-marketplace.iam.gserviceaccount.com"}
```

**Important**: Replace the entire JSON object with the contents of your downloaded service account key file.

### **Step 3: Restart Development Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart
pnpm dev
```

### **Step 4: Test the Setup**

Test the Firebase Admin SDK:

```bash
curl http://localhost:3000/api/test-firebase-admin
```

Expected response:

```json
{
  "success": true,
  "message": "Firebase Admin SDK is working",
  "documentCount": 0
}
```

## 🔍 **Alternative Solutions**

### **Option 1: Use Environment File**

Instead of adding the JSON directly to `.env.local`, you can:

1. **Save the service account JSON** as `firebase-service-account.json` in your project root
2. **Add to `.env.local`**:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account.json
   ```
3. **Update the admin initialization** to read from file

### **Option 2: Use Google Cloud Default Credentials**

For production deployments:

1. **Set up Application Default Credentials**:

   ```bash
   gcloud auth application-default login
   ```

2. **The system will automatically use default credentials** when `FIREBASE_SERVICE_ACCOUNT_KEY` is not set

## 🛠️ **Updated API Behavior**

With Firebase Admin SDK properly configured:

- ✅ **User creation** will work server-side
- ✅ **Password changes** will work server-side
- ✅ **Email existence checking** will work server-side
- ✅ **No more "use credentials" errors**

## 🔒 **Security Notes**

- **Never commit** the service account key to version control
- **Use environment variables** for sensitive data
- **Rotate keys** regularly in production
- **Limit permissions** to only what's needed

## 🚀 **Production Deployment**

For production (Vercel, Netlify, etc.):

1. **Add the environment variable** in your hosting platform
2. **Use the JSON string** format (not file path)
3. **Ensure proper IAM permissions** are set

## 📚 **Error Reference**

Based on [Firebase Admin SDK error documentation](https://firebase.google.com/docs/auth/admin/errors), common errors include:

- `auth/project-not-found` - Invalid service account
- `auth/invalid-credential` - Malformed service account key
- `auth/insufficient-permission` - Missing IAM roles

## ✅ **Verification**

After setup, test user creation:

```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","role":"admin"}'
```

Expected response:

```json
{
  "message": "Admin user created successfully",
  "uid": "user123",
  "emailSent": true
}
```

---

**Status**: 🔧 Requires Firebase Admin SDK Setup  
**Priority**: High  
**Impact**: User creation and password management
