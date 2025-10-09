# AmpFlow — Appwrite Functions and Deployment

This doc explains how to deploy and wire the Appwrite Functions used by AmpFlow using Appwrite CLI on Windows.

## Functions
- subscribeToYouTube (HTTP) — subscribes a channel to YouTube PuSH hub and creates a youtubeSubscriptions doc.
- youtubeWebhook (HTTP public) — handles GET verification and POST notifications; triggers distributeMessage.
- distributeMessage (internal) — posts templated messages to Discord, Telegram, and Whop based on connection docs.
- renewYouTubeSubscriptions (scheduled) — renews PuSH subscriptions before expiry (runs every 12 hours).

## Prerequisites
- Appwrite project: 68e3b9ba0034add73ea0
- Database: 68e3b9d6003bafa3dc5f
- Collections: connections, automations, youtubeSubscriptions (see `appwrite-schema.json`)
- Appwrite CLI installed and logged in.

## Environment
Frontend uses these (in `.env.local`):
- NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
- NEXT_PUBLIC_APPWRITE_PROJECT_ID=68e3b9ba0034add73ea0
- NEXT_PUBLIC_APPWRITE_DATABASE_ID=68e3b9d6003bafa3dc5f
- NEXT_PUBLIC_APPWRITE_CONNECTIONS_COLLECTION_ID=connections
- NEXT_PUBLIC_APPWRITE_AUTOMATIONS_COLLECTION_ID=automations
- NEXT_PUBLIC_APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID=youtubeSubscriptions

Functions expect these (set as function variables):
- APPWRITE_DATABASE_ID
- APPWRITE_CONNECTIONS_COLLECTION_ID
- APPWRITE_AUTOMATIONS_COLLECTION_ID
- APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID
- APPWRITE_API_KEY (server key with Databases + Functions permissions)

## Deploy via Appwrite CLI (Windows cmd)
1. Login and select project
   appwrite login
   appwrite client --endpoint https://cloud.appwrite.io/v1 --projectId 68e3b9ba0034add73ea0

2. Push resources (creates/updates functions)
   appwrite deploy -all

3. Set function variables (replace with your secure API key)
   appwrite functions createVariable --functionId subscribeToYouTube --key APPWRITE_API_KEY --value YOUR_API_KEY
   appwrite functions createVariable --functionId youtubeWebhook --key APPWRITE_API_KEY --value YOUR_API_KEY
   appwrite functions createVariable --functionId distributeMessage --key APPWRITE_API_KEY --value YOUR_API_KEY
   appwrite functions createVariable --functionId renewYouTubeSubscriptions --key APPWRITE_API_KEY --value YOUR_API_KEY

4. Get public webhook URL (after deploy)
   - In Appwrite Console → Functions → youtubeWebhook → Settings → copy HTTP endpoint
   - Ensure subscribeToYouTube builds callback URL as: {APPWRITE_FUNCTION_ENDPOINT}/functions/youtubeWebhook/executions

5. Test flow
   - Create a `connections` doc for a YouTube channel and destination platforms.
   - Save an `automations` doc as active.
   - Call subscribeToYouTube (HTTP) with body: { userId, youtubeChannelId, youtubeConnectionId }.
   - Verify GET from YouTube (Appwrite logs should show verification).
   - Publish a test video → webhook should trigger distributeMessage.

## Notes
- youtubeWebhook.execute is open to role:all to allow public GET/POST from YouTube. Others are restricted.
- renewYouTubeSubscriptions runs every 12 hours. Adjust schedule in `appwrite.json` if needed.
- Keep API keys out of git; set them as variables through Console/CLI only.
