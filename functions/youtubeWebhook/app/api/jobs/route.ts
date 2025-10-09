import { NextRequest, NextResponse } from "next/server";
import { getAppwriteClient } from "@/lib/appwrite";
import { databases, query } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get("x-whop-user-id");
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getAppwriteClient();
    const db = new databases.Client(client);

    // Get user's automations first
    const automations = await db.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_AUTOMATIONS_COLLECTION_ID!,
      [
        query.equal("userId", userId)
      ]
    );

    if (automations.total === 0) {
      return NextResponse.json({ jobs: [] });
    }

    // Get jobs for all user's automations
    const automationIds = automations.documents.map(a => a.$id);
    
    const jobs = await db.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_JOBS_COLLECTION_ID!,
      [
        query.equal("automationId", automationIds),
        query.orderDesc("createdAt"),
        query.limit(50)
      ]
    );

    return NextResponse.json({ 
      jobs: jobs.documents.map(job => ({
        $id: job.$id,
        title: job.title,
        videoId: job.videoId,
        status: job.status,
        targetPlatforms: job.targetPlatforms,
        results: job.results || [],
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        error: job.error
      }))
    });

  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}