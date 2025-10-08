import { Buffer } from "node:buffer";
import axios from "axios";
import { Query } from "node-appwrite";
import { getAdminClient } from "../shared/appwriteClient.js";
import { env } from "../shared/env.js";
import { writeLog } from "../shared/logger.js";
import { fetchYouTubeChannel } from "../shared/platforms/youtube.js";
import { fetchDiscordUser, fetchDiscordGuilds } from "../shared/platforms/discord.js";

function decodeState(state) {
  if (!state) {
    throw new Error("Missing OAuth state parameter");
  }
  try {
    const normalized = state.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (err) {
    throw new Error("Invalid OAuth state payload");
  }
}

async function upsertConnection({ databases, userId, platform, payload }) {
  const { documents } = await databases.listDocuments(
    env.databaseId(),
    env.connectionsCollectionId(),
    [Query.equal("userId", [userId]), Query.equal("platform", [platform])]
  );

  const now = new Date().toISOString();
  const documentPayload = {
    userId,
    platform,
    username: payload.username ?? "",
    channelId: payload.channelId ?? "",
    guildId: payload.guildId ?? null,
    accessToken: payload.accessToken ?? null,
    refreshToken: payload.refreshToken ?? null,
    botToken: payload.botToken ?? null,
    scope: payload.scope ?? null,
    tokenType: payload.tokenType ?? null,
    metadata: payload.metadata ?? {},
    updatedAt: now,
  };

  if (documents.length > 0) {
    const [existing] = documents;
    await databases.updateDocument(
      env.databaseId(),
      env.connectionsCollectionId(),
      existing.$id,
      documentPayload
    );
    return existing.$id;
  }

  const created = await databases.createDocument(
    env.databaseId(),
    env.connectionsCollectionId(),
    "unique()",
    {
      ...documentPayload,
      createdAt: now,
    }
  );

  return created.$id;
}

async function handleYouTube({ code, res, state }) {
  const clientId = env.youtubeClientId();
  const clientSecret = env.youtubeClientSecret();
  const redirectUri = env.youtubeRedirectUri();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("YouTube OAuth environment is not configured");
  }

  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10000,
    }
  );

  const tokenPayload = tokenResponse.data;
  const accessToken = tokenPayload.access_token;
  const refreshToken = tokenPayload.refresh_token;
  const scope = tokenPayload.scope;

  const channel = await fetchYouTubeChannel({ accessToken });

  return {
    username: channel.title,
    channelId: channel.channelId,
    accessToken,
    refreshToken,
    scope,
    metadata: {
      thumbnails: channel.thumbnails,
      description: channel.description,
      expiresIn: tokenPayload.expires_in,
    },
  };
}

async function handleDiscord({ code }) {
  const clientId = env.discordClientId();
  const clientSecret = env.discordClientSecret();
  const redirectUri = env.discordRedirectUri();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Discord OAuth environment is not configured");
  }

  const tokenResponse = await axios.post(
    `${env.discordApiBase()}/oauth2/token`,
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10000,
    }
  );

  const tokenPayload = tokenResponse.data;
  const accessToken = tokenPayload.access_token;
  const refreshToken = tokenPayload.refresh_token;
  const scope = tokenPayload.scope;
  const tokenType = tokenPayload.token_type ?? "Bearer";

  const user = await fetchDiscordUser({ accessToken, tokenType });
  const guilds = await fetchDiscordGuilds({ accessToken, tokenType });

  return {
    username: `${user.username}#${user.discriminator}`,
    channelId: "",
    guildId: guilds[0]?.id ?? null,
    accessToken,
    refreshToken,
    scope,
    tokenType,
    metadata: {
      user,
      guilds,
      expiresIn: tokenPayload.expires_in,
      needsChannelSelection: true,
    },
  };
}

