"use client";

import * as React from "react";
import { DateTime } from "luxon";
import { useAmpFlowStore } from "@/store/useAmpFlowStore";
import type { InstagramPreview, MediaType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface UploadFormProps {
	planTier?: string;
	timezone?: string;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/mov", "video/webm"];

const MAX_CAPTION_LENGTH = 2200;

export function UploadForm({ planTier, timezone = "UTC" }: UploadFormProps) {
	const isPublishing = useAmpFlowStore((state) => state.isPublishing);
	const setPreview = useAmpFlowStore((state) => state.setPreview);
	const publishPost = useAmpFlowStore((state) => state.publishPost);
	const fetchDashboard = useAmpFlowStore((state) => state.fetchDashboard);

	const [caption, setCaption] = React.useState("");
	const [mediaFile, setMediaFile] = React.useState<File | null>(null);
	const [mediaType, setMediaType] = React.useState<MediaType>("IMAGE");
	const [error, setError] = React.useState<string | null>(null);
	const [scheduleEnabled, setScheduleEnabled] = React.useState(false);
	const [scheduleDate, setScheduleDate] = React.useState<string>(
		DateTime.now().setZone(timezone).plus({ hours: 1 }).toISODate() ?? "",
	);
	const [scheduleTime, setScheduleTime] = React.useState<string>(
		DateTime.now().setZone(timezone).plus({ hours: 1 }).toFormat("HH:mm"),
	);

	const schedulingAllowed = planTier === "pro" || planTier === "enterprise";

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setError(null);
		const file = event.target.files?.[0];
		if (!file) {
			setMediaFile(null);
			return;
		}

		if (
			!ACCEPTED_IMAGE_TYPES.includes(file.type) &&
			!ACCEPTED_VIDEO_TYPES.includes(file.type)
		) {
			setError("Unsupported file type. Upload JPEG, PNG, WEBP, GIF, MP4, or MOV.");
			return;
		}

		setMediaFile(file);
		setMediaType(ACCEPTED_VIDEO_TYPES.includes(file.type) ? "VIDEO" : "IMAGE");
	};

	const handlePreview = () => {
		if (!mediaFile) {
			setError("Select an image or video to preview.");
			return;
		}

		const preview: InstagramPreview = {
			caption,
			mediaUrl: URL.createObjectURL(mediaFile),
			mediaType,
		};

		setPreview(preview);
	};

	const computeScheduleIso = () => {
		if (!scheduleEnabled) return undefined;
		const merged = DateTime.fromISO(`${scheduleDate}T${scheduleTime}`, {
			zone: timezone,
		});
		if (!merged.isValid) {
			throw new Error("Invalid schedule date/time");
		}
		return merged.toUTC().toISO();
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		if (!mediaFile) {
			setError("Please choose an image or video.");
			return;
		}

		try {
			const formData = new FormData();
			formData.append("file", mediaFile);
			formData.append("caption", caption);
			formData.append("mediaType", mediaType);

			if (scheduleEnabled) {
				if (!schedulingAllowed) {
					setError("Upgrade your plan to schedule posts.");
					return;
				}

				const scheduleIso = computeScheduleIso();
				if (scheduleIso) {
					formData.append("scheduleAt", scheduleIso);
				}
			}

			await publishPost(formData);
			setCaption("");
			setMediaFile(null);
			setScheduleEnabled(false);
			await fetchDashboard();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to publish post");
		}
	};

	return (
		<Card title="Create Instagram Post" action={
			schedulingAllowed ? null : (
				<Badge variant="warning">Scheduling locked · Upgrade plan</Badge>
			)
		}>
			<form className="space-y-6" onSubmit={handleSubmit}>
				<div className="space-y-2">
					<label className="text-3 font-medium text-gray-11">Media</label>
					<Input type="file" accept="image/*,video/*" onChange={handleFileChange} />
					<p className="text-2 text-gray-a8">
						JPEG, PNG, WEBP, GIF, MP4, MOV up to 25MB.
					</p>
				</div>

				<div className="space-y-2">
					<label className="flex items-center justify-between text-3 font-medium text-gray-11">
						<span>Caption</span>
						<span className="text-2 text-gray-a7">{caption.length}/{MAX_CAPTION_LENGTH}</span>
					</label>
					<Textarea
						value={caption}
						onChange={(event) => setCaption(event.target.value)}
						maxLength={MAX_CAPTION_LENGTH}
						rows={6}
						placeholder="Tell your story..."
					/>
				</div>

				<div className="flex items-center justify-between rounded-xl border border-gray-a4 bg-gray-a2 px-4 py-3">
					<div>
						<p className="text-3 font-semibold text-gray-12">Schedule later</p>
						<p className="text-2 text-gray-a8">
							Choose a date and time in {timezone}. We&apos;ll post it automatically.
						</p>
					</div>
					<Switch
						checked={scheduleEnabled && schedulingAllowed}
						onCheckedChange={(value) => setScheduleEnabled(value && schedulingAllowed)}
						className={schedulingAllowed ? undefined : "opacity-50"}
						disabled={!schedulingAllowed}
					/>
				</div>

				{scheduleEnabled && schedulingAllowed ? (
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<label className="text-3 font-medium text-gray-11">Date</label>
							<Input
								type="date"
								value={scheduleDate}
								onChange={(event) => setScheduleDate(event.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-3 font-medium text-gray-11">Time</label>
							<Input
								type="time"
								value={scheduleTime}
								onChange={(event) => setScheduleTime(event.target.value)}
							/>
						</div>
					</div>
				) : null}

				{error ? <p className="text-3 text-red-10">{error}</p> : null}

				<div className="flex flex-wrap items-center justify-between gap-3">
					<Button type="button" variant="outline" onClick={handlePreview}>
						Preview
					</Button>
					<Button type="submit" isLoading={isPublishing}>
						{scheduleEnabled && schedulingAllowed ? "Schedule post" : "Publish now"}
					</Button>
				</div>
			</form>
		</Card>
	);
}
