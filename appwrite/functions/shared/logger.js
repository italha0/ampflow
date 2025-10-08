import { env } from "./env.js";
import { getAdminClient } from "./appwriteClient.js";

export async function writeLog({
  postId = null,
  automationId = null,
  connectionId = null,
  subscriptionId = null,
  userId = null,
  level = "info",
  message,
  metadata = {},
}) {
  const { databases } = getAdminClient();

  await databases.createDocument(
    env.databaseId(),
    env.logsCollectionId(),
    "unique()",
    {
      postId,
      automationId,
      connectionId,
      subscriptionId,
      userId,
      level,
      message,
      metadata,
      timestamp: new Date().toISOString(),
    }
  );
}
