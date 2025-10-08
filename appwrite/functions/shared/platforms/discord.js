import axios from "axios";
import { env } from "../env.js";

function resolveAuthorizationHeader(token, tokenTypeHint) {
  if (!token) {
    throw new Error("Missing Discord token");
  }

  const trimmed = token.trim();
  if (trimmed.toLowerCase().startsWith("bot ")) {
    return trimmed;
  }
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed;
  }

  const type = tokenTypeHint?.toLowerCase() === "bot" ? "Bot" : "Bearer";
  return `${type} ${trimmed}`;
}

export async function postToDiscordChannel({
  token,
  tokenType,
  channelId,
  message,
  embeds = undefined,
}) {
  if (!channelId) {
    throw new Error("Discord channelId is required");
  }

  const authHeader = resolveAuthorizationHeader(token, tokenType);

  await axios.post(
    `${env.discordApiBase()}/channels/${channelId}/messages`,
    {
      content: message,
      embeds,
    },
    {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );
}

export async function fetchDiscordUser({ accessToken, tokenType }) {
  const authHeader = resolveAuthorizationHeader(accessToken, tokenType ?? "Bearer");
  const { data } = await axios.get(`${env.discordApiBase()}/users/@me`, {
    headers: {
      Authorization: authHeader,
    },
    timeout: 10000,
  });
  return data;
}

export async function fetchDiscordGuilds({ accessToken, tokenType }) {
  const authHeader = resolveAuthorizationHeader(accessToken, tokenType ?? "Bearer");
  const { data } = await axios.get(`${env.discordApiBase()}/users/@me/guilds`, {
    headers: {
      Authorization: authHeader,
    },
    timeout: 10000,
  });
  return Array.isArray(data) ? data : [];
}
