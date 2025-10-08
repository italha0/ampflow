import { NextRequest, NextResponse } from "next/server";
import { getAppwriteClient } from "@/lib/appwrite";
import { databases, Query } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const client = getAppwriteClient();
    const db = new databases.Client(client);
    
    // Get user ID from headers (set by Whop middleware)
    const userId = request.headers.get("x-whop-user-id");
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await db.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_CONNECTIONS_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    return NextResponse.json({ 
      connections: connections.documents.map(doc => ({
        id: doc.$id,
        platform: doc.platform,
        username: doc.username,
        channelId: doc.channelId,
        isConnected: true,
        accessToken: doc.accessToken,
        refreshToken: doc.refreshToken,
        botToken: doc.botToken,
      }))
    });
  } catch (error) {
    console.error("Failed to fetch connections:", error);
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
    const { platform, username, channelId, accessToken, refreshToken, botToken } = body;

    // Check if connection already exists
    const existing = await db.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_CONNECTIONS_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.equal("platform", platform)
      ]
    );

    if (existing.documents.length > 0) {
      // Update existing connection
      const updated = await db.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_CONNECTIONS_COLLECTION_ID!,
        existing.documents[0].$id,
        {
          username,
          channelId,
          accessToken,
          refreshToken,
          botToken,
        }
      );

      return NextResponse.json({ connection: updated });
    } else {
      // Create new connection
      const created = await db.createDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_CONNECTIONS_COLLECTION_ID!,
        "unique()",
        {
          userId,
          platform,
          username,
          channelId,
          accessToken,
          refreshToken,
          botToken,
        }
      );

      return NextResponse.json({ connection: created });
    }
  } catch (error) {
    console.error("Failed to create connection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}