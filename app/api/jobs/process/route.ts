import { NextRequest, NextResponse } from "next/server";
import { getAppwriteClient } from "@/lib/appwrite";
import { databases, query } from "node-appwrite";

// Process pending distribution jobs
export async function GET(request: NextRequest) {
  try {
    const client = getAppwriteClient();
    const db = new databases.Client(client);

    // Get pending jobs
    const jobs = await db.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_JOBS_COLLECTION_ID!,
      [
        query.equal("status", "pending"),
        query.orderAsc("createdAt"),
        query.limit(10)
      ]
    );

    console.log(`Processing ${jobs.total} pending jobs`);

    const results = [];

    for (const job of jobs.documents) {
      try {
        // Update job status to processing
        await db.updateDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_JOBS_COLLECTION_ID!,
          job.$id,
          { status: "processing" }
        );

        const jobResults = [];

        // Process each target platform
        for (const platform of job.targetPlatforms) {
          try {
            const connection = job.connections.find((conn: any) => conn.platform === platform);
            if (!connection) {
              jobResults.push({
                platform,
                success: false,
                error: "No connection found"
              });
              continue;
            }

            // Format message with template
            const message = formatMessage(job.messageTemplate, {
              title: job.title,
              videoId: job.videoId,
              channelId: job.channelId,
              published: job.published
            });

            // Distribute to platform
            const result = await distributeToPlatform(platform, {
              message,
              videoId: job.videoId,
              title: job.title,
              connection
            });

            jobResults.push({
              platform,
              success: result.success,
              error: result.error,
              response: result.response
            });

          } catch (error) {
            console.error(`Failed to distribute to ${platform}:`, error);
            jobResults.push({
              platform,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error"
            });
          }
        }

        // Update job status and results
        const successCount = jobResults.filter(r => r.success).length;
        const finalStatus = successCount === job.targetPlatforms.length ? "completed" : 
                           successCount > 0 ? "partial" : "failed";

        await db.updateDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_JOBS_COLLECTION_ID!,
          job.$id,
          {
            status: finalStatus,
            results: jobResults,
            completedAt: new Date().toISOString()
          }
        );

        results.push({
          jobId: job.$id,
          status: finalStatus,
          results: jobResults
        });

      } catch (error) {
        console.error(`Failed to process job ${job.$id}:`, error);
        
        // Update job to failed
        await db.updateDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_JOBS_COLLECTION_ID!,
          job.$id,
          {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
            completedAt: new Date().toISOString()
          }
        );

        results.push({
          jobId: job.$id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error("Job processing failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

function formatMessage(template: string, data: any): string {
  return template
    .replace(/\{\{title\}\}/g, data.title || "")
    .replace(/\{\{videoId\}\}/g, data.videoId || "")
    .replace(/\{\{channelId\}\}/g, data.channelId || "")
    .replace(/\{\{published\}\}/g, data.published ? new Date(data.published).toLocaleDateString() : "")
    .replace(/\{\{videoUrl\}\}/g, data.videoId ? `https://youtube.com/watch?v=${data.videoId}` : "");
}

async function distributeToPlatform(platform: string, data: any): Promise<any> {
  switch (platform) {
    case "discord":
      return distributeToDiscord(data);
    case "telegram":
      return distributeToTelegram(data);
    case "whop":
      return distributeToWhop(data);
    default:
      return { success: false, error: "Unsupported platform" };
  }
}

async function distributeToDiscord(data: any): Promise<any> {
  try {
    const { message, videoId, title, connection } = data;
    
    // Discord webhook URL format
    const webhookUrl = `https://discord.com/api/webhooks/${connection.channelId}/${connection.accessToken}`;
    
    const embed = {
      title: title,
      description: message,
      url: `https://youtube.com/watch?v=${videoId}`,
      color: 0xff0000, // YouTube red
      timestamp: new Date().toISOString(),
      author: {
        name: "New YouTube Video",
        icon_url: "https://www.youtube.com/favicon.ico"
      },
      thumbnail: {
        url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
        content: message
      })
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return { success: true, response: await response.json() };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Discord distribution failed" };
  }
}

async function distributeToTelegram(data: any): Promise<any> {
  try {
    const { message, videoId, connection } = data;
    
    // Telegram bot API
    const botToken = connection.botToken;
    const chatId = connection.channelId;
    const videoUrl = `https://youtube.com/watch?v=${videoId}`;
    
    // Send message with video link
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `${message}\n\n${videoUrl}`,
        parse_mode: "HTML",
        disable_web_page_preview: false
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return { success: true, response: await response.json() };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Telegram distribution failed" };
  }
}

async function distributeToWhop(data: any): Promise<any> {
  try {
    const { message, videoId, title, connection } = data;
    
    // Whop community post
    const communityId = connection.channelId;
    const accessToken = connection.accessToken;
    
    const response = await fetch(`https://api.whop.com/api/v1/communities/${communityId}/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `New Video: ${title}`,
        body: `${message}\n\nWatch here: https://youtube.com/watch?v=${videoId}`,
        type: "text"
      })
    });

    if (!response.ok) {
      throw new Error(`Whop API error: ${response.status}`);
    }

    return { success: true, response: await response.json() };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Whop distribution failed" };
  }
}