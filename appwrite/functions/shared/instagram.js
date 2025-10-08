import axios from "axios";
import { env } from "./env.js";

const GRAPH_VERSION = "v19.0";

function getBaseUrl() {
  return `https://graph.facebook.com/${GRAPH_VERSION}`;
}

async function waitForContainerReady(containerId, { maxAttempts = 20, delayMs = 5000 } = {}) {
  const accessToken = env.instagramAccessToken();

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data } = await axios.get(`${getBaseUrl()}/${containerId}`, {
      params: {
        fields: "status_code,status",
        access_token: accessToken,
      },
      timeout: 1000 * 15,
    });

    if (data.status_code === "FINISHED" || data.status_code === "READY") {
      return true;
    }

    if (data.status_code === "ERROR") {
      throw new Error(`Instagram container failed to process: ${data.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Timed out waiting for Instagram media container to finish processing");
}

export async function createMediaContainer({ caption, mediaUrl, mediaType }) {
  const accessToken = env.instagramAccessToken();
  const businessId = env.instagramBusinessId();

  const payload = {
    caption,
    access_token: accessToken,
  };

  if (mediaType === "VIDEO") {
    payload.video_url = mediaUrl;
  } else {
    payload.image_url = mediaUrl;
  }

  const { data } = await axios.post(
    `${getBaseUrl()}/${businessId}/media`,
    payload,
    { timeout: 1000 * 60 }
  );

  return data; // { id }
}

export async function publishMedia(containerId, mediaType) {
  const accessToken = env.instagramAccessToken();
  const businessId = env.instagramBusinessId();

  if (mediaType === "VIDEO") {
    await waitForContainerReady(containerId);
  }

  const { data } = await axios.post(
    `${getBaseUrl()}/${businessId}/media_publish`,
    {
      creation_id: containerId,
      access_token: accessToken,
    },
    { timeout: 1000 * 60 }
  );

  return data; // { id }
}

export async function getMediaStatus(mediaId) {
  const accessToken = env.instagramAccessToken();

  const { data } = await axios.get(
    `${getBaseUrl()}/${mediaId}`,
    {
      params: {
        fields: "id,media_type,media_url,permalink,thumbnail_url,caption,timestamp",
        access_token: accessToken,
      },
      timeout: 1000 * 30,
    }
  );

  return data;
}

export async function publishInstagramPost({ caption, mediaUrl, mediaType }) {
  const container = await createMediaContainer({ caption, mediaUrl, mediaType });
  const publishResponse = await publishMedia(container.id, mediaType);

  return {
    containerId: container.id,
    mediaId: publishResponse.id,
  };
}
