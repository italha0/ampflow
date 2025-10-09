import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { headers } from "next/headers";

function buildWhopLoginUrl(origin: string, redirectParam: string | null): string {
	const appId = env.whopAppId();
	const loginBase = env.whopLoginUrl();
	const redirectTarget = redirectParam ?? `${origin}/dashboard`;

	const url = new URL(loginBase);

	// Support multiple parameter spellings used across Whop docs/versions.
	url.searchParams.set("app_id", appId);
	url.searchParams.set("appId", appId);
	url.searchParams.set("redirect_uri", redirectTarget);
	url.searchParams.set("redirectUrl", redirectTarget);

	return url.toString();
}

export async function GET(request: NextRequest) {
	const origin = env.appUrl() || request.nextUrl.origin;
	const redirectParam = request.nextUrl.searchParams.get("redirect");
	const whopUserId = request.headers.get("x-whop-user-id");

	// If the request is already coming from the Whop runtime, hand off to the
	// enrichment flow that expects Whop headers to be present.
	if (whopUserId) {
		const connectUrl = new URL("/api/auth/connect/whop", origin);
		const incomingSearch = request.nextUrl.search;
		if (incomingSearch) {
			connectUrl.search = incomingSearch;
		}

		return NextResponse.redirect(connectUrl.toString(), { status: 302 });
	}

	// Otherwise, bounce the user to the hosted Whop login experience. Once
	// authenticated, Whop will reopen the embedded app with the appropriate
	// session headers so the button can succeed on the next attempt.
	const loginUrl = buildWhopLoginUrl(origin, redirectParam);

	return NextResponse.redirect(loginUrl, { status: 302 });
}

export async function getCurrentSession() {
  const headerList = headers();
  const whopUserId = headerList.get("x-whop-user-id");
  const sessionToken = headerList.get("x-whop-session-token");

  if (!whopUserId || !sessionToken) {
    return null; // fall back to manual login or redirect
  }

  return { whopUserId, sessionToken };
}
