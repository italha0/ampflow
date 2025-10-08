import type {
	AmpFlowUser,
	ApiError,
	Automation,
	Connection,
	LogEntry,
	Post,
	PublishResponse,
	SaveAutomationPayload,
} from "@/types";

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const errorBody = (await response.json().catch(() => null)) as ApiError | null;
		const message = errorBody?.error ?? `Request failed with status ${response.status}`;
		throw new Error(message);
	}
	return (await response.json()) as T;
}

export const api = {
	async getCurrentUser() {
		return handleResponse<AmpFlowUser>(await fetch("/api/user", { cache: "no-store" }));
	},
	async listPosts() {
		return handleResponse<Post[]>(await fetch("/api/posts", { cache: "no-store" }));
	},
	async listLogs(postId?: string) {
		const origin =
			typeof window !== "undefined"
				? window.location.origin
				: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
		const url = new URL("/api/logs", origin);
		if (postId) {
			url.searchParams.set("postId", postId);
		}
		return handleResponse<LogEntry[]>(await fetch(url.toString(), { cache: "no-store" }));
	},
	async publishPost(payload: FormData) {
		return handleResponse<PublishResponse>(
			await fetch("/api/posts", {
				method: "POST",
				body: payload,
			}),
		);
	},
	async listConnections() {
		return handleResponse<Connection[]>(await fetch("/api/connections", { cache: "no-store" }));
	},
	async listAutomations() {
		return handleResponse<Automation[]>(await fetch("/api/automations", { cache: "no-store" }));
	},
	async saveAutomation(payload: SaveAutomationPayload) {
		return handleResponse<Automation>(
			await fetch("/api/automations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			}),
		);
	},
	async disconnectConnection(connectionId: string) {
		return handleResponse<{ success: boolean }>(
			await fetch(`/api/connections/${connectionId}`, {
				method: "DELETE",
			}),
		);
	},
};
