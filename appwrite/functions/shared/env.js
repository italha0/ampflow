const REQUIRED_ENV = [
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
  "APPWRITE_DATABASE_ID",
  "APPWRITE_POSTS_COLLECTION_ID",
  "APPWRITE_LOGS_COLLECTION_ID",
  "APPWRITE_CONNECTIONS_COLLECTION_ID",
  "APPWRITE_AUTOMATIONS_COLLECTION_ID",
  "APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID",
  "YOUTUBE_WEBHOOK_URL",
  "INSTAGRAM_ACCESS_TOKEN",
  "INSTAGRAM_BUSINESS_ID"
];

export function readEnv(key, fallback = undefined) {
  const value = process.env[key] ?? fallback;
  if ((value === undefined || value === null || value === "") && REQUIRED_ENV.includes(key)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  endpoint: () => readEnv("APPWRITE_ENDPOINT"),
  projectId: () => readEnv("APPWRITE_PROJECT_ID"),
  apiKey: () => readEnv("APPWRITE_API_KEY"),
  databaseId: () => readEnv("APPWRITE_DATABASE_ID"),
  postsCollectionId: () => readEnv("APPWRITE_POSTS_COLLECTION_ID"),
  logsCollectionId: () => readEnv("APPWRITE_LOGS_COLLECTION_ID"),
  connectionsCollectionId: () => readEnv("APPWRITE_CONNECTIONS_COLLECTION_ID"),
  automationsCollectionId: () => readEnv("APPWRITE_AUTOMATIONS_COLLECTION_ID"),
  youtubeSubscriptionsCollectionId: () => readEnv("APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID"),
  timezone: () => readEnv("DEFAULT_TIMEZONE", "UTC"),
  instagramAccessToken: () => readEnv("INSTAGRAM_ACCESS_TOKEN"),
  instagramBusinessId: () => readEnv("INSTAGRAM_BUSINESS_ID"),
  youtubeWebhookUrl: () => readEnv("YOUTUBE_WEBHOOK_URL"),
  youtubeHubUrl: () => readEnv("YOUTUBE_HUB_URL", "https://pubsubhubbub.appspot.com"),
  youtubeClientId: () => readEnv("YOUTUBE_CLIENT_ID"),
  youtubeClientSecret: () => readEnv("YOUTUBE_CLIENT_SECRET"),
  youtubeRedirectUri: () => readEnv("YOUTUBE_REDIRECT_URI"),
  discordClientId: () => readEnv("DISCORD_CLIENT_ID"),
  discordClientSecret: () => readEnv("DISCORD_CLIENT_SECRET"),
  discordRedirectUri: () => readEnv("DISCORD_REDIRECT_URI"),
  discordApiBase: () => readEnv("DISCORD_API_BASE", "https://discord.com/api/v10"),
  whopClientId: () => readEnv("WHOP_CLIENT_ID"),
  whopClientSecret: () => readEnv("WHOP_CLIENT_SECRET"),
  whopRedirectUri: () => readEnv("WHOP_REDIRECT_URI"),
  whopApiBase: () => readEnv("WHOP_API_BASE", "https://api.whop.com/v1"),
  whopTokenUrl: () => readEnv("WHOP_TOKEN_URL", "https://api.whop.com/oauth/token"),
  telegramApiBase: () => readEnv("TELEGRAM_API_BASE", "https://api.telegram.org"),
  appUrl: () => readEnv("APP_URL", "https://app.ampflow.com"),
  distributeMessageFunctionId: () => readEnv("APPWRITE_FUNCTION_DISTRIBUTE_MESSAGE_ID"),
  subscribeYoutubeFunctionId: () => readEnv("APPWRITE_FUNCTION_SUBSCRIBE_YOUTUBE_ID"),
};
