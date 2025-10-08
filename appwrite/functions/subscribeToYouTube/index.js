import crypto from "node:crypto";
import axios from "axios";
import { getAdminClient } from "../shared/appwriteClient.js";
import { env } from "../shared/env.js";
import { writeLog } from "../shared/logger.js";
import { buildYouTubeTopicUrl } from "../shared/platforms/youtube.js";

const TEN_DAYS_SECONDS = 864000;

function parseJson(body) {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error("Invalid JSON payload");
  }
}

export default async function handler({ req, res, log, error }) {
  if (req.method !== "POST") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  let payload = {};
  try {
    payload = parseJson(req.body);
  } catch (parseError) {
    error(parseError.message);
    return res.json({ error: parseError.message }, 400);
  }

  const { userId, youtubeConnectionId, youtubeChannelId } = payload;

  if (!userId || !youtubeConnectionId || !youtubeChannelId) {
    return res.json(
      {
        error: "userId, youtubeConnectionId, and youtubeChannelId are required",
      },
      400
    );
  }

  const callbackUrl = env.youtubeWebhookUrl();
  const hubUrl = env.youtubeHubUrl();
  const topic = buildYouTubeTopicUrl(youtubeChannelId);

  const { databases } = getAdminClient();

  let connection;
  try {
    connection = await databases.getDocument(
      env.databaseId(),
      env.connectionsCollectionId(),
      youtubeConnectionId
    );
  } catch (lookupError) {
    error(`Connection ${youtubeConnectionId} not found: ${lookupError.message}`);
    return res.json({ error: "Connection not found" }, 404);
  }

  if (connection.userId !== userId) {
    return res.json({ error: "Connection does not belong to user" }, 403);
  }

  if (connection.platform !== "youtube") {
    return res.json({ error: "Connection must be a YouTube connection" }, 400);
  }

  const hubSecret = crypto.randomBytes(32).toString("hex");

  try {
    await axios.post(
      hubUrl,
      new URLSearchParams({
        "hub.callback": callbackUrl,
        "hub.mode": "subscribe",
        "hub.topic": topic,
        "hub.secret": hubSecret,
        "hub.lease_seconds": String(TEN_DAYS_SECONDS),
        "hub.verify": "async",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );
  } catch (subscriptionError) {
    error(`Failed to subscribe channel ${youtubeChannelId}: ${subscriptionError.message}`);
    await writeLog({
      userId,
      connectionId: youtubeConnectionId,
      subscriptionId: youtubeChannelId,
      level: "error",
      message: "Failed to subscribe to YouTube channel",
      metadata: {
        error: subscriptionError.message,
        status: subscriptionError.response?.status,
        data: subscriptionError.response?.data,
      },
    });
    return res.json({ error: "Failed to subscribe to YouTube hub" }, 502);
  }

  const expiryDate = new Date(Date.now() + TEN_DAYS_SECONDS * 1000).toISOString();

  const subscriptionDocument = {
    youtubeChannelId,
    callbackUrl,
    hubSecret,
    status: "pending",
    expiryDate,
    connectionId: youtubeConnectionId,
    userId,
    topic,
  };

  try {
    await databases.createDocument(
      env.databaseId(),
      env.youtubeSubscriptionsCollectionId(),
      youtubeChannelId,
      subscriptionDocument
    );
  } catch (createError) {
    if (createError.code !== 409) {
      error(`Failed to create subscription doc: ${createError.message}`);
      return res.json({ error: "Failed to persist subscription" }, 500);
    }

    await databases.updateDocument(
      env.databaseId(),
      env.youtubeSubscriptionsCollectionId(),
      youtubeChannelId,
      {
        ...subscriptionDocument,
        status: "pending",
        updatedAt: new Date().toISOString(),
      }
    );
  }

  await writeLog({
    userId,
    connectionId: youtubeConnectionId,
    subscriptionId: youtubeChannelId,
    level: "info",
    message: "Submitted YouTube subscription request",
    metadata: { callbackUrl, hubUrl, topic },
  });

  return res.json({
    status: "pending",
    youtubeChannelId,
    callbackUrl,
    leaseSeconds: TEN_DAYS_SECONDS,
  });
}