async function handleWhop({ code }) {
  const clientId = env.whopClientId();
  const clientSecret = env.whopClientSecret();
  const redirectUri = env.whopRedirectUri();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Whop OAuth environment is not configured");
  }

  const tokenResponse = await axios.post(
    env.whopTokenUrl(),
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10000,
    }
  );

  const tokenPayload = tokenResponse.data;
  const accessToken = tokenPayload.access_token;
  const refreshToken = tokenPayload.refresh_token;
  const scope = tokenPayload.scope;

  const { data: profile } = await axios.get(`${env.whopApiBase()}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    timeout: 10000,
  });

  const { data: communitiesResponse } = await axios.get(
    `${env.whopApiBase()}/communities`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000,
    }
  );

  const communities = Array.isArray(communitiesResponse?.data)
    ? communitiesResponse.data
    : communitiesResponse;

  return {
    username: profile?.name ?? profile?.username ?? "Whop Community",
    channelId: communities?.[0]?.id ?? "",
    accessToken,
    refreshToken,
    scope,
    metadata: {
      profile,
      communities,
      expiresIn: tokenPayload.expires_in,
      needsCommunitySelection: !communities?.[0]?.id,
    },
  };
}

export default async function handler({ req, res, log, error }) {
  if (req.method !== "GET") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  const { code, state: stateParam, error: oauthError, platform } = req.query ?? {};

  let state;
  try {
    state = decodeState(stateParam);
  } catch (stateError) {
    error(stateError.message);
    return res.json({ error: stateError.message }, 400);
  }

  const redirectUrl = state?.redirectUrl ?? `${env.appUrl()}/dashboard`;

  if (oauthError) {
    return res.redirect(`${redirectUrl}?error=${encodeURIComponent(oauthError)}`);
  }

  if (!code) {
    return res.redirect(`${redirectUrl}?error=missing_code`);
  }

  if (!platform) {
    return res.redirect(`${redirectUrl}?error=missing_platform`);
  }

  const userId = state?.userId;
  if (!userId) {
    return res.redirect(`${redirectUrl}?error=missing_user`);
  }

  const { databases, functions } = getAdminClient();

  let connectionPayload;

  try {
    switch (platform) {
      case "youtube":
        connectionPayload = await handleYouTube({ code, state, res });
        break;
      case "discord":
        connectionPayload = await handleDiscord({ code, state, res });
        break;
      case "whop":
        connectionPayload = await handleWhop({ code, state, res });
        break;
      default:
        return res.redirect(`${redirectUrl}?error=unsupported_platform`);
    }
  } catch (providerError) {
    error(`OAuth exchange failed for ${platform}: ${providerError.message}`);
    await writeLog({
      userId,
      level: "error",
      message: `OAuth exchange failed for ${platform}`,
      metadata: { error: providerError.message },
    });
    return res.redirect(
      `${redirectUrl}?error=${encodeURIComponent("oauth_exchange_failed")}`
    );
  }

  let connectionId;
  try {
    connectionId = await upsertConnection({
      databases,
      userId,
      platform,
      payload: connectionPayload,
    });
  } catch (dbError) {
    error(`Failed to upsert connection: ${dbError.message}`);
    await writeLog({
      userId,
      level: "error",
      message: `Failed to persist ${platform} connection`,
      metadata: { error: dbError.message },
    });
    return res.redirect(
      `${redirectUrl}?error=${encodeURIComponent("persist_failed")}`
    );
  }

  if (platform === "youtube") {
    const subscribeFunctionId = env.subscribeYoutubeFunctionId();
    if (!subscribeFunctionId) {
      error("APPWRITE_FUNCTION_SUBSCRIBE_YOUTUBE_ID not configured");
    } else {
      try {
        await functions.createExecution(
          subscribeFunctionId,
          JSON.stringify({
            userId,
            youtubeConnectionId: connectionId,
            youtubeChannelId: connectionPayload.channelId,
          })
        );
      } catch (subscribeError) {
        error(`Failed to queue YouTube subscription: ${subscribeError.message}`);
        await writeLog({
          userId,
          connectionId,
          level: "error",
          message: "Failed to subscribe to YouTube channel",
          metadata: { error: subscribeError.message },
        });
      }
    }
  }

  await writeLog({
    userId,
    connectionId,
    level: "info",
    message: `${platform} connection updated`,
    metadata: {
      platform,
    },
  });

  return res.redirect(`${redirectUrl}?connected=${encodeURIComponent(platform)}`);
}
