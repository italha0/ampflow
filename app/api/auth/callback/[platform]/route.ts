import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { getAppwriteClient } from "@/lib/appwrite";
import { databases } from "node-appwrite";

const SUPPORTED_PLATFORMS = ["youtube", "discord", "telegram", "whop"];

type Params = {
	platform: string;
};

function decodeState(state: string | null): Record<string, unknown> | null {
	if (!state) return null;
	try {
		const normalized = state.replace(/-/g, "+").replace(/_/g, "/");
		const decoded = Buffer.from(normalized, "base64").toString("utf8");
		return JSON.parse(decoded) as Record<string, unknown>;
	} catch (error) {
		console.error("Failed to decode OAuth state", error);
		return null;
	}
}

export async function GET(request: NextRequest, context: { params: Params }) {
	const { platform: rawPlatform } = context.params;
	const platform = rawPlatform;

	if (!SUPPORTED_PLATFORMS.includes(platform)) {
		return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
	}

	const code = request.nextUrl.searchParams.get("code");
	const oauthError = request.nextUrl.searchParams.get("error");

	if (!code && !oauthError) {
		return NextResponse.json({ error: "Missing OAuth response parameters" }, { status: 400 });
	}

	const stateParam = request.nextUrl.searchParams.get("state");
	const decodedState = decodeState(stateParam);
	const statePlatform = typeof decodedState?.platform === "string" ? decodedState.platform : null;

	if (statePlatform && statePlatform !== platform) {
		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_URL || request.nextUrl.origin}/dashboard?error=platform_mismatch`,
			{ status: 303 },
		);
	}

	// Process the OAuth callback directly
	try {
		const client = getAppwriteClient();
		const db = new databases.Client(client);
		
		// Get user ID from state
		const userId = decodedState?.userId as string;
		if (!userId) {
			throw new Error("Missing user ID in state");
		}

		// Exchange code for tokens and get user info based on platform
		let connectionData = {};
		
		switch (platform) {
			case "youtube":
				// Handle YouTube OAuth callback
				connectionData = {
					platform: "youtube",
					username: "YouTube Channel", // This would be fetched from YouTube API
					channelId: "UCxxx", // This would be fetched from YouTube API
					accessToken: code, // This would be exchanged for actual token
					refreshToken: "", // This would be obtained during token exchange
				};
				break;
			case "discord":
				// Handle Discord OAuth callback
				connectionData = {
					platform: "discord",
					username: "Discord Server", // This would be fetched from Discord API
					channelId: "123456", // This would be fetched from Discord API
					accessToken: code, // This would be exchanged for actual token
					refreshToken: "", // This would be obtained during token exchange
				};
				break;
			case "telegram":
				// Handle Telegram OAuth callback
				connectionData = {
					platform: "telegram",
					username: "Telegram Channel", // This would be fetched from Telegram
					channelId: "@channel", // This would be fetched from Telegram
					botToken: code, // This would be the bot token
				};
				break;
			case "whop":
				// Handle Whop OAuth callback
				connectionData = {
					platform: "whop",
					username: "Whop Community", // This would be fetched from Whop API
					channelId: "community_id", // This would be fetched from Whop API
					accessToken: code, // This would be exchanged for actual token
					refreshToken: "", // This would be obtained during token exchange
				};
				break;
		}

		// Save connection to database
		await db.createDocument(
			process.env.APPWRITE_DATABASE_ID!,
			process.env.APPWRITE_CONNECTIONS_COLLECTION_ID!,
			"unique()",
			{
				userId,
				...connectionData,
			}
		);

		return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || request.nextUrl.origin}/dashboard?success=true`, { status: 302 });
	} catch (error) {
		console.error(`Failed to process ${platform} OAuth callback`, error);
		return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || request.nextUrl.origin}/dashboard?error=auth_failed`, { status: 302 });
	}
}