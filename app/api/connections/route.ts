import { NextRequest, NextResponse } from "next/server";
import { Query, type Models } from "node-appwrite";
import { appwriteAdmin } from "@/lib/appwrite";
import { authenticateRequest, AuthenticationError } from "@/lib/auth";
import type { Connection, ConnectionPlatform } from "@/types";

type ConnectionDocument = Models.Document & {
	platform: ConnectionPlatform;
	username?: string | null;
	channelId?: string | null;
	guildId?: string | null;
	status?: string | null;
	scope?: string | null;
	metadata?: Record<string, unknown> | null;
	createdAt?: string;
	updatedAt?: string;
};

function sanitizeConnection(document: ConnectionDocument): Connection {
	return {
		$id: document.$id,
		platform: document.platform,
		username: document.username ?? null,
		channelId: document.channelId ?? null,
		guildId: document.guildId ?? null,
		status: document.status ?? null,
		scope: document.scope ?? null,
		metadata: document.metadata ?? null,
		createdAt: document.createdAt ?? document.$createdAt,
		updatedAt: document.updatedAt ?? document.$updatedAt,
	};
}

export async function GET(request: NextRequest) {
	try {
		const { appwriteUser } = await authenticateRequest(request);
		const { databases, databaseId, collections } = appwriteAdmin;

		const { documents } = await databases.listDocuments<ConnectionDocument>(
			databaseId,
			collections.connections,
			[Query.equal("userId", [appwriteUser.$id])],
		);

		const payload = documents.map((doc) => sanitizeConnection(doc));
		return NextResponse.json(payload satisfies Connection[]);
	} catch (error) {
		if (error instanceof AuthenticationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error("Failed to list connections", error);
		return NextResponse.json({ error: "Failed to list connections" }, { status: 500 });
	}
}
