type EnvKey =
	| "WHOP_API_KEY"
	| "NEXT_PUBLIC_WHOP_APP_ID"
	| "NEXT_PUBLIC_WHOP_AGENT_USER_ID"
	| "NEXT_PUBLIC_WHOP_COMPANY_ID"
	| "NEXT_PUBLIC_APP_URL"
	| "NEXT_PUBLIC_WHOP_LOGIN_URL"
	| "APPWRITE_ENDPOINT"
	| "APPWRITE_PROJECT_ID"
	| "APPWRITE_DATABASE_ID"
	| "APPWRITE_USERS_COLLECTION_ID"
	| "APPWRITE_POSTS_COLLECTION_ID"
	| "APPWRITE_AUTOMATIONS_COLLECTION_ID"
	| "APPWRITE_LOGS_COLLECTION_ID"
	| "APPWRITE_CONNECTIONS_COLLECTION_ID"
	| "APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID"
	| "APPWRITE_API_KEY"
	| "APPWRITE_MEDIA_BUCKET_ID"
	| "APPWRITE_FUNCTION_POST_TO_INSTAGRAM_ID"
	| "APPWRITE_FUNCTION_DISTRIBUTE_MESSAGE_ID"
	| "APPWRITE_FUNCTION_SUBSCRIBE_YOUTUBE_ID"
	| "APPWRITE_FUNCTION_AUTH_REDIRECT_ID"
	| "YOUTUBE_CLIENT_ID"
	| "YOUTUBE_CLIENT_SECRET"
	| "YOUTUBE_REDIRECT_URI"
	| "INSTAGRAM_ACCESS_TOKEN"
	| "INSTAGRAM_BUSINESS_ID"
	| "DISCORD_CLIENT_ID"
	| "DISCORD_CLIENT_SECRET"
	| "DISCORD_REDIRECT_URI"
	| "WHOP_CLIENT_ID"
	| "WHOP_CLIENT_SECRET"
	| "WHOP_REDIRECT_URI"
	| "DEFAULT_TIMEZONE"
	| "NEXT_PUBLIC_WHOP_PRO_ACCESS_PASS_ID"
	| "NEXT_PUBLIC_WHOP_ENTERPRISE_ACCESS_PASS_ID";

const requiredServerEnv: EnvKey[] = [
	"WHOP_API_KEY",
	"NEXT_PUBLIC_WHOP_APP_ID",
	"NEXT_PUBLIC_WHOP_AGENT_USER_ID",
	"NEXT_PUBLIC_WHOP_COMPANY_ID",
	"APPWRITE_ENDPOINT",
	"APPWRITE_PROJECT_ID",
	"APPWRITE_DATABASE_ID",
	"APPWRITE_USERS_COLLECTION_ID",
	"APPWRITE_POSTS_COLLECTION_ID",
	"APPWRITE_AUTOMATIONS_COLLECTION_ID",
	"APPWRITE_LOGS_COLLECTION_ID",
	"APPWRITE_CONNECTIONS_COLLECTION_ID",
	"APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID",
	"APPWRITE_API_KEY",
	"APPWRITE_MEDIA_BUCKET_ID",
	"APPWRITE_FUNCTION_POST_TO_INSTAGRAM_ID",
	"APPWRITE_FUNCTION_DISTRIBUTE_MESSAGE_ID",
	"APPWRITE_FUNCTION_SUBSCRIBE_YOUTUBE_ID",
	"APPWRITE_FUNCTION_AUTH_REDIRECT_ID",
	"YOUTUBE_CLIENT_ID",
	"YOUTUBE_CLIENT_SECRET",
	"YOUTUBE_REDIRECT_URI",
	"INSTAGRAM_ACCESS_TOKEN",
	"INSTAGRAM_BUSINESS_ID",
	"DISCORD_CLIENT_ID",
	"DISCORD_CLIENT_SECRET",
	"DISCORD_REDIRECT_URI",
	"WHOP_CLIENT_ID",
	"WHOP_CLIENT_SECRET",
	"WHOP_REDIRECT_URI",
];

const envCache = new Map<EnvKey, string>();

