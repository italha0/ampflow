import crypto from "node:crypto";
import { URL } from "node:url";
import { XMLParser } from "fast-xml-parser";
import { Query } from "node-appwrite";
import { getAdminClient } from "../shared/appwriteClient.js";
import { env } from "../shared/env.js";
import { writeLog } from "../shared/logger.js";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", trimValues: true });

function extractChannelIdFromTopic(topic) {
  if (!topic) return null;
  try {
    const url = new URL(topic);
    return url.searchParams.get("channel_id");
  } catch (_) {
    return null;
  }
}

function normalizeHeader(headers, key) {
  if (!headers) return undefined;
  const lowerKey = key.toLowerCase();
  for (const headerKey of Object.keys(headers)) {
    if (headerKey.toLowerCase() === lowerKey) {
      return headers[headerKey];
    }
  }
  return undefined;
}

function parseFeed(body) {
  if (!body) {
    throw new Error("Empty request body");
  }

  try {
    return parser.parse(body);
  } catch (err) {
    throw new Error(`Failed to parse XML: ${err.message}`);
  }
}

function extractEntry(feed) {
  if (!feed?.feed) return null;
  const entry = feed.feed.entry;
  if (!entry) return null;
  return Array.isArray(entry) ? entry[0] : entry;
}

export default async function handler({ req, res, log, error }) {
  const { databases, functions } = getAdminClient();

  if (req.method === "GET") {
    const mode = req.query?.["hub.mode"];
    const topic = req.query?.["hub.topic"];
    const challenge = req.query?.["hub.challenge"];
    const channelId = extractChannelIdFromTopic(topic);

    if (!mode || !topic || !challenge || !channelId) {
      return res.json({ error: "Invalid verification request" }, 400);
    }

    try {
      await databases.updateDocument(
        env.databaseId(),
        env.youtubeSubscriptionsCollectionId(),
        channelId,
        {
          status: mode === "subscribe" ? "subscribed" : mode,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (updateError) {
      error(`Failed to update subscription ${channelId}: ${updateError.message}`);
      return res.json({ error: "Subscription not recognized" }, 404);
    }

    await writeLog({
      subscriptionId: channelId,
      level: "info",
      message: `YouTube hub verification acknowledged (${mode})`,
    });

    res.setHeader("Content-Type", "text/plain");
    return res.send(challenge, 200);
  }

  if (req.method !== "POST") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  const signatureHeader = normalizeHeader(req.headers, "x-hub-signature");
  if (!signatureHeader) {
    return res.json({ error: "Missing signature" }, 403);
  }

  const rawBody = req.body ?? "";

  let feed;
  try {
    feed = parseFeed(rawBody);
  } catch (parseError) {
    error(parseError.message);
    return res.json({ error: parseError.message }, 400);
  }

  const entry = extractEntry(feed);

  if (!entry) {
    log?.("No entry found in notification");
    return res.json({ status: "ignored" }, 200);
  }

  const channelId = entry["yt:channelId"] ?? feed.feed?.["yt:channelId"];
  if (!channelId) {
    return res.json({ error: "Missing channel identifier" }, 400);
  }

  let subscription;
  try {
    subscription = await databases.getDocument(
      env.databaseId(),
      env.youtubeSubscriptionsCollectionId(),
      channelId
    );
  } catch (lookupError) {
    error(`Subscription for channel ${channelId} not found: ${lookupError.message}`);
    return res.json({ error: "Unknown subscription" }, 404);
  }

  const expectedSignature = crypto
    .createHmac("sha1", subscription.hubSecret)
    .update(rawBody)
    .digest("hex");

  const actualSignature = signatureHeader.split("=").pop();

  if (!actualSignature || expectedSignature !== actualSignature) {
    await writeLog({
      subscriptionId: channelId,
      level: "warn",
      message: "Invalid X-Hub-Signature",
    });
    return res.json({ error: "Invalid signature" }, 403);
  }

  const videoId = entry["yt:videoId"];
  const publishedAt = entry.published ?? entry.updated;
  const title = entry.title ?? "New video";
  const link = Array.isArray(entry.link)
    ? entry.link.find((item) => item.rel === "alternate")?.href
    : entry.link?.href;

  const videoUrl = link ?? (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);

  await databases.updateDocument(
    env.databaseId(),
    env.youtubeSubscriptionsCollectionId(),
    channelId,
    {
      status: "subscribed",
      lastNotifiedAt: new Date().toISOString(),
    }
  );

  const { documents: youtubeConnections } = await databases.listDocuments(
    env.databaseId(),
    env.connectionsCollectionId(),
    [Query.equal("channelId", [channelId]), Query.equal("platform", ["youtube"])]
  );

  if (youtubeConnections.length === 0) {
    log?.(`No YouTube connections found for channel ${channelId}`);
    return res.json({ processed: 0 });
  }

  const distributeMessageFunctionId = env.distributeMessageFunctionId();
  if (!distributeMessageFunctionId) {
    error("Missing APPWRITE_FUNCTION_DISTRIBUTE_MESSAGE_ID env variable");
    return res.json({ error: "Distribution function not configured" }, 500);
  }

  const automationResults = [];

  for (const connection of youtubeConnections) {
    const { documents: automations } = await databases.listDocuments(
      env.databaseId(),
      env.automationsCollectionId(),
      [
        Query.equal("youtubeConnectionId", [connection.$id]),
        Query.equal("isActive", [true]),
      ]
    );

    if (automations.length === 0) {
      continue;
    }

    for (const automation of automations) {
      const payload = {
        userId: automation.userId,
        messageTemplate: automation.messageTemplate,
        video: {
          id: videoId,
          title,
          url: videoUrl,
          publishedAt,
          channelId,
          channelName: connection.username ?? "",
        },
        targetConnectionIds: automation.targetConnectionIds,
        automationId: automation.$id,
      };

      try {
        await functions.createExecution(
          distributeMessageFunctionId,
          JSON.stringify(payload)
        );

        automationResults.push({ automationId: automation.$id, status: "queued" });
      } catch (executionError) {
        error(`Failed to queue distributeMessage: ${executionError.message}`);
        automationResults.push({
          automationId: automation.$id,
          status: "failed",
          error: executionError.message,
        });

        await writeLog({
          userId: automation.userId,
          automationId: automation.$id,
          subscriptionId: channelId,
          level: "error",
          message: "Failed to queue distributeMessage",
          metadata: { error: executionError.message },
        });
      }
    }
  }

  return res.json({
    processed: automationResults.length,
    automations: automationResults,
  });
}
