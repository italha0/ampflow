import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { parseString } from "xml2js";
import { getAppwriteClient } from "@/lib/appwrite";
import { databases, query } from "node-appwrite";

// YouTube webhook verification token
const YOUTUBE_WEBHOOK_SECRET = process.env.YOUTUBE_WEBHOOK_SECRET || "ampflow-webhook-secret";

export async function GET(request: NextRequest) {
  // Handle YouTube webhook verification
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = searchParams.get("hub.verify_token");

  if (mode === "subscribe" && verifyToken === YOUTUBE_WEBHOOK_SECRET) {
    console.log("YouTube webhook verification successful");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Parse XML feed
    const feed = await new Promise<any>((resolve, reject) => {
      parseString(body, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log("YouTube webhook received:", JSON.stringify(feed, null, 2));

    // Extract video information from feed
    const entries = feed?.feed?.entry || [];
    
    for (const entry of entries) {
      const videoId = entry["yt:videoId"]?.[0];
      const channelId = entry["yt:channelId"]?.[0];
      const title = entry.title?.[0];
      const published = entry.published?.[0];
      const updated = entry.updated?.[0];

      if (!videoId || !channelId) {
        console.warn("Missing video or channel ID in webhook");
        continue;
      }

      console.log(`Processing new video: ${title} (${videoId}) from channel ${channelId}`);

      // Find automations for this channel
      const client = getAppwriteClient();
      const db = new databases.Client(client);

      try {
        const automations = await db.listDocuments(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_AUTOMATIONS_COLLECTION_ID!,
          [
            query.equal("youtubeChannelId", channelId),
            query.equal("enabled", true)
          ]
        );

        console.log(`Found ${automations.total} automations for channel ${channelId}`);

        // Process each automation
        for (const automation of automations.documents) {
          try {
            // Get user connections
            const connections = await db.listDocuments(
              process.env.APPWRITE_DATABASE_ID!,
              process.env.APPWRITE_CONNECTIONS_COLLECTION_ID!,
              [
                query.equal("userId", automation.userId),
                query.equal("enabled", true)
              ]
            );

            // Create distribution job
            const jobData = {
              userId: automation.userId,
              automationId: automation.$id,
              videoId,
              channelId,
              title,
              published,
              updated,
              messageTemplate: automation.messageTemplate,
              targetPlatforms: automation.targetPlatforms,
              connections: connections.documents.map(conn => ({
                platform: conn.platform,
                connectionId: conn.$id,
                channelId: conn.channelId,
                accessToken: conn.accessToken,
                refreshToken: conn.refreshToken,
                botToken: conn.botToken
              })),
              status: "pending",
              createdAt: new Date().toISOString()
            };

            await db.createDocument(
              process.env.APPWRITE_DATABASE_ID!,
              process.env.APPWRITE_JOBS_COLLECTION_ID!,
              "unique()",
              jobData
            );

            console.log(`Created distribution job for automation ${automation.$id}`);

          } catch (error) {
            console.error(`Failed to process automation ${automation.$id}:`, error);
          }
        }

      } catch (error) {
        console.error(`Failed to find automations for channel ${channelId}:`, error);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("YouTube webhook processing failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}