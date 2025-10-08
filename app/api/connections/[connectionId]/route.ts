import { NextRequest, NextResponse } from "next/server";
import type { Models } from "node-appwrite";
import { appwriteAdmin } from "@/lib/appwrite";
import { authenticateRequest, AuthenticationError } from "@/lib/auth";
import type { ConnectionPlatform } from "@/types";

interface Params {
	connectionId: string;
}

type ConnectionDocument = Models.Document & {
	userId: string;
	platform: ConnectionPlatform;
	username?: string | null;
	channelId?: string | null;
	guildId?: string | null;
	status?: string | null;
	scope?: string | null;
	metadata?: Record<string, unknown> | null;
};

export async function DELETE(request: NextRequest, context: { params: Params }) {
	const { connectionId } = context.params;

	if (!connectionId) {
		return NextResponse.json({ error: "Missing connection identifier" }, { status: 400 });
	}

	try {
		const { appwriteUser } = await authenticateRequest(request);
		const { databases, databaseId, collections } = appwriteAdmin;

		const document = await databases.getDocument<ConnectionDocument>(
			databaseId,
			collections.connections,
			connectionId,
		);

		if (document.userId !== appwriteUser.$id) {
			throw new AuthenticationError("You do not have access to this connection", 403);
		}

		await databases.deleteDocument(databaseId, collections.connections, connectionId);

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof AuthenticationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 404) {
			return NextResponse.json({ error: "Connection not found" }, { status: 404 });
		}

		console.error("Failed to delete connection", error);
		return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 });
	}
}
