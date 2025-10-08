import { DateTime } from "luxon";
import { getAdminClient } from "../shared/appwriteClient.js";
import { env } from "../shared/env.js";
import { sanitizeCaption } from "../shared/caption.js";
import { publishInstagramPost } from "../shared/instagram.js";
import { writeLog } from "../shared/logger.js";

export default async function handler({ req, res, log, error }) {
  if (req.method !== "POST") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  let payload = {};
  try {
    payload = JSON.parse(req.body ?? "{}");
  } catch (parseError) {
    error(`Invalid JSON payload: ${parseError.message}`);
    return res.json({ error: "Invalid JSON payload" }, 400);
  }

  const {
    postId,
    mediaUrl,
    mediaType = "IMAGE",
    caption = "",
    userId,
    scheduleTime,
  } = payload;

  if (!mediaUrl) {
    return res.json({ error: "mediaUrl is required" }, 400);
  }

  const normalizedCaption = sanitizeCaption(caption);
  const { databases } = getAdminClient();

  let postDocument = null;
  let createdDocument = null;

  if (postId) {
    try {
      postDocument = await databases.getDocument(
        env.databaseId(),
        env.postsCollectionId(),
        postId
      );
    } catch (lookupError) {
      log?.(`Post ${postId} not found, will create a new document.`);
    }
  }

  const now = DateTime.utc();
  const scheduledAtIso = scheduleTime
    ? DateTime.fromISO(scheduleTime, { zone: env.timezone() })
        .toUTC()
        .toISO()
    : null;

  const shouldSchedule = Boolean(scheduledAtIso)
    ? DateTime.fromISO(scheduledAtIso).diff(now, "minutes").minutes > 1
    : false;

  if (shouldSchedule) {
    if (postDocument) {
      await databases.updateDocument(
        env.databaseId(),
        env.postsCollectionId(),
        postDocument.$id,
        {
          mediaUrl,
          mediaType,
          caption: normalizedCaption,
          status: "scheduled",
          scheduledAt: scheduledAtIso,
          lastTriedAt: null,
          errorMessage: null,
        }
      );
    } else {
      postDocument = await databases.createDocument(
        env.databaseId(),
        env.postsCollectionId(),
        "unique()",
        {
          userId,
          mediaUrl,
          mediaType,
          caption: normalizedCaption,
          status: "scheduled",
          scheduledAt: scheduledAtIso,
        }
      );
    }

    await writeLog({
      postId: postDocument?.$id,
      level: "info",
      message: "Post scheduled for future publication",
      metadata: { scheduledAt: scheduledAtIso },
    });

    return res.json({ status: "scheduled", scheduledAt: scheduledAtIso });
  }

  try {
    const publishResult = await publishInstagramPost({
      caption: normalizedCaption,
      mediaUrl,
      mediaType,
    });

    const publishedAt = DateTime.utc().toISO();

    if (postDocument) {
      await databases.updateDocument(
        env.databaseId(),
        env.postsCollectionId(),
        postDocument.$id,
        {
          status: "published",
          publishedAt,
          caption: normalizedCaption,
          mediaUrl,
          mediaType,
          instagramContainerId: publishResult.containerId,
          instagramMediaId: publishResult.mediaId,
        }
      );
    } else {
      createdDocument = await databases.createDocument(
        env.databaseId(),
        env.postsCollectionId(),
        "unique()",
        {
          userId,
          caption: normalizedCaption,
          mediaUrl,
          mediaType,
          status: "published",
          publishedAt,
          instagramContainerId: publishResult.containerId,
          instagramMediaId: publishResult.mediaId,
        }
      );

      postDocument = createdDocument;

      await writeLog({
        postId: createdDocument.$id,
        level: "info",
        message: "Post published immediately",
      });
    }

    const responsePayload = {
      status: "published",
      publishedAt,
      instagramContainerId: publishResult.containerId,
      instagramMediaId: publishResult.mediaId,
      postId: postDocument?.$id ?? createdDocument?.$id,
    };

    await writeLog({
      postId: responsePayload.postId,
      level: "info",
      message: "Post published to Instagram",
      metadata: publishResult,
    });

    return res.json(responsePayload);
  } catch (publishError) {
    error(`Failed to publish post: ${publishError.message}`);

    if (postDocument) {
      await databases.updateDocument(
        env.databaseId(),
        env.postsCollectionId(),
        postDocument.$id,
        {
          status: "failed",
          errorMessage: publishError.message,
          lastTriedAt: DateTime.utc().toISO(),
        }
      );
    }

    await writeLog({
      postId: postDocument?.$id,
      level: "error",
      message: "Failed to publish post",
      metadata: { error: publishError.message },
    });

    return res.json({ error: publishError.message }, 500);
  }
}
