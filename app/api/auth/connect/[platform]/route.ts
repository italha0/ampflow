import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAppwriteClient } from "@/lib/appwrite";

interface Params {
	platform: string;
}

interface ProviderConfig {
	authorizeUrl: string;
	clientId: string;
	redirectUri: string;
	scope: string;
	extraParams?: Record<string, string>;
}

function encodeState(payload: Record<string, unknown>) {
	return Buffer.from(JSON.stringify(payload), "utf8")
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function resolveProviderConfig(platform: string): ProviderConfig | null {
	switch (platform) {
		case "youtube":
			return {
				authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
				clientId: process.env.YOUTUBE_CLIENT_ID,
				redirectUri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/youtube`,
				scope: "https://www.googleapis.com/auth/youtube.readonly",
				extraParams: {
					access_type: "offline",
					prompt: "consent",
					include_granted_scopes: "true",
				},
			};
		case "discord":
			return {
				authorizeUrl: "https://discord.com/api/oauth2/authorize",
				clientId: process.env.DISCORD_CLIENT_ID,
				redirectUri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/discord`,
				scope: "identify guilds",
				extraParams: {
					response_type: "code",
				},
			};
		case "telegram":
			return {
				authorizeUrl: "https://oauth.telegram.org/auth",
				clientId: process.env.TELEGRAM_BOT_NAME,
				redirectUri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/telegram`,
				scope: "",
			};
		case "whop":
			return {
				authorizeUrl: "https://whop.com/oauth/authorize",
				clientId: process.env.WHOP_CLIENT_ID,
				redirectUri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/whop`,
				scope: "read:profile read:communities",
			};
		default:
			return null;
	}
}

export async function GET(request: NextRequest, context: { params: Params }) {
	const { platform } = context.params;

	if (!platform) {
		return NextResponse.json({ error: "Missing platform" }, { status: 400 });
	}

	try {
		const userId = request.headers.get("x-whop-user-id");
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const config = resolveProviderConfig(platform);

		if (!config) {
			return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
		}

		const { authorizeUrl, clientId, redirectUri, scope, extraParams } = config;

		if (!clientId || !redirectUri) {
			return NextResponse.json({ error: "OAuth client configuration missing" }, { status: 500 });
		}

		const redirectUrl = `${process.env.NEXT_PUBLIC_URL || request.nextUrl.origin}/dashboard`;

		const state = encodeState({
			userId: userId,
			platform,
			redirectUrl,
			nonce: randomBytes(12).toString("hex"),
		});

		const url = new URL(authorizeUrl);
		url.searchParams.set("client_id", clientId);
		url.searchParams.set("redirect_uri", redirectUri);
		url.searchParams.set("response_type", "code");
		url.searchParams.set("scope", scope);
		url.searchParams.set("state", state);

		if (extraParams) {
			for (const [key, value] of Object.entries(extraParams)) {
				url.searchParams.set(key, value);
			}
		}

		return NextResponse.redirect(url.toString(), { status: 302 });
	} catch (error) {
		console.error(`Failed to initiate ${platform} OAuth`, error);
		return NextResponse.json({ error: "Failed to initiate OAuth flow" }, { status: 500 });
	}
}