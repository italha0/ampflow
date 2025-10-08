"use client";

import * as React from "react";
import Link from "next/link";
import { DateTime } from "luxon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAmpFlowStore } from "@/store/useAmpFlowStore";
import type { Connection, ConnectionPlatform } from "@/types";

const DEFAULT_TEMPLATE = "🚀 New video drop: {{video_title}}\nWatch now: {{video_url}}";

const PLACEHOLDERS: Array<{ token: string; description: string }> = [
	{ token: "{{video_title}}", description: "Title of the newly published YouTube video" },
	{ token: "{{video_url}}", description: "Public link to watch the video immediately" },
	{ token: "{{channel_name}}", description: "Display name of your connected YouTube channel" },
];

const PLATFORM_COPY: Record<ConnectionPlatform, { label: string; accent: string; background: string; chipText: string }> = {
	youtube: {
		label: "YouTube",
		accent: "text-[#FF0000]",
		background: "bg-[#FF0000]/10",
		chipText: "YT",
	},
	discord: {
		label: "Discord",
		accent: "text-[#5865F2]",
		background: "bg-[#5865F2]/12",
		chipText: "DC",
	},
	telegram: {
		label: "Telegram",
		accent: "text-[#30A8D5]",
		background: "bg-[#30A8D5]/12",
		chipText: "TG",
	},
	whop: {
		label: "Whop",
		accent: "text-[#DD2F6E]",
		background: "bg-[#DD2F6E]/12",
		chipText: "WP",
	},
};

function formatRelative(time?: string | null): string | null {
	if (!time) return null;
	const parsed = DateTime.fromISO(time);
	if (!parsed.isValid) return null;
	return parsed.toRelative({ style: "short" });
}

