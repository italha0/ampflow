import { NextRequest, NextResponse } from "next/server";
import { getAppwriteClient } from "@/lib/appwrite";
import { databases } from "node-appwrite";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { connectionId: string } }
) {
  try {
    const client = getAppwriteClient();
    const db = new databases.Client(client);
    
    const userId = request.headers.get("x-whop-user-id");
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the connection belongs to the user
    const connection = await db.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_CONNECTIONS_COLLECTION_ID!,
      params.connectionId
    );

    if (connection.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.deleteDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_CONNECTIONS_COLLECTION_ID!,
      params.connectionId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete connection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}