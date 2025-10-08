import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { authenticateRequest, AuthenticationError } from "@/lib/auth";
import { appwriteAdmin } from "@/lib/appwrite";
import { env } from "@/lib/env";
import type { ApiError, Post, PublishResponse } from "@/types";

async function listPosts(request: NextRequest): Promise<NextResponse<Post[] | ApiError>> {
	try {
		const { appwriteUser } = await authenticateRequest(request);
		const { databases, databaseId, collections } = appwriteAdmin;

		const { documents } = await databases.listDocuments(
			databaseId,
			collections.posts,
			[
				Query.equal("userId", [appwriteUser.$id]),
				Query.orderDesc("$createdAt"),
				Query.limit(100),
			],
		);

		return NextResponse.json(documents as unknown as Post[]);
	} catch (error) {
		if (error instanceof AuthenticationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error("Failed to list posts", error);
		return NextResponse.json({ error: "Failed to list posts" }, { status: 500 });
	}
}

async function publishPost(request: NextRequest): Promise<NextResponse<PublishResponse | ApiError>> {
	let uploadedFileId: string | null = null;
	let shouldCleanupUpload = false;

	try {
		const { appwriteUser, planTier } = await authenticateRequest(request);
		const formData = await request.formData();

		const file = formData.get("file");
		if (!(file instanceof File)) {
			return NextResponse.json({ error: "Missing file" }, { status: 400 });
		}

		const caption = (formData.get("caption") ?? "").toString();
		const mediaType = (formData.get("mediaType") ?? "IMAGE").toString();
		const scheduleAt = formData.get("scheduleAt")?.toString();

		if (!mediaType || (mediaType !== "IMAGE" && mediaType !== "VIDEO")) {
			return NextResponse.json({ error: "Invalid media type" }, { status: 400 });
		}

		if (scheduleAt && planTier === "free") {
			return NextResponse.json({ error: "Upgrade plan to schedule posts" }, { status: 403 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const bucketId = env.appwriteMediaBucketId();
		const fileName = file.name || `upload-${Date.now()}`;

		const uploaded = await appwriteAdmin.storage.createFile(
			bucketId,
			ID.unique(),
			InputFile.fromBuffer(buffer, fileName),
		);

		uploadedFileId = uploaded.$id;

		const endpoint = env.appwriteEndpoint();
		const mediaUrl = new URL(
			`storage/buckets/${bucketId}/files/${uploadedFileId}/view?project=${env.appwriteProjectId()}`,
			endpoint.endsWith("/") ? endpoint : `${endpoint}/`,
		).toString();

		const payload = {
			userId: appwriteUser.$id,
			mediaUrl,
			mediaType,
			caption,
			scheduleTime: scheduleAt ?? null,
		};

		const execution = await appwriteAdmin.functions.createExecution(
			env.appwritePostFunctionId(),
			JSON.stringify(payload),
		);

		type ExecutionMetadata = {
			status?: string;
			response?: string;
			responseBody?: string;
			stderr?: string;
		};

		const executionInfo = execution as ExecutionMetadata;
		const rawResponse = executionInfo.response ?? executionInfo.responseBody ?? null;
		let parsed: PublishResponse | ApiError | null = null;
		if (typeof rawResponse === "string" && rawResponse.length > 0) {
			try {
				parsed = JSON.parse(rawResponse);
			} catch (parseError) {
				console.error("Failed to parse execution response", parseError);
			}
		}

		if (executionInfo.status !== "completed") {
			const message =
				(parsed && "error" in parsed && parsed.error) ||
				executionInfo.stderr ||
				"Post function execution failed";
			throw new Error(message);
		}

		if (!parsed || ("error" in parsed && parsed.error)) {
			throw new Error(parsed?.error ?? "Post function returned an error");
		}

		return NextResponse.json(parsed);
	} catch (error) {
		if (!(error instanceof AuthenticationError)) {
			shouldCleanupUpload = true;
		}
		if (error instanceof AuthenticationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error("Failed to publish post", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to publish post" }, { status: 500 });
	} finally {
		if (uploadedFileId && shouldCleanupUpload) {
			try {
				await appwriteAdmin.storage.deleteFile(env.appwriteMediaBucketId(), uploadedFileId);
			} catch (cleanupError) {
				console.warn("Failed to cleanup uploaded file", cleanupError);
			}
		}
	}
}

export async function GET(request: NextRequest) {
	return listPosts(request);
}

export async function POST(request: NextRequest) {
	return publishPost(request);
}
