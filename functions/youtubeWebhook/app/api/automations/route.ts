import { NextRequest, NextResponse } from "next/server";
import { getAppwriteClient } from "@/lib/appwrite";
import { databases, Query } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const client = getAppwriteClient();
    const db = new databases.Client(client);
    
    const userId = request.headers.get("x-whop-user-id");
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const automations = await db.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_AUTOMATIONS_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    if (automations.documents.length === 0) {
      return NextResponse.json({ automation: null });
    }

    const automation = automations.documents[0];
    return NextResponse.json({ 
      automation: {
        id: automation.$id,
        userId: automation.userId,
        youtubeConnectionId: automation.youtubeConnectionId,
        targetConnectionIds: automation.targetConnectionIds,
        messageTemplate: automation.messageTemplate,
        isActive: automation.isActive,
      }
    });
  } catch (error) {
    console.error("Failed to fetch automation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = getAppwriteClient();
    const db = new databases.Client(client);
    
    const userId = request.headers.get("x-whop-user-id");
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { youtubeConnectionId, targetConnectionIds, messageTemplate, isActive } = body;

    // Check if automation already exists
    const existing = await db.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_AUTOMATIONS_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    if (existing.documents.length > 0) {
      return NextResponse.json({ error: "Automation already exists" }, { status: 400 });
    }

    const created = await db.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_AUTOMATIONS_COLLECTION_ID!,
      "unique()",
      {
        userId,
        youtubeConnectionId,
        targetConnectionIds,
        messageTemplate,
        isActive: isActive ?? true,
      }
    );

    // Subscribe to YouTube webhook if not already subscribed
    try {
      const youtubeConnection = await db.getDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_CONNECTIONS_COLLECTION_ID!,
        youtubeConnectionId
      );

      await fetch(`${process.env.APPWRITE_FUNCTION_SUBSCRIBE_TO_YOUTUBE}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": process.env.APPWRITE_PROJECT_ID!,
          "X-Appwrite-Key": process.env.APPWRITE_API_KEY!,
        },
        body: JSON.stringify({
          youtubeChannelId: youtubeConnection.channelId,
        }),
      });
    } catch (error) {
      console.error("Failed to subscribe to YouTube:", error);
    }

    return NextResponse.json({ automation: created });
  } catch (error) {
    console.error("Failed to create automation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}