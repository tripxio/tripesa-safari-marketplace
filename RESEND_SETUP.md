# Email Service Setup - Brevo (Sendinblue)

This document explains how to set up email notifications for the Tripesa Safari admin system using **Brevo** (formerly Sendinblue).

## 🎯 **Why Brevo Instead of Resend?**

- **✅ No Domain Verification Required**: Brevo allows sending from any email address
- **✅ Free Tier**: 300 emails/day free
- **✅ Better Development Experience**: Works immediately without domain setup
- **✅ SMTP Support**: More flexible email configuration
- **✅ Transactional Emails**: Perfect for account creation notifications

## 📋 **Setup Instructions**

### **Step 1: Create Brevo Account**

1. Go to [Brevo (Sendinblue)](https://www.brevo.com/)
2. Sign up for a free account
3. Verify your email address

### **Step 2: Get Your API Key**

1. Log in to your Brevo dashboard
2. Go to **Settings** → **API Keys**
3. Create a new API key or use the default one
4. Copy the API key

### **Step 3: Update Environment Variables**

Add these to your `.env.local` file:

```bash
# Brevo (Sendinblue) Email Configuration
BREVO_API_KEY=xkeysib-your-actual-api-key-here
BREVO_FROM_EMAIL=noreply@tripesa.co
```

### **Step 4: Test the Integration**

Test the email service with:

```bash
curl -X POST http://localhost:3000/api/test-brevo-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","name":"Test User"}'
```

## 🔧 **Architecture**

### **Server-Side Only Email Service**

The email service is designed to work **only on the server-side** to prevent client-side build issues with Node.js modules.

- **Email Service**: `lib/email/email-service.ts` (server-side only)
- **Email Validation**: `lib/utils/email-validation.ts` (client & server safe)
- **API Routes**: All email operations go through API routes

### **Email Templates**

Three email templates are available:

1. **Account Creation**: Welcome email with login credentials
2. **Password Change**: Confirmation when password is updated
3. **Password Reset**: Reset link for forgotten passwords

### **Features**

- ✅ **Auto-generated passwords** for new users
- ✅ **Email validation** (client & server-side)
- ✅ **Email uniqueness checking**
- ✅ **Beautiful HTML templates**
- ✅ **Security notifications**
- ✅ **Responsive design**

## 🧪 **Testing**

### **Test Email Sending**

```bash
curl -X POST http://localhost:3000/api/test-brevo-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### **Test Email Validation**

```bash
curl -X POST http://localhost:3000/api/test-email-validation \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### **Test User Creation**

Create a new admin user through the UI and check for welcome email.

## 🔒 **Security Features**

- **Email Validation**: Comprehensive regex pattern
- **Password Generation**: Secure random passwords with mixed characters
- **Email Uniqueness**: Prevents duplicate admin accounts
- **Security Notifications**: Clear instructions for password changes and 2FA

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"BREVO_API_KEY environment variable is required"**

   - Make sure you've added the API key to `.env.local`
   - Restart the development server

2. **"Email service is only available on the server-side"**

   - This is expected - email service only works in API routes
   - Client components should call API routes for email operations

3. **Build errors with Node.js modules**
   - Email service is now server-side only
   - Email validation utility is safe for client-side use

### **Environment Variables**

Make sure these are set in `.env.local`:

```bash
BREVO_API_KEY=xkeysib-your-actual-api-key-here
BREVO_FROM_EMAIL=noreply@tripesa.co
```

## 📧 **Email Templates**

All emails include:

- **Professional branding** with Tripesa Safari colors
- **Clear instructions** for next steps
- **Security reminders** and best practices
- **Responsive design** for mobile devices
- **Call-to-action buttons** for easy navigation

## 🎉 **Success Indicators**

When properly configured, you should see:

- ✅ **Test emails** arrive in your inbox
- ✅ **User creation** sends welcome emails
- ✅ **Password changes** send confirmation emails
- ✅ **Email validation** works in the UI
- ✅ **No build errors** related to email service

The email system is now fully functional with Brevo! 🚀
