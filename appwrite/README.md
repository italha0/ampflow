# AmpFlow Appwrite Backend

This folder contains the serverless functions and configuration scaffolding required to run AmpFlow on Appwrite.

## Collections

Create the following collections inside your Appwrite database (IDs below match the defaults in `.env.local.example`). All timestamps should be stored as ISO strings.

### `users`
- `whopUserId` (string, required) — Maps to the authenticated Whop user.
- `instagramBusinessId` (string, optional) — Instagram business account connected to the user.
- `planTier` (string, required) — e.g. `free`, `pro`, `enterprise`.
- `timezone` (string, optional) — Olson timezone identifier.
- `createdAt` / `updatedAt` (datetime).

### `posts`
- `userId` (string, required).
- `caption` (string, <= 2200 chars).
- `mediaUrl` (string, required) — Publicly accessible URL (AmpFlow uploads to Appwrite Storage by default).
- `mediaType` (enum) — `IMAGE` or `VIDEO`.
- `status` (enum) — `draft`, `scheduled`, `processing`, `published`, `retrying`, `failed`.
- `scheduledAt` (datetime, optional).
- `publishedAt` (datetime, optional).
- `instagramContainerId` / `instagramMediaId` (string, optional).
- `retryCount` (integer, default 0).
- `errorMessage` (string, optional).
- `lastTriedAt` (datetime, optional).
- `permalink` (string, optional).
- `createdAt` / `updatedAt` (datetime).

### `automations`
- `postId` (string, required).
- `cron` (string, optional) — CRON statement if you need per-post schedules.
- `nextRunAt` (datetime).
- `status` (enum) — `pending`, `complete`, `cancelled`.
- `metadata` (object).

### `logs`
- `postId` (string, optional).
- `level` (enum) — `info`, `warn`, `error`.
- `message` (string).
- `metadata` (object).
- `timestamp` (datetime).

## Functions

Install dependencies:

```bash
npm install
```

Deploy each function with the `node` runtime (Node 18+ recommended) and the following entry files:

| Function | Entry File | Suggested Schedule |
| --- | --- | --- |
| `postToInstagram` | `postToInstagram/index.js` | HTTP / client triggered |
| `scheduleInstagramPost` | `scheduleInstagramPost/index.js` | Cron every 5 minutes |
| `fetchPostStatus` | `fetchPostStatus/index.js` | HTTP / on-demand |

### Environment Variables

Assign the variables from `.env.local` to each function (or set them globally):

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_POSTS_COLLECTION_ID`
- `APPWRITE_AUTOMATIONS_COLLECTION_ID`
- `APPWRITE_LOGS_COLLECTION_ID`
- `APPWRITE_MEDIA_BUCKET_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_FUNCTION_POST_TO_INSTAGRAM_ID`
- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ID`
- `DEFAULT_TIMEZONE` (optional)

### Cron Job

Create an Appwrite Scheduler job to trigger the `scheduleInstagramPost` function every 5 minutes:

```
*/5 * * * *
```

## Error Handling & Retries

- `scheduleInstagramPost` automatically retries failed posts up to 5 times, marking them as `failed` afterwards.
- All functions write structured logs to the `logs` collection for auditing.
- Captions are sanitized server-side to remove unsupported control characters and truncated to 2,200 characters.

## Extensibility

Shared helpers in `shared/` contain the Instagram Graph integration and Appwrite admin client. To add new channels (Discord, Telegram, Email) replicate the pattern in a new helper module and extend the functions.
