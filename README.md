# AmpFlow 🚀

**Automated Content Distribution Platform** - Built for Whop communities. Automatically distribute your YouTube content to Whop, Discord, and Telegram with Whop as your primary distribution platform.

## Features ✨

- **🎯 Whop-First Design**: Built specifically for Whop communities as the primary distribution platform
- **🎬 YouTube Integration**: Connect your YouTube channel and automatically detect new video uploads
- **📱 Multi-Platform Distribution**: Automatically post to Whop communities first, then Discord and Telegram
- **🤖 Customizable Messages**: Create personalized message templates with dynamic variables
- **📊 Distribution Logs**: Track the status and results of all your content distributions
- **🔐 Secure OAuth**: Secure authentication with all supported platforms
- **⚡ Real-time Processing**: Webhook-based processing for instant content distribution

## Quick Start 🚀

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd AmpFlow
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Whop API Configuration
NEXT_PUBLIC_URL=http://localhost:3000
WHOP_API_KEY=your_whop_api_key_here

# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here

# Database Collection IDs
APPWRITE_DATABASE_ID=your_database_id_here
APPWRITE_CONNECTIONS_COLLECTION_ID=your_connections_collection_id_here
APPWRITE_AUTOMATIONS_COLLECTION_ID=your_automations_collection_id_here
APPWRITE_JOBS_COLLECTION_ID=your_jobs_collection_id_here

# Platform OAuth Credentials
YOUTUBE_CLIENT_ID=your_youtube_client_id_here
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Webhook Configuration
YOUTUBE_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Appwrite Database Setup

Create the following collections in your Appwrite project:

#### Connections Collection
- **Collection ID**: `connections`
- **Attributes**:
  - `userId` (string) - Required
  - `platform` (string) - Required (youtube, discord, telegram, whop)
  - `username` (string) - Required
  - `channelId` (string) - Required
  - `accessToken` (string) - Optional
  - `refreshToken` (string) - Optional
  - `botToken` (string) - Optional
  - `enabled` (boolean) - Required (default: true)

#### Automations Collection
- **Collection ID**: `automations`
- **Attributes**:
  - `userId` (string) - Required
  - `youtubeChannelId` (string) - Required
  - `messageTemplate` (string) - Required
  - `targetPlatforms` (array) - Required
  - `enabled` (boolean) - Required (default: true)

#### Jobs Collection
- **Collection ID**: `jobs`
- **Attributes**:
  - `userId` (string) - Required
  - `automationId` (string) - Required
  - `videoId` (string) - Required
  - `title` (string) - Required
  - `status` (string) - Required (pending, processing, completed, partial, failed)
  - `targetPlatforms` (array) - Required
  - `results` (array) - Optional
  - `error` (string) - Optional

### 4. OAuth App Setup

#### YouTube OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/youtube`

#### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Add OAuth2 redirect URI: `http://localhost:3000/api/auth/callback/discord`

#### Telegram Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with `/newbot`
3. Save the bot token
4. Add the bot to your channel as an administrator

### 5. YouTube Webhook Setup

1. Set up a webhook endpoint at `/api/webhooks/youtube`
2. Configure the webhook secret in your environment variables
3. Subscribe to YouTube PubSubHubbub for channel updates

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## Usage Guide 📖

### 1. Connect Platforms

1. **Sign in with Whop**: Use your Whop account to access the dashboard (primary platform)
2. **Connect Whop**: Authorize access to your Whop communities (recommended first step)
3. **Connect YouTube**: Authorize access to your YouTube channel (content source)
4. **Connect Discord**: Add webhook URLs for your Discord servers (optional)
5. **Connect Telegram**: Add your bot token and channel ID (optional)

### 2. Create Automation

1. Go to **Automations** in the sidebar
2. Click **Create New Automation**
3. Select your connected YouTube channel
4. Write a message template using variables:
   - `{{title}}` - Video title
   - `{{videoId}}` - YouTube video ID
   - `{{videoUrl}}` - Full YouTube URL
   - `{{published}}` - Publication date
5. Select target platforms (Whop communities first, then Discord/Telegram optionally)
6. Save and enable the automation

### 3. Monitor Distribution

1. Go to **Logs** in the sidebar
2. View all distribution attempts and their status
3. Check individual platform results
4. Monitor success/failure rates

## Message Templates 📝

Create engaging messages with dynamic variables:

```
🎬 New video is live!

{{title}}

Watch now: {{videoUrl}}

#YouTube #ContentCreator
```

Available variables:
- `{{title}}` - Video title
- `{{videoId}}` - YouTube video ID
- `{{videoUrl}}` - Full YouTube URL
- `{{published}}` - Publication date
- `{{channelId}}` - YouTube channel ID

## API Endpoints 🔌

### Authentication
- `GET /api/auth/connect/[platform]` - Initiate OAuth flow
- `GET /api/auth/callback/[platform]` - Handle OAuth callback
- `GET /api/auth/session` - Inspect the current Whop-provided session headers

### Connections
- `GET /api/connections` - List user connections
- `POST /api/connections` - Create/update connection
- `DELETE /api/connections/[id]` - Remove connection

### Automations
- `GET /api/automations` - List user automations
- `POST /api/automations` - Create automation

### Jobs
- `GET /api/jobs` - List distribution jobs
- `GET /api/jobs/process` - Process pending jobs (cron)

### Webhooks
- `GET|POST /api/webhooks/youtube` - YouTube webhook handler

## Deployment 🚀

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy!

The application includes a `vercel.json` with cron job configuration:

```json
{
  "crons": [
    {
      "path": "/api/jobs/process",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Other Platforms

The application is built with Next.js and can be deployed to any platform that supports it:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Troubleshooting 🔧

### Common Issues

1. **OAuth Callback Errors**
   - Check redirect URIs are correctly configured
   - Verify environment variables are set

2. **YouTube Webhooks Not Working**
   - Ensure webhook URL is publicly accessible
   - Check webhook secret configuration

3. **Distribution Failures**
   - Verify platform connections are valid
   - Check API rate limits
   - Review logs for specific error messages

4. **Appwrite Connection Issues**
   - Verify all collection IDs are correct
   - Check attribute permissions
   - Ensure API key has proper permissions

5. **Whop Experience API Returns 401/403**
  - Confirm `WHOP_API_KEY` is set and was generated with the "Experiences: Read" capability inside the Whop dashboard (Apps → API Keys)
  - Make sure the key belongs to the same company as the experience you are previewing
  - When running through the Whop local dev proxy, export the `WHOP_API_BASE` value shown in the CLI so requests route through the proxy; otherwise the page falls back to default copy
6. **Auth Page Loops Inside Whop**
  - The `/auth` route now waits for the Whop runtime to inject `x-whop-*` headers before redirecting to the dashboard
  - If the spinner never resolves, click **Refresh session** to force a new check or use **Continue with Whop** to trigger the hosted sign-in
  - When testing outside Whop, the page automatically kicks off the hosted login so you land back with the proper headers

### Support

For issues and questions:
1. Check the logs in your application dashboard
2. Review the troubleshooting section above
3. Create an issue in the repository

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Built With ❤️

- [Next.js](https://nextjs.org/) - React framework
- [Appwrite](https://appwrite.io/) - Backend services
- [Whop](https://whop.com/) - Authentication and payments
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

**AmpFlow** - Making content distribution effortless for creators. 🚀