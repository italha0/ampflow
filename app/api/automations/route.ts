import { NextRequest, NextResponse } from "next/server";
import { ID, Query, type Models } from "node-appwrite";
import { appwriteAdmin } from "@/lib/appwrite";
import { authenticateRequest, AuthenticationError } from "@/lib/auth";
import type { Automation, ConnectionPlatform } from "@/types";

type AutomationDocument = Models.Document & {
	userId: string;
	youtubeConnectionId: string;
	targetConnectionIds: string[];
	messageTemplate: string;
	isActive: boolean;
	lastTriggeredAt?: string | null;
	createdAt?: string;
	updatedAt?: string;
};

function sanitizeAutomation(document: AutomationDocument): Automation {
	return {
		$id: document.$id,
		userId: document.userId,
		youtubeConnectionId: document.youtubeConnectionId,
		targetConnectionIds: document.targetConnectionIds ?? [],
		messageTemplate: document.messageTemplate ?? "",
		isActive: Boolean(document.isActive),
		lastTriggeredAt: document.lastTriggeredAt ?? null,
		createdAt: document.createdAt ?? document.$createdAt,
		updatedAt: document.updatedAt ?? document.$updatedAt,
	};
}

export async function GET(request: NextRequest) {
	try {
		const { appwriteUser } = await authenticateRequest(request);
		const { databases, databaseId, collections } = appwriteAdmin;

		const { documents } = await databases.listDocuments<AutomationDocument>(
			databaseId,
			collections.automations,
			[Query.equal("userId", [appwriteUser.$id])],
		);

		const payload = documents.map((doc) => sanitizeAutomation(doc));
		return NextResponse.json(payload satisfies Automation[]);
	} catch (error) {
		if (error instanceof AuthenticationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error("Failed to list automations", error);
		return NextResponse.json({ error: "Failed to list automations" }, { status: 500 });
	}
}

type SaveAutomationPayload = {
	automationId?: string | null;
	youtubeConnectionId: string;
	targetConnectionIds: string[];
	messageTemplate: string;
	isActive: boolean;
};

type ConnectionDocument = Models.Document & {
	userId: string;
	platform: ConnectionPlatform;
	targetConnectionIds?: string[];
};

const SUPPORTED_DESTINATIONS: ConnectionPlatform[] = ["discord", "telegram", "whop"];

export async function POST(request: NextRequest) {
	try {
		const payload = (await request.json()) as SaveAutomationPayload;
		const { automationId, youtubeConnectionId, targetConnectionIds, messageTemplate, isActive } = payload;

		if (!youtubeConnectionId) {
			return NextResponse.json({ error: "You must connect a YouTube channel before saving." }, { status: 400 });
		}

		if (!messageTemplate || messageTemplate.trim().length === 0) {
			return NextResponse.json({ error: "Automation message template cannot be empty." }, { status: 400 });
		}

		const { appwriteUser } = await authenticateRequest(request);
		const { databases, databaseId, collections } = appwriteAdmin;

		const youtubeConnection = await databases.getDocument<ConnectionDocument>(
			databaseId,
			collections.connections,
			youtubeConnectionId,
		);

		if (youtubeConnection.userId !== appwriteUser.$id || youtubeConnection.platform !== "youtube") {
			return NextResponse.json({ error: "Invalid YouTube connection selection." }, { status: 403 });
		}

		const uniqueTargetIds = Array.from(new Set(targetConnectionIds ?? [])).filter(Boolean);
		let destinationConnections: ConnectionDocument[] = [];

		if (uniqueTargetIds.length > 0) {
			const { documents } = await databases.listDocuments<ConnectionDocument>(
				databaseId,
				collections.connections,
				[Query.equal("$id", uniqueTargetIds)],
			);

			destinationConnections = documents.filter((doc) => doc.userId === appwriteUser.$id);

			const invalidDestinations = destinationConnections.filter(
				(connection) => !SUPPORTED_DESTINATIONS.includes(connection.platform),
			);

			if (invalidDestinations.length > 0) {
				return NextResponse.json({ error: "One or more destinations are not supported for automations." }, { status: 400 });
			}

			const resolvedIds = destinationConnections.map((doc) => doc.$id);
			const missingIds = uniqueTargetIds.filter((id) => !resolvedIds.includes(id));

			if (missingIds.length > 0) {
				return NextResponse.json({ error: "One or more selected destinations could not be found." }, { status: 404 });
			}
		}

		const now = new Date().toISOString();
		const automationData = {
			youtubeConnectionId,
			targetConnectionIds: uniqueTargetIds,
			messageTemplate: messageTemplate.trim(),
			isActive: Boolean(isActive),
			updatedAt: now,
		};

		let document: AutomationDocument;

		if (automationId) {
			const existing = await databases.getDocument<AutomationDocument>(
				databaseId,
				collections.automations,
				automationId,
			);

			if (existing.userId !== appwriteUser.$id) {
				return NextResponse.json({ error: "You do not have access to this automation." }, { status: 403 });
			}

			document = await databases.updateDocument(
				databaseId,
				collections.automations,
				automationId,
				automationData,
			) as AutomationDocument;
		} else {
			document = await databases.createDocument(
				databaseId,
				collections.automations,
				ID.unique(),
				{
					userId: appwriteUser.$id,
					createdAt: now,
					...automationData,
				},
			) as AutomationDocument;
		}

		return NextResponse.json(sanitizeAutomation(document));
	} catch (error) {
		if (error instanceof AuthenticationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error("Failed to save automation", error);
		return NextResponse.json({ error: "Failed to save automation" }, { status: 500 });
	}
}
