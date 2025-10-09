export type ConnectionPlatform = "youtube" | "discord" | "telegram" | "whop";

export interface Connection {
	$id: string;
	platform: ConnectionPlatform;
	username?: string | null;
	channelId?: string | null;
	guildId?: string | null;
	status?: string | null;
	scope?: string | null;
	metadata?: Record<string, unknown> | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface Automation {
	$id: string;
	userId: string;
	youtubeConnectionId: string;
	targetConnectionIds: string[];
	messageTemplate: string;
	isActive: boolean;
	lastTriggeredAt?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export type PostStatus =
	| "draft"
	| "scheduled"
	| "processing"
	| "retrying"
	| "published"
	| "failed";

export type MediaType = "IMAGE" | "VIDEO";

export interface Post {
	$id: string;
	userId: string;
	caption: string;
	mediaUrl: string;
	mediaType: MediaType;
	status: PostStatus;
	scheduledAt?: string | null;
	publishedAt?: string | null;
	instagramContainerId?: string | null;
	instagramMediaId?: string | null;
	retryCount?: number;
	errorMessage?: string | null;
	permalink?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface LogEntry {
	$id: string;
	postId?: string;
	level: "info" | "warn" | "error";
	message: string;
	metadata?: Record<string, unknown> | null;
	timestamp: string;
}

export interface AmpFlowUser {
	$id: string;
	whopUserId: string;
	instagramBusinessId?: string;
	planTier: string;
	timezone?: string;
}

export interface InstagramPreview {
	caption: string;
	mediaUrl: string;
	mediaType: MediaType;
}

export interface PublishResponse {
	status: "published" | "scheduled";
	postId?: string;
	publishedAt?: string;
	scheduledAt?: string;
	instagramContainerId?: string;
	instagramMediaId?: string;
}

export interface ApiError {
	error: string;
}

export interface SaveAutomationPayload {
	automationId?: string | null;
	youtubeConnectionId: string;
	targetConnectionIds: string[];
	messageTemplate: string;
	isActive: boolean;
}
