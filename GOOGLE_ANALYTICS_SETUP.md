# Google Analytics Data API Setup Guide

This guide will help you set up the Google Analytics Data API to fetch real analytics data in your dashboard.

## Prerequisites

1. **Google Analytics 4 Property**: Your Firebase project must have Google Analytics 4 enabled
2. **Google Cloud Project**: Access to the Google Cloud Console
3. **Service Account**: A service account with Analytics Data API permissions

## Step 1: Enable Google Analytics Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Analytics Data API"
5. Click on it and press **Enable**

## Step 2: Create a Service Account

1. In Google Cloud Console, go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Give it a name like "analytics-data-api"
4. Add description: "Service account for Google Analytics Data API"
5. Click **Create and Continue**

## Step 3: Grant Permissions

1. Add the following roles:
   - **Analytics Data API Viewer**
   - **Firebase Analytics Viewer**
2. Click **Continue**
3. Click **Done**

## Step 4: Create and Download Service Account Key

1. Click on your newly created service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Click **Create**
6. The JSON file will download automatically

## Step 5: Get Your Google Analytics Property ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Admin** > **Property Settings**
4. Copy the **Property ID** (format: 123456789)

## Step 6: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Google Analytics Data API Configuration
GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your_project_id",...}
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
```

**Important**:

- Copy the entire JSON content from the downloaded service account key file
- Replace `123456789` with your actual Google Analytics Property ID

## Step 7: Test the Setup

1. Restart your development server
2. Visit your analytics dashboard at `/admin/analytics`
3. You should now see real data from Google Analytics

## Troubleshooting

### "Google Analytics credentials not configured"

- Check that both environment variables are set correctly
- Ensure the JSON key is properly formatted
- Restart your development server after adding environment variables

### "Failed to fetch analytics data"

- Verify the service account has the correct permissions
- Check that Google Analytics Data API is enabled
- Ensure your Google Analytics property ID is correct

### No data showing

- Google Analytics data may take 24-48 hours to appear
- Check that your website is receiving traffic
- Verify that Firebase Analytics is properly configured

## Security Notes

- Never commit your service account key to version control
- Use environment variables for all sensitive data
- Consider using Google Cloud Secret Manager for production

## Next Steps

Once configured, your analytics dashboard will show:

- Real-time active users
- Page views, sessions, and user metrics
- Top pages and traffic sources
- Device categories and user engagement
- Professional analytics data from Google Analytics
