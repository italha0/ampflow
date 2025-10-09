# AmpFlow Architecture & Integration Plan

_Last updated: 2025-10-07_

## Goals

- Deliver the AmpFlow MVP on top of the existing whop-app Next.js template.
- Leverage Appwrite for auth, data, and serverless functions.
- Support automated fan-out of new YouTube content to community platforms.
- Maintain security-by-default with least-privilege rules and encrypted secrets.

## Data Model

All collections live inside the primary Appwrite database (`APPWRITE_DATABASE_ID`). Documents are scoped to the authenticated user via attribute-based security rules.

### `connections`

| Attribute        | Type    | Notes |
|------------------|---------|-------|
| `userId`         | string  | Required, indexed. Must equal `authUser.$id`. Read/Write self.
| `platform`       | string  | Required. One of `youtube`, `discord`, `telegram`, `whop`.
| `username`       | string  | Display name or channel/server title.
| `channelId`      | string  | Required for YouTube, Discord channels, Whop community ID.
| `guildId`        | string  | Discord server ID (optional).
| `accessToken`    | string  | Encrypted; OAuth token or Whop API key.
| `refreshToken`   | string  | Encrypted; OAuth refresh token where applicable.
| `botToken`       | string  | Encrypted; Telegram bot token.
| `scope`          | string  | OAuth scopes granted (space/comma separated).
| `metadata`       | object  | Optional JSON for cached channel lists, etc. (max 10 KB).
| `createdAt`      | datetime| Auto-set.
| `updatedAt`      | datetime| Auto-set.

**Indexes**
- `userId_platform` (key: `userId`, `platform`).
- `channelId` (key: `channelId`).

**Security**
- Read/Write: `userId == user.$id`.
- No public permissions.

### `automations`

| Attribute              | Type         | Notes |
|------------------------|--------------|-------|
| `userId`               | string       | Required, indexed.
| `youtubeConnectionId`  | string       | Required; document ID referencing `connections` (platform = youtube).
| `targetConnectionIds`  | string[]     | Required; references `connections` documents for Discord/Telegram/Whop.
| `messageTemplate`      | string       | Required; supports `{{video_title}}`, `{{video_url}}`, `{{channel_name}}`.
| `isActive`             | boolean      | Required; default true.
| `lastTriggeredAt`      | datetime     | Optional for activity logs.
| `createdAt`            | datetime     | Auto-set.
| `updatedAt`            | datetime     | Auto-set.

**Indexes**
- `userId_isActive` (key: `userId`, `isActive`).
- `youtubeConnectionId` (key: `youtubeConnectionId`).

**Security**
- Read/Write: `userId == user.$id`.

### `youtubeSubscriptions`

| Attribute         | Type     | Notes |
|-------------------|----------|-------|
| `youtubeChannelId`| string   | Primary key; unique index.
| `callbackUrl`     | string   | Public endpoint of `youtubeWebhook` function.
| `hubSecret`       | string   | Encrypted random secret used for HMAC validation.
| `status`          | string   | Enum: `pending`, `subscribed`, `unsubscribed`.
| `expiryDate`      | datetime | Timestamp from hub response (max lease seconds).
| `lastNotifiedAt`  | datetime | Optional; last time a notification was processed.
| `createdAt`       | datetime | Auto-set.
| `updatedAt`       | datetime | Auto-set.

**Security**
- Read/Write: function key only (no end-user access). Assign API key with role `documents.read`, `documents.write` restricted to this collection.

## Functions Overview

All functions use `node-appwrite` SDK with admin key from environment. Shared utilities live under `appwrite/functions/shared`.

### 1. `subscribeToYouTube`
- **Trigger**: HTTP (POST) with Appwrite session JWT or API key.
- **Input**: `{ userId, youtubeConnectionId, youtubeChannelId }`.
- **Flow**:
  1. Validate the calling user owns the referenced connection.
  2. Generate `hubSecret` via `crypto.randomBytes(32)`.
  3. Build `hub.topic` (`https://www.youtube.com/xml/feeds/videos.xml?channel_id=...`).
  4. Construct callback from environment `YOUTUBE_WEBHOOK_URL`.
  5. POST to `https://pubsubhubbub.appspot.com/subscribe` with lease seconds (864000).
  6. Upsert `youtubeSubscriptions` document (`status = "pending"`).
  7. Return subscription metadata.
- **Error Handling**: Surface hub errors, log to Appwrite logs collection.

### 2. `youtubeWebhook`
- **Trigger**: HTTP (GET/POST) publicly accessible function URL.
- **GET**: Verification handshake.
  - Validate `hub.mode`, `hub.topic`, existing subscription.
  - Update status to `subscribed`; respond with `hub.challenge`.
- **POST**: Notifications.
  - Verify `X-Hub-Signature` using stored `hubSecret` (HMAC-SHA1).
  - Parse XML payload (use `fast-xml-parser`).
  - Deduplicate events (by storing `videoId` + timestamp via `lastNotifiedAt`).
  - Lookup active automations tied to channel, fan out to `distributeMessage` via synchronous function execution (`functions.createExecution`).
  - Return 200 even if some downstream errors, but log details.

