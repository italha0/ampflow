"use client";

import Image from "next/image";
import { useAmpFlowStore } from "@/store/useAmpFlowStore";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function PreviewModal() {
	const preview = useAmpFlowStore((state) => state.preview);
	const setPreview = useAmpFlowStore((state) => state.setPreview);

	if (!preview) return null;

	const isVideo = preview.mediaType === "VIDEO";

	return (
		<Modal
			open={Boolean(preview)}
			onOpenChange={(open) => {
				if (!open) {
					setPreview(null);
				}
			}}
			title="Instagram preview"
			description="Here's how your post will appear on the feed."
			actions={
				<Button variant="outline" onClick={() => setPreview(null)}>
					Close
				</Button>
			}
		>
			<div className="space-y-4">
				<div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-a3">
					{isVideo ? (
						<video className="h-full w-full object-cover" controls src={preview.mediaUrl} />
					) : (
						<Image
							src={preview.mediaUrl}
							alt="Preview"
							fill
							className="object-cover"
						/>
					)}
				</div>
				<p className="whitespace-pre-line text-3 text-gray-11">{preview.caption || "(No caption)"}</p>
			</div>
		</Modal>
	);
}
