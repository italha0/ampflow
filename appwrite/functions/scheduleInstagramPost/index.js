import { DateTime } from "luxon";
import { Query } from "node-appwrite";
import { getAdminClient } from "../shared/appwriteClient.js";
import { env } from "../shared/env.js";
import { sanitizeCaption } from "../shared/caption.js";
import { publishInstagramPost } from "../shared/instagram.js";
import { writeLog } from "../shared/logger.js";

export default async function handler({ res, log, error }) {
  const { databases } = getAdminClient();
  const now = DateTime.utc();

  let duePosts = [];
  try {
    const { documents } = await databases.listDocuments(
      env.databaseId(),
      env.postsCollectionId(),
      [
        Query.equal("status", ["scheduled", "retrying"]),
        Query.lessThanEqual("scheduledAt", now.toISO()),
      ]
    );
    duePosts = documents;
  } catch (fetchError) {
    error(`Failed to query scheduled posts: ${fetchError.message}`);
    return res.json({ error: "Failed to query scheduled posts" }, 500);
  }

  if (duePosts.length === 0) {
    return res.json({ processed: 0, message: "No due posts" });
  }

  const results = {
    processed: duePosts.length,
    successes: 0,
    failures: 0,
    postIds: [],
  };

  for (const post of duePosts) {
    const postId = post.$id;
    results.postIds.push(postId);

    try {
      await databases.updateDocument(
        env.databaseId(),
        env.postsCollectionId(),
        postId,
        {
          status: "processing",
          lastTriedAt: now.toISO(),
        }
      );

      const publishResult = await publishInstagramPost({
        caption: sanitizeCaption(post.caption ?? ""),
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType ?? "IMAGE",
      });

      const publishedAt = DateTime.utc().toISO();

      await databases.updateDocument(
        env.databaseId(),
        env.postsCollectionId(),
        postId,
        {
          status: "published",
          publishedAt,
          instagramContainerId: publishResult.containerId,
          instagramMediaId: publishResult.mediaId,
          errorMessage: null,
          retryCount: post.retryCount ?? 0,
        }
      );

      await writeLog({
        postId,
        level: "info",
        message: "Scheduled post published successfully",
        metadata: publishResult,
      });

      results.successes += 1;
    } catch (publishError) {
      error(`Post ${postId} failed: ${publishError.message}`);

      const retryCount = (post.retryCount ?? 0) + 1;

      await databases.updateDocument(
        env.databaseId(),
        env.postsCollectionId(),
        postId,
        {
          status: retryCount < 5 ? "retrying" : "failed",
          errorMessage: publishError.message,
          retryCount,
          lastTriedAt: DateTime.utc().toISO(),
        }
      );

      await writeLog({
        postId,
        level: "error",
        message: "Failed to publish scheduled post",
        metadata: { error: publishError.message, retryCount },
      });

      results.failures += 1;
    }
  }

  return res.json(results);
}
