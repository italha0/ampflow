# AmpFlow Deployment Guide

## Prerequisites

1. **Appwrite Cloud Account**: Sign up at https://cloud.appwrite.io
2. **Vercel Account**: Sign up at https://vercel.com
3. **Platform API Keys**: Discord Bot Token, Telegram Bot Token, Whop API credentials

## Appwrite Setup

### 1. Create New Project
- Create a new project in Appwrite Cloud
- Note your Project ID and API Endpoint

### 2. Create Database & Collections

Create a new database and three collections with the following schemas:

#### Collection: `connections`
- **Permissions**: User-level read/write
- **Attributes**:
  - `userId` (String, 255, required)
  - `platform` (String, 50, required)
  - `username` (String, 255, optional)
  - `channelId` (String, 255, optional)
  - `accessToken` (String, 1000, optional, encrypted)
  - `refreshToken` (String, 1000, optional, encrypted)
  - `botToken` (String, 1000, optional, encrypted)
  - `guildId` (String, 255, optional)
- **Indexes**:
  - `userId_idx` (key on userId)
  - `platform_idx` (key on platform)

#### Collection: `automations`
- **Permissions**: User-level read/write
- **Attributes**:
  - `userId` (String, 255, required)
  - `youtubeConnectionId` (String, 255, required)
  - `targetConnectionIds` (String Array, 255, required)
  - `messageTemplate` (String, 5000, required)
  - `isActive` (Boolean, required, default: false)
- **Indexes**:
  - `userId_idx` (key on userId)
  - `active_idx` (key on isActive)

#### Collection: `youtubeSubscriptions`
- **Permissions**: None (accessed only by Functions with API key)
- **Attributes**:
  - `userId` (String, 255, required)
  - `youtubeChannelId` (String, 255, required)
  - `youtubeConnectionId` (String, 255, required)
  - `callbackUrl` (String, 500, required)
  - `hubSecret` (String, 500, required, encrypted)
  - `status` (String, 50, required, default: "pending")
  - `expiryDate` (String, 100, required)
- **Indexes**:
  - `channelId_idx` (unique on youtubeChannelId)
  - `status_idx` (key on status)

### 3. Enable Authentication
- Enable Email/Password authentication
- Create test users or enable user registration

### 4. Create API Key
- Go to Settings > API Keys
- Create a new API key with:
  - Scopes: Database (read/write), Functions (execute)
  - Copy the API key (you'll need it for Functions)

### 5. Deploy Appwrite Functions

Deploy three functions using the code in `/appwrite-functions/`:

#### Function 1: `subscribeToYouTube`
- **Runtime**: Node.js 18+
- **Entry point**: `index.js`
- **Environment Variables**:
  - `APPWRITE_API_KEY`: Your API key
  - `APPWRITE_DATABASE_ID`: Your database ID
  - `APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID`: Collection ID
  - `APPWRITE_FUNCTION_ENDPOINT`: Your Appwrite function endpoint (e.g., https://cloud.appwrite.io/v1)

#### Function 2: `youtubeWebhook`
- **Runtime**: Node.js 18+
- **Entry point**: `index.js`
- **Public Access**: Enable (this receives webhooks from YouTube)
- **Environment Variables**:
  - `APPWRITE_API_KEY`: Your API key
  - `APPWRITE_DATABASE_ID`: Your database ID
  - `APPWRITE_CONNECTIONS_COLLECTION_ID`: Collection ID
  - `APPWRITE_AUTOMATIONS_COLLECTION_ID`: Collection ID
  - `APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID`: Collection ID

#### Function 3: `distributeMessage`
- **Runtime**: Node.js 18+
- **Entry point**: `index.js`
- **Environment Variables**:
  - `APPWRITE_API_KEY`: Your API key
  - `APPWRITE_DATABASE_ID`: Your database ID
  - `APPWRITE_CONNECTIONS_COLLECTION_ID`: Collection ID

## Frontend Deployment (Vercel)

### 1. Push to Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel
1. Import your repository in Vercel
2. Configure environment variables:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT`: https://cloud.appwrite.io/v1
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite project ID
   - `NEXT_PUBLIC_APPWRITE_DATABASE_ID`: Your database ID
   - `NEXT_PUBLIC_APPWRITE_CONNECTIONS_COLLECTION_ID`: connections
   - `NEXT_PUBLIC_APPWRITE_AUTOMATIONS_COLLECTION_ID`: automations
   - `NEXT_PUBLIC_APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID`: youtubeSubscriptions
3. Deploy

## Platform Integration Setup

### Discord Bot
1. Create a bot at https://discord.com/developers/applications
2. Enable necessary intents (Message Content, Guild Messages)
3. Copy bot token
4. Invite bot to your server
5. Get channel ID where messages should be posted
6. Store in connections collection

### Telegram Bot
1. Create bot with @BotFather on Telegram
2. Copy bot token
3. Add bot to your channel/group
4. Get chat ID
5. Store in connections collection

### Whop Community
1. Get API credentials from Whop
2. Get community/channel ID
3. Store in connections collection

## YouTube PubSubHubbub Setup

1. Get your YouTube channel ID
2. Create a YouTube connection in the connections collection
3. Call `subscribeToYouTube` function with:
   ```json
   {
     "userId": "user-id",
     "youtubeChannelId": "your-channel-id",
     "youtubeConnectionId": "connection-document-id"
   }
   ```
4. YouTube will verify the callback URL
5. Subscription will be active for ~10 days (resubscribe before expiry)

## Testing

1. **Authentication**: Test login with created user
2. **Connections**: Add connections for each platform
3. **Automation**: Create automation with message template
4. **YouTube Webhook**: Publish a test video to trigger distribution

## Environment Variables Summary

### Frontend (.env.local)
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_CONNECTIONS_COLLECTION_ID=connections
NEXT_PUBLIC_APPWRITE_AUTOMATIONS_COLLECTION_ID=automations
NEXT_PUBLIC_APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID=youtubeSubscriptions
```

### Appwrite Functions
Note: APPWRITE_FUNCTION_ENDPOINT and APPWRITE_FUNCTION_PROJECT_ID are automatically provided by Appwrite runtime.
```
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_CONNECTIONS_COLLECTION_ID=connections
APPWRITE_AUTOMATIONS_COLLECTION_ID=automations
APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID=youtubeSubscriptions
```

## Security Notes

- All tokens are encrypted in Appwrite Database
- HMAC SHA1 signature verification on YouTube webhooks
- User-level permissions on connections and automations
- API key restricted to necessary scopes
- No secrets logged or exposed in responses

## Maintenance

- YouTube subscriptions expire after ~10 days
- Implement auto-renewal by checking expiry dates
- Monitor function execution logs for errors
- Set up error alerting for failed distributions
