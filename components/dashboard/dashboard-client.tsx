"use client";

import * as React from "react";
import { DateTime } from "luxon";
import { UploadForm } from "@/components/dashboard/upload-form";
import { PreviewModal } from "@/components/dashboard/preview-modal";
import { PostsTable } from "@/components/dashboard/posts-table";
import { LogsTable } from "@/components/dashboard/logs-table";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useAmpFlowStore } from "@/store/useAmpFlowStore";
import type { Connection, ConnectionPlatform, Post } from "@/types";

const platformDetails: Record<ConnectionPlatform, { title: string; description: string; cta: string }> = {
	youtube: {
		title: "YouTube channel",
		description: "Connect the channel you want AmpFlow to monitor for new uploads.",
		cta: "Connect YouTube",
	},
	discord: {
		title: "Discord server",
		description: "Post announcements into a selected channel when new videos drop.",
		cta: "Connect Discord",
	},
	telegram: {
		title: "Telegram channel",
		description: "Share releases to your Telegram followers instantly.",
		cta: "Connect Telegram",
	},
	whop: {
		title: "Whop community",
		description: "Keep your members in the loop with automatic community posts.",
		cta: "Connect Whop",
	},
};

function getStatusVariant(status?: string | null): BadgeVariant {
	const normalized = (status ?? "connected").toLowerCase();
	if (["connected", "active", "ready", "subscribed"].includes(normalized)) {
		return "success";
	}
	if (["pending", "syncing", "processing"].includes(normalized)) {
		return "warning";
	}
	if (["failed", "error", "revoked", "disconnected"].includes(normalized)) {
		return "danger";
	}
	return "default";
}

function getConnectionSubtitle(connection: Connection): string | null {
	switch (connection.platform) {
		case "youtube":
			return connection.channelId ? `Channel ID • ${connection.channelId}` : connection.scope ?? null;
		case "discord":
			return connection.guildId ? `Server ID • ${connection.guildId}` : connection.scope ?? null;
		case "telegram":
			return connection.channelId ? `Chat ID • ${connection.channelId}` : connection.scope ?? null;
		case "whop":
			return connection.channelId ? `Community ID • ${connection.channelId}` : connection.scope ?? null;
		default:
			return connection.scope ?? null;
	}
}

function formatRelativeTime(value?: string | null) {
	if (!value) return null;
	const date = DateTime.fromISO(value);
	if (!date.isValid) return null;
	return date.toRelative({ style: "short" });
}