function readEnv(key: EnvKey, fallback?: string): string {
	if (envCache.has(key)) {
		return envCache.get(key) as string;
	}

	const value = process.env[key] ?? fallback;

	if (!value || value.length === 0) {
		if (requiredServerEnv.includes(key)) {
			throw new Error(`Missing required environment variable: ${key}`);
		}
	}

	envCache.set(key, value ?? "");
	return value ?? "";
}

export const env = {
	whopApiKey: () => readEnv("WHOP_API_KEY"),
	whopAppId: () => readEnv("NEXT_PUBLIC_WHOP_APP_ID"),
	whopAgentUserId: () => readEnv("NEXT_PUBLIC_WHOP_AGENT_USER_ID"),
	whopCompanyId: () => readEnv("NEXT_PUBLIC_WHOP_COMPANY_ID"),
	appUrl: () => readEnv("NEXT_PUBLIC_APP_URL", ""),
	whopLoginUrl: () => readEnv("NEXT_PUBLIC_WHOP_LOGIN_URL", "https://whop.com/login"),
	appwriteEndpoint: () => readEnv("APPWRITE_ENDPOINT"),
	appwriteProjectId: () => readEnv("APPWRITE_PROJECT_ID"),
	appwriteDatabaseId: () => readEnv("APPWRITE_DATABASE_ID"),
	appwriteUsersCollectionId: () => readEnv("APPWRITE_USERS_COLLECTION_ID"),
	appwritePostsCollectionId: () => readEnv("APPWRITE_POSTS_COLLECTION_ID"),
	appwriteAutomationsCollectionId: () =>
		readEnv("APPWRITE_AUTOMATIONS_COLLECTION_ID"),
	appwriteLogsCollectionId: () => readEnv("APPWRITE_LOGS_COLLECTION_ID"),
	appwriteConnectionsCollectionId: () => readEnv("APPWRITE_CONNECTIONS_COLLECTION_ID"),
	appwriteYoutubeSubscriptionsCollectionId: () => readEnv("APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID"),
	appwriteApiKey: () => readEnv("APPWRITE_API_KEY"),
	appwriteMediaBucketId: () => readEnv("APPWRITE_MEDIA_BUCKET_ID"),
	appwritePostFunctionId: () => readEnv("APPWRITE_FUNCTION_POST_TO_INSTAGRAM_ID"),
	appwriteDistributeMessageFunctionId: () => readEnv("APPWRITE_FUNCTION_DISTRIBUTE_MESSAGE_ID"),
	appwriteSubscribeYoutubeFunctionId: () => readEnv("APPWRITE_FUNCTION_SUBSCRIBE_YOUTUBE_ID"),
	appwriteAuthRedirectFunctionId: () => readEnv("APPWRITE_FUNCTION_AUTH_REDIRECT_ID"),
	youtubeClientId: () => readEnv("YOUTUBE_CLIENT_ID"),
	youtubeClientSecret: () => readEnv("YOUTUBE_CLIENT_SECRET"),
	youtubeRedirectUri: () => readEnv("YOUTUBE_REDIRECT_URI"),
	discordClientId: () => readEnv("DISCORD_CLIENT_ID"),
	discordClientSecret: () => readEnv("DISCORD_CLIENT_SECRET"),
	discordRedirectUri: () => readEnv("DISCORD_REDIRECT_URI"),
	whopClientId: () => readEnv("WHOP_CLIENT_ID"),
	whopClientSecret: () => readEnv("WHOP_CLIENT_SECRET"),
	whopRedirectUri: () => readEnv("WHOP_REDIRECT_URI"),
	instagramAccessToken: () => readEnv("INSTAGRAM_ACCESS_TOKEN"),
	instagramBusinessId: () => readEnv("INSTAGRAM_BUSINESS_ID"),
	defaultTimezone: () => readEnv("DEFAULT_TIMEZONE", "UTC"),
	whopProAccessPassId: () => readEnv("NEXT_PUBLIC_WHOP_PRO_ACCESS_PASS_ID", ""),
	whopEnterpriseAccessPassId: () => readEnv("NEXT_PUBLIC_WHOP_ENTERPRISE_ACCESS_PASS_ID", ""),
};

export type Env = typeof env;
