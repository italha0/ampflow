import { Query } from "node-appwrite";
import { getAdminClient } from "../shared/appwriteClient.js";
import { env } from "../shared/env.js";
import { writeLog } from "../shared/logger.js";
import { renderTemplate } from "../shared/template.js";
import { postToDiscordChannel } from "../shared/platforms/discord.js";
import { postToTelegram } from "../shared/platforms/telegram.js";
import { postToWhopCommunity } from "../shared/platforms/whop.js";

function parseJson(body) {
  if (!body) return {};
  return JSON.parse(body);
}

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function dispatchToPlatform({ connection, message, video }) {
  const platform = connection.platform;

  switch (platform) {
    case "discord":
      await postToDiscordChannel({
        token: connection.botToken ?? connection.accessToken,
        tokenType: connection.tokenType ?? "Bot",
        channelId: connection.channelId,
        message,
        embeds: [
          {
            title: video.title,
            url: video.url,
            description: video.description ?? "",
          },
        ],
      });
      break;
    case "telegram":
      await postToTelegram({
        botToken: connection.botToken ?? connection.accessToken,
        chatId: connection.channelId ?? connection.guildId,
        message,
      });
      break;
    case "whop":
      await postToWhopCommunity({
        token: connection.accessToken,
        communityId: connection.channelId,
        message,
      });
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export default async function handler({ req, res, log, error }) {
  if (req.method !== "POST") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  let payload;
  try {
    payload = parseJson(req.body);
  } catch (parseError) {
    error(`Invalid JSON payload: ${parseError.message}`);
    return res.json({ error: "Invalid JSON payload" }, 400);
  }

  const { userId, messageTemplate, video, targetConnectionIds, automationId } = payload;

  if (!userId || !messageTemplate || !video || !targetConnectionIds) {
    return res.json({
      error: "userId, messageTemplate, video, and targetConnectionIds are required",
    }, 400);
  }

  const connectionIds = ensureArray(targetConnectionIds).filter(Boolean);

  if (connectionIds.length === 0) {
    return res.json({ error: "No target connections provided" }, 400);
  }

  const videoUrl = video.url ?? (video.id ? `https://www.youtube.com/watch?v=${video.id}` : "");
  const templateContext = {
    video_title: video.title ?? "New video",
    video_url: videoUrl,
    channel_name: video.channelName ?? "",
    creator_name: video.creatorName ?? "",
    published_at: video.publishedAt ?? "",
  };

  const renderedMessage = renderTemplate(messageTemplate, templateContext);

  const { databases } = getAdminClient();

  const { documents: connections } = await databases.listDocuments(
    env.databaseId(),
    env.connectionsCollectionId(),
    [Query.equal("$id", connectionIds)]
  );

  const foundIds = new Set(connections.map((doc) => doc.$id));
  const missingIds = connectionIds.filter((id) => !foundIds.has(id));

  const results = missingIds.map((id) => ({
    connectionId: id,
    status: "error",
    error: "Connection not found",
  }));

  for (const connection of connections) {
    if (connection.userId !== userId) {
      results.push({
        connectionId: connection.$id,
        status: "skipped",
        reason: "Connection does not belong to user",
      });
      continue;
    }

    try {
      await dispatchToPlatform({ connection, message: renderedMessage, video });
      results.push({ connectionId: connection.$id, status: "success" });

      await writeLog({
        userId,
        automationId,
        connectionId: connection.$id,
        level: "info",
        message: `Dispatched automation message to ${connection.platform}`,
        metadata: {
          platform: connection.platform,
          videoId: video.id,
        },
      });
    } catch (dispatchError) {
      error(`Failed to dispatch to ${connection.platform}: ${dispatchError.message}`);
      results.push({
        connectionId: connection.$id,
        status: "error",
        error: dispatchError.message,
      });

      await writeLog({
        userId,
        automationId,
        connectionId: connection.$id,
        level: "error",
        message: `Failed to dispatch automation message to ${connection.platform}`,
        metadata: {
          error: dispatchError.message,
          videoId: video.id,
        },
      });
    }
  }

  const dispatchedCount = results.filter((r) => r.status === "success").length;

  return res.json({
    dispatched: dispatchedCount,
    total: results.length,
    results,
  });
}