export function DashboardClient() {
	const user = useAmpFlowStore((state) => state.user);
	const posts = useAmpFlowStore((state) => state.posts);
	const logs = useAmpFlowStore((state) => state.logs);
	const connections = useAmpFlowStore((state) => state.connections);
	const automations = useAmpFlowStore((state) => state.automations);
	const isLoading = useAmpFlowStore((state) => state.isLoading);
	const isRefreshingConnections = useAmpFlowStore((state) => state.isRefreshingConnections);
	const isRefreshingAutomations = useAmpFlowStore((state) => state.isRefreshingAutomations);
	const error = useAmpFlowStore((state) => state.error);
	const fetchDashboard = useAmpFlowStore((state) => state.fetchDashboard);
	const fetchLogs = useAmpFlowStore((state) => state.fetchLogs);
	const refreshConnections = useAmpFlowStore((state) => state.refreshConnections);
	const refreshAutomations = useAmpFlowStore((state) => state.refreshAutomations);
	const connectPlatform = useAmpFlowStore((state) => state.connectPlatform);
	const disconnectConnection = useAmpFlowStore((state) => state.disconnectConnection);

	const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);

	React.useEffect(() => {
		void fetchDashboard();
	}, [fetchDashboard]);

	React.useEffect(() => {
		void refreshConnections();
		void refreshAutomations();
	}, [refreshConnections, refreshAutomations]);

	const upcomingPosts = React.useMemo(
		() =>
			posts
				.filter((post) => ["scheduled", "processing", "retrying"].includes(post.status))
				.sort((a, b) => {
					const aDate = DateTime.fromISO(a.scheduledAt ?? "").toMillis();
					const bDate = DateTime.fromISO(b.scheduledAt ?? "").toMillis();
					return aDate - bDate;
				}),
		[posts],
	);

	const publishedPosts = React.useMemo(
		() =>
			posts
				.filter((post) => ["published", "failed"].includes(post.status))
				.sort(
					(a, b) =>
						DateTime.fromISO(b.publishedAt ?? "").toMillis() -
						DateTime.fromISO(a.publishedAt ?? "").toMillis(),
				),
		[posts],
	);

	React.useEffect(() => {
		if (!selectedPost) return;
		void fetchLogs(selectedPost.$id);
	}, [fetchLogs, selectedPost]);

	const connectionCards = React.useMemo(
		() => {
			const grouped: Record<ConnectionPlatform, Connection[]> = {
				youtube: [],
				discord: [],
				telegram: [],
				whop: [],
			};

			for (const connection of connections) {
				grouped[connection.platform]?.push(connection);
			}

			return (Object.keys(platformDetails) as ConnectionPlatform[]).map((platform) => ({
				platform,
				details: platformDetails[platform],
				connections: grouped[platform],
			}));
		},
		[connections],
	);

	const activeAutomations = React.useMemo(
		() => automations.filter((automation) => automation.isActive),
		[automations],
	);

	const lastAutomationTriggered = React.useMemo(() => {
		const timestamps = automations
			.map((automation) => automation.lastTriggeredAt)
			.filter((value): value is string => Boolean(value));
		if (timestamps.length === 0) return null;
		return timestamps.reduce((latest, current) => {
			const latestDate = DateTime.fromISO(latest ?? "");
			const currentDate = DateTime.fromISO(current ?? "");
			return currentDate > latestDate ? current : latest;
		});
	}, [automations]);

	const handleConnect = React.useCallback(
		(platform: ConnectionPlatform) => {
			connectPlatform(platform);
		},
		[connectPlatform],
	);

	const handleDisconnect = React.useCallback(
		(connectionId: string) => {
			void disconnectConnection(connectionId);
		},
		[disconnectConnection],
	);

	const totalPosts = posts.length;
	const successCount = posts.filter((post) => post.status === "published").length;
	const scheduledCount = posts.filter((post) => post.status === "scheduled").length;
	const successRate = totalPosts === 0 ? 0 : Math.round((successCount / totalPosts) * 100);

	return (
		<main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 animate-fade-in">
			<section className="flex flex-col justify-between gap-6 md:flex-row md:items-center animate-slide-in-right">
				<div className="space-y-3">
					<h1 className="text-6 font-bold bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] bg-clip-text text-transparent">
						AmpFlow Dashboard
					</h1>
					<p className="text-3 text-gray-a8 max-w-2xl">
						Upload, schedule, and monitor your Instagram posts. Powered by Appwrite automations and Whop entitlements.
					</p>
					{user ? (
						<div className="flex flex-wrap items-center gap-3 text-3">
							<Badge variant="success" className="badge-gradient-success">
								Plan: {user.planTier}
							</Badge>
							<span className="text-gray-a7">Whop user ID: {user.whopUserId}</span>
						</div>
					) : null}
				</div>
				<a
					className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-a6 px-4 text-3 text-gray-11 transition hover:bg-gray-a3 hover:border-[#DD2F6E] hover:text-[#DD2F6E] hover:shadow-md"
					href="https://developers.facebook.com/docs/instagram-api"
					target="_blank"
					rel="noreferrer"
				>
					<svg width="16" height="16" className="mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor" />
					</svg>
					Instagram API docs
				</a>
			</section>

			{error ? (
				<div className="flex items-center gap-2 rounded-xl border border-red-6 bg-red-2 px-4 py-3 text-red-11 animate-fade-in">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
					</svg>
					{error}
				</div>
			) : null}

			<section className="grid gap-4 sm:grid-cols-3">
				<StatCard
					label="Total posts"
					value={totalPosts}
					trend={posts.length > 0 ? `+${posts.length} lifetime` : ""}
					gradient="primary"
					percentage={posts.length > 0 ? "+100%" : ""}
					icon={
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor" />
						</svg>
					}
				/>
				<StatCard
					label="Scheduled"
					value={scheduledCount}
					trend={scheduledCount > 0 ? "Queued" : "No posts queued"}
					gradient="warning"
					percentage={scheduledCount > 0 ? `${scheduledCount}` : ""}
					icon={
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor" />
							<path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor" />
						</svg>
					}
				/>
				<StatCard
					label="Success rate"
					value={`${successRate}%`}
					trend={`${successCount} published`}
					gradient="success"
					percentage={successRate > 0 ? `${successRate}%` : ""}
					icon={
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
						</svg>
					}
				/>
			</section>

			<section className="space-y-4">
				<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-4 font-semibold text-gray-12">Connections & automations</h2>
						<p className="text-3 text-gray-a8">
							Link your platforms so new uploads can fan out automatically.
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							void refreshConnections();
							void refreshAutomations();
						}}
						isLoading={isRefreshingConnections || isRefreshingAutomations}
						disabled={isRefreshingConnections || isRefreshingAutomations}
					>
						Refresh status
					</Button>
				</header>

				<div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
					{connectionCards.map(({ platform, details, connections: platformConnections }) => {
						const isComingSoon = platform === "telegram";
						const hasConnection = platformConnections.length > 0;
						return (
							<Card key={platform} title={details.title} variant={hasConnection ? "default" : "flat"}>
								<p className="text-3 text-gray-a8">{details.description}</p>
								{hasConnection ? (
									<div className="space-y-3">
										{platformConnections.map((connection) => {
											const subtitle = getConnectionSubtitle(connection);
											const status = (connection.status ?? "connected").toString();
											return (
												<div
													key={connection.$id}
													className="flex items-center justify-between gap-4 rounded-xl border border-gray-a5 bg-gray-a2 px-3 py-2"
												>
													<div className="space-y-1">
														<p className="text-4 font-medium text-gray-12">{connection.username ?? details.title}</p>
														<div className="flex flex-wrap items-center gap-2">
															<Badge variant={getStatusVariant(status)} dot>
																{status}
															</Badge>
															{subtitle ? <span className="text-2 text-gray-a7">{subtitle}</span> : null}
														</div>
													</div>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDisconnect(connection.$id)}
														disabled={isRefreshingConnections}
													>
														Disconnect
													</Button>
												</div>
											);
										})}
									</div>
								) : (
									<div className="space-y-3">
										<p className="text-3 text-gray-a7">
											You haven&apos;t connected {details.title.toLowerCase()} yet.
										</p>
										<Button
											variant={isComingSoon ? "outline" : "gradient"}
											size="sm"
											onClick={() => handleConnect(platform)}
											disabled={isRefreshingConnections || isComingSoon}
										>
											{isComingSoon ? "Coming soon" : details.cta}
										</Button>
										{isComingSoon ? (
											<p className="text-2 text-gray-a7">
												Telegram broadcasting is on the roadmap.
											</p>
										) : null}
									</div>
								)}
							</Card>
						);
					})}
				</div>

				<Card title="Automation status" variant={activeAutomations.length > 0 ? "gradient" : "default"} gradient={activeAutomations.length > 0 ? "info" : undefined}>
					<div className="space-y-3 text-3">
						<p>
							{activeAutomations.length > 0
								? `${activeAutomations.length} automation${activeAutomations.length > 1 ? "s" : ""} active.`
								: "Set up your first automation to distribute videos the moment they go live."}
						</p>
						{activeAutomations.length > 0 && lastAutomationTriggered ? (
							<p className="text-2 text-gray-a7">
								Last triggered {formatRelativeTime(lastAutomationTriggered)}
							</p>
						) : null}
					</div>
					<div className="flex flex-wrap gap-3">
						<Button
							variant={activeAutomations.length > 0 ? "outline" : "gradient"}
							size="sm"
							onClick={() => {
								if (typeof window !== "undefined") {
									window.location.href = "/dashboard/automations";
								}
							}}
						>
							{activeAutomations.length > 0 ? "Manage automations" : "Create your first automation"}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								void refreshAutomations();
							}}
							isLoading={isRefreshingAutomations}
							disabled={isRefreshingAutomations}
						>
							Refresh automations
						</Button>
					</div>
				</Card>
			</section>

			<section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
				<div className="animate-fade-in">
					<UploadForm planTier={user?.planTier} timezone={user?.timezone} />
				</div>
				<Card title="📌 Posting tips" hover className="animate-slide-in-right">
					<ul className="space-y-3 text-3 text-gray-a7">
						<li className="flex items-start gap-2">
							<span className="text-[#DD2F6E] font-bold">•</span>
							<span>Instagram captions are limited to 2,200 characters.</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-[#DD2F6E] font-bold">•</span>
							<span>Use MP4 videos under 200MB for the smoothest uploads.</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-[#DD2F6E] font-bold">•</span>
							<span>Scheduling works best with an Instagram business account linked to Facebook.</span>
						</li>
					</ul>
				</Card>
			</section>

			<section className="grid gap-8 lg:grid-cols-2">
				<div className="animate-fade-in">
					<PostsTable
						title="📅 Upcoming posts"
						posts={upcomingPosts}
						emptyMessage="No scheduled posts yet. Schedule one to see it here."
						onViewLogs={(post) => setSelectedPost(post)}
					/>
				</div>
				<div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
					<PostsTable
						title="📊 Recent activity"
						posts={publishedPosts}
						emptyMessage="Publish your first Instagram post to fill this timeline."
						onViewLogs={(post) => setSelectedPost(post)}
					/>
				</div>
			</section>

			<div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
				<LogsTable
					logs={logs}
					onRefresh={selectedPost ? () => fetchLogs(selectedPost.$id) : undefined}
					title="📋 Logs"
					emptyMessage={selectedPost ? "No logs for this post yet." : "Select a post to inspect its logs."}
					selectedPostCaption={selectedPost?.caption}
				/>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center gap-2 text-3 text-gray-a7 animate-pulse">
					<div className="sk-bounce sk-bounce1" />
					<div className="sk-bounce sk-bounce2" />
					<div className="sk-bounce sk-bounce3" />
					<span>Loading dashboard…</span>
				</div>
			) : null}

			<PreviewModal />
		</main>
	);
}
