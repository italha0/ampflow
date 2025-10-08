import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { appwriteAdmin } from "@/lib/appwrite";
import type { ConnectionPlatform } from "@/types";

const SUPPORTED_PLATFORMS: ConnectionPlatform[] = ["youtube", "discord", "whop"];

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
	const platform = rawPlatform as ConnectionPlatform;

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
			`${env.appUrl() || request.nextUrl.origin}/dashboard?error=platform_mismatch`,
			{ status: 303 },
		);
	}

	const authRedirectFunctionId = appwriteAdmin.functionIds.authRedirect;

	if (!authRedirectFunctionId) {
		console.error("APPWRITE_FUNCTION_AUTH_REDIRECT_ID is not configured");
		return NextResponse.json({ error: "OAuth callback not configured" }, { status: 500 });
	}

	const functionUrl = new URL(`${env.appwriteEndpoint()}/functions/${authRedirectFunctionId}/executions`);
	const searchParams = new URLSearchParams(request.nextUrl.search);
	searchParams.set("platform", platform);
	functionUrl.search = searchParams.toString();

	return NextResponse.redirect(functionUrl.toString(), { status: 302 });
}
