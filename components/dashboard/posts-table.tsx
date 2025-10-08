import Image from "next/image";
import { DateTime } from "luxon";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { truncate } from "@/lib/utils";
import type { Post } from "@/types";

interface PostsTableProps {
	title: string;
	emptyMessage: string;
	posts: Post[];
	onViewLogs?: (post: Post) => void;
}

const statusVariant: Record<Post["status"], BadgeVariant> = {
	draft: "outline",
	scheduled: "warning",
	processing: "warning",
	retrying: "warning",
	published: "success",
	failed: "danger",
};

function formatDate(value?: string | null) {
	if (!value) return "—";
	return DateTime.fromISO(value).toLocal().toFormat("MMM dd · HH:mm");
}

export function PostsTable({ title, emptyMessage, posts, onViewLogs }: PostsTableProps) {
	return (
		<Card title={title}>
			{posts.length === 0 ? (
				<p className="text-3 text-gray-a7">{emptyMessage}</p>
			) : (
				<Table>
					<THead>
						<TR>
							<TH className="w-24">Preview</TH>
							<TH>Caption</TH>
							<TH>Status</TH>
							<TH>Scheduled</TH>
							<TH>Published</TH>
							<TH className="text-right">Actions</TH>
						</TR>
					</THead>
					<TBody>
						{posts.map((post) => (
							<TR key={post.$id}>
								<TD>
									<div className="relative aspect-square w-16 overflow-hidden rounded-lg bg-gray-a4">
										<Image
											src={post.mediaUrl}
											alt="Post preview"
											fill
											className="object-cover"
										/>
									</div>
								</TD>
								<TD>
									<p className="text-3 text-gray-12">{truncate(post.caption, 80) || "(No caption)"}</p>
									<p className="text-2 text-gray-a8">{post.mediaType}</p>
								</TD>
								<TD>
									<Badge variant={statusVariant[post.status]}>{post.status}</Badge>
								</TD>
								<TD>{formatDate(post.scheduledAt)}</TD>
								<TD>{formatDate(post.publishedAt)}</TD>
								<TD className="text-right">
									<Button variant="ghost" size="sm" onClick={() => onViewLogs?.(post)}>
										View logs
									</Button>
								</TD>
							</TR>
						))}
					</TBody>
				</Table>
			)}
		</Card>
	);
}
