import { getAdminClient } from "../shared/appwriteClient.js";
import { env } from "../shared/env.js";
import { getMediaStatus } from "../shared/instagram.js";
import { writeLog } from "../shared/logger.js";

export default async function handler({ req, res }) {
  if (req.method !== "GET") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  const postId = req.query?.postId;
  const mediaIdFromQuery = req.query?.mediaId;

  if (!postId && !mediaIdFromQuery) {
    return res.json({ error: "postId or mediaId is required" }, 400);
  }

  let mediaId = mediaIdFromQuery;
  const { databases } = getAdminClient();

  if (!mediaId) {
    try {
      const post = await databases.getDocument(
        env.databaseId(),
        env.postsCollectionId(),
        postId
      );
      mediaId = post.instagramMediaId;
    } catch (err) {
      return res.json({ error: `Post ${postId} not found` }, 404);
    }
  }

  if (!mediaId) {
    return res.json({ error: "Post has not been published yet" }, 400);
  }

  let status;
  try {
    status = await getMediaStatus(mediaId);
  } catch (err) {
    return res.json({ error: err.message }, 500);
  }

  if (postId) {
    await databases.updateDocument(
      env.databaseId(),
      env.postsCollectionId(),
      postId,
      {
        lastStatusSyncAt: new Date().toISOString(),
        lastKnownStatus: status,
        permalink: status.permalink,
      }
    );

    await writeLog({
      postId,
      level: "info",
      message: "Fetched post status",
      metadata: status,
    });
  }

  return res.json({ status });
}
