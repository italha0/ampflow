import axios from "axios";
import { env } from "../env.js";

function buildAuthorizationHeader(token) {
  if (!token) {
    throw new Error("Missing Whop access token");
  }
  const trimmed = token.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed;
  }
  return `Bearer ${trimmed}`;
}

export async function postToWhopCommunity({ token, communityId, message }) {
  if (!communityId) {
    throw new Error("Whop communityId is required");
  }

  await axios.post(
    `${env.whopApiBase()}/community/posts`,
    {
      community_id: communityId,
      content: message,
    },
    {
      headers: {
        Authorization: buildAuthorizationHeader(token),
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );
}
