import axios from "axios";
import { env } from "../env.js";

export function buildYouTubeTopicUrl(channelId) {
  return `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
}

export async function fetchYouTubeChannel({ accessToken }) {
  const { data } = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
    params: {
      part: "snippet",
      mine: true,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    timeout: 10000,
  });

  const channel = Array.isArray(data?.items) ? data.items[0] : null;
  if (!channel) {
    throw new Error("No YouTube channel found for authenticated user");
  }

  return {
    channelId: channel.id,
    title: channel.snippet?.title ?? "",
    thumbnails: channel.snippet?.thumbnails ?? {},
    description: channel.snippet?.description ?? "",
  };
}