function ConnectionAvatar({ connection }: { connection: Connection }) {
	const meta = PLATFORM_COPY[connection.platform];
	return (
		<span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${meta.background} ${meta.accent}`}>
			{meta.chipText}
		</span>
	);
}

export function AutomationsClient() {
	const connections = useAmpFlowStore((state) => state.connections);
	const automations = useAmpFlowStore((state) => state.automations);
	const isRefreshingConnections = useAmpFlowStore((state) => state.isRefreshingConnections);
	const isRefreshingAutomations = useAmpFlowStore((state) => state.isRefreshingAutomations);
	const isSavingAutomation = useAmpFlowStore((state) => state.isSavingAutomation);
	const error = useAmpFlowStore((state) => state.error);
	const refreshConnections = useAmpFlowStore((state) => state.refreshConnections);
	const refreshAutomations = useAmpFlowStore((state) => state.refreshAutomations);
	const saveAutomation = useAmpFlowStore((state) => state.saveAutomation);
	const connectPlatform = useAmpFlowStore((state) => state.connectPlatform);

	const [automationId, setAutomationId] = React.useState<string | null>(null);
	const [messageTemplate, setMessageTemplate] = React.useState(DEFAULT_TEMPLATE);
	const [selectedDestinations, setSelectedDestinations] = React.useState<string[]>([]);
	const [isActive, setIsActive] = React.useState(true);
	const [localError, setLocalError] = React.useState<string | null>(null);
	const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

	const youtubeConnection = React.useMemo(
		() => connections.find((connection) => connection.platform === "youtube") ?? null,
		[connections],
	);

	const destinationConnections = React.useMemo(
		() => connections.filter((connection) => connection.platform !== "youtube"),
		[connections],
	);

	const activeAutomation = React.useMemo(() => {
		if (automations.length === 0) return null;
		return [...automations].sort((a, b) => {
			const aTime = DateTime.fromISO(a.updatedAt ?? a.createdAt ?? "").toMillis();
			const bTime = DateTime.fromISO(b.updatedAt ?? b.createdAt ?? "").toMillis();
			return bTime - aTime;
		})[0];
	}, [automations]);

	React.useEffect(() => {
		if (connections.length === 0) {
			void refreshConnections();
		}
	}, [connections.length, refreshConnections]);

	React.useEffect(() => {
		if (automations.length === 0) {
			void refreshAutomations();
		}
	}, [automations.length, refreshAutomations]);

	React.useEffect(() => {
		if (activeAutomation) {
			setAutomationId(activeAutomation.$id);
			setMessageTemplate(activeAutomation.messageTemplate || DEFAULT_TEMPLATE);
			setSelectedDestinations(activeAutomation.targetConnectionIds ?? []);
			setIsActive(activeAutomation.isActive);
		} else {
			setAutomationId(null);
			setMessageTemplate(DEFAULT_TEMPLATE);
			setSelectedDestinations([]);
			setIsActive(true);
		}
		setLocalError(null);
		setSuccessMessage(null);
	}, [activeAutomation]);

	const previewMessage = React.useMemo(() => {
		const channelName = youtubeConnection?.username ?? "Your channel";
		return messageTemplate
			.replace(/{{\s*video_title\s*}}/g, "How we automate launch days")
			.replace(/{{\s*video_url\s*}}/g, "https://youtube.com/watch?v=ampflow")
			.replace(/{{\s*channel_name\s*}}/g, channelName);
	}, [messageTemplate, youtubeConnection?.username]);

	const hasChanges = React.useMemo(() => {
		if (!activeAutomation) {
			return (
				messageTemplate.trim() !== DEFAULT_TEMPLATE.trim() ||
				selectedDestinations.length > 0 ||
				isActive !== true
			);
		}
		return (
			messageTemplate.trim() !== (activeAutomation.messageTemplate ?? "").trim() ||
			isActive !== Boolean(activeAutomation.isActive) ||
			selectedDestinations.slice().sort().join("|") !==
				(activeAutomation.targetConnectionIds ?? []).slice().sort().join("|")
		);
	}, [activeAutomation, isActive, messageTemplate, selectedDestinations]);

	const toggleDestination = React.useCallback((connectionId: string) => {
		setSelectedDestinations((current) => {
			if (current.includes(connectionId)) {
				return current.filter((id) => id !== connectionId);
			}
			return [...current, connectionId];
		});
		setSuccessMessage(null);
	}, []);

	const handleSave = React.useCallback(async () => {
		setLocalError(null);
		setSuccessMessage(null);

		if (!youtubeConnection) {
			setLocalError("Connect a YouTube channel before activating automations.");
			return;
		}

		if (messageTemplate.trim().length === 0) {
			setLocalError("Message template cannot be empty.");
			return;
		}

		try {
			const saved = await saveAutomation({
				automationId,
				youtubeConnectionId: youtubeConnection.$id,
				targetConnectionIds: selectedDestinations,
				messageTemplate,
				isActive,
			});
			setAutomationId(saved.$id);
			setSuccessMessage("Automation updated successfully.");
			await refreshAutomations();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to save automation";
			setLocalError(message);
		}
	}, [automationId, isActive, messageTemplate, refreshAutomations, saveAutomation, selectedDestinations, youtubeConnection]);

	const youtubeStatusBadge = youtubeConnection ? (
		<Badge variant="gradient-success" dot>
			Connected
		</Badge>
	) : (
		<Button size="sm" variant="outline" onClick={() => connectPlatform("youtube")}>Connect YouTube</Button>
	);

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
			<header className="flex flex-col gap-4 border-b border-gray-a4 pb-6">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-sm uppercase tracking-[0.3em] text-[#6de7ff]">Automations</p>
						<h1 className="text-5xl font-semibold text-gray-12">Plan your content ripple once</h1>
					</div>
					<Button variant="ghost" size="sm" onClick={() => {
						void refreshConnections();
						void refreshAutomations();
					}} isLoading={isRefreshingConnections || isRefreshingAutomations}>
						Refresh data
					</Button>
				</div>
				<p className="max-w-3xl text-3 text-gray-a8">
					Decide how AmpFlow reacts the moment your next upload goes live. Customize messages, destinations, and let Whop handle access enforcement.
				</p>
			</header>

			{(error || localError || successMessage) ? (
				<div className="space-y-3">
					{localError ? (
						<div className="flex items-center gap-3 rounded-xl border border-red-6 bg-red-2 px-4 py-3 text-sm text-red-11">
							<span>⚠️</span>
							<span>{localError}</span>
						</div>
					) : null}
					{error && !localError ? (
						<div className="flex items-center gap-3 rounded-xl border border-red-6 bg-red-2 px-4 py-3 text-sm text-red-11">
							<span>⚠️</span>
							<span>{error}</span>
						</div>
					) : null}
					{successMessage ? (
						<div className="flex items-center gap-3 rounded-xl border border-green-6 bg-green-2 px-4 py-3 text-sm text-green-11">
							<span>✅</span>
							<span>{successMessage}</span>
						</div>
					) : null}
				</div>
			) : null}

			<section className="grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
				<Card title="Trigger" containerClassName="h-full">
					<div className="space-y-4">
						<div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-a4 bg-white px-4 py-4 shadow-sm">
							<div className="flex flex-col gap-3">
								<p className="text-xs uppercase tracking-[0.3em] text-gray-a8">When</p>
								<h2 className="text-3xl font-semibold text-gray-12">A new video posts to your YouTube channel</h2>
								<p className="text-3 text-gray-a7">
									AmpFlow listens to the uploads feed and fans out notifications instantly.
								</p>
							</div>
							<div className="flex flex-col items-end gap-2">
								{youtubeConnection ? (
									<div className="flex items-center gap-3">
										<ConnectionAvatar connection={youtubeConnection} />
										<div className="text-right">
											<p className="text-sm font-semibold text-gray-12">{youtubeConnection.username ?? "Connected channel"}</p>
											<p className="text-xs text-gray-a7">Channel ID: {youtubeConnection.channelId ?? youtubeConnection.$id}</p>
										</div>
									</div>
								) : (
									<p className="text-sm text-gray-a7">No channel connected yet.</p>
								)}
								{youtubeStatusBadge}
							</div>
						</div>

						<div className="flex items-center justify-between rounded-2xl border border-gray-a4 bg-gray-a2 px-4 py-4">
							<div>
								<p className="text-sm font-semibold text-gray-12">Automation active</p>
								<p className="text-xs text-gray-a7">Pause anytime to stop new notifications.</p>
							</div>
							<Switch checked={isActive} onCheckedChange={(value) => { setIsActive(value); setSuccessMessage(null); }} />
						</div>

						{activeAutomation?.lastTriggeredAt ? (
							<p className="text-2 text-gray-a7">
								Last triggered {formatRelative(activeAutomation.lastTriggeredAt)}
							</p>
						) : (
							<p className="text-2 text-gray-a7">This automation will trigger after your next upload.</p>
						)}
					</div>
				</Card>

				<Card title="Message template" containerClassName="h-full">
					<div className="space-y-4">
						<textarea
							className="h-48 w-full rounded-xl border border-gray-a5 bg-white px-4 py-3 text-3 text-gray-12 shadow-sm outline-none focus:border-[#6de7ff] focus:ring-2 focus:ring-[#6de7ff]/40"
							value={messageTemplate}
							onChange={(event) => {
								setMessageTemplate(event.target.value);
								setSuccessMessage(null);
							}}
							maxLength={500}
						/>
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex flex-wrap gap-3 text-xs text-gray-a7">
								{PLACEHOLDERS.map((placeholder) => (
									<span key={placeholder.token} className="rounded-full bg-gray-a3 px-3 py-1 font-medium text-gray-a10">
										<span className="text-gray-12">{placeholder.token}</span>
										<span className="ml-2 text-gray-a8">{placeholder.description}</span>
									</span>
								))}
							</div>
							<span className="text-xs text-gray-a7">{messageTemplate.length}/500 characters</span>
						</div>

						<div className="rounded-2xl border border-gray-a4 bg-gray-a2 px-4 py-4">
							<p className="text-xs uppercase tracking-[0.3em] text-gray-a7">Preview</p>
							<p className="mt-2 whitespace-pre-line text-sm text-gray-12">{previewMessage}</p>
						</div>
					</div>
				</Card>
			</section>

			<Card title="Destinations" containerClassName="space-y-5">
				<p className="text-3 text-gray-a7">
					Choose where AmpFlow should post. Add new destinations from the dashboard connections section.
				</p>

				<div className="space-y-3">
					{destinationConnections.length === 0 ? (
						<div className="flex items-center justify-between rounded-xl border border-dashed border-gray-a5 bg-gray-a2 px-4 py-4">
							<div>
								<p className="text-sm font-medium text-gray-12">No community destinations connected yet</p>
								<p className="text-xs text-gray-a7">Connect Discord, Telegram, or Whop to enable fan-out</p>
							</div>
							<Button size="sm" variant="gradient" onClick={() => (window.location.href = "/dashboard")}>Add destinations</Button>
						</div>
					) : null}

					{destinationConnections.map((connection) => {
						const isSelected = selectedDestinations.includes(connection.$id);
						const meta = PLATFORM_COPY[connection.platform];
						return (
							<div
								key={connection.$id}
								className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition ${
									isSelected ? "border-[#6de7ff] bg-[#6de7ff]/5" : "border-gray-a4 bg-white"
								}`}
							>
								<div className="flex items-center gap-4">
									<ConnectionAvatar connection={connection} />
									<div>
										<p className="text-sm font-semibold text-gray-12">{connection.username ?? meta.label}</p>
										<p className="text-xs text-gray-a7">{meta.label} • {connection.channelId ?? connection.guildId ?? "Destination"}</p>
										<div className="mt-1 flex items-center gap-2 text-xs text-gray-a7">
											<Badge variant={isSelected ? "gradient-success" : "outline"} dot>{isSelected ? "Enabled" : "Disabled"}</Badge>
											{connection.updatedAt ? <span>Updated {formatRelative(connection.updatedAt)}</span> : null}
										</div>
									</div>
								</div>
								<Switch checked={isSelected} onCheckedChange={() => toggleDestination(connection.$id)} />
							</div>
						);
					})}
				</div>

				<div className="flex flex-col gap-3 rounded-2xl border border-gray-a4 bg-gray-a2 px-4 py-4 text-sm text-gray-a8">
					<p className="font-medium text-gray-12">Need another platform?</p>
					<p>
						Our roadmap includes native Telegram channel posting and webhooks. Tell us what to build next in the Whop community.
					</p>
					<Link href="https://whop.com" className="text-[#6de7ff] underline" target="_blank" rel="noreferrer">
						Drop a feature request
					</Link>
				</div>
			</Card>

			<div className="flex flex-col items-center justify-between gap-4 border-t border-gray-a4 pt-6 sm:flex-row">
				<div className="text-sm text-gray-a7">
					{hasChanges ? "Unsaved changes" : "All changes saved"}
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							if (activeAutomation) {
								setMessageTemplate(activeAutomation.messageTemplate ?? DEFAULT_TEMPLATE);
								setSelectedDestinations(activeAutomation.targetConnectionIds ?? []);
								setIsActive(activeAutomation.isActive);
							} else {
								setMessageTemplate(DEFAULT_TEMPLATE);
								setSelectedDestinations([]);
								setIsActive(true);
							}
							setSuccessMessage(null);
						}}
						disabled={!hasChanges}
					>
						Reset changes
					</Button>
					<Button
						variant="gradient"
						size="sm"
						onClick={() => void handleSave()}
						disabled={isSavingAutomation || !youtubeConnection || !hasChanges}
						isLoading={isSavingAutomation}
					>
						Save automation
					</Button>
				</div>
			</div>
		</div>
	);
}
