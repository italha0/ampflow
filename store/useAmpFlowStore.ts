"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type {
	AmpFlowUser,
	Automation,
	Connection,
	ConnectionPlatform,
	InstagramPreview,
	LogEntry,
	Post,
	PostStatus,
	PublishResponse,
	SaveAutomationPayload,
} from "@/types";

interface AmpFlowState {
	user: AmpFlowUser | null;
	posts: Post[];
	logs: LogEntry[];
	connections: Connection[];
	automations: Automation[];
	isLoading: boolean;
	isPublishing: boolean;
	isRefreshingConnections: boolean;
	isRefreshingAutomations: boolean;
	isSavingAutomation: boolean;
	preview: InstagramPreview | null;
	activeStatusFilter: PostStatus | "all";
	error: string | null;

	fetchDashboard: () => Promise<void>;
	fetchLogs: (postId?: string) => Promise<void>;
	setPreview: (preview: InstagramPreview | null) => void;
	setActiveStatusFilter: (status: PostStatus | "all") => void;
	upsertPost: (post: Post) => void;
	updatePosts: (posts: Post[]) => void;
	publishPost: (payload: FormData) => Promise<PublishResponse>;
	refreshConnections: () => Promise<void>;
	refreshAutomations: () => Promise<void>;
	connectPlatform: (platform: ConnectionPlatform) => void;
	disconnectConnection: (connectionId: string) => Promise<void>;
	saveAutomation: (payload: SaveAutomationPayload) => Promise<Automation>;
}

export const useAmpFlowStore = create<AmpFlowState>((set, get) => ({
	user: null,
	posts: [],
	logs: [],
	connections: [],
	automations: [],
	isLoading: true,
	isPublishing: false,
	isRefreshingConnections: false,
	isRefreshingAutomations: false,
	isSavingAutomation: false,
	preview: null,
	activeStatusFilter: "all",
	error: null,

	async fetchDashboard() {
		set({ isLoading: true, error: null });
		try {
			const [user, posts] = await Promise.all([api.getCurrentUser(), api.listPosts()]);
			set({ user, posts, isLoading: false });
		} catch (err) {
			set({ error: err instanceof Error ? err.message : "Failed to load dashboard", isLoading: false });
		}
	},

	async fetchLogs(postId) {
		try {
			const logs = await api.listLogs(postId);
			set({ logs });
		} catch (err) {
			set({ error: err instanceof Error ? err.message : "Failed to load logs" });
		}
	},

	async refreshConnections() {
		set({ isRefreshingConnections: true });
		try {
			const connections = await api.listConnections();
			set({ connections });
		} catch (err) {
			set({ error: err instanceof Error ? err.message : "Failed to load connections" });
		} finally {
			set({ isRefreshingConnections: false });
		}
	},

	async refreshAutomations() {
		set({ isRefreshingAutomations: true });
		try {
			const automations = await api.listAutomations();
			set({ automations });
		} catch (err) {
			set({ error: err instanceof Error ? err.message : "Failed to load automations" });
		} finally {
			set({ isRefreshingAutomations: false });
		}
	},

		async saveAutomation(payload) {
			set({ isSavingAutomation: true, error: null });
			try {
				const automation = await api.saveAutomation(payload);
				set((state) => {
					const existingIndex = state.automations.findIndex((item) => item.$id === automation.$id);
					if (existingIndex >= 0) {
						const next = [...state.automations];
						next[existingIndex] = automation;
						return { automations: next, isSavingAutomation: false };
					}
					return { automations: [automation, ...state.automations], isSavingAutomation: false };
				});
				return automation;
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to save automation";
				set({ error: message, isSavingAutomation: false });
				throw err;
			}
		},

	setPreview(preview) {
		set({ preview });
	},

	setActiveStatusFilter(status) {
		set({ activeStatusFilter: status });
	},

	upsertPost(post) {
		const existing = get().posts;
		const index = existing.findIndex((item) => item.$id === post.$id);
		if (index >= 0) {
			const next = [...existing];
			next[index] = post;
			set({ posts: next });
		} else {
			set({ posts: [post, ...existing] });
		}
	},

	updatePosts(posts) {
		set({ posts });
	},

	async publishPost(payload) {
		set({ isPublishing: true, error: null });
		try {
			const response = await api.publishPost(payload);
			await get().fetchDashboard();
			return response;
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to publish";
			set({ error: message });
			throw err;
		} finally {
			set({ isPublishing: false });
		}
	},

	connectPlatform(platform) {
		if (typeof window === "undefined") {
			return;
		}
		window.location.href = `/api/auth/connect/${platform}`;
	},

	async disconnectConnection(connectionId) {
		try {
			await api.disconnectConnection(connectionId);
			await get().refreshConnections();
		} catch (err) {
			set({ error: err instanceof Error ? err.message : "Failed to disconnect" });
		}
	},
}));
