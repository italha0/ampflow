import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { authenticateRequest, AuthenticationError } from "@/lib/auth";
import { appwriteAdmin } from "@/lib/appwrite";
import type { ApiError, LogEntry } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<LogEntry[] | ApiError>> {
	try {
		const { appwriteUser } = await authenticateRequest(request);
		const { databases, databaseId, collections } = appwriteAdmin;

		const url = new URL(request.url);
		const postId = url.searchParams.get("postId");

		let postIds: string[] = [];

		if (postId) {
			const { total } = await databases.listDocuments(
				databaseId,
				collections.posts,
				[
					Query.equal("$id", [postId]),
					Query.equal("userId", [appwriteUser.$id]),
					Query.limit(1),
				],
			);

			if (total === 0) {
				return NextResponse.json({ error: "Post not found" }, { status: 404 });
			}

			postIds = [postId];
		} else {
			const { documents } = await databases.listDocuments(
				databaseId,
				collections.posts,
				[
					Query.equal("userId", [appwriteUser.$id]),
					Query.orderDesc("$createdAt"),
					Query.limit(100),
				],
			);

			postIds = documents.map((doc) => doc.$id);

			if (postIds.length === 0) {
				return NextResponse.json([]);
			}
		}

		const logQueries = [Query.orderDesc("timestamp"), Query.limit(200), Query.equal("postId", postIds)];
		const { documents: logs } = await databases.listDocuments(
			databaseId,
			collections.logs,
			logQueries,
		);

		const normalized = logs as unknown as LogEntry[];
		return NextResponse.json(normalized);
	} catch (error) {
		if (error instanceof AuthenticationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error("Failed to fetch logs", error);
		return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
	}
}