### 3. `distributeMessage`
- **Trigger**: Callable from other functions (`functions.createExecution`).
- **Input**: `{ userId, messageTemplate, video: { id, title, url }, targetConnectionIds }`.
- **Flow**:
  1. Resolve connections (batch fetch).
  2. Hydrate template placeholders.
  3. Dispatch platform-specific handlers:
     - **Discord**: Use REST `https://discord.com/api/v10/channels/{channelId}/messages` with bot token.
     - **Telegram**: POST to `https://api.telegram.org/bot${botToken}/sendMessage` with chat/channel ID.
     - **Whop**: POST to `https://api.whop.com/v1/community/posts` (placeholder; confirm actual endpoint) including API key.
  4. Handle rate limiting (retry with exponential backoff up to 2 times).
  5. Write success/error logs to `logs` collection with structured metadata.

### 4. `authRedirect`
- **Trigger**: HTTP (GET) invoked via Next.js API route after OAuth.
- **Input**: Query params from platform (`code`, `state`).
- **Flow**:
  1. Validate `state` (encoded user & CSRF token stored in Appwrite KV or JWT).
  2. Exchange `code` for tokens via platform OAuth endpoints.
  3. Fetch profile/channel data to populate connection document.
  4. Upsert into `connections` with encrypted secrets.
  5. For YouTube, call `subscribeToYouTube`.
  6. Redirect back to dashboard with status query (?connected=discord).

## Environment Variables

### Next.js (`.env.local`)
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- `NEXT_PUBLIC_APPWRITE_CONNECTIONS_COLLECTION_ID`
- `NEXT_PUBLIC_APPWRITE_AUTOMATIONS_COLLECTION_ID`
- `NEXT_PUBLIC_YOUTUBE_CLIENT_ID`
- `NEXT_PUBLIC_SENTRY_DSN` (existing)
- `NEXT_PUBLIC_APP_URL`

Server-only (prefixed `APPWRITE` or no prefix, loaded via `next.config.js` or Edge runtime):
- `APPWRITE_FUNCTION_SUBSCRIBE_YOUTUBE_ID`
- `APPWRITE_FUNCTION_DISTRIBUTE_MESSAGE_ID`
- `APPWRITE_FUNCTION_AUTH_REDIRECT_ID`
- `APPWRITE_API_KEY` (for backend routes invoking functions)
- `YOUTUBE_CLIENT_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `WHOP_CLIENT_ID`
- `WHOP_CLIENT_SECRET`
- `TELEGRAM_BOT_INIT_TOKEN`
- `YOUTUBE_WEBHOOK_URL`
- `NEXTAUTH_SECRET` (if using NextAuth fallback; optional)

### Appwrite Functions

Common:
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_CONNECTIONS_COLLECTION_ID`
- `APPWRITE_AUTOMATIONS_COLLECTION_ID`
- `APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID`
- `APPWRITE_LOGS_COLLECTION_ID`
- `YOUTUBE_WEBHOOK_URL`
- `YOUTUBE_HUB_URL` (default `https://pubsubhubbub.appspot.com`)
- `DISCORD_API_BASE`
- `TELEGRAM_API_BASE`
- `WHOP_API_BASE`

`authRedirect`:
- Each platform client ID/secret
- `APP_URL` for redirect

`distributeMessage`:
- No additional env beyond API base URLs; tokens are pulled from documents.

## Frontend Data Flow

1. **Auth Gate**
   - Use existing Appwrite client in `lib/appwrite.ts` to check current session.
   - Redirect unauthenticated users to `/auth` page.

2. **State Management**
   - Extend `store/useAmpFlowStore.ts` to fetch connections & automations via Appwrite database SDK.
   - React Query or zustand (existing store) for caching.
   - Provide derived states (connected platforms, available channels, automation toggles).

3. **Connections Dashboard**
   - Cards read from store; connect/disconnect buttons call Next.js API routes which invoke Appwrite functions or Appwrite SDK writes.
   - Display loading skeletons while fetching data.

4. **Automation Builder**
   - Preload YouTube connection; disable actions if missing.
   - Allow toggles for available platforms (persist by updating `automations` document).
   - Message template saved via debounced update.

5. **Notifications & Errors**
   - Use toast component (extend existing UI) for success/failure feedback.
   - Global error boundary already exists in template.

## Integration Points

- **OAuth**: Next.js API routes (e.g., `/api/auth/callback/[platform]`) handle browser redirects and invoke `authRedirect` via Appwrite Functions API. Tokens never touch the browser besides initial redirect.
- **Webhooks**: `youtubeWebhook` is exposed via Appwrite; ensure environment `YOUTUBE_WEBHOOK_URL` equals deployed function URL for Google hub.
- **Scheduling**: Not required for MVP; rely on YouTube push notifications. Add CRON in future for lease renewal.

## Security Notes

- Encrypt sensitive attributes via Appwrite console (mark as `encrypted`).
- Validate ownership before returning connection data in API routes.
- Use `state` parameter with signed JWT stored in `connections` or `KV` collection for OAuth CSRF protection.
- Restrict Appwrite API keys to minimum required scopes per function.
- Log PII-free events only.

## Next Steps

1. Create Appwrite collections and indexes (console or CLI).
2. Scaffold new functions under `appwrite/functions` with shared utils (`http.js`, `crypto.js`, `platforms/` helpers).
3. Implement Next.js pages (`/auth`, `/automation`, dashboard) and update global layout.
4. Wire Zustand store with Appwrite queries & mutations.
5. Implement API routes bridging OAuth callbacks to Appwrite functions.
6. Update documentation and environment examples.
